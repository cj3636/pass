#!/usr/bin/env bash
# words.sh
# Executes all.py, base.py, and js.py to produce wordlists and deploys them.
# Usage: ./words.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORDS_DIR="$SCRIPT_DIR/../words"

# Create temp work directory
TMPDIR=$(mktemp -d)
cleanup() {
    echo "Cleaning up temporary files..."
    rm -rf "$TMPDIR"
}

# Error and interrupt handlers
on_error() {
    echo "\nError encountered. Aborting." >&2
    exit 1
}
on_interrupt() {
    echo "\nInterrupted by user." >&2
    exit 1
}
trap on_error ERR
trap on_interrupt INT
trap cleanup EXIT

# Ensure deployment directory exists
mkdir -p "$WORDS_DIR"

# Stage 1: Generate full word list
echo "=== Stage 1: Generating full word list (all.txt) ==="
cd "$TMPDIR"
ln -s "$SCRIPT_DIR/source.txt" source.txt
python3 "$SCRIPT_DIR/all.py" 1>&2

# Stage 2: Generate base word list
echo "\n=== Stage 2: Generating base word list (base.txt) ==="
python3 "$SCRIPT_DIR/base.py" 1>&2

# Stage 3: Generate JavaScript arrays
echo "\n=== Stage 3: Generating JavaScript files ==="
python3 "$SCRIPT_DIR/js.py" all.txt all.js
python3 "$SCRIPT_DIR/js.py" base.txt base.js

# Stage 4: Deploy to words directory
echo "\n=== Stage 4: Deploying to $WORDS_DIR ==="
mv -f all.txt all.js base.txt base.js "$WORDS_DIR/"

# Stage 5: Set ownership and permissions
echo "\n=== Stage 5: Setting permissions ==="
chown www-data:www-data "$WORDS_DIR/" -R
chmod 640 "$WORDS_DIR/" -R

echo "\nAll files deployed successfully to $WORDS_DIR."
