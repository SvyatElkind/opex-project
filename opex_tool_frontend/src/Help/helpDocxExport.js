// src/Help/helpDocxExport.js
//
// Exports the whole in-app help section (Constants/helpConstants.js →
// HELP_CHAPTERS) to a single .docx file.
//
// The document mirrors what Help.js renders on screen: same chapters, same
// sections, same order, same blocks. Every content type Help.js knows how to
// render has a mapping here — keep the two switch statements in step when a new
// block type is added.
//
// Blocks that exist only as styled HTML in the app (ui-example mockups,
// annotated-screen mockups) cannot be reproduced as Word layout, so their text
// is extracted and shown in a monospace box; all labels, captions, descriptions
// and callout texts are kept in full. Nothing that carries information is
// dropped.

import { HELP_CHAPTERS, HELP_UI } from '../Constants/helpConstants';
import {
    buildDocx, downloadBlob, paragraph, paragraphXml, run, table, calloutBox,
    pageBreak, bookmark, internalLink, cssColorToHex, tintTowardWhite, PAGE,
} from '../Utils/docxWriter';

// ─── Theme colours ──────────────────────────────────────────────────────────

// Light-theme values from styles/theme.css. Used when a CSS variable cannot be
// read (export triggered outside the browser, e.g. from a test).
const THEME_FALLBACK = {
    '--color-primary': '#596D69',
    '--color-secondary': '#6B7FA0',
    '--color-tertiary': '#B5A88E',
    '--color-error': '#744245',
    '--color-warning': '#E1B781',
    '--color-info': '#6ba3b8',
    '--color-success': '#10b981',
    '--color-background': '#ffffff',
    '--color-background-light': '#f8f9fa',
};

const readCssVar = (name) => {
    const fallback = THEME_FALLBACK[name] || '#000000';
    if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return fallback;
    try {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    } catch {
        return fallback;
    }
};

// The exported document is always light, whatever theme the app is in: the note
// tints are mixed toward white rather than taken from the live background.
const buildPalette = () => {
    const accent = cssColorToHex(readCssVar('--color-primary'), '596D69');
    return {
        accent,
        text: '333333',
        muted: '666666',
        boxFill: 'F7F7F5',
        boxBorder: 'D8D8D4',
        headerFill: tintTowardWhite(accent, 0.85),
        note: {
            '': { accent: cssColorToHex(readCssVar('--color-warning'), 'E1B781'), label: 'Uzmanību' },
            info: { accent: cssColorToHex(readCssVar('--color-info'), '6BA3B8'), label: 'Informācija' },
            error: { accent: cssColorToHex(readCssVar('--color-error'), '744245'), label: 'Svarīgi' },
        },
    };
};

// ─── HTML → text ────────────────────────────────────────────────────────────

/**
 * Reduce an inline HTML snippet (ui-example element, annotated-screen mockup)
 * to the lines of text it shows. Font Awesome <i> icons contribute nothing and
 * disappear, which is intended — they carry no information the text lacks.
 */
export const htmlToLines = (html) => {
    if (!html) return [];
    const withBreaks = String(html)
        // Collapse the source's own indentation first, so a line break appears
        // only where the markup actually starts a new block — that keeps a row
        // and its ① marker together, the way the screen shows them.
        .replace(/\s+/g, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(div|p|li|tr|h[1-6])>/gi, '$&\n');

    let text;
    if (typeof DOMParser === 'function') {
        // DOMParser also decodes entities; nothing is inserted into the live
        // document, so no styles load and no scripts run.
        text = new DOMParser().parseFromString(withBreaks, 'text/html').body.textContent || '';
    } else {
        text = withBreaks.replace(/<[^>]*>/g, '');
    }

    return text
        .split('\n')
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
};

// ─── Block rendering ────────────────────────────────────────────────────────

const BULLET_NUM_ID = 1; // reserved in numbering.xml for every bulleted list

/** Monospace box for extracted mockup / example text. */
const monoBox = (lines, palette) => {
    if (!lines.length) return '';
    const body = lines.map(line => paragraph(line, { style: 'Mono' })).join('');
    return calloutBox(body, { fill: palette.boxFill, accent: palette.boxBorder });
};

const captionParagraph = (text, opts = {}) => paragraph(text, { style: 'Caption', ...opts });

/**
 * Render one content block to WordprocessingML.
 * `ctx` carries the palette and the counters that must stay unique across the
 * whole document (numbered-list ids, bookmark ids).
 */
const renderBlock = (block, ctx, depth = 0) => {
    if (!block || !block.type) return '';
    const { palette } = ctx;

    switch (block.type) {
        case 'paragraph':
            return paragraph(block.text);

        case 'heading':
            return paragraph(block.text, { style: 'Heading3' });

        case 'code':
            return paragraph(block.text, { run: { style: 'CodeChar' } });

        case 'list':
            return (block.items || [])
                .map(item => paragraph(item, {
                    style: 'ListParagraph',
                    numId: BULLET_NUM_ID,
                    level: Math.min(depth, 2),
                }))
                .join('');

        case 'steps': {
            // Each steps block gets its own numbering instance so it restarts at 1.
            const numId = ctx.nextNumberedListId();
            return (block.steps || []).map(step => {
                const isObject = step !== null && typeof step === 'object';
                const text = isObject ? step.text : step;
                const stepXml = paragraph(text, { style: 'ListParagraph', numId, level: 0 });
                if (!isObject || !step.detail) return stepXml;
                return stepXml + paragraph(step.detail, {
                    indent: 1080,
                    spacingAfter: 80,
                    run: { italic: true, color: palette.muted, size: 20 },
                });
            }).join('');
        }

        case 'note': {
            const style = palette.note[block.style || ''] || palette.note[''];
            const label = paragraph(style.label, {
                spacingAfter: 60,
                run: { bold: true, color: style.accent, size: 18 },
            });
            const body = (block.content || []).map(item => renderBlock(item, ctx, depth)).join('');
            return calloutBox(label + body, {
                fill: tintTowardWhite(style.accent, 0.88),
                accent: style.accent,
            });
        }

        case 'table': {
            const columnCount = block.headers?.length || block.rows?.[0]?.length || 1;
            const widths = Array.from({ length: columnCount }, () => Math.floor(PAGE.TEXT_WIDTH / columnCount));
            const rows = [];
            if (block.headers) {
                rows.push(block.headers.map(header => paragraph(header, {
                    spacingAfter: 0,
                    run: { bold: true },
                })));
            }
            (block.rows || []).forEach(row => {
                rows.push(row.map(cell => paragraph(cell, { spacingAfter: 0 })));
            });
            const cellFills = block.headers
                ? [block.headers.map(() => palette.headerFill)]
                : [];
            return table(rows, {
                widths,
                headerRow: Boolean(block.headers),
                borderColor: palette.boxBorder,
                cellFills,
            });
        }

        case 'accordion': {
            const header = paragraph(block.title, { style: 'Heading3' });
            const body = (block.content || []).map(item => renderBlock(item, ctx, depth)).join('');
            return header + body;
        }

        case 'ui-example': {
            // The HTML is decoration; the text inside it, the captions and the
            // description are the content.
            const parts = [];
            if (block.label) parts.push(captionParagraph(block.label, { run: { bold: true, color: palette.muted, size: 18 } }));

            const exampleBody = (block.elements || []).map(element => {
                const lines = htmlToLines(element.html);
                const linesXml = lines.map(line => paragraph(line, { style: 'Mono' })).join('');
                const captionXml = element.caption
                    ? captionParagraph(element.caption, { indent: 120 })
                    : '';
                return linesXml + captionXml;
            }).join('');

            if (exampleBody) {
                parts.push(calloutBox(exampleBody, { fill: palette.boxFill, accent: palette.boxBorder }));
            }
            if (block.description) parts.push(captionParagraph(block.description));
            return parts.join('');
        }

        case 'annotated-screen': {
            const parts = [];
            if (block.title) {
                parts.push(paragraph(block.title, { spacingAfter: 80, run: { bold: true } }));
            }
            parts.push(monoBox(htmlToLines(block.mockup), palette));

            const callouts = block.callouts || [];
            if (callouts.length) {
                const widths = [700, PAGE.TEXT_WIDTH - 700];
                const rows = callouts.map(callout => ([
                    paragraph(callout.marker, { spacingAfter: 0, align: 'center', run: { bold: true, color: palette.accent } }),
                    paragraph(callout.text, { spacingAfter: 0 }),
                ]));
                parts.push(table(rows, { widths, borderColor: palette.boxBorder }));
            }
            return parts.join('');
        }

        case 'color-palette': {
            const parts = [];
            if (block.label) parts.push(captionParagraph(block.label, { run: { bold: true, color: palette.muted, size: 18 } }));
            const widths = [3200, 3800, PAGE.TEXT_WIDTH - 7000];
            const rows = [[
                paragraph('Nosaukums', { spacingAfter: 0, run: { bold: true } }),
                paragraph('CSS mainīgais', { spacingAfter: 0, run: { bold: true } }),
                paragraph('Krāsa', { spacingAfter: 0, run: { bold: true } }),
            ]];
            const cellFills = [[palette.headerFill, palette.headerFill, palette.headerFill]];
            (block.colors || []).forEach(color => {
                const hex = cssColorToHex(readCssVar(color.var), 'FFFFFF');
                rows.push([
                    paragraph(color.name, { spacingAfter: 0 }),
                    paragraph(color.var, { spacingAfter: 0, run: { style: 'CodeChar' } }),
                    paragraph(`#${hex}`, { spacingAfter: 0, run: { size: 18 } }),
                ]);
                cellFills.push([undefined, undefined, hex]);
            });
            parts.push(table(rows, { widths, headerRow: true, borderColor: palette.boxBorder, cellFills }));
            return parts.join('');
        }

        default:
            // Unknown block type: better a visible gap in the export than a
            // silently dropped paragraph, so record it for the caller.
            ctx.unsupported.add(block.type);
            return '';
    }
};

// ─── Document assembly ──────────────────────────────────────────────────────

const chapterBookmark = (index) => `nodala_${index + 1}`;
const sectionBookmark = (chapterIndex, sectionIndex) => `sadala_${chapterIndex + 1}_${sectionIndex + 1}`;

const formatDate = (date) => [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
].join('.');

const buildTitlePage = (chapters, palette, now) => {
    const sectionCount = chapters.reduce((total, chapter) => total + chapter.sections.length, 0);
    return [
        paragraph('', { spacingAfter: 2400 }),
        paragraph(HELP_UI.HEADER_TITLE, { style: 'Title' }),
        paragraph('Lietotāja palīdzības sadaļa', { style: 'Subtitle' }),
        paragraph('', { spacingAfter: 600 }),
        paragraph(`${chapters.length} nodaļas · ${sectionCount} sadaļas`, {
            align: 'center', run: { color: palette.muted },
        }),
        paragraph(`Izveidots ${formatDate(now)}`, {
            align: 'center', run: { color: palette.muted },
        }),
        paragraph('', { spacingAfter: 600 }),
        paragraph('Šis dokuments ir automātiski izveidots no lietotnes palīdzības sadaļas un atbilst tās saturam izveides brīdī.', {
            align: 'center', run: { italic: true, color: palette.muted, size: 20 },
        }),
        pageBreak(),
    ].join('');
};

const buildTableOfContents = (chapters) => {
    const parts = [paragraph('Saturs', { style: 'Heading1' })];

    chapters.forEach((chapter, chapterIndex) => {
        parts.push(paragraphXml(
            internalLink(chapterBookmark(chapterIndex), `${chapterIndex + 1}. ${chapter.title}`),
            { style: 'TocEntry', spacingBefore: 120, run: { bold: true } },
        ));
        chapter.sections.forEach((section, sectionIndex) => {
            parts.push(paragraphXml(
                internalLink(
                    sectionBookmark(chapterIndex, sectionIndex),
                    `${chapterIndex + 1}.${sectionIndex + 1}. ${section.title}`,
                ),
                { style: 'TocEntry', indent: 480 },
            ));
        });
    });

    parts.push(pageBreak());
    return parts.join('');
};

const buildChapters = (chapters, ctx) => chapters.map((chapter, chapterIndex) => {
    const parts = [];

    parts.push(paragraphXml(
        bookmark(ctx.nextBookmarkId(), chapterBookmark(chapterIndex), run(`${chapterIndex + 1}. ${chapter.title}`)),
        { style: 'Heading1' },
    ));

    chapter.sections.forEach((section, sectionIndex) => {
        parts.push(paragraphXml(
            bookmark(
                ctx.nextBookmarkId(),
                sectionBookmark(chapterIndex, sectionIndex),
                run(`${chapterIndex + 1}.${sectionIndex + 1}. ${section.title}`),
            ),
            { style: 'Heading2' },
        ));
        (section.content || []).forEach(block => {
            parts.push(renderBlock(block, ctx, 0));
        });
    });

    // Every chapter starts on a fresh page, except the last one which needs no
    // trailing break.
    if (chapterIndex < chapters.length - 1) parts.push(pageBreak());
    return parts.join('');
}).join('');

/**
 * Render the document body (everything between <w:body> and the section
 * properties). Split out from the packaging step so the mapping — the part that
 * changes whenever help content changes — can be tested without unzipping.
 *
 * `unsupported` lists block types no renderer handled; it must stay empty.
 */
export const buildHelpBody = ({ chapters = HELP_CHAPTERS, now = new Date() } = {}) => {
    const palette = buildPalette();
    let numberedListCount = 0;
    let bookmarkId = 0;

    const ctx = {
        palette,
        unsupported: new Set(),
        // numId 1 is the shared bullet list, so numbered lists start at 2.
        nextNumberedListId: () => { numberedListCount += 1; return numberedListCount + 1; },
        nextBookmarkId: () => { bookmarkId += 1; return bookmarkId; },
    };

    const bodyXml = buildTitlePage(chapters, palette, now)
        + buildTableOfContents(chapters)
        + buildChapters(chapters, ctx);

    if (ctx.unsupported.size) {
        console.warn('[helpDocxExport] Nezināmi satura bloku tipi izlaisti:', [...ctx.unsupported]);
    }

    return { bodyXml, numberedListCount, palette, unsupported: [...ctx.unsupported] };
};

/**
 * Build the help document as a Blob without downloading it.
 * Exposed separately so it can be inspected or tested.
 */
export const buildHelpDocxBlob = async ({ chapters = HELP_CHAPTERS, now = new Date() } = {}) => {
    const { bodyXml, numberedListCount, palette, unsupported } = buildHelpBody({ chapters, now });

    const blob = await buildDocx({
        bodyXml,
        numberedListCount,
        title: HELP_UI.HEADER_TITLE,
        creator: 'OPEX Rīks',
        accent: palette.accent,
        now,
    });

    return { blob, unsupported };
};

/** Build the .docx and hand it to the browser as a download. */
export const exportHelpToDocx = async ({ chapters = HELP_CHAPTERS, now = new Date() } = {}) => {
    const { blob } = await buildHelpDocxBlob({ chapters, now });
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('-');
    const filename = `OPEX_palidziba_${stamp}.docx`;
    downloadBlob(blob, filename);
    return filename;
};
