#!/usr/bin/env python3
"""Check CSS files for unbalanced or nested block comments.

CSS comments do not nest. An inner `/*` inside a comment does nothing, and the
outer comment ends at that inner pair's `*/`; everything after it is handed to
the parser, which consumes it as one runaway selector hunting for a `{`. That
silently swallows the next real rule.

Counting `/*` against `*/` does NOT catch this: a file missing one opener and
one closer still counts equal. This walks the file instead, tracking comment
state, string state and escapes, which is the only way to answer the question.

Usage:
    python scripts/check_css_comments.py css modules
    python scripts/check_css_comments.py --self-test

Exit codes:
    0  no findings
    1  at least one finding
    2  bad invocation
"""

import sys
from pathlib import Path

SKIP_DIRS = {"vendor", "node_modules", ".git"}


def scan(text):
    """Return a list of (line, column, message) findings for one file's text."""
    findings = []
    i = 0
    length = len(text)
    line = 1
    col = 1
    in_comment = False
    comment_start = None
    in_string = None  # holds the opening quote character

    while i < length:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < length else ""

        if in_comment:
            if ch == "/" and nxt == "*":
                findings.append(
                    (line, col, "nested '/*' inside a comment opened at line %d" % comment_start[0])
                )
                # Skip it so one nesting mistake does not cascade into noise.
                i += 2
                col += 2
                continue
            if ch == "*" and nxt == "/":
                in_comment = False
                comment_start = None
                i += 2
                col += 2
                continue
        elif in_string:
            if ch == "\\":
                i += 2
                col += 2
                continue
            if ch == in_string:
                in_string = None
        else:
            if ch in ("'", '"'):
                in_string = ch
            elif ch == "/" and nxt == "*":
                in_comment = True
                comment_start = (line, col)
                i += 2
                col += 2
                continue

        if ch == "\n":
            line += 1
            col = 1
        else:
            col += 1
        i += 1

    if in_comment:
        findings.append(
            (comment_start[0], comment_start[1], "comment opened here is never closed")
        )

    return findings


def iter_css(roots):
    for root in roots:
        path = Path(root)
        if path.is_file() and path.suffix == ".css":
            yield path
            continue
        for candidate in sorted(path.rglob("*.css")):
            if SKIP_DIRS & set(candidate.parts):
                continue
            yield candidate


SELF_TEST_CASES = [
    # (label, css, expected finding count)
    ("clean", "a { color: red; } /* fine */ b { color: blue; }", 0),
    ("nested", "/* outer /* inner */ a { color: red; }", 1),
    ("unclosed", "a { color: red; } /* never closed", 1),
    ("comment marker in a string", "a { content: '/*'; }", 0),
    ("url with slashes", "a { background: url(http://x/y.png); }", 0),
]


def self_test():
    """Positive and negative controls. A checker that has not been shown to
    fire, and shown not to fire on correct input, is not a check."""
    ok = True
    for label, css, expected in SELF_TEST_CASES:
        got = len(scan(css))
        status = "PASS" if got == expected else "FAIL"
        if got != expected:
            ok = False
        print("  [%s] %-28s expected %d, got %d" % (status, label, expected, got))
    return ok


def main(argv):
    if "--self-test" in argv:
        print("check_css_comments self-test:")
        return 0 if self_test() else 1

    roots = argv or ["css", "modules"]
    findings = 0
    for path in iter_css(roots):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print("%s: could not read as UTF-8" % path)
            findings += 1
            continue
        for line, col, message in scan(text):
            print("%s:%d:%d: %s" % (path.as_posix(), line, col, message))
            findings += 1

    if findings:
        print("\n%d finding(s)." % findings)
        return 1

    print("No unbalanced or nested CSS comments found.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
