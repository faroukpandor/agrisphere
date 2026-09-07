'use strict';

/**
 * AgriSphere module D — market-research-driven additions (R17/R3) and
 * platform-intent triggers for the v3 feature set (R5/R8/R9/R10/R15, USSD).
 */

const prices = require('./prices');
const notify = require('./notify');

const D = '⚠️ General guidance — confirm with local extension/veterinary officers, technical manuals and current regulations before investing.';

function buttons(list) { return list.map((label) => ({ label })); }

module.exports = {
  triggers: [
    {
      id: 'prices-now',
      keys: ['latest prices', 'price bulletin', 'current prices', 'price list', 'price today', 'today prices', 'official prices', 'bamb prices', 'prices', 'what are the latest prices', 'show me the latest prices', 'what are prices', 'current market prices', 'what is the price', 'price'],
      answer() {
        const refs = prices.latestByItem();
        const block = refs.length
          ? '📊 Latest official references loaded:\n' + refs.slice(0, 6).map((r) => `• ${r.item} (${r.unit || 'unit'}): ${r.price} — ${r.source}, ${r.date}${r.area ? ' (' + r.area + ')' : ''}`).join('\n') + '\n'
          : '';
        return '💰 PRICES — honesty rule: no invented figures.\n\n' + block +
          'Authoritative sources: BAMB depot price bulletins (bamb.co.bw / depot noticeboards), BMC schedules, and your extension officer. Prices move weekly and by depot/grade — always confirm before you sell.\n\n' +
          'On the web app, open the Prices page for the reference board. Admins load bulletin figures with date + source.';
      },
    },
    {
      id: 'verify-menu',
      keys: ['verify my account', 'verify account', 'verified badge', 'become verified', 'otp', 'verification code', 'verify my phone', 'phone verification', 'verify', 'verification'],
      answer() {
        return '✅ VERIFIED BADGE (trust layer):\n\n' +
          '• On the web app, open Profile/Verify (the badge icon) or the Marketplace page → "Verify your phone".\n' +
          '• You enter your phone number, we send a one-time code (SMS/dev-log in preview), you confirm — your listings, programme applications and reviews then carry a ✔ verified badge.\n' +
          '• Why it matters: buyers trust verified farmers; farmers trust verified buyers; verified users get priority in programme applications. Organisations additionally get verified by the admin team against their registration docs.\n' +
          '• Consent-first: verification uses your number only to confirm identity; we never publish it without your choice.';
      },
      buttons: buttons(['🌾 Marketplace', '🤝 Buyer programmes']),
    },
    {
      id: 'org-menu',
      keys: ['organisation account', 'organisation page', 'create an organisation', 'register my co-op', 'co-op workspace', 'cooperative workspace', 'api key', 'org account', 'organisation', 'org registration', 'co op workspace'],
      answer() {
        return '🏢 ORGANISATIONS & CO-OP WORKSPACES:\n\n' +
          '• Buyers, co-ops, NGOs, extension offices, insurers and input suppliers register an organisation on the web app (/org.html) — one account to run programmes, a storefront, and (with a licence) API access.\n' +
          '• Co-ops can act as one workspace: pooled listings, group programme applications, shared records — the union/co-op door for partners like BAMCU.\n' +
          '• Registration gives you an API key (shown once — keep it secret) and an asset dashboard: your programmes, listings, experiences and applications in one place.\n' +
          '• Organisations may be marked ✔ verified by the admin team after a document check.\n\n' +
          'Farmer-facing features stay free; organisation tiers fund the platform (see docs/MONETISATION.md).';
      },
      buttons: buttons(['🤝 Buyer programmes', '💡 Business model', '📜 Compliance']),
    },
    {
      id: 'alerts-menu',
      keys: ['price alerts', 'alerts', 'alert me', 'notifications', 'subscribe alerts', 'set an alert', 'remind me', 'milestone reminders', 'set price alert', 'subscribe'],
      answer() {
        return '🔔 ALERTS & REMINDERS:\n\n' +
          '• On the web app, open the Alerts section (prices page): subscribe a keyword (e.g. "maize", "groundnuts", "programme") + your channel (WhatsApp/SMS/Telegram) + phone.\n' +
          '• When the admin loads a matching official price reference, or your programme milestones/deliveries change, we ping you.\n' +
          '• Programme owners: milestone reminders keep your farmer groups on the stage-gated plan.\n' +
          '• No spam, ever: alerts only fire for keywords you chose or assets you own; unsubscribe anytime.';
      },
      buttons: buttons(['💰 Prices', '🤝 Buyer programmes']),
    },
    {
      id: 'compliance-menu',
      keys: ['compliance pack', 'export certificate', 'readiness pack', 'batch record export', 'quality certificate', 'certificate ready', 'compliance documents', 'readiness pack for export'],
      answer() {
        return '📜 COMPLIANCE READINESS PACK (self-declared, export-ready):\n\n' +
          '• On the web app, open your buyer programme → "Compliance pack". AgriSphere assembles: programme terms, producer details, delivery & batch records, and a self-assessed checklist aligned to international practice (Codex GAP basics, GlobalG.A.P.-style traceability & labour points, WOAH welfare for livestock).\n' +
          '• Output is a printable readiness pack for buyers/exporters — proof of discipline, not a certificate.\n' +
          '• Official certification (GlobalG.A.P., organic, phytosanitary) still requires accredited audits — the pack shortens that road.\n\n' +
          'Ask me to teach the topics behind it: food safety, traceability, export readiness.';
      },
      buttons: buttons(['🧼 Food safety', '🔎 Traceability', '🛃 Export readiness']),
    },
    {
      id: 'ussd-menu',
      keys: ['ussd', 'dial code', 'star code', 'feature phone', 'sedilame', 'sms menu', 'phone menu', 'how do i use ussd', 'dial ussd', 'ussd code'],
      answer() {
        return '📟 USSD / EVERY-PHONE ACCESS:\n\n' +
          '• AgriSphere has a USSD menu engine: dial the gateway code (when your network launches it) to get: 1 Ask · 2 Prices · 3 Programmes · 4 Marketplace · 5 Teach · 6 Help — on any phone, even a basic one.\n' +
          '• The engine speaks the standard gateway protocol, so any USSD aggregator or network can switch it on; a web simulator lives at /ussd.html so you can try the menu today.\n' +
          '• Same brain, same memory as WhatsApp & the web — teach it once on USSD and the web learns it too.';
      },
      buttons: buttons(['🧠 How do you learn?', '📱 Channels']),
    },
  ],

  entries: [
    {
      id: 'hort-melons',
      title: 'Melons & watermelons (spanspek)',
      category: 'crop',
      keywords: ['melon', 'melons', 'watermelon', 'spanspek', 'sweet melon', 'fruit fly', 'powdery mildew', 'cucurbits'],
      questions: ['how to grow watermelons', 'melon production botswana', 'spanspek farming', 'watermelon spacing and irrigation'],
      answer() {
        return '🍉 MELONS & WATERMELON (spanspek):\n\n' +
          '• High-demand summer crop with a strong Nov–Apr market window (festive peaks pay best). Needs irrigation or good summer rains and sandy-loam, well-drained soil.\n' +
          '• Plant on ridges/beds after frost risk ends: spacing ~1.5–2 m between rows × 0.6–1 m in-row for spreading types; use drip + mulch to save water and keep fruit clean.\n' +
          '• Bees pollinate — keep flowering friendly (see pollinators topic) or place hives at field edge for better set.\n' +
          '• Feed: compost/manure base + balanced fertiliser; cut nitrogen at fruiting to avoid lush vines with few fruits.\n' +
          '• Watch: fruit fly (sting marks, rotting) — bait sprays/traps early; powdery mildew in humid spells — airflow, resistant varieties, preventive sprays per your adviser.\n' +
          '• Harvest at full maturity signs (tendril dry, dull thump, ground spot yellow); handle gently, cool fast; grade by size for market.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'CCARDESA/CTA practice notes', 'Botswana Ministry of Agriculture'],
    },
    {
      id: 'hort-onions',
      title: 'Onions & garlic production',
      category: 'crop',
      keywords: ['onion', 'onions', 'garlic', 'allium', 'bulb', 'onion sets', 'curing onions', 'thrips', 'purple blotch'],
      questions: ['how to grow onions', 'onion production botswana', 'garlic growing guide', 'onion curing and storage', 'onion market'],
      answer() {
        return '🧅 ONIONS & GARLIC:\n\n' +
          '• Onions are a dependable irrigated cash crop with year-round demand from households, shops and hotels; garlic earns premium but needs good soil prep.\n' +
          '• Nursery or sets: raise seedlings 6–8 weeks for transplants, or plant sets; spacing ~10 cm in-row on ridges/beds, 30–40 cm beds.\n' +
          '• Soil: loose, fertile, pH 6–7; onions are shallow-rooted — consistent moisture, no waterlogging (rots!).\n' +
          '• Feed: balanced N-P-K early; stop nitrogen when bulbs start swelling so they size instead of leafing.\n' +
          '• Watch: thrips (silvery streaks — small insects in the neck), purple blotch in wet weather; rotate alliums 3+ years against soil disease.\n' +
          '• Harvest when tops fall over and dry; cure 2–3 weeks in shade with airflow — curing is the difference between 3 weeks and 6 months of storage.\n' +
          '• Grade and bag cleanly; sell by size class — supermarkets pay for uniform medium-large bulbs.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'Botswana Ministry of Agriculture'],
    },
    {
      id: 'hort-chilli',
      title: 'Chilli & pepper production',
      category: 'crop',
      keywords: ['chilli', 'chillies', 'pepper', 'peppers', 'hot pepper', 'bell pepper', 'capsicum', 'chilli drying'],
      questions: ['how to grow chillies', 'pepper production guide', 'chilli drying and value addition', 'chilli market botswana'],
      answer() {
        return '🌶️ CHILLI & PEPPERS:\n\n' +
          '• High-value per hectare, suits smallholders; chillies tolerate heat well and dried chilli travels & stores — good for value addition.\n' +
          '• Nursery 5–7 weeks; transplant at 4–6 true leaves, spacing 45–60 cm; stake/twine for big-fruited types.\n' +
          '• Irrigation: steady moisture; stress at flowering drops yield — mulch heavily in hot months.\n' +
          '• Feed: balanced compound at planting + potassium at fruiting; avoid excess nitrogen (leafy, few fruits).\n' +
          '• Pests: aphids (early), fruit fly and borer on fruit — traps + selective sprays per your adviser; remove infected fruit daily.\n' +
          '• Harvest green or ripe-red (red = spicier, more vitamins, higher price); pick regularly to keep plants producing.\n' +
          '• Value-add: sun-dry/oven-dry clean fruit into flakes/powder with sealed packaging — restaurant and retail demand is real; label honestly.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'CABI peer-reviewed compendia'],
    },
    {
      id: 'fruit-citrus',
      title: 'Citrus production (oranges, lemons, naartjies)',
      category: 'crop',
      keywords: ['citrus', 'orange', 'oranges', 'lemon', 'lemons', 'naartjie', 'tangerine', 'grapefruit', 'citrus greening', 'fruit fly citrus', 'citrus nursery'],
      questions: ['how to grow citrus', 'citrus production botswana', 'orange tree care', 'citrus greening disease', 'lemon farming'],
      answer() {
        return '🍊 CITRUS (oranges, lemons, naartjies):\n\n' +
          '• Botswana has pockets of proven citrus (e.g. Tuli block); trees need irrigation in our climate + frost protection where winter frost occurs.\n' +
          '• Buy certified, grafted trees from registered nurseries (rootstock matters for soil & disease tolerance); plant in well-drained soil, basins + mulch.\n' +
          '• Spacing ~4–6 m; prune to an open shape; feed 3–4×/year (N mainly) with micronutrients (zinc, iron — yellow new leaves are a clue).\n' +
          '• Water deeply but not too often; citrus hates waterlogging AND long dry spells at fruit swell.\n' +
          '• Threats: fruit fly (traps + bait sprays), citrus greening (a serious disease spread by a tiny psyllid — report suspicious yellowed, lopsided fruit to extension), and scale/ants.\n' +
          '• Harvest by colour + taste, clip (don\'t pull) fruit, grade; market fresh locally, or juice/value-add seconds.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'CABI peer-reviewed compendia', 'Botswana Ministry of Agriculture'],
    },
    {
      id: 'hort-potato',
      title: 'Irish potato production',
      category: 'crop',
      keywords: ['potato', 'potatoes', 'irish potato', 'seed potato', 'tubers', 'late blight potato', 'potato storage'],
      questions: ['how to grow potatoes', 'irish potato production', 'seed potato buying', 'potato blight control', 'potato farming botswana'],
      answer() {
        return '🥔 IRISH POTATO:\n\n' +
          '• Strong market (chips/fries, households) — but certified seed is expensive, so plan quality: only buy certified seed potato from registered suppliers (farm-saved tubers carry disease).\n' +
          '• Plant in well-drained, loose soil on ridges; spacing ~75 cm rows × 25–30 cm; chit (pre-sprout) seed before planting.\n' +
          '• Irrigate consistently — irregular water = knobbly, cracked, hollow tubers. Feed N-P-K balanced; potassium matters for tuber quality.\n' +
          '• Late blight is the killer (same family as tomato blight): preventive fungicide programme per your adviser in wet spells; remove infected plants fast; never store wet tubers.\n' +
          '• Harvest when skins set (scrub test) — dig gently, cure in shade a week, store cool, dark and ventilated; green tubers are toxic — cull them.\n' +
          '• Grade by size: chips market wants large uniform; household wants medium — know your buyer before harvest.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'CABI peer-reviewed compendia', 'Botswana Ministry of Agriculture'],
    },
    {
      id: 'prod-game',
      title: 'Game ranching & conservancies',
      category: 'production',
      keywords: ['game', 'game farming', 'ranching', 'conservancy', 'wildlife ranching', 'antelope', 'impala', 'kudu', 'gemsbok', 'hunting quota', 'photographic tourism', 'dwnp', 'game license'],
      questions: ['how to start game farming', 'wildlife ranching botswana', 'conservancy business model', 'game meat production', 'hunting quota system'],
      answer() {
        return '🦌 GAME RANCHING & CONSERVANCIES:\n\n' +
          '• Wildlife ranching turns indigenous species into income: game meat, live sales to other ranches, hunting quotas (where lawful) and photographic tourism. Native game is drought-adapted — often hardier than cattle on the same veld.\n' +
          '• Legal first: game and hunting are regulated — licences, quotas and fencing standards come from the wildlife authorities (Department of Wildlife & National Parks); fence per wildlife standards or you will be in breach fast.\n' +
          '• Stocking & species: match species to habitat & carrying capacity (impala, kudu, gemsbok, wildebeest, zebra each have preferences); overstocking degrades veld exactly like cattle.\n' +
          '• Mixed model earns: hunting quotas bring high-value low-volume income; live sales & game meat supply venison markets; photographic tourism adds recurring revenue — the blend smooths seasons.\n' +
          '• Community route: CBNRM trusts let communities own wildlife use & benefit — joining/forming one can open land, licences and tourism markets.\n' +
          '• Health: game diseases (e.g. TB in buffalo areas) need vet guidance; fencing must balance containment with wildlife movement corridors.\n' +
          '• Insurance & security: poaching, escapes and drought are real risks — plan for all three.\n\n' + D;
      },
      sources: ['IUCN guidelines', 'Botswana wildlife legislation', 'FAO'],
    },
    {
      id: 'soil-testing',
      title: 'Soil sampling & reading results',
      category: 'nrm',
      keywords: ['soil test', 'soil testing', 'soil sampling', 'soil analysis', 'ph', 'npk soil', 'organic matter test', 'soil lab', 'interpret soil results', 'sampling method'],
      questions: ['how to take a soil sample', 'where to test soil in botswana', 'how to read soil test results', 'soil ph testing', 'when to soil test'],
      answer() {
        return '🧪 SOIL SAMPLING & RESULTS (do it right or it\'s money wasted):\n\n' +
          '• Sample at the right time: after harvest or before planting, same season window each time for comparability. Labs: DAR Sebele, BUAN, private labs (P50–P150/sample typically).\n' +
          '• Correct sampling: walk the field in a W/Z pattern, take 15–20 cores 0–20 cm (plus 20–40 cm for deeper crops), mix in a clean bucket, take ~1 kg subsample — label field, date, depth, crop history.\n' +
          '• Separate obvious zones (sandy patch vs clay, old kraal site) — one sample per uniform area, never mix them.\n' +
          '• Reading results: pH (target ~5.5–7 for most crops — outside that, nutrients lock up), organic matter % (low = add manure/compost), N-P-K and micronutrients in mg/kg with interpretation ranges on the lab sheet.\n' +
          '• Apply the report: fertiliser recommendation follows from crop + target yield — cheaper than blanket buying. Re-test every 2–3 years on the same field.\n' +
          '• Keep results in your records — they become part of your traceability story for buyers.\n\n' + D;
      },
      sources: ['FAO technical guidelines', 'Botswana Ministry of Agriculture / DAR'],
    },
    {
      id: 'storage-hermetic',
      title: 'Hermetic storage & silos',
      category: 'quality',
      keywords: ['hermetic', 'hermetic bags', 'pics', 'metal silo', 'silo', 'grain storage tech', 'cocoon', 'oxygen free', 'storage pests', 'super grain bag'],
      questions: ['hermetic grain storage', 'metal silos vs bags', 'storage without chemicals', 'pics bags how to use', 'long term grain storage'],
      answer() {
        return '🛢️ HERMETIC STORAGE & SILOS (chemical-free grain protection):\n\n' +
          '• Hermetic = airtight: sealed bags/containers let the grain\'s own respiration consume oxygen, killing weevils & mould without chemicals — ideal for food-grade grain.\n' +
          '• Options: hermetic bags (e.g. PICS/SuperGrain — double/triple bags), cocoons (large volumes), metal silos and sealed drums. Cost per tonne falls as volume rises.\n' +
          '• Golden rules: grain must be DRY (≤12.5% moisture) before sealing — hermetic cannot fix wet grain; fill fast, seal properly, check seals monthly; keep off the ground on pallets.\n' +
          '• Metal silos: one-time cost, decades of life, rodent-proof, easy fumigation access — excellent for larger farmers & groups; group/co-op silos share cost.\n' +
          '• Benefits: store past the harvest glut and sell when prices rise; keep quality for BAMB grading & buyer specs; protect seed for next season.\n' +
          '• Never open hermetic storage unnecessarily — every opening resets the clock; empty and clean before refilling.\n\n' + D;
      },
      sources: ['FAO SDG 12.3 food-loss work', 'Purdue Improved Crop Storage research', 'CCARDESA practice notes'],
    },
    {
      id: 'finance-insurance',
      title: 'Agricultural insurance options',
      category: 'finance',
      keywords: ['insurance', 'crop insurance', 'livestock insurance', 'index insurance', 'weather insurance', 'insured', 'premium', 'payout', 'mutual insurance', 'risk cover'],
      questions: ['crop insurance botswana', 'livestock insurance options', 'index based insurance how it works', 'insurance for smallholder farmers', 'drought insurance payout'],
      answer() {
        return '🛡️ AGRICULTURAL INSURANCE:\n\n' +
          '• Insurance converts catastrophic risk (drought, hail, fire, disease) into a known annual cost — the only tool that keeps a farm alive after a disaster. Smallholders often qualify for subsidised products — ask your extension officer what is available in your district before disaster.\n' +
          '• Types: (1) indemnity (payout on assessed damage — precise but slow & costly to assess); (2) index-based (payout triggered by weather/area index, e.g. rainfall shortfall — fast, low-cost, right-sized for smallholders); (3) livestock (death, disease, sometimes drought culling); (4) mutual/aid pools (community or co-op run).\n' +
          '• Read the policy honestly: what triggers payout, exclusions, waiting periods, claim deadlines — index products can pay when your field is fine or not pay when your field fails (basis risk); know it before buying.\n' +
          '• Records multiply value: farms with planting dates, photos and yield records claim faster and sometimes get better terms.\n' +
          '• Combine layers: insurance for the catastrophe + your own contingency fund (10% of sales) + diversified enterprises for the middle.\n' +
          '• Verify the provider is licensed by the regulator (non-bank financial institutions authority) and read cancellation rules.\n\n' + D;
      },
      sources: ['IFAD & development finance studies', 'Pula-style index insurance evidence', 'Botswana regulators'],
    },
    {
      id: 'market-calendar',
      title: 'Build your market calendar',
      category: 'market',
      keywords: ['market calendar', 'selling calendar', 'when to sell', 'seasonal prices', 'festive demand', 'price seasons', 'market windows', 'planting for market'],
      questions: ['when is the best time to sell', 'market calendar for farmers', 'seasonal price patterns botswana', 'festive season farm sales', 'planning crops for market windows'],
      answer() {
        return '🗓️ BUILD YOUR MARKET CALENDAR (sell when the price smiles):\n\n' +
          '• Prices swing predictably: gluts at harvest (low prices) and scarcity late-season (high). The calendar maps WHEN to plant, store and sell — one page that earns more than many inputs.\n' +
          '• Festive peaks: Christmas/New Year (poultry, eggs, tomatoes, cabbage, melons, lamb & goat), Easter (same push), winter (leafy veg demand dips? no — brassicas peak), school opening months (snack crops).\n' +
          '• Grains: BAMB depot prices firm through the season as stocks tighten — storage (see hermetic topic) lets you sell into the rise; check bulletin trends each year.\n' +
          '• Vegetables: succession planting every 2–3 weeks smooths supply so you are not dumping at glut prices; target the 2-week festive windows with your biggest plantings.\n' +
          '• Livestock: demand for goats/sheep jumps before festive holidays — time sales; cattle prices respond to drought/veld condition.\n' +
          '• Build yours: track every sale (date, price, buyer) for 2 seasons — your own data beats any advice; note market days in nearby towns.\n\n' + D;
      },
      sources: ['BAMB bulletin trends', 'CCARDESA practice notes', 'local market observations'],
    },
    {
      id: 'tourism-opportunity',
      title: 'Agritourism on your farm (start here)',
      category: 'business',
      keywords: ['agritourism start', 'farm tourism start', 'open farm to visitors', 'farm stay guide', 'tourism licence', 'hospitality farm', 'agri tourism steps'],
      questions: ['how to start agritourism', 'farm stay requirements botswana', 'agritourism licensing', 'what can I offer tourists on my farm', 'tourism guidelines botswana'],
      answer() {
        return '🧭 AGRI-TOURISM ON YOUR FARM — honest starter guide:\n\n' +
          '• Agritourism is a real but fledgling sector in Botswana (research shows strong willingness, real constraints: licensing, capital, market access). Start as an ADD-ON to farming income, not a replacement.\n' +
          '• Start smallest: host visitors you can already serve — farm walk + milking demo + tea (half day), school groups, harvest days, birding on your dam. Prove demand before building chalets.\n' +
          '• Compliance first: tourism/guesthouse registration, municipal land-use & building rules, food-safety if serving meals, public liability insurance — visit the tourism board & your district office and LIST the licences you need (bureaucracy is the #1 cited constraint — start early).\n' +
          '• Safety: access road honesty, first aid, fences/gates, water safety if dams, and clear emergency numbers for guests.\n' +
          '• Pricing: cost the day honestly (your time, food, helpers, wear) + 15–20% margin; benchmark lodge day-visit prices.\n' +
          '• Channel: list on the AgriSphere tourism board (free) + local tourism offices; photos sell — take good ones.\n' +
          '• Community route: partner with a local CBNRM trust or community campsite for packages — they have the tourism licences & client lists.\n\n' + D;
      },
      sources: ['Agritourism research (Okavango Delta studies)', 'Botswana Tourism Organisation guidelines'],
    },
    {
      id: 'safety-pesticides',
      title: 'Safe pesticide handling (people first)',
      category: 'people',
      keywords: ['pesticide safety', 'ppe', 'protective gear', 'spraying safety', 'poisoning symptoms', 'pesticide storage', 'chemical handling', 'gloves spraying', 'wash after spraying', 'pesticide disposal'],
      questions: ['how to spray pesticides safely', 'pesticide protective equipment', 'storing chemicals on farm', 'pesticide poisoning first aid', 'disposing of chemical containers'],
      answer() {
        return '⚠️ SAFE PESTICIDE HANDLING (people & family first):\n\n' +
          '• Read the label EVERY time: product, rate, crop, pre-harvest interval, PPE needed. If you cannot read it, ask your agro-dealer to explain — do not guess.\n' +
          '• PPE minimum: long sleeves/trousers, closed shoes, chemical-resistant gloves, goggles and a mask/respirator for powders; wash PPE separately from family clothes.\n' +
          '• Mixing: outside, upwind, never near water sources/children; measure with the right cap/spoon — "a bit extra" poisons crops, soil and people.\n' +
          '• Spray: early morning/late afternoon, no wind toward people or hives, no eating/drinking/smoking while spraying; keep people & animals out of the field for the label\'s re-entry period.\n' +
          '• Storage: locked, dry, cool, away from food/feed/water and out of children\'s reach — never in drink bottles (a tragic common accident).\n' +
          '• After: wash hands & face, bathe at end of day, wash contaminated clothes alone.\n' +
          '• Poisoning signs (headache, nausea, sweating, blurred vision, difficulty breathing): stop work, remove clothing, rinse skin/eyes, call 997 and take the container to the clinic.\n' +
          '• Disposal: triple-rinse containers, puncture, dispose per local rules — never burn or bury near water; never reuse for water/food.\n\n' + D;
      },
      sources: ['FAO pesticide management', 'WHO pesticide safety', 'national regulations'],
    },
  ],
};
