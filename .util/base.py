# base_words.py
# Extracts all Column 3 words from source.txt (COCA)
# Produces the base form of every word
# Sources:
# https://www.corpusdata.org/formats.asp
# https://www.corpusdata.org/coca/samples/coca-samples-lexicon.zip

import os
import sys
import string

input_file = 'source.txt'
output_file = 'base.txt'

# Returns True if all characters in the line are printable ASCII
# (helps skip binary-corrupted lines)
def is_printable(line):
    return all(char in string.printable for char in line.rstrip('\n'))

# Main processing function
def process_file(input_path, output_path):
    seen = set()
    total_bytes = os.path.getsize(input_path)
    bytes_read = 0
    line_count = 0

    with open(input_path, 'r', errors='replace') as infile, \
         open(output_path, 'w') as outfile:
        for line in infile:
            line_count += 1
            bytes_read += len(line.encode('utf-8', errors='ignore'))

            # Print progress every 100k lines
            if line_count % 100000 == 0:
                pct = (bytes_read / total_bytes) * 100 if total_bytes else 0
                sys.stderr.write(f"\rProcessed {line_count} lines ({pct:.1f}%); tokens: {len(seen)}")
                sys.stderr.flush()

            # Skip corrupted or binary-heavy lines
            if not is_printable(line):
                continue

            parts = line.rstrip('\r\n').split('\t')
            if len(parts) < 3:
                continue

            # Extract lemma form (Column 3)
            word = parts[2]

            # Discard non-alpha or empty results
            if not word.isalpha():
                continue

            token = word.lower()
            # Deduplicate and write
            if token not in seen:
                seen.add(token)
                outfile.write(token + '\n')

    # Final progress newline
    sys.stderr.write(f"\nCompleted {line_count} lines; total tokens: {len(seen)}\n")

if __name__ == '__main__':
    process_file(input_file, output_file)
