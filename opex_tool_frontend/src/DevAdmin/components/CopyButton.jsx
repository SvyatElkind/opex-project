import React, { useState, useCallback } from 'react';

/**
 * CopyButton — Copies text to clipboard with visual feedback
 *
 * Usage:
 *   <CopyButton text="content to copy" />
 *   <CopyButton getText={() => buildReportString()} label="Copy Report" />
 */
const CopyButton = ({ text, getText, label = 'Copy', style = {}, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    const content = getText ? getText() : text;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text, getText]);

  return (
    <button
      className={`dev-btn ${className}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : label}
      style={{
        padding: '2px 8px',
        fontSize: 11,
        minWidth: 'auto',
        transition: 'all 0.15s',
        ...(copied ? { borderColor: '#10b981', color: '#10b981' } : {}),
        ...style,
      }}
    >
      <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
      {label !== false && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
};

// ─── Report Formatters ──────────────────────────────────────────────────────

/**
 * Format test results into a copyable bug report
 */
export const formatTestReport = (results) => {
  if (!results) return '';

  const lines = [
    `== OPEX Dev Test Report ==`,
    `Date: ${new Date().toISOString()}`,
    `Status: ${results.totals.failed === 0 ? 'ALL PASSED' : 'FAILURES DETECTED'}`,
    `Passed: ${results.totals.passed} | Failed: ${results.totals.failed} | Skipped: ${results.totals.skipped}`,
    `Duration: ${(results.totals.duration / 1000).toFixed(2)}s`,
    ``,
  ];

  results.suites.forEach(suite => {
    const failedTests = suite.tests.filter(t => t.status === 'failed');
    if (failedTests.length === 0) return;

    lines.push(`--- ${suite.name} (${suite.failed} failed) ---`);
    failedTests.forEach(t => {
      lines.push(`  FAIL: ${t.name}`);
      if (t.error) lines.push(`    Error: ${t.error}`);
      if (t.expected) lines.push(`    Expected: ${t.expected}`);
      if (t.actual) lines.push(`    Actual: ${t.actual}`);
      lines.push('');
    });
  });

  return lines.join('\n');
};

/**
 * Format a single failed test into a copyable string
 */
export const formatSingleTest = (suiteName, test) => {
  const lines = [
    `Suite: ${suiteName}`,
    `Test: ${test.name}`,
    `Status: ${test.status}`,
    `Duration: ${test.duration ? test.duration.toFixed(1) + 'ms' : 'N/A'}`,
  ];
  if (test.error) lines.push(`Error: ${test.error}`);
  if (test.expected) lines.push(`Expected: ${test.expected}`);
  if (test.actual) lines.push(`Actual: ${test.actual}`);
  return lines.join('\n');
};

/**
 * Format a network request into a copyable bug report
 */
export const formatNetworkRequest = (req) => {
  const lines = [
    `== API Request Report ==`,
    `${req.method} ${req.url}`,
    `Status: ${req.status || 'N/A'} ${req.statusText || ''}`,
    `Duration: ${req.duration}ms`,
    `Time: ${new Date(req.timestamp).toLocaleString()}`,
    `FormData: ${req.isFormData ? 'Yes' : 'No'}`,
  ];

  if (req.requestBody) {
    lines.push('', '-- Request Body --');
    lines.push(typeof req.requestBody === 'string'
      ? req.requestBody
      : JSON.stringify(req.requestBody, null, 2));
  }

  if (req.responseBody) {
    lines.push('', '-- Response Body --');
    lines.push(typeof req.responseBody === 'string'
      ? req.responseBody
      : JSON.stringify(req.responseBody, null, 2));
  }

  if (req.error) {
    lines.push('', `-- Error --`, req.error);
  }

  if (Object.keys(req.responseHeaders || {}).length > 0) {
    lines.push('', '-- Response Headers --');
    Object.entries(req.responseHeaders).forEach(([k, v]) => {
      lines.push(`${k}: ${v}`);
    });
  }

  return lines.join('\n');
};

/**
 * Format a network request as a cURL command
 */
export const formatAsCurl = (req) => {
  const parts = [`curl -X ${req.method}`];
  parts.push(`'${req.url}'`);

  if (req.requestHeaders) {
    Object.entries(req.requestHeaders).forEach(([key, value]) => {
      if (typeof value === 'string') {
        parts.push(`-H '${key}: ${value}'`);
      }
    });
  }

  if (req.requestBody && !req.isFormData) {
    const body = typeof req.requestBody === 'string'
      ? req.requestBody
      : JSON.stringify(req.requestBody);
    parts.push(`-d '${body.replace(/'/g, "\\'")}'`);
  }

  if (req.isFormData && req.requestBody) {
    Object.entries(req.requestBody).forEach(([key, value]) => {
      parts.push(`-F '${key}=${value}'`);
    });
  }

  return parts.join(' \\\n  ');
};

/**
 * Format form inspector state into a copyable report
 */
export const formatFormReport = (form) => {
  if (!form) return '';

  const lines = [
    `== Form Inspector Report ==`,
    `Form: ${form.name}`,
    `Fields: ${form.totalFields} | Filled: ${form.filledFields} | Empty Required: ${form.emptyRequired} | Invalid: ${form.invalidFields}`,
    '',
  ];

  form.fields.forEach(f => {
    const status = f.disabled ? 'DISABLED' :
                   !f.valid ? 'INVALID' :
                   f.required && f.isEmpty ? 'EMPTY (required)' :
                   f.isEmpty ? 'empty' : 'OK';
    lines.push(`[${status}] ${f.name} (${f.type})${f.required ? ' *' : ''}: "${f.value}"`);
    if (f.validationMessage) lines.push(`  Error: ${f.validationMessage}`);
    if (f.maxLength) lines.push(`  Length: ${f.currentLength}/${f.maxLength}`);
  });

  return lines.join('\n');
};

/**
 * Format error tester logs into a copyable report
 */
export const formatErrorLog = (logs) => {
  if (!logs || logs.length === 0) return '';

  const lines = [
    `== Error Tester Log ==`,
    `Date: ${new Date().toISOString()}`,
    `Entries: ${logs.length}`,
    '',
  ];

  logs.forEach(log => {
    const prefix = log.type === 'error' ? 'ERR' :
                   log.type === 'warning' ? 'WRN' :
                   log.type === 'success' ? 'OK ' : 'INF';
    lines.push(`[${log.timestamp}] ${prefix} ${log.message}`);
  });

  return lines.join('\n');
};

export default CopyButton;
