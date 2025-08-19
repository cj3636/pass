#!/usr/bin/env python3
"""
js.py <infile> <outfile>

Reads a list of words (one per line) from <infile> and writes a JavaScript
file defining a constant array of those words:

    const words = ['word1', 'word2', 'word3'];

Usage:
    python js.py all.txt all.js
"""
import argparse
import sys


def parse_args():
    parser = argparse.ArgumentParser(
        description="Convert a newline-separated word list into a JS array constant."
    )
    parser.add_argument(
        'infile',
        help='Path to the input file containing one word per line'
    )
    parser.add_argument(
        'outfile',
        help='Path to the output JavaScript file'
    )
    return parser.parse_args()


def main():
    args = parse_args()

    try:
        with open(args.infile, 'r', errors='ignore') as fin:
            # Read and strip lines, ignore empties
            words = [line.strip() for line in fin if line.strip()]
    except FileNotFoundError:
        sys.exit(f"Error: cannot open input file '{args.infile}'.")

    # Build JS array literal
    # Wrap each word in single quotes and join with commas
    js_array = ", ".join(f"'{word}'" for word in words)
    js_content = f"const words = [{js_array}];\n"

    try:
        with open(args.outfile, 'w') as fout:
            fout.write(js_content)
    except IOError as e:
        sys.exit(f"Error writing output file '{args.outfile}': {e}")

    print(f"Wrote {len(words)} words to '{args.outfile}'.")


if __name__ == '__main__':
    main()
