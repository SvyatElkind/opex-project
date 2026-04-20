/**
 * Shared fetch interceptor registry.
 *
 * Both NetworkMonitor and APIMockToggle need to wrap window.fetch.
 * If each stores its own "originalFetch" independently, the one that
 * unmounts first can silently discard the other's wrapper.
 *
 * This module keeps a single reference to the *real* original fetch and
 * a middleware stack.  Middleware is called in order; each can short-circuit
 * by returning a Response, or call `next(...args)` to continue the chain.
 *
 * Usage:
 *   import { addMiddleware, removeMiddleware } from '../fetchInterceptor';
 *
 *   const id = addMiddleware(async (args, next) => {
 *     // inspect / modify / short-circuit
 *     return next(args);           // pass through
 *     // — or —
 *     return new Response(…);      // short-circuit
 *   });
 *
 *   removeMiddleware(id);          // cleanup on unmount
 */

const originalFetch = window.fetch.bind(window);

/** @type {Map<number, Function>} */
const middlewares = new Map();
let nextId = 0;
let installed = false;

/**
 * The single intercepted fetch that replaces window.fetch.
 * It runs through all registered middleware in insertion order.
 */
const interceptedFetch = async (...args) => {
  const chain = [...middlewares.values()];

  let index = 0;
  const next = async (passedArgs) => {
    if (index < chain.length) {
      const mw = chain[index++];
      return mw(passedArgs, next);
    }
    // End of chain — call the real fetch
    return originalFetch(...passedArgs);
  };

  return next(args);
};

const ensureInstalled = () => {
  if (!installed) {
    window.fetch = interceptedFetch;
    installed = true;
  }
};

const maybeUninstall = () => {
  if (installed && middlewares.size === 0) {
    window.fetch = originalFetch;
    installed = false;
  }
};

/**
 * Register a middleware function.
 * @param {(args: any[], next: Function) => Promise<Response>} fn
 * @returns {number} id — pass to removeMiddleware() on cleanup
 */
export const addMiddleware = (fn) => {
  const id = nextId++;
  middlewares.set(id, fn);
  ensureInstalled();
  return id;
};

/**
 * Remove a previously registered middleware.
 * @param {number} id
 */
export const removeMiddleware = (id) => {
  middlewares.delete(id);
  maybeUninstall();
};

/** Access the real, unwrapped fetch (e.g. for bypassing interceptors). */
export const getOriginalFetch = () => originalFetch;
