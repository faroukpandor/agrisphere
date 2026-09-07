'use strict';

/**
 * AgriSphere extended topics — MODULE A: all agricultural production systems.
 * Each entry: { id, title, category, keywords[], questions[], answer(), sources[] }
 * Sources are authoritative institutional / peer-reviewed-style references used
 * as the content basis; farmers get local verification pointers too.
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
  triggers: [],
  entries: [
    // ================= PRODUCTION SYSTEMS =================
    {
      id: 'prod-poultry',
      title: 'Poultry production (broilers & layers)',
      category: 'production',
      keywords: ['poultry', 'broiler', 'layers', 'chicken', 'chickens', 'day old chicks', 'feed', 'eggs', 'flock', 'biosecurity', 'coccidiosis', 'newcastle', 'gumboro', 'battery', 'deep litter', 'hatchery'],
      questions: ['how to start poultry farming', 'broiler production guide', 'layer chicken management', 'poultry feed programme', 'chicken diseases and prevention', 'poultry biosecurity', 'how many chickens should i start with'],
      answer() {
        return '🐔 POULTRY (broilers & layers):\n\n' +
          '• START small (50–200 birds) after a market check: who will buy, at what price, how often? Fresh eggs and live birds sell daily in villages; supermarkets want steady volumes and grading.\n' +
          '• Housing: dry, ventilated, predator-proof; 3–4 birds/m² for broilers, 3–5 layers/m²; deep-litter (wood shavings) or slatted. Clean water + feeders at all times.\n' +
          '• Broilers: 0–6 weeks to market weight with balanced starter→grower→finisher feed; feed is ~70% of cost — buy quality, store dry, never feed mouldy.\n' +
          '• Layers: point-of-lay pullets (16–18 wks) start laying ~22 wks; need layer mash, calcium (oyster shell), light ~14–16 h/day, and nest boxes.\n' +
          '• Vaccinate on schedule: Newcastle (day 1 + boosters), Gumboro — plus local schedule from your veterinary office; clean water with no chlorine residue on vaccine days.\n' +
          '• Biosecurity = profit: one-way movement (no visitors in shed), footbath at door, quarantine new/returned birds 2–3 weeks, control rodents/wild birds, clean & disinfect between batches, keep 2–3 weeks empty.\n' +
          '• Sick birds: isolate immediately; sudden deaths + bloody diarrhoea = suspect Newcastle/coccidiosis — call your vet before mass treatment.\n' +
          '• Cull and sell promptly at target weight — overfeeding broilers past 6–7 weeks burns profit.\n\n' + D;
      },
        sources: [SOURCES.woah, SOURCES.moa],
      buttons: buttons(['🐄 Livestock basics', '🏥 Vet office']),
    },
    {
      id: 'prod-smallstock',
      title: 'Goat & sheep (small stock) management',
      category: 'production',
      keywords: ['goat', 'goats', 'sheep', 'ram', 'buck', 'kidding', 'lambing', 'small stock', 'browsing', 'boer', 'ccpp', 'pasteurella', 'internal parasites', 'worm', 'fluke'],
      questions: ['goat farming for beginners', 'how to raise goats', 'sheep production botswana', 'goat diseases', 'buck to doe ratio', 'kidding management'],
      answer() {
        return '🐐 GOAT & SHEEP (small stock):\n\n' +
          '• Small stock = low entry cost, fast reproduction (2 kiddings/1.5 yrs), drought resilience — ideal starter livestock for women & youth.\n' +
          '• Stocking: match animals to veld — overstocking is the #1 killer (poor condition, worms, deaths in dry season). Rules of thumb: 1 LSU ≈ 6 goats / 8 sheep on moderate veld; adjust to your veld condition.\n' +
          '• Breeding: 1 mature buck : 25–30 does; keep replacement doelings from your best mothers; cull bad mothers, poor doers and aggressive bucks.\n' +
          '• Health calendar (ask vet office for your district): CCPP & pasteurella vaccines, plus enterotoxaemia; deworm strategically after rains (faecal testing where possible); foot care in wet years.\n' +
          '• Kidding/lambing: ensure a dry, warm creep area; colostrum within 2 hours; tag & record births — records grow wealth.\n' +
          '• Kid/lamb growth: weigh monthly; growth <100 g/day signals worms or poor milk — intervene.\n' +
          '• Browse & feed: goats are browsers (shrubs/trees) — provide browsing (mophane, acacia areas) not just grass; supplement pregnant/lactating does with legume hay or lick.\n' +
          '• Marketing: festive seasons spike prices; sell through auctions, butcheries and live-animal traders; condition-score animals before sale.\n\n' + D;
      },
        sources: [SOURCES.woah, SOURCES.moa, SOURCES.fao],
      buttons: buttons(['🐄 Livestock basics', '🏥 Vet office', '🛒 Selling']),
    },
    {
      id: 'prod-pigs',
      title: 'Piggery production',
      category: 'production',
      keywords: ['pig', 'pigs', 'piggery', 'pork', 'sow', 'piglet', 'swine', 'boar', 'farrowing', 'weaner', 'african swine fever', 'piggeries', 'pig feed'],
      questions: ['how to start a piggery', 'pig farming botswana', 'pig feed programme', 'sow and piglet care', 'african swine fever prevention'],
      answer() {
        return '🐖 PIGGERY:\n\n' +
          '• Pigs convert feed to meat fast and grow quickly — but they need daily care, clean water and strong biosecurity (African Swine Fever has no vaccine or cure).\n' +
          '• Housing: dry, warm, well-drained pens (1 sow ≈ 6–8 m² + creep area); pigs cannot sweat — shade & wallows/misting matter in summer.\n' +
          '• Breeding: gilt first served ~8 months / 120+ kg; gestation 114 days; farrowing crate + heat lamp for piglets; wean at 4–6 weeks.\n' +
          '• Feed: quality commercial grower rations or well-balanced home mixes; kitchen waste is risky (disease, salt, toxins) — if used, boil it and never feed raw meat waste (ASF risk!).\n' +
          '• ASF biosecurity: no outside pigs/visitors, no raw pork scraps, boot dips, quarantine new stock 30 days, buy only from tested herds — report suspicious deaths instantly (it is a notifiable disease).\n' +
          '• Piglets: iron injection at day 3 (pigs are born low-iron), castration & teeth clip per your vet\'s advice, creep feed from day 10.\n' +
          '• Marketing: pork moves via butcheries, hotels, and festive catering; secure buyers BEFORE expanding the herd.\n\n' + D;
      },
        sources: [SOURCES.woah, SOURCES.moa, SOURCES.fao],
    },
    {
      id: 'prod-aquaculture',
      title: 'Aquaculture (tilapia & catfish)',
      category: 'production',
      keywords: ['fish', 'aquaculture', 'tilapia', 'catfish', 'fish pond', 'pond', 'fingerlings', 'fish feed', 'cages', 'water quality', 'fishing', 'fish farming', 'aquaponics'],
      questions: ['how to start fish farming', 'tilapia farming botswana', 'fish pond construction', 'catfish production', 'fish feeding and water quality', 'where to buy fingerlings'],
      answer() {
        return '🐟 AQUACULTURE (tilapia & catfish):\n\n' +
          '• Fish farming needs water discipline: ponds, lined tanks or cages — each needs a reliable, legal water source and quality testing (pH 6.5–9, oxygen, temperature).\n' +
          '• Start with TILAPIA (hardy, plant-based diets) or AFRICAN CATFISH (grows fast, tolerates poor water, high-value). Fingerlings from certified hatcheries (ask DAR/BUAN for the nearest).\n' +
          '• Stocking: ~1–3 fish/m² in ponds for semi-intensive; overstocking = stunted fish & disease. Grade sizes every 4–6 weeks.\n' +
          '• Feeding: quality floating pellets (28–32% protein for tilapia, higher for catfish); feed 2–4% body weight daily, adjust by appetite & temperature — overfeeding pollutes the water.\n' +
          '• Water: 10–20% weekly exchange, aerate in hot weather, watch algae blooms at dawn; keep records of temperature & oxygen.\n' +
          '• Health: quarantine new fish, disinfect nets between ponds, remove dead fish daily; main killers are poor oxygen & handling stress, not exotic diseases.\n' +
          '• Economics: ponds are medium-term investments (6–9 months to first harvest) — arrange the market (hotels, fish shops, restaurants, fresh markets) before building.\n' +
          '• Never release farmed fish into natural rivers/dams (disease & genetic pollution of wild stocks).\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa],
      buttons: buttons(['💧 Water tips', '📈 Agribusiness']),
    },
    {
      id: 'prod-beekeeping',
      title: 'Beekeeping & honey production',
      category: 'production',
      keywords: ['bee', 'bees', 'beekeeping', 'honey', 'hive', 'apiary', 'beekeeper', 'pollination', 'beehive', 'wax', 'sting', 'swarm'],
      questions: ['how to start beekeeping', 'beekeeping in botswana', 'honey production guide', 'beehive types', 'beekeeping equipment', 'how to harvest honey'],
      answer() {
        return '🐝 BEEKEEPING:\n\n' +
          '• Beekeeping is low-input, women/youth-friendly, and DOUBLE-value: honey/wax income + free pollination that lifts yields of nearby crops (some orchards need bees to fruit at all).\n' +
          '• Start with 3–10 hives, not 50: learn one strong colony before scaling. Kenyan top-bar and Langstroth hives both work; buy from reputable local suppliers.\n' +
          '• Siting: near flowering plants (mophane, acacia, sunflower, morula, citrus), 100+ m from people/animals, facing away from wind, water source within ~1 km.\n' +
          '• Suit up: full suit, smoker, hive tool, gloves. Work bees mid-morning in good weather; move slowly, use smoke gently.\n' +
          '• Inspect every 7–10 days in season: queen & eggs present, no disease, honey stores, swarm signs. Re-queen aggressive/weak colonies.\n' +
          '• Pests & diseases: small hive beetle, wax moth, and (if imported) American foulbrood — keep hives strong, clean equipment, never feed honey from unknown sources to your bees.\n' +
          '• Harvest: take only surplus honey (leave 15–20 kg for the colony in dry seasons), extract clean, strain, bottle in food-grade containers, label honestly.\n' +
          '• Marketing: raw honey, comb honey and beeswax (cosmetics/candles) sell at premium; register with your district agriculture office & apiary associations where they exist.\n' +
          '• African honey bees are defensive: register your apiary, inform neighbours, and follow municipal bylaws on hive siting.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa],
    },
    {
      id: 'prod-agroforestry',
      title: 'Agroforestry & fruit trees',
      category: 'production',
      keywords: ['agroforestry', 'fruit trees', 'orange', 'mango', 'citrus', 'orchard', 'tree', 'trees', 'windbreak', 'fodder trees', 'morula', 'marula', 'mophane', 'planting trees', 'nursery trees', 'shade trees'],
      questions: ['how to start a fruit orchard', 'best fruit trees for botswana', 'agroforestry benefits', 'planting morula trees', 'citrus production guide', 'tree nursery business'],
      answer() {
        return '🌳 AGROFORESTRY & FRUIT TREES:\n\n' +
          '• Trees are long-term capital: fruit & nut income, fodder in dry season, windbreaks, shade for livestock, soil improvement and carbon value — all from the same land.\n' +
          '• Choose species for YOUR rainfall: Botswana is dry — citrus (with irrigation), mangoes (higher rainfall areas), guava, marula/morula (indigenous, drought-proof, commercial potential: Amarula-type markets, oil, juice), mophane (worms & timber).\n' +
          '• Orchard basics: deep planting holes + compost, grafted/budded certified trees from registered nurseries, basin irrigation for establishment (2–3 yrs), mulch rings.\n' +
          '• Agroforestry patterns: scattered trees in crop fields (faidherbia/ana-tree drops leaves in the wet season = natural fertiliser under your maize), tree lines as windbreaks, fodder banks of leucaena/pigeon pea for goats.\n' +
          '• Never clear everything: keep keystone trees — they shade, feed livestock and anchor the soil. Selective clearing beats slash-and-burn.\n' +
          '• Indigenous fruit (morula, mmilo, mogose) is under-commercialised: value-add (juice, dried fruit, oil) can pay better than field crops on marginal land.\n' +
          '• Community land: secure permission/lease before planting long-term trees — see the land/tenure guidance in my ethics & finance topics.\n' +
          '• Wildlife: fence young trees against goats & game; livestock guards protect orchards in wildlife areas.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.vggt, SOURCES.cc],
      buttons: buttons(['🌽 Crops', '🐐 Small stock', '📈 Agribusiness']),
    },
    {
      id: 'prod-conservation-ag',
      title: 'Conservation agriculture',
      category: 'production',
      keywords: ['conservation agriculture', 'minimum tillage', 'no till', 'zero till', 'mulching', 'crop rotation', 'soil cover', 'ripper', 'basin planting', 'climate smart', 'residue', 'direct seeding', 'planting basins'],
      questions: ['what is conservation agriculture', 'how to practice conservation agriculture', 'minimum tillage in botswana', 'conservation agriculture for smallholders', 'planting basins technique'],
      answer() {
        return '🌱 CONSERVATION AGRICULTURE (CA):\n\n' +
          '• CA = 3 linked principles proven across Southern Africa to cut risk and rebuild degraded soil:\n' +
          '   1. Minimum soil disturbance — rip or basin-plant instead of full ploughing;\n' +
          '   2. Permanent soil cover — keep crop residue/mulch on the surface;\n' +
          '   3. Crop rotation & diversity — rotate maize with legumes (cowpea, sunflower, sorghum).\n' +
          '• Why it works here: Botswana soils crust & blow when over-ploughed; mulch + basins trap every raindrop, raise infiltration and cut evaporation — visible wins in dry years.\n' +
          '• Getting started (small scale): hand-hoe basins (15×15×15 cm, spaced to your crop) filled with manure/compost — proven for smallholders without draught power; or use a ripper tine behind 2 oxen/a small tractor.\n' +
          '• Keep residue: graze stubble but leave ~30% cover; never burn crop residue — burning destroys the whole system\'s mulch & organic matter.\n' +
          '• Legumes in rotation fix nitrogen: after 2–3 seasons of CA + rotation, fertiliser bills fall measurably.\n' +
          '• CA is NOT a magic switch: expect a 2–3 year transition; weeds need early management (herbicide or timely weeding) in year one.\n' +
          '• Seek CCARDESA/CTA extension training days & your Ministry\'s CA demonstration plots in your district — seeing beats reading.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc, SOURCES.moa],
      buttons: buttons(['🌽 Maize guide', '🧪 Fertiliser basics', '💧 Water tips']),
    },
    {
      id: 'prod-rangeland',
      title: 'Rangeland & grazing management',
      category: 'production',
      keywords: ['rangeland', 'grazing', 'pasture', 'veld', 'overgrazing', 'rotational grazing', 'camp', 'bush encroachment', 'fodder', 'hay', 'stocking rate', 'grass', 'degradation', 'herding', 'kraal'],
      questions: ['how to manage grazing land', 'rotational grazing system', 'bush encroachment control', 'stocking rates botswana', 'fodder production', 'veld management', 'resting camps'],
      answer() {
        return '🌾 RANGELAND & GRAZING MANAGEMENT:\n\n' +
          '• The veld is your cheapest feed factory — protect it: grazing capacity is roughly 8–15 ha per livestock unit (LSU) in Botswana\'s sandwich/hardveld, and LESS in drought years. Overstocking is the root of most livestock poverty.\n' +
          '• Rotational grazing beats continuous grazing: split camps, graze 1–3 months, rest 3–6+ months (rest after seeding rains). Rested veld = more grass next year — it is free fertiliser.\n' +
          '• Bush encroachment (where trees/thorn scrub replace grass) can be reversed: controlled burning early in the dry season + browsing animals (goats/cattle browse), selective clearing, and re-seeding cleared patches.\n' +
          '• Fodder insurance: make hay/browse bales in good years and store for drought; keep a standing fodder bank of drought-hardy grass or browse (leucaena, pigeon pea).\n' +
          '• Water planning: spread watering points so animals don\'t trample one area; solar pumps beat diesel for borehole costs.\n' +
          '• Monitor: walk your camps each season; if perennial grasses are disappearing and annual weeds/forbs take over, you are overstocked — destock EARLY, prices are better before the drought hits.\n' +
          '• Communal areas: coordinate resting with neighbours/kgorla committees — one person\'s rested camp fails if the next camp is mobbed.\n' +
          '• This is core natural-resource stewardship: veld in good condition buffers droughts and floods alike.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa, SOURCES.iucn],
      buttons: buttons(['🐐 Small stock', '🌦️ Climate', '💧 Water tips']),
    },
    {
      id: 'prod-urban',
      title: 'Urban & backyard food production',
      category: 'production',
      keywords: ['urban farming', 'backyard garden', 'home garden', 'containers', 'keyhole garden', 'tyre garden', 'rooftop', 'school garden', 'kitchen garden', 'plot', 'backyard', 'vertical garden', 'drum'],
      questions: ['how to start a backyard garden', 'keyhole garden instructions', 'container vegetable gardening', 'urban farming botswana', 'school vegetable garden', 'rooftop gardening'],
      answer() {
        return '🏡 URBAN & BACKYARD FOOD PRODUCTION:\n\n' +
          '• Even 50 m² feeds a family: plan 3–5 beds of high-value leafies (morogo/kale/rape, spinach, onions, tomatoes, beetroot, chillies) for daily food + surplus sales to neighbours.\n' +
          '• Keyhole garden: 2 m round raised bed with central compost basket — uses ~⅓ the water, built from local materials, ideal for clinics/schools/village homes (proven across Southern Africa).\n' +
          '• Containers/tyres/drums: grow in anything food-safe with drainage holes — but containers dry fast: mulch + water daily in summer; use quality potting mix, not plain soil.\n' +
          '• Greywater: reuse bath/laundry water (low-soap, no bleach) on ornamentals & fruit trees — NOT directly on leafy veg you eat raw.\n' +
          '• Soil care in towns: old plots may carry lead/contamination — build raised beds with clean soil/compost rather than digging into unknown ground; compost kitchen waste.\n' +
          '• Veggies sell: fresh, clean bunches at the gate, to neighbours, local tuck-shops, and weekend markets — many urban farmers earn a full income from 200–500 m² with drip kits.\n' +
          '• Legal: check municipal bylaws on water use, structures and selling from home; form/join a gardeners\' association for land & market access.\n' +
          '• School/community gardens double as nutrition & youth-skills hubs — partner with schools, clinics and NGOs for tools & training.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.moa, SOURCES.cc],
      buttons: buttons(['🥬 Leafy veg', '💧 Water tips', '🛒 Selling']),
    },
    {
      id: 'prod-protected',
      title: 'Greenhouses, shade nets & hydroponics',
      category: 'production',
      keywords: ['greenhouse', 'shade net', 'shadenet', 'hydroponics', 'tunnel', 'polytunnel', 'fertigation', 'growing media', 'coco', 'nutrient solution', 'protected cultivation', 'vertical farming'],
      questions: ['greenhouse farming in botswana', 'how to start a greenhouse', 'shade net vs greenhouse', 'hydroponics for beginners', 'hydroponic fodder', 'greenhouse tomato production'],
      answer() {
        return '🏗️ PROTECTED CULTIVATION (greenhouse / shade net / hydroponics):\n\n' +
          '• Protected structures earn their cost through OFF-SEASON prices, water savings and quality — not through higher yield alone. First prove your market at the premium price, then build.\n' +
          '• Start with SHADE NET (30–50% shading) before a full greenhouse: 5–10× cheaper, ideal for leafy veg, peppers, seedlings; greenhouses earn most on high-value tomatoes/cucumbers/peppers out of season.\n' +
          '• Climate control is everything: venting + side nets (insects), cooling in summer, and Botswana\'s light is plentiful — manage HEAT first, cold rarely.\n' +
          '• Fertigation: drip + dissolved fertiliser applied 2–5× daily in small doses; test pH (5.5–6.5) and EC weekly with a cheap meter — nutrient mistakes show as leaf symptoms.\n' +
          '• Hydroponics (no soil, nutrient solution) works for lettuce/herbs/peppers and fodder — but it is technical: a nutrient error can kill a crop in days. Start small, keep a logbook, and monitor solution daily.\n' +
          '• Pest pressure inside is real: Tuta, whitefly, spider mite explode under cover — screen vents, use sticky traps, release biocontrols; don\'t spray-and-pray weekly (resistance!).\n' +
          '• Numbers that matter: cost per m², kg/m² you actually achieve, and the off-season price premium. Get 3 real quotes before investing; visit a working greenhouse nearby first.\n' +
          '• Training: BUAN/DAR and commercial nurseries run short courses — attend before big spend.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc, SOURCES.moa],
      buttons: buttons(['🍅 Tomato guide', '🐛 Tuta absoluta', '💧 Water tips']),
    },
    {
      id: 'prod-integrated',
      title: 'Integrated crop–livestock systems',
      category: 'production',
      keywords: ['integrated farming', 'mixed farming', 'crop livestock', 'manure cycle', 'nutrient cycling', 'synergy', 'farming system', 'diversified', 'residue', 'integrated system'],
      questions: ['what is integrated farming', 'crop livestock integration benefits', 'mixed farming system', 'how to recycle nutrients on farm', 'diversified farming income'],
      answer() {
        return '🔁 INTEGRATED CROP–LIVESTOCK SYSTEMS:\n\n' +
          '• Mixing crops + animals is the oldest and still best resilience tech: each enterprise feeds the other and one failure does not sink the farm.\n' +
          '• Nutrient loop: crop residue & weeds → livestock (feed) → manure → composted → fields (fertiliser). A well-managed herd can supply a large share of a field\'s fertility.\n' +
          '• Practical integration: graze stubble after harvest (with rest), kraal cattle on fields before ploughing/ripping, compost manure 3–6 months before spreading — fresh manure burns crops & seeds weeds.\n' +
          '• Feed vs soil balance: don\'t strip every stalk for feed — leave ~30% residue (CA principle) or return manure to the same field.\n' +
          '• Income smoothing: crops = cash lumps at harvest; livestock = savings account that grows, plus milk/eggs cash weekly; in drought, destock strategically instead of starving animals.\n' +
          '• Risk spread: a pest that kills maize rarely kills goats; diversify crops AND species within your labour & land limits — diversification costs management attention.\n' +
          '• Energy & water links: biogas from manure for cooking/lighting; aquaculture ponds reuse manure-nutrients (carefully, with water-quality monitoring).\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc, SOURCES.moa],
      buttons: buttons(['🌾 Rangeland', '🐔 Poultry', '🌱 Conservation ag']),
    },
    {
      id: 'prod-oyster',
      title: 'Oyster mushroom growing',
      category: 'production',
      keywords: ['mushroom', 'mushrooms', 'oyster mushroom', 'spawn', 'substrate', 'straw', 'growing room', 'fungi', 'shiitake'],
      questions: ['how to grow mushrooms', 'oyster mushroom farming', 'mushroom substrate preparation', 'mushroom farming income', 'where to buy mushroom spawn'],
      answer() {
        return '🍄 OYSTER MUSHROOMS:\n\n' +
          '• Mushrooms are the fastest cash from waste: oyster mushrooms grow on pasteurised straw/crop residue — low water, no land, indoors, harvest in 3–4 weeks from spawn.\n' +
          '• Setup: a clean, cool, ventilated room/shed (25–30 °C spawn run, 20–25 °C fruiting), high humidity (mist), indirect light.\n' +
          '• Process: pasteurise wheat/grass straw (hot water or lime), cool, mix with quality spawn (~2–5% by weight), pack into bags, cut slits, mist 2–3× daily.\n' +
          '• Harvest: pick before caps flatten, twist-don\'t-cut; refrigerate; shelf life is short (3–5 days) — sell fast to restaurants, hotels, markets; drying adds value.\n' +
          '• Yields: roughly 25–40% of substrate weight over 2–3 flushes (i.e., 10 kg dry straw → 2.5–4 kg mushrooms) — verify with your local trainer.\n' +
          '• Hygiene is everything: competitors (green mould) love the same conditions — pasteurise properly, keep the room clean, dispose of spent substrate away from the grow room (it makes great compost!).\n' +
          '• Learn from a working grower or short course first; mushroom clubs and some agricultural colleges teach it.\n' +
          '• Don\'t eat wild mushrooms unless an expert confirms them — many deadly lookalikes exist in Southern Africa.\n\n' + D;
      },
        sources: [SOURCES.fao, SOURCES.cc],
    },
  ],
};
