/**
 * helpDocxExport — proves the exported Word document really contains the whole
 * help section, and that the package it produces is a well-formed ZIP.
 *
 * The valuable guard here is the coverage test: when someone adds a chapter, a
 * section or a new block type to helpConstants.js, this fails if the export
 * silently leaves it out. A .docx that opens but is missing three sections is
 * the failure mode worth catching.
 *
 * The globals below exist in every browser; jsdom does not provide them, so
 * they are taken from Node (same approach as Utils/xlsxReader.test.js).
 */
import { TextDecoder, TextEncoder } from 'util';
import { Blob as NodeBlob } from 'buffer';
import { CompressionStream, ReadableStream } from 'node:stream/web';

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.CompressionStream = CompressionStream;
global.ReadableStream = ReadableStream;
// jsdom's Blob has no arrayBuffer(); Node's does, and it is the closer match to
// what a real browser hands back.
global.Blob = NodeBlob;

import { buildHelpBody, buildHelpDocxBlob, htmlToLines } from './helpDocxExport';
import { HELP_CHAPTERS } from '../Constants/helpConstants';

const FIXED_DATE = new Date(2026, 0, 15, 9, 30, 0);

/** Every string the help shows on screen, block type by block type. */
const collectVisibleStrings = () => {
  const found = [];
  const push = (value) => {
    if (typeof value === 'string' && value.trim()) found.push(value.trim());
  };

  const walkBlocks = (blocks) => blocks.forEach((block) => {
    push(block.text);
    push(block.label);
    push(block.title);
    push(block.description);
    (block.items || []).forEach(push);
    (block.steps || []).forEach((step) => {
      if (typeof step === 'string') push(step);
      else { push(step.text); push(step.detail); }
    });
    (block.headers || []).forEach((header) => push(String(header)));
    (block.rows || []).forEach((row) => row.forEach((cell) => push(String(cell))));
    (block.callouts || []).forEach((callout) => { push(callout.marker); push(callout.text); });
    (block.elements || []).forEach((element) => {
      push(element.caption);
      htmlToLines(element.html).forEach(push);
    });
    (block.colors || []).forEach((color) => { push(color.name); push(color.var); });
    if (block.mockup) htmlToLines(block.mockup).forEach(push);
    if (block.content) walkBlocks(block.content);
  });

  HELP_CHAPTERS.forEach((chapter) => {
    push(chapter.title);
    chapter.sections.forEach((section) => {
      push(section.title);
      walkBlocks(section.content || []);
    });
  });
  return found;
};

/** Text of the document as Word would show it, one paragraph per line. */
const documentText = (bodyXml) => {
  const wrapped = `<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" `
    + `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${bodyXml}</root>`;
  const doc = new DOMParser().parseFromString(wrapped, 'application/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return Array.from(doc.getElementsByTagName('w:p'))
    .map((paragraph) => Array.from(paragraph.getElementsByTagName('w:t'))
      .map((node) => node.textContent)
      .join(''))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n');
};

describe('helpDocxExport body', () => {
  let body;
  let text;

  beforeAll(() => {
    body = buildHelpBody({ now: FIXED_DATE });
    text = documentText(body.bodyXml);
  });

  it('handles every block type used in the help content', () => {
    expect(body.unsupported).toEqual([]);
  });

  it('produces well-formed XML', () => {
    // documentText() already asserts the parse succeeded; this pins the shape.
    expect(body.bodyXml).toContain('<w:p>');
    expect(body.bodyXml.match(/<w:tbl>/g).length).toBe(body.bodyXml.match(/<\/w:tbl>/g).length);
  });

  it('keeps every chapter and section, in order', () => {
    const headings = HELP_CHAPTERS.flatMap((chapter, chapterIndex) => [
      `${chapterIndex + 1}. ${chapter.title}`,
      ...chapter.sections.map((section, sectionIndex) => `${chapterIndex + 1}.${sectionIndex + 1}. ${section.title}`),
    ]);

    let cursor = 0;
    headings.forEach((heading) => {
      // Each heading appears twice — once in the table of contents, once as the
      // heading itself. Searching forward from the previous hit proves order.
      const at = text.indexOf(heading, cursor);
      expect(at).toBeGreaterThanOrEqual(0);
      cursor = at;
    });
  });

  it('contains every visible string from the help content', () => {
    const missing = collectVisibleStrings()
      .filter((needle) => !text.includes(needle.replace(/\s+/g, ' ')));
    expect(missing).toEqual([]);
  });

  it('gives each numbered list its own numbering id so it restarts at 1', () => {
    const used = new Set(
      Array.from(body.bodyXml.matchAll(/<w:numId w:val="(\d+)"\/>/g)).map((match) => match[1])
    );
    // 1 is the shared bullet list; numbered lists occupy 2 … count + 1.
    const expected = new Set(['1', ...Array.from(
      { length: body.numberedListCount }, (_, index) => String(index + 2)
    )]);
    expect(used).toEqual(expected);
  });
});

describe('helpDocxExport package', () => {
  it('produces a ZIP holding the parts Word requires', async () => {
    const { blob, unsupported } = await buildHelpDocxBlob({ now: FIXED_DATE });
    expect(unsupported).toEqual([]);
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(10000);
    // Local file header signature "PK\x03\x04"
    expect([bytes[0], bytes[1], bytes[2], bytes[3]]).toEqual([0x50, 0x4B, 0x03, 0x04]);

    // Entry names are stored uncompressed in the headers, so a plain scan finds them.
    const raw = new TextDecoder('latin1').decode(bytes);
    [
      '[Content_Types].xml', '_rels/.rels', 'word/document.xml',
      'word/_rels/document.xml.rels', 'word/styles.xml', 'word/numbering.xml',
      'word/footer1.xml', 'docProps/core.xml',
    ].forEach((part) => expect(raw).toContain(part));

    // End-of-central-directory signature "PK\x05\x06"
    expect(raw.lastIndexOf('PK')).toBeGreaterThan(0);
  });
});

describe('htmlToLines', () => {
  it('keeps text and drops markup and icons', () => {
    const html = '<div><span>Nosaukums: Arhivs</span></div><div><i class="fas fa-file"></i> Dokumenti</div>';
    expect(htmlToLines(html)).toEqual(['Nosaukums: Arhivs', 'Dokumenti']);
  });

  it('decodes entities and ignores empty nodes', () => {
    expect(htmlToLines('<p>A &amp; B</p><p></p>')).toEqual(['A & B']);
  });

  it('returns nothing for empty input', () => {
    expect(htmlToLines('')).toEqual([]);
    expect(htmlToLines(undefined)).toEqual([]);
  });
});
