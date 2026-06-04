import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HELP_CHAPTERS, HELP_UI } from '../Constants/helpConstants';
import './Help.css';

/**
 * Help — Full documentation viewer
 *
 * Features:
 *   - Search across all chapters/sections
 *   - Keyboard navigation (Ctrl+K search, Escape close)
 *   - Breadcrumb showing current location
 *   - Scroll-to-top floating button
 *   - Content types: paragraph, list, note, code, heading, table, steps, accordion, ui-example, color-palette
 *   - URL hash deep linking to chapters
 *   - Section progress indicator
 */

const Help = () => {
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedAccordions, setExpandedAccordions] = useState({});
    const [showScrollTop, setShowScrollTop] = useState(false);
    const contentRef = useRef(null);
    const searchInputRef = useRef(null);

    // Set initial chapter from URL hash or first chapter
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setSelectedChapterId(hash);
            const chapter = HELP_CHAPTERS.find(ch => ch.id === hash);
            if (chapter && chapter.sections.length > 0) {
                setSelectedSectionId(chapter.sections[0].id);
            }
        } else if (HELP_CHAPTERS.length > 0) {
            setSelectedChapterId(HELP_CHAPTERS[0].id);
            if (HELP_CHAPTERS[0].sections.length > 0) {
                setSelectedSectionId(HELP_CHAPTERS[0].sections[0].id);
            }
        }
    }, []);

    // Keyboard shortcut: Ctrl+K for search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && searchQuery) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery]);

    // Track scroll position for scroll-to-top button
    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;
        const handleScroll = () => {
            setShowScrollTop(contentEl.scrollTop > 300);
        };
        contentEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => contentEl.removeEventListener('scroll', handleScroll);
    }, []);

    // Search: filter chapters and sections by query
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const q = searchQuery.toLowerCase();
        const results = [];

        HELP_CHAPTERS.forEach(chapter => {
            chapter.sections.forEach(section => {
                const titleMatch = section.title.toLowerCase().includes(q);
                // Search in content text
                const contentMatch = section.content.some(item => {
                    if (item.text && item.text.toLowerCase().includes(q)) return true;
                    if (item.title && item.title.toLowerCase().includes(q)) return true; // accordion header
                    if (item.label && item.label.toLowerCase().includes(q)) return true; // ui-example / color-palette
                    if (item.description && item.description.toLowerCase().includes(q)) return true; // ui-example
                    if (item.items && item.items.some(i => i.toLowerCase().includes(q))) return true;
                    if (item.content && item.content.some(c => c.text && c.text.toLowerCase().includes(q))) return true;
                    if (item.steps && item.steps.some(s => s.toLowerCase().includes(q))) return true;
                    if (item.headers && item.headers.some(h => String(h).toLowerCase().includes(q))) return true;
                    if (item.rows && item.rows.some(r => r.some(c => String(c).toLowerCase().includes(q)))) return true;
                    if (item.elements && item.elements.some(el => el.caption && el.caption.toLowerCase().includes(q))) return true; // ui-example captions
                    if (item.colors && item.colors.some(col => (col.name && col.name.toLowerCase().includes(q)) || (col.var && col.var.toLowerCase().includes(q)))) return true; // color-palette
                    return false;
                });

                if (titleMatch || contentMatch) {
                    results.push({
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        sectionId: section.id,
                        sectionTitle: section.title,
                        isTitle: titleMatch,
                    });
                }
            });
        });
        return results;
    }, [searchQuery]);

    const handleChapterClick = useCallback((chapterId) => {
        setSelectedChapterId(chapterId);
        const chapter = HELP_CHAPTERS.find(ch => ch.id === chapterId);
        if (chapter && chapter.sections.length > 0) {
            setSelectedSectionId(chapter.sections[0].id);
        }
        window.location.hash = chapterId;
        setSearchQuery('');
        // Scroll content to top
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, []);

    const handleSectionClick = useCallback((sectionId) => {
        setSelectedSectionId(sectionId);
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, []);

    const handleSearchResultClick = useCallback((chapterId, sectionId) => {
        setSelectedChapterId(chapterId);
        setSelectedSectionId(sectionId);
        setSearchQuery('');
        window.location.hash = chapterId;
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, []);

    const scrollToTop = useCallback(() => {
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    const toggleAccordion = useCallback((id) => {
        setExpandedAccordions(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    // ─── Content Renderers ──────────────────────────────────────────────

    const renderContent = (contentItem, index) => {
        switch (contentItem.type) {
            case 'paragraph':
                return (
                    <p key={index} className="help-paragraph">
                        {contentItem.text}
                    </p>
                );

            case 'list':
                return (
                    <ul key={index} className="help-list">
                        {contentItem.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                );

            case 'note': {
                const noteIcons = { error: 'fa-exclamation-circle', info: 'fa-info-circle', '': 'fa-exclamation-triangle' };
                const noteIcon = noteIcons[contentItem.style || ''];
                return (
                    <div key={index} className={`help-note-box ${contentItem.style || ''}`}>
                        <i className={`fas ${noteIcon} help-note-icon`}></i>
                        <div className="help-note-content">
                            {contentItem.content.map((item, idx) => renderContent(item, `${index}-${idx}`))}
                        </div>
                    </div>
                );
            }

            case 'code':
                return (
                    <code key={index} className="help-code">
                        {contentItem.text}
                    </code>
                );

            case 'heading':
                return (
                    <h3 key={index} className="help-heading">
                        {contentItem.text}
                    </h3>
                );

            // ── NEW: Table ──────────────────────────────────────────
            case 'table':
                return (
                    <div key={index} className="help-table-wrapper">
                        <table className="help-table">
                            {contentItem.headers && (
                                <thead>
                                    <tr>
                                        {contentItem.headers.map((header, idx) => (
                                            <th key={idx}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {contentItem.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            // ── NEW: Steps (numbered) ───────────────────────────────
            case 'steps':
                return (
                    <ol key={index} className="help-steps">
                        {contentItem.steps.map((step, idx) => {
                            const isObj = step !== null && typeof step === 'object';
                            return (
                                <li key={idx} className="help-step">
                                    <span className="help-step-number">{idx + 1}</span>
                                    <span className="help-step-content">
                                        <span className="help-step-text">{isObj ? step.text : step}</span>
                                        {isObj && step.detail && (
                                            <span className="help-step-detail">{step.detail}</span>
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                );

            // ── NEW: Accordion (collapsible) ────────────────────────
            case 'accordion':
                const accId = `acc-${index}`;
                const isOpen = expandedAccordions[accId];
                return (
                    <div key={index} className={`help-accordion ${isOpen ? 'open' : ''}`}>
                        <button
                            className="help-accordion-header"
                            onClick={() => toggleAccordion(accId)}
                        >
                            <span>{contentItem.title}</span>
                            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                        </button>
                        {isOpen && (
                            <div className="help-accordion-body">
                                {contentItem.content.map((item, idx) =>
                                    renderContent(item, `${index}-${idx}`)
                                )}
                            </div>
                        )}
                    </div>
                );

            // ── Live UI Example (renders real app CSS) ──────────────
            case 'ui-example':
                return (
                    <div key={index} className="help-ui-example">
                        {contentItem.label && (
                            <div className="help-ui-example-label">{contentItem.label}</div>
                        )}
                        <div className="help-ui-example-preview">
                            {contentItem.elements.map((el, idx) => (
                                <div key={idx} className="help-ui-example-item">
                                    <div
                                        className="help-ui-example-render"
                                        dangerouslySetInnerHTML={{ __html: el.html }}
                                    />
                                    {el.caption && (
                                        <span className="help-ui-example-caption">{el.caption}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {contentItem.description && (
                            <div className="help-ui-example-description">{contentItem.description}</div>
                        )}
                    </div>
                );

            // ── Color Palette (reads live CSS variables) ─────────────
            case 'color-palette':
                return (
                    <div key={index} className="help-color-palette">
                        {contentItem.label && (
                            <div className="help-ui-example-label">{contentItem.label}</div>
                        )}
                        <div className="help-color-grid">
                            {contentItem.colors.map((color, idx) => (
                                <div key={idx} className="help-color-swatch">
                                    <div
                                        className="help-color-sample"
                                        style={{ background: `var(${color.var})` }}
                                    />
                                    <div className="help-color-info">
                                        <span className="help-color-name">{color.name}</span>
                                        <code className="help-color-var">{color.var}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // ─── Derived State ──────────────────────────────────────────────────

    const selectedChapter = HELP_CHAPTERS.find(ch => ch.id === selectedChapterId);
    const selectedSection = selectedChapter?.sections.find(sec => sec.id === selectedSectionId);
    const currentSectionIndex = selectedChapter?.sections.findIndex(sec => sec.id === selectedSectionId) ?? -1;
    const totalSections = selectedChapter?.sections.length ?? 0;

    // Next/prev section navigation
    const goToNextSection = useCallback(() => {
        if (!selectedChapter || currentSectionIndex >= totalSections - 1) return;
        const next = selectedChapter.sections[currentSectionIndex + 1];
        setSelectedSectionId(next.id);
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [selectedChapter, currentSectionIndex, totalSections]);

    const goToPrevSection = useCallback(() => {
        if (!selectedChapter || currentSectionIndex <= 0) return;
        const prev = selectedChapter.sections[currentSectionIndex - 1];
        setSelectedSectionId(prev.id);
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [selectedChapter, currentSectionIndex]);

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div className="help-container">
            {/* Header */}
            <header className="help-header">
                <div className="help-header-left">
                    <h1 className="help-header-title">
                        <i className="fas fa-book-open"></i>
                        {HELP_UI.HEADER_TITLE}
                    </h1>
                </div>
                <div className="help-header-right">
                    <div className="help-search-box">
                        <i className="fas fa-search"></i>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Meklēt palīdzībā... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="help-search-input"
                        />
                        {searchQuery && (
                            <button className="help-search-clear" onClick={() => setSearchQuery('')}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="help-main">
                {/* Sidebar */}
                <aside className="help-sidebar">
                    <h2 className="help-sidebar-title">{HELP_UI.CHAPTERS_TITLE}</h2>

                    {/* Search Results */}
                    {searchResults ? (
                        <div className="help-search-results">
                            <div className="help-search-results-count">
                                {searchResults.length} {searchResults.length === 1 ? 'rezultāts' : 'rezultāti'}
                            </div>
                            {searchResults.length === 0 ? (
                                <div className="help-search-empty">
                                    <i className="fas fa-search"></i>
                                    <span>Nav rezultātu</span>
                                </div>
                            ) : (
                                searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        className="help-search-result-item"
                                        onClick={() => handleSearchResultClick(result.chapterId, result.sectionId)}
                                    >
                                        <span className="help-search-result-chapter">{result.chapterTitle}</span>
                                        <span className="help-search-result-section">{result.sectionTitle}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Normal chapter navigation */
                        <nav className="help-chapters-nav">
                            {HELP_CHAPTERS.map((chapter) => (
                                <div key={chapter.id} className="help-chapter-item">
                                    <button
                                        className={`help-chapter-button ${selectedChapterId === chapter.id ? 'active' : ''} ${chapter.isWarning ? 'warning-chapter' : ''}`}
                                        onClick={() => handleChapterClick(chapter.id)}
                                    >
                                        {chapter.icon && <i className={`fas ${chapter.icon}`}></i>}
                                        {chapter.title}
                                        {chapter.isWarning && <span className="warning-badge">!</span>}
                                    </button>

                                    {selectedChapterId === chapter.id && chapter.sections.length > 0 && (
                                        <div className={`help-sections-list ${chapter.isWarning ? 'warning-sections' : ''}`}>
                                            {chapter.sections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    className={`help-section-button ${selectedSectionId === section.id ? 'active' : ''}`}
                                                    onClick={() => handleSectionClick(section.id)}
                                                >
                                                    {section.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    )}
                </aside>

                {/* Content Display Area */}
                <main className="help-content" ref={contentRef}>
                    {selectedChapter && selectedSection ? (
                        <div className="help-section-content">
                            {/* Breadcrumb */}
                            <div className="help-breadcrumb">
                                <span className="help-breadcrumb-chapter" onClick={() => handleChapterClick(selectedChapter.id)}>
                                    {selectedChapter.title}
                                </span>
                                <i className="fas fa-chevron-right"></i>
                                <span className="help-breadcrumb-section">{selectedSection.title}</span>
                                <span className="help-breadcrumb-progress">
                                    {currentSectionIndex + 1} / {totalSections}
                                </span>
                            </div>

                            {/* Section Title */}
                            <h2 className="help-section-title">{selectedSection.title}</h2>

                            {/* Section Body */}
                            <div className="help-section-body">
                                {selectedSection.content.map((contentItem, index) =>
                                    renderContent(contentItem, index)
                                )}
                            </div>

                            {/* Prev / Next Navigation */}
                            <div className="help-section-nav">
                                <button
                                    className="help-nav-btn"
                                    onClick={goToPrevSection}
                                    disabled={currentSectionIndex <= 0}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                    <span>Iepriekšējā</span>
                                </button>
                                <button
                                    className="help-nav-btn"
                                    onClick={goToNextSection}
                                    disabled={currentSectionIndex >= totalSections - 1}
                                >
                                    <span>Nākamā</span>
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="help-no-content">
                            <i className="fas fa-book-open"></i>
                            <p>{HELP_UI.NO_RESULTS}</p>
                        </div>
                    )}

                    {/* Scroll to top button */}
                    {showScrollTop && (
                        <button className="help-scroll-top" onClick={scrollToTop} title="Uz augšu">
                            <i className="fas fa-arrow-up"></i>
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Help;
