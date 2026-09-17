import { isDevMode } from './devMode';

describe('isDevMode', () => {
    const original = { NODE_ENV: process.env.NODE_ENV, REACT_APP_DEV_MODE: process.env.REACT_APP_DEV_MODE };

    afterEach(() => {
        process.env.NODE_ENV = original.NODE_ENV;
        if (original.REACT_APP_DEV_MODE === undefined) delete process.env.REACT_APP_DEV_MODE;
        else process.env.REACT_APP_DEV_MODE = original.REACT_APP_DEV_MODE;
    });

    test('is on under the dev server regardless of the opt-in flag', () => {
        process.env.NODE_ENV = 'development';
        process.env.REACT_APP_DEV_MODE = 'false';
        expect(isDevMode()).toBe(true);
    });

    test('is on for a production build that opted in', () => {
        process.env.NODE_ENV = 'production';
        process.env.REACT_APP_DEV_MODE = 'true';
        expect(isDevMode()).toBe(true);
    });

    test('is off for a plain production build', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.REACT_APP_DEV_MODE;
        expect(isDevMode()).toBe(false);
    });

    test('only the exact string "true" opts in', () => {
        process.env.NODE_ENV = 'production';
        process.env.REACT_APP_DEV_MODE = 'TRUE';
        expect(isDevMode()).toBe(false);
        process.env.REACT_APP_DEV_MODE = '1';
        expect(isDevMode()).toBe(false);
    });

    test('is off under the test environment unless opted in', () => {
        process.env.NODE_ENV = 'test';
        delete process.env.REACT_APP_DEV_MODE;
        expect(isDevMode()).toBe(false);
    });
});
