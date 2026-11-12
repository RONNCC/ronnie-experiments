/* The Relit Wave — data.js
 * Curated cultural, culinary, linguistic, civic, psychological, and technological
 * "wave" movements, with citation statuses, wave mechanics, interactive lab presets,
 * glossary, and sourced bibliography.
 */

window.RELIT_WAVE_DATA = {
  archetypes: [
    {
      id: "commodity-craft",
      name: "Commodity → Experience → Terroir Craft",
      short: "Craft & Terroir",
      color: "#b85427",
      summary:
        "Wave 1 solves mass availability and shelf stability. Wave 2 turns consumption into a branded social ritual or lifestyle. Wave 3 strips away heavy standardization to highlight farm-level provenance, variety, and maker transparency.",
      domains: ["coffee", "chocolate"]
    },
    {
      id: "revival-relay",
      name: "Root Scene → Cross-Cultural Fusion → Revival",
      short: "Revival Relay",
      color: "#c2861b",
      summary:
        "Wave 1 invents a local underground sound. Wave 2 relocates or reshapes it for a new geography or subculture. Wave 3 brings commercial scale or fusion, often sparking a Wave 4 underground 'revival' that skips Wave 3 to relight Wave 2.",
      domains: ["ska", "emo"]
    },
    {
      id: "structure-context",
      name: "Macro Categories → Inner Models → Situated Agency",
      short: "Context & Agency",
      color: "#1d6f6d",
      summary:
        "Wave 1 measures external categories or overt behavior. Wave 2 looks inside local groups, mental models, or rules. Wave 3 treats meaning, emotion, and adaptation as dynamic, context-sensitive practices shaped in real life.",
      domains: ["sociolinguistics", "cbt", "hci", "ai"]
    },
    {
      id: "surge-undertow",
      name: "Institutional Breakthrough → Structural Critique → Contested Undertow",
      short: "Surge & Undertow",
      color: "#3f5378",
      summary:
        "Wave 1 wins foundational legal or institutional ground. Wave 2 widens the scope after a trough or crisis. Wave 3 pluralizes who counts, negotiates new mechanisms, or faces reverse waves and backsliding.",
      domains: ["feminism", "democracy", "environmentalism"]
    }
  ],

  domains: [
    {
      id: "coffee",
      title: "Coffee Culture",
      subtitle: "From vacuum-sealed diner tins to farm-level light roasts",
      category: "Food & Drink",
      archetype: "commodity-craft",
      labelStatus: "Canonical industry term",
      coinedBy: "Timothy J. Castle (1999) & Trish Rothgeb (2002/2003)",
      originHook:
        "Rothgeb's Roasters Guild newsletter essay explicitly borrowed the 'three waves' metaphor from third-wave feminism to explain why specialty roasters were treating coffee more like fine wine than diner fuel.",
      relitDynamic:
        "Each wave relit what 'good coffee' meant: first reliable caffeine in every kitchen, then espresso cafés as a 'third place' with bold dark roasts, then farm-traceable beans roasted lightly enough to taste fruit and terroir.",
      axes: {
        unit: ["Anonymous blend", "Country & roast style", "Single farm / micro-lot", "Measured extraction & producer equity"],
        goal: ["Low price & shelf life", "Café ritual & bold consistency", "Origin clarity & craft", "Replicable science & systemic sustainability"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "Late 1800s – 1960s",
          name: "Mass Household Commodity",
          spark: "Vacuum-sealed cans (Hills Bros., 1900), instant soluble coffee, and wartime/postwar grocery distribution.",
          shift: "Made coffee an affordable, shelf-stable staple on nearly every American kitchen table and diner counter.",
          exemplars: ["Folgers", "Maxwell House", "Hills Bros.", "Instant & percolator coffee"],
          blindSpot: "Stale pre-ground beans, Robusta-heavy blends, and dark or uneven roasting erased origin flavor and farmer identity.",
          intensity: 55
        },
        {
          num: "2nd Wave",
          era: "Late 1960s – 1990s",
          name: "Espresso & Café Lifestyle",
          spark: "Alfred Peet's 1966 Berkeley shop, George Howell's Coffee Connection, and Starbucks scaling Italian-inspired espresso bars.",
          shift: "Introduced whole-bean freshness, origin countries (Colombia, Sumatra), espresso drinks, and the café as a social 'third place.'",
          exemplars: ["Peet's Coffee", "Starbucks", "Specialty Coffee Association (1982)", "Signature dark roasts & lattes"],
          blindSpot: "Heavy dark roasting and sweetened milk drinks often masked bean-specific character as chains prioritized global uniformity.",
          intensity: 78
        },
        {
          num: "3rd Wave",
          era: "Late 1990s – 2010s",
          name: "Terroir, Light Roast & Direct Trade",
          spark: "Barista competitions, single-origin pour-overs, and independent roasters treating coffee cherries as an artisanal agricultural crop.",
          shift: "Sourced by specific farm, varietal (Geisha, Bourbon), altitude, and processing method; roasted lighter to preserve acidity and floral notes.",
          exemplars: ["Intelligentsia", "Stumptown", "Counter Culture", "Square Mile (James Hoffmann)", "Manual V60 / Chemex"],
          blindSpot: "Critics noted intimidating café minimalism, high cup prices, and 2015 corporate acquisitions (e.g., Peet's/JAB buying Stumptown & Intelligentsia).",
          intensity: 94
        },
        {
          num: "4th Wave (Debated)",
          era: "Mid-2010s – Present",
          name: "Extraction Science, Co-Ferments & Home Precision",
          spark: "Refractometers, water chemistry, experimental anaerobic/yeast fermentations, and prosumer home espresso.",
          shift: "Industry writers split on what 'fourth wave' means: data-driven extraction, producer-led processing, or café-grade brewing moving home.",
          exemplars: ["TDS refractometers", "Carbonic maceration lots", "Precision home grinders", "Producer-owned roasteries"],
          blindSpot: "No single consensus definition—sometimes used as marketing hype for canned cold brew or ultra-expensive competition lots.",
          intensity: 70,
          contested: true
        }
      ],
      critique:
        "The three-wave story centers U.S., UK, and Australian retail habits while flattening centuries-old coffee ceremonies and café cultures in Ethiopia, Yemen, Turkey, Italy, and Latin America.",
      sourceIds: ["coffee-wiki", "coffee-gold", "coffee-rothgeb"]
    },
    {
      id: "sociolinguistics",
      title: "Variationist Sociolinguistics",
      subtitle: "How linguists explain why the same person talks differently in different moments",
      category: "Language & Mind",
      archetype: "structure-context",
      labelStatus: "Canonical academic framework",
      coinedBy: "Penelope Eckert (2005 LSA talk; 2012 Annual Review of Anthropology)",
      originHook:
        "Stanford linguist Penelope Eckert mapped half a century of language-variation research into three waves—showing how scholars moved from census spreadsheets to high-school cliques to active persona-building.",
      relitDynamic:
        "Instead of treating accents and vowel shifts as passive stamps of where you were born, each wave relit the speaker: from demographic data point, to local community insider, to creative social stylist.",
      axes: {
        unit: ["Census class & age strata", "Local ethnographic network", "Indexical field & persona"],
        goal: ["Correlate speech with macro groups", "Uncover local vernacular loyalty", "Track how variants build live social meaning"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "1960s – 1970s",
          name: "Macro-Sociological Survey Era",
          spark: "William Labov's 1966 New York City department-store study ('fourth floor' /r/) and large urban speech surveys.",
          shift: "Proved that 'free' speech variation wasn't random noise—it patterned cleanly with socioeconomic class, age, sex, and ethnicity.",
          exemplars: ["Labov NYC study (1966)", "Trudgill in Norwich", "Formal vs. casual attention-to-speech", "Macro demographic grids"],
          blindSpot: "Treated speakers as passive carriers of big census categories and viewed casual 'vernacular' purely as reduced self-monitoring.",
          intensity: 64
        },
        {
          num: "2nd Wave",
          era: "Late 1970s – 1990s",
          name: "Ethnographic & Social-Network Era",
          spark: "Lesley Milroy's Belfast social-network fieldwork and Penelope Eckert's 'Jocks and Burnouts' ethnography in suburban Detroit.",
          shift: "Zoomed inside neighborhoods and schools to show people speak like the local communities of practice they actually belong to.",
          exemplars: ["Labov Martha's Vineyard (precursor)", "Milroy Belfast networks (1980)", "Eckert Jocks & Burnouts (1989)"],
          blindSpot: "Still treated speech features mainly as static badges of group membership rather than flexible tools people remix.",
          intensity: 80
        },
        {
          num: "3rd Wave",
          era: "2000s – Present",
          name: "Stylistic Practice & Social Meaning",
          spark: "Eckert's theory of the 'indexical field' (2008, 2012) and research on stance, affect, and persona construction.",
          shift: "Flips the arrow: linguistic variables carry clouds of potential meanings (tough, nerdy, cosmopolitan, ironic) that speakers actively combine.",
          exemplars: ["Released /t/ across geek, prep & activist styles", "California vowel shift personas", "Code-switching & stance"],
          blindSpot: "Critics note third-wave studies sometimes emphasize speaker performance more than how listeners constrain or misread variants.",
          intensity: 95
        }
      ],
      critique:
        "Eckert stressed that the third wave does not invalidate first-wave surveys or second-wave ethnographies—linguists still need macro maps to know which sound changes exist in the first place.",
      sourceIds: ["eckert-2012", "eckert-2018"]
    },
    {
      id: "chocolate",
      title: "Craft & Bean-to-Bar Chocolate",
      subtitle: "Borrowing coffee's playbook to turn two-ingredient cacao into terroir bars",
      category: "Food & Drink",
      archetype: "commodity-craft",
      labelStatus: "Borrowed craft analogy",
      coinedBy: "2000s–2010s craft chocolate makers & food writers (explicitly echoing third-wave coffee)",
      originHook:
        "Small chocolate makers began calling bean-to-bar chocolate 'third-wave chocolate' because cacao undergoes an almost parallel journey to coffee—harvest, fermentation, drying, roasting, and grinding—yet spent a century hidden behind sugar and vanilla.",
      relitDynamic:
        "Relit chocolate from an industrial candy bar standardized with alkali and vanillin, past luxury European bonbons made from bulk couverture, to single-estate bars made from just cacao and sugar.",
      axes: {
        unit: ["Bulk commodity cacao + vegetable fats/sugar", "Cacao percentage & European couverture", "Single-origin fermented cacao + cane sugar"],
        goal: ["Cheap, uniform sweetness", "Luxury confectionery & dark % branding", "Fruit/floral cacao terroir & ethical farm pay"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "Late 1800s – Mid-1900s",
          name: "Industrial Candy Mass Market",
          spark: "Industrial conching, Dutch alkalization, powdered milk chocolate, and globalized West African bulk cacao supply chains.",
          shift: "Transformed drinking chocolate into shelf-stable, inexpensive candy bars for millions of households.",
          exemplars: ["Hershey's", "Cadbury", "Mars", "Dutch-processed cocoa"],
          blindSpot: "High sugar, vanilla masking, over-roasting to hide defects, and severe farmgate price pressure and labor abuses.",
          intensity: 56
        },
        {
          num: "2nd Wave",
          era: "1980s – Late 1990s",
          name: "Premium Dark % & Boutique Chocolatiers",
          spark: "Valrhona's high-cacao vintage bars, upscale truffle boutiques, and supermarket '70% dark chocolate' aisles.",
          shift: "Taught consumers to check cacao percentages and see dark chocolate as sophisticated adult indulgence.",
          exemplars: ["Valrhona", "Scharffen Berger (1996, transitional)", "Gourmet truffle & ganache shops"],
          blindSpot: "Most 'chocolatiers' melted pre-made industrial couverture rather than roasting raw cacao beans themselves.",
          intensity: 76
        },
        {
          num: "3rd Wave",
          era: "Mid-2000s – Present",
          name: "Bean-to-Bar & Tree-to-Bar Craft",
          spark: "Micro-batch makers hacking stone wet-grinders (melangers), buying transparent micro-lots, and listing harvest years.",
          shift: "Two-ingredient bars (cacao + sugar) where Peruvian, Ugandan, or Venezuelan beans taste naturally of raspberry, citrus, or brownie.",
          exemplars: ["Dandelion Chocolate", "Patric / Dick Taylor", "Origin-based tree-to-bar makers", "Fine Cacao and Chocolate Institute"],
          blindSpot: "Tiny batch sizes mean $10–$16 bars, creating tension between farmer compensation and everyday affordability.",
          intensity: 91
        }
      ],
      critique:
        "Mesoamerican peoples cultivated, fermented, and frothed cacao for millennia before European industrialization; 'waves' describe modern retail recovery from industrial flattening, not the invention of cacao craft.",
      sourceIds: ["chocolate-craft", "coffee-wiki"]
    },
    {
      id: "ska",
      title: "Ska Music",
      subtitle: "Kingston independence horns → Coventry 2 Tone → 1990s global punk-ska",
      category: "Music & Subculture",
      archetype: "revival-relay",
      labelStatus: "Canonical scene periodization",
      coinedBy: "1980s–1990s music journalists & Moon Ska Records (Robert 'Bucket' Hingley)",
      originHook:
        "Ska is one of the clearest geographic relays in music history: each wave jumped an ocean or generation, sped up the tempo, and fused the Jamaican offbeat 'skank' with local youth politics.",
      relitDynamic:
        "Kingston's post-colonial studio brass relit working-class multiracial punk clubs in Thatcher-era Britain, which in turn relit DIY skate and punk venues across North America, Latin America, and Japan.",
      axes: {
        unit: ["Sound-system studio ensemble", "Multiracial punk/ska 7-inch single", "DIY touring ska-punk / horn band", "Global scene synthesis"],
        goal: ["Post-independence Jamaican dance pulse", "Anti-racist British street solidarity", "High-velocity genre fusion & youth catharsis", "Reconnecting roots, Latin ska & punk"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "Late 1950s – Mid-1960s",
          name: "Original Jamaican Ska",
          spark: "Kingston sound systems blending Jamaican mento and calypso with New Orleans R&B and jazz horns around Jamaican independence (1962).",
          shift: "Created the guitar/piano upstroke on the offbeat ('skank') and horn-led dance anthems before slowing into rocksteady and reggae.",
          exemplars: ["The Skatalites", "Prince Buster", "Toots and the Maytals", "Desmond Dekker", "Studio One"],
          blindSpot: "By 1966–1968, Kingston's hot summer dances and shifting politics favored slower rocksteady and reggae grooves.",
          intensity: 75
        },
        {
          num: "2nd Wave",
          era: "Late 1970s – Early 1980s",
          name: "British 2 Tone Revival",
          spark: "Jerry Dammers founding 2 Tone Records in Coventry (1979) amid UK economic crisis and National Front racial tensions.",
          shift: "Fused Jamaican ska with punk urgency and new-wave tightness; black-and-white checkerboard visuals stood explicitly for racial unity.",
          exemplars: ["The Specials", "The Selecter", "Madness", "The Beat (The English Beat)"],
          blindSpot: "Intense touring pressure, chart saturation, and band splits made the classic 2 Tone peak brief (roughly 1979–1982).",
          intensity: 86
        },
        {
          num: "3rd Wave",
          era: "Late 1980s – Late 1990s",
          name: "Ska-Punk & Global Crossover",
          spark: "Early U.S. revivalists (The Toasters, Fishbone, Operation Ivy) giving way to 1990s Warped Tour and radio/MTV breakthroughs.",
          shift: "Combined brass hooks with distorted punk guitars, hardcore tempos, or Latin rock en español across the U.S., Mexico, and Europe.",
          exemplars: ["The Toasters", "Fishbone", "Operation Ivy / Rancid", "The Mighty Mighty Bosstones", "No Doubt", "Panteón Rococó"],
          blindSpot: "Late-90s mainstream novelty hits turned horn-punk tropes into punchlines in the U.S. press, overshadowing deeper Black and Latin ska roots.",
          intensity: 93
        },
        {
          num: "4th Wave / New Tone",
          era: "2010s – Present",
          name: "DIY New Tone & Global Roots",
          spark: "Independent labels (Bad Time Records), thriving Mexican/LA traditional-and-core scenes, and queer/punk DIY collectives.",
          shift: "Reclaims ska's anti-racist, political edge while freely mixing traditional rocksteady, skacore, indie, and hyperpop.",
          exemplars: ["The Interrupters", "The Steady 45s", "We Are The Union", "JER", "Catbite"],
          blindSpot: "Largely independent by choice rather than aiming for 1997-scale radio monoculture.",
          intensity: 72,
          contested: true
        }
      ],
      critique:
        "Anglophone 'three waves' timelines often treat ska as dormant between U.S./UK peaks, overlooking continuous scenes in Mexico, Argentina, Germany, and Japan—and Jamaica's uninterrupted evolution through rocksteady, reggae, and dancehall.",
      sourceIds: ["ska-wiki", "ska-fourth"]
    },
    {
      id: "emo",
      title: "Emo Music",
      subtitle: "From 1985 D.C. post-hardcore basements to five fan-argued waves",
      category: "Music & Subculture",
      archetype: "revival-relay",
      labelStatus: "Scene & fan historiography",
      coinedBy: "1990s–2010s zines, indie critics, and forum communities (codified into 4–5 waves)",
      originHook:
        "Few subcultures argue more passionately about wave numbers than emo: fans routinely distinguish five waves because Wave 3's arena-pop explosion sounded radically different from Wave 2's Midwest basements.",
      relitDynamic:
        "Demonstrates the 'leapfrog revival': Fourth-wave bands around 2010 deliberately bypassed 2006 MTV pop-emo to relight the twinkly, math-rock guitars of 1997 Midwest emo.",
      axes: {
        unit: ["D.C. DIY hardcore show", "90s indie/Midwest 7-inch", "MySpace/MTV arena single", "Bandcamp/DIY revival split"],
        goal: ["Turn punk rage inward", "Quiet-loud dynamic confession", "Anthemic pop-punk catharsis", "Reclaim DIY intimacy & genre-blend"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "1984 – Early 1990s",
          name: "D.C. 'Revolution Summer' Emocore",
          spark: "Washington, D.C. hardcore musicians (Rites of Spring, Embrace) rebelling against macho pit violence in 1985.",
          shift: "Kept hardcore punk's raw speed and DIY ethics (Dischord Records) while turning lyrics toward personal grief and vulnerability.",
          exemplars: ["Rites of Spring", "Embrace", "Moss Icon", "Dag Nasty"],
          blindSpot: "Founding musicians famously rejected the label 'emocore' almost immediately as absurd journalism.",
          intensity: 62
        },
        {
          num: "2nd Wave",
          era: "Early 1990s – 2000",
          name: "Midwest Emo & Indie Post-Hardcore",
          spark: "Subterranean touring circuits across the American Midwest and Pacific Northwest blending punk with indie and math-rock.",
          shift: "Introduced clean, arpeggiated 'twinkly' guitars, quiet-to-screaming dynamics, and earnest, unglamorous everyman vocals.",
          exemplars: ["Sunny Day Real Estate", "Cap'n Jazz", "American Football", "The Promise Ring", "Mineral", "Jawbreaker"],
          blindSpot: "Many seminal bands broke up before 2000 with tiny record pressings, becoming mythologized only years later online.",
          intensity: 79
        },
        {
          num: "3rd Wave",
          era: "2001 – 2008",
          name: "Mainstream Emo-Pop & Mall Scene",
          spark: "Jimmy Eat World's 'Bleed American', Vagrant/Fueled by Ramen labels, MySpace, and MTV's TRL.",
          shift: "Welded emotional urgency to glossy pop-punk hooks, theatrical concepts, and unmistakable fashion (side-swept bangs, eyeliner).",
          exemplars: ["Jimmy Eat World", "Taking Back Sunday", "My Chemical Romance", "Fall Out Boy", "Dashboard Confessional"],
          blindSpot: "Commercial saturation alienated underground DIY scenes, splitting what 'emo' meant to the general public vs. purists.",
          intensity: 96
        },
        {
          num: "4th & 5th Waves",
          era: "2009 – Present",
          name: "The Emo Revival & Bedroom Genre-Bending",
          spark: "Wave 4 (c. 2009–2017) revived 90s Midwest math-indie; Wave 5 (late 2010s+) added chiptune, noise, shoegaze, and queer DIY collectives.",
          shift: "Turned American Football's 1999 LP into a foundational text, then broke open the template with home-recorded electronics and irony.",
          exemplars: ["Algernon Cadwallader", "Modern Baseball", "Title Fight", "The Hotelier", "Glass Beach (5th)", "Home Is Where (5th)"],
          blindSpot: "Even scene insiders joke that 'fifth wave' lumps together radically different lo-fi, screamo, and indie-pop styles.",
          intensity: 76,
          contested: true
        }
      ],
      critique:
        "Parallel screamo ('skramz') scenes—from 90s San Diego/gravity bands (Heroin, Orchid) to international post-hardcore—ran continuously alongside these waves without fitting neatly into the Midwest-to-MTV arc.",
      sourceIds: ["emo-genre", "emo-wknc"]
    },
    {
      id: "feminism",
      title: "Feminist Movements",
      subtitle: "The 1968 origin of the modern cultural 'wave' metaphor—and its sharpest critiques",
      category: "Politics & Society",
      archetype: "surge-undertow",
      labelStatus: "Foundational prototype",
      coinedBy: "Martha Weinman Lear (1968 NYT) & Rebecca Walker ('Becoming the Third Wave', 1992)",
      originHook:
        "Nearly every other 'third-wave' movement—including third-wave coffee—borrows its naming structure from feminism. Journalist Martha Weinman Lear popularized 'The Second Feminist Wave' in 1968 to prove 1960s activists were part of a deep historical lineage, not a passing fad.",
      relitDynamic:
        "Each wave expanded what equality required: from formal legal personhood and ballots, to dismantling structural inequality in work, family, and bodily autonomy, to intersectionality and networked solidarity.",
      axes: {
        unit: ["Constitutional & legal citizenship", "Social institutions & 'the personal is political'", "Intersecting identities & cultural micropolitics", "Networked global/digital mobilization"],
        goal: ["Suffrage & property/legal rights", "Workplace, reproductive & domestic liberation", "Pluralism, race/class/gender intersectionality", "Accountability against harassment & systemic violence"]
      },
      waves: [
        {
          num: "1st Wave (Retroactive)",
          era: "Mid-1800s – 1920s",
          name: "Suffrage & Legal Personhood",
          spark: "Abolitionist and women's rights organizing (Seneca Falls 1848, Sojourner Truth, global suffrage leagues).",
          shift: "Challenged coverture laws, fought for married women's property rights, higher education access, and constitutional voting rights.",
          exemplars: ["19th Amendment (U.S., 1920)", "Suffragettes (UK)", "Married Women's Property Acts", "Ida B. Wells"],
          blindSpot: "White suffrage leadership frequently sidelined or excluded Black, Indigenous, and working-class women; voting access remained blocked by Jim Crow.",
          intensity: 74
        },
        {
          num: "2nd Wave",
          era: "Early 1960s – 1980s",
          name: "Women's Liberation & Structural Equality",
          spark: "Civil rights organizing, consciousness-raising groups, equal-pay labor struggles, and Martha Weinman Lear's 1968 NYT headline.",
          shift: "Showed 'the personal is political': targeted workplace discrimination, credit access, reproductive rights, domestic labor, and family law.",
          exemplars: ["Title IX & Equal Credit Opportunity Act", "Combahee River Collective (1977)", "NOW", "Consciousness-raising"],
          blindSpot: "Mainstream media narratives often centered white middle-class experiences, prompting essential critiques from Black, Chicana, Asian American, and lesbian feminists.",
          intensity: 88
        },
        {
          num: "3rd Wave",
          era: "Early 1990s – Late 2000s",
          name: "Intersectionality, DIY Culture & Pluralism",
          spark: "Kimberlé Crenshaw coining 'intersectionality' (1989), Anita Hill's 1991 testimony, Rebecca Walker's 1992 Ms. essay, and Riot Grrrl zines.",
          shift: "Foregrounded how race, class, gender, and sexuality interlock; questioned rigid gender binaries; reclaimed pop culture and DIY publishing.",
          exemplars: ["Kimberlé Crenshaw", "Rebecca Walker", "Riot Grrrl zines", "Trans-inclusive & postcolonial theory"],
          blindSpot: "Critics debated whether individualistic 'choice feminism' diluted collective labor and institutional organizing.",
          intensity: 85
        },
        {
          num: "4th Wave",
          era: "c. 2012 – Present",
          name: "Networked Accountability & Global Movements",
          spark: "Tarana Burke's 'Me Too' groundwork meeting global viral testimony (#MeToo, #NiUnaMenos in Latin America, Everyday Sexism).",
          shift: "Uses digital networks for rapid cross-border testimony against sexual violence, reproductive rollbacks, and algorithmic/workplace bias.",
          exemplars: ["#NiUnaMenos (2015)", "#MeToo movement", "Reproductive justice coalitions"],
          blindSpot: "Platform outrage cycles can burn out organizers if disconnected from durable legal and labor institutions.",
          intensity: 89,
          contested: true
        }
      ],
      critique:
        "Historian Nancy A. Hewitt ('No Permanent Waves', 2010) argues ocean waves create 'historical amnesia' about labor and Black feminist organizing in the 'troughs' (like the 1930s–50s). She proposes 'radio waves' instead: simultaneous broadcasts at different frequencies.",
      sourceIds: ["lear-1968", "britannica-fem", "hewitt-2010"]
    },
    {
      id: "cbt",
      title: "Cognitive & Behavioral Therapy",
      subtitle: "Behavior → Thoughts → Your relationship to thoughts",
      category: "Language & Mind",
      archetype: "structure-context",
      labelStatus: "Canonical clinical debate",
      coinedBy: "Steven C. Hayes (2004, Behavior Therapy)",
      originHook:
        "Clinical psychologist Steven Hayes grouped mindfulness- and acceptance-based therapies as CBT's 'third wave'—sparking a lively scientific debate over whether therapies evolve by waves or continuous extensions.",
      relitDynamic:
        "Relit the clinical target three times: first changing overt conditioned habits, then disputing distorted beliefs inside the mind, then changing how rigidly a person fuses with or fights their inner experience.",
      axes: {
        unit: ["Observable stimulus & response", "Cognitive beliefs & appraisals", "Context, acceptance & psychological flexibility"],
        goal: ["Extinguish conditioned fear/avoidance", "Restructure distorted thoughts", "Live by chosen values alongside difficult feelings"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "1950s – 1960s",
          name: "Classical Behavior Therapy",
          spark: "Joseph Wolpe, B.F. Skinner, and Hans Eysenck applying Pavlovian and operant learning principles directly to clinical phobias.",
          shift: "Broke from unverified psychoanalytic speculation by measuring observable behaviors and using systematic exposure.",
          exemplars: ["Exposure therapy", "Systematic desensitization", "Contingency management"],
          blindSpot: "Struggled to account for complex human language, rumination, and internal meaning-making.",
          intensity: 66
        },
        {
          num: "2nd Wave",
          era: "1970s – 1980s",
          name: "Classical Cognitive Therapy (CBT)",
          spark: "Aaron T. Beck and Albert Ellis bringing the 'cognitive revolution' into psychotherapy.",
          shift: "Targeted automatic negative thoughts, core schemas, and cognitive distortions using structured thought records and behavioral experiments.",
          exemplars: ["Beck's Cognitive Therapy", "Ellis's REBT", "Thought records & cognitive restructuring"],
          blindSpot: "For some patients, directly arguing with unwanted thoughts inadvertently amplified self-scrutiny and rumination.",
          intensity: 87
        },
        {
          num: "3rd Wave",
          era: "1990s – Present",
          name: "Contextual, Acceptance & Mindfulness Therapies",
          spark: "Marsha Linehan's DBT (1993), Steven Hayes's ACT (1999), and Segal, Williams & Teasdale's MBCT (2002).",
          shift: "Focuses on the function and context of thoughts rather than just their literal truth—using mindfulness, cognitive defusion, and values.",
          exemplars: ["ACT (Acceptance & Commitment Therapy)", "DBT (Dialectical Behavior Therapy)", "MBCT (Mindfulness-Based Cognitive Therapy)"],
          blindSpot: "Aaron Beck and Stefan Hofmann argued 'wave' rhetoric exaggerated the break, leading Hayes & Hofmann (2018+) toward unified 'process-based therapy.'",
          intensity: 89
        }
      ],
      critique:
        "Unlike ocean waves that vanish on shore, Wave 1 exposure therapy and Wave 2 cognitive restructuring remain gold-standard, front-line clinical tools alongside Wave 3 acceptance skills.",
      sourceIds: ["hayes-2004", "hayes-hofmann-2021"]
    },
    {
      id: "hci",
      title: "Human–Computer Interaction (HCI)",
      subtitle: "From cockpit ergonomics to groupware to phones woven into everyday life",
      category: "Science & Tech",
      archetype: "structure-context",
      labelStatus: "Canonical academic framework",
      coinedBy: "Susanne Bødker (2006 NordiCHI keynote & 2015 ACM Interactions)",
      originHook:
        "Danish computer scientist Susanne Bødker noticed that HCI methods built for 1980s office workflows broke down once computing spilled into bedrooms, museums, pockets, and street life—calling this shift 'Third-Wave HCI.'",
      relitDynamic:
        "Relit 'the user': first as a measurable human operator coupled to one machine, then as a skilled collaborator inside a workplace, then as a cultural, emotional person living across many devices.",
      axes: {
        unit: ["One human + one terminal", "Collaborative workgroup & workflow", "Everyday life, culture & ubiquitous ecologies"],
        goal: ["Minimize error & cognitive load", "Support situated cooperation", "Design for meaning, emotion, values & participation"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "1970s – 1980s",
          name: "Human Factors & Cognitive Engineering",
          spark: "Aviation ergonomics and cognitive psychology applied to early desktop interfaces and command systems.",
          shift: "Measured keystroke timing, Fitts's law, memory load, and error rates in controlled laboratory usability tests.",
          exemplars: ["Card, Moran & Newell (GOMS, 1983)", "Controlled usability labs", "Ergonomic cockpit/terminal fit"],
          blindSpot: "Isolated single users in artificial lab tasks, missing messy real-world interruptions and social context.",
          intensity: 65
        },
        {
          num: "2nd Wave",
          era: "Late 1980s – 1990s",
          name: "Situated Action & Cooperative Work (CSCW)",
          spark: "Lucy Suchman's 'Plans and Situated Actions' (1987), Scandinavian participatory design, and networked office groupware.",
          shift: "Moved from 'man–machine fit' to groups working *through* interfaces using ethnography, contextual inquiry, and activity theory.",
          exemplars: ["CSCW & groupware", "Scandinavian Participatory Design (UTOPIA)", "Contextual inquiry"],
          blindSpot: "Assumed clear workplace boundaries, shared organizational goals, and productivity as the primary yardstick.",
          intensity: 80
        },
        {
          num: "3rd Wave",
          era: "2000s – Present",
          name: "Phenomenological, Cultural & Everyday Computing",
          spark: "Mobile, ubiquitous, domestic, and playful technologies blurring work and leisure (Bødker 2006; Harrison, Tatar & Sengers 2007).",
          shift: "Embraces emotion, aesthetics, cultural politics, domestic intimacy, and 'ill-defined' contexts where efficiency is not the point.",
          exemplars: ["Speculative & critical design", "Affective & domestic computing", "Civic/community participatory tech"],
          blindSpot: "Bødker (2015) warned 10 years later that consumer app individualism risked losing Wave 2's collective participatory craft.",
          intensity: 90
        }
      ],
      critique:
        "Today researchers debate a 'fourth wave' (entanglement / posthuman / agentic AI interfaces) where systems act semi-autonomously—making Wave 1 error control and Wave 2 workplace power newly urgent again.",
      sourceIds: ["bodker-2006", "bodker-2015"]
    },
    {
      id: "ai",
      title: "Artificial Intelligence Paradigms",
      subtitle: "Handcrafted rules → Statistical pattern learning → Contextual reasoning",
      category: "Science & Tech",
      archetype: "structure-context",
      labelStatus: "Institutional maturity model",
      coinedBy: "John Launchbury / DARPA Information Innovation Office (2016–2017)",
      originHook:
        "Five years into the deep-learning boom, DARPA's John Launchbury framed AI history as three waves sorted by four capabilities: perceiving, learning, abstracting, and reasoning.",
      relitDynamic:
        "Highlights a non-linear trade-off: Wave 2 neural networks massively outperformed Wave 1 expert systems at perception and learning, yet initially gave up Wave 1's transparent step-by-step logical auditability.",
      axes: {
        unit: ["Explicit human-written rules", "High-dimensional statistical weights", "Explanatory & neuro-symbolic world models"],
        goal: ["Logical deduction in bounded domains", "Pattern learning & prediction at scale", "Contextual adaptation & verifiable reasoning"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "1950s – 1980s",
          name: "Handcrafted Knowledge (Symbolic AI)",
          spark: "Dartmouth 1956 workshop, logic theorem provers, expert systems (MYCIN), and constraint schedulers.",
          shift: "Domain experts encoded explicit 'if–then' rules and ontologies; strong on crisp logical reasoning, tax rules, and chess.",
          exemplars: ["MYCIN", "Prolog & expert systems", "Logistics schedulers", "Tax & verification solvers"],
          blindSpot: "Brittle in noisy real-world perception (vision, speech) and unable to learn new abstractions from raw experience.",
          intensity: 63
        },
        {
          num: "2nd Wave",
          era: "1990s – 2020s",
          name: "Statistical Learning & Deep Networks",
          spark: "Backpropagation, probabilistic ML, GPUs, ImageNet (2012), and large-scale transformer pretraining.",
          shift: "Engineers design manifold/network architectures and optimize over massive data—unlocking fluent perception and generation.",
          exemplars: ["Convolutional & Vision Transformers", "Speech recognition", "Large Language Models"],
          blindSpot: "Data-hungry, prone to brittle out-of-distribution hallucinations, and opaque when high-stakes auditability is required.",
          intensity: 95
        },
        {
          num: "3rd Wave (Emerging)",
          era: "2020s – Ongoing",
          name: "Contextual Adaptation & Explanatory Models",
          spark: "Neuro-symbolic integration, verifiable reasoning loops (RLVR/formal verifiers), and causal world modeling.",
          shift: "Aims to synthesize Wave 1's structured reasoning with Wave 2's perceptual learning so systems build inspectable explanatory models from fewer examples.",
          exemplars: ["Neuro-symbolic solvers", "Compiler/theorem-prover-checked agents", "Adaptive causal models"],
          blindSpot: "Still an active research frontier rather than a finished era; Wave 1 solvers and Wave 2 neural nets coexist inside modern stacks.",
          intensity: 82,
          contested: true
        }
      ],
      critique:
        "Launchbury emphasized that Wave 1 never died—SAT solvers, compilers, and flight-control rules run alongside Wave 2 models every day, proving technological waves layer like geology rather than erasing the past.",
      sourceIds: ["darpa-ai", "launchbury-wiki"]
    },
    {
      id: "democracy",
      title: "Waves of Democratization",
      subtitle: "Global surges of self-government—and the 'reverse waves' that push back",
      category: "Politics & Society",
      archetype: "surge-undertow",
      labelStatus: "Canonical political-science thesis",
      coinedBy: "Samuel P. Huntington (1991, 'The Third Wave: Democratization in the Late Twentieth Century')",
      originHook:
        "Political scientist Samuel Huntington added a crucial physical element to the wave metaphor: the undertow, or 'reverse wave,' when authoritarian transitions outnumber democratic ones.",
      relitDynamic:
        "Shows that societal waves are not automatic escalators of progress—each democratic expansion was followed by a measurable authoritarian ebb.",
      axes: {
        unit: ["Expanding male franchise & parliaments", "Post-WWII & post-colonial constitutions", "Global post-junta & post-Soviet transitions", "Institutional resilience vs. gradual erosion"],
        goal: ["Break absolutist monarchy", "Rebuild after fascism & empire", "Replace military juntas & one-party rule", "Defend electoral courts, press & pluralism"]
      },
      waves: [
        {
          num: "1st Long Wave (+ Reverse)",
          era: "1828 – 1926 (Ebb: 1922–1942)",
          name: "19th-Century Parliamentary Expansion",
          spark: "Expanding suffrage rules, parliamentary reform acts, and post-WWI breakup of continental empires (peaking around 29 states).",
          shift: "Established contested elections and executive accountability—before fascism and militarism cut global democracies down to ~12 by 1942.",
          exemplars: ["19th-century suffrage reforms", "New Zealand women's suffrage (1893)", "1922–42 fascist reverse wave"],
          blindSpot: "Scholars note many 'first-wave democracies' denied votes to women, colonized peoples, and racial minorities—calling the timeline into question.",
          intensity: 60
        },
        {
          num: "2nd Short Wave (+ Reverse)",
          era: "1945 – 1962 (Ebb: 1960–1974)",
          name: "Post-WWII & Decolonization Surge",
          spark: "Allied defeat of Axis powers and early post-colonial independence constitutions across Asia and Africa.",
          shift: "Rebuilt constitutional democracies in West Germany, Italy, and Japan, and launched new post-colonial republics—before Cold War coups.",
          exemplars: ["Postwar Japan & West Germany", "Indian Constitution (1950)", "1960s–70s military-coup reverse wave"],
          blindSpot: "Cold War superpower interventions and military coups toppled fragile legislatures across Latin America, Greece, and Africa.",
          intensity: 73
        },
        {
          num: "3rd Wave",
          era: "1974 – 1990s",
          name: "Southern Europe, Latin America, Asia & Post-1989",
          spark: "Portugal's peaceful Carnation Revolution (April 1974), followed by Spain, Greece, Latin America, South Korea, Taiwan, and 1989 Eastern Europe.",
          shift: "More than 60 countries transitioned away from military juntas and one-party regimes within two decades.",
          exemplars: ["Portugal Carnation Revolution (1974)", "South Korea & Taiwan (late 1980s)", "1989 Central/Eastern Europe", "Post-apartheid South Africa (1994)"],
          blindSpot: "Rapid elections without independent courts or economic stability left several transitions vulnerable to elite capture.",
          intensity: 93
        },
        {
          num: "3rd Reverse Wave?",
          era: "2010s – Present",
          name: "Gradual Democratic Backsliding",
          spark: "Tracked by V-Dem scholars (Lührmann & Lindberg 2019): instead of sudden tanks in the street, elected executives hollow out checks from within.",
          shift: "Highlights 'autocratization by erosion'—weakening courts, independent media, and election rules step by step.",
          exemplars: ["Executive aggrandizement", "Media capture", "Civic counter-mobilizations"],
          blindSpot: "Debated among political scientists: some measure a sharp reverse wave, others see polarized resilience and local democratic renewals.",
          intensity: 68,
          contested: true
        }
      ],
      critique:
        "Pamela Paxton (2000) demonstrated that if universal female suffrage is required to count a country as democratic, Huntington's neat 19th-century first wave shifts dramatically forward in time.",
      sourceIds: ["huntington-wiki", "luhrmann-2019"]
    },
    {
      id: "environmentalism",
      title: "U.S. Environmental Movement",
      subtitle: "Wilderness preservation → Pollution laws → Market & climate justice clashes",
      category: "Politics & Society",
      archetype: "surge-undertow",
      labelStatus: "Policy & historical framework",
      coinedBy: "Fred Krupp (1986 WSJ op-ed) & historian Mark Dowie ('Losing Ground', 1995)",
      originHook:
        "Environmental Defense Fund leader Fred Krupp heralded 'third-wave environmentalism' in 1986 to pitch market incentives like cap-and-trade—immediately triggering a fierce debate over corporate compromise vs. grassroots justice.",
      relitDynamic:
        "Relit the lever of change: from fencing off scenic public lands, to federal pollution bans and citizen lawsuits, to economic carbon pricing—and then a grassroots 'fourth wave' demanding climate and environmental justice.",
      axes: {
        unit: ["Scenic wilderness & game reserves", "Toxic chemicals, air & watersheds", "Emissions markets & corporate supply chains", "Frontline communities & industrial policy"],
        goal: ["Conserve forests & national parks", "Legislate & litigate clean air/water", "Price externalities via market incentives", "Decarbonize equitably & cut local cumulative harm"]
      },
      waves: [
        {
          num: "1st Wave",
          era: "Late 1800s – 1940s",
          name: "Conservation & Wilderness Preservation",
          spark: "John Muir, Gifford Pinchot, and Theodore Roosevelt debating 'wise-use' forestry vs. untrammeled wilderness parks.",
          shift: "Created National Parks, National Forests, and wildlife refuges to halt unchecked frontier logging and species slaughter.",
          exemplars: ["National Park Service (1916)", "Sierra Club & Wilderness Society", "Migratory Bird Treaty"],
          blindSpot: "Ignored urban industrial pollution and frequently displaced Indigenous nations from ancestral lands to manufacture 'empty' wilderness.",
          intensity: 64
        },
        {
          num: "2nd Wave",
          era: "1962 – Late 1970s",
          name: "Ecological Regulation & Litigation",
          spark: "Rachel Carson's 'Silent Spring' (1962), the burning Cuyahoga River (1969), and the first Earth Day (20 million participants, 1970).",
          shift: "Built the modern regulatory state: federal pollution standards, DDT bans, impact statements, and citizen-suit enforcement.",
          exemplars: ["Clean Air Act (1970)", "Clean Water Act (1972)", "Endangered Species Act (1973)", "EPA founded"],
          blindSpot: "Command-and-control rules hit political gridlock in the 1980s, and hazardous waste sites were disproportionately sited near Black, Brown, and poor communities.",
          intensity: 90
        },
        {
          num: "3rd Wave",
          era: "Mid-1980s – 2000s",
          name: "Market Mechanisms & Boardroom Partnerships",
          spark: "EDF's Fred Krupp advocating market incentives and sulfur-dioxide emissions trading in the 1990 Clean Air Act Amendments.",
          shift: "Used cap-and-trade credits, corporate sustainability partnerships, and green consumer labels to cut acid rain at lower compliance cost.",
          exemplars: ["1990 SO₂ Acid Rain cap-and-trade", "Corporate supply-chain pledges", "Eco-certifications"],
          blindSpot: "Historian Mark Dowie and environmental-justice organizers critiqued boardroom dealmaking as insular and slow to halt fossil-fuel expansion.",
          intensity: 78
        },
        {
          num: "4th Wave",
          era: "1991 / 2010s – Present",
          name: "Environmental Justice & Green Industrial Policy",
          spark: "Rooted in the 1991 First National People of Color Environmental Leadership Summit, surging globally via youth climate strikes and clean-tech industrial policy.",
          shift: "Pairs rapid clean-energy deployment (solar, batteries, grid buildout) with frontline community health and indigenous land stewardship.",
          exemplars: ["17 Principles of Environmental Justice (1991)", "Clean-energy industrial policy", "Indigenous cultural burning"],
          blindSpot: "Permitting bottlenecks and global supply-chain mining create new local-vs-planetary trade-offs.",
          intensity: 88,
          contested: true
        }
      ],
      critique:
        "Environmental justice didn't wait for a 'fourth wave'—fenceline communities in Warren County, NC (1982) and earlier labor-health movements organized throughout Waves 2 and 3 even when mainstream histories left them out.",
      sourceIds: ["dowie-1995", "krupp-bio"]
    }
  ],

  timelineMarkers: [
    { year: 1968, domain: "Feminism", label: "Martha Weinman Lear coins 'The Second Feminist Wave' in The New York Times." },
    { year: 1979, domain: "Ska", label: "2 Tone Records launches in Coventry, igniting ska's British second wave." },
    { year: 1980, domain: "Futurism", label: "Alvin Toffler's bestseller 'The Third Wave' popularizes civilizational wave talk (Agrarian → Industrial → Information)." },
    { year: 1986, domain: "Environmentalism", label: "Fred Krupp announces 'Third-Wave Environmentalism' centered on market incentives." },
    { year: 1991, domain: "Democracy", label: "Samuel Huntington publishes 'The Third Wave' on global post-1974 democratization and reverse waves." },
    { year: 1992, domain: "Feminism", label: "Rebecca Walker publishes 'Becoming the Third Wave' after the Anita Hill hearings." },
    { year: 1999, domain: "Coffee", label: "Timothy Castle (1999) and Trish Rothgeb (2002, citing feminism) name 'Third-Wave Coffee.'" },
    { year: 2004, domain: "Psychology", label: "Steven Hayes names mindfulness/acceptance approaches the 'Third Wave' of CBT." },
    { year: 2006, domain: "HCI", label: "Susanne Bødker frames 'Third-Wave HCI' as computing moves from workplaces into everyday culture." },
    { year: 2012, domain: "Sociolinguistics", label: "Penelope Eckert formalizes the 'Three Waves of Variation Study' in Annual Review of Anthropology." },
    { year: 2017, domain: "AI", label: "DARPA's John Launchbury outlines the 'Three Waves of AI' (Symbolic → Statistical → Contextual)." }
  ],

  everydayScenes: [
    {
      id: "cup",
      title: "Ordering a Morning Cup",
      domain: "Coffee Culture",
      waves: [
        {
          wave: "1st Wave",
          headline: "Bottomless diner mug · $1.25",
          detail: "Scooped from a red vacuum tin roasted months ago. Nobody asks what country it came from; the promise is hot, fast, identical caffeine.",
          metrics: { provenance: 10, standardization: 95, craftTransparency: 12 }
        },
        {
          wave: "2nd Wave",
          headline: "16 oz Dark-Roast Vanilla Latte · $4.75",
          detail: "Pulled on an espresso bar with comfy armchairs. Beans are whole and labeled 'Sumatra' or 'Espresso Roast,' roasted dark and glossy so milk and syrup taste bold in Seattle or London.",
          metrics: { provenance: 45, standardization: 82, craftTransparency: 48 }
        },
        {
          wave: "3rd Wave",
          headline: "Single-Origin Pour-Over · $6.50",
          detail: "Finca El Puente, Huila, Colombia — Washed Pink Bourbon, 1,850m. Lightly roasted 6 days ago, weighed to 15g:250g so jasmine and blood-orange acidity stay intact.",
          metrics: { provenance: 96, standardization: 35, craftTransparency: 94 }
        }
      ]
    },
    {
      id: "speech",
      title: "Pronouncing the Sharp /t/ in 'Right'",
      domain: "Variationist Sociolinguistics",
      waves: [
        {
          wave: "1st Wave Lens",
          headline: "Census & Formality Readout",
          detail: "Analyst logs released /t/ as a prestige or careful-reading variant correlated with higher socioeconomic class and formal interview style.",
          metrics: { provenance: 25, standardization: 88, craftTransparency: 40 }
        },
        {
          wave: "2nd Wave Lens",
          headline: "Local Clique Identity",
          detail: "Ethnographer spends a year in one school and finds specific peer networks ('nerds' vs. 'burnouts') use crisp /t/ to mark boundaries against rival local groups.",
          metrics: { provenance: 68, standardization: 52, craftTransparency: 72 }
        },
        {
          wave: "3rd Wave Lens",
          headline: "Live Persona & Indexical Field",
          detail: "The exact same crisp /t/ draws from an 'indexical field' (articulate, exasperated, British-inflected, orthodox, or playfully geeky) depending on how the speaker styles the moment.",
          metrics: { provenance: 94, standardization: 20, craftTransparency: 95 }
        }
      ]
    },
    {
      id: "thought",
      title: "Handling 'I'm Going to Bomb This Talk'",
      domain: "Cognitive & Behavioral Therapy",
      waves: [
        {
          wave: "1st Wave Approach",
          headline: "Graduated Behavioral Exposure",
          detail: "Rank feared speaking situations from 1 to 10; step onto small stages repeatedly without escaping until physiological panic habituates.",
          metrics: { provenance: 35, standardization: 85, craftTransparency: 60 }
        },
        {
          wave: "2nd Wave Approach",
          headline: "Cognitive Restructuring Record",
          detail: "Catch the 'fortune-telling' distortion on paper. Weigh objective evidence from past talks to craft a balanced replacement belief.",
          metrics: { provenance: 65, standardization: 75, craftTransparency: 78 }
        },
        {
          wave: "3rd Wave Approach",
          headline: "Defusion & Values Action",
          detail: "Notice 'My mind is playing the bombing-the-talk story again' without debating it; anchor in why the topic matters to you and speak with butterflies present.",
          metrics: { provenance: 92, standardization: 38, craftTransparency: 92 }
        }
      ]
    },
    {
      id: "interface",
      title: "Designing a Digital Tool",
      domain: "Human–Computer Interaction",
      waves: [
        {
          wave: "1st Wave Brief",
          headline: "Cut Operator Keystrokes by 18%",
          detail: "Bring single users into a lab, time target clicks with Fitts's law, and eliminate menu errors on a workstation.",
          metrics: { provenance: 30, standardization: 92, craftTransparency: 50 }
        },
        {
          wave: "2nd Wave Brief",
          headline: "Co-Design Hospital Shift Handoffs",
          detail: "Shadow nurses and clerks on the ward; design shared boards around real interruptions, tacit knowledge, and team accountability.",
          metrics: { provenance: 72, standardization: 58, craftTransparency: 80 }
        },
        {
          wave: "3rd Wave Brief",
          headline: "Family Photo Archive Across Decades",
          detail: "No 'task completion time' applies: design for nostalgia, grief, privacy boundaries, playful sharing, and cultural memory in everyday life.",
          metrics: { provenance: 94, standardization: 24, craftTransparency: 93 }
        }
      ]
    }
  ],

  customWavePresets: [
    {
      name: "Craft Beer",
      w1: "Post-Prohibition adjunct macro-lagers (shelf-stable, uniform fizz)",
      w2: "1970s–90s microbrew pioneers & brewpubs (Anchor, Sierra Nevada pale ale)",
      w3: "Hyper-local taprooms, single-hop hazy IPAs, spontaneous wild/farmhouse terroir",
      mechanism: "reaction"
    },
    {
      name: "Wine",
      w1: "Bulk jug table wine & anonymous regional blends",
      w2: "Varietal labeling, Robert Parker 100-point scores & oaked international prestige",
      w3: "Natural / low-intervention wine: native yeasts, skin-contact, tiny grower transparency",
      mechanism: "reaction"
    },
    {
      name: "Web & Computing",
      w1: "Static read-only pages, directories & dial-up portals",
      w2: "Centralized social feeds, mobile cloud platforms & algorithmic scale",
      w3: "Local-first software, open protocols, user-owned graphs & malleable tools",
      mechanism: "synthesis"
    },
    {
      name: "Ramen Outside Japan",
      w1: "1970s freeze-dried instant noodle bricks in dorm kitchens",
      w2: "2000s urban tonkotsu boom & celebrity ramen-ya queues",
      w3: "Regional tare craft, heritage-wheat house noodles & hyper-specific broths",
      mechanism: "granularity"
    }
  ],

  quizScenarios: [
    {
      id: "q1",
      prompt:
        "A chocolate maker buys fermented cacao directly from one cooperative in Piura, Peru, roasts lightly in small batches, and uses only cacao + cane sugar so natural raspberry acidity comes through.",
      question: "Which wave pattern does this match, and why?",
      choices: [
        {
          label: "1st Wave — Democratizing a shelf-stable household commodity",
          correct: false,
          feedback: "1st-wave chocolate (like early mass-market milk bars) optimized for low cost, uniformity, and shelf life—usually masking bean differences with sugar and vanillin."
        },
        {
          label: "2nd Wave — Branded dark-percentage luxury couverture",
          correct: false,
          feedback: "Close, because quality rose in Wave 2—but second-wave boutiques mostly melted bulk couverture blended by country or cacao %, rather than roasting single-farm beans lightly."
        },
        {
          label: "3rd Wave — Farm-level terroir, minimal masking, and maker transparency",
          correct: true,
          feedback: "Spot on. Like third-wave coffee, bean-to-bar third-wave chocolate strips away heavy roast/vanilla standardization so specific farm genetics and fermentation shine."
        }
      ]
    },
    {
      id: "q2",
      prompt:
        "A linguist notices a teenager uses crisp, released /t/ endings when making a dry, sarcastic joke, then drops them seconds later when speaking warmly to the same friend.",
      question: "Which wave of sociolinguistics was built specifically to explain this rapid shift?",
      choices: [
        {
          label: "1st Wave — Macro census correlation (Labovian class stratification)",
          correct: false,
          feedback: "A 1st-wave survey aggregates across whole interviews by class and formality, treating moment-to-moment stance shifts mostly as shifts in 'attention paid to speech.'"
        },
        {
          label: "3rd Wave — Stylistic agency & Eckert's indexical field",
          correct: true,
          feedback: "Exactly. Penelope Eckert's 3rd wave treats linguistic features as semiotic resources with an 'indexical field' (precise, dry, exasperated, formal) that speakers deploy to build stance and persona in real time."
        },
        {
          label: "2nd Wave — Static neighborhood network loyalty",
          correct: false,
          feedback: "2nd-wave ethnography maps who hangs out with whom locally, but 3rd-wave theory explains how one speaker actively remixes features within a single conversation."
        }
      ]
    },
    {
      id: "q3",
      prompt:
        "Around 2011, DIY bands in Philadelphia and the Midwest skipped over glossy 2006 MTV arena pop-emo to revive the intricate, unpolished 1997 sound of Cap'n Jazz and American Football.",
      question: "What does this reveal about how cultural 'waves' actually move?",
      choices: [
        {
          label: "Waves always progress linearly from worse to better",
          correct: false,
          feedback: "Cultural waves aren't software version upgrades. Later waves frequently rebel against commercialized waves by reaching backward."
        },
        {
          label: "A 'leapfrog' or relit revival: Wave 4 can rebel against Wave 3 by relighting Wave 2",
          correct: true,
          feedback: "Yes! Emo's 4th wave ('emo revival') is a classic leapfrog: when Wave 3 grew slick and commercial, underground scenes relit Wave 2's DIY ethos and math-rock guitars."
        },
        {
          label: "Earlier waves completely disappear once a new wave arrives",
          correct: false,
          feedback: "In music, coffee, and therapy alike, earlier waves keep running alongside new ones."
        }
      ]
    },
    {
      id: "q4",
      prompt:
        "Historian Nancy A. Hewitt proposed replacing 'ocean waves' with 'radio waves' when teaching the history of social movements like feminism.",
      question: "What blind spot of the ocean-wave metaphor does the 'radio wave' model fix?",
      choices: [
        {
          label: "Ocean waves imply quiet 'empty troughs' between peaks and flatten simultaneous competing voices into one monolith",
          correct: true,
          feedback: "Right. Ocean waves hide continuous labor, Black, Indigenous, and local organizing between famous peaks—whereas radio frequencies show multiple movements broadcasting at once, sometimes in harmony and sometimes in static."
        },
        {
          label: "Ocean waves move too fast to measure in decades",
          correct: false,
          feedback: "Speed isn't the core issue—the problem is assuming only one unified crest exists at a time and nothing happens in between."
        },
        {
          label: "Radio waves prove there was never any generational change at all",
          correct: false,
          feedback: "Hewitt keeps generational shifts in view, while showing that multiple frequencies broadcast concurrently across decades."
        }
      ]
    },
    {
      id: "q5",
      prompt:
        "In DARPA's Three Waves of AI, a modern tax-calculation engine uses explicit statutory rules, while a vision model uses billions of learned weights to spot road hazards.",
      question: "How does the Three-Wave AI framework view these two systems today?",
      choices: [
        {
          label: "Wave 2 completely obsoleted Wave 1, so rule engines are no longer AI-relevant",
          correct: false,
          feedback: "Wave 2 excels at noisy perception, but Wave 1 symbolic solvers and rule engines remain unmatched when exact statutory or mathematical guarantees are required."
        },
        {
          label: "Waves coexist as layers, and Wave 3 aims to combine Wave 1's structured reasoning with Wave 2's statistical learning",
          correct: true,
          feedback: "Correct. Rather than erasing Wave 1, third-wave / neuro-symbolic approaches fuse learned representations with verifiable reasoning and world models."
        },
        {
          label: "Wave 1 systems learn from unlabeled video better than Wave 2",
          correct: false,
          feedback: "Raw perceptual learning from messy sensory data is precisely where Wave 1 handcrafted rules struggled and Wave 2 statistical learning broke through."
        }
      ]
    }
  ],

  glossary: [
    {
      term: "Relit Wave",
      def: "When a seemingly settled everyday domain—a cup of coffee, a vowel sound, a genre, a therapy—gets re-examined from first principles by a new cohort reacting to what the previous era standardized or left out."
    },
    {
      term: "Retroactive First Wave",
      def: "Nobody walks around saying 'Welcome to First-Wave Coffee' or 'First-Wave Feminism' while it is happening. Wave 1 only receives its number retroactively once Wave 2 or Wave 3 names itself."
    },
    {
      term: "Third Place",
      def: "Sociologist Ray Oldenburg's term (1989) for social surroundings separate from home (first place) and work (second place)—central to how Second-Wave Coffee marketed cafés."
    },
    {
      term: "Terroir",
      def: "Borrowed from French winemaking: how a specific farm's soil, microclimate, altitude, plant variety, and processing leave a recognizable sensory fingerprint in coffee, cacao, tea, or wine."
    },
    {
      term: "Indexical Field",
      def: "Penelope Eckert's third-wave sociolinguistic concept (2008): a constellation of potential social meanings (e.g., precise, formal, annoyed, nerdy) linked to a linguistic feature, activated in context."
    },
    {
      term: "Psychological Flexibility",
      def: "Core aim of third-wave CBT (especially ACT): staying in contact with the present moment—including uncomfortable thoughts or feelings—while choosing actions aligned with personal values."
    },
    {
      term: "Reverse Wave (Undertow)",
      def: "Samuel Huntington's term (1991) for a historical period in which transitions away from a movement (such as democratic breakdowns) outnumber transitions toward it."
    },
    {
      term: "Leapfrog Revival",
      def: "A cultural pattern—vivid in 4th-wave emo and craft revivals—where a new underground wave skips over the immediately preceding commercial wave to revive an earlier, rawer wave."
    },
    {
      term: "Radio-Wave Metaphor",
      def: "Historian Nancy A. Hewitt's alternative to ocean waves (2010): imagining movements as concurrent broadcasts on different frequencies—some loud in mainstream archives, others jammed by static, none vanishing in 'troughs.'"
    },
    {
      term: "Situated Action",
      def: "A cornerstone of Second-Wave HCI (Lucy Suchman, 1987): human action is improvised moment-by-moment within material and social circumstances rather than merely executing pre-stored mental plans."
    },
    {
      term: "Couverture vs. Bean-to-Bar",
      def: "In chocolate: couverture is pre-made chocolate melted by chocolatiers for bonbons (typical in Wave 2), whereas bean-to-bar makers roast, crack, winnow, and grind raw fermented cacao beans themselves (Wave 3)."
    },
    {
      term: "2 Tone",
      def: "Late-1970s British second wave of ska centered on Coventry's 2 Tone Records, uniting Jamaican ska rhythms with punk energy and multiracial anti-racist politics."
    }
  ],

  sources: [
    {
      id: "coffee-wiki",
      domain: "Coffee",
      cite: "Wikipedia contributors, 'Third-wave coffee' (referencing Timothy J. Castle 1999 in Tea & Coffee Asia and Trish Rothgeb 2002/2003 in The Flamekeeper).",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee",
      note: "Documents the 1999/2002 coinage, Rothgeb's allusion to third-wave feminism, and 2015 industry consolidations."
    },
    {
      id: "coffee-gold",
      domain: "Coffee",
      cite: "Jonathan Gold, 'La Mill: The Latest Buzz,' LA Weekly (March 12, 2008).",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee#Use_of_the_term",
      note: "Classic food-criticism summary contrasting Folgers (1st), Peet's/Starbucks (2nd), and farm-sourced light-roast connoisseurship (3rd)."
    },
    {
      id: "coffee-rothgeb",
      domain: "Coffee",
      cite: "Trish R. Skeie (Rothgeb), 'Norway and Coffee,' The Flamekeeper (Roasters Guild Newsletter, Spring 2003).",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee#History",
      note: "Popularized the First / Second / Third Wave triad across specialty coffee guilds and barista competitions."
    },
    {
      id: "eckert-2012",
      domain: "Sociolinguistics",
      cite: "Penelope Eckert, 'Three Waves of Variation Study: The Emergence of Meaning in the Study of Sociolinguistic Variation,' Annual Review of Anthropology 41: 87–100 (2012).",
      url: "https://doi.org/10.1146/annurev-anthro-092611-145828",
      note: "Defines the macro-survey 1st wave, ethnographic 2nd wave, and stylistic/indexical 3rd wave."
    },
    {
      id: "eckert-2018",
      domain: "Sociolinguistics",
      cite: "Penelope Eckert, Meaning and Linguistic Variation: The Third Wave in Sociolinguistics (Cambridge University Press, 2018).",
      url: "https://doi.org/10.1017/9781316403242",
      note: "Collects foundational papers from Detroit high-school ethnography to indexical fields and persona."
    },
    {
      id: "lear-1968",
      domain: "Feminism",
      cite: "Martha Weinman Lear, 'The Second Feminist Wave: What Do These Women Want?,' The New York Times Magazine (March 10, 1968).",
      url: "https://www.womenshistory.org/exhibits/feminism-first-wave-0",
      note: "Established the modern 'wave' framing by linking 1960s liberation organizing back to 19th-century suffrage."
    },
    {
      id: "britannica-fem",
      domain: "Feminism",
      cite: "Encyclopædia Britannica, 'Third wave of feminism' (covering Kimberlé Crenshaw's intersectionality, Rebecca Walker 1992, and Riot Grrrl).",
      url: "https://www.britannica.com/topic/third-wave-of-feminism",
      note: "Overview of 1990s pluralistic, intersectional, and DIY cultural currents."
    },
    {
      id: "hewitt-2010",
      domain: "Wave Critique",
      cite: "Nancy A. Hewitt (ed.), No Permanent Waves: Recasting Histories of U.S. Feminism (Rutgers University Press, 2010) & 'Feminist Frequencies' (Feminist Studies, 2012).",
      url: "https://anthropology.mit.edu/files/anthropology/imce/people/papers/helmreich_genders_of_waves_color.pdf",
      note: "Critiques ocean-wave amnesia and proposes radio frequencies; also analyzed in Stefan Helmreich's wave-metaphor scholarship."
    },
    {
      id: "ska-wiki",
      domain: "Ska",
      cite: "David V. Moskowitz, Caribbean Popular Music (2006) & 'Third wave ska' reference histories.",
      url: "https://en.wikipedia.org/wiki/Third_wave",
      note: "Tracks Jamaican ska (1960s), British 2 Tone (late 1970s), and international 3rd-wave ska-punk (late 1980s–90s)."
    },
    {
      id: "ska-fourth",
      domain: "Ska",
      cite: "Jessica Lipsky, 'Ska Lives: On the Genre's Fourth Wave' & contemporary Latin/DIY ska reporting.",
      url: "https://www.jlipsky.com/ska-fourth-wave",
      note: "Covers post-2010 underground, Mexican/LA ska, and 'New Tone' continuities."
    },
    {
      id: "emo-genre",
      domain: "Emo",
      cite: "WKNC / music historiography overviews of 1st–5th wave emo & 'Emo revival.'",
      url: "https://wknc.org/2026/05/30/a-wikipedia-deep-dive-into-emo-rock/",
      note: "Summarizes D.C. emocore (1st), Midwest emo (2nd), 2000s pop-emo (3rd), 2010s revival (4th), and DIY bedroom/genre-fluid 5th wave."
    },
    {
      id: "emo-wknc",
      domain: "Emo",
      cite: "Genre history: Rites of Spring (1985), Sunny Day Real Estate & American Football (1990s), My Chemical Romance (2000s), Modern Baseball (2010s).",
      url: "https://genre-ai.app/genre/emo",
      note: "Contrasts tempo, guitar style, production polish, and DIY vs. mainstream distribution across waves."
    },
    {
      id: "hayes-2004",
      domain: "Psychology",
      cite: "Steven C. Hayes, 'Acceptance and Commitment Therapy, Relational Frame Theory, and the Third Wave of Behavioral and Cognitive Therapies,' Behavior Therapy 35(4): 639–665 (2004).",
      url: "https://en.wikipedia.org/wiki/Acceptance_and_commitment_therapy",
      note: "Introduced the three-wave taxonomy in clinical psychology."
    },
    {
      id: "hayes-hofmann-2021",
      domain: "Psychology",
      cite: "Steven C. Hayes & Stefan G. Hofmann, '\"Third-wave\" cognitive and behavioral therapies and the emergence of a process-based approach to intervention in psychiatry,' World Psychiatry 20(3): 363–375 (2021).",
      url: "https://doi.org/10.1002/wps.20884",
      note: "Reconciles traditional and third-wave CBT debates into process-based therapy."
    },
    {
      id: "bodker-2006",
      domain: "HCI",
      cite: "Susanne Bødker, 'When Second Wave HCI Meets Third Wave Challenges,' Proceedings of NordiCHI '06 (ACM, 2006).",
      url: "https://doi.org/10.1145/1182475.1182476",
      note: "Foundational framing of human factors (1st), cooperative work (2nd), and everyday/experiential computing (3rd)."
    },
    {
      id: "bodker-2015",
      domain: "HCI",
      cite: "Susanne Bødker, 'Third-wave HCI, 10 years later — participation and sharing,' ACM Interactions 22(5): 24–31 (2015).",
      url: "https://doi.org/10.1145/2804405",
      note: "Reflects on what third-wave HCI gained and what collective workplace wisdom it risked losing."
    },
    {
      id: "darpa-ai",
      domain: "AI",
      cite: "John Launchbury, 'A DARPA Perspective on Artificial Intelligence' (DARPA I2O, 2017).",
      url: "https://en.wikipedia.org/wiki/John_Launchbury",
      note: "Defines Handcrafted Knowledge (1st), Statistical Learning (2nd), and Contextual Adaptation (3rd)."
    },
    {
      id: "launchbury-wiki",
      domain: "Futurism",
      cite: "Alvin Toffler, The Third Wave (William Morrow, 1980).",
      url: "https://en.wikipedia.org/wiki/The_Third_Wave_(Toffler_book)",
      note: "Macro-historical bestseller framing Agricultural (1st), Industrial (2nd), and Information (3rd) civilizations."
    },
    {
      id: "huntington-wiki",
      domain: "Democracy",
      cite: "Samuel P. Huntington, The Third Wave: Democratization in the Late Twentieth Century (University of Oklahoma Press, 1991).",
      url: "https://en.wikipedia.org/wiki/Waves_of_democracy",
      note: "Defines global democratization surges and authoritarian 'reverse waves,' alongside suffrage-based critiques."
    },
    {
      id: "luhrmann-2019",
      domain: "Democracy",
      cite: "Anna Lührmann & Staffan I. Lindberg, 'A third wave of autocratization is here: what is new about it?,' Democratization 26(7): 1095–1113 (2019).",
      url: "https://doi.org/10.1080/13510347.2019.1582029",
      note: "Empirical V-Dem analysis comparing classic coups with gradual institutional erosion."
    },
    {
      id: "dowie-1995",
      domain: "Environmentalism",
      cite: "Mark Dowie, Losing Ground: American Environmentalism at the Close of the Twentieth Century (MIT Press, 1995).",
      url: "https://mitpress.mit.edu/9780262540841/losing-ground/",
      note: "Examines conservation (1st), federal regulation (2nd), EDF market incentives (3rd), and grassroots environmental justice."
    },
    {
      id: "krupp-bio",
      domain: "Environmentalism",
      cite: "Fred Krupp, 'New Environmentalism Factors In Economic Needs,' The Wall Street Journal (Nov. 20, 1986).",
      url: "https://www.encyclopedia.com/journals/culture-magazines/krupp-fred",
      note: "Coined 'third-wave environmentalism' around emissions-reduction credits and economic alignment."
    },
    {
      id: "chocolate-craft",
      domain: "Chocolate",
      cite: "Carla D. Martin & Sampeck (craft cacao scholarship) & contemporary 'Third Wave / Bean-to-Bar' chocolate reporting.",
      url: "https://springsmag.com/whats_next_cos/third-wave-chocolate-company/",
      note: "Illustrates how small-batch cacao roasters explicitly adopt coffee's third-wave vocabulary."
    }
  ]
};
