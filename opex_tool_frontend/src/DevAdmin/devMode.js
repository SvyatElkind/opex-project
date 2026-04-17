/**
 * Dev Mode Detection
 *
 * Determines if DevAdmin features should be available.
 *
 * Dev mode is enabled when:
 *   1. NODE_ENV === 'development' (npm start) — always dev mode
 *   2. REACT_APP_DEV_MODE === 'true' (npm run build:dev) — opt-in for builds
 *
 * Usage:
 *   npm start          → dev mode ON  (development server)
 *   npm run build:dev  → dev mode ON  (optimized build with DevAdmin)
 *   npm run build      → dev mode OFF (clean production build)
 */

export const isDevMode = () => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.REACT_APP_DEV_MODE === 'true'
  );
};

export default isDevMode;
