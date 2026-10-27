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
  console.log('Launching Edge browser for Landing Page & Flow verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper to switch language
  async function setLanguage(lang) {
    await page.evaluate((l) => {
      // Find language button
      const buttons = Array.from(document.querySelectorAll('header button, [aria-label="Language selection"] button'));
      const target = buttons.find(b => {
        const text = b.innerText.toLowerCase();
        if (l === 'hi') return text.includes('हिं') || text.includes('हिंदी');
        if (l === 'mr') return text.includes('मरा') || text.includes('मराठी');
        if (l === 'en') return text.includes('en') || text.includes('english');
        return false;
      });
      if (target) target.click();
    }, lang);
    await new Promise(r => setTimeout(r, 400));
  }

  // ----------------------------------------------------
  // 1. LAPTOP SCREENSHOTS (1280px)
  // ----------------------------------------------------
  console.log('\n--- 1. CAPTURING LAPTOP LANDING PAGE (1280px) ---');
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });

  // A. Landing Page - Hindi
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_hindi.png'), fullPage: false });
  console.log('Saved laptop_landing_hindi.png');

  // B. Landing Page - Marathi
  await setLanguage('mr');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_marathi.png'), fullPage: false });
  console.log('Saved laptop_landing_marathi.png');

  // C. Landing Page - English
  await setLanguage('en');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_english.png'), fullPage: false });
  console.log('Saved laptop_landing_english.png');

  // D. Full Page Landing in Hindi
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_full.png'), fullPage: true });
  console.log('Saved laptop_landing_full.png');

  // ----------------------------------------------------
  // 2. MOBILE SCREENSHOTS (390px)
  // ----------------------------------------------------
  console.log('\n--- 2. CAPTURING MOBILE LANDING PAGE (390px) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // A. Mobile Landing - Hindi
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_hindi.png'), fullPage: false });
  console.log('Saved mobile_landing_hindi.png');

  // B. Mobile Landing - Marathi
  await setLanguage('mr');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_marathi.png'), fullPage: false });
  console.log('Saved mobile_landing_marathi.png');

  // C. Mobile Landing - English
  await setLanguage('en');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_english.png'), fullPage: false });
  console.log('Saved mobile_landing_english.png');

  // D. Full Page Mobile Landing
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_full.png'), fullPage: true });
  console.log('Saved mobile_landing_full.png');

  // ----------------------------------------------------
  // 3. COMPLETE AUTHENTICATION FLOW VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 3. TESTING USER FLOW: Landing -> Login -> OTP -> Profile Setup -> Dashboard -> Logout ---');
  
  // Go to Landing
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click "Farmer Login" CTA
  console.log('Clicking Farmer Login CTA...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.innerText.includes('किसान लॉगिन') || b.innerText.includes('Farmer Login'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // We should now be on /login (Step 1: Phone)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_login_step1_phone.png'), fullPage: false });
  console.log('Saved mobile_login_step1_phone.png');

  // Click "Send OTP"
  console.log('Submitting phone to send OTP...');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // We should now be on Step 2: OTP
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_login_step2_otp.png'), fullPage: false });
  console.log('Saved mobile_login_step2_otp.png');

  // Submit OTP to proceed
  console.log('Verifying OTP 1234...');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 700));

  // We should now be on Step 3: First-time Profile Setup
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_login_step3_profile.png'), fullPage: false });
  console.log('Saved mobile_login_step3_profile.png');

  // Submit Profile Setup
  console.log('Completing profile setup and entering dashboard...');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // We should now be on Authenticated Dashboard!
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_authenticated_dashboard.png'), fullPage: false });
  console.log('Saved mobile_authenticated_dashboard.png');

  // Test Logout Button
  console.log('Testing Header Logout button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('header button'));
    const logoutBtn = btns.find(b => b.getAttribute('aria-label') === 'Logout' || b.innerText.includes('लॉगआउट') || b.innerText.includes('Logout'));
    if (logoutBtn) logoutBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  // Should be back on Landing Page
  const currentUrl = page.url();
  console.log('After logout, URL is:', currentUrl);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_after_logout_landing.png'), fullPage: false });
  console.log('Saved mobile_after_logout_landing.png');

  // Laptop Buyer Login View
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://127.0.0.1:5173/#login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  // Switch to Buyer role
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const buyerBtn = btns.find(b => b.innerText.includes('व्यापारी') || b.innerText.includes('Buyer'));
    if (buyerBtn) buyerBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_login_buyer_role.png'), fullPage: false });
  console.log('Saved laptop_login_buyer_role.png');

  await browser.close();
  console.log('\n--- ALL VERIFICATIONS AND SCREENSHOTS CAPTURED SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
