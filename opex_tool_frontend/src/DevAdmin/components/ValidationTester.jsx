import React, { useState, useMemo } from 'react';
import { validateProjectForOPEX } from '../../Utils/InheritanceUtils';

const ValidationTester = ({ projectData }) => {
  const [testResult, setTestResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const runValidation = () => {
    if (!projectData) {
      alert('No project loaded!');
      return;
    }

    const start = performance.now();
    const result = validateProjectForOPEX(projectData);
    const end = performance.now();

    setTestResult({
      ...result,
      executionTime: (end - start).toFixed(2)
    });
    setShowDetails(true);
  };

  const clearResults = () => {
    setTestResult(null);
    setShowDetails(false);
  };

  const validationSummary = useMemo(() => {
    if (!testResult) return null;

    return {
      readyForOPEX: testResult.summary?.readyForOPEX || false,
      totalInventories: testResult.inventoryValidations?.length || 0,
      inventoriesWithErrors: testResult.summary?.inventoriesWithErrors || 0,
      inventoriesWithWarnings: testResult.summary?.inventoriesWithWarnings || 0,
      totalWarnings: testResult.summary?.totalWarnings || 0,
      totalErrors: testResult.summary?.totalErrors || 0
    };
  }, [testResult]);

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Validation Tester</h3>
        <div className="dev-panel-actions">
          {testResult && (
            <button onClick={clearResults} className="dev-action-btn" title="Clear results">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="dev-panel-body">
        {!projectData ? (
          <div className="dev-empty-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>No project loaded</p>
          </div>
        ) : (
          <>
            <div className="validation-controls">
              <button onClick={runValidation} className="dev-btn primary large">
                <i className="fas fa-play-circle"></i> Run Validation Test
              </button>
              {testResult && (
                <div className="execution-time">
                  Executed in <strong>{testResult.executionTime}ms</strong>
                </div>
              )}
            </div>

            {testResult && validationSummary && (
              <div className="validation-results">
                {/* Summary Cards */}
                <div className="result-cards">
                  <div className={`result-card ${validationSummary.readyForOPEX ? 'success' : 'error'}`}>
                    <i className={`fas fa-${validationSummary.readyForOPEX ? 'check-circle' : 'times-circle'}`}></i>
                    <div className="card-content">
                      <h4>Status</h4>
                      <p>{validationSummary.readyForOPEX ? 'Ready for OPEX' : 'Not Ready'}</p>
                    </div>
                  </div>

                  <div className={`result-card ${validationSummary.totalErrors === 0 ? 'success' : 'error'}`}>
                    <i className="fas fa-exclamation-circle"></i>
                    <div className="card-content">
                      <h4>Errors</h4>
                      <p className="count">{validationSummary.totalErrors}</p>
                    </div>
                  </div>

                  <div className={`result-card ${validationSummary.totalWarnings === 0 ? 'success' : 'warning'}`}>
                    <i className="fas fa-exclamation-triangle"></i>
                    <div className="card-content">
                      <h4>Warnings</h4>
                      <p className="count">{validationSummary.totalWarnings}</p>
                    </div>
                  </div>

                  <div className="result-card info">
                    <i className="fas fa-list"></i>
                    <div className="card-content">
                      <h4>Inventories</h4>
                      <p className="count">{validationSummary.totalInventories}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="result-section">
                  <div
                    className="result-section-header"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <h4>
                      <i className={`fas fa-chevron-${showDetails ? 'down' : 'right'}`}></i>
                      Detailed Results
                    </h4>
                  </div>
                  {showDetails && (
                    <div className="result-details">
                      <pre>{JSON.stringify(testResult, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Inventory Breakdown */}
                {testResult.inventoryValidations && (
                  <div className="inventory-breakdown">
                    <h4>Inventory Breakdown</h4>
                    <table className="validation-table">
                      <thead>
                        <tr>
                          <th>Inventory</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Errors</th>
                          <th>Warnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResult.inventoryValidations.map((inv, index) => (
                          <tr key={index}>
                            <td>{inv.inventory?.type} - {inv.inventory?.number}</td>
                            <td>{inv.inventory?.electronic ? 'Electronic' : 'Physical'}</td>
                            <td>
                              {inv.validation?.readyForOPEX ? (
                                <span className="status-badge success">
                                  <i className="fas fa-check"></i> Ready
                                </span>
                              ) : (
                                <span className="status-badge error">
                                  <i className="fas fa-times"></i> Not Ready
                                </span>
                              )}
                            </td>
                            <td className="count-cell error">
                              {inv.validation?.details?.criticalIssues || 0}
                            </td>
                            <td className="count-cell warning">
                              {inv.validation?.warnings?.length || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ValidationTester;
