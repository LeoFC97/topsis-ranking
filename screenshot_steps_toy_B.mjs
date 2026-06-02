/**
 * Captures TOPSIS-RAD screenshots for Toy Example B.
 * Settings: VPL=[42,40,30,65], DPL=[95,90,88,200] — DPL_C3 updated to 88 (new column max); only VPL_C3 changed from default (18→30).
 * A8 (C3=18 < VPL_C3=30) is vetoed; A7 drops from 1st (Toy A) to 3rd.
 * Run: node screenshot_steps_toy_B.mjs
 */
import { chromium } from 'playwright';

const OUTPUT_DIR = 'C:\\Users\\HELDE\\Dropbox\\latex_nova\\Topis_RAD_Working - Sem Telas';
const CSV_PATH   = 'C:\\Users\\HELDE\\Dropbox\\git_helder\\topsis-ranking\\dpl_outlier.csv';
const APP_URL    = 'http://localhost:5174/';

const STEPS = [
  { text: 'Step 1', file: 'fig_app_toy_example_2_Gq.png' },
  { text: 'Step 2', file: 'fig_app_toy_example_2_weights.png' },
  { text: 'Step 3', file: 'fig_app_toy_example_2_Normalized.png' },
  { text: 'Step 4', file: 'fig_app_toy_example_2_Weighted.png' },
  { text: 'Step 5', file: 'fig_app_toy_example_2_DNL_VNL.png' },
  { text: 'Step 6', file: 'fig_app_toy_example_2_Distances.png' },
  { text: 'Step 7', file: 'fig_app_toy_example_2_Scores.png' },
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

  // --- Select TOPSIS-RAD mode ---
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    btns.find(b => b.textContent?.trim() === 'TOPSIS-RAD')?.click();
  });
  await page.waitForTimeout(600);

  // --- Set VPL_C3 = 30 (default is 18; index 4 in RAD settings inputs) ---
  await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll('h3'))
      .find(h => h.textContent?.includes('TOPSIS-RAD settings'));
    if (!h3) { console.error('RAD settings h3 not found'); return; }
    const section = h3.closest('section');
    if (!section) { console.error('RAD settings section not found'); return; }
    const inputs = Array.from(section.querySelectorAll('input[type="number"]'));
    // Order: [C1-vpl, C1-dpl, C2-vpl, C2-dpl, C3-vpl, C3-dpl, C4-vpl, C4-dpl]
    const vplC3 = inputs[4];
    if (!vplC3) { console.error('VPL_C3 input not found'); return; }
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeInputValueSetter.call(vplC3, '30');
    vplC3.dispatchEvent(new Event('input', { bubbles: true }));
    vplC3.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(500);

  // --- Capture DPL/VPL settings screen ---
  const settingsId = `settings-${Date.now()}`;
  const settingsOk = await page.evaluate((id) => {
    const h3 = Array.from(document.querySelectorAll('h3'))
      .find(h => h.textContent?.includes('TOPSIS-RAD settings'));
    if (!h3) return false;
    const section = h3.closest('section');
    if (!section) return false;
    section.id = id;
    return true;
  }, settingsId);

  if (settingsOk) {
    await page.locator(`#${settingsId}`).screenshot({
      path: `${OUTPUT_DIR}\\fig_toy_example_2_VPL_and_DPL.png`,
    });
    const dims = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, settingsId);
    console.log(`OK  fig_toy_example_2_VPL_and_DPL.png  (${dims})`);
  } else {
    console.error('FAIL: RAD settings section not found');
  }

  // --- Calculate ranking ---
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

    // Give the step content a unique ID, then capture it
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

  // --- Capture ranking bar chart from Charts tab ---
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
      path: `${OUTPUT_DIR}\\_fig_toy_topsis_rad.png`,
    });
    const dims = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, chartId);
    console.log(`OK  _fig_toy_topsis_rad.png  (${dims})`);
  } else {
    console.error('FAIL: ranking chart container not found');
  }

  await browser.close();
  console.log('Done.');
})();
