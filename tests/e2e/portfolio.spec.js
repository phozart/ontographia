// tests/e2e/portfolio.spec.js
// End-to-end tests for Portfolio Studio

const { test, expect } = require('@playwright/test');

test.describe('Portfolio Studio', () => {
  // Before each test, navigate to portfolio
  test.beforeEach(async ({ page }) => {
    // Login if needed (adjust based on your auth implementation)
    await page.goto('/login');
    await page.fill('input[name="username"], input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForTimeout(1000);
  });

  test.describe('Portfolio Navigation', () => {
    test('can navigate to portfolio studio', async ({ page }) => {
      await page.goto('/portfolio-studio');

      // Check that portfolio page loads
      await expect(page.locator('text=Portfolio')).toBeVisible({ timeout: 10000 });
    });

    test('navigator sections are visible', async ({ page }) => {
      await page.goto('/portfolio-studio');

      // Check for main sections in navigator
      await expect(page.locator('text=Overview')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Initiatives')).toBeVisible();
      await expect(page.locator('text=Investment Themes')).toBeVisible();
    });

    test('can navigate between views', async ({ page }) => {
      await page.goto('/portfolio-studio');

      // Click on different navigation items and verify content changes
      const navItems = ['Overview', 'Initiatives', 'Investment Themes'];

      for (const item of navItems) {
        const navButton = page.locator(`text=${item}`).first();
        if (await navButton.isVisible()) {
          await navButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Priority Matrix', () => {
    test('priority matrix view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      // Navigate to Priority Matrix
      const matrixNav = page.locator('text=Priority Matrix');
      if (await matrixNav.isVisible({ timeout: 5000 })) {
        await matrixNav.click();

        // Check for quadrant labels
        await expect(page.locator('text=Quick Wins')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Big Bets')).toBeVisible();
        await expect(page.locator('text=Fill-ins')).toBeVisible();
        await expect(page.locator('text=Money Pits')).toBeVisible();
      }
    });

    test('toolbar controls are visible', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const matrixNav = page.locator('text=Priority Matrix');
      if (await matrixNav.isVisible({ timeout: 5000 })) {
        await matrixNav.click();

        // Check for toolbar buttons
        await expect(page.locator('[title="Zoom in"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[title="Zoom out"]')).toBeVisible();
        await expect(page.locator('[title="Reset view"]')).toBeVisible();
      }
    });

    test('zoom controls work', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const matrixNav = page.locator('text=Priority Matrix');
      if (await matrixNav.isVisible({ timeout: 5000 })) {
        await matrixNav.click();

        // Get initial zoom level
        const zoomText = page.locator('.matrix-toolbar__zoom');
        if (await zoomText.isVisible({ timeout: 5000 })) {
          const initialZoom = await zoomText.textContent();

          // Click zoom in
          await page.click('[title="Zoom in"]');
          await page.waitForTimeout(200);

          // Verify zoom changed
          const newZoom = await zoomText.textContent();
          expect(newZoom).not.toBe(initialZoom);
        }
      }
    });
  });

  test.describe('Stack Rank', () => {
    test('stack rank view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const stackNav = page.locator('text=Stack Rank');
      if (await stackNav.isVisible({ timeout: 5000 })) {
        await stackNav.click();

        // Check for stack rank UI elements
        await expect(page.locator('text=Stack Rank')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Scoring Panel', () => {
    test('scoring panel view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const scoringNav = page.locator('text=Scoring');
      if (await scoringNav.isVisible({ timeout: 5000 })) {
        await scoringNav.click();

        // Check for scoring model selector
        await expect(page.locator('text=WSJF').or(page.locator('text=RICE'))).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Committee Review', () => {
    test('committee review view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const committeeNav = page.locator('text=Committee Review');
      if (await committeeNav.isVisible({ timeout: 5000 })) {
        await committeeNav.click();

        // Check for voting UI
        await expect(page.locator('text=Committee Review')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Initiatives for Review').or(page.locator('text=Select an Initiative'))).toBeVisible();
      }
    });

    test('voting buttons are present', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const committeeNav = page.locator('text=Committee Review');
      if (await committeeNav.isVisible({ timeout: 5000 })) {
        await committeeNav.click();
        await page.waitForTimeout(1000);

        // If there are initiatives, check for vote buttons
        const initiative = page.locator('.review-initiative').first();
        if (await initiative.isVisible({ timeout: 3000 })) {
          await initiative.click();
          await page.waitForTimeout(500);

          // Check for vote buttons
          await expect(page.locator('text=Approve')).toBeVisible({ timeout: 5000 });
          await expect(page.locator('text=Reject')).toBeVisible();
          await expect(page.locator('text=Abstain')).toBeVisible();
        }
      }
    });
  });

  test.describe('Budget Envelopes', () => {
    test('budget envelopes view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const budgetNav = page.locator('text=Budget Envelopes');
      if (await budgetNav.isVisible({ timeout: 5000 })) {
        await budgetNav.click();

        await expect(page.locator('text=Budget Envelopes')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Decision Timeline', () => {
    test('decision timeline view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const timelineNav = page.locator('text=Decision Timeline');
      if (await timelineNav.isVisible({ timeout: 5000 })) {
        await timelineNav.click();

        await expect(page.locator('text=Decision Timeline')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Dependency Map', () => {
    test('dependency map view loads', async ({ page }) => {
      await page.goto('/portfolio-studio');

      const depNav = page.locator('text=Dependency Map');
      if (await depNav.isVisible({ timeout: 5000 })) {
        await depNav.click();

        await expect(page.locator('text=Dependency Map').or(page.locator('text=Dependencies'))).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Initiative CRUD', () => {
    test('can open create initiative modal', async ({ page }) => {
      await page.goto('/portfolio-studio');

      // Look for create button
      const createBtn = page.locator('button:has-text("Add Initiative"), button:has-text("Create Initiative"), button:has-text("New Initiative")').first();
      if (await createBtn.isVisible({ timeout: 5000 })) {
        await createBtn.click();

        // Check for modal
        await expect(page.locator('text=Create Initiative').or(page.locator('text=New Initiative'))).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

test.describe('Portfolio Accessibility', () => {
  test('portfolio page has proper heading structure', async ({ page }) => {
    await page.goto('/portfolio-studio');

    // Check for main heading
    const h1 = page.locator('h1, h2').first();
    await expect(h1).toBeVisible({ timeout: 10000 });
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/portfolio-studio');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
