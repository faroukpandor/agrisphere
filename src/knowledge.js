'use strict';

/**
 * AgriSphere seed knowledge base.
 *
 * Content principles:
 *   - Honest, practical, Botswana-flavoured (BAMB price bulletins, Sebele,
 *     BUAN, Ministry of Agriculture extension officers) and NEVER a
 *     substitute for a local agronomist / vet / extension officer.
 *   - No fabricated market prices or chemical brand names — we teach users
 *     how to get authoritative numbers instead.
 *
 * Each entry: { id, title, category, keywords[], questions[], answer|fn }
 * The brain also learns new Q&A pairs at runtime (stored separately).
 */

const DISCLAIMER =
  '⚠️ This is general guidance, not a substitute for a professional ' +
  'agronomist or extension officer. For serious or spreading problems, take ' +
  'photos and samples to your nearest Ministry of Agriculture extension ' +
  'office or the Department of Agricultural Research (DAR) at Sebele.';

const DISEASE_DISCLAIMER =
  '🩺 Remember: diagnose with your eyes and your local extension officer, ' +
  'not a chatbot alone. When in doubt, treat a small test area first and ' +
  'always follow label instructions for any chemical.';

function buttons(list) {
  return list.map((label) => ({ label }));
}

module.exports = {
  DISCLAIMER,
  DISEASE_DISCLAIMER,

  // ---------------------------------------------------------------------------
  // INTENT TRIGGERS (checked before knowledge-base scoring)
  // ---------------------------------------------------------------------------
  triggers: [
    {
      id: 'greet',
      keys: ['hello', 'hi ', 'hey', 'good morning', 'good afternoon', 'good evening', 'dumela', 'howzit', 'how are you', 'hola'],
      answer(ctx) {
        const name = ctx.userName ? `, ${ctx.userName}` : '';
        return `Dumela${name}! 👋 Ke karabo ya gago — I'm ${ctx.botName}.\n\nI help with:\n• 🌽 Crops — planting, spacing, fertiliser, harvesting\n• 🩺 Crop doctor — describe sick-looking plants (yellow leaves, spots, holes, wilting...)\n• 💰 Market prices — where to check BAMB weekly prices\n• 🛒 Selling & marketplace tips\n\nType your question or tap a topic below. What are you farming or planning to grow?`;
      },
      buttons: buttons(['🌽 Crops', '🩺 Crop doctor', '💰 Prices', '🛒 Selling']),
    },
    {
      id: 'help',
      keys: ['help', 'menu', 'what can you do', 'options', 'start', 'begin', 'commands', 'what do you do'],
      answer() {
        return 'Here is what I can help with:\n\n' +
          '• 🌽 Crop guides — maize, sorghum, cowpeas, groundnuts, beans, sunflower, tomatoes, leafy vegetables, sweet potato\n' +
          '• 🩺 Crop doctor — describe symptoms: yellow leaves, spots, holes, wilting, stunted growth, rotten roots\n' +
          '• 🐛 Pests & diseases — fall armyworm, stalk borer, aphids, locusts, Tuta absoluta, blight, mildew, streak virus\n' +
          '• 💰 Prices & markets — how to check BAMB weekly bulletins and market days\n' +
          '• 🛒 Selling — marketplace etiquette, grading, storage for better prices\n' +
          '• 🧠 Teach me — type "teach: your question → my answer" and I will remember it for everyone\n' +
          '• 👎/👍 feedback — rate my answers so I keep learning\n\n' +
          'Try: "how do I plant maize?" or "my tomato leaves have holes".';
      },
      buttons: buttons(['🌽 Crops', '🩺 Crop doctor', '💰 Prices', '🧠 How do you learn?']),
    },
    {
      id: 'bye',
      keys: ['bye', 'goodbye', 'see you', 'exit', 'tsamaya', 'thank you good'],
      answer(ctx) {
        return `Tsamaya sentle${ctx.userName ? `, ${ctx.userName}` : ''}! 👋 Come back any time — and if I got something wrong, hit 👎 so I can learn. Happy farming! 🌱`;
      },
    },
    {
      id: 'thanks',
      keys: ['thank', 'thanks', 'ke a leboga', 'cheers', 'appreciated'],
      answer() {
        return 'You are most welcome! 🙌 Anything else — pests, planting, prices — I am right here. And a 👍 helps me learn what is useful.';
      },
      buttons: buttons(['👍', '👎']),
    },
    {
      id: 'whoareyou',
      keys: ['who are you', 'what are you', 'your name', 'about you', 'who made you', 'developer', 'creator'],
      answer(ctx) {
        return `I am ${ctx.botName} 🌍🌱 — an automated, self-learning agricultural assistant.\n\nI am built to serve farmers and agripreneurs on the Web, WhatsApp, Facebook Messenger and Telegram. I learn in three ways:\n1. You teach me — "teach: question → answer"\n2. You rate me — 👍/👎 on every answer\n3. Unanswered questions are queued for humans to answer, and once answered I remember them forever.\n\nMy knowledge focuses on Botswana agriculture (BAMB, extension services, DAR Sebele) and general best practice. I am open source under the GPL-3.0 licence.`;
      },
    },
    {
      id: 'teach-help',
      keys: ['teach', 'learn this', 'remember this', 'teach you', 'train you'],
      answer() {
        return 'Yes — teach me! 🧠 Use this format:\n\n   teach: <question> → <answer>\n\nExample:\n   teach: how much is a bag of fertiliser at Gaborone? → about P420 at most agro-dealers, confirm locally.\n\nI will remember it and answer everyone who asks. Try it!';
      },
    },
    {
      id: 'channels',
      keys: ['whatsapp', 'facebook messenger', 'messenger', 'telegram', 'sms', 'chatbot platforms', 'other channels', 'instagram'],
      answer() {
        return '📱 AgriSphere is built to run on many channels at once — Web, WhatsApp, Facebook Messenger and Telegram — all sharing ONE brain and ONE memory, so a lesson taught on WhatsApp is known on the website too.\n\nThe web version is live wherever this bot is hosted. The WhatsApp / Messenger / Telegram adapters are already coded and switch on when the platform tokens are added to the environment (see the README "Channels" section — Meta requires a business verification review for public WhatsApp use).\n\nTalk to the project maintainer (GitHub: faroukpandor/agrisphere) if you want a channel activated for your organisation.';
      },
    },
    {
      id: 'how-learn',
      keys: ['how do you learn', 'self learning', 'machine learning', 'ai model', 'neural', 'artificial intelligence'],
      answer() {
        return '🧠 How my "self-learning" works (no black boxes):\n\n1. 📝 When you say "teach: ...", your Q&A is stored and takes priority over my built-in knowledge.\n2. 👍/👎 Every answer you rate becomes a training signal a human/agronomist can review.\n3. ❓ Questions I cannot answer are added to a queue — the maintainer answers them once and every future farmer gets the answer.\n4. 🔁 My answers stay grounded: optional LLM mode (bring your own OpenAI key) drafts replies but only from retrieved knowledge + your farm context — no invented prices.\n\nIt is a humble but honest brain: it never guesses prices or pesticide dosages.';
      },
    },
    {
      id: 'disease-report',
      keys: ['report disease', 'report pest', 'extension officer', 'dar', 'sebele', 'plant clinic'],
      answer() {
        return 'To get an official diagnosis & control advice:\n\n• 📍 Your nearest Ministry of Agriculture extension office (Agricultural Resource Centre) — free advice and often free soil/plant checks.\n• 🔬 Department of Agricultural Research (DAR) — Sebele Research Station, near Gaborone: plant pathology and entomology services.\n• 🧑‍🌾 Botswana University of Agriculture & Natural Resources (BUAN, Sebele) research clinics.\n• 📱 Take clear close-up photos of the affected part (leaf top AND bottom, stem base, roots) plus a wide shot of the whole plant/field — they are essential for a remote ID.\n\n⚠️ Do not spray anything until a professional confirms the cause — wrong chemicals waste money and can kill pollinators.';
      },
    },
    {
      id: 'crops-menu',
      keys: ['crops', 'crop menu', 'which crops', 'crop options'],
      answer() {
        return '🌱 What are you growing (or planning)? I have detailed guides for:\n\n' +
          '• 🌽 Maize (mielie) — planting, spacing, fertiliser, FAW & streak\n' +
          '• 🌾 Sorghum (mabele) — drought-smart grain, birds\n' +
          '• 🌱 Cowpeas (dinawa) — soil-friendly legume\n' +
          '• 🥜 Groundnuts (manoko) — drying & aflatoxin care\n' +
          '• 🍅 Tomatoes — nursery to market, Tuta & blight\n' +
          '• 🥬 Leafy veg — morogo, kale, cabbage, rape\n' +
          '• 💧 Water & irrigation • 🧪 fertiliser & soil • 🐄 livestock\n\n' +
          'Just type, e.g. "how to grow tomatoes" or tap a button.';
      },
      buttons: buttons(['🌽 Maize', '🌾 Sorghum', '🍅 Tomatoes', '🥬 Leafy veg', '🥜 Groundnuts']),
    },
    {
      id: 'crop-doctor',
      keys: ['crop doctor', 'doctor', 'diagnose', 'diagnosis', 'plant sick', 'sick plant', 'crop disease', 'plant disease'],
      answer() {
        return '🩺 CROP DOCTOR — tell me:\n\n' +
          '1. Which crop? (maize, tomato, cowpea...)\n' +
          '2. Which part? (leaves, stem, roots, fruit/cob)\n' +
          '3. What do you see? Pick the closest words: yellowing • spots • holes • wilting • stunted • rotten • mouldy • streaks • curling • dying patches\n' +
          '4. How much of the field? (few plants or widespread)\n\n' +
          'Example: "my maize leaves have yellow stripes" or "tomato fruit rotting from the bottom".\n\n' +
          'For an official diagnosis, take photos/samples to your extension office or DAR Sebele. 📍';
      },
      buttons: buttons(['🩺 Tomato blight', '🩺 Maize streak', '🐛 Fall armyworm', '🏥 Extension office']),
    },
    {
      id: 'sell-menu',
      keys: ['selling', 'sell my', 'sell produce', 'market tips', 'where to sell', 'market my'],
      answer() {
        return '🛒 Selling — what are you selling?\n\n' +
          '• 🌽 Grain (maize/sorghum) → BAMB depots, grades & price bulletins\n' +
          '• 🥬 Vegetables / fresh produce → markets, supermarkets, vendors\n' +
          '• 🐄 Livestock → auctions, veterinary movement rules\n' +
          '• 📈 General agribusiness → records, pricing, funding\n\n' +
          'Tap a button or type e.g. "where can I sell my maize".';
      },
      buttons: buttons(['💰 Grain prices', '🥬 Vegetables', '🐄 Livestock', '📈 Agribusiness']),
    },
    {
      id: 'weather',
      keys: ['weather', 'forecast', 'rain today', 'will it rain', 'rain forecast', 'when will it rain', 'season forecast'],
      answer() {
        return '🌦️ I cannot see live forecasts, but here is how smart farmers plan:\n\n' +
          '• Check the official daily & seasonal forecasts from Botswana Meteorological Services — they publish the seasonal outlook before planting (radio, TV and website).\n' +
          '• Plant with the rains, but stagger: do not put all seed in the ground on day one of a false start.\n' +
          '• Choose varieties by season length: short-season crops/varieties for dry years.\n' +
          '• Keep contingency plans: cowpea or sorghum strip, early-maturing maize, water harvesting (see my water tips 💧).\n' +
          '• Local knowledge beats apps: listen to seasoned farmers in your kgotla/village about how the season feels.';
      },
      buttons: buttons(['💧 Water tips', '🌽 Maize guide']),
    },
    {
      id: 'vet-office',
      keys: ['vet', 'veterinary', 'livestock office', 'animal health', 'vaccination schedule', 'dipping calendar', 'livestock officer', 'report sick animal'],
      answer() {
        return '🐄 Livestock & veterinary services:\n\n' +
          '• Your nearest District Veterinary Office (Ministry of Agriculture) provides vaccinations (FMD, blackleg, anthrax, Newcastle...), dipping programmes, movement permits and disease control. Find yours through your extension officer or the District Agriculture Office.\n' +
          '• Botswana\'s beef export status depends on strict disease control: report ANY suspected FMD case immediately — do not move the animals.\n' +
          '• Vaccination calendar: ask your veterinary office for the current district schedule and mark the dates in your notebook/kgotla notices.\n' +
          '• Sick animal? Isolate it, wash your hands after handling, and call your vet before treating.\n\n' +
          'Ask me for livestock basics (goats, poultry, cattle).';
      },
      buttons: buttons(['🐄 Livestock basics', '🛒 Selling']),
    },
  ],

  // ---------------------------------------------------------------------------
  // KNOWLEDGE BASE
  // ---------------------------------------------------------------------------
  entries: [
    // ---- MAIZE --------------------------------------------------------------
    {
      id: 'crop-maize',
      title: 'Maize production guide',
      category: 'crop',
      keywords: ['maize', 'mielie', 'corn', 'plant', 'sow', 'grow', 'spacing', 'seed', 'variety', 'population', 'fertiliser', 'fertilizer', 'rain', 'harvest', 'yield', 'land prep', 'plough', 'dryland', 'rainfed'],
      questions: ['how do i plant maize', 'maize planting guide', 'when to plant maize in botswana', 'maize spacing', 'how much seed per hectare', 'maize fertiliser programme', 'how to grow maize', 'best maize variety botswana', 'maize yield per hectare', 'dryland maize planting'],
      answer() {
        return '🌽 MAIZE — quick production guide (Botswana dryland):\n\n' +
          '• 🌧️ Plant with the rains: usually late Nov–mid Jan in most areas; avoid late planting after mid-Feb — yield drops fast.\n' +
          '• 📏 Spacing: 90 cm between rows × 25–30 cm between plants ≈ 37,000–44,000 plants/ha.\n' +
          '• 🌱 Seed rate: 20–25 kg/ha for commercial hybrids; plant 2 seeds/station and thin to 1 after emergence.\n' +
          '• 💧 Varieties: short-season hybrids and OPVs (e.g. from seed houses / NAMPAK seed dealers) suit Botswana\'s rainfall — ask your agro-dealer for locally tested, drought-tolerant varieties.\n' +
          '• 🧪 Fertilisers: apply at planting e.g. 8:15:15 or similar compound at ~150–200 kg/ha, then top-dress with Urea or LAN (~100–150 kg/ha) at knee-high stage IF rain is good. Cheaper = manure or compost at 5–10 t/ha worked into rows.\n' +
          '• 🐛 Scout weekly for fall armyworm and stalk borer from emergence to tasselling.\n' +
          '• 🌽 Harvest at 15–18% moisture; dry cobs on racks, shell and store in clean, airtight, treated containers — never on the ground.\n\n' +
          'Ask me about maize pests (fall armyworm 🐛), diseases (streak virus 🩺), or BAMB maize prices 💰.\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🐛 Fall armyworm', '🩺 Maize streak', '💰 Maize price', '🌽 Whole maize guide']),
    },
    {
      id: 'crop-maize-harvest-storage',
      title: 'Maize harvest & storage',
      category: 'crop',
      keywords: ['maize', 'harvest', 'store', 'storage', 'dry', 'moisture', 'shell', 'cob', 'grain', 'weevil', 'silo', 'crib', 'bag'],
      questions: ['when is maize ready to harvest', 'how to dry maize', 'how to store maize grain', 'maize moisture content', 'grain storage pests'],
      answer() {
        return '🌽 MAIZE HARVEST & STORAGE:\n\n' +
          '• Signs of maturity: husks dry and papery, kernels hard with black layer at the base, grain moisture ~15–18%.\n' +
          '• Dry cobs on raised racks or in well-ventilated cribs — never directly on soil (rots and termites!).\n' +
          '• Shelling: by hand or machine once grain is dry; avoid crushing kernels.\n' +
          '• Storage: clean, dry, sealable bags/containers ONLY; treat grain with a registered grain protectant (ask your agro-dealer for the correct one for food grain) or use hermetic bags (e.g. Purdue Improved Crop Storage bags) — no chemicals needed.\n' +
          '• Check stored grain every 2 weeks: if you see live weevils, sieve, sun-dry and re-treat immediately.\n' +
          '• Sell or use the oldest stock first — grain loses quality fast after 6–9 months in poor storage.\n\n' + DISCLAIMER;
      },
    },
    {
      id: 'pest-fall-armyworm',
      title: 'Fall armyworm control',
      category: 'pest',
      keywords: ['fall armyworm', 'armyworm', 'faw', 'caterpillar', 'worms', 'larvae', 'eating leaves', 'whorl', 'frass', 'maize pest', 'holes in maize'],
      questions: ['how to control fall armyworm', 'fall armyworm in maize', 'what is eating my maize', 'armyworm treatment', 'fall armyworm scouting'],
      answer() {
        return '🐛 FALL ARMYWORM (FAW) — the #1 maize threat in Southern Africa:\n\n' +
          '• Identify: young caterpillars scrape leaves leaving "windowpane" patches; older ones chew ragged holes and dump wet sawdust-like frass in the whorl; 1–2 cm caterpillars, pale with dark head.\n' +
          '• Scout: from emergence to tasselling, inspect 20 plants in 5 spots weekly, focus on the whorl (morning is best).\n' +
          '• Cultural control: early, uniform planting; destroy volunteers & crop residue after harvest; hand-pick and crush egg masses and caterpillars in small plots.\n' +
          '• Natural control: conserve birds, ants, spiders, parasitic wasps; avoid spraying when natural enemies are active.\n' +
          '• Chemical control (ONLY if infestation is economic — roughly >30% of young plants damaged): use a registered insecticide from your agro-dealer/extension officer and apply into the whorl early morning or late afternoon; rotate chemical groups to delay resistance; follow label & safety gear strictly. For food safety, respect the pre-harvest interval!\n' +
          '• In small plots, hand-picking + ash/sand in the whorl works surprisingly well.\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🌽 Maize guide', '🩺 Crop doctor']),
    },
    {
      id: 'pest-stalk-borer',
      title: 'Stalk borer control',
      category: 'pest',
      keywords: ['stalk borer', 'stemborer', 'borer', 'dead heart', 'maize stem', 'hole in stem', 'sawdust', 'stem borer'],
      questions: ['how to control stalk borer', 'maize stems have holes', 'dead heart in maize', 'stalk borer treatment'],
      answer() {
        return '🐛 STALK BORER:\n\n' +
          '• Identify: small caterpillars bore into the stem; young plants show "dead heart" (centre leaf dries); older plants show holes with sawdust and break at the nodes, causing poor cobs or none.\n' +
          '• Control window: the caterpillar is only reachable by chemicals in the first 2–3 weeks after hatch, while it is still crawling to the whorl — after it bores in, spraying is useless.\n' +
          '• Cultural: plant early & uniformly at the start of the rains; destroy stubble after harvest (burn or plough in deeply — borer overwinters in stalks); rotate away from maize/sorghum.\n' +
          '• Chemical: a registered granular insecticide applied into the whorl at the right stage (ask extension officer / agro-dealer); apply early morning.\n' +
          '• In small plots: pull out and destroy dead-heart plants to remove the borer inside.\n\n' + DISCLAIMER;
      },
    },
    {
      id: 'disease-maize-streak',
      title: 'Maize streak virus',
      category: 'disease',
      keywords: ['maize streak', 'streak', 'yellow stripes', 'yellow lines', 'mottling', 'leafhopper', 'virus maize', 'dwarf', 'stunted maize'],
      questions: ['my maize leaves have yellow stripes', 'maize streak virus symptoms', 'yellow lines on maize leaves', 'maize leaves yellowing with stripes', 'what causes maize streak'],
      answer() {
        return '🩺 MAIZE STREAK VIRUS (MSV):\n\n' +
          '• Symptoms: fine pale-yellow streaks/stripes along the veins of younger leaves; plants look pale, stunted and produce small or no cobs. Spread by leafhoppers, not by touch or seed.\n' +
          '• Often confused with: nutrient deficiency (but that yellows older leaves evenly) — if unsure, your DAR/extension officer can confirm.\n' +
          '• Control:\n' +
          '   1. Use streak-tolerant/resistant varieties where available.\n' +
          '   2. Plant early with the first good rains (late plantings get hammered).\n' +
          '   3. Control the leafhopper vector and weeds (grass weeds host both).\n' +
          '   4. Rogue out badly infected plants early — they are a source for the leafhopper to spread.\n\n' + DISEASE_DISCLAIMER;
      },
      buttons: buttons(['🐛 Fall armyworm', '🩺 Crop doctor']),
    },

    // ---- SORGHUM ------------------------------------------------------------
    {
      id: 'crop-sorghum',
      title: 'Sorghum production guide',
      category: 'crop',
      keywords: ['sorghum', 'mabele', 'plant', 'grow', 'spacing', 'seed', 'fertiliser', 'harvest', 'drought', 'dryland'],
      questions: ['how to grow sorghum', 'sorghum planting guide', 'sorghum spacing botswana', 'when to plant sorghum', 'sorghum varieties', 'sorghum for malting'],
      answer() {
        return '🌾 SORGHUM (Mabele) — Botswana\'s climate-smart grain:\n\n' +
          '• Tolerates heat and drought far better than maize — the safer choice in low-rainfall areas (<450 mm).\n' +
          '• 🌧️ Plant with the rains, Nov–Jan depending on your area (early = better).\n' +
          '• 📏 Spacing: 75 cm rows × 15–20 cm between plants ≈ 70,000–90,000 plants/ha; seed rate ~8–12 kg/ha.\n' +
          '• 💧 Varieties: local and improved short-season types; ask for malting-quality varieties if selling to Kgalagadi Breweries / Chibuku value chains.\n' +
          '• 🧪 Fertilisers: modest — sorghum responds less than maize; apply small compound at planting (100–150 kg/ha) and top-dress only with good moisture.\n' +
          '• 🐛 Watch for stalk borer, shoot fly (causes dead heart in young plants) and quelea birds at grain fill — bird scaring pays near harvest.\n' +
          '• 🌾 Harvest when grain is hard; dry, thresh and store in treated, airtight containers.\n\n' + DISCLAIMER;
      },
    },
    {
      id: 'pest-quelea',
      title: 'Quelea / bird control in small grains',
      category: 'pest',
      keywords: ['quelea', 'birds', 'bird damage', 'sparrows', 'red billed', 'grain loss', 'scare birds', 'sorghum birds'],
      questions: ['how to protect sorghum from birds', 'quelea birds control', 'birds eating my sorghum', 'bird scaring methods'],
      answer() {
        return '🐦 QUELEA & GRAIN-EATING BIRDS:\n\n' +
          '• Quelea (red-billed quelea) can strip a sorghum/millet field in days around grain fill — act early, not when they arrive in thousands.\n' +
          '• Practical field methods: bird scarers patrolling at dawn/dusk; shiny reflective tape/streamers on poles; scarecrows moved every few days; netting over small high-value plots; plant a sacrificial border strip of a less valuable crop.\n' +
          '• Community approach: synchronise planting with neighbours so fields don\'t ripen one-by-one (birds focus on the earliest field).\n' +
          '• Aerial/chemical control of roosts is done by authorities (e.g. Ministry / Plant Protection) — do NOT attempt poisoning: it kills non-target birds and is regulated.\n\n' + DISCLAIMER;
      },
    },

    // ---- COWPEA / BEANS / GROUNDNUT -----------------------------------------
    {
      id: 'crop-cowpea',
      title: 'Cowpea production guide',
      category: 'crop',
      keywords: ['cowpea', 'dinawa', 'legume', 'plant', 'grow', 'spacing', 'grain', 'leaves', 'morogo', 'mono wa dinawa'],
      questions: ['how to grow cowpeas', 'cowpea spacing', 'when to plant cowpeas', 'cowpea varieties', 'growing dinawa'],
      answer() {
        return '🌱 COWPEA (Dinawa) — the farmer\'s nitrogen factory:\n\n' +
          '• Fixes its own nitrogen — improves soil for the next maize crop. Rotate with maize!\n' +
          '• 🌧️ Sow with the rains (Nov–Jan); it also does well as a relay crop.\n' +
          '• 📏 Spacing: 75 cm × 20 cm (or 50 cm × 20 cm for grain-only, higher plant population); seed ~15–25 kg/ha.\n' +
          '• Leaves (morogo) can be picked young for relish — pick sparingly if growing for grain.\n' +
          '• Pests: aphids (early), pod borers and sucking bugs (flowering onwards). Spray only with registered products at thresholds; aphids often collapse with rain + ladybirds.\n' +
          '• Harvest: pick pods as they dry (multiple pickings); thresh and sun-dry grain to <12% moisture before storage; treat against bruchids (weevils) — hermetic bags work well for small lots.\n\n' + DISCLAIMER;
      },
    },
    {
      id: 'crop-groundnut',
      title: 'Groundnut production guide',
      category: 'crop',
      keywords: ['groundnut', 'peanut', 'manoko', 'matokomane', 'plant', 'grow', 'spacing', 'seed', 'harvest', 'market'],
      questions: ['how to grow groundnuts', 'groundnut spacing', 'groundnut production botswana', 'when to harvest groundnuts', 'growing manoko'],
      answer() {
        return '🥜 GROUNDNUT (Manoko/Matokomane):\n\n' +
          '• Best on loose, sandy loam soils — hard clay blocks pod development. Never follow groundnuts with groundnuts in the same field (disease build-up).\n' +
          '• 🌧️ Sow after the rains are established (Dec–Jan in most of Botswana).\n' +
          '• 📏 Spacing: 75 cm × 15–20 cm, 1–2 seeds per station, ~60–80 kg/ha unshelled seed... check with your seed supplier.\n' +
          '• Key operations: earth-up (hill soil around plants) at flowering so pegs peg into soil; keep weeds out early.\n' +
          '• Signs of maturity: leaves yellow, inner shell brown veined; dig up a test plant and check.\n' +
          '• After harvest: sun-dry plants 3–5 days, pick pods, dry to low moisture, store in shell until sale — aflatoxin risk rises with poor drying! Never eat or sell badly mouldy nuts.\n' +
          '• Market: BAMB depots and local processors buy groundnuts; grade for size/colour for better prices.\n\n' + DISCLAIMER;
      },
    },

    // ---- VEGETABLES ----------------------------------------------------------
    {
      id: 'crop-tomato',
      title: 'Tomato production guide',
      category: 'crop',
      keywords: ['tomato', 'tomatoes', 'plant', 'grow', 'seedling', 'transplant', 'stake', 'fertiliser', 'greenhouse', 'open field', 'irrigation'],
      questions: ['how to grow tomatoes', 'tomato spacing', 'tomato seedling production', 'tomato staking', 'tomato fertiliser', 'growing tomatoes for market'],
      answer() {
        return '🍅 TOMATOES:\n\n' +
          '• Nursery first: sow in trays/seedbed 4–6 weeks before transplant; harden off before planting out. Use certified seed (open-pollinated or hybrid) from reputable dealers.\n' +
          '• 🌱 Transplant at 4–6 true leaves, spacing 60–90 cm × 40–50 cm depending on variety and staking.\n' +
          '• Staking/trellising: strongly recommended for market production — fewer rots, easier picking, higher yields.\n' +
          '• 💧 Irrigate regularly and evenly — irregular water causes blossom-end rot (black sunken bottom) and fruit cracking.\n' +
          '• 🧪 Fertilisers: balanced compound at planting + weekly fertigation once fruiting; calcium matters (prevents blossom-end rot).\n' +
          '• 🐛 Watch: Tuta absoluta (leaf miner — see my Tuta entry), whiteflies, aphids; diseases: early blight, late blight, bacterial wilt. Scout twice a week!\n' +
          '• Sell graded: clean, uniform, damage-free fruit in ventilated crates — supermarkets pay more for graded produce.\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🐛 Tuta absoluta', '🩺 Tomato blight', '🍅 Whole tomato guide']),
    },
    {
      id: 'pest-tuta',
      title: 'Tuta absoluta control',
      category: 'pest',
      keywords: ['tuta', 'absoluta', 'leaf miner', 'tomato pest', 'mines leaves', 'tunnels', 'tomato caterpillar', 'borer in fruit', 'serpentine'],
      questions: ['how to control tuta absoluta', 'tuta in tomatoes', 'tomato leaves have tunnels', 'leaf miner in tomato', 'tomato fruit borer'],
      answer() {
        return '🐛 TUTA ABSOLUTA (tomato leaf miner) — tomato\'s worst enemy:\n\n' +
          '• Identify: tiny moths (active at dusk); larvae make see-through "mines"/tunnels in leaves, bore into stems and fruit (small black entry holes).\n' +
          '• It is a night-time pest — daytime sprays miss it. Spray late afternoon/evening if you must spray.\n' +
          '• IPM stack:\n' +
          '   1. Mass trapping with pheromone/water traps — monitors AND reduces populations.\n' +
          '   2. Remove & destroy mined leaves and infested fruit (do not compost — bag and burn/bury).\n' +
          '   3. Netting on greenhouse vents; weed control around the field.\n' +
          '   4. Biological: the predator Nesidiocoris and Bacillus thuringiensis (Bt) products work where available.\n' +
          '   5. Chemicals ONLY as a last resort: rotate between different chemical groups (it resists fast), and respect pre-harvest intervals.\n' +
          '• Crop rotation + a 4–6 week tomato-free gap between seasons breaks the cycle.\n\n' + DISCLAIMER;
      },
    },
    {
      id: 'disease-tomato-blight',
      title: 'Tomato blight (early & late)',
      category: 'disease',
      keywords: ['blight', 'tomato disease', 'brown spots leaves', 'leaf spots tomato', 'dead patches', 'late blight', 'early blight', 'white mould leaves', 'rotten fruit', 'dark lesions'],
      questions: ['my tomato leaves have brown spots', 'tomato blight treatment', 'early blight on tomatoes', 'late blight tomatoes', 'tomato leaves dying from bottom'],
      answer() {
        return '🩺 TOMATO BLIGHT:\n\n' +
          '• EARLY blight: target-like brown spots with concentric rings on older leaves; leaves yellow and die from the bottom up. Fungal — worse in humid, warm weather.\n' +
          '• LATE blight: large greasy dark patches on leaves/stems, white fuzzy mould underneath in humid weather; fruit gets greasy brown rot. Fast and destructive — act the same day you spot it.\n' +
          '• Control:\n' +
          '   1. Preventive copper-based fungicides at the right interval (ask your agro-dealer / extension officer for the current registered options and rates).\n' +
          '   2. Water at the base, morning only — wet leaves = blight party.\n' +
          '   3. Space plants & prune lower leaves for airflow; mulch to stop rain splash.\n' +
          '   4. Remove badly infected plants/branches immediately; never compost infected material.\n' +
          '   5. Rotate: do not plant tomatoes/peppers/potatoes in the same spot for 2+ years.\n\n' + DISEASE_DISCLAIMER;
      },
    },
    {
      id: 'crop-leafyveg',
      title: 'Leafy vegetables (morogo/kale) guide',
      category: 'crop',
      keywords: ['morogo', 'kale', 'spinach', 'rape', 'cabbage', 'leafy', 'vegetables', 'mustard', 'swana morogo', 'amaranth', 'thepe', 'delele', 'okra'],
      questions: ['how to grow morogo', 'growing kale in botswana', 'cabbage spacing', 'spinach production', 'traditional leafy vegetables'],
      answer() {
        return '🥬 LEAFY VEGETABLES (Morogo, kale, rape, cabbage):\n\n' +
          '• Traditional morogo (wild/weedy amaranth, thepe, delele) is nutritious, drought-hardy and in demand at markets — let some self-seed in your garden.\n' +
          '• 🌱 Start cabbage/kale/rape in a nursery 4–6 weeks before transplant; spacing: kale/rape 30–45 cm apart, cabbage 45–60 cm.\n' +
          '• 💧 Irrigate consistently — leafy veg bolt (flower early) and turn bitter under stress.\n' +
          '• 🧪 Fertilisers: leafy crops love nitrogen — apply compost/manure at planting and top-dress with LAN/urea (or liquid manure tea) every 2–3 weeks.\n' +
          '• 🐛 Watch: diamondback moth and aphids on brassicas (kale/cabbage/rape) — small plots: squash aphids by hand or soapy water spray; netting over the bed stops most moths.\n' +
          '• Harvest: pick outer leaves regularly (cut-and-come-again) — morogo regrows fast and keeps yielding for months.\n' +
          '• Marketing: wash, tie in clean bunches, deliver early to market/green grocers — freshest bunches sell first.\n\n' + DISCLAIMER;
      },
    },

    // ---- FERTILISER & SOIL ---------------------------------------------------
    {
      id: 'soil-fertiliser',
      title: 'Fertiliser & soil basics',
      category: 'soil',
      keywords: ['fertiliser', 'fertilizer', 'manure', 'compost', 'npk', 'urea', 'lan', 'compound', 'top dress', 'basal', 'lime', 'soil test', 'nutrient', 'deficiency', 'yellow leaves', 'organic', 'dap', '8:15:15', '2:3:2'],
      questions: ['which fertiliser should i use', 'how much fertiliser for maize', 'how to make compost', 'soil testing in botswana', 'yellow leaves nutrient deficiency', 'organic vs chemical fertiliser', 'fertiliser prices'],
      answer() {
        return '🧪 FERTILISER & SOIL BASICS:\n\n' +
          '• Soil test first (P50–150 at labs like DAR Sebele / BUAN or private labs) — fertiliser you don\'t need is money wasted. Test every 2–3 years per field.\n' +
          '• NPK numbers (e.g. 2:3:2 or 8:15:15): N = leaf growth, P = roots/seedling vigour, K = fruit/strength. Compound (basal) at planting; nitrogen-only top-dress (urea/LAN) at the growth spurt.\n' +
          '• Manure/compost: 5–10 t/ha worked in before planting improves structure and water holding — apply composted (never fresh) manure to avoid burning and weed seeds.\n' +
          '• Quick compost: layers of green material + dry material + soil/old compost, kept moist, turned every 2–3 weeks; ready in 6–12 weeks.\n' +
          '• Yellowing patterns hint: older leaves yellow = nitrogen shortage; younger leaves yellow = iron/zinc or waterlogging; purple older leaves = phosphorus. Confirm with a soil/leaf test before buying anything.\n' +
          '• Prices vary by dealer and season — compare 2–3 agro-dealers and buy early (prices rise at planting time). BAMB and the Ministry publish input price bulletins.\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🍅 Yellow leaves?', '🌽 Maize guide', '💰 Prices']),
    },

    // ---- WATER / WEATHER -----------------------------------------------------
    {
      id: 'irrigation-water',
      title: 'Water management & irrigation',
      category: 'water',
      keywords: ['irrigation', 'watering', 'drip', 'sprinkler', 'water', 'borehole', 'drought', 'mulch', 'water saving', 'rainwater', 'harvesting water', 'dry spell', 'soil moisture'],
      questions: ['how to irrigate my vegetables', 'drip vs sprinkler', 'water saving methods', 'mulching benefits', 'rainwater harvesting', 'coping with dry spells', 'borehole water for irrigation'],
      answer() {
        return '💧 WATER MANAGEMENT:\n\n' +
          '• Mulch is your cheapest irrigation: 5–10 cm of grass/straw/leaves over the root zone cuts evaporation hugely and feeds the soil as it rots.\n' +
          '• Drip (bucket-kit or full system) uses 30–50% less water than sprinklers and keeps leaves dry (fewer diseases). Water in the early morning.\n' +
          '• Irrigate deeply but less often — shallow frequent watering makes shallow roots that panic in dry spells.\n' +
          '• Rainwater harvesting: roof gutters → tanks (1 mm rain on 100 m² roof ≈ 100 L); road/yard runoff into a lined pond for orchard/garden.\n' +
          '• Dry spells: plant with the rains but have a contingency crop (cowpea, sorghum, sweet potato) — Botswana rainfall is feast or famine.\n' +
          '• Borehole water: test salinity first — salty water ruins soil over years (white crust = trouble).\n' +
          '• The Ministry of Agriculture & DAR publish drought-coping crop advice each season — ask your extension officer for the current season\'s bulletin.\n\n' + DISCLAIMER;
      },
    },

    // ---- MARKETS -------------------------------------------------------------
    {
      id: 'market-bamb',
      title: 'BAMB & grain marketing',
      category: 'market',
      keywords: ['bamb', 'price', 'prices', 'market', 'sell', 'grain', 'maize price', 'sorghum price', 'gaborone market', 'depot', 'parastatal', 'buyers', 'pula per tonne', 'where to sell', 'commodity'],
      questions: ['what is the price of maize', 'current grain prices botswana', 'where can i sell my maize', 'bamb depots', 'how to sell to bamb', 'sorghum price today', 'grain price bulletin'],
      answer() {
        return '💰 GRAIN PRICES & MARKETING IN BOTSWANA:\n\n' +
          '• The Botswana Agricultural Marketing Board (BAMB) is the main buyer of maize, sorghum and other grains — check its CURRENT depot prices and buying calendar. Prices are set weekly-ish per depot and grade, so always confirm the latest bulletin (BAMB offices, their website, or your extension officer).\n' +
          '• Grade matters: clean, dry (≤12.5% moisture), well-graded grain earns top price; foreign matter and weevils get deductions or rejection.\n' +
          '• Bags: use clean, new or well-washed grain bags — BAMB has bag standards.\n' +
          '• Delivery timing: prices often improve mid-season when supply is short — good storage lets you sell later at a better price.\n' +
          '• Alternatives: local millers, feedlots and informal markets can pay premiums for small lots of quality grain — shop around before committing.\n' +
          '• I do not invent prices — numbers change weekly. Ask me for the method: the BAMB bulletin + your extension officer are the two authoritative sources. 💡\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🌽 Maize guide', '🛒 Selling tips', '🥜 Groundnuts']),
    },
    {
      id: 'market-veg',
      title: 'Vegetable marketing tips',
      category: 'market',
      keywords: ['sell vegetables', 'market vegetables', 'vegetable prices', 'gaborone', 'supermarkets', 'hawker', 'vendors', 'wholesale', 'retail', 'fresh produce', 'grading', 'market stall'],
      questions: ['where to sell vegetables in botswana', 'how to price vegetables', 'selling to supermarkets', 'vegetable grading and packing', 'fresh produce market gaborone'],
      answer() {
        return '🛒 SELLING VEGETABLES:\n\n' +
          '• Know your buyer: supermarkets want volume, grading, packaging and delivery reliability; street vendors/hawkers want daily small lots; weekend markets (e.g. Main Mall, local kgotla markets) want fresh, clean bunches.\n' +
          '• Grade before you sell: sort by size/quality, remove damaged leaves, wash produce, tie/bag cleanly. Graded produce earns 20–50% more and gets repeat buyers.\n' +
          '• Price with margin: cost of inputs + labour + transport + a fair profit; check competitor prices weekly and adjust.\n' +
          '• Delivery: early morning deliveries sell best; keep produce shaded and damp-cooled.\n' +
          '• Records: keep a simple notebook (or ask me for record-keeping tips) — crops, costs, sales per week. Farmers who track numbers negotiate better.\n' +
          '• Never undercut your neighbour into poverty — organise with other smallholders for joint deliveries to meet supermarket volumes.\n\n' + DISCLAIMER;
      },
    },

    // ---- LIVESTOCK -----------------------------------------------------------
    {
      id: 'livestock-basics',
      title: 'Livestock basics (cattle, goats, poultry)',
      category: 'livestock',
      keywords: ['cattle', 'goats', 'sheep', 'poultry', 'chicken', 'livestock', 'veterinary', 'vaccination', 'dip', 'foot and mouth', 'fmd', 'lumpy skin', 'newcastle', 'bacterial', 'parasites', 'vet'],
      questions: ['livestock vaccination schedule', 'foot and mouth disease botswana', 'goat keeping basics', 'poultry farming for beginners', 'lumpy skin disease', 'cattle dipping', 'how to raise chickens'],
      answer() {
        return '🐄 LIVESTOCK BASICS:\n\n' +
          '• Vaccination calendar is non-negotiable — Botswana runs official programmes (e.g. FMD, blackleg, anthrax for cattle; Newcastle & Gumboro for poultry). Your veterinary office (Ministry of Agriculture) publishes the schedule and often supplies vaccines — ask them for YOUR district\'s calendar.\n' +
          '• FMD (foot-and-mouth): controlled movement zones exist — always get a movement permit; never buy animals of unknown origin. Report any suspected case immediately — it protects the whole country\'s export beef industry.\n' +
          '• Dipping/tick control: follow the district dipping calendar; ticks spread heartwater, anaplasmosis and cause wounds.\n' +
          '• Poultry: start small (25–50 birds) with day-old chicks from a reputable hatchery; brooder warmth for the first 4 weeks; clean water + balanced feed; strict hygiene keeps Newcastle out — it kills whole flocks within days.\n' +
          '• Record ear-tags/notches and births — you cannot manage what you do not count.\n' +
          '• Sick animal? Isolate it immediately, call your veterinary officer — do NOT treat with leftovers.\n\n' + DISCLAIMER;
      },
      buttons: buttons(['🐄 Vet contacts', '🛒 Selling']),
    },

    // ---- SELLING / AGRIBUSINESS ----------------------------------------------
    {
      id: 'agribusiness',
      title: 'Agribusiness & record keeping',
      category: 'business',
      keywords: ['record keeping', 'business', 'agribusiness', 'profit', 'loan', 'finance', 'youth', 'grant', 'cii', 'lejweleputswa', 'young farmers', 'start farming', 'farming as business', 'budget', 'cost', 'income'],
      questions: ['how do i start a farming business', 'record keeping for farmers', 'farming loans in botswana', 'youth in agriculture funding', 'how to make profit in farming', 'cii farmers', 'agricultural grants'],
      answer() {
        return '📈 AGRIBUSINESS & RECORD KEEPING:\n\n' +
          '• Farming is a business: separate farm money from home money from day one. Track for each field/enterprise: inputs bought, hours worked, produce sold.\n' +
          '• Simple records: a notebook or spreadsheet with 3 lists — (1) money in, (2) money out, (3) activities (planting, sprays, harvest dates). Review monthly.\n' +
          '• Know your break-even: cost per hectare/animal ÷ expected yield = the price you must beat. Never sell below it without a plan.\n' +
          '• Funding & support channels in Botswana: CEDA (Citizen Entrepreneurial Development Agency), Young Farmers Fund, NDB (National Development Bank), plus Ministry of Agriculture programmes — each has its own qualifying rules and application windows; visit their offices or websites for the current cycle.\n' +
          '• Start small and prove the system before scaling: one well-run hectare beats five neglected ones.\n' +
          '• Join a farmers\' association / producer group: joint buying of inputs, joint selling of produce, shared machinery and knowledge.\n\n' + DISCLAIMER;
      },
    },
  ],
};
