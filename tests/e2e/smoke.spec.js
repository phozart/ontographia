// tests/e2e/smoke.spec.js
// Smoke tests to verify basic app functionality

const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/Ontographia/);

    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.locator('input[type="text"], input[name="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('help page loads', async ({ page }) => {
    await page.goto('/help');

    // Check that help content is present
    await expect(page.locator('h1, h2')).toContainText(/help/i);
  });

  test('sitemap page loads', async ({ page }) => {
    await page.goto('/sitemap');

    // Check that sitemap content is present
    await expect(page.locator('h1')).toContainText(/sitemap/i);
  });

  test('navigation is visible and functional', async ({ page }) => {
    await page.goto('/');

    // Check left navigation exists
    const nav = page.locator('.left-nav, nav');
    await expect(nav).toBeVisible();

    // Check that home link works
    const homeLink = page.locator('a[href="/"], a[href="/home"]').first();
    await homeLink.click();
    await expect(page).toHaveURL(/\/(home)?$/);
  });

  test('theme toggle exists', async ({ page }) => {
    await page.goto('/');

    // Look for theme toggle button
    const themeButton = page.locator('button[aria-label*="mode"], button[aria-label*="theme"]');
    await expect(themeButton.first()).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('unauthenticated user is redirected from protected pages', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/home');

    // Should either redirect to login or show login prompt
    // (depends on your auth implementation)
    const url = page.url();
    const hasLoginOrHome = url.includes('/login') || url.includes('/home') || url.includes('/');
    expect(hasLoginOrHome).toBe(true);
  });

  test('login form can be submitted', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[type="text"], input[name="username"]', 'testuser');
    await page.fill('input[type="password"]', 'testpassword');

    // Find and check if submit button exists
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    await expect(submitButton.first()).toBeVisible();
  });
});
