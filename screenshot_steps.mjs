/**
 * Captures clean cropped screenshots of each TOPSIS step from the Matrizes tab.
 * Run: node screenshot_steps.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const OUTPUT_DIR = 'C:\\Users\\HELDE\\Dropbox\\latex_nova\\Topis_RAD_Working';
const CSV_PATH   = 'C:\\Users\\HELDE\\Dropbox\\git_helder\\topsis-ranking\\dpl_outlier.csv';
const APP_URL    = 'http://localhost:5174/';

const STEPS = [
  { text: 'Step 1', file: 'fig_app_toy_example_1_G_matrix.png' },
  { text: 'Step 2', file: 'fig_app_toy_example_1_weights.png' },
  { text: 'Step 3', file: 'fig_app_toy_example_1_normalized.png' },
  { text: 'Step 4', file: 'fig_app_toy_example_1_Matrix_normalized.png' },
  { text: 'Step 5', file: 'fig_app_toy_example_1_pis_nis.png' },
  { text: 'Step 6', file: 'sw.png' },
  { text: 'Step 7', file: 'fig_toy_example1_scores.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // --- Set language to English before page load ---
  await context.addInitScript(() => localStorage.setItem('lang', 'en'));

  // --- Load app ---
  await page.goto(APP_URL, { waitUntil: 'networkidle' });

  // --- Upload CSV ---
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('button:has-text("Upload spreadsheet"):not([disabled])'),
  ]);
  await fileChooser.setFiles(CSV_PATH);
  await page.waitForTimeout(1200);

  // --- Select TOPSIS mode and calculate ---
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    btns.find(b => b.textContent?.trim() === 'TOPSIS')?.click();
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    btns.find(b => b.textContent?.includes('Calculate ranking'))?.click();
  });
  await page.waitForTimeout(1500);

  // --- Navigate to Matrices tab ---
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    btns.find(b => b.textContent?.includes('Matrices'))?.click();
  });
  await page.waitForTimeout(800);

  // --- Capture each step ---
  for (const step of STEPS) {
    // Collapse all expanded steps
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button[aria-expanded="true"]')).forEach(b => b.click());
    });
    await page.waitForTimeout(300);

    // Expand target step
    await page.evaluate((text) => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes(text));
      btn?.click();
    }, step.text);
    await page.waitForTimeout(900);

    // Give the step content a unique ID, then capture it as element screenshot
    const elementId = `capture-target-${Date.now()}`;
    const ok = await page.evaluate(({ text, id }) => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes(text));
      if (!btn) return false;
      const content = btn.nextElementSibling;
      if (!content) return false;
      content.id = id;
      return true;
    }, { text: step.text, id: elementId });

    if (!ok) {
      console.error(`FAIL: ${step.text} - content not found`);
      continue;
    }

    await page.locator(`#${elementId}`).screenshot({
      path: `${OUTPUT_DIR}\\${step.file}`,
    });

    const dims = await page.evaluate((elId) => {
      const el = document.getElementById(elId);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, elementId);
    console.log(`OK  ${step.file}  (${dims})`);
  }

  // --- Capture ranking bar chart from Graficos tab ---
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Charts'))?.click();
  });
  await page.waitForTimeout(1500);

  const chartId = `chart-target-${Date.now()}`;
  const chartOk = await page.evaluate((id) => {
    const h3 = Array.from(document.querySelectorAll('h3'))
      .find(h => h.textContent?.includes('Ranking by score'));
    if (!h3) return false;
    const container = h3.closest('.chart-container') || h3.parentElement;
    if (!container) return false;
    container.id = id;
    return true;
  }, chartId);

  if (chartOk) {
    await page.locator(`#${chartId}`).screenshot({
      path: `${OUTPUT_DIR}\\_fig_toy_Topsis.png`,
    });
    const dims = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, chartId);
    console.log(`OK  _fig_toy_Topsis.png  (${dims})`);
  } else {
    console.error('FAIL: ranking chart container not found');
  }

  await browser.close();
  console.log('Done.');
})();
