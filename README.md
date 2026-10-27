# Kisan Saathi (किसान साथी)
### Smart Harvesting & Direct Selling Portal for Indian Farmers
**Demo Location**: Hingna, Nagpur, Maharashtra | **Crop**: Soybean (*JS-335*)

---

## 🌾 Overview
**Kisan Saathi** is a production-quality, mobile-first and desktop-responsive web portal designed for Indian farmers. Inspired by premier Digital India government services (such as UMANG, PM-Kisan, and Agmarknet), it offers a clean, trustworthy design with trilingual support (**Hindi**, **Marathi**, and **English**), text-to-speech audio assistance via the Web Speech API, and a robust local mock layer backed by `localStorage`.

---

## 🎨 Design Direction & Standards
- **Aesthetic**: Premium Indian Government Portal (dignified, accessible, clean).
- **Tricolor Ribbon**: Thin Saffron (`#FF9933`), White (`#FFFFFF`), Green (`#138808`) accent bar at the very top.
- **Insignia**: Simple custom agricultural leaf badge in a circular gold frame (strictly no national emblems or Ashoka chakras).
- **Palette**:
  - **Deep Green** (`#14532D`): Primary header, active actions, success states.
  - **Navy** (`#0F2A44`): Primary headings, text, secondary actions.
  - **Muted Gold** (`#B8892B`): Accent underlines, key highlights, dividers.
  - **Cream Canvas** (`#F6F4EC`): Soft, high-readability background.
  - **White Cards**: Rounded `10px` radius, `1px` border, soft subtle shadows.
  - **Signal Colors**:
    - 🟢 Green (`#16A34A`): Safe to harvest / Above MSP.
    - 🟡 Amber (`#D97706`): Wait and watch / 12-15% moisture.
    - 🔴 Red (`#DC2626`): Do not harvest (rain risk) / High moisture rejection.
- **Typography**:
  - Headings & figures: *Source Serif 4* and *Noto Serif Devanagari*.
  - Body & UI: *Noto Sans Devanagari* and *Poppins* (minimum 18px body font for optimal rural readability).
- **Layout**:
  - **Mobile (390px)**: Bottom tab navigation bar with min 56px touch targets.
  - **Laptop (1280px)**: Left navigation sidebar with farmer summary badge, top dashboard summary banner (Days left, Today's signal, Mandi rate vs MSP, Pending net payments), and centered ~720px content area.
- **Accessibility**: Light/Dark mode, `prefers-reduced-motion` compliance, WCAG AA contrast, visible focus rings.

---

## 🚀 Key Features by Screen
0. **Login Screen (`/#login`)**:
   - Language selector buttons (Hindi default, Marathi, English).
   - Prefilled phone number (`9876543210`) & demo OTP (`1234`).
   - Direct link to Buyer & Trader registration.
1. **My Crop Screen**:
   - Crop selection cards: Soybean (97 days, MSP ₹4,892), Cotton (160 days, MSP ₹7,121), Wheat (120 days, MSP ₹2,425).
   - Editable sowing date (with auto-calculated harvest date) & location (Nagpur).
   - Government sample MSP disclaimer.
2. **Harvest Advisory Screen**:
   - Circular SVG progress ring with days remaining.
   - Prominent signal banner with one-line advice (*"कल तेज बारिश का अनुमान है, कटाई मत करो"*).
   - 7-day weather strip with rain chances (rain on days 3 & 4), temperature, condition icons, and daily signal dots.
   - Grain moisture checker with interactive slider (<=12% green, 12-15% amber, >15% red), drying tips, and policy notes.
   - SMS and WhatsApp reminder toggles.
3. **Sell Directly Screen**:
   - **MSP Registration Checklist**: 4-point readiness checklist (7/12 Land Record, Aadhaar, Bank Passbook, Mobile) with progress tracking.
   - **Mandi Rate & Recharts Trend**: ₹4,680/Q today's price with 7-day trend and dashed MSP reference line (₹4,892).
   - **List for Sale**: Quantity in quintals and asking rate inputs.
   - **Buyer Offers**: Realistic offers with direct Call (`tel:`), WhatsApp (`wa.me`), Accept, and Decline actions.
   - **Payment & Handling Cost Tracker**: Auto-calculates Net In Hand payout after deducting labour and transport expenses.
4. **Village Group Screen**:
   - Auto-joined by village (*Hingna, Nagpur*).
   - Bulk consolidation: *"This week: 8 farmers, 150 quintal"* with progress bar towards 200 quintals for a 30% transport discount.
   - Group leader details and scheduled pickup date.
   - "Join the Lot" form to pledge additional quantity.
   - Shared ledger table with zebra striping, quantities, quality grades (Grade A / Grade B), and payment share percentages.
5. **Buyer Portal Screen (`/buyer` or navigation)**:
   - Trader / Aggregator registration form.
   - Browse verified nearby farmer harvest lots.
   - Instant phone call and WhatsApp inquiry buttons.
   - "Send Offer" form that immediately synchronizes an offer to the farmer's inbox.
6. **Voice Synthesis**:
   - Header speaker button reads screen summaries aloud in `hi-IN`, `mr-IN`, or `en-IN` via the Web Speech API.

---

## 🔄 Swapping Mock Data for Real APIs

All mock datasets and persistence functions are encapsulated in `src/services/mockData.ts` with strict TypeScript types in `src/types/index.ts`. Here is how each module can be connected to real production APIs:

### 1. Weather & Rainfall Forecast (OpenWeatherMap / IMD API)
In `src/services/mockData.ts`, replace `INITIAL_WEATHER_7_DAYS` with an asynchronous service call:
```typescript
export async function fetchLiveWeather(lat: number = 21.1458, lon: number = 79.0882): Promise<WeatherDay[]> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await res.json();
  
  // Transform 5-day / 3-hour forecast into daily aggregates:
  return data.list.filter((_, idx) => idx % 8 === 0).map((item) => {
    const rainChance = Math.round((item.pop || 0) * 100);
    const signal = rainChance >= 50 ? 'red' : rainChance >= 20 ? 'amber' : 'green';
    return {
      date: new Date(item.dt * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      rainChance,
      tempMax: Math.round(item.main.temp_max),
      tempMin: Math.round(item.main.temp_min),
      condition: item.weather[0].main.toLowerCase(),
      signal,
      signalAdvice: {
        hi: rainChance >= 50 ? 'बारिश की संभावना है, कटाई स्थगित रखें।' : 'मौसम साफ है, कटाई सुरक्षित है।',
        mr: rainChance >= 50 ? 'पावसाची शक्यता आहे, कापणी थांबवा.' : 'हवामान स्वच्छ आहे, कापणी करा.',
        en: rainChance >= 50 ? 'Rain expected, delay harvest operations.' : 'Clear weather, safe to harvest.'
      }
    };
  });
}
```

### 2. Live Mandi Rates (Agmarknet / data.gov.in API)
Connect to the Government of India Open Data APMC API (`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`):
```typescript
export async function fetchMandiPrice(commodity: string = 'Soyabean', market: string = 'Nagpur'): Promise<number> {
  const apiKey = import.meta.env.VITE_DATAGOV_API_KEY;
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[market]=${market}&filters[commodity]=${commodity}`;
  const response = await fetch(url);
  const json = await response.json();
  const latestRecord = json.records[0];
  return parseFloat(latestRecord.modal_price);
}
```

### 3. Official MSP List (Commission for Agricultural Costs & Prices - CACP)
Fetch government-notified Minimum Support Prices from a hosted endpoint or Ministry of Agriculture JSON feed:
```typescript
export async function fetchOfficialMSP(cropId: string): Promise<number> {
  const res = await fetch('https://api.agricoop.gov.in/v1/msp-notifications/2026-27');
  const mspTable = await res.json();
  return mspTable[cropId] || 4892;
}
```

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository and navigate into folder
cd SHP

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📄 Academic Field Study Notice
> *Prototype developed for academic field study and human-centered design evaluation in Vidarbha, Maharashtra. Not an official government application.*
