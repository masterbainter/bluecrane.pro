const { test, expect } = require('@playwright/test');

// Define different color combinations to test
const colorSchemes = [
  {
    name: 'original-blue-crane',
    description: 'Original Blue Crane colors',
    // Keep original colors - no changes
    css: ''
  },
  {
    name: 'forest-green',
    description: 'Forest Green theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(17, 49, 32, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #22c55e !important; }
      .bg-blue-600 { background-color: #16a34a !important; }
      .hover\\:bg-blue-700:hover { background-color: #15803d !important; }
      .bg-blue-500 { background-color: #22c55e !important; }
      .bg-blue-600\\/10 { background-color: rgba(34, 197, 94, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.2) !important; }
    `
  },
  {
    name: 'sunset-orange',
    description: 'Sunset Orange theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(67, 20, 7, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #f97316 !important; }
      .bg-blue-600 { background-color: #ea580c !important; }
      .hover\\:bg-blue-700:hover { background-color: #c2410c !important; }
      .bg-blue-500 { background-color: #f97316 !important; }
      .bg-blue-600\\/10 { background-color: rgba(249, 115, 22, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.2) !important; }
    `
  },
  {
    name: 'royal-purple',
    description: 'Royal Purple theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(31, 17, 49, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #a855f7 !important; }
      .bg-blue-600 { background-color: #9333ea !important; }
      .hover\\:bg-blue-700:hover { background-color: #7c3aed !important; }
      .bg-blue-500 { background-color: #a855f7 !important; }
      .bg-blue-600\\/10 { background-color: rgba(168, 85, 247, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.2) !important; }
    `
  },
  {
    name: 'crimson-red',
    description: 'Crimson Red theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(49, 17, 17, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #ef4444 !important; }
      .bg-blue-600 { background-color: #dc2626 !important; }
      .hover\\:bg-blue-700:hover { background-color: #b91c1c !important; }
      .bg-blue-500 { background-color: #ef4444 !important; }
      .bg-blue-600\\/10 { background-color: rgba(239, 68, 68, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.2) !important; }
    `
  },
  {
    name: 'ocean-teal',
    description: 'Ocean Teal theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(17, 49, 49, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #14b8a6 !important; }
      .bg-blue-600 { background-color: #0d9488 !important; }
      .hover\\:bg-blue-700:hover { background-color: #0f766e !important; }
      .bg-blue-500 { background-color: #14b8a6 !important; }
      .bg-blue-600\\/10 { background-color: rgba(20, 184, 166, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(20, 184, 166, 0.2) !important; }
    `
  },
  {
    name: 'golden-amber',
    description: 'Golden Amber theme',
    css: `
      .hero-section {
        background-image: linear-gradient(rgba(49, 46, 17, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') !important;
      }
      .text-blue-400, .hover\\:text-blue-400:hover { color: #f59e0b !important; }
      .bg-blue-600 { background-color: #d97706 !important; }
      .hover\\:bg-blue-700:hover { background-color: #b45309 !important; }
      .bg-blue-500 { background-color: #f59e0b !important; }
      .bg-blue-600\\/10 { background-color: rgba(245, 158, 11, 0.1) !important; }
      .shadow-blue-500\\/20:hover { box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.2) !important; }
    `
  }
];

test.describe('Color Combination Testing', () => {
  // Create a test for each color scheme
  colorSchemes.forEach((scheme) => {
    test(`Screenshot: ${scheme.description}`, async ({ page }) => {
      // Navigate to the local index.html file
      await page.goto(`file://${process.cwd()}/index.html`);

      // Wait for the page to load completely
      await page.waitForLoadState('networkidle');

      // Inject the color scheme CSS if it's not the original
      if (scheme.css) {
        await page.addStyleTag({ content: scheme.css });
      }

      // Wait a moment for styles to apply
      await page.waitForTimeout(1000);

      // Take full page screenshot
      await page.screenshot({
        path: `color-tests/${scheme.name}-full-page.png`,
        fullPage: true
      });

      // Take viewport screenshot of hero section
      await page.screenshot({
        path: `color-tests/${scheme.name}-hero.png`,
        clip: { x: 0, y: 0, width: 1280, height: 800 }
      });

      // Scroll to services section and take screenshot
      await page.evaluate(() => {
        document.querySelector('#services').scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `color-tests/${scheme.name}-services.png`,
        clip: { x: 0, y: 0, width: 1280, height: 800 }
      });
    });
  });

  // Test mobile responsiveness with a few color schemes
  test('Mobile responsiveness - Forest Green', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`file://${process.cwd()}/index.html`);
    await page.waitForLoadState('networkidle');

    const greenScheme = colorSchemes.find(s => s.name === 'forest-green');
    if (greenScheme.css) {
      await page.addStyleTag({ content: greenScheme.css });
    }

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'color-tests/forest-green-mobile.png',
      fullPage: true
    });
  });

  test('Mobile responsiveness - Sunset Orange', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`file://${process.cwd()}/index.html`);
    await page.waitForLoadState('networkidle');

    const orangeScheme = colorSchemes.find(s => s.name === 'sunset-orange');
    if (orangeScheme.css) {
      await page.addStyleTag({ content: orangeScheme.css });
    }

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'color-tests/sunset-orange-mobile.png',
      fullPage: true
    });
  });
});