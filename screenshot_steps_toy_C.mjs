/**
 * Captures TOPSIS-RAD screenshots for Toy Example C.
 * Settings: VPL=[42,40,30,65], DPL=[98,90,85,80] — DPL_C1 raised to 98, DPL_C4 lowered to 80.
 * A8 still vetoed. DPL_C3=85 caps A4 (88→85). DPL_C4=80 caps A4 (84→80), A5 (100→80), A10 (81→80).
 * Using fixed DM-defined DPL rather than data-driven column maxima.
 * Run: node screenshot_steps_toy_C.mjs
 */
import { chromium } from 'playwright';

const OUTPUT_DIR = 'C:\\Users\\HELDE\\Dropbox\\latex_nova\\Topis_RAD_Working - Sem Telas';
const CSV_PATH   = 'C:\\Users\\HELDE\\Dropbox\\git_helder\\topsis-ranking\\dpl_outlier.csv';
const APP_URL    = 'http://localhost:5174/';

const STEPS = [
  { text: 'Step 1', file: 'fig_app_toy_example_3_Gq.png' },
  { text: 'Step 2', file: 'fig_app_toy_example_3_weights.png' },
  { text: 'Step 3', file: 'fig_app_toy_example_3_Normalized.png' },
  { text: 'Step 4', file: 'fig_app_toy_example_3_Weighted.png' },
  { text: 'Step 5', file: 'fig_app_toy_example_3_DNL_VNL.png' },
  { text: 'Step 6', file: 'fig_app_toy_example_3_Distances.png' },
  { text: 'Step 7', file: 'fig_app_toy_example_3_Scores.png' },
];

async function setInput(page, inputEl, value) {
  await page.evaluate(({ sel, val }) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeInputValueSetter.call(sel, val);
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, { sel: inputEl, val: value });
}

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

  // --- Set VPL and DPL values ---
  // Input order inside RAD settings section:
  //   [0]=C1-vpl, [1]=C1-dpl, [2]=C2-vpl, [3]=C2-dpl,
  //   [4]=C3-vpl, [5]=C3-dpl, [6]=C4-vpl, [7]=C4-dpl
  await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll('h3'))
      .find(h => h.textContent?.includes('TOPSIS-RAD settings'));
    if (!h3) { console.error('RAD settings h3 not found'); return; }
    const section = h3.closest('section');
    if (!section) { console.error('RAD settings section not found'); return; }
    const inputs = Array.from(section.querySelectorAll('input[type="number"]'));

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;

    function set(input, value) {
      if (!input) return;
      nativeInputValueSetter.call(input, String(value));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    set(inputs[1], 98);   // DPL_C1 = 98 (default 95 → raise to 98)
    set(inputs[4], 30);   // VPL_C3 = 30 (default 18 → veto A8)
    set(inputs[5], 85);   // DPL_C3 = 85 (default 88 with new data → fix to 85)
    set(inputs[7], 80);   // DPL_C4 = 80 (default 200 → fixed DM frontier)
  });
  await page.waitForTimeout(600);

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
      path: `${OUTPUT_DIR}\\fig_toy_example_3_VPL_and_DPL.png`,
    });
    const dims = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, settingsId);
    console.log(`OK  fig_toy_example_3_VPL_and_DPL.png  (${dims})`);
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
      path: `${OUTPUT_DIR}\\_fig_toy_topsis_rad_C.png`,
    });
    const dims = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? `${el.offsetWidth}×${el.offsetHeight}` : '?';
    }, chartId);
    console.log(`OK  _fig_toy_topsis_rad_C.png  (${dims})`);
  } else {
    console.error('FAIL: ranking chart container not found');
  }

  await browser.close();
  console.log('Done.');
})();
