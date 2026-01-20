import re

BLACKLIST = [
    "total", "tva", "cb", "carte", "merci", "date", "ticket"
]

def clean_receipt_lines(lines: list[str]) -> list[str]:
    cleaned = []

    for line in lines:
        line = line.strip()

        if not re.search(r"\d", line):
            continue

        if any(word in line.lower() for word in BLACKLIST):
            continue

        cleaned.append(line)

    return cleaned

