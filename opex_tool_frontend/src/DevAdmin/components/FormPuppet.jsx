import React, { useState, useRef, useCallback } from 'react';
import { RECIPES } from '../formPuppetRecipes';
import { runPuppetSteps, waitForSelector, highlightElement, sleep, formatPuppetLog } from '../formPuppetEngine';

/**
 * FormPuppet — Visual form auto-filler that simulates real user interaction.
 *
 * Shows a step-by-step progress panel while filling forms field by field,
 * with visible typing, highlights, and scrolling — as if a person is doing it.
 *
 * Integrates into the FormInspector via the "Auto-fill" button per form,
 * or can be used standalone from the DevAdmin Actions tab.
 */

const SPEED_CONFIG = {
  instant: { delayBetween: 100 },
  normal: { delayBetween: 400 },
  slow: { delayBetween: 800 },
};

const FormPuppet = () => {
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState([]);       // { label, status }
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [speed, setSpeed] = useState('normal');  // 'instant' | 'normal' | 'slow'
  const [showLog, setShowLog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);    // accumulated run logs
  const abortRef = useRef(null);

  const recipeList = Object.values(RECIPES);

  const handleRun = useCallback(async () => {
    const recipe = RECIPES[selectedRecipe];
    if (!recipe) return;

    // Self-navigating recipes handle their own form opening
    const isSelfNavigating = recipe.id === 'full_project';

    if (!isSelfNavigating) {
      // Check if the form is visible in the DOM
      const formEl = document.querySelector(recipe.formSelector);
      if (!formEl) {
        if (recipe.openEvent) {
          window.dispatchEvent(new CustomEvent(recipe.openEvent));
          try {
            await waitForSelector(recipe.formSelector, 3000);
          } catch {
            setResult({ completed: 0, failed: 1, errors: [`Forma nav atrasta: ${recipe.formSelector}. Ludzu atveriet formu manuali.`], log: [], totalMs: 0 });
            return;
          }
        } else {
          const hints = {
            '.project-popup': 'Nospiediet "Jauns projekts" pogu vai atveriet tusu projektu.',
          '.inst-signers-modal': 'Nospiediet "Parakstitaji" pogu labaja izveline.',
          '.create-item-nav-container': 'Atveriet uzskaites sarakstu un nospiediet "+ Jauna GV" pogu.',
            '.create-record-nav-container': 'Atveriet glabajamo vienibu un nospiediet "+ Jauns dokuments" pogu.',
            '.metadata-card-form': 'Atveriet ierakstu un nospiediet metadatu pievienosanas pogu.',
          };
          const hint = hints[recipe.formSelector] || 'Ludzu atveriet formu manuali pirms palaisanas.';
          setResult({ completed: 0, failed: 1, errors: [`Forma nav atrasta. ${hint}`], log: [], totalMs: 0 });
          return;
        }
      }
    }

    const puppetSteps = recipe.getSteps();

    // Add submit step if enabled
    if (autoSubmit && recipe.submitSelector) {
      puppetSteps.push({
        label: 'Nosuta formu (Submit)',
        action: async () => {
          const btn = document.querySelector(recipe.submitSelector);
          if (!btn) throw new Error(`Submit button not found: ${recipe.submitSelector}`);
          highlightElement(btn, 1000);
          await sleep(300);
          btn.click();
        },
      });
    }

    // Initialize step tracking
    setSteps(puppetSteps.map((s) => ({ label: s.label, status: 'pending' })));
    setCurrentStep(0);
    setResult(null);
    setIsRunning(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const onStep = (index, label, status) => {
      setCurrentStep(index);
      setSteps((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status } : s))
      );
    };

    const res = await runPuppetSteps(puppetSteps, onStep, {
      ...SPEED_CONFIG[speed],
      abortSignal: controller.signal,
    });

    setResult(res);
    setIsRunning(false);
    abortRef.current = null;

    // Store formatted log in history
    const recipeName = recipe.name;
    const logText = formatPuppetLog(recipeName, res);
    setHistory(prev => [...prev, { recipeName, logText, time: new Date().toLocaleTimeString(), ok: res.failed === 0 }]);
  }, [selectedRecipe, autoSubmit, speed]);

  const handleAbort = () => {
    abortRef.current?.abort();
  };

  const handleReset = () => {
    setSteps([]);
    setCurrentStep(-1);
    setResult(null);
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>
          <i className="fas fa-robot" style={{ marginRight: 6 }}></i>
          Form Puppet
        </h3>
        <span style={{ color: '#9ca3af', fontSize: 11 }}>
          Automatiski aizpilda formas ka reals lietotajs
        </span>
      </div>

      <div className="dev-panel-body">
        {/* Recipe selector */}
        <div className="puppet-controls">
          <div className="puppet-row">
            <select
              className="test-suite-select"
              value={selectedRecipe}
              onChange={(e) => { setSelectedRecipe(e.target.value); handleReset(); }}
              disabled={isRunning}
              style={{ flex: 1 }}
            >
              <option value="">-- Izveleties formu --</option>
              {recipeList.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            <button
              className={`dev-btn ${isRunning ? '' : 'primary'}`}
              onClick={isRunning ? handleAbort : handleRun}
              disabled={!selectedRecipe && !isRunning}
              style={{ minWidth: 90, fontWeight: 600 }}
            >
              {isRunning ? (
                <><i className="fas fa-stop"></i> Apturet</>
              ) : (
                <><i className="fas fa-play"></i> Palaist</>
              )}
            </button>
          </div>

          {/* Options row */}
          <div className="puppet-row" style={{ gap: 16 }}>
            <label className="puppet-option">
              <span>Atrums:</span>
              <select
                className="test-suite-select"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                disabled={isRunning}
                style={{ width: 100 }}
              >
                <option value="instant">Atrs</option>
                <option value="normal">Normala</option>
                <option value="slow">Lena</option>
              </select>
            </label>

            <label className="puppet-option">
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
                disabled={isRunning}
              />
              <span>Auto-submit</span>
            </label>
          </div>
        </div>

        {/* Form detection hint */}
        {selectedRecipe && !isRunning && steps.length === 0 && (
          <div className="puppet-hint">
            <i className="fas fa-info-circle"></i>
            <span>
              {selectedRecipe === 'full_project' ? (
                <>Nospiediet <strong>Palaist</strong> lai izveidotu pilnu projekta strukturu: 5 inventarus, vienibas, dokumentus un metadatus.</>
              ) : (
                <>
                  Palidziet atvert formu <strong>{RECIPES[selectedRecipe]?.name}</strong> pirms palaisanas.
                  {RECIPES[selectedRecipe]?.openEvent && (
                    <> Vai nospiediet Palaist — forma tiks atverta automatiski.</>
                  )}
                </>
              )}
            </span>
          </div>
        )}

        {/* Progress bar for long recipes */}
        {steps.length > 0 && isRunning && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
              <span>Solis {currentStep + 1} / {steps.length}</span>
              <span>{steps.filter(s => s.status === 'done').length} pabeigti, {steps.filter(s => s.status === 'error').length} kludas</span>
            </div>
            <div style={{ height: 4, background: '#1f2937', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                background: steps.some(s => s.status === 'error') ? '#ef4444' : '#10b981',
                transition: 'width 0.3s ease',
                borderRadius: 2,
              }} />
            </div>
          </div>
        )}

        {/* Step list */}
        {steps.length > 0 && (
          <div className="puppet-steps">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`puppet-step ${step.status} ${i === currentStep && isRunning ? 'active' : ''}`}
              >
                <span className="puppet-step-icon">
                  {step.status === 'done' && <i className="fas fa-check"></i>}
                  {step.status === 'error' && <i className="fas fa-times"></i>}
                  {step.status === 'running' && <i className="fas fa-spinner fa-spin"></i>}
                  {step.status === 'pending' && <i className="fas fa-circle" style={{ fontSize: 6, opacity: 0.4 }}></i>}
                </span>
                <span className="puppet-step-label">{step.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`puppet-result ${result.failed > 0 ? 'has-errors' : 'success'}`}>
            <div className="puppet-result-header">
              <i className={`fas ${result.failed > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
              <strong>
                {result.failed > 0
                  ? `Pabeigts ar ${result.failed} kludam`
                  : `Visi ${result.completed} soli izpilditi!`}
              </strong>
              <span style={{ color: '#6b7280', fontSize: 11, marginLeft: 'auto' }}>
                {result.totalMs}ms
              </span>
            </div>
            {result.errors.length > 0 && (
              <ul className="puppet-error-list">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="dev-btn" onClick={handleReset}>
                <i className="fas fa-redo"></i> Atiestatit
              </button>
              <button
                className="dev-btn"
                onClick={() => {
                  const log = formatPuppetLog(RECIPES[selectedRecipe]?.name || selectedRecipe, result);
                  navigator.clipboard.writeText(log);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ color: copied ? '#10b981' : undefined }}
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                {copied ? ' Nokopets!' : ' Kopet logu'}
              </button>
            </div>
          </div>
        )}

        {/* Log History */}
        {history.length > 0 && (
          <div className="puppet-log-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <button
                className="dev-btn"
                onClick={() => setShowLog(!showLog)}
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                <i className={`fas fa-chevron-${showLog ? 'down' : 'right'}`} style={{ marginRight: 4, fontSize: 9 }}></i>
                Vesture ({history.length} {history.length === 1 ? 'palaides.' : 'palaides.'})
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="dev-btn"
                  onClick={() => {
                    const allLogs = history.map(h => h.logText).join('\n\n');
                    navigator.clipboard.writeText(allLogs);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ fontSize: 11, padding: '3px 8px', color: copied ? '#10b981' : undefined }}
                  title="Kopet visu vesturi"
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-clipboard-list'}`}></i>
                  {copied ? ' Nokopets' : ' Kopet visu'}
                </button>
                <button
                  className="dev-btn"
                  onClick={() => setHistory([])}
                  style={{ fontSize: 11, padding: '3px 8px', color: '#ef4444' }}
                  title="Notirit vesturi"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>

            {showLog && (
              <div className="puppet-log-list">
                {history.map((entry, i) => (
                  <div key={i} className="puppet-log-entry">
                    <div className="puppet-log-entry-header">
                      <i className={`fas ${entry.ok ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                        style={{ color: entry.ok ? '#10b981' : '#ef4444', fontSize: 10 }}></i>
                      <span style={{ fontWeight: 500 }}>{entry.recipeName}</span>
                      <span style={{ color: '#4b5563', marginLeft: 'auto' }}>{entry.time}</span>
                      <button
                        className="dev-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.logText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{ padding: '1px 6px', fontSize: 10, marginLeft: 4 }}
                        title="Kopet so logu"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                    <pre className="puppet-log-pre">{entry.logText}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPuppet;
