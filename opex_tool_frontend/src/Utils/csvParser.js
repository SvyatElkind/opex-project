// src/Utils/csvParser.js
//
// CSV reading for the spreadsheet import. No dependencies — a CSV parser is
// ~80 lines and adding a library for it would not pay for itself.
//
// The hard part is not the grammar, it is the encoding. Excel on a Latvian
// Windows writes plain "CSV" as windows-1257 (ANSI), not UTF-8, and then every
// ā/č/ē/ī/ķ/ļ/ņ/š/ū/ž in the file is mojibake. So we sniff the BOM, try strict
// UTF-8, and fall back to windows-1257 rather than silently importing garbage.

/** Byte-order marks we recognise. */
const BOM = {
    UTF8: [0xEF, 0xBB, 0xBF],
    UTF16LE: [0xFF, 0xFE],
    UTF16BE: [0xFE, 0xFF],
};

const startsWith = (bytes, signature) =>
    signature.every((byte, index) => bytes[index] === byte);

/**
 * Decode raw file bytes to text, reporting which encoding was used so the UI
 * can warn when it had to guess.
 *
 * @param {ArrayBuffer} buffer
 * @returns {{ text: string, encoding: string, guessed: boolean }}
 */
export const decodeBytes = (buffer) => {
    const bytes = new Uint8Array(buffer);

    if (startsWith(bytes, BOM.UTF8)) {
        return {
            text: new TextDecoder('utf-8').decode(bytes.subarray(3)),
            encoding: 'UTF-8 (BOM)',
            guessed: false,
        };
    }

    if (startsWith(bytes, BOM.UTF16LE)) {
        return {
            text: new TextDecoder('utf-16le').decode(bytes.subarray(2)),
            encoding: 'UTF-16LE',
            guessed: false,
        };
    }

    if (startsWith(bytes, BOM.UTF16BE)) {
        return {
            text: new TextDecoder('utf-16be').decode(bytes.subarray(2)),
            encoding: 'UTF-16BE',
            guessed: false,
        };
    }

    // No BOM: strict UTF-8 first. `fatal: true` is the whole point — it throws
    // on byte sequences that are not valid UTF-8 instead of inserting U+FFFD,
    // which is what lets us detect a legacy-encoded file.
    try {
        return {
            text: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
            encoding: 'UTF-8',
            guessed: false,
        };
    } catch {
        // Latvian ANSI codepage — what Excel writes for "CSV (Comma delimited)".
        return {
            text: new TextDecoder('windows-1257').decode(bytes),
            encoding: 'windows-1257',
            guessed: true,
        };
    }
};

const DELIMITERS = [';', ',', '\t', '|'];

/**
 * Pick the delimiter by counting candidates outside quotes on the first
 * non-empty line. Latvian Excel writes ';' even for "CSV UTF-8", so guessing
 * ',' by default would split every row wrongly.
 */
export const sniffDelimiter = (text) => {
    const firstLine = text.split(/\r?\n/).find(line => line.trim() !== '') || '';

    let best = ';';
    let bestCount = 0;

    DELIMITERS.forEach(delimiter => {
        let count = 0;
        let inQuotes = false;
        for (let index = 0; index < firstLine.length; index++) {
            const char = firstLine[index];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === delimiter && !inQuotes) count++;
        }
        if (count > bestCount) {
            bestCount = count;
            best = delimiter;
        }
    });

    return best;
};

/**
 * RFC 4180 parser: quoted fields, "" as an escaped quote, newlines inside
 * quotes, CRLF or LF line endings.
 *
 * @returns {string[][]} rows of raw cell strings
 */
export const parseCsv = (text, delimiter) => {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let index = 0;

    const endField = () => { row.push(field); field = ''; };
    const endRow = () => { endField(); rows.push(row); row = []; };

    while (index < text.length) {
        const char = text[index];

        if (inQuotes) {
            if (char === '"') {
                if (text[index + 1] === '"') { field += '"'; index += 2; continue; }
                inQuotes = false;
                index++;
                continue;
            }
            field += char;
            index++;
            continue;
        }

        if (char === '"') { inQuotes = true; index++; continue; }
        if (char === delimiter) { endField(); index++; continue; }
        if (char === '\r') {
            // CRLF or a lone CR
            if (text[index + 1] === '\n') index++;
            endRow();
            index++;
            continue;
        }
        if (char === '\n') { endRow(); index++; continue; }

        field += char;
        index++;
    }

    // Trailing field/row (file not ending in a newline)
    if (field !== '' || row.length > 0) endRow();

    // Drop rows that are entirely empty — trailing newlines are normal and
    // must not count as data rows.
    return rows.filter(cells => cells.some(cell => String(cell).trim() !== ''));
};

/**
 * Read a .csv File/Blob into a raw cell grid.
 *
 * @param {File|Blob} file
 * @returns {Promise<{ rows: string[][], encoding: string, guessed: boolean, delimiter: string }>}
 */
export const parseCsvFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const { text, encoding, guessed } = decodeBytes(buffer);
    const delimiter = sniffDelimiter(text);
    const rows = parseCsv(text, delimiter);
    return { rows, encoding, guessed, delimiter };
};

const csvParser = { parseCsvFile, parseCsv, sniffDelimiter, decodeBytes };

export default csvParser;
