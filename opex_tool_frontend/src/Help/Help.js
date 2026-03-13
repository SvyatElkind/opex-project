import React, { useState, useEffect } from 'react';
import { HELP_CHAPTERS, HELP_UI } from '../Constants/helpConstants';
import './Help.css';

const Help = () => {
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    // Set initial chapter from URL hash or first chapter
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setSelectedChapterId(hash);
            // Select first section of the chapter
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

    const handleChapterClick = (chapterId) => {
        setSelectedChapterId(chapterId);
        const chapter = HELP_CHAPTERS.find(ch => ch.id === chapterId);
        if (chapter && chapter.sections.length > 0) {
            setSelectedSectionId(chapter.sections[0].id);
        }
        // Update URL hash
        window.location.hash = chapterId;
    };

    const handleSectionClick = (sectionId) => {
        setSelectedSectionId(sectionId);
    };

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

            case 'image':
                return (
                    <div key={index} className="help-image-container">
                        <img
                            src={contentItem.src}
                            alt={contentItem.alt}
                            className="help-image"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="help-image-placeholder" style={{display: 'none'}}>
                            📷 {contentItem.caption || contentItem.alt}
                        </div>
                        {contentItem.caption && (
                            <p className="help-image-caption">{contentItem.caption}</p>
                        )}
                    </div>
                );

            case 'note':
                // Note box with different styles (warning, error, info)
                const noteClass = `help-note-box ${contentItem.style || ''}`;
                return (
                    <div key={index} className={noteClass}>
                        {contentItem.content.map((item, idx) => renderContent(item, `${index}-${idx}`))}
                    </div>
                );

            case 'code':
                return (
                    <code key={index} className="help-code">
                        {contentItem.text}
                    </code>
                );

            case 'heading':
                return (
                    <h3 key={index} style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#596D69',
                        marginTop: '2rem',
                        marginBottom: '1rem'
                    }}>
                        {contentItem.text}
                    </h3>
                );

            default:
                return null;
        }
    };

    const selectedChapter = HELP_CHAPTERS.find(ch => ch.id === selectedChapterId);
    const selectedSection = selectedChapter?.sections.find(sec => sec.id === selectedSectionId);

    return (
        <div className="help-container">
            {/* Header */}
            <header className="help-header">
                <h1 className="help-header-title">{HELP_UI.HEADER_TITLE}</h1>
            </header>

            {/* Main Content Area */}
            <div className="help-main">
                {/* Chapter Sidebar Navigation */}
                <aside className="help-sidebar">
                    <h2 className="help-sidebar-title">{HELP_UI.CHAPTERS_TITLE}</h2>
                    <nav className="help-chapters-nav">
                        {HELP_CHAPTERS.map((chapter) => (
                            <div key={chapter.id} className="help-chapter-item">
                                <button
                                    className={`help-chapter-button ${selectedChapterId === chapter.id ? 'active' : ''} ${chapter.isWarning ? 'warning-chapter' : ''}`}
                                    onClick={() => handleChapterClick(chapter.id)}
                                >
                                    {chapter.title}
                                    {chapter.isWarning && <span className="warning-badge">!</span>}
                                </button>

                                {/* Show sections when chapter is selected */}
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
                </aside>

                {/* Content Display Area */}
                <main className="help-content">
                    {selectedChapter && selectedSection ? (
                        <div className="help-section-content">
                            <h2 className="help-section-title">{selectedSection.title}</h2>
                            <div className="help-section-body">
                                {selectedSection.content.map((contentItem, index) =>
                                    renderContent(contentItem, index)
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="help-no-content">
                            <p>{HELP_UI.NO_RESULTS}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Help;
