import { test, expect } from '@playwright/test';

test.describe('Travel Planner E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should have the correct title and header', async ({ page }) => {
        // 1. Page title is 'Travel Planner'
        await expect(page).toHaveTitle(/Travel Planner/);

        const header = page.locator('h1').first();
        await expect(header).toHaveText('Travel Planner');

        // Visual Snapshot
        await expect(page).toHaveScreenshot('dashboard.png');
    });

    test('should load the initial sample place and show details', async ({ page }) => {
        // 3. The 'Pura Tanah Lot' card is loaded
        const card = page.locator('text=Pura Tanah Lot');
        await expect(card).toBeVisible();

        // 4. Open the detail view by clicking the card and verify it displays the description
        await card.click();

        // Check modal content
        const modal = page.locator('.mf-edit-place-modal'); // Modal overlay
        await expect(modal).toBeVisible();

        const description = page.locator('text=Un templo icónico en un islote rocoso');
        await expect(description).toBeVisible();

        // Visual Snapshot of the Modal
        await expect(page).toHaveScreenshot('detail-modal.png');

        // Close modal using the X button or Close Details button
        // The X button in Travel.tsx is a button containing an X icon (lucide-react X)
        // We can target the button with the close icon or the text "Close Details"
        const closeButton = page.locator('.mf-modal-close-button').first();
        await expect(closeButton).toBeVisible();
        await closeButton.click();
        await expect(modal).not.toBeVisible();
    });

    test('should filter places by search query', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search places...');
        await searchInput.fill('Tanah');
        await expect(page.locator('text=Pura Tanah Lot')).toBeVisible();

        // Since we only have one sample place, searching for something else should clear it
        await searchInput.fill('Non Existent');
        await expect(page.locator('text=No places found')).toBeVisible();

        await searchInput.fill('');
        await expect(page.locator('text=Pura Tanah Lot')).toBeVisible();
    });
});
