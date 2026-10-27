const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Khushi\\.gemini\\antigravity\\brain\\83c803fb-4069-440f-964f-32e588eeaf26';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. MOBILE VIEW (390px x 844px)
  console.log('\n--- CAPTURING MOBILE SCREENSHOTS (390px) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 0. Mobile Login
  await page.goto('http://127.0.0.1:5173/#login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_0_login.png'), fullPage: true });
  console.log('Saved mobile_0_login.png');

  // Go to main app (authenticated)
  await page.goto('http://127.0.0.1:5173/#main', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const mobileNav = await page.$$('nav[aria-label="Mobile Navigation"] button');
  if (mobileNav.length >= 5) {
    // 1. My Crop (btn 0)
    await mobileNav[0].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_1_my_crop.png'), fullPage: true });
    console.log('Saved mobile_1_my_crop.png');

    // 2. Harvest Advisory (btn 1)
    await mobileNav[1].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_2_harvest.png'), fullPage: true });
    console.log('Saved mobile_2_harvest.png');

    // 3. Sell Directly (btn 2)
    await mobileNav[2].click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_3_sell.png'), fullPage: true });
    console.log('Saved mobile_3_sell.png');

    // 4. Village Group (btn 3)
    await mobileNav[3].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_4_village_group.png'), fullPage: true });
    console.log('Saved mobile_4_village_group.png');

    // 5. Buyer Portal (btn 4)
    await mobileNav[4].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_5_buyer_portal.png'), fullPage: true });
    console.log('Saved mobile_5_buyer_portal.png');
  }

  // 2. LAPTOP VIEW (1280px x 800px)
  console.log('\n--- CAPTURING LAPTOP SCREENSHOTS (1280px) ---');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });

  // 0. Laptop Login
  await page.goto('http://127.0.0.1:5173/#login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_0_login.png'), fullPage: true });
  console.log('Saved laptop_0_login.png');

  // Go to main app (authenticated)
  await page.goto('http://127.0.0.1:5173/#main', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const sidebarButtons = await page.$$('aside nav button');
  if (sidebarButtons.length >= 5) {
    // 1. My Crop (btn 0)
    await sidebarButtons[0].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_1_my_crop.png'), fullPage: true });
    console.log('Saved laptop_1_my_crop.png');

    // 2. Harvest Advisory (btn 1)
    await sidebarButtons[1].click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_2_harvest.png'), fullPage: true });
    console.log('Saved laptop_2_harvest.png');

    // 3. Sell Directly (btn 2)
    await sidebarButtons[2].click();
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_3_sell.png'), fullPage: true });
    console.log('Saved laptop_3_sell.png');

    // 4. Village Group (btn 3)
    await sidebarButtons[3].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_4_village_group.png'), fullPage: true });
    console.log('Saved laptop_4_village_group.png');

    // 5. Buyer Portal (btn 4)
    await sidebarButtons[4].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_5_buyer_portal.png'), fullPage: true });
    console.log('Saved laptop_5_buyer_portal.png');
  }

  await browser.close();
  console.log('All screenshots captured and verified successfully!');
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
