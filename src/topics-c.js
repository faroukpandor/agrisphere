'use strict';

/**
 * AgriSphere extended topics — MODULE C: cattle systems (feedlot, dairy,
 * welfare), more crops (sunflower, sweet potato), pest emergencies (locusts,
 * weeds/IPM), land tenure, value addition, nutrition-sensitive farming,
 * value chains & aggregation.
 */

const D = '⚠️ General guidance — confirm with local extension/veterinary officers, technical manuals and current regulations before investing.';

function buttons(list) {
  return list.map((label) => ({ label }));
}

module.exports = {
  triggers: [],
  entries: [
    {
      id: 'crop-sunflower',
      title: 'Sunflower production',
      category: 'crop',
      keywords: ['sunflower', 'oil seed', 'oilseed', 'cooking oil', 'bird seed', 'sunflower cake', 'crushing', 'seed rate', 'plant sunflower'],
      questions: ['how to grow sunflower', 'sunflower production botswana', 'sunflower spacing and seed rate', 'sunflower market', 'sunflower for oil'],
      answer() {
        return '🌻 SUNFLOWER:\n\n' +
          '• A hardy cash crop for dryland: tolerates heat and some drought; fits rotations (break for maize pests/diseases) and leaves residue for soil cover.\n' +
          '• 🌧️ Sow with the rains (Nov–Dec in most areas); it hates waterlogging — choose well-drained fields.\n' +
          '• 📏 Spacing: 75–90 cm rows × 30–40 cm in-row → 30,000–40,000 plants/ha; seed rate 4–6 kg/ha (hybrid) — plant 2 seeds/station and thin.\n' +
          '• Varieties: short-season hybrids mature ~110–120 days; open-pollinated types need slightly longer.\n' +
          '• 🧪 Fertilisers: modest; small compound at planting; nitrogen top-dress only with good moisture. Sunflower is efficient on phosphorus-poor soils but responds where fertility is built.\n' +
          '• Harvest: when backs of heads are yellow-brown and seeds test ~10% moisture; dry heads, thresh carefully (don\'t crack seed), store clean & dry.\n' +
          '• Markets: oil crushers, bird-seed trade, and sunflower cake (livestock feed) — check buyers & contracts BEFORE planting large areas; prices move with world oilseed markets.\n' +
          '• Birds (quelea/doves) can hit ripening heads — scare during grain fill.\n\n' + D;
      },
        sources: ['FAO technical guidelines', 'CCARDESA/CTA SADC practice notes', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🌾 Sorghum guide', '🐦 Quelea birds', '💰 Prices']),
    },
    {
      id: 'crop-sweetpotato',
      title: 'Sweet potato production',
      category: 'crop',
      keywords: ['sweet potato', 'sweetpotato', 'vines', 'slips', 'orange fleshed', 'ofsp', 'root crop', 'storage roots', 'sweet potato weevil', 'curing'],
      questions: ['how to grow sweet potatoes', 'sweet potato production botswana', 'orange fleshed sweet potato', 'sweet potato vine planting', 'sweet potato weevil control'],
      answer() {
        return '🍠 SWEET POTATO:\n\n' +
          '• A climate-smart food & cash crop: tolerant of poor soils & dry spells, few pest emergencies, and orange-fleshed varieties (OFSP) fight vitamin-A deficiency — nutrition AND income.\n' +
          '• Planting material: use disease-free VINES/slips from a reliable source (not market roots) — plant on ridges/mounds after rains start or under irrigation.\n' +
          '• 📏 Spacing: 90–100 cm ridges × 30 cm = ~30,000–35,000 plants/ha; plant 2–3 nodes deep, keep the tip above soil.\n' +
          '• Care: weed early (first 6 weeks), stop watering 2–3 weeks before harvest (dry soil = firmer, sweeter roots & better storage), and don\'t over-fertilise with nitrogen (all vine, no roots).\n' +
          '• 🐛 Sweet potato weevil is the main pest: use clean vines, rotate, mound/ridge so cracks don\'t expose roots, harvest on time & destroy infested roots/vines.\n' +
          '• Harvest at 3.5–5 months (maturity signs: yellowing leaves, roots plump); dig gently, cure 4–7 days in warm shade (heals scratches, sweetens), then store cool & dry.\n' +
          '• Markets: fresh roots at markets & supermarkets; OFSP for bakeries & baby-food programmes; vines sell as planting material too.\n\n' + D;
      },
        sources: ['FAO technical guidelines', 'CCARDESA/CTA SADC practice notes', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🥬 Leafy veg', '🧪 Fertiliser basics', '🛒 Selling']),
    },
    {
      id: 'pest-locust',
      title: 'Locusts & migratory pest emergencies',
      category: 'pest',
      keywords: ['locust', 'locusts', 'hoppers', 'swarm', 'migratory pest', 'grasshoppers', 'african migratory', 'red locust', 'outbreak', 'plague'],
      questions: ['how to control locusts', 'locust outbreak what to do', 'migratory pest reporting', 'hoppers in my field', 'locust spraying safety'],
      answer() {
        return '🦗 LOCUSTS & MIGRATORY PESTS:\n\n' +
          '• Locusts are a NATIONAL emergency pest: outbreaks are coordinated by government (Ministry of Agriculture plant protection unit) — you cannot control a swarm alone, and you MUST NOT self-spray with aerial chemicals.\n' +
          '• Report immediately: tell your extension officer / district agriculture office as soon as you see hopper bands or adult swarms, with location & estimated size. Early reporting is what stops plagues.\n' +
          '• Do\'s: harvest what you can early; protect young crops with nets where feasible; keep records for any support.\n' +
          '• Don\'ts: don\'t burn fields in panic (destroys your soil & feed); don\'t buy unregistered chemicals; don\'t eat poisoned locusts; follow official control notices about re-entry & harvest intervals after spraying.\n' +
          '• Community action: hopper bands on communal land need joint reporting — alert neighbouring farmers & your kgotla so the authorities get one clear picture.\n' +
          '• Prevention between outbreaks: healthy diversified fields, early planting, and monitoring (the hoppers that survive become the next swarm).\n\n' + D;
      },
        sources: ['FAO locust watch guidance', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🐛 Fall armyworm', '🏥 Extension office', '🌱 Conservation ag']),
    },
    {
      id: 'crop-weeds',
      title: 'Weed management & integrated weed control',
      category: 'pest',
      keywords: ['weed', 'weeds', 'herbicide', 'striga', 'witchweed', 'hand weeding', 'mulching weeds', 'weed competition', 'couch grass', 'burial', 'integrated weed management'],
      questions: ['how to control weeds cheaply', 'striga in maize', 'herbicide selection', 'when to weed', 'weed management in conservation agriculture', 'invasive weeds'],
      answer() {
        return '🌿 WEED MANAGEMENT (integrated approach):\n\n' +
          '• Weeds steal water, nutrients and light in the first 4–8 weeks — the critical weed-free period: fields weeded late lose 20–60% of yield silently.\n' +
          '• Cheap & effective: weed EARLY and SHALLOW (don\'t bury your crop or bring up new seed); repeat at 3–4 weeks; mulch & crop cover suppress weeds naturally.\n' +
          '• Striga (witchweed) is the worst cereal parasite in Africa: it attacks maize/sorghum roots. Fight it with: resistant/tolerant varieties, legume rotation/trap crops, hand-pull & BURN striga before it seeds, and soil fertility (striga loves poor soil). One striga plant makes thousands of seeds — never let it flower in your field.\n' +
          '• Herbicides: use registered products at label rates with proper nozzles/gear; rotate chemical groups to slow resistance; spot-spray rather than broadcast where possible.\n' +
          '• In conservation agriculture, residue mulch + glyphosate-based pre-plant burn-down (where registered) or timely hand-weeding manage weeds — don\'t abandon CA because of weeds; manage them earlier.\n' +
          '• Invasive aliens (e.g. certain thornbush, water weeds): report & follow district invasive-species programmes — never spread them via fodder or soil.\n' +
          '• Prevention: clean equipment & seed, stop weeds at the fence line before they seed into your field.\n\n' + D;
      },
        sources: ['CABI (peer-reviewed compendia)', 'FAO technical guidelines', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🌱 Conservation ag', '🌽 Maize guide', '🧪 Fertiliser basics']),
    },
    {
      id: 'cattle-feedlot',
      title: 'Cattle fattening & feedlots',
      category: 'production',
      keywords: ['feedlot', 'fattening', 'cattle fattening', 'pen fattening', 'finishing', 'weight gain', 'feed conversion', 'growth promotants', 'beef grades', 'cull cows', 'weaner', 'feedlot ration'],
      questions: ['how to start cattle fattening', 'feedlot basics', 'pen fattening vs grazing', 'cattle feed rations', 'feedlot profitability botswana', 'fattening cull cows'],
      answer() {
        return '🐂 CATTLE FATTENING & FEEDLOTS:\n\n' +
          '• Fattening buys animals cheap (dry season / after drought), feeds them for 60–120 days, and sells at the premium grade — it monetises feed & management instead of land alone.\n' +
          '• Start small & simple: pen fattening of 10–30 weaners/cull cows with a roughage+concentrate ration beats jumping into a big feedlot. Total mixed ration quality & consistency is everything.\n' +
          '• Ration basics: good roughage (hay/stover/silage) + energy (maize, sorghum) + protein (sunflower cake, legumes) + minerals (salt/lick); introduce new feed over 10–14 days; clean fresh water 24/7.\n' +
          '• Expected gains: 0.8–1.3 kg/day for well-managed growing cattle (breed & condition dependent) — weigh monthly and adjust feed; if gains stall, check feed quality, parasites & health.\n' +
          '• Health: vaccinate & deworm on entry (quarantine 2–3 weeks), watch for acidosis (sudden feed changes!), lameness & bloat; work with your vet on the protocol.\n' +
          '• Marketing & grades: Botswana beef grading rewards finish — know the grade grid, sell to the right channel (export abattoirs, local butcheries, BAMB), and watch market prices before committing (see prices topic).\n' +
          '• Welfare & law: space, shade, clean water & humane handling are both ethical and legal standards (see animal welfare topic) — stressed cattle gain poorly and can be downgraded.\n' +
          '• Numbers first: cost of animal + feed per kg gain vs expected sale price — pen fattening fails when the buy price is too high or the sale timing is wrong. Use records!\n\n' + D;
      },
        sources: ['WOAH animal welfare standards', 'FAO technical guidelines', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🐄 Livestock basics', '🛡️ Animal welfare', '💰 Prices']),
    },
    {
      id: 'cattle-dairy',
      title: 'Dairy production & milk hygiene',
      category: 'production',
      keywords: ['dairy', 'milk', 'milking', 'cow milk', 'mastitis', 'lactating', 'dairy cow', 'milk hygiene', 'pasteurisation', 'cream', 'milk market', 'dairy goat', 'udder'],
      questions: ['how to start dairy farming', 'milk production botswana', 'mastitis prevention', 'milk hygiene and handling', 'dairy cow feeding', 'selling milk'],
      answer() {
        return '🥛 DAIRY & MILK HYGIENE:\n\n' +
          '• Dairy = daily cash, but it is a discipline business: a milking cow needs feed, water, routine and hygiene EVERY day — no weekends off.\n' +
          '• Feeding: lactating cows need quality roughage + energy/protein concentrate + minerals; underfeeding cuts milk AND fertility. Body condition score monthly.\n' +
          '• Milk hygiene chain (each step matters): clean dry udder → wash hands & teat-dip → fore-strip (check clots) → milk into clean stainless containers → strain & cool to <4 °C fast → keep cold until delivery. Warm milk is bacteria soup.\n' +
          '• Mastitis (udder infection) is the #1 dairy cost: prevention = dry bedding, clean milking routine, teat dipping, treating dry cows with vet-approved products, culling chronic cases. Milk from treated cows must be discarded per withdrawal times — never sell antibiotic milk.\n' +
          '• Zoonoses: brucellosis & TB pass through raw milk — boil/pasteurise milk for home use and for calves from untested cows; test herd regularly (vet).\n' +
          '• Markets: fresh milk to neighbours/hotels, formal processors require volume + quality standards; value-add (sour milk/madila, yoghurt, cheese) lifts margins but needs hygiene certification (see food safety topic).\n' +
          '• Dairy goats are an excellent smallholder entry: lower cost, easier feed, and goat milk sells well.\n' +
          '• Records per cow: milk kg/day, feed, treatments, calving dates — cull the bottom performers.\n\n' + D;
      },
        sources: ['WOAH standards', 'Codex milk hygiene texts', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🧼 Food safety', '🏥 Vet office', '🛒 Selling']),
    },
    {
      id: 'welfare-animals',
      title: 'Animal welfare standards',
      category: 'production',
      keywords: ['animal welfare', 'five freedoms', 'humane', 'cruelty', 'transport animals', 'slaughter', 'handling', 'stress', 'welfare standards', 'woah', 'beating animals', 'tethered', 'castration pain', 'animal rights'],
      questions: ['what are the five freedoms', 'animal welfare in livestock farming', 'humane transport of cattle', 'welfare standards for slaughter', 'is my livestock handling humane', 'welfare certified production'],
      answer() {
        return '🛡️ ANIMAL WELFARE (international standards):\n\n' +
          '• Welfare isn\'t sentiment — it is science & economics: stressed, injured or thirsty animals gain poorly, milk less, and fail the audits that premium & export markets require (WOAH standards + buyer codes).\n' +
          '• The Five Freedoms (global benchmark):\n' +
          '   1. Freedom from hunger & thirst — clean water & adequate feed daily;\n' +
          '   2. Freedom from discomfort — shelter from heat/cold/wind, dry lying area;\n' +
          '   3. Freedom from pain, injury & disease — prompt treatment, humane husbandry;\n' +
          '   4. Freedom to express normal behaviour — space, social contact, grazing/browsing;\n' +
          '   5. Freedom from fear & distress — calm handling, no beating, no teasing by dogs.\n' +
          '• Handling: use low-stress movement (gates, flags, voice) not sticks & electric shocks; animals that fear people lose condition and are dangerous to handle.\n' +
          '• Painful procedures: castration & dehorning should be done young with proper methods (and pain control where available, per vet advice) — never crude "slash & hope" ops.\n' +
          '• Transport & slaughter: don\'t overload, don\'t drive sick/very pregnant animals, provide rest stops on long trips; slaughter should be quick & professional — stressed meat is poor meat (dark, dry, tough) and loses grade.\n' +
          '• Welfare pays: calmer animals = fewer injuries to you, better immune response, premium "welfare-certified" market access where buyers demand it.\n' +
          '• Water is welfare: in Botswana\'s heat, a day without water is cruelty and lost production — check water daily, every day.\n\n' + D;
      },
        sources: ['WOAH animal welfare standards', 'FAO technical guidelines'],
      buttons: buttons(['🐄 Livestock basics', '🐂 Feedlots', '🛃 Export readiness']),
    },
    {
      id: 'land-tenure',
      title: 'Land access & tenure security',
      category: 'finance',
      keywords: ['land', 'land board', 'customary land', 'lease', 'leasehold', 'freehold', 'land allocation', 'tenure', 'inheritance', 'subdivision', 'fence disputes', 'land rights', 'commonage', 'land grabbing', 'grazing land allocation', 'tribal land'],
      questions: ['how to apply for farmland', 'customary land allocation botswana', 'land lease for farming', 'securing my land rights', 'land inheritance rules', 'land board application process'],
      answer() {
        return '🗺️ LAND ACCESS & TENURE SECURITY:\n\n' +
          '• Secure tenure is the foundation of every farm investment: farmers who hold documented rights invest in soil, fences, trees & boreholes; insecure farmers cannot borrow or plan. FAO\'s Voluntary Guidelines (VGGT) are the international benchmark for fair land governance.\n' +
          '• Botswana: most farmland is customary tribal land administered by Land Boards — apply through your District Land Board; allocations for arable & residential come with conditions; grazing land is often communal (commonage) with use rights managed locally.\n' +
          '• Get it in writing: keep allocation letters/certificates safe, register leases where relevant, and know the difference between customary rights and leasehold (leasehold is bankable collateral; customary is being formalised in many areas).\n' +
          '• Women & heirs: land law protects spouses & children\'s rights — update inheritance arrangements while alive; don\'t rely on verbal promises.\n' +
          '• Boundaries & disputes: fence per your allocation map, resolve disputes through the kgotla/land board EARLY — a small disagreement ignored becomes a costly court case; never take the law into your own hands.\n' +
          '• Communal grazing: overuse of commonage is a collective-action problem — support community grazing management plans & water-point committees (see rangeland topic).\n' +
          '• Beware: "land for sale" by individuals on tribal land is usually illegal — only Land Boards allocate customary land. Verify before paying anyone.\n' +
          '• Tree planting & improvements strengthen your claim — but confirm rules with the land board first.\n\n' + D;
      },
        sources: ['FAO VGGT land tenure guidelines', 'Botswana land legislation'],
      buttons: buttons(['🌾 Rangeland', '👩🏾‍🌾 Women & youth', '📈 Agribusiness']),
    },
    {
      id: 'biz-valueadd',
      title: 'Value addition & small-scale processing',
      category: 'business',
      keywords: ['value addition', 'processing', 'jam', 'juice', 'dried fruit', 'flour', 'peanut butter', 'oil pressing', 'packaging', 'food processing', 'agro processing', 'cottage industry', 'labelling', 'small scale processing'],
      questions: ['value addition ideas for farmers', 'how to start food processing', 'peanut butter making business', 'fruit juice processing', 'food processing regulations', 'packaging and labelling my products'],
      answer() {
        return '🏭 VALUE ADDITION & PROCESSING:\n\n' +
          '• Processing turns surplus & seconds into shelf-stable income: groundnuts → peanut butter; tomatoes → paste/sauce; fruit → juice/dried snacks/jam; maize → meal; milk → madila/yoghurt; morogo → dried greens. Even 20% of the crop processed can double total revenue.\n' +
          '• Start with ONE product you can make consistently, at a quality that beats what\'s in the shops — buyers & repeat customers forgive price more than inconsistency.\n' +
          '• Food-safety & law first: food processing & selling processed food is regulated (registration, hygiene standards, labelling: name, ingredients, net weight, date, producer). Visit your local authority & Ministry food safety office BEFORE investing — see my food safety topic.\n' +
          '• Kitchens: start in a certified community/commercial kitchen before building your own; utensils & surfaces must be cleanable (no rust, no wood where food sits).\n' +
          '• Packaging & labelling: clean, honest labels sell; "organic"/"natural" claims must be true (false claims are fraud and get products removed).\n' +
          '• Price it properly: ingredients + packaging + fuel/power + labour + overheads + margin — processing fails when farmers price only the raw materials.\n' +
          '• Markets: shops, schools, tourism lodges, corporate gifts, formal retail require consistent supply — start with 2–3 reliable outlets and grow.\n' +
          '• Co-ops: shared processing facilities (abattoirs, oil presses, cold stores) turn individual small batches into commercial volumes.\n\n' + D;
      },
        sources: ['Codex Alimentarius', 'FAO agri-food processing guides', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🧼 Food safety', '🤝 Co-ops', '📈 Agribusiness']),
    },
    {
      id: 'people-nutrition',
      title: 'Nutrition-sensitive farming',
      category: 'people',
      keywords: ['nutrition', 'food security', 'vitamin a', 'malnutrition', 'diverse diet', 'household nutrition', 'food groups', 'orange fleshed', 'biofortified', 'vegetable garden nutrition', 'hungry season', 'school feeding', 'food basket'],
      questions: ['how to farm for family nutrition', 'diversifying my family diet', 'vitamin a foods to grow', 'ending the hungry season', 'nutrition garden for the household', 'farming for food security'],
      answer() {
        return '🥗 NUTRITION-SENSITIVE FARMING:\n\n' +
          '• A farm feeds people, not just markets: the family food basket should cover 5 food groups daily — staples, legumes, vegetables, fruit, and animal-source foods (milk, eggs, meat) in small amounts.\n' +
          '• Plan for the hungry season (pre-harvest): grow early-maturing crops (sweet potato, cowpea leaves, pumpkins), dry vegetables & fruit for the lean months, and store grain well — hunger months are when children\'s growth is damaged for life.\n' +
          '• Nutrition superstars that grow here: orange-fleshed sweet potato (vitamin A), morogo/amaranth & pumpkin leaves (iron, vitamin A), groundnuts & beans (protein), citrus/guava/morula (vitamin C), eggs from a few hens (complete protein), milk (calcium).\n' +
          '• The home garden is a clinic: a 20×20 m plot of leafies + sweet potato + a fruit tree measurably cuts child malnutrition — this is why clinics & schools run nutrition gardens; copy them at home.\n' +
          '• Keep a few animals for HOME use before selling: 5–10 chickens & 2–3 goats supply eggs, meat & milk that money alone often doesn\'t buy in rural shops.\n' +
          '• Food safety at home: dry grain properly (aflatoxin), boil milk, wash produce, keep the cooking area clean — nutrition without hygiene is wasted.\n' +
          '• Women\'s nutrition: women & girls eat last in many households — the farm plan should deliberately reserve nutrient-rich food for them (evidence shows it pays back across generations).\n' +
          '• Surpluses of these crops also SELL — nutrition and income from the same rows.\n\n' + D;
      },
        sources: ['FAO nutrition-sensitive agriculture guidance', 'Botswana Ministry of Agriculture'],
      buttons: buttons(['🥬 Leafy veg', '🍠 Sweet potato', '🐔 Poultry']),
    },
    {
      id: 'market-aggregation',
      title: 'Value chains, aggregation & market links',
      category: 'market',
      keywords: ['value chain', 'aggregation', 'aggregator', 'market linkage', 'bulking', 'contract farming', 'outgrower', 'supply contract', 'supply chain', 'market system', 'consolidation', 'negotiation'],
      questions: ['what is a value chain', 'how to aggregate produce', 'contract farming pros and cons', 'linking smallholders to markets', 'bulking produce for supermarkets', 'negotiating with buyers'],
      answer() {
        return '🔗 VALUE CHAINS, AGGREGATION & MARKET LINKS:\n\n' +
          '• A value chain is the full journey: inputs → production → bulking → processing → transport → retail. Farmers who understand the whole chain stop being exploited at the first link.\n' +
          '• Aggregation is power: buyers (supermarkets, exporters, processors) want VOLUME & CONSISTENCY — a single farmer with 200 kg is ignored; a group with 10 tonnes gets contracts. Bulking points, shared storage & joint transport make smallholders viable suppliers.\n' +
          '• Contract farming/outgrower schemes: buyer provides inputs/credit & guaranteed purchase — great when the buyer is fair; READ the contract: price formula, quality specs, deductions, dispute process. Never sign exclusivity that blocks better offers without reading it. (See honest trade topic.)\n' +
          '• Link strategies: sell through farmer co-ops & unions; use the marketplace board; attend buyer briefings & agri-shows; deliver samples + consistent quality to earn the "reliable supplier" label.\n' +
          '• Negotiation basics: know your costs (never sell below break-even), know the market price, quote confidently, confirm everything in writing, deliver what you promised.\n' +
          '• Multi-stakeholder value: strong local chains create transport, processing & service jobs — a village that aggregates becomes a trading node, benefiting everyone from input dealers to school feeding programmes.\n' +
          '• Digital: aggregation platforms & e-marketplaces are growing — combine them with offline relationships; the phone finds buyers, the handshake keeps them.\n\n' + D;
      },
        sources: ['FAO value chain guidance', 'CCARDESA/CTA SADC practice notes'],
      buttons: buttons(['🤝 Co-ops', '🛒 Selling', '🛡️ Ethics', '📱 Marketplace']),
    },
  ],
};
