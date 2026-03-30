#!/usr/bin/env bash
# lint-theme.sh - CSS and HubL quality checks across a generated theme
# Usage: bash lint-theme.sh <theme-root>
# Exit codes: 0 always (all findings are warnings)

set -uo pipefail

# ── Path resolution ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Usage ────────────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: bash $0 <theme-root>" >&2
  exit 1
fi

THEME_ROOT="$1"

# ── Helper: emit finding ─────────────────────────────────────────────────────
emit() {
  local file="$1" rule="$2" message="$3"
  echo "WARNING|${file}|${rule}|${message}"
}

# ══════════════════════════════════════════════════════════════════════════════
# CSS Checks - module CSS files only (modules/**/module.css)
# ══════════════════════════════════════════════════════════════════════════════

# Find all module.css files inside .module directories
MODULE_CSS_FILES=()
while IFS= read -r -d '' cssfile; do
  MODULE_CSS_FILES+=("$cssfile")
done < <(find "$THEME_ROOT/modules" -path "*.module/module.css" -print0 2>/dev/null)

# Known utility classes to exclude from BEM check
UTILITY_CLASSES="sr-only|visually-hidden|is-active|is-hidden|is-loading|has-error|js-"

for cssfile in "${MODULE_CSS_FILES[@]}"; do
  rel_path="${cssfile#$THEME_ROOT/}"

  # ── 1. raw_hex (WARNING) ─────────────────────────────────────────────────
  grep -nE '#[0-9a-fA-F]{3,8}' "$cssfile" 2>/dev/null | tr -d '\r' | while IFS= read -r match; do
    line_num=$(echo "$match" | cut -d: -f1)
    line_content=$(echo "$match" | cut -d: -f2- | sed 's/^[[:space:]]*//')
    emit "$rel_path" "raw_hex" "Line ${line_num}: hex value found - ${line_content}"
  done

  # ── 2. missing_media_query (WARNING) ─────────────────────────────────────
  media_count=$(grep -c '@media' "$cssfile" 2>/dev/null || true)
  if [[ "$media_count" -eq 0 ]]; then
    emit "$rel_path" "missing_media_query" "No @media rule found in module CSS"
  fi

  # ── 3. ungated_animation (WARNING) ───────────────────────────────────────
  has_animation=$(grep -cE 'transition:|transition-|animation:|animation-' "$cssfile" 2>/dev/null || true)
  has_reduced_motion=$(grep -c 'prefers-reduced-motion' "$cssfile" 2>/dev/null || true)
  if [[ "$has_animation" -gt 0 && "$has_reduced_motion" -eq 0 ]]; then
    emit "$rel_path" "ungated_animation" "File contains transition/animation properties but no prefers-reduced-motion query"
  fi

  # ── 4. bem_naming (WARNING) ──────────────────────────────────────────────
  # Extract class selectors, check against BEM pattern .m-moduleName__element--modifier
  grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]*' "$cssfile" 2>/dev/null | tr -d '\r' | sort -u | while read -r selector; do
    # Skip pseudo-elements/classes (they'd be caught as part of a larger selector)
    # Skip utility/state classes
    class="${selector#.}"
    if echo "$class" | grep -qE "^($UTILITY_CLASSES)"; then
      continue
    fi
    # Skip ITCSS prefixes that are valid: .o- .c- .e-
    if echo "$class" | grep -qE '^[oce]-'; then
      continue
    fi
    # Check if it matches the module BEM pattern: .m-camelCase(__camelCase)?(--camelCase)?
    if ! echo "$class" | grep -qE '^m-[a-z][a-zA-Z0-9]+(__[a-z][a-zA-Z0-9]+)?(--[a-z][a-zA-Z0-9]+)?$'; then
      emit "$rel_path" "bem_naming" "Class \"${selector}\" does not follow .m-moduleName__element--modifier pattern"
    fi
  done

  # ── 5. important_usage (WARNING) ─────────────────────────────────────────
  grep -n '!important' "$cssfile" 2>/dev/null | tr -d '\r' | while IFS= read -r match; do
    line_num=$(echo "$match" | cut -d: -f1)
    emit "$rel_path" "important_usage" "Line ${line_num}: !important found"
  done
done

# ══════════════════════════════════════════════════════════════════════════════
# HubL Checks - templates/ and partials/ HTML files
# ══════════════════════════════════════════════════════════════════════════════

HUBL_FILES=()
for dir in "templates" "partials"; do
  if [[ -d "$THEME_ROOT/$dir" ]]; then
    while IFS= read -r -d '' htmlfile; do
      HUBL_FILES+=("$htmlfile")
    done < <(find "$THEME_ROOT/$dir" -name "*.html" -print0 2>/dev/null)
  fi
done

for htmlfile in "${HUBL_FILES[@]}"; do
  rel_path="${htmlfile#$THEME_ROOT/}"

  # ── 6. invalid_module_path (WARNING) ────────────────────────────────────
  # Extract module paths from {% module ... path="..." %} and {% module_block ... path="..." %}
  grep -oE 'path="[^"]*\.module"' "$htmlfile" 2>/dev/null | tr -d '\r' | while read -r path_attr; do
    mod_path="${path_attr#path=\"}"
    mod_path="${mod_path%\"}"

    # Resolve relative paths
    if [[ "$mod_path" == ../* ]]; then
      # Relative to the template file's directory
      template_dir=$(dirname "$htmlfile")
      resolved="$template_dir/$mod_path"
    else
      # Absolute from theme root
      resolved="$THEME_ROOT/$mod_path"
    fi

    # Normalize the path
    if [[ -d "$(cd "$(dirname "$resolved")" 2>/dev/null && pwd)/$(basename "$resolved")" ]] 2>/dev/null; then
      : # exists
    elif [[ ! -d "$resolved" ]]; then
      emit "$rel_path" "invalid_module_path" "Module path \"${mod_path}\" does not resolve to an existing .module directory"
    fi
  done
done

exit 0
