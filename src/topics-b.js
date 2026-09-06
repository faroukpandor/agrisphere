'use strict';

/**
 * AgriSphere extended topics — MODULE B:
 *  - natural resource management systems (soil, water, wetlands, forests,
 *    wildlife, biodiversity, climate, energy)
 *  - quality, standards, export & certification (international best practice)
 *  - responsible finance & fair-trade ethics (universal, non-confessional)
 *  - cooperative/inclusion/One Health/digital topics
 */

const D = '⚠️ General guidance — confirm with local extension/veterinary officers, technical manuals and current regulations before investing.';

const SOURCES = {
  fao: 'FAO technical guidelines',
  cabi: 'CABI (peer-reviewed compendia)',
  woah: 'WOAH (World Organisation for Animal Health)',
  moa: 'Botswana Ministry of Agriculture extension & veterinary services',
  ipcc: 'IPCC AR6 (2021–2023)',
  codex: 'Codex Alimentarius',
  ggap: 'GlobalG.A.P. IFA',
  vggt: 'FAO VGGT land tenure guidelines',
  cc: 'CCARDESA/CTA SADC practice notes',
  ifad: 'IFAD & international agri-finance studies',
  ramsar: 'Ramsar Convention guidance',
  iucn: 'IUCN guidelines',
  sdg: 'FAO SDG 12.3 work on food loss',
  onehealth: 'FAO–WHO–WOAH One Health',
};

function buttons(list) {
  return list.map((label) => ({ label }));
}

module.exports = {
  triggers: [
    {
      id: 'coverage',
      keys: ['coverage', 'what do you cover', 'topics list', 'all topics', 'systems', 'production systems', 'natural resources', 'index', 'catalogue', 'menu of topics'],
      answer() {
        return '🗂️ I cover the full agri-natural-resources matrix:\n\n' +
          '🌾 PRODUCTION SYSTEMS — field crops (maize, sorghum, cowpea, groundnuts, sunflower); horticulture (tomato, leafy veg, protected/greenhouse, hydroponics); livestock (cattle, goats/sheep, pigs, poultry); aquaculture (tilapia, catfish); beekeeping; agroforestry & orchards; conservation agriculture; rangeland & pastoral systems; urban/backyard food production; integrated crop–livestock; mushrooms.\n\n' +
          '🌍 NATURAL RESOURCE MANAGEMENT — soil health & erosion; water & watersheds; wetlands; forests & woodlands; wildlife coexistence; pollinators & biodiversity; climate adaptation; solar energy.\n\n' +
          '📜 STANDARDS & MARKETS — food safety (Codex/HACCP-style), export & certification pathways (GlobalG.A.P., organic, fair-trade, faith-based certification for export markets), traceability, seed systems, post-harvest loss.\n\n' +
          '🤝 PEOPLE & FINANCE — responsible farm finance (incl. interest-free/risk-sharing & mutual insurance options), honest trade ethics, cooperatives, women/youth inclusion, digital tools, One Health.\n\n' +
          'Type a topic (e.g. "beekeeping", "wetlands", "export certification") or tap below.';
      },
      buttons: buttons(['🌾 Production', '🌍 Natural resources', '📜 Standards & export', '🤝 Finance & ethics']),
    },
    {
      id: 'production-menu',
      keys: ['production systems', 'livestock menu', 'crop menu', 'farming systems menu'],
      answer() {
        return '🌾 PRODUCTION SYSTEMS — which one?\n\n' +
          '• 🌽 Field crops: maize, sorghum, cowpeas, groundnuts, sunflower\n' +
          '• 🍅 Horticulture: tomatoes, leafy veg/morogo, greenhouse & shade net, hydroponics, urban & backyard\n' +
          '• 🐄 Livestock: cattle & vet basics, goats/sheep, pigs, poultry\n' +
          '• 🐟 Aquaculture: tilapia & catfish\n' +
          '• 🐝 Beekeeping & honey\n' +
          '• 🌳 Agroforestry & fruit trees\n' +
          '• 🌱 Conservation agriculture · 🌾 Rangeland & grazing · 🔁 Integrated farming · 🍄 Mushrooms\n\n' +
          'Ask, e.g., "how to start a piggery?" — or tap a topic.';
      },
      buttons: buttons(['🐔 Poultry', '🐐 Small stock', '🐟 Fish farming', '🐝 Beekeeping', '🌳 Fruit trees', '🌱 Conservation ag']),
    },
    {
      id: 'nrm-menu',
      keys: ['natural resources menu', 'soil health', 'erosion', 'watershed', 'wetlands', 'forest', 'woodlands', 'wildlife', 'pollinators', 'biodiversity', 'environment'],
      answer() {
        return '🌍 NATURAL RESOURCE MANAGEMENT:\n\n' +
          '• 🟤 Soil health & erosion control\n' +
          '• 💧 Water, watersheds & boreholes\n' +
          '• 🐸 Wetlands & seasonal pans\n' +
          '• 🌳 Forests, woodlands & community forests\n' +
          '• 🐘 Wildlife coexistence & farm protection\n' +
          '• 🦋 Pollinators & biodiversity-friendly farming\n' +
          '• 🌦️ Climate adaptation & disaster-ready farming\n' +
          '• ☀️ Solar water pumping & energy\n\n' +
          'Healthy land + water = resilient farm. Ask, e.g., "how do I stop gully erosion?"';
      },
      buttons: buttons(['🟤 Soil & erosion', '💧 Watersheds', '🌳 Forests', '🐘 Wildlife', '🌦️ Climate']),
    },
    {
      id: 'standards-menu',
      keys: ['standards', 'certification', 'certifications', 'export', 'globalgap', 'global gap', 'organic certification', 'fair trade', 'food safety', 'traceability', 'codex', 'haccp', 'quality assurance', 'compliance', 'sps', 'phytosanitary'],
      answer() {
        return '📜 QUALITY, STANDARDS & EXPORT:\n\n' +
          '• 🧼 Food safety & hygiene basics (Codex/HACCP-style good practice)\n' +
          '• 🛃 Export readiness: SPS rules, phytosanitary certificates, buyer requirements (GlobalG.A.P. etc.)\n' +
          '• 🏷️ Certification pathways: organic, fair-trade, and faith-based certifications (e.g. halal/kosher) where they unlock export markets — all are commercial, audited standards\n' +
          '• 🔎 Traceability & batch records\n' +
          '• 🌾 Seed systems & quality seed\n' +
          '• 📉 Post-harvest loss reduction\n\n' +
          'Standards are buyers\' language — they convert good farming into premium prices. Ask e.g. "what do I need to export vegetables?"';
      },
      buttons: buttons(['🧼 Food safety', '🛃 Export readiness', '🏷️ Certifications', '🔎 Traceability']),
    },
    {
      id: 'finance-menu',
      keys: ['finance', 'loan', 'loans', 'credit', 'interest', 'insurance', 'funding', 'borrow', 'debt', 'invest', 'capital', 'microfinance', 'lender'],
      answer() {
        return '🤝 RESPONSIBLE FARM FINANCE:\n\n' +
          '• 💡 First: can the enterprise repay? (see my agribusiness topic for break-even records) — most farm debt problems are decisions, not rates.\n' +
          '• 🏦 Institutional routes: NDB, CEDA, Young Farmers Fund, commercial banks & micro-lenders — compare total cost, not just monthly payment.\n' +
          '• ⚖️ Fair & risk-sharing options: some community/faith-based and ethical lenders offer interest-free or asset-backed, profit/risk-sharing finance, advance-purchase contracts (a buyer pre-pays for future harvest at an agreed fair price) and mutual/cooperative insurance — these avoid exploitative interest and share risk fairly. Ask your cooperative, farmers\' union or ethical microfinance providers what is available.\n' +
          '• 🚫 Debt-trap red flags: unregistered lenders, no written contract, "payday" terms on farm income, collateral beyond value — walk away. Never sign what you have not read (get a translator if needed).\n' +
          '• 🛡️ Insurance: investigate subsidised crop/livestock insurance and mutual aid schemes before disaster, not after.\n' +
          '• 🤲 Community funds: village savings & loan groups (informal, rotating) are often the cheapest first rung for smallholders.\n\n' +
          'I never recommend specific lenders — verify licences with the regulator (e.g. Bank of Botswana / Non-Bank Financial Institutions Regulatory Authority).';
      },
      buttons: buttons(['📈 Agribusiness', '🤝 Co-ops', '🛡️ Mutual insurance']),
    },
    {
      id: 'marketplace',
      keys: ['marketplace', 'post an ad', 'list my produce', 'find buyers', 'buyers near me', 'classifieds', 'sell online', 'produce listing', 'advertise my produce'],
      answer() {
        return '🛒 AGRI MARKETPLACE (community listings):\n\n' +
          '• The AgriSphere website has a free community board where farmers, buyers, input suppliers and service providers can list & find each other.\n' +
          '• On the web app open the 🌾 Marketplace page (or visit /market.html): browse by category or post your own listing — what you sell/want, area, quantity, contact. Listings expire after 30 days and are free.\n' +
          '• Safety rules: meet in public places, verify goods before paying, prefer bank/agency trails over cash strangers, and report suspicious ads.\n' +
          '• On chat-only channels (WhatsApp etc.), ask me about BAMB depots, auctions and market days instead — or visit the web app to post.\n\n' +
          '⚠️ AgriSphere is a noticeboard, not a trader — every deal is between you and the other party.';
      },
      buttons: buttons(['💰 Prices', '🛒 Selling', '🛡️ Ethics']),
    },
    {
      id: 'emergency',
      keys: ['emergency', 'urgent', 'accident', 'poisoning', 'poisoned', 'bleeding', 'sudden death', 'sudden deaths', 'anthrax', 'collapse', 'convulsing', 'overdose', 'fire in the veld', 'flooding now', 'not breathing', 'asf', 'foot and mouth outbreak'],
      answer() {
        return '🚨 EMERGENCY — PEOPLE FIRST:\n\n' +
          '• If a person is injured, poisoned or not breathing: call emergency services now — 📞 997 (ambulance), 999 (police), 998 (fire). Do not wait for a chatbot.\n' +
          '• Animal emergencies: isolate the animal, minimise handling, and call your District Veterinary Office immediately. Sudden multiple deaths (especially with blood) may be anthrax or a notifiable disease — do NOT open the carcass, do NOT move or sell animals, keep people & dogs away, and report at once.\n' +
          '• Suspected foot-and-mouth or African swine fever: movement is likely banned in your zone — report before moving anything; it protects the whole country\'s livestock & exports.\n' +
          '• Veld fire: call 998 and alert neighbours; protect life first, then livestock & property. Never fight a fast fire alone.\n' +
          '• Flooding: move people & animals to high ground; never drive through floodwater.\n\n' +
          'I am guidance, not a dispatcher — when in doubt, CALL the professionals.';
      },
      buttons: buttons(['🏥 Vet office', '🐄 Livestock basics', '🩺 Crop doctor']),
    },
    {
      id: 'monetisation',
      keys: ['how does agrisphere make money', 'how do you make money', 'who owns agrisphere', 'agrisphere api', 'white label', 'embed agrisphere', 'partner with agrisphere', 'license agrisphere', 'revenue model', 'monetisation', 'is this free', 'do i have to pay', 'sponsor', 'donate'],
      answer() {
        return '💡 TRANSPARENT BUSINESS MODEL (how AgriSphere stays alive & free for farmers):\n\n' +
          '• The assistant & marketplace are FREE for farmers and smallholders — that mission never moves.\n' +
          '• Planned fair income streams (see docs/MONETISATION.md in the repo):\n' +
          '  1. Licensed API & white-label chatbots for organisations (NGOs, co-ops, agribusinesses, ministries, media) — recurring subscription fees;\n' +
          '  2. Optional sponsored knowledge topics by vetted organisations (clearly labelled, never biased answers);\n' +
          '  3. Featured/verified marketplace listings & premium co-op storefronts;\n' +
          '  4. Professional services: channel setup (WhatsApp/Messenger), custom knowledge packs, training.\n' +
          '• Funders/sponsors can support free farmer access — talk to the maintainer (GitHub: faroukpandor/agrisphere).\n\n' +
          'Revenue rules: never from selling farmer data, never from ads that distort advice, never pay-to-play answers.';
      },
      buttons: buttons(['🧠 How do you learn?', '📱 Channels']),
    },
    {
      id: 'compliance',
      keys: ['compliance', 'compliant', 'ethics', 'privacy', 'data policy', 'data protection', 'my data', 'terms', 'privacy policy', 'is agrisphere ethical', 'is agrisphere compliant', 'international standards', 'best practice', 'best practices', 'islamic', 'halal finance', 'faith based', 'religious', 'sharia', 'arabic', 'who watches agrisphere', 'accountability', 'bias'],
      answer() {
        return '📜 ETHICS, PRIVACY & COMPLIANCE (the short version):\n\n' +
          '• AgriSphere follows an international best-practice framework — docs/COMPLIANCE.md in the repository. It is aligned with AI ethics principles (OECD/UNESCO-style), FAO & Codex food-safety guidance, WOAH animal welfare, GlobalG.A.P., IPCC science, One Health, and universal fair-finance norms (including interest-free/risk-sharing and faith-based-certification options some communities prefer — AgriSphere itself is strictly non-religious and uses no Arabic; it simply respects every user\'s values).\n' +
          '• Integrity rules: we never invent prices, dosages or regulations; answers carry sources/disclaimers; humans stay in the loop for diagnosis, emergencies and policy.\n' +
          '• Privacy: chat history is stored only to give you context; we never sell or share personal data; you can request deletion (see the repo). Admin endpoints are token-protected.\n' +
          '• Accountability: everything is open source (GPL-3.0) — you can read exactly how answers are produced, audit the knowledge base, and fix bias.\n' +
          '• Reporting: found a wrong or harmful answer? Hit 👎 or raise an issue on GitHub — every report is a training signal.';
      },
      buttons: buttons(['🧠 How do you learn?', '🛡️ Honest trade', '💡 Business model']),
    },
    {
      id: 'bizplan-menu',
      keys: ['business plan', 'business plan help', 'start my business', 'start an agribusiness', 'agribusiness plan', 'write my business plan', 'starter toolkit', 'plan my farm business', 'my business plan'],
      answer() {
        return '📋 START MY AGRI-BUSINESS — guided toolkit:\n\n' +
          '• On the web app open the "Start here" page (or /biz.html): answer 10 quick questions about your enterprise, land, water, budget and buyers.\n' +
          '• You get a DRAFT business plan: executive summary, production plan, market & buyer section, budget ranges, stepwise action plan and funding routes (CEDA, NDB, Young Farmers Fund...).\n' +
          '• Why this beats static PDF sellers: your plan is built from YOUR answers, updates as you record real numbers, and the assistant keeps guiding each step — it is a living plan, not a one-off document.\n' +
          '• Honesty: the draft is decision support, not a profit guarantee or financial advice — every figure must be verified with local quotes before you invest or borrow.\n\n' +
          'Type "help" for the full menu, or ask me anything about your chosen enterprise.';
      },
      buttons: buttons(['💡 How is it different from PDF plans?', '📈 Agribusiness', '🤝 Finance']),
    },
    {
      id: 'programs-menu',
      keys: ['buyer-led production', 'buyer led programme', 'buyer led programmes', 'contract farming programmes', 'production programmes', 'sell to a buyer programme', 'buyer programmes', 'programme for farmers', 'programs for farmers'],
      answer() {
        return '🤝 BUYER-LED PRODUCTION PROGRAMMES:\n\n' +
          '• Serious buyers (processors, exporters, supermarkets, feedlots, hotels, school feeding) can post structured demand programmes: product, volume, quality specs, price formula, advance/input terms and delivery window.\n' +
          '• Farmers & co-ops apply directly; each programme carries a stage-gated production playbook (land prep → inputs → production → harvest → quality → delivery) and links to the topic guides the assistant teaches.\n' +
          '• Fairness rules are enforced before any programme is listed: written transparent price formula, no unfair deductions, written advance/input terms, written payment timeline and a written contract.\n' +
          '• On the web app open the "Buyer programmes" page (or /programs.html) to browse, apply or post a programme.\n\n' +
          '⚠️ AgriSphere is the facilitator & document layer — contracts are between buyer and farmer, and we never handle money.';
      },
      buttons: buttons(['🌾 Marketplace', '📜 Contract farming basics', '🛡️ Honest trade']),
    },
    {
      id: 'tourism-menu',
      keys: ['agri tourism', 'agritourism', 'farm stay', 'farm stays', 'tourism experiences', 'farm tours', 'visit a farm', 'weekend farm', 'tourism'],
      answer() {
        return '🧭 AGRI-TOURISM EXPERIENCES:\n\n' +
          '• Looking for a farm stay, market tour, harvest festival, birding or community craft experience? Tell the assistant where you want to go, your dates, group size and budget — we will guide you to curated experiences from participating partners.\n' +
          '• On the web app open the "Agri-tourism" page (or /tourism.html): find experiences, see what is included, and contact the partner directly to book.\n' +
          '• Partners (farm stays, lodges, community trusts) can list their experiences there too — the listing agreement template is in the repo (docs/templates).\n' +
          '• AgriSphere is a listings & lead layer: bookings and payments are between you and the partner — always confirm access, weather and safety provisions before travelling.';
      },
      buttons: buttons(['🌾 Marketplace', '🛡️ Ethics', '💡 Business model']),
    },
  ],

  entries: [
    // ================= NATURAL RESOURCE MANAGEMENT =================
    {
      id: 'nrm-soil',
      title: 'Soil health & erosion control',
      category: 'nrm',
      keywords: ['soil erosion', 'erosion', 'eroding', 'eroded', 'erode', 'gully', 'gullies', 'rills', 'contour', 'terrace', 'vetiver', 'soil health', 'degraded soil', 'compacted', 'crusting', 'runoff', 'topsoil', 'sand mining', 'revegetation', 'washing away'],
      questions: ['how to stop soil erosion', 'gully erosion control methods', 'soil conservation techniques', 'contour ridging', 'why is my soil washing away', 'restoring degraded land'],
      answer() {
        return '🟤 SOIL HEALTH & EROSION CONTROL:\n\n' +
          '• Erosion is topsoil theft — 1 cm of topsoil takes centuries to form and Botswana\'s sandy soils are fragile once exposed. Watch for: muddy runoff after light rain, rills between rows, gullies growing each season, dust storms.\n' +
          '• Stop it at the source: keep soil covered (residue/mulch/cover crops) — bare soil between rows is erosion begging to happen; rip/plant along the CONTOUR, never up-and-down slopes.\n' +
          '• Gully repair: block with contour lines of vetiver grass, stone lines, brush or sandbag check-dams; plant fast cover (vetiver, elephant grass, local grasses) above; fence livestock out of eroding areas.\n' +
          '• Vegetative barriers are cheap & permanent: vetiver hedges along contours trap sediment and slowly build natural terraces.\n' +
          '• Rebuild organic matter: manure/compost, rotation with legumes, minimum tillage (see Conservation Agriculture) — organic matter is the sponge that holds water & glues soil.\n' +
          '• Compacted/crusted soils: break crusts after rain, add organic matter, avoid driving on wet fields; crusting kills seedling emergence on sandy loams.\n' +
          '• Water is the tool: pair every erosion fix with water harvesting (contour basins, half-moons) — stop the runoff and you feed the crop.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc, SOURCES.moa],
      buttons: buttons(['🌱 Conservation ag', '💧 Water tips', '🧪 Fertiliser basics']),
    },
    {
      id: 'nrm-water',
      title: 'Watersheds, boreholes & water governance',
      category: 'nrm',
      keywords: ['watershed', 'catchment', 'borehole', 'water permit', 'water rights', 'aquifer', 'groundwater', 'water licensing', 'water act', 'abstraction', 'water governance', 'communal water', 'water committee'],
      questions: ['how to get a water permit', 'borehole drilling botswana', 'groundwater management', 'water abstraction licence', 'communal borehole management', 'protecting my catchment'],
      answer() {
        return '💧 WATERSHEDS, BOREHOLES & WATER GOVERNANCE:\n\n' +
          '• Water is a shared, licensed resource: abstraction (boreholes, dams, rivers) is regulated under Botswana\'s water legislation — apply for/transfer permits through the Department of Water & Sanitation BEFORE drilling big or pumping commercially. Drilling without a permit can mean forfeiture.\n' +
          '• Groundwater: test quality before use (salinity, fluoride, nitrates) and monitor water levels — over-pumping one borehole dries neighbours\' too; it is a shared aquifer.\n' +
          '• Communal boreholes: form a water committee with written rules (hours, fees, maintenance fund, technician contact) — committees that charge a small fee keep pumps running; free water = broken pumps.\n' +
          '• Catchment care: protect wetlands, riverbanks and pans (no ploughing to the water\'s edge, no dumping, controlled livestock access) — the catchment is the storage that recharges your borehole.\n' +
          '• Rainwater: roof gutters → tanks, road runoff → ponds; every litre harvested is a litre not pumped.\n' +
          '• Dams/pans: siltation kills them — pair any dam with erosion control in the catchment above.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa],
      buttons: buttons(['💧 Water tips', '🟤 Soil & erosion', '🌦️ Climate']),
    },
    {
      id: 'nrm-wetlands',
      title: 'Wetlands, pans & riverbanks',
      category: 'nrm',
      keywords: ['wetland', 'wetlands', 'pan', 'pans', 'riverbank', 'delta', 'okavango', 'marsh', 'seasonal pan', 'vlei', 'floodplain', 'waterfowl', 'spawning', 'ramsar'],
      questions: ['why are wetlands important', 'farming near wetlands', 'okavango sustainable use', 'protecting seasonal pans', 'wetland rules botswana', 'riverbank protection'],
      answer() {
        return '🐸 WETLANDS, PANS & RIVERBANKS:\n\n' +
          '• Wetlands are Botswana\'s life-support: they store floods, recharge groundwater, purify water, feed livestock in dry season, and are nurseries for fish & birds. The Okavango Delta is a globally recognised wetland — its health IS the region\'s economy (tourism, fishing, water).\n' +
          '• Farming edge rules: keep cultivation and kraals back from waterways (buffer ~30–100 m depending on slope), leave riparian vegetation intact, control livestock access points to avoid poaching banks.\n' +
          '• Seasonal pans & vleis: they flood in some years — don\'t plant the pan floor; use them as dry-season grazing and wildlife water instead. A pan destroyed for one crop year is lost for decades.\n' +
          '• Fire management: avoid burning wetland margins late in the dry season (destroys nesting & spawning habitat).\n' +
          '• Rights & duties: wetland use (reeds, thatch, fishing, tourism) is regulated — check with the district land board / wildlife authorities before commercial harvesting; community trusts manage many areas — join theirs.\n' +
          '• Opportunity: well-managed wetlands + lodges/tourism = income WITHOUT draining (birding, fishing licences, crafts from sustainable reed harvest).\n\n' + D;
      },
        sources: [SOURCES.ramsar, SOURCES.iucn, SOURCES.fao],
      buttons: buttons(['💧 Water tips', '🌳 Forests', '🛒 Selling']),
    },
    {
      id: 'nrm-forest',
      title: 'Forests, woodlands & community forestry',
      category: 'nrm',
      keywords: ['forest', 'forests', 'woodland', 'mophane', 'charcoal', 'firewood', 'timber', 'community forest', 'forestry', 'tree cutting permit', 'veldt products', 'thatched grass', 'gum', 'fuelwood', 'afforestation', 'deforestation'],
      questions: ['can i cut trees for firewood', 'charcoal production rules', 'mophane woodland management', 'community forest trust', 'non timber forest products', 'tree permit botswana', 'sustainable harvesting'],
      answer() {
        return '🌳 FORESTS & WOODLANDS:\n\n' +
          '• Woodlands (mophane, acacia, mixed) are communal assets: cutting, charcoal and commercial harvesting need permits from the Department of Forestry & Range Resources — check before you cut; penalties are real.\n' +
          '• Sustainable harvesting rules of thumb: take deadwood before live trees; rotate cutting areas; leave seed trees & regeneration; never clear riverbanks, steep slopes or sacred groves.\n' +
          '• Mophane is precious: it hosts the mophane worm (a high-protein food & export trade) — burning mophane for charcoal destroys a multi-year income. Value standing trees more than cut ones.\n' +
          '• Community forest trusts / associations: organised communities can get management rights and earn from tourism, crafts, and sustainable harvesting — a proven model in Botswana\'s communal areas.\n' +
          '• Non-timber products pay: thatching grass, medicinal plants, gums, fruits, honey, craft woods — harvest with care, process well, and they out-earn charcoal year after year.\n' +
          '• Plant trees too: village woodlots & agroforestry reduce pressure on natural woodland (see my agroforestry topic).\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa, SOURCES.iucn],
      buttons: buttons(['🌳 Agroforestry', '🐝 Beekeeping', '🐸 Wetlands']),
    },
    {
      id: 'nrm-wildlife',
      title: 'Wildlife coexistence & farm protection',
      category: 'nrm',
      keywords: ['elephant', 'elephants', 'wildlife', 'lion', 'predators', 'conflict', 'human wildlife', 'fencing', 'guard dogs', 'chilli', 'crop raiding', 'game fence', 'compensation', 'predator proof', 'herding'],
      questions: ['how to protect crops from elephants', 'human wildlife conflict solutions', 'predator proof kraals', 'livestock guarding dogs', 'wildlife damage compensation', 'coexisting with lions'],
      answer() {
        return '🐘 WILDLIFE COEXISTENCE & FARM PROTECTION:\n\n' +
          '• Wildlife is both an asset (tourism revenue, ecosystem health) and a risk (crop raiding, predation) — coexistence is a management skill, not luck.\n' +
          '• Livestock: predator-proof kraals (solid sides or game-proof mesh, roofed corners) at night; herd with people/dogs by day; keep calving near the homestead; remove carcasses quickly (they attract predators).\n' +
          '• Crops vs elephants: chili fences (chilli+oil rope), beehive fences (elephants hate bees!), bangers & early-warning watch teams work — plant fields away from known corridors; coordinate with neighbours (raiders move where it is quiet).\n' +
          '• Reporting & rights: report problem animals & damage to the district wildlife office — Botswana has structured channels (and where applicable, damage claims) — document damage with photos & witnesses immediately.\n' +
          '• Never poison or kill protected wildlife: penalties are severe and it backfires ecologically. Work with the wildlife office on translocations/deterrents.\n' +
          '• Community benefit: wildlife that pays (tourism, hunting quotas managed by community trusts) is wildlife that is tolerated — support your local trust\'s benefit distribution.\n' +
          '• Conservation agriculture + predator-proofing + early planting reduces the vulnerable window.\n\n' + D;
      },
        sources: [SOURCES.iucn, SOURCES.fao, SOURCES.moa],
      buttons: buttons(['🌾 Rangeland', '🌳 Forests', '🏥 Vet office']),
    },
    {
      id: 'nrm-pollinators',
      title: 'Pollinators & biodiversity-friendly farming',
      category: 'nrm',
      keywords: ['pollinators', 'pollination', 'bees decline', 'biodiversity', 'beneficial insects', 'ladybird', 'natural enemies', 'hedgerow', 'flower strips', 'pesticide harm', 'habitat', 'birds on farm', 'ecosystem services'],
      questions: ['how to attract pollinators', 'biodiversity friendly farming', 'beneficial insects on farm', 'flower strips for bees', 'reducing pesticide harm to bees', 'why are pollinators important'],
      answer() {
        return '🦋 POLLINATORS & BIODIVERSITY:\n\n' +
          '• Pollinators (bees, butterflies, beetles, birds) lift yields of many crops by 20–50%+ and are FREE — but broad-spectrum sprays kill them silently.\n' +
          '• Farm actions: leave unmowed flowering strips/edges (a "weed" patch is a pollinator pantry); plant nectar plants (sunflower, morogo flowers left to bloom, acacia, fruit trees); provide water & nest sites (bee hotels, old logs).\n' +
          '• Spray discipline: spray only when thresholds say so, in the EVENING when bees are home, avoid spraying flowering weeds/crops, choose selective products, and follow the label\'s bee warnings — this is both ecology and economics.\n' +
          '• Beneficial insects (ladybirds, parasitoid wasps, spiders) control pests for free — learn to recognise them and stop nuking them with every spray.\n' +
          '• Keep natural habitat patches (woodlots, pans, rocky outcrops) — they are reservoirs of pollinators AND natural pest controllers for your fields.\n' +
          '• Biodiversity = resilience: diverse farms suffer less from pest booms, drought and price shocks. Monoculture is fragile by design.\n' +
          '• Bonus: healthy pollinator habitat pairs with beekeeping income (see my beekeeping topic 🐝).\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cabi, SOURCES.ipcc],
      buttons: buttons(['🐝 Beekeeping', '🐛 Fall armyworm', '🧪 Fertiliser basics']),
    },
    {
      id: 'nrm-climate',
      title: 'Climate adaptation & resilient farming',
      category: 'nrm',
      keywords: ['climate change', 'adaptation', 'drought plan', 'dry spell', 'heat', 'flood risk', 'early warning', 'disaster', 'resilience', 'climate smart', 'mitigation', 'carbon', 'emissions', 'greenhouse gases', 'seasonal forecast', 'el nino'],
      questions: ['how to prepare for drought', 'climate smart agriculture practices', 'climate change adaptation for farmers', 'coping with el nino', 'flood preparedness on farm', 'carbon farming botswana', 'reducing farm emissions'],
      answer() {
        return '🌦️ CLIMATE ADAPTATION & RESILIENT FARMING:\n\n' +
          '• Southern Africa\'s climate is becoming hotter & more variable (IPCC): plan for drought, heat and floods as normal business — not surprises.\n' +
          '• Drought-proof your system: water harvesting & storage; drought-tolerant crops/varieties (sorghum, millet, cowpea); early-maturing maize; soil organic matter (every 1% more organic matter stores more water); staggered planting.\n' +
          '• Use early warnings: Botswana Meteorological Services seasonal outlook + flood alerts before each season — match crop choices & planting windows to the outlook.\n' +
          '• Livestock: plan destocking triggers in advance (veld condition + forecast), keep fodder reserves, diversify species (goats outlast cattle in drought).\n' +
          '• Floods: don\'t build/plant in flood lines; maintain drainage; move valuables & animals early; community contingency plans save lives.\n' +
          '• Mitigation co-benefits that pay: conservation agriculture & agroforestry store carbon AND build soil; solar pumping cuts diesel costs; manure & legumes cut fertiliser bills (and nitrous oxide).\n' +
          '• Carbon markets: real but early-stage and rules-heavy — be sceptical of "instant carbon income" promises; if approached, verify the buyer & contract with a lawyer/extension officer.\n' +
          '• Insurance & mutual aid: explore subsidised index-based crop insurance & community savings BEFORE disaster.\n\n' + D;
      },
        sources: [SOURCES.ipcc, SOURCES.fao, SOURCES.cc],
      buttons: buttons(['🌱 Conservation ag', '💧 Water tips', '🌾 Rangeland', '🤝 Finance']),
    },
    {
      id: 'nrm-energy',
      title: 'Solar energy & farm power',
      category: 'nrm',
      keywords: ['solar', 'solar pump', 'solar pumping', 'pv', 'photovoltaic', 'energy', 'electricity', 'diesel', 'agrivoltaics', 'biogas', 'power', 'battery', 'off grid'],
      questions: ['solar water pumping for farms', 'cost of solar pump', 'biogas from manure', 'solar vs diesel pumping', 'solar irrigation system design', 'farm electricity options'],
      answer() {
        return '☀️ SOLAR ENERGY & FARM POWER:\n\n' +
          '• Solar pumping is usually the best first farm energy buy: no diesel queues, low running cost, works with drip irrigation; boreholes + solar + drip can turn dry land into year-round production.\n' +
          '• Sizing honestly: match panel + pump to your borehole depth, daily water need and peak summer use — get 2–3 quotes from reputable installers and ask for a performance guarantee; cheap undersized kits disappoint.\n' +
          '• Batteries add cost: for daytime irrigation you often DON\'T need a battery (pump while the sun shines into a reservoir) — a reservoir + gravity is your cheapest "battery".\n' +
          '• Small-scale solar: lights for poultry (layers need 14–16 h light), vaccine fridges, phone charging for market info, electric fences.\n' +
          '• Biogas: manure + a simple digester = cooking gas + fertiliser slurry — great for piggeries, feedlots and dairies.\n' +
          '• Efficiency first: drip & mulch cut the water you must pump by a third or more — power what you need, not what you can.\n' +
          '• Financing: some banks/NGOs finance solar for agriculture (see finance topic); compare total 10-year cost of solar vs diesel, not just purchase price.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.ipcc, SOURCES.cc],
      buttons: buttons(['💧 Water tips', '🤝 Finance', '📈 Agribusiness']),
    },

    // ================= QUALITY, STANDARDS & EXPORT =================
    {
      id: 'quality-food-safety',
      title: 'Food safety & hygiene (Codex/HACCP-style)',
      category: 'quality',
      keywords: ['food safety', 'hygiene', 'contamination', 'handwashing', 'haccp', 'codex', 'shelf life', 'spoilage', 'bacteria', 'salmonella', 'e coli', 'aflatoxin', 'pesticide residue', 'washing produce', 'cold chain'],
      questions: ['food safety rules for selling food', 'how to prevent aflatoxin', 'hygiene practices on farm', 'HACCP basics for farmers', 'pesticide residue safety', 'keeping produce fresh and safe'],
      answer() {
        return '🧼 FOOD SAFETY & HYGIENE (international good practice):\n\n' +
          '• Safe food is a market REQUIREMENT everywhere (Codex Alimentarius principles underpin global trade) — and it starts on the farm, not in the kitchen.\n' +
          '• Water & hands: wash hands after toilet, animals and chemicals; use clean water for washing produce & equipment; toilets at field/packing sites.\n' +
          '• Field hygiene: no animals in packing areas, clean harvest crates, remove damaged/rotten produce (one rotten fruit spoils a box), keep produce off the ground.\n' +
          '• Aflatoxin (the big one for maize & groundnuts): dry grain promptly to <12–13% moisture, sort out mouldy/discoloured kernels, store in clean dry conditions — aflatoxin is invisible, carcinogenic and blocks export & formal markets.\n' +
          '• Pesticide residues: follow label rates, observe pre-harvest intervals religiously, spray only what is needed — residues lose you contracts and can harm customers.\n' +
          '• Cold chain: cool produce fast after harvest (shade → cool room/ice) — every hour of heat shortens shelf life and value.\n' +
          '• Traceability: record batch, field, date, treatments per lot — buyers increasingly demand it (see traceability topic).\n' +
          '• Simple HACCP-style thinking: identify where contamination can happen (water? hands? pests? storage?), control those points, and document.\n\n' + D;
      },
        sources: [SOURCES.codex, SOURCES.fao, SOURCES.ggap],
      buttons: buttons(['🛃 Export readiness', '🏷️ Certifications', '🌽 Maize storage']),
    },
    {
      id: 'quality-export',
      title: 'Export readiness & certification',
      category: 'quality',
      keywords: ['export', 'exporting', 'phytosanitary', 'certificate', 'sps', 'import requirements', 'globalgap', 'global gap', 'supermarket supplier', 'buyer requirements', 'compliance', 'audit', 'food safety certification', 'market access'],
      questions: ['how to export vegetables', 'what is a phytosanitary certificate', 'globalgap certification process', 'selling to supermarkets', 'export requirements botswana', 'how to get certified organic', 'halal certification for meat exports'],
      answer() {
        return '🛃 EXPORT READINESS & CERTIFICATION:\n\n' +
          '• Export & formal retail run on PAPER as much as produce: buyers require food-safety systems, certificates and traceability. Treat compliance as a skill, not a burden — it is the toll booth to premium prices.\n' +
          '• SPS basics: most countries require a phytosanitary certificate (plant products) issued by your national plant protection organisation (Ministry of Agriculture / DAR), plus importer-side permits — start the process WEEKS before shipping.\n' +
          '• Start with GlobalG.A.P. (the most recognised farm standard): it certifies good agricultural practice (food safety, traceability, worker welfare, environment). Smallholder groups can certify as a co-op (option 1/2) — far cheaper per farmer.\n' +
          '• Other pathways: organic certification (premium, requires 2–3 yr conversion & audit), fair-trade (social premium for organised smallholders), and faith-based certifications (e.g. halal for meat/poultry exports to many markets, kosher for niche buyers) — each is a commercial, audited standard responding to buyer demand; a certification consultant/export promoter can map which pays for YOUR product.\n' +
          '• Practical first steps: register with the national export/trade promotion agency; visit the buyer\'s quality manual; run a pre-audit gap analysis; fix water, hygiene & records first (cheapest wins).\n' +
          '• Never fake certificates or residues — one failed consignment blacklists you across the industry.\n' +
          '• Smallholders: co-ops & exporter aggregators let you ride their certification — sell through certified groups while building your own.\n\n' + D;
      },
        sources: [SOURCES.ggap, SOURCES.codex, SOURCES.fao],
      buttons: buttons(['🧼 Food safety', '🔎 Traceability', '🤝 Co-ops', '💰 Prices']),
    },
    {
      id: 'quality-traceability',
      title: 'Traceability & batch records',
      category: 'quality',
      keywords: ['traceability', 'batch', 'records', 'lot number', 'label', 'tracking', 'farm to fork', 'provenance', 'barcodes', 'digital records', 'recall', 'field records'],
      questions: ['what is traceability in farming', 'how to keep batch records', 'labelling requirements for produce', 'farm to fork traceability', 'digital record keeping for farmers'],
      answer() {
        return '🔎 TRACEABILITY & BATCH RECORDS:\n\n' +
          '• Traceability = the ability to follow a product from your field to the buyer\'s shelf. It is becoming non-negotiable in formal markets and it protects YOU in disputes.\n' +
          '• Minimal system that works: give every harvest lot a code (e.g. FIELD-CROP-DATE), and record in one notebook/app: planting date & seed, treatments (what/when/dose), harvest date, quantity, buyer.\n' +
          '• Label outward: product name, your name/group, lot code, date, weight, grade — a clean label lifts perceived quality instantly.\n' +
          '• Why it pays: buyers trust documented farms (repeat orders); if a complaint arises you can show exactly what you did; premiums for verified provenance (organic, local, sustainable) need proof.\n' +
          '• Digital: simple spreadsheets or farm apps beat memory; keep a paper backup (phones die); cloud-sync where connectivity allows.\n' +
          '• Livestock: ear tags + movement permits ARE traceability — keep the register updated; it is legally required for cattle movements in Botswana.\n\n' + D;
      },
        sources: [SOURCES.codex, SOURCES.fao, SOURCES.ggap],
      buttons: buttons(['🧼 Food safety', '🛃 Export readiness', '📈 Agribusiness']),
    },
    {
      id: 'quality-seeds',
      title: 'Seed systems & quality seed',
      category: 'quality',
      keywords: ['seed', 'seeds', 'certified seed', 'quality declared seed', 'saving seed', 'seed legislation', 'variety release', 'hybrid seed', 'open pollinated', 'opv', 'seed companies', 'germination test', 'seed treatment'],
      questions: ['certified vs saved seed', 'how to save maize seed', 'seed germination test', 'buying quality seed', 'seed legislation botswana', 'open pollinated varieties'],
      answer() {
        return '🌾 SEED SYSTEMS & QUALITY SEED:\n\n' +
          '• Seed is the cheapest input and the highest-leverage one: quality seed can lift yield 20–50% over farm-saved grain of unknown history.\n' +
          '• Buy certified or Quality Declared Seed (QDS) from registered dealers where possible — it guarantees germination, purity and disease-free status. Keep the label & receipt.\n' +
          '• Hybrids (maize): high yield but DO NOT save their seed — F2 collapses. Open-pollinated varieties (OPVs) & landraces can be saved year after year — choose by your goal.\n' +
          '• Saving seed properly: harvest from the best 50–100 plants only (not the runts), dry thoroughly, treat against storage pests, store cool & dry in labelled containers, and replant within 1–2 years (germination falls).\n' +
          '• Germination test before planting: 100 seeds on damp cloth, count sprouted at 7 days — below 80%? Increase rate or buy fresh.\n' +
          '• New varieties must be RELEASED & registered for formal sale (national variety system) — buying unregistered "miracle" seed is gambling.\n' +
          '• Community seed banks & farmer seed fairs preserve local drought-tolerant varieties — participate, they are climate insurance.\n' +
          '• Legume & vegetable seed loses vigour faster than maize/cereals — buy fresh each season.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa, SOURCES.cc],
      buttons: buttons(['🌽 Maize guide', '📈 Agribusiness', '🌱 Conservation ag']),
    },
    {
      id: 'quality-postharvest',
      title: 'Post-harvest loss reduction',
      category: 'quality',
      keywords: ['post harvest', 'postharvest', 'loss reduction', 'cold chain', 'shelf life', 'bruising', 'harvest timing', 'shade', 'packing', 'cooling', 'food loss', 'waste', 'market freshness'],
      questions: ['how to reduce post harvest losses', 'vegetable cooling methods', 'harvest timing for market', 'reducing food waste on farm', 'packing produce for market'],
      answer() {
        return '📉 POST-HARVEST LOSS REDUCTION:\n\n' +
          '• One-third of food is lost between field and fork globally (FAO SDG 12.3 work) — and losses hit smallholders hardest because they sell at the weakest moment. Cutting loss is the cheapest "new land" you will ever farm.\n' +
          '• Harvest at the right moment: early morning (cool) for vegetables; at the right maturity — overripe/underripe both lose money. Handle like eggs: bruises rot.\n' +
          '• Shade immediately: minutes in the sun steal shelf life. Harvest into clean, ventilated crates (not overfilled sacks).\n' +
          '• Cool fast & cheap: evaporative cooling (charcoal/jute "cool chambers"), night airing, cool rooms where affordable; cold chain pays for itself on high-value produce.\n' +
          '• Grade at harvest, not at market: sorting damaged produce out of the good lot protects the price of the whole batch.\n' +
          '• Grain: dry to safe moisture & store in hermetic/treated storage (see maize harvest & storage topic) — this alone can save 15–30%.\n' +
          '• Sell strategically: stagger harvest (succession planting), link to buyers before harvest, and process surpluses (drying, juice, oil) instead of dumping at giveaway prices.\n\n' + D;
      },
        sources: [SOURCES.sdg, SOURCES.fao, SOURCES.cc],
      buttons: buttons(['🌽 Maize storage', '🥬 Leafy veg', '🛒 Selling']),
    },

    // ================= FINANCE, ETHICS & PEOPLE =================
    {
      id: 'finance-responsible',
      title: 'Responsible farm finance',
      category: 'finance',
      keywords: ['responsible finance', 'debt trap', 'loan calculator', 'repayment', 'interest free', 'risk sharing', 'asset backed', 'advance purchase', 'contract farming finance', 'mutual insurance', 'takaful style', 'micro insurance', 'credit record', 'over borrowing', 'loan shark', 'unregistered lender'],
      questions: ['how to borrow responsibly', 'avoiding debt traps in farming', 'interest free farm finance', 'advance purchase contracts', 'crop insurance options', 'farm loan checklist'],
      answer() {
        return '🤝 RESPONSIBLE FARM FINANCE (universal fair-finance principles):\n\n' +
          '• Principle 1 — the enterprise must repay: work your break-even & cash-flow budget BEFORE borrowing (see agribusiness topic). Borrow for assets that produce income, never for consumption.\n' +
          '• Principle 2 — understand total cost: compare APR/total repayable (not monthly instalments); read every clause; never sign blank or unread documents.\n' +
          '• Principle 3 — fair, risk-sharing options exist: several ethical & community-based financiers offer interest-free or asset-backed finance, profit/loss-sharing partnerships, advance-purchase (pre-financed) contracts where the buyer pays upfront for future harvest at a fair pre-agreed price, and mutual/cooperative insurance pools. These models (used by Islamic and other ethical banks worldwide, and by many cooperatives) align lender profit with farmer success instead of charging fixed interest regardless of outcome.\n' +
          '• Principle 4 — avoid exploitative credit: unregistered lenders, punitive "roll-over" micro-loans and salary-style deductions on farm income are how farms are lost. Verify lenders with the regulator.\n' +
          '• Insurance: insure what would bankrupt you (crop/livestock disasters) — subsidised & index-based products may exist in your district; mutual aid groups are the community alternative.\n' +
          '• Records build credit: documented farming (records, receipts, bank statements) qualifies you for better rates than cash-only farming.\n' +
          '• Village savings groups: rotating savings & loans are often the cheapest first rung — join or start one.\n\n' + D;
      },
        sources: [SOURCES.ifad, SOURCES.fao],
      buttons: buttons(['📈 Agribusiness', '🤝 Co-ops', '🛡️ Ethics']),
    },
    {
      id: 'ethics-trade',
      title: 'Honest trade & market ethics',
      category: 'ethics',
      keywords: ['ethics', 'honesty', 'trust', 'fair dealing', 'contracts', 'verbal agreements', 'weights', 'measures', 'hoarding', 'price gouging', 'exploitation', 'middlemen', 'worker welfare', 'child labour', 'integrity', 'corruption', 'bribery', 'transparent trade', 'stewardship'],
      questions: ['how to trade honestly', 'fair prices for farmers', 'dealing with middlemen', 'written vs verbal contracts', 'ethical business practices', 'avoiding exploitation', 'stewardship of land'],
      answer() {
        return '🛡️ HONEST TRADE & MARKET ETHICS (universal best practice):\n\n' +
          '• Integrity is a business asset: honest weights, honest grading and truthful labels build the repeat buyers that make farming profitable — one cheat costs you years of trust.\n' +
          '• Weights & measures: know your units, check scales at buying points, and sell in standard bags/boxes. Short-changing buyers (or being short-changed) poisons the market for everyone.\n' +
          '• Price fairness: don\'t gouge in scarcity or dump in glut in ways that destroy neighbours\' livelihoods; hoarding staple food for artificial scarcity is both unethical and often illegal — fair prices come from transparency, not tricks.\n' +
          '• Contracts: put agreements in writing (even simple ones) — price, quantity, quality, dates, penalties; verbal deals breed disputes. Honour contracts even when prices move against you — your reputation is your collateral.\n' +
          '• Middlemen: a fair intermediary who adds transport/credit/access value is legitimate; an exploiter who manipulates prices & scales is not. Learn the market price yourself (BAMB bulletins, market visits) so you can tell the difference.\n' +
          '• People: pay workers fairly & on time, no child labour, safe tools & water for workers — worker welfare is a legal and buyer-audited requirement (GlobalG.A.P./ethical audits check it).\n' +
          '• Stewardship ethic: you hold land & water in trust for the next generation — leave soil, water and biodiversity better than you found them. This universal stewardship value is also core international practice (FAO VGGT, sustainable development goals).\n' +
          '• Zero bribery & zero fake "organic/certified" claims — they are fraud and they collapse businesses.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.vggt, SOURCES.ggap],
      buttons: buttons(['🤝 Finance', '📈 Agribusiness', '🛒 Selling']),
    },
    {
      id: 'people-coops',
      title: 'Cooperatives & producer groups',
      category: 'people',
      keywords: ['cooperative', 'co-op', 'producer group', 'farmers association', 'union', 'collective', 'marketing group', 'cooperative governance', 'member benefits', 'bulk buying', 'joint selling', 'committee', 'constitution'],
      questions: ['how to start a cooperative', 'benefits of farmer cooperatives', 'cooperative governance rules', 'marketing cooperative botswana', 'producer group management', 'cooperative funding'],
      answer() {
        return '🤝 COOPERATIVES & PRODUCER GROUPS:\n\n' +
          '• Alone, a smallholder is a price-taker; organised, farmers become a market force: bulk input buying (20–40% cheaper), joint certification (GlobalG.A.P. group option), shared machinery, collective sales to supermarkets/exporters, and a voice in policy.\n' +
          '• Start informal FIRST: 5–15 trusted farmers, one shared goal (e.g. joint maize marketing), simple rules, transparent records. Grow into a registered cooperative only when the business justifies it.\n' +
          '• Governance that survives: written constitution, elected committee with TERMS (no lifetime chairs), annual audited accounts, member meetings that actually decide, and zero tolerance for committee self-dealing — co-ops die from insider capture more than markets.\n' +
          '• Money hygiene: separate accounts, dual signatories, bank the cash daily, publish income/expense summaries at every meeting.\n' +
          '• Business first: a co-op is a business serving members — agree on what it will SELL/BUY, at what margin, with what working capital (member shares + fees), before registering.\n' +
          '• Support exists: cooperative registries, farmer unions, NGOs & government programmes offer training & sometimes grants — ask your district cooperative officer.\n' +
          '• Multi-stakeholder value: strong co-ops lift women & youth participation, cut buyer transaction costs, and become the natural partner for finance & certification.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc, SOURCES.moa],
      buttons: buttons(['📈 Agribusiness', '🤝 Finance', '🛃 Export readiness']),
    },
    {
      id: 'people-inclusion',
      title: 'Women & youth in agribusiness',
      category: 'people',
      keywords: ['women farmers', 'youth', 'youth in agriculture', 'young farmers', 'women empowerment', 'gender', 'land access', 'inheritance', 'inclusion', 'mentorship', 'girls', 'unemployed youth', 'agripreneurs', 'next generation'],
      questions: ['opportunities for youth in agriculture', 'women in farming support', 'how to get land as a young farmer', 'youth agribusiness funding', 'women land rights botswana', 'mentorship for young farmers'],
      answer() {
        return '👩🏾‍🌾 WOMEN & YOUTH IN AGRIBUSINESS:\n\n' +
          '• Agriculture is the biggest employer of women & youth in Africa — but they farm with less land, credit and information. Closing that gap is the single highest-return investment in food security (widely evidenced by FAO and development research).\n' +
          '• Land: women & young people face real barriers to land access & inheritance — know your rights under Botswana\'s land law (customary land boards grant to all citizens; married women\'s property rights are protected), and formalise allocations in writing.\n' +
          '• Youth entry paths: start with high-value, fast-cycle enterprises that need little land — poultry, vegetables under drip, morogo, beekeeping, mushrooms, hydroponic fodder, mobile services (spraying, advisory, aggregation) — then grow.\n' +
          '• Funding: dedicated windows exist (e.g. Young Farmers Fund, CEDA youth schemes, NDB) — prepare bankable one-page plans & records before applying (see agribusiness topic).\n' +
          '• Skills: demand extension & mentorship — join/start youth-in-agri clubs, attend BUAN/DAR short courses, find a seasoned mentor farmer (one is worth ten workshops).\n' +
          '• Networks: women\'s groups and youth cooperatives unlock group certification, joint buying & collective sales — join early.\n' +
          '• Digital: phones are your edge — market prices, weather, records & this very chatbot. Young agripreneurs who blend farming + digital services are the sector\'s future.\n' +
          '• Challenge stereotypes at every market: women produce, men sell — flip it; buyers care about quality & consistency, not gender.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.vggt, SOURCES.cc],
      buttons: buttons(['🤝 Co-ops', '📈 Agribusiness', '🏡 Urban farming']),
    },
    {
      id: 'people-onehealth',
      title: 'One Health: animals, people & environment',
      category: 'people',
      keywords: ['one health', 'zoonosis', 'zoonotic', 'rabies', 'brucellosis', 'anthrax humans', 'antibiotic resistance', 'amr', 'antimicrobial', 'hygiene animals', 'disease transmission', 'milk hygiene', 'raw milk', 'wildlife disease'],
      questions: ['what is one health', 'diseases from animals to humans', 'antibiotic resistance in livestock', 'brucellosis prevention', 'safe milk handling', 'rabies prevention', 'anthrax safety for people'],
      answer() {
        return '🧑🏾‍⚕️ ONE HEALTH — people, animals & environment:\n\n' +
          '• One Health is the global framework (FAO–WHO–WOAH): most new human diseases come from animals, and environmental change drives them — so human health, animal health and ecosystem health are managed together.\n' +
          '• Protect your family: vaccinate dogs & cats against rabies (children are most at risk — a rabid bite is almost always fatal once symptoms start); boil or pasteurise milk (brucellosis); cook meat well; wash hands after handling animals, manure and raw meat.\n' +
          '• Anthrax safety: sudden livestock deaths + blood from openings = suspect anthrax — never open the carcass, never eat it, report immediately; vaccination of at-risk herds protects people too.\n' +
          '• Antimicrobial resistance (AMR): overusing antibiotics in livestock creates superbugs that defeat human medicine — use antibiotics only via your vet, complete prescribed courses, and never buy "leftover" or street antibiotics.\n' +
          '• Wildlife contact: don\'t handle dead wildlife (TB, anthrax, unknown risks); report unusual wildlife deaths to the vet/wildlife office.\n' +
          '• Environmental links: polluted water & wetlands spread disease — protecting water sources protects the whole community (see water & wetlands topics).\n' +
          '• PPE basics: gloves for afterbirths & dead animals, boots in the kraal, masks when dusting grain (farmer\'s lung).\n' +
          '• This is also a MARKET asset: One Health-aligned farms pass audits and protect export reputations.\n\n' + D;
      },
        sources: [SOURCES.onehealth, SOURCES.woah, SOURCES.moa],
      buttons: buttons(['🏥 Vet office', '🐄 Livestock basics', '🧼 Food safety']),
    },
    {
      id: 'people-digital',
      title: 'Digital tools for farmers',
      category: 'people',
      keywords: ['digital tools', 'farm app', 'apps', 'mobile money', 'e extension', 'online markets', 'weather app', 'agritech', 'sms services', 'internet', 'connectivity', 'smartphone farming', 'digital literacy', 'data privacy', 'online scams'],
      questions: ['best farm apps', 'digital tools for smallholder farmers', 'mobile money in agriculture', 'e-extension services', 'avoiding online scams', 'farm data privacy'],
      answer() {
        return '📱 DIGITAL TOOLS FOR FARMERS:\n\n' +
          '• A basic phone + good questions beats an expensive app with no plan. Build digital skills in layers: 1) price & weather info, 2) records & mobile money, 3) markets & advisory.\n' +
          '• Information: official weather (Botswana Meteorological Services), market prices (BAMB bulletins, market visits), and verified advisory channels — cross-check anything that promises money.\n' +
          '• Records & money: spreadsheet/farm apps for records; mobile money for sales & input payments (safer than cash); keep paper backups.\n' +
          '• Markets: sell through aggregator apps/co-op platforms where available — but verify the buyer and payment terms first.\n' +
          '• e-extension: many districts run WhatsApp/radio extension groups — join; short training videos beat text for new skills.\n' +
          '• Data privacy: your farm data is valuable — know who collects it & why; never share ID/bank details with unknown apps; read what the app does with your data (see COMPLIANCE.md — we apply the same standards to AgriSphere).\n' +
          '• Scam radar: no legitimate buyer asks for advance "fees", "registration" or your OTP; "guaranteed government grants" via links are phishing — verify through official offices.\n' +
          '• Connectivity realities: download content at the office/library where Wi-Fi is free; USSD/SMS services work where apps don\'t.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc],
      buttons: buttons(['🌦️ Climate', '💰 Prices', '📈 Agribusiness']),
    },
  ],
};
