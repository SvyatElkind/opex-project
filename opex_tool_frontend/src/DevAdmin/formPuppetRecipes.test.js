import { RECIPES } from './formPuppetRecipes';

/**
 * Recipes are DOM-driven and can only really run in the browser, but their
 * *shape* is checkable here: every registry entry must be a well-formed
 * recipe whose step list can be built without a form present, because the
 * puppet UI, the form inspector and Ctrl+Shift+F all call getSteps() first.
 */
const entries = Object.entries(RECIPES);

describe('RECIPES registry', () => {
    test('has the documented recipes and unique ids that match their keys', () => {
        const ids = entries.map(([, r]) => r.id);
        expect(new Set(ids).size).toBe(ids.length);
        entries.forEach(([key, recipe]) => expect(recipe.id).toBe(key));
        ['full_project', 'project_create', 'signers', 'inventory_create', 'item_create', 'record_create_doc',
            'metadata_visa', 'metadata_addressee', 'metadata_action', 'metadata_read_status',
            'export_inventory_list', 'export_pn_akts', 'generate_opex', 'verification_full']
            .forEach(id => expect(RECIPES).toHaveProperty(id));
    });

    test.each(entries.map(([id]) => id))('recipe "%s" is well-formed', (id) => {
        const recipe = RECIPES[id];
        expect(typeof recipe.name).toBe('string');
        expect(recipe.name.length).toBeGreaterThan(3);
        expect(typeof recipe.formSelector).toBe('string');
        expect(recipe.formSelector.length).toBeGreaterThan(0);
        expect(recipe.openEvent === null || typeof recipe.openEvent === 'string').toBe(true);
        expect(recipe.submitSelector === null || typeof recipe.submitSelector === 'string').toBe(true);
        expect(typeof recipe.getSteps).toBe('function');
    });

    test.each(entries.map(([id]) => id))('recipe "%s" builds a non-empty list of { label, action } steps without a form', (id) => {
        const steps = RECIPES[id].getSteps();
        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(0);
        steps.forEach((step, i) => {
            expect(typeof step.label).toBe('string');
            expect(step.label.length).toBeGreaterThan(0);
            expect(typeof step.action).toBe('function');
            if (step.expect !== undefined) {
                const list = Array.isArray(step.expect) ? step.expect : [step.expect];
                list.forEach(e => {
                    expect(typeof e.selector).toBe('string');
                    expect(e).toHaveProperty('value');
                });
            }
        });
    });

    test('form-bound recipes name a canonical container the inspector can find', () => {
        const canonical = ['.inventory-create-form', '.create-item-nav-container', '.create-record-nav-container',
            '.metadata-card-form', '.project-popup', '.inst-signers-modal', 'body'];
        entries.forEach(([, recipe]) => expect(canonical).toContain(recipe.formSelector));
    });

    test('recipes that open their own form declare a window event', () => {
        expect(RECIPES.inventory_create.openEvent).toBe('openInventoryCreate');
        expect(RECIPES.signers.openEvent).toBe('openSignersModal');
        expect(RECIPES.full_project.formSelector).toBe('body');
    });

    test('a recipe that accepts options threads them into its steps', () => {
        const steps = RECIPES.inventory_create.getSteps({ type: 'Video' });
        expect(steps.some(s => s.label.includes('Video'))).toBe(true);
    });

    test('the full project run is the longest recipe', () => {
        const lengths = entries.map(([id, r]) => [id, r.getSteps().length]);
        const longest = lengths.reduce((a, b) => (b[1] > a[1] ? b : a));
        expect(longest[0]).toBe('full_project');
    });
});
