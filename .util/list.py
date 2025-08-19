#!/usr/bin/env python3
"""
list.py <in> <out> <num>

Reads the first <num> lines from <in> and writes them to <out>.
"""
import argparse
import sys

def parse_args():
    parser = argparse.ArgumentParser(
        description="Export the first N lines from an input file to an output file."
    )
    parser.add_argument(
        'infile',
        help='Path to the input file'
    )
    parser.add_argument(
        'outfile',
        help='Path to the output file'
    )
    parser.add_argument(
        'num',
        type=int,
        help='Number of lines to export'
    )
    return parser.parse_args()


def main():
    args = parse_args()

    if args.num < 0:
        sys.exit("Error: <num> must be non-negative.")

    try:
        with open(args.infile, 'r', errors='ignore') as fin:
            with open(args.outfile, 'w') as fout:
                for i, line in enumerate(fin, start=1):
                    if i > args.num:
                        break
                    fout.write(line)
    except FileNotFoundError:
        sys.exit(f"Error: File not found: {args.infile}")
    except IOError as e:
        sys.exit(f"I/O error({e.errno}): {e.strerror}")

    print(f"Exported {min(args.num, i)} lines to '{args.outfile}'.")

if __name__ == '__main__':
    main()
