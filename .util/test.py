# compare.py
# Compares two word-list files and writes:
#  - miss.txt: words in file1 but not in file2
#  - extra.txt: words in file2 but not in file1
# Prints counts of words and differences to the console.

import argparse
import sys


def read_lines(path):
    try:
        with open(path, 'r', errors='ignore') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        sys.exit(f"Error: File not found: {path}")


def write_lines(path, lines):
    with open(path, 'w') as f:
        for w in sorted(lines):
            f.write(w + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Compare two word-list files and output missing and extra words."
    )
    parser.add_argument('file1', help='First input file')
    parser.add_argument('file2', help='Second input file')
    args = parser.parse_args()

    # Read files
    words1 = set(read_lines(args.file1))
    words2 = set(read_lines(args.file2))

    # Compute differences
    missing = words1 - words2    # in file1 but not in file2
    extra   = words2 - words1    # in file2 but not in file1

    # Write results
    write_lines('miss.txt', missing)
    write_lines('extra.txt', extra)

    # Print summary
    print(f"{args.file1}: {len(words1)} words")
    print(f"{args.file2}: {len(words2)} words")
    print(f"Missing in {args.file2}: {len(missing)} (written to miss.txt)")
    print(f"Extra in {args.file2}: {len(extra)} (written to extra.txt)")


if __name__ == '__main__':
    main()
