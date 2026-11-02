import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const trip = JSON.parse(readFileSync(new URL('../src/preview/sample-trip.json', import.meta.url), 'utf-8'));
const tripHash = (value: unknown) => `#data:${Buffer.from(JSON.stringify(value)).toString('base64url')}`;

const openPreview = (page: Page, hash: string) => page.goto(`/preview/${hash}`);

test.describe('Trip preview', () => {
    test.beforeEach(async ({ page }) => {
        // The trip's photos are remote; the tests only check that they are placed.
        await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    });

    test('renders the trip encoded in the URL', async ({ page }) => {
        await openPreview(page, tripHash(trip));

        await expect(page).toHaveTitle('Viaje de ejemplo');
        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Viajede ejemplo');
        await expect(page.locator('.e2e-stop-card')).toHaveCount(2);
        await expect(page.locator('.e2e-stop-photo')).toHaveCount(4);
        await expect(page.getByText('Centro histórico · Fuente 1')).toBeVisible();
        await expect(page.locator('.mf-transport-table b').first()).toHaveText('50€');
        await expect(page.locator('.mf-transport-table th').first()).toHaveText('Trayecto');
    });

    test('#data:sample shows the bundled sample trip', async ({ page }) => {
        await openPreview(page, '#data:sample');

        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Viajede ejemplo');
        await expect(page.locator('.e2e-stop-card')).toHaveCount(2);
    });

    test('shows the photos of a stop with several pictures', async ({ page }) => {
        await openPreview(page, tripHash(trip));

        const stop = page.locator('.e2e-stop-card', { hasText: 'Ciudad B' });
        await expect(stop.locator('.e2e-stop-photo')).toHaveCount(3);
        await expect(stop.locator('.e2e-stop-photo').first()).toHaveAttribute('target', '_blank');
    });

    test('renders cards, checklists and custom labels', async ({ page }) => {
        await openPreview(
            page,
            tripHash({
                hero: { title: 'Weekend' },
                labels: { transportRoute: 'Route' },
                sections: [
                    { id: 'plan', title: 'Plan', blocks: [{ type: 'transport', rows: [{ route: 'A → B' }] }] },
                    {
                        id: 'todo',
                        navLabel: 'To do',
                        title: 'Before leaving',
                        blocks: [
                            { type: 'cards', cards: [{ title: 'Packing', bullets: ['Jacket'] }] },
                            { type: 'checklist', items: [{ title: 'Ferry', text: 'Book it' }] },
                        ],
                    },
                ],
            }),
        );

        await expect(page.locator('.mf-transport-table th').first()).toHaveText('Route');
        await expect(page.locator('.mf-trip-cards')).toContainText('Jacket');
        await expect(page.locator('.mf-trip-checklist')).toContainText('Book it');
        await expect(page.locator('.e2e-trip-nav-link')).toHaveText(['Plan', 'To do']);
    });

    test('navigating between sections keeps the trip data in the URL', async ({ page }) => {
        const hash = tripHash({
            hero: { title: 'Weekend' },
            sections: [
                { id: 'one', title: 'One', blocks: [] },
                { id: 'two', title: 'Two', blocks: [] },
            ],
        });
        await openPreview(page, hash);

        await page.locator('.e2e-trip-nav-link', { hasText: 'Two' }).click();

        await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hash);
        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Weekend');
    });

    test('updates when the data in the URL changes', async ({ page }) => {
        await openPreview(page, tripHash({ hero: { title: 'First' }, sections: [] }));
        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('First');

        await page.evaluate((hash) => (window.location.hash = hash), tripHash({ hero: { title: 'Second' }, sections: [] }));

        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Second');
    });

    test('serves the JSON schema of the trip data', async ({ request }) => {
        const response = await request.get('/preview/schema.json');

        expect(response.ok()).toBe(true);
        expect((await response.json()).$id).toBe('https://freefri.github.io/Travel-planner/preview/schema.json');
    });

    test('without data, shows the guide with a sample and the schema', async ({ page }) => {
        await openPreview(page, '');

        const guide = page.locator('#trip-guide');
        await expect(guide).toBeVisible();
        await expect(guide.locator('.e2e-guide-schema-link').first()).toHaveAttribute('href', 'schema.json');

        await guide.locator('.e2e-guide-sample-link').click();

        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Viajede ejemplo');
        await expect(guide).toBeHidden();
    });

    test('hides the guide when the link carries a trip', async ({ page }) => {
        await openPreview(page, '#data:sample');

        await expect(page.locator('.mf-trip-hero-banner h1')).toHaveText('Viajede ejemplo');
        await expect(page.locator('#trip-guide')).toBeHidden();
    });

    test('serves the guide as static HTML for clients that do not run JavaScript', async ({ request }) => {
        const html = await (await request.get('/preview/')).text();

        expect(html).toContain('id="trip-guide"');
        expect(html).toContain('https://freefri.github.io/Travel-planner/preview/schema.json');
        expect(html).toContain('base64url');
    });

    for (const path of ['/', '/preview/']) {
        test(`asks search engines not to index or follow ${path}`, async ({ page }) => {
            await page.goto(path);

            await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
        });
    }

    test('reports which field is wrong in broken data', async ({ page }) => {
        await openPreview(page, tripHash({ hero: {}, sections: [] }));

        await expect(page.locator('.mf-trip-message')).toContainText('No se ha podido leer el viaje');
        await expect(page.locator('.e2e-trip-error-detail')).toContainText('hero.title');
    });

    test('does not turn unsafe URLs from the data into links', async ({ page }) => {
        await openPreview(
            page,
            tripHash({
                hero: { title: 'Trip' },
                sections: [
                    {
                        id: 's',
                        title: 'S',
                        blocks: [
                            {
                                type: 'stop',
                                title: 'Stop',
                                photos: [
                                    { src: 'https://example.com/a.jpg', href: 'javascript:alert(1)', title: 'Unsafe link' },
                                    { src: 'javascript:alert(1)', title: 'Unsafe image' },
                                ],
                            },
                        ],
                    },
                ],
            }),
        );

        await expect(page.locator('.e2e-stop-photo')).toHaveCount(1);
        await expect(page.locator('a[href^="javascript"]')).toHaveCount(0);
    });
});
