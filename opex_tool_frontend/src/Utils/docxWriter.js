// src/Utils/docxWriter.js
//
// Minimal write-only .docx (OOXML WordprocessingML) writer with **no dependencies**.
//
// Why not a library: same reasoning as Utils/xlsxReader.js on the reading side —
// a .docx is just a ZIP of XML, and everything needed is already in the browser:
//   ZIP      → central directory written by hand (below)
//   deflate  → CompressionStream('deflate-raw'), with plain STORE as fallback
//   XML      → string building with strict escaping
// The npm alternative (`docx`) is ~2 MB of read/write machinery for a job that
// is "emit headings, paragraphs, lists and tables once".
//
// Scope is deliberately narrow — only the constructs the help export needs.
// This is NOT a general-purpose Word writer: no images, no sections beyond one,
// no revision tracking, no comments.

// ─── ZIP ────────────────────────────────────────────────────────────────────

const ZIP_SIGNATURE = {
    LOCAL_FILE: 0x04034b50,
    CENTRAL_FILE: 0x02014b50,
    EOCD: 0x06054b50,
};

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Built on first use, not at module scope: importing this module must never do
// work that only *using* it needs.
let cachedCrcTable = null;
const getCrcTable = () => {
    if (cachedCrcTable) return cachedCrcTable;
    cachedCrcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let bit = 0; bit < 8; bit++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        cachedCrcTable[i] = c >>> 0;
    }
    return cachedCrcTable;
};

const crc32 = (bytes) => {
    const table = getCrcTable();
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
        crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
};

/** Raw deflate via the platform. Returns null when unavailable — the caller
 *  then stores the entry uncompressed, which every ZIP reader accepts. */
const deflateRaw = async (bytes) => {
    if (typeof CompressionStream === 'undefined') return null;
    try {
        const compressed = new Blob([bytes]).stream()
            .pipeThrough(new CompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(compressed).arrayBuffer());
    } catch {
        return null; // 'deflate-raw' unsupported on this browser
    }
};

/** MS-DOS packed date/time, as the ZIP format has stored timestamps since 1989. */
const toDosDateTime = (date) => {
    const year = Math.max(1980, date.getFullYear());
    return {
        time: ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF,
        date: (((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF,
    };
};

/**
 * Build a ZIP blob from [{ name, data }] where data is a string or Uint8Array.
 * Entries are deflated when the browser can, stored otherwise.
 */
export const createZip = async (files, { mimeType = 'application/zip', now = new Date() } = {}) => {
    const encoder = new TextEncoder();
    const { time, date } = toDosDateTime(now);
    const parts = [];
    const centralEntries = [];
    let offset = 0;

    for (const file of files) {
        const nameBytes = encoder.encode(file.name);
        const raw = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
        const deflated = await deflateRaw(raw);
        const useDeflate = deflated !== null && deflated.length < raw.length;
        const payload = useDeflate ? deflated : raw;
        const method = useDeflate ? 8 : 0;
        const crc = crc32(raw);

        const local = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, ZIP_SIGNATURE.LOCAL_FILE, true);
        lv.setUint16(4, 20, true);              // version needed to extract
        lv.setUint16(6, 0, true);               // general purpose flags
        lv.setUint16(8, method, true);
        lv.setUint16(10, time, true);
        lv.setUint16(12, date, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, payload.length, true);
        lv.setUint32(22, raw.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);              // extra field length
        local.set(nameBytes, 30);
        parts.push(local, payload);

        const central = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, ZIP_SIGNATURE.CENTRAL_FILE, true);
        cv.setUint16(4, 20, true);              // version made by
        cv.setUint16(6, 20, true);              // version needed to extract
        cv.setUint16(8, 0, true);
        cv.setUint16(10, method, true);
        cv.setUint16(12, time, true);
        cv.setUint16(14, date, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, payload.length, true);
        cv.setUint32(24, raw.length, true);
        cv.setUint16(28, nameBytes.length, true);
        // bytes 30–37 (extra/comment length, disk number, internal attrs) stay 0
        cv.setUint32(38, 0, true);              // external attributes
        cv.setUint32(42, offset, true);         // local header offset
        central.set(nameBytes, 46);
        centralEntries.push(central);

        offset += local.length + payload.length;
    }

    const centralSize = centralEntries.reduce((total, entry) => total + entry.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, ZIP_SIGNATURE.EOCD, true);
    ev.setUint16(8, files.length, true);        // entries on this disk
    ev.setUint16(10, files.length, true);       // entries total
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);             // central directory offset

    return new Blob([...parts, ...centralEntries, eocd], { type: mimeType });
};

// ─── XML helpers ────────────────────────────────────────────────────────────

/** XML 1.0 forbids most control characters; a single stray one makes Word
 *  reject the whole file. Tab, LF and CR are the only ones allowed. */
const stripInvalidXmlChars = (text) => {
    let out = '';
    for (const char of text) {
        const code = char.codePointAt(0);
        if (code === 0x09 || code === 0x0A || code === 0x0D || code >= 0x20) out += char;
    }
    return out;
};

/** Escape for XML text and attribute content. */
export const escapeXml = (value) => stripInvalidXmlChars(String(value == null ? '' : value))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

/** Normalise a CSS colour (#rgb, #rrggbb, rgb(), rgba()) to bare RRGGBB hex. */
export const cssColorToHex = (value, fallback = '000000') => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;

    const short = raw.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (short) return (short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toUpperCase();

    const long = raw.match(/^#([0-9a-f]{6})/i);
    if (long) return long[1].toUpperCase();

    const rgb = raw.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (rgb) {
        return [rgb[1], rgb[2], rgb[3]]
            .map(part => Math.max(0, Math.min(255, Math.round(parseFloat(part)))).toString(16).padStart(2, '0'))
            .join('').toUpperCase();
    }
    return fallback;
};

/** Blend a colour toward white — how the help UI tints its note boxes, and what
 *  keeps the exported document light even when the app runs in dark theme. */
export const tintTowardWhite = (hex, amount = 0.88) => {
    const base = cssColorToHex(hex, 'FFFFFF');
    const mixed = [0, 2, 4].map(i => {
        const channel = parseInt(base.slice(i, i + 2), 16);
        return Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0');
    });
    return mixed.join('').toUpperCase();
};

// ─── WordprocessingML building blocks ───────────────────────────────────────

const runProperties = ({ bold, italic, color, font, size, style, underline } = {}) => {
    const props = [];
    if (style) props.push(`<w:rStyle w:val="${style}"/>`);
    if (font) props.push(`<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>`);
    if (bold) props.push('<w:b/>');
    if (italic) props.push('<w:i/>');
    if (color) props.push(`<w:color w:val="${cssColorToHex(color)}"/>`);
    if (size) props.push(`<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`);
    if (underline) props.push('<w:u w:val="single"/>');
    return props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
};

/** A text run. Newlines and tabs in `text` become real Word breaks/tabs. */
export const run = (text, opts = {}) => {
    const props = runProperties(opts);
    const body = String(text ?? '')
        .split('\n')
        .map(line => `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`)
        .join('<w:br/>')
        .replace(/\t/g, '</w:t><w:tab/><w:t xml:space="preserve">');
    return `<w:r>${props}${body}</w:r>`;
};

const paragraphProperties = ({
    style, numId, level = 0, indent, hanging, spacingBefore, spacingAfter,
    align, fill, keepNext, borderLeft, contextualSpacing,
} = {}, runOpts = {}) => {
    // Order matters: OOXML defines <w:pPr> as a sequence, and Word reports a
    // document as corrupt when the children arrive out of order, even though
    // lenient readers accept it.
    const props = [];
    if (style) props.push(`<w:pStyle w:val="${style}"/>`);
    if (keepNext) props.push('<w:keepNext/>');
    if (numId) props.push(`<w:numPr><w:ilvl w:val="${level}"/><w:numId w:val="${numId}"/></w:numPr>`);
    if (borderLeft) {
        props.push(`<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="${cssColorToHex(borderLeft)}"/></w:pBdr>`);
    }
    if (fill) props.push(`<w:shd w:val="clear" w:color="auto" w:fill="${cssColorToHex(fill, 'FFFFFF')}"/>`);
    if (spacingBefore !== undefined || spacingAfter !== undefined) {
        const parts = [];
        if (spacingBefore !== undefined) parts.push(`w:before="${spacingBefore}"`);
        if (spacingAfter !== undefined) parts.push(`w:after="${spacingAfter}"`);
        props.push(`<w:spacing ${parts.join(' ')}/>`);
    }
    if (indent !== undefined || hanging !== undefined) {
        const parts = [];
        if (indent !== undefined) parts.push(`w:left="${indent}"`);
        if (hanging !== undefined) parts.push(`w:hanging="${hanging}"`);
        props.push(`<w:ind ${parts.join(' ')}/>`);
    }
    if (contextualSpacing) props.push('<w:contextualSpacing/>');
    if (align) props.push(`<w:jc w:val="${align}"/>`);
    const inherited = runProperties(runOpts);
    if (inherited) props.push(inherited);
    return props.length ? `<w:pPr>${props.join('')}</w:pPr>` : '';
};

/** A paragraph built from pre-rendered run XML (runs, hyperlinks, fields). */
export const paragraphXml = (runsXml, opts = {}) =>
    `<w:p>${paragraphProperties(opts, opts.run || {})}${runsXml || ''}</w:p>`;

/** A plain-text paragraph. Run-level formatting goes in `opts.run`. */
export const paragraph = (text, opts = {}) =>
    paragraphXml(text === '' || text === undefined ? '' : run(text, opts.run || {}), opts);

export const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

export const bookmark = (id, name, innerXml) =>
    `<w:bookmarkStart w:id="${id}" w:name="${escapeXml(name)}"/>${innerXml}<w:bookmarkEnd w:id="${id}"/>`;

/** Internal link to a bookmark in the same document. */
export const internalLink = (anchor, text) =>
    `<w:hyperlink w:anchor="${escapeXml(anchor)}">${run(text, { style: 'Hyperlink' })}</w:hyperlink>`;

const tableCell = (contentXml, { width, fill, colSpan, valign = 'top' } = {}) => {
    const props = [];
    if (width) props.push(`<w:tcW w:w="${width}" w:type="dxa"/>`);
    if (colSpan && colSpan > 1) props.push(`<w:gridSpan w:val="${colSpan}"/>`);
    if (fill) props.push(`<w:shd w:val="clear" w:color="auto" w:fill="${cssColorToHex(fill, 'FFFFFF')}"/>`);
    props.push(`<w:vAlign w:val="${valign}"/>`);
    // A cell with no paragraph is invalid OOXML — Word reports the file as corrupt.
    const body = contentXml && contentXml.trim() ? contentXml : paragraph('');
    return `<w:tc><w:tcPr>${props.join('')}</w:tcPr>${body}</w:tc>`;
};

const tableBorders = (color = 'BFBFBF', size = 4) => {
    const edges = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'];
    return `<w:tblBorders>${edges
        .map(edge => `<w:${edge} w:val="single" w:sz="${size}" w:space="0" w:color="${color}"/>`)
        .join('')}</w:tblBorders>`;
};

/**
 * A data table. `rows` is an array of arrays of cell XML (use paragraph()).
 * `widths` are twips and should sum to the usable text width.
 */
export const table = (rows, { widths, headerRow = false, borders = true, borderColor, cellFills = [] } = {}) => {
    const grid = widths ? widths.map(width => `<w:gridCol w:w="${width}"/>`).join('') : '';
    const body = rows.map((cells, rowIndex) => {
        const isHeader = headerRow && rowIndex === 0;
        const cellsXml = cells.map((cellXml, cellIndex) => tableCell(cellXml, {
            width: widths ? widths[cellIndex] : undefined,
            fill: cellFills[rowIndex]?.[cellIndex],
        })).join('');
        // Repeat the header row when the table splits across pages.
        return `<w:tr>${isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cellsXml}</w:tr>`;
    }).join('');

    return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>`
        + `${borders ? tableBorders(borderColor ? cssColorToHex(borderColor) : undefined) : '<w:tblBorders/>'}`
        + `<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="108" w:type="dxa"/>`
        + `<w:bottom w:w="60" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar>`
        + `</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`
        // Word wants a paragraph after every table; two adjacent tables would
        // otherwise merge into one.
        + paragraph('', { spacingAfter: 0 });
};

/** A single-cell tinted box with a coloured left edge — the note/callout look. */
export const calloutBox = (contentXml, { fill, accent, width = 9354 } = {}) =>
    `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>`
    + `<w:tblBorders><w:left w:val="single" w:sz="18" w:space="0" w:color="${cssColorToHex(accent, '888888')}"/>`
    + `<w:top w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>`
    + `<w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>`
    + `<w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="200" w:type="dxa"/>`
    + `<w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar>`
    + `</w:tblPr><w:tblGrid><w:gridCol w:w="${width}"/></w:tblGrid>`
    + `<w:tr>${tableCell(contentXml, { width, fill })}</w:tr></w:tbl>`
    + paragraph('', { spacingAfter: 0 });

// ─── Package parts ──────────────────────────────────────────────────────────

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

const contentTypesXml = () => `${XML_DECL}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="${DOCX_MIME}.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

const rootRelsXml = () => `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${NS_R}/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

const documentRelsXml = () => `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${NS_R}/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="${NS_R}/numbering" Target="numbering.xml"/>
<Relationship Id="rId3" Type="${NS_R}/footer" Target="footer1.xml"/>
</Relationships>`;

const corePropsXml = ({ title, creator, timestamp }) => `${XML_DECL}
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${escapeXml(title)}</dc:title>
<dc:creator>${escapeXml(creator)}</dc:creator>
<cp:lastModifiedBy>${escapeXml(creator)}</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:modified>
</cp:coreProperties>`;

const footerXml = () => `${XML_DECL}
<w:ftr xmlns:w="${NS_W}">
<w:p><w:pPr><w:spacing w:before="120" w:after="0"/><w:jc w:val="center"/></w:pPr>
<w:fldSimple w:instr=" PAGE ">${run('1', { size: 16, color: '808080' })}</w:fldSimple>
</w:p></w:ftr>`;

const styleDefinition = (id, name, { basedOn = 'Normal', next = 'Normal', type = 'paragraph', pPr = '', rPr = '', quickFormat = true }) =>
    `<w:style w:type="${type}" w:styleId="${id}">`
    + `<w:name w:val="${name}"/>`
    + (basedOn ? `<w:basedOn w:val="${basedOn}"/>` : '')
    + (type === 'paragraph' && next ? `<w:next w:val="${next}"/>` : '')
    + (quickFormat ? '<w:qFormat/>' : '')
    + (pPr ? `<w:pPr>${pPr}</w:pPr>` : '')
    + (rPr ? `<w:rPr>${rPr}</w:rPr>` : '')
    + '</w:style>';

const stylesXml = ({ accent, bodyFont, monoFont }) => `${XML_DECL}
<w:styles xmlns:w="${NS_W}">
<w:docDefaults>
<w:rPrDefault><w:rPr><w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="lv-LV"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${styleDefinition('Title', 'Title', {
    pPr: '<w:spacing w:before="0" w:after="200"/><w:jc w:val="center"/>',
    rPr: `<w:b/><w:color w:val="${accent}"/><w:sz w:val="56"/><w:szCs w:val="56"/>`,
})}
${styleDefinition('Subtitle', 'Subtitle', {
    pPr: '<w:spacing w:before="0" w:after="120"/><w:jc w:val="center"/>',
    rPr: '<w:color w:val="666666"/><w:sz w:val="26"/><w:szCs w:val="26"/>',
})}
${styleDefinition('Heading1', 'heading 1', {
    pPr: `<w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${accent}"/></w:pBdr><w:spacing w:before="240" w:after="200"/><w:outlineLvl w:val="0"/>`,
    rPr: `<w:b/><w:color w:val="${accent}"/><w:sz w:val="36"/><w:szCs w:val="36"/>`,
})}
${styleDefinition('Heading2', 'heading 2', {
    pPr: '<w:keepNext/><w:spacing w:before="320" w:after="140"/><w:outlineLvl w:val="1"/>',
    rPr: `<w:b/><w:color w:val="${accent}"/><w:sz w:val="28"/><w:szCs w:val="28"/>`,
})}
${styleDefinition('Heading3', 'heading 3', {
    pPr: '<w:keepNext/><w:spacing w:before="240" w:after="100"/><w:outlineLvl w:val="2"/>',
    rPr: '<w:b/><w:color w:val="404040"/><w:sz w:val="24"/><w:szCs w:val="24"/>',
})}
${styleDefinition('ListParagraph', 'List Paragraph', {
    pPr: '<w:spacing w:after="60"/><w:ind w:left="720"/><w:contextualSpacing/>',
})}
${styleDefinition('Caption', 'caption', {
    pPr: '<w:spacing w:before="0" w:after="80"/>',
    rPr: '<w:i/><w:color w:val="666666"/><w:sz w:val="18"/><w:szCs w:val="18"/>',
})}
${styleDefinition('Mono', 'Mono Block', {
    pPr: '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>',
    rPr: `<w:rFonts w:ascii="${monoFont}" w:hAnsi="${monoFont}" w:cs="${monoFont}"/><w:color w:val="333333"/><w:sz w:val="18"/><w:szCs w:val="18"/>`,
})}
${styleDefinition('TocEntry', 'toc entry', {
    pPr: '<w:spacing w:after="40"/>',
})}
${styleDefinition('Hyperlink', 'Hyperlink', {
    type: 'character', basedOn: '', next: '',
    rPr: `<w:color w:val="${accent}"/><w:u w:val="single"/>`,
})}
${styleDefinition('CodeChar', 'Code Char', {
    type: 'character', basedOn: '', next: '',
    rPr: `<w:rFonts w:ascii="${monoFont}" w:hAnsi="${monoFont}" w:cs="${monoFont}"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>`,
})}
</w:styles>`;

// Symbol-font code points for the bullet glyphs Word expects at each list level.
const SYMBOL_BULLET = String.fromCharCode(0xF0B7); // round bullet
const SYMBOL_SQUARE = String.fromCharCode(0xF0A7); // small square

/**
 * numbering.xml. Bullets always live on numId 1; every numbered list gets its
 * own numId so each one restarts at 1 instead of continuing the previous list.
 */
const numberingXml = (numberedListCount) => {
    const bulletLevels = [0, 1, 2].map(level =>
        `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="bullet"/>`
        + `<w:lvlText w:val="${level === 0 ? SYMBOL_BULLET : (level === 1 ? 'o' : SYMBOL_SQUARE)}"/><w:lvlJc w:val="left"/>`
        + `<w:pPr><w:ind w:left="${720 + level * 360}" w:hanging="360"/></w:pPr>`
        + `<w:rPr><w:rFonts w:ascii="${level === 1 ? 'Courier New' : 'Symbol'}" w:hAnsi="${level === 1 ? 'Courier New' : 'Symbol'}" w:hint="default"/></w:rPr></w:lvl>`
    ).join('');

    const decimalLevels = [0, 1].map(level =>
        `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="decimal"/>`
        + `<w:lvlText w:val="%${level + 1}."/><w:lvlJc w:val="left"/>`
        + `<w:pPr><w:ind w:left="${720 + level * 360}" w:hanging="360"/></w:pPr></w:lvl>`
    ).join('');

    const instances = ['<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>'];
    for (let i = 0; i < numberedListCount; i++) {
        instances.push(`<w:num w:numId="${i + 2}"><w:abstractNumId w:val="1"/></w:num>`);
    }

    return `${XML_DECL}
<w:numbering xmlns:w="${NS_W}">
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${bulletLevels}</w:abstractNum>
<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${decimalLevels}</w:abstractNum>
${instances.join('')}
</w:numbering>`;
};

// A4 portrait, in twips. Usable text width = 11906 - 1418 - 1134 = 9354.
export const PAGE = { WIDTH: 11906, HEIGHT: 16838, MARGIN_LEFT: 1418, MARGIN_RIGHT: 1134, TEXT_WIDTH: 9354 };

const documentXml = (bodyXml) => `${XML_DECL}
<w:document xmlns:w="${NS_W}" xmlns:r="${NS_R}">
<w:body>${bodyXml}
<w:sectPr>
<w:footerReference w:type="default" r:id="rId3"/>
<w:pgSz w:w="${PAGE.WIDTH}" w:h="${PAGE.HEIGHT}"/>
<w:pgMar w:top="1134" w:right="${PAGE.MARGIN_RIGHT}" w:bottom="1134" w:left="${PAGE.MARGIN_LEFT}" w:header="708" w:footer="567" w:gutter="0"/>
<w:cols w:space="708"/>
</w:sectPr>
</w:body>
</w:document>`;

/**
 * Assemble a .docx Blob.
 *
 * @param {object}  options
 * @param {string}  options.bodyXml            Pre-rendered body XML (paragraphs, tables…)
 * @param {number}  options.numberedListCount  How many independent numbered lists the body uses
 * @param {string}  options.title              Document title (core properties)
 * @param {string}  options.creator            Author (core properties)
 * @param {string}  options.accent             Heading colour, CSS or hex
 */
export const buildDocx = async ({
    bodyXml,
    numberedListCount = 0,
    title = 'Dokuments',
    creator = 'OPEX Rīks',
    accent = '#1F4E79',
    bodyFont = 'Calibri',
    monoFont = 'Consolas',
    now = new Date(),
} = {}) => {
    const accentHex = cssColorToHex(accent, '1F4E79');
    const timestamp = `${now.toISOString().split('.')[0]}Z`;

    return createZip([
        // Per the OPC spec [Content_Types].xml must be the first entry.
        { name: '[Content_Types].xml', data: contentTypesXml() },
        { name: '_rels/.rels', data: rootRelsXml() },
        { name: 'docProps/core.xml', data: corePropsXml({ title, creator, timestamp }) },
        { name: 'word/document.xml', data: documentXml(bodyXml) },
        { name: 'word/_rels/document.xml.rels', data: documentRelsXml() },
        { name: 'word/styles.xml', data: stylesXml({ accent: accentHex, bodyFont, monoFont }) },
        { name: 'word/numbering.xml', data: numberingXml(numberedListCount) },
        { name: 'word/footer1.xml', data: footerXml() },
    ], { mimeType: DOCX_MIME, now });
};

/** Trigger a browser download for a generated blob. */
export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke on the next tick: Firefox cancels an in-flight download if the
    // object URL disappears synchronously.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
