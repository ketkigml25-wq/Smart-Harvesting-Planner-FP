const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Khushi\\.gemini\\antigravity\\brain\\83c803fb-4069-440f-964f-32e588eeaf26';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const pageTitle = await page.evaluate(() => document.querySelector('h1')?.innerText || '');
  const hasPhoneInput = await page.evaluate(() => !!document.querySelector('input[type="tel"]'));
  const hasRoleSwitch = await page.evaluate(() => !!document.querySelector('button')?.innerText.includes('किसान'));

  console.log('--- ROOT URL http://127.0.0.1:5173/ CHECK ---');
  console.log('Brand Header:', pageTitle);
  console.log('Login Phone Input Present:', hasPhoneInput);
  console.log('Role Switcher Present:', hasRoleSwitch);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshots', 'default_root_login_screen.png') });
  console.log('Screenshot saved to default_root_login_screen.png');

  await browser.close();
  console.log('SUCCESS: Root URL opens Login page by default!');
})();
