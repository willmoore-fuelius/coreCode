#!/usr/bin/env bash
# validate-module.sh - Validate a single module's fields.json and meta.json
# Usage: bash validate-module.sh <module-path>
# Exit codes: 0 = no errors (warnings may exist), 1 = errors found

set -uo pipefail

# ── Path resolution ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIELD_TYPES_REF="$SCRIPT_DIR/../references/valid-field-types.json"
META_VALUES_REF="$SCRIPT_DIR/../references/valid-meta-values.json"

# ── Dependency check ─────────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not found. Install with: sudo apt-get install -y jq" >&2
  exit 1
fi

# ── Usage ────────────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: bash $0 <module-path>" >&2
  echo "  e.g. bash $0 modules/page/hero.module" >&2
  exit 1
fi

MODULE_PATH="$1"
FIELDS_FILE="$MODULE_PATH/fields.json"
META_FILE="$MODULE_PATH/meta.json"

# Use a temp file to track errors across subshells
ERROR_FLAG=$(mktemp)
echo "0" > "$ERROR_FLAG"
trap "rm -f '$ERROR_FLAG'" EXIT

# ── Helper: emit finding ─────────────────────────────────────────────────────
emit() {
  local severity="$1" file="$2" rule="$3" message="$4"
  echo "${severity}|${file}|${rule}|${message}"
  if [[ "$severity" == "ERROR" ]]; then
    echo "1" > "$ERROR_FLAG"
  fi
}

# ── Helper: check if value is in a newline-separated list ────────────────────
in_list() {
  local value="$1" list="$2"
  echo "$list" | grep -qxF "$value"
}

# ── Load reference data ──────────────────────────────────────────────────────
VALID_TYPES=$(jq -r '.valid_module_field_types[]' "$FIELD_TYPES_REF" | tr -d '\r')
STYLE_TYPES=$(jq -r '.style_only_types[]' "$FIELD_TYPES_REF" | tr -d '\r')
VALID_CT=$(jq -r '.valid_content_types[]' "$META_VALUES_REF" | tr -d '\r')
VALID_CAT=$(jq -r '.valid_categories[]' "$META_VALUES_REF" | tr -d '\r')

# ══════════════════════════════════════════════════════════════════════════════
# fields.json validation
# ══════════════════════════════════════════════════════════════════════════════

if [[ -f "$FIELDS_FILE" ]]; then
  # Check JSON parse
  JQ_ERR=$(jq empty "$FIELDS_FILE" 2>&1) || {
    emit "ERROR" "$FIELDS_FILE" "json_parse_error" "$JQ_ERR"
    FIELDS_FILE="" # skip field-level checks
  }

  if [[ -n "$FIELDS_FILE" ]]; then
    # ── 1. invalid_type ────────────────────────────────────────────────────
    jq -r '
      [.. | objects | select(has("type") and has("name"))] |
      .[] | "\(.name)\t\(.type)"
    ' "$FIELDS_FILE" 2>/dev/null | tr -d '\r' | while IFS=$'\t' read -r fname ftype; do
      if ! in_list "$ftype" "$VALID_TYPES"; then
        emit "ERROR" "$FIELDS_FILE" "invalid_type" "Field \"${fname}\" has type \"${ftype}\" - expected valid type from whitelist"
      fi
    done

    # ── 2. reserved_name ───────────────────────────────────────────────────
    jq -r '
      def walk_with_parent(parent_name):
        if type == "array" then
          .[] | walk_with_parent(parent_name)
        elif type == "object" then
          if has("name") and has("type") then
            (if .name == "label" then
              "\(parent_name)"
            else
              empty
            end),
            (if .type == "group" and has("children") then
              .children | walk_with_parent(.name)
            else
              empty
            end)
          else
            empty
          end
        else
          empty
        end;
      walk_with_parent("")
    ' "$FIELDS_FILE" 2>/dev/null | tr -d '\r' | while read -r parent_name; do
      emit "ERROR" "$FIELDS_FILE" "reserved_name" "Field has name \"label\" (parent group: \"${parent_name:-none}\") - reserved field name"
    done

    # ── 3. missing_default ─────────────────────────────────────────────────
    jq -r '
      [.. | objects | select(has("type") and has("name"))] |
      .[] | select(.type != "group") |
      select(has("default") | not) |
      "\(.name)\t\(.type)"
    ' "$FIELDS_FILE" 2>/dev/null | tr -d '\r' | while IFS=$'\t' read -r fname ftype; do
      emit "ERROR" "$FIELDS_FILE" "missing_default" "Field \"${fname}\" (type: ${ftype}) has no \"default\" property"
    done

    # ── 4. missing_help_text ───────────────────────────────────────────────
    jq -r '
      [.. | objects | select(has("type") and has("name"))] |
      .[] | select(.type != "group") |
      select((has("help_text") | not) and (has("inline_help_text") | not)) |
      "\(.name)\t\(.label // .name)"
    ' "$FIELDS_FILE" 2>/dev/null | tr -d '\r' | while IFS=$'\t' read -r fname flabel; do
      emit "ERROR" "$FIELDS_FILE" "missing_help_text" "Field \"${fname}\" has no \"help_text\" or \"inline_help_text\""
    done

    # ── 5. style_field_placement (WARNING) ─────────────────────────────────
    jq -r '
      def check_placement(in_style_group):
        if type == "array" then
          .[] | check_placement(in_style_group)
        elif type == "object" then
          if has("name") and has("type") then
            (if .type == "group" then
              (.children // []) | check_placement(
                if .tab == "STYLE" or .name == "styles" or in_style_group then true else false end
              )
            else
              if in_style_group then empty
              else "\(.name)\t\(.type)"
              end
            end)
          else
            empty
          end
        else
          empty
        end;
      check_placement(false)
    ' "$FIELDS_FILE" 2>/dev/null | tr -d '\r' | while IFS=$'\t' read -r fname ftype; do
      if in_list "$ftype" "$STYLE_TYPES"; then
        emit "WARNING" "$FIELDS_FILE" "style_field_placement" "Field \"${fname}\" (type: ${ftype}) is a style-only type but is not inside a STYLE tab group"
      fi
    done
  fi
else
  emit "ERROR" "$FIELDS_FILE" "file_missing" "fields.json not found"
fi

# ══════════════════════════════════════════════════════════════════════════════
# meta.json validation
# ══════════════════════════════════════════════════════════════════════════════

if [[ -f "$META_FILE" ]]; then
  # Check JSON parse
  JQ_ERR=$(jq empty "$META_FILE" 2>&1) || {
    emit "ERROR" "$META_FILE" "json_parse_error" "$JQ_ERR"
    META_FILE="" # skip further checks
  }

  if [[ -n "$META_FILE" ]]; then
    # ── 6. missing_label ─────────────────────────────────────────────────
    LABEL_VAL=$(jq -r '.label // ""' "$META_FILE" | tr -d '\r')
    if [[ -z "$LABEL_VAL" ]]; then
      emit "ERROR" "$META_FILE" "missing_label" "\"label\" is missing or empty"
    fi

    # ── 7. invalid_content_type ──────────────────────────────────────────
    if jq -e 'has("content_types")' "$META_FILE" &>/dev/null; then
      jq -r '.content_types[]' "$META_FILE" 2>/dev/null | tr -d '\r' | while read -r ct; do
        if ! in_list "$ct" "$VALID_CT"; then
          emit "ERROR" "$META_FILE" "invalid_content_type" "content_types contains \"${ct}\" - not in valid set"
        fi
      done
    fi

    # ── 8. deprecated_key (WARNING) ──────────────────────────────────────
    if jq -e 'has("host_template_types")' "$META_FILE" &>/dev/null; then
      emit "WARNING" "$META_FILE" "deprecated_key" "\"host_template_types\" is deprecated - use \"content_types\" instead"
    fi

    # ── 9. invalid_category ──────────────────────────────────────────────
    if jq -e 'has("categories")' "$META_FILE" &>/dev/null; then
      jq -r '.categories[]' "$META_FILE" 2>/dev/null | tr -d '\r' | while read -r cat_val; do
        cat_lower=$(echo "$cat_val" | tr '[:upper:]' '[:lower:]')
        if ! in_list "$cat_lower" "$VALID_CAT"; then
          emit "ERROR" "$META_FILE" "invalid_category" "categories contains \"${cat_val}\" - not in valid set"
        fi
      done
    fi

    # ── 10. icon_type_check ──────────────────────────────────────────────
    if jq -e 'has("icon")' "$META_FILE" &>/dev/null; then
      ICON_TYPE=$(jq -r '.icon | type' "$META_FILE" | tr -d '\r')
      if [[ "$ICON_TYPE" != "string" ]]; then
        emit "ERROR" "$META_FILE" "icon_type_check" "\"icon\" is type ${ICON_TYPE}, expected string"
      fi
    fi
  fi
else
  emit "ERROR" "$META_FILE" "file_missing" "meta.json not found"
fi

exit "$(cat "$ERROR_FLAG")"
