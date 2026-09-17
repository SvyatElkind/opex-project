/**
 * DevAdmin builders - reproducible test-data generation.
 *
 *   rng.js               seeded random numbers (same seed → same data)
 *   inventoryBuilder.js  US payloads + presets
 *   itemBuilder.js       GV payloads + presets
 *   recordBuilder.js     Dok. payloads, metadata sets, media enrichment
 *   scenarios.js         named datasets as plans; estimate + validate a plan
 *   executor.js          run a plan (dry or live) and report created vs expected
 *   factoryApi.js        binds the executor to devDataFactory
 *
 * Everything except factoryApi.js is pure and covered by Jest
 * (builders/*.test.js) as well as the in-browser suite
 * (testing/suites/builderTests.js).
 */

export * from './rng';
export * from './inventoryBuilder';
export * from './itemBuilder';
export * from './recordBuilder';
export * from './scenarios';
export * from './executor';
