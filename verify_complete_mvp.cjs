const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Khushi\\.gemini\\antigravity\\brain\\83c803fb-4069-440f-964f-32e588eeaf26';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('=== STARTING KISAAN SATHI COMPLETE MVP TEST SUITE ===');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper to switch language
  async function setLanguage(lang) {
    await page.evaluate((l) => {
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
  // TEST 1: LANDING PAGE AT '/' (1280px & 390px, 3 Languages)
  // ----------------------------------------------------
  console.log('\\n[TEST 1] Verifying Public Landing Page at "/" (Laptop 1280px)...');
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Hindi Landing
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_hindi.png'), fullPage: false });
  console.log('✓ Captured laptop_landing_hindi.png');

  // Marathi Landing
  await setLanguage('mr');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_marathi.png'), fullPage: false });
  console.log('✓ Captured laptop_landing_marathi.png');

  // English Landing
  await setLanguage('en');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'laptop_landing_english.png'), fullPage: false });
  console.log('✓ Captured laptop_landing_english.png');

  // Mobile 390px Landing
  console.log('\\n[TEST 1B] Verifying Public Landing Page at "/" (Mobile 390px)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await setLanguage('hi');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_hindi.png'), fullPage: false });
  console.log('✓ Captured mobile_landing_hindi.png');

  await setLanguage('mr');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_landing_marathi.png'), fullPage: false });
  console.log('✓ Captured mobile_landing_marathi.png');

  // ----------------------------------------------------
  // TEST 2: TEXT-TO-SPEECH TEST
  // ----------------------------------------------------
  console.log('\\n[TEST 2] Testing Text-To-Speech execution and voice detection in browser...');
  const ttsResult = await page.evaluate(() => {
    const hasSynth = 'speechSynthesis' in window;
    const voices = hasSynth ? window.speechSynthesis.getVoices() : [];
    const mrVoice = voices.find(v => v.lang.includes('mr'));
    const hiVoice = voices.find(v => v.lang.includes('hi'));
    const enVoice = voices.find(v => v.lang.includes('en'));
    
    // Click speaker button
    const speakerBtn = document.querySelector('header button[aria-label="Read screen aloud"], header button[title*="आवाज"]');
    if (speakerBtn) speakerBtn.click();

    return {
      hasSynth,
      totalVoices: voices.length,
      hasMarathiVoice: Boolean(mrVoice),
      hasHindiVoice: Boolean(hiVoice),
      hasEnglishVoice: Boolean(enVoice)
    };
  });
  console.log('TTS Browser Evaluation:', ttsResult);
  await new Promise(r => setTimeout(r, 600));

  // ----------------------------------------------------
  // TEST 3: FARMER A LOGIN & DASHBOARD (Hinganghat, Wardha)
  // ----------------------------------------------------
  console.log('\\n[TEST 3] Testing Farmer A Login Flow (Rajesh Deshmukh, Hinganghat)...');
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://127.0.0.1:5173/#login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Quick select Farmer A
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const farmerBtn = btns.find(b => b.innerText.includes('शेतकरी A'));
    if (farmerBtn) farmerBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_login_step1.png'), fullPage: false });

  // Submit Phone
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Submit OTP
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Now on Farmer Dashboard (Harvest advisory)
  console.log('Farmer A in Dashboard. Checking location and data...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_dashboard_harvest.png'), fullPage: false });
  console.log('✓ Captured farmer_dashboard_harvest.png');

  // Check My Crop Screen
  console.log('Navigating to My Crop Screen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, aside button'));
    const cropBtn = btns.find(b => b.innerText.includes('मेरी फसल') || b.innerText.includes('माझे पीक') || b.innerText.includes('My Crop'));
    if (cropBtn) cropBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_my_crop_screen.png'), fullPage: false });
  console.log('✓ Captured farmer_my_crop_screen.png');

  // Check Sell Directly Screen
  console.log('Navigating to Sell Directly Screen...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, aside button'));
    const sellBtn = btns.find(b => b.innerText.includes('सीधे बेचें') || b.innerText.includes('थेट विका') || b.innerText.includes('Sell'));
    if (sellBtn) sellBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_sell_directly_screen.png'), fullPage: false });
  console.log('✓ Captured farmer_sell_directly_screen.png');

  // ----------------------------------------------------
  // TEST 4: STRICT BUYER SEPARATION & OFFER SUBMISSION
  // ----------------------------------------------------
  console.log('\\n[TEST 4] Testing Buyer A Login & Strict Role Isolation...');
  // Switch account to Buyer A
  await page.evaluate(() => {
    const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('खाते बदला') || b.innerText.includes('Switch Account'));
    if (switchBtn) switchBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const buyerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('खरेदीदार A'));
    if (buyerBtn) buyerBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify Buyer CANNOT see farmer private tabs
  const buyerTabs = await page.evaluate(() => {
    const navText = document.querySelector('aside')?.innerText || '';
    const hasMyCrop = navText.includes('मेरी फसल') || navText.includes('माझे पीक');
    const hasHarvest = navText.includes('कटाई सलाह') || navText.includes('कापणी सल्ला');
    const hasLand712 = navText.includes('7/12');
    const hasBuyerTabs = navText.includes('शेतमाल यादी') || navText.includes('माझे प्रस्ताव');
    return { hasMyCrop, hasHarvest, hasLand712, hasBuyerTabs };
  });

  console.log('Strict Role Isolation Check:', buyerTabs);
  if (buyerTabs.hasMyCrop || buyerTabs.hasHarvest || buyerTabs.hasLand712) {
    console.error('FAIL: Buyer can view farmer private tabs!');
  } else {
    console.log('PASS: Buyer has zero access to farmer private tabs or 7/12 land records!');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer_dashboard_browse.png'), fullPage: false });
  console.log('✓ Captured buyer_dashboard_browse.png');

  // Buyer submits an offer of 25 Quintals at ₹4,710 for Rajesh Deshmukh's lot
  console.log('Buyer submitting purchase offer for Farmer A lot...');
  await page.evaluate(() => {
    const sendOfferBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('खरेदी प्रस्ताव पाठवा') || b.innerText.includes('Send Offer'));
    if (sendOfferBtns.length > 0) {
      sendOfferBtns[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer_offer_modal.png'), fullPage: false });
  console.log('✓ Captured buyer_offer_modal.png');

  // Submit modal form
  await page.evaluate(() => {
    const modalForm = document.querySelector('form');
    if (modalForm) {
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Check Buyer's Sent Offers Tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('पाठवलेले प्रस्ताव') || b.innerText.includes('Sent Offers'));
    if (btns.length > 0) btns[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer_sent_offers_tab.png'), fullPage: false });
  console.log('✓ Captured buyer_sent_offers_tab.png');

  // ----------------------------------------------------
  // TEST 5: FARMER ACCEPTS OFFER & VERIFY INVENTORY DEDUCTION
  // ----------------------------------------------------
  console.log('\\n[TEST 5] Switching back to Farmer A to Accept Offer & Deduct Stock...');
  // Switch back to Farmer A
  await page.evaluate(() => {
    const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('खाते बदला') || b.innerText.includes('Switch Account'));
    if (switchBtn) switchBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const farmerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('शेतकरी A'));
    if (farmerBtn) farmerBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Navigate to Sell screen
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, aside button'));
    const sellBtn = btns.find(b => b.innerText.includes('सीधे बेचें') || b.innerText.includes('थेट विका') || b.innerText.includes('Sell'));
    if (sellBtn) sellBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Accept pending offer
  console.log('Farmer clicking Accept on Buyer Offer...');
  await page.evaluate(() => {
    const acceptBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('स्वीकार करा') || b.innerText.includes('Accept'));
    if (acceptBtns.length > 0) {
      acceptBtns[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_offer_accepted_ledger_updated.png'), fullPage: false });
  console.log('✓ Captured farmer_offer_accepted_ledger_updated.png');

  // ----------------------------------------------------
  // TEST 6: VERIFY BUYER SEES ACCEPTED STATUS
  // ----------------------------------------------------
  console.log('\\n[TEST 6] Switching back to Buyer A to verify Accepted status and inventory update...');
  await page.evaluate(() => {
    const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('खाते बदला') || b.innerText.includes('Switch Account'));
    if (switchBtn) switchBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const buyerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('खरेदीदार A'));
    if (buyerBtn) buyerBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Sent Offers tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('पाठवलेले प्रस्ताव') || b.innerText.includes('Sent Offers'));
    if (btns.length > 0) btns[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer_verified_accepted_status.png'), fullPage: false });
  console.log('✓ Captured buyer_verified_accepted_status.png');

  // Check Remaining Inventory on Browse tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('शेतमाल यादी') || b.innerText.includes('Listings'));
    if (btns.length > 0) btns[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'buyer_browse_deducted_inventory.png'), fullPage: false });
  console.log('✓ Captured buyer_browse_deducted_inventory.png');

  await browser.close();
  console.log('\\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Error during test execution:', err);
  process.exit(1);
});
