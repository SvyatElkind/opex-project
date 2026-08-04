/**
 * Test Suite Registry
 *
 * Registers all test suites with the TestRunner.
 * Import this to get a ready-to-run TestRunner instance.
 */

import TestRunner from './TestRunner';
import apiTests from './suites/apiTests';
import validationTests from './suites/validationTests';
import inheritanceTests from './suites/inheritanceTests';
import contextTests from './suites/contextTests';
import integrationTests from './suites/integrationTests';
import hookTests from './suites/hookTests';
import formValidationTests from './suites/formValidationTests';
import apiClientTests from './suites/apiClientTests';
import formWorkflowTests from './suites/formWorkflowTests';
import stateManagementTests from './suites/stateManagementTests';
import bulkOperationTests from './suites/bulkOperationTests';
import importTests from './suites/importTests';
import e2eWorkflowTests from './suites/e2eWorkflowTests';

export function createTestRunner() {
  const runner = new TestRunner();

  // Original suites
  runner.registerSuite('API Modules', apiTests);
  runner.registerSuite('Validation Functions', validationTests);
  runner.registerSuite('InheritanceUtils', inheritanceTests);
  runner.registerSuite('Context & State', contextTests);
  runner.registerSuite('Integration Workflows', integrationTests);

  // Comprehensive test suites
  runner.registerSuite('Hooks & API Client Layer', hookTests);
  runner.registerSuite('Form Validation (All Forms)', formValidationTests);
  runner.registerSuite('API Client Service', apiClientTests);
  runner.registerSuite('Form Workflow E2E', formWorkflowTests);
  runner.registerSuite('State Management Patterns', stateManagementTests);
  runner.registerSuite('Bulk Operations (Multi Create/Edit)', bulkOperationTests);
  runner.registerSuite('CSV / Excel Import', importTests);

  // E2E workflow chain
  runner.registerSuite('E2E Archival Workflow', e2eWorkflowTests);

  return runner;
}

export { TestRunner };
