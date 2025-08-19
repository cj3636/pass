# all_words.py
# Extracts all Column 2 words from source.txt (COCA), splits hyphenated words,
# removes apostrophes, excludes tokens containing any character repeated 4+ times,
# lowercases, deduplicates, and writes to wordlist.txt
#
# Produces every variation of every word ever used
#
# Sources:
# https://www.corpusdata.org/formats.asp
# https://www.corpusdata.org/coca/samples/coca-samples-lexicon.zip

import os
import sys
import string
import re

input_file = 'source.txt'
output_file = 'all.txt'

# Returns True if all characters in the line are printable ASCII
# (helps skip binary-corrupted lines)
def is_printable(line):
    return all(char in string.printable for char in line.rstrip('\n'))

# Regex to detect any character repeated 4 or more times in a row
REPEATS_4_PLUS = re.compile(r"(.)\1{3,}")

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
            if len(parts) < 2:
                continue

            # Extract surface form (Column 2)
            word = parts[1]

            # Split on hyphens into individual tokens
            fragments = word.split('-')
            for frag in fragments:
                # Remove apostrophes
                cleaned = frag.replace("'", "")
                # Discard non-alpha or empty results
                if not cleaned.isalpha():
                    continue

                token = cleaned.lower()
                # Exclude tokens with any char repeated 4+ times
                if REPEATS_4_PLUS.search(token):
                    continue

                # Deduplicate and write
                if token not in seen:
                    seen.add(token)
                    outfile.write(token + '\n')

    # Final progress newline
    sys.stderr.write(f"\nCompleted {line_count} lines; total tokens: {len(seen)}\n")

if __name__ == '__main__':
    process_file(input_file, output_file)
