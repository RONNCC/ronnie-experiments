/* The Relit Wave — data.js
 * Eleven movements that periodize themselves in numbered waves, with the
 * citation status of each label, the years its naming was published, and the
 * critiques that push back on tidy numbering.
 *
 * Every year in this file resolves to an entry in `sources`. If you add a date,
 * add the citation that backs it.
 */

window.RELIT_WAVE_DATA = {
  archetypes: [
    {
      id: "commodity-craft",
      name: "Commodity, then experience, then terroir",
      short: "Craft & terroir",
      color: "#a2603a",
      summary:
        "Wave 1 solves mass availability and shelf stability. Wave 2 turns buying into a branded ritual. Wave 3 strips standardization back out to show farm, variety, and maker.",
      domains: ["coffee", "chocolate"]
    },
    {
      id: "revival-relay",
      name: "Root scene, then a relay across cultures, then revival",
      short: "Revival relay",
      color: "#8a6a1f",
      summary:
        "Wave 1 invents a local underground sound. Wave 2 relocates it for a new geography. Wave 3 scales it commercially, which usually triggers a later revival that reaches back past the commercial peak.",
      domains: ["ska", "emo"]
    },
    {
      id: "structure-context",
      name: "Macro categories, then inner models, then situated agency",
      short: "Context & agency",
      color: "#2f6663",
      summary:
        "Wave 1 measures external categories or overt behavior. Wave 2 looks inside local groups and mental models. Wave 3 treats meaning, emotion, and adaptation as things people do in context.",
      domains: ["sociolinguistics", "cbt", "hci", "ai"]
    },
    {
      id: "surge-undertow",
      name: "Institutional win, then structural critique, then contested ebb",
      short: "Surge & undertow",
      color: "#4a5a72",
      summary:
        "Wave 1 wins legal or institutional ground. Wave 2 widens scope after a trough or crisis. Wave 3 pluralizes who counts, or faces a measurable reverse wave.",
      domains: ["feminism", "democracy", "environmentalism"]
    }
  ],

  domains: [
    {
      id: "coffee",
      title: "Coffee culture",
      subtitle: "From vacuum tins to farm level light roasts",
      category: "Food & drink",
      archetype: "commodity-craft",
      labelStatus: "Industry term, coined 1999 and popularized 2002",
      coinedBy: "Timothy J. Castle in Trade Journal Asia (1999) and Trish Rothgeb in The Flamekeeper (2002)",
      originHook:
        "Rothgeb's Roasters Guild essay borrowed the three waves of feminism to explain why specialty roasters were treating coffee like wine rather than diner fuel. Castle used the phrase three years earlier in a trade journal, which is why credit for the term is still argued.",
      relitDynamic:
        "Each wave relit what counted as good coffee: reliable caffeine in every kitchen, then espresso cafés as a third place, then farm traceable beans roasted light enough to taste of fruit.",
      axes: {
        unit: ["Anonymous blend", "Country and roast style", "Single farm or micro lot", "Measured extraction and producer equity"],
        goal: ["Low price, long shelf life", "Café ritual, bold consistency", "Origin clarity and craft", "Replicable science, systemic sustainability"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1900s to 1960s",
          name: "Mass household commodity",
          spark: "Vacuum sealed cans (Hills Bros., 1900), instant soluble coffee, and postwar grocery distribution.",
          shift: "Made coffee an affordable staple on nearly every American counter.",
          exemplars: ["Folgers", "Maxwell House", "Hills Bros.", "Instant and percolator coffee"],
          blindSpot: "Stale pre ground beans, robusta heavy blends, and uneven roasting erased origin flavor and farmer identity."
        },
        {
          num: "Wave 2",
          era: "Late 1960s to 1990s",
          name: "Espresso and the café",
          spark: "Alfred Peet's 1966 Berkeley shop, George Howell's Coffee Connection, and Starbucks scaling the Italian espresso bar.",
          shift: "Introduced whole bean freshness, country of origin labels, espresso drinks, and the café as a social third place.",
          exemplars: ["Peet's Coffee", "Starbucks", "Specialty Coffee Association (1982)", "Signature dark roasts and lattes"],
          blindSpot: "Heavy dark roasting and sweetened milk drinks often hid bean character while chains optimized for global uniformity."
        },
        {
          num: "Wave 3",
          era: "Late 1990s to 2010s",
          name: "Terroir, light roast, direct trade",
          spark: "Barista competitions, single origin pour overs, and independent roasters buying coffee as an agricultural crop.",
          shift: "Sourced by farm, variety (Geisha, Bourbon), altitude, and processing method, then roasted light enough to keep acidity and florals.",
          exemplars: ["Intelligentsia", "Stumptown", "Counter Culture", "Square Mile", "V60 and Chemex"],
          blindSpot: "Critics pointed at intimidating minimalism, high cup prices, and purchases of independent roasters by larger groups."
        },
        {
          num: "Wave 4, debated",
          era: "Mid 2010s to now",
          name: "Extraction science and home precision",
          spark: "Refractometers, water chemistry, anaerobic fermentation experiments, and prosumer home espresso.",
          shift: "Industry writers disagree on what fourth wave means: measured extraction, producer led processing, or café grade brewing moving home.",
          exemplars: ["TDS refractometers", "Carbonic maceration lots", "Precision home grinders", "Producer owned roasteries"],
          blindSpot: "No agreed definition, and the label gets used as marketing for cold brew cans and competition lots.",
          contested: true
        }
      ],
      critique:
        "The three wave story describes US, UK, and Australian retail habits. It flattens centuries of coffee ceremony and café culture in Ethiopia, Yemen, Turkey, Italy, and Latin America.",
      sourceIds: ["coffee-wiki", "coffee-castle", "coffee-rothgeb"]
    },
    {
      id: "sociolinguistics",
      title: "Variationist sociolinguistics",
      subtitle: "How linguists explain why one speaker sounds different in two sentences",
      category: "Language & mind",
      archetype: "structure-context",
      labelStatus: "Canonical academic framework, formalized 2012",
      coinedBy: "Penelope Eckert (LSA talk 2005; Annual Review of Anthropology 2012)",
      originHook:
        "Eckert sorted fifty years of variation research into three waves, as a way of arguing that the field had moved from census spreadsheets to high school cliques to active persona building.",
      relitDynamic:
        "Each wave relit the speaker: as a demographic data point, then as a member of a local network, then as someone who styles identity in real time.",
      axes: {
        unit: ["Census class and age strata", "Local ethnographic network", "Indexical field and persona"],
        goal: ["Correlate speech with macro groups", "Uncover local vernacular loyalty", "Track how variants build social meaning"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1960s to 1970s",
          name: "Macro sociological survey",
          spark: "William Labov's 1966 New York department store study of the /r/ in fourth floor, plus large urban speech surveys.",
          shift: "Showed that free variation is not noise. It patterns with class, age, sex, and ethnicity.",
          exemplars: ["Labov, New York City (1966)", "Trudgill in Norwich", "Attention paid to speech", "Demographic grids"],
          blindSpot: "Treated speakers as carriers of census categories and read casual vernacular as reduced self monitoring."
        },
        {
          num: "Wave 2",
          era: "Late 1970s to 1990s",
          name: "Ethnography and social networks",
          spark: "Lesley Milroy's Belfast network fieldwork and Eckert's Jocks and Burnouts ethnography outside Detroit.",
          shift: "Moved inside neighborhoods and schools to show people talk like the communities of practice they belong to.",
          exemplars: ["Milroy, Belfast (1980)", "Eckert, Jocks and Burnouts (1989)", "Community of practice", "Martha's Vineyard precursor"],
          blindSpot: "Still treated features as badges of membership rather than tools people remix."
        },
        {
          num: "Wave 3",
          era: "2000s to now",
          name: "Stylistic practice and social meaning",
          spark: "Eckert's indexical field (2008) and research on stance, affect, and persona.",
          shift: "Flips the arrow. Variables carry clouds of possible meanings that speakers combine on purpose.",
          exemplars: ["Released /t/ across styles", "California vowel shift personas", "Code switching and stance"],
          blindSpot: "Critics say third wave work emphasizes speaker performance more than how listeners constrain or misread a variant."
        }
      ],
      critique:
        "Eckert is explicit that the third wave does not retire the first two. Linguists still need macro maps to know which sound changes exist before they study them.",
      sourceIds: ["eckert-2012", "eckert-2018"]
    },
    {
      id: "chocolate",
      title: "Craft and bean to bar chocolate",
      subtitle: "Borrowing coffee's playbook to turn cacao into terroir",
      category: "Food & drink",
      archetype: "commodity-craft",
      labelStatus: "Borrowed craft analogy, popular from the 2000s",
      coinedBy: "US craft makers and food writers in the 2000s, echoing third wave coffee",
      originHook:
        "Small makers started calling bean to bar chocolate third wave because cacao follows coffee almost step for step: harvest, ferment, dry, roast, grind. For a century that chain sat hidden behind sugar and vanilla.",
      relitDynamic:
        "Relit chocolate from an industrial candy bar, past luxury bonbons made from bought in couverture, to single estate bars made from cacao and sugar alone.",
      axes: {
        unit: ["Bulk cacao with added fats and sugar", "Cacao percentage and European couverture", "Single origin fermented cacao and cane sugar"],
        goal: ["Cheap, uniform sweetness", "Luxury confectionery, percentage branding", "Fruit and floral terroir, better farm pay"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "Late 1800s to mid 1900s",
          name: "Industrial candy",
          spark: "Conching, Dutch alkalization, milk chocolate, and West African bulk supply chains.",
          shift: "Turned drinking chocolate into shelf stable candy for millions of households.",
          exemplars: ["Hershey's", "Cadbury", "Mars", "Dutch processed cocoa"],
          blindSpot: "Sugar and vanilla masked defects, over roasting hid variation, and farmgate prices stayed brutal."
        },
        {
          num: "Wave 2",
          era: "1980s to late 1990s",
          name: "Premium dark and boutique chocolatiers",
          spark: "High cacao vintage bars, upscale truffle shops, and supermarket dark chocolate aisles.",
          shift: "Taught shoppers to check cacao percentages and treat dark chocolate as an adult pleasure.",
          exemplars: ["Valrhona", "Scharffen Berger (1996)", "Gourmet truffle and ganache shops"],
          blindSpot: "Most chocolatiers melted pre made couverture instead of roasting raw beans."
        },
        {
          num: "Wave 3",
          era: "Mid 2000s to now",
          name: "Bean to bar",
          spark: "Micro batches on stone grinders, transparent micro lots, and harvest years printed on the wrapper.",
          shift: "Two ingredient bars where Peruvian, Ugandan, or Venezuelan beans taste of raspberry, citrus, or brownie.",
          exemplars: ["Dandelion Chocolate", "Dick Taylor", "Tree to bar makers", "Fine Cacao and Chocolate Institute"],
          blindSpot: "Tiny batches mean bars at ten to sixteen dollars, which strains the promise of paying farmers more."
        }
      ],
      critique:
        "Mesoamerican peoples grew, fermented, and frothed cacao for millennia. Waves here describe a modern retail recovery, not the invention of cacao craft.",
      sourceIds: ["chocolate-craft", "coffee-wiki"]
    },
    {
      id: "ska",
      title: "Ska",
      subtitle: "Kingston independence horns, Coventry 2 Tone, then global punk ska",
      category: "Music & subculture",
      archetype: "revival-relay",
      labelStatus: "Scene periodization, in use since the late 1970s",
      coinedBy: "Music journalists and Moon Ska Records",
      originHook:
        "Ska is the clearest geographic relay in popular music. Each wave crossed an ocean or a generation, sped the tempo up, and fused the last wave with whatever was loud locally.",
      relitDynamic:
        "Relit the same offbeat guitar chop three times: first as Jamaican independence music, then as British anti racist punk, then as American third wave ska punk on the warped tour circuit.",
      axes: {
        unit: ["Jamaican dancehall single", "Coventry 2 Tone 45", "US ska punk tour package"],
        goal: ["National sound after independence", "Multiracial youth unity under Thatcher", "High energy crossover audience"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "Late 1950s to 1960s",
          name: "Jamaican origin",
          spark: "Sound system DJs in Kingston mixing American R&B with mento and calypso after Jamaican independence in 1962.",
          shift: "Invented the walking bass and offbeat guitar that define the genre, and gave Jamaican listeners a local pop sound.",
          exemplars: ["The Skatalites", "Prince Buster", "Toots and the Maytals", "Studio One"],
          blindSpot: "Early ska was dance music first. The political reading arrives later, mostly from Britain."
        },
        {
          num: "Wave 2",
          era: "Late 1970s to early 1980s",
          name: "2 Tone in Britain",
          spark: "The Specials, the Selecter, and Madness forming in the West Midlands punk scene as the National Front grew.",
          shift: "Fused ska with punk speed and put Black and white musicians on the same stages and record labels.",
          exemplars: ["The Specials", "The Selecter", "Madness", "2 Tone Records (1979)"],
          blindSpot: "Unemployment, venue closures, and police pressure on Black British youth limited how long the scene lasted."
        },
        {
          num: "Wave 3",
          era: "Mid 1980s to late 1990s",
          name: "American ska punk",
          spark: "Third wave bands forming on the US punk circuit and signing to independent ska labels.",
          shift: "Added horns and punk tempo to the 2 Tone template and pushed the sound into mainstream radio and film soundtracks.",
          exemplars: ["Mighty Mighty Bosstones", "Reel Big Fish", "Moon Ska Records", "Sublime"],
          blindSpot: "The commercial version drifted far enough from Jamaican ska that scene elders treated it as a separate genre."
        },
        {
          num: "Wave 4, contested",
          era: "2010s to now",
          name: "Latin and DIY ska revival",
          spark: "Latin American and US Latin ska scenes, plus youth run revival nights in cities with large Jamaican and Mexican diasporas.",
          shift: "Moves the center of gravity away from English language pop ska and back toward dance floors and local scenes.",
          exemplars: ["Mexican and LA ska", "New Tone", "DIY revival nights"],
          blindSpot: "Fourth wave is a press and scene shorthand rather than a defined movement, and insiders disagree about the border.",
          contested: true
        }
      ],
      critique:
        "British 2 Tone and American third wave dominate the story, which sidelines Jamaican ska after the 1960s and Latin ska almost entirely. The waves are a relay between three countries, not a universal timeline.",
      sourceIds: ["ska-wiki", "ska-fourth"]
    },
    {
      id: "emo",
      title: "Emo",
      subtitle: "Washington hardcore, Midwest basements, mall pop, then the revival",
      category: "Music & subculture",
      archetype: "revival-relay",
      labelStatus: "Fan and press historiography, four waves with a disputed fifth",
      coinedBy: "Zines, indie critics, and forum communities in the 1990s and 2000s",
      originHook:
        "Few subcultures argue about wave numbers harder than emo. Fans split the history four ways and add a fifth when the music stops sounding like a single genre, which is exactly where a wave model starts to break down.",
      relitDynamic:
        "The leapfrog revival is the clearest case anywhere in this guide. Fourth wave bands around 2010 deliberately skipped the 2006 mall version to reach back to the 1997 basements.",
      axes: {
        unit: ["DC hardcore show", "Midwest seven inch", "MySpace arena single", "Bandcamp revival split"],
        goal: ["Turn punk inward", "Quiet loud confession", "Anthemic pop catharsis", "Reclaim intimacy and mix genres"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1984 to early 1990s",
          name: "Washington emocore",
          spark: "Rites of Spring and Embrace playing Revolution Summer shows in 1985 and rejecting pit violence.",
          shift: "Kept hardcore speed and Dischord DIY ethics while turning lyrics toward grief and vulnerability.",
          exemplars: ["Rites of Spring", "Embrace", "Moss Icon", "Dag Nasty"],
          blindSpot: "The founders rejected the label almost immediately and called it music journalism nonsense."
        },
        {
          num: "Wave 2",
          era: "Early 1990s to 2000",
          name: "Midwest emo",
          spark: "Touring circuits across the Midwest and Pacific Northwest mixing punk with indie rock and math rock.",
          shift: "Introduced clean arpeggiated guitars, quiet to screaming dynamics, and unglamorous everyday vocals.",
          exemplars: ["Sunny Day Real Estate", "Cap'n Jazz", "American Football", "Mineral"],
          blindSpot: "Most of these bands broke up with tiny pressings and only became landmarks years later online."
        },
        {
          num: "Wave 3",
          era: "2001 to 2008",
          name: "Mainstream emo pop",
          spark: "Jimmy Eat World's Bleed American, Vagrant and Fueled by Ramen, MySpace, and MTV.",
          shift: "Married emotional urgency to glossy pop punk hooks, concept records, and a recognizable fashion.",
          exemplars: ["Jimmy Eat World", "Taking Back Sunday", "My Chemical Romance", "Fall Out Boy"],
          blindSpot: "Commercial saturation split underground scenes from the version the general public heard."
        },
        {
          num: "Waves 4 and 5, contested",
          era: "2009 to now",
          name: "The revival and bedroom genre mixing",
          spark: "Wave 4 around 2009 to 2017 revived Midwest math indie. The disputed fifth wave added chiptune, noise, shoegaze, and queer DIY collectives.",
          shift: "Turned American Football's 1999 album into a foundational text, then broke the template open with bedroom recording.",
          exemplars: ["Algernon Cadwallader", "Modern Baseball", "The Hotelier", "Glass Beach"],
          blindSpot: "Insiders themselves joke that fifth wave lumps lo fi, screamo, and indie pop into one word.",
          contested: true
        }
      ],
      critique:
        "Screamo, or skramz, ran continuously alongside these waves, from 1990s San Diego to international post hardcore. It folds badly into a Midwest to MTV arc, which suggests the wave count is chasing the audience, not the music.",
      sourceIds: ["emo-history", "emo-genre-wiki"]
    },
    {
      id: "feminism",
      title: "Feminist movements",
      subtitle: "The 1968 origin of the modern wave metaphor, and its sharpest critics",
      category: "Politics & society",
      archetype: "surge-undertow",
      labelStatus: "Prototype for the metaphor, named 1968 and 1992",
      coinedBy: "Martha Weinman Lear (1968) and Rebecca Walker (1992)",
      originHook:
        "Most third wave labels trace back here. Lear popularized the second feminist wave in 1968 to argue that 1960s activists belonged to a long lineage rather than a fad. Walker named the third wave in 1992.",
      relitDynamic:
        "Each wave widened what equality required: legal personhood and the ballot, then structural inequality at work and at home, then intersectionality and networked accountability.",
      axes: {
        unit: ["Constitutional and legal citizenship", "Institutions and the personal is political", "Intersecting identities and culture", "Networked global mobilization"],
        goal: ["Suffrage and property rights", "Workplace, reproductive, and domestic liberation", "Pluralism and intersectionality", "Accountability against systemic violence"]
      },
      waves: [
        {
          num: "Wave 1, named later",
          era: "Mid 1800s to 1920s",
          name: "Suffrage and legal personhood",
          spark: "Abolitionist and women's rights organizing from Seneca Falls in 1848 onward.",
          shift: "Challenged coverture, won married women's property rights, opened higher education, and won constitutional voting rights.",
          exemplars: ["19th Amendment (1920)", "Suffragettes in the UK", "Married Women's Property Acts", "Ida B. Wells"],
          blindSpot: "White suffrage leadership sidelined Black, Indigenous, and working class women, and Jim Crow kept the ballot out of reach."
        },
        {
          num: "Wave 2",
          era: "Early 1960s to 1980s",
          name: "Women's liberation",
          spark: "Civil rights organizing, consciousness raising groups, equal pay fights, and Lear's 1968 framing.",
          shift: "Argued the personal is political and targeted workplace discrimination, credit access, reproductive rights, and family law.",
          exemplars: ["Title IX", "Equal Credit Opportunity Act", "Combahee River Collective (1977)", "NOW"],
          blindSpot: "Mainstream coverage centered white middle class experience, which drew sustained critique from Black, Chicana, Asian American, and lesbian organizers."
        },
        {
          num: "Wave 3",
          era: "Early 1990s to late 2000s",
          name: "Intersectionality and DIY",
          spark: "Crenshaw's intersectionality paper (1989), Anita Hill's 1991 testimony, Walker's 1992 essay, and Riot Grrrl zines.",
          shift: "Foregrounded how race, class, gender, and sexuality interlock, questioned rigid binaries, and reclaimed pop culture.",
          exemplars: ["Kimberlé Crenshaw", "Rebecca Walker", "Riot Grrrl zines", "Postcolonial and trans inclusive theory"],
          blindSpot: "Critics asked whether individual choice feminism diluted the collective and institutional work of wave 2."
        },
        {
          num: "Wave 4, contested",
          era: "2012 to now",
          name: "Networked accountability",
          spark: "Tarana Burke's Me Too organizing meeting global viral testimony, from #MeToo to #NiUnaMenos.",
          shift: "Uses networks for fast cross border testimony against sexual violence, reproductive rollbacks, and algorithmic bias.",
          exemplars: ["#NiUnaMenos (2015)", "#MeToo", "Reproductive justice coalitions"],
          blindSpot: "Outrage cycles on platforms can burn out organizers when they are not tied to durable legal and labor institutions.",
          contested: true
        }
      ],
      critique:
        "Nancy Hewitt's 2010 collection argues that ocean waves produce historical amnesia about labor and Black feminist organizing in the 1930s to 1950s. She proposes radio waves instead: simultaneous broadcasts at different frequencies.",
      sourceIds: ["lear-1968", "walker-1992", "crenshaw-1989", "hewitt-2010"]
    },
    {
      id: "cbt",
      title: "Cognitive and behavioral therapy",
      subtitle: "Behavior, then thoughts, then your relationship to thoughts",
      category: "Language & mind",
      archetype: "structure-context",
      labelStatus: "Clinical framing, proposed 2004 and now debated",
      coinedBy: "Steven C. Hayes (Behavior Therapy, 2004)",
      originHook:
        "Hayes grouped the mindfulness and acceptance based therapies as CBT's third wave. The label stuck and immediately caused a fight about whether therapies evolve in waves or by continuous extension.",
      relitDynamic:
        "Relit the clinical target three times: overt conditioned habits, then distorted beliefs, then the rigidity with which someone fights their own experience.",
      axes: {
        unit: ["Observable stimulus and response", "Beliefs and appraisals", "Context, acceptance, flexibility"],
        goal: ["Extinguish conditioned avoidance", "Restructure distorted thoughts", "Live by chosen values alongside difficult feelings"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1950s to 1960s",
          name: "Behavior therapy",
          spark: "Wolpe, Skinner, and Eysenck applying Pavlovian and operant learning directly to clinical phobias.",
          shift: "Broke from unverified speculation by measuring observable behavior and using systematic exposure.",
          exemplars: ["Exposure therapy", "Systematic desensitization", "Contingency management"],
          blindSpot: "Struggled to explain language, rumination, and the meaning people make of events."
        },
        {
          num: "Wave 2",
          era: "1970s to 1980s",
          name: "Cognitive therapy",
          spark: "Aaron Beck and Albert Ellis bringing the cognitive revolution into the consulting room.",
          shift: "Targeted automatic thoughts, core schemas, and distortions with thought records and behavioral experiments.",
          exemplars: ["Beck's cognitive therapy", "Ellis's REBT", "Thought records", "Behavioral experiments"],
          blindSpot: "For some patients, arguing with a thought fed the self scrutiny it was meant to reduce."
        },
        {
          num: "Wave 3",
          era: "1990s to now",
          name: "Context, acceptance, mindfulness",
          spark: "Linehan's DBT (1993), Hayes's ACT (1999), and Segal, Williams and Teasdale's MBCT (2002).",
          shift: "Works on the function and context of thoughts rather than their literal truth, using defusion, mindfulness, and values.",
          exemplars: ["ACT", "DBT", "MBCT", "Cognitive defusion"],
          blindSpot: "Beck and Hofmann argued the wave framing overstated the break, and the field has since moved toward process based therapy."
        }
      ],
      critique:
        "Unlike an ocean wave, wave 1 exposure and wave 2 restructuring remain first line treatments. The three waves are additions to a toolkit, not replacements, which is why Hayes and Hofmann later proposed process based therapy instead.",
      sourceIds: ["hayes-2004", "hayes-hofmann-2021"]
    },
    {
      id: "hci",
      title: "Human computer interaction",
      subtitle: "From cockpit ergonomics to groupware to phones in everyday life",
      category: "Science & tech",
      archetype: "structure-context",
      labelStatus: "Canonical academic framework, named 2006",
      coinedBy: "Susanne Bødker (NordiCHI keynote, 2006; ACM Interactions, 2015)",
      originHook:
        "Bødker noticed that HCI methods built for 1980s office work broke once computing moved into bedrooms, museums, pockets, and streets. She called the shift third wave HCI in a 2006 keynote.",
      relitDynamic:
        "Relit the user: a measurable operator coupled to one machine, then a skilled collaborator at work, then a person living across many devices with feelings and culture.",
      axes: {
        unit: ["One person and one terminal", "Workgroup and workflow", "Everyday life and ubiquitous ecologies"],
        goal: ["Minimize error and load", "Support situated cooperation", "Design for meaning, emotion, and participation"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1970s to 1980s",
          name: "Human factors and cognitive engineering",
          spark: "Aviation ergonomics and cognitive psychology applied to early desktop and command line systems.",
          shift: "Measured keystrokes, Fitts's law, memory load, and error rates in controlled lab tests.",
          exemplars: ["Card, Moran and Newell, GOMS (1983)", "Usability labs", "Cockpit and terminal ergonomics"],
          blindSpot: "Isolated single users in artificial tasks and missed interruptions, politics, and social context."
        },
        {
          num: "Wave 2",
          era: "Late 1980s to 1990s",
          name: "Situated action and cooperative work",
          spark: "Suchman's Plans and Situated Actions (1987), Scandinavian participatory design, and networked office groupware.",
          shift: "Moved from man machine fit to groups working through interfaces, using ethnography and activity theory.",
          exemplars: ["CSCW and groupware", "Participatory design (UTOPIA)", "Contextual inquiry"],
          blindSpot: "Assumed clear workplace boundaries, shared goals, and productivity as the only yardstick."
        },
        {
          num: "Wave 3",
          era: "2000s to now",
          name: "Cultural and everyday computing",
          spark: "Mobile, ubiquitous, domestic, and playful technology blurring work and leisure.",
          shift: "Takes emotion, aesthetics, cultural politics, and domestic life seriously, including contexts where efficiency is not the point.",
          exemplars: ["Speculative and critical design", "Affective and domestic computing", "Civic and community tech"],
          blindSpot: "Bødker warned in 2015 that consumer app individualism risked losing the collective craft of wave 2."
        }
      ],
      critique:
        "Researchers now argue about a fourth wave of entanglement and semi autonomous systems, which makes wave 1 error control and wave 2 questions about power urgent again rather than obsolete.",
      sourceIds: ["bodker-2006", "bodker-2015"]
    },
    {
      id: "ai",
      title: "Artificial intelligence",
      subtitle: "Handcrafted rules, then statistical learning, then context",
      category: "Science & tech",
      archetype: "structure-context",
      labelStatus: "Institutional framework, published 2016 to 2017",
      coinedBy: "John Launchbury, DARPA Information Innovation Office (2016 to 2017)",
      originHook:
        "Five years into the deep learning boom, Launchbury sorted AI history into three waves by four capabilities: perceiving, learning, abstracting, and reasoning. It is a funding and research framing, not a consensus history.",
      relitDynamic:
        "Makes a tradeoff visible. Wave 2 networks beat wave 1 systems at perception and learning while giving up wave 1's step by step auditability.",
      axes: {
        unit: ["Human written rules", "High dimensional weights", "Explanatory and neuro symbolic models"],
        goal: ["Deduction in bounded domains", "Pattern learning at scale", "Contextual adaptation and verifiable reasoning"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "1950s to 1980s",
          name: "Handcrafted knowledge",
          spark: "The 1956 Dartmouth workshop, logic theorem provers, expert systems such as MYCIN, and constraint schedulers.",
          shift: "Experts encoded if then rules and ontologies, which worked well on tight logical domains.",
          exemplars: ["MYCIN", "Prolog and expert systems", "Logistics schedulers", "SAT and verification solvers"],
          blindSpot: "Brittle on noisy perception and unable to learn new abstractions from raw experience."
        },
        {
          num: "Wave 2",
          era: "1990s to 2020s",
          name: "Statistical learning",
          spark: "Backpropagation, probabilistic machine learning, GPUs, ImageNet (2012), and large scale pretraining.",
          shift: "Engineers design architectures and optimize over data, which produced fluent perception and generation for the first time.",
          exemplars: ["Convolutional and vision transformers", "Speech recognition", "Large language models"],
          blindSpot: "Data hungry, brittle out of distribution, and opaque when auditability matters."
        },
        {
          num: "Wave 3, emerging",
          era: "2020s onward",
          name: "Contextual adaptation",
          spark: "Neuro symbolic integration, verifier checked reasoning, and causal world models.",
          shift: "Aims to pair wave 1 structure with wave 2 learning so systems build inspectable models from fewer examples.",
          exemplars: ["Neuro symbolic solvers", "Verifier checked agents", "Adaptive causal models"],
          blindSpot: "A research direction rather than a finished era, and wave 1 and wave 2 systems already run side by side in every stack.",
          contested: true
        }
      ],
      critique:
        "Launchbury's own point is that wave 1 never died. SAT solvers, compilers, and flight control rules run in production next to wave 2 models, which makes waves look like geology rather than replacement.",
      sourceIds: ["darpa-ai", "launchbury-talk"]
    },
    {
      id: "democracy",
      title: "Waves of democratization",
      subtitle: "Global surges of self government, and the reverse waves that follow",
      category: "Politics & society",
      archetype: "surge-undertow",
      labelStatus: "Canonical political science thesis, 1991",
      coinedBy: "Samuel P. Huntington, The Third Wave (1991)",
      originHook:
        "Huntington added the undertow. He counted periods when transitions away from democracy outnumbered transitions toward it, which turned the wave metaphor into something that can recede.",
      relitDynamic:
        "Each expansion widened who counted as a democrat, and each reverse wave showed that the tide is not an escalator.",
      axes: {
        unit: ["Male franchise and parliaments", "Postwar and postcolonial constitutions", "Post junta and post Soviet transitions", "Institutional resilience and erosion"],
        goal: ["Break absolutist monarchy", "Rebuild after fascism and empire", "Replace juntas and one party rule", "Defend courts, press, and pluralism"]
      },
      waves: [
        {
          num: "Wave 1, with reverse",
          era: "1828 to 1926, ebbing 1922 to 1942",
          name: "Parliamentary expansion",
          spark: "Widening suffrage rules and the postwar breakup of continental empires, peaking near 29 democracies.",
          shift: "Established contested elections and executive accountability before fascism cut the count to about 12 by 1942.",
          exemplars: ["19th century reform acts", "New Zealand suffrage (1893)", "The 1922 to 1942 reverse wave"],
          blindSpot: "Most first wave democracies excluded women, colonized peoples, and racial minorities, which some scholars say disqualifies the count."
        },
        {
          num: "Wave 2, with reverse",
          era: "1945 to 1962, ebbing 1960 to 1974",
          name: "Postwar and decolonization",
          spark: "The defeat of the Axis and early independence constitutions across Asia and Africa.",
          shift: "Rebuilt democracy in West Germany, Italy, and Japan and created new postcolonial republics before Cold War coups.",
          exemplars: ["Postwar Japan and West Germany", "Indian Constitution (1950)", "1960s and 70s coups"],
          blindSpot: "Superpower intervention and military coups toppled fragile legislatures across Latin America, Greece, and Africa."
        },
        {
          num: "Wave 3",
          era: "1974 to 1990s",
          name: "Southern Europe, Latin America, and 1989",
          spark: "Portugal's Carnation Revolution in April 1974, then Spain, Greece, Latin America, South Korea, Taiwan, and Eastern Europe in 1989.",
          shift: "More than 60 countries left military juntas and one party rule within two decades.",
          exemplars: ["Carnation Revolution (1974)", "South Korea and Taiwan", "1989 in Central Europe", "South Africa (1994)"],
          blindSpot: "Elections without independent courts or stable economies left several transitions open to elite capture."
        },
        {
          num: "Reverse wave, contested",
          era: "2010s to now",
          name: "Backsliding from inside",
          spark: "V Dem research by Lührmann and Lindberg (2019) tracking autocratization by elected executives rather than tanks.",
          shift: "Describes erosion: weakened courts, captured media, and rewritten election rules, step by step.",
          exemplars: ["Executive aggrandizement", "Media capture", "Civic counter mobilization"],
          blindSpot: "Scholars disagree whether this is a sharp reverse wave or polarized resilience with local renewals.",
          contested: true
        }
      ],
      critique:
        "Pamela Paxton showed in 2000 that if you require universal female suffrage to count a country as democratic, Huntington's first wave moves forward by decades. The wave count depends entirely on who gets to be counted.",
      sourceIds: ["huntington-1991", "luhrmann-2019", "paxton-2000"]
    },
    {
      id: "environmentalism",
      title: "US environmentalism",
      subtitle: "Wilderness, then pollution law, then markets and justice",
      category: "Politics & society",
      archetype: "surge-undertow",
      labelStatus: "Policy framing, coined 1986",
      coinedBy: "Fred Krupp (Wall Street Journal, 1986), later periodized by Mark Dowie (1995)",
      originHook:
        "Krupp announced third wave environmentalism in a 1986 op ed to sell market incentives like emissions trading. The framing started a fight that has not ended, between boardroom strategy and grassroots justice.",
      relitDynamic:
        "Relit the lever of change: fencing off scenic land, then federal pollution bans and citizen suits, then carbon pricing, then a justice movement that says the first three left fenceline communities out.",
      axes: {
        unit: ["Wilderness and game reserves", "Chemicals, air, and watersheds", "Emissions markets and supply chains", "Frontline communities and industrial policy"],
        goal: ["Conserve forests and parks", "Legislate and litigate pollution", "Price externalities", "Decarbonize equitably and cut local harm"]
      },
      waves: [
        {
          num: "Wave 1",
          era: "Late 1800s to 1940s",
          name: "Conservation and preservation",
          spark: "Muir, Pinchot, and Roosevelt arguing over wise use forestry versus untrammeled parks.",
          shift: "Created national parks, forests, and refuges to stop frontier logging and species slaughter.",
          exemplars: ["National Park Service (1916)", "Sierra Club", "Wilderness Society", "Migratory Bird Treaty"],
          blindSpot: "Ignored urban industrial pollution and displaced Indigenous nations to manufacture empty wilderness."
        },
        {
          num: "Wave 2",
          era: "1962 to late 1970s",
          name: "Regulation and litigation",
          spark: "Rachel Carson's Silent Spring (1962), the burning Cuyahoga (1969), and the first Earth Day in 1970.",
          shift: "Built the regulatory state: pollution standards, DDT bans, impact statements, and citizen suits.",
          exemplars: ["Clean Air Act (1970)", "Clean Water Act (1972)", "Endangered Species Act (1973)", "EPA founded"],
          blindSpot: "Command and control rules hit gridlock in the 1980s, and hazardous sites clustered near Black, Brown, and poor communities."
        },
        {
          num: "Wave 3",
          era: "Mid 1980s to 2000s",
          name: "Markets and boardroom deals",
          spark: "Krupp's 1986 op ed and the sulfur dioxide trading program in the 1990 Clean Air Act Amendments.",
          shift: "Used cap and trade, corporate partnerships, and eco labels to cut acid rain at lower cost.",
          exemplars: ["1990 acid rain trading", "Corporate supply chain pledges", "Eco certifications"],
          blindSpot: "Dowie and environmental justice organizers called boardroom dealmaking insular and slow against fossil expansion."
        },
        {
          num: "Wave 4",
          era: "1991 and 2010s to now",
          name: "Environmental justice and industrial policy",
          spark: "The 1991 First National People of Color Environmental Leadership Summit, youth climate strikes, and clean energy industrial policy.",
          shift: "Pairs fast clean energy deployment with frontline health, consent, and Indigenous land stewardship.",
          exemplars: ["17 Principles of Environmental Justice (1991)", "Clean energy industrial policy", "Indigenous cultural burning"],
          blindSpot: "Permitting bottlenecks and supply chain mining create fresh local versus planetary tradeoffs.",
          contested: true,
          contested: true
        }
      ],
      critique:
        "Environmental justice did not wait for a fourth wave. Fenceline communities in Warren County, North Carolina organized in 1982 and earlier labor health movements ran through waves 2 and 3 while mainstream histories left them out.",
      sourceIds: ["dowie-1995", "krupp-1986", "ej-1991"]
    }
  ],

  timelineMarkers: [
    { year: 1968, domain: "Feminism", label: "Martha Weinman Lear publishes The Second Feminist Wave in The New York Times Magazine.", sourceId: "lear-1968" },
    { year: 1979, domain: "Ska", label: "2 Tone Records is founded in Coventry, driving the British second wave of ska.", sourceId: "ska-wiki" },
    { year: 1991, domain: "Democracy", label: "Samuel P. Huntington publishes The Third Wave on democratization and reverse waves.", sourceId: "huntington-1991" },
    { year: 1992, domain: "Feminism", label: "Rebecca Walker publishes Becoming the Third Wave after the Anita Hill hearings.", sourceId: "walker-1992" },
    { year: 1999, domain: "Coffee", label: "Timothy J. Castle uses coffee's third wave in Tea and Coffee Trade Journal Asia.", sourceId: "coffee-castle" },
    { year: 2002, domain: "Coffee", label: "Trish Rothgeb defines third wave coffee in The Flamekeeper, citing third wave feminism.", sourceId: "coffee-rothgeb" },
    { year: 2004, domain: "Psychology", label: "Steven C. Hayes names mindfulness and acceptance approaches the third wave of CBT.", sourceId: "hayes-2004" },
    { year: 2006, domain: "HCI", label: "Susanne Bødker frames third wave HCI as computing moves into everyday life.", sourceId: "bodker-2006" },
    { year: 2010, domain: "Wave critique", label: "Nancy A. Hewitt publishes No Permanent Waves and proposes radio waves instead of ocean waves.", sourceId: "hewitt-2010" },
    { year: 2012, domain: "Sociolinguistics", label: "Penelope Eckert formalizes the three waves of variation study in Annual Review of Anthropology.", sourceId: "eckert-2012" },
    { year: 2017, domain: "AI", label: "DARPA's John Launchbury outlines three waves of AI: handcrafted, statistical, contextual.", sourceId: "darpa-ai" }
  ],

  everydayScenes: [
    {
      id: "cup",
      domainId: "coffee",
      title: "Ordering a morning cup",
      domain: "Coffee culture",
      waves: [
        {
          wave: "Wave 1",
          headline: "Bottomless diner mug for a dollar",
          detail: "Scooped from a red vacuum tin roasted months ago. Nobody asks which country it came from, because the promise is hot, fast, identical caffeine.",
          metrics: { provenance: 10, standardization: 95, craftTransparency: 12 }
        },
        {
          wave: "Wave 2",
          headline: "Dark roast vanilla latte in an armchair",
          detail: "Pulled on an espresso bar with comfy chairs. The bag says Sumatra, and it is roasted dark enough to taste bold through milk whether you are in Seattle or London.",
          metrics: { provenance: 45, standardization: 82, craftTransparency: 48 }
        },
        {
          wave: "Wave 3",
          headline: "Pink Bourbon pour over with a roast date",
          detail: "Finca El Puente, Huila, Colombia. Washed Pink Bourbon at 1,850 meters, roasted six days ago, 15 grams in to 250 out, so the jasmine and blood orange survive.",
          metrics: { provenance: 96, standardization: 35, craftTransparency: 94 }
        }
      ]
    },
    {
      id: "speech",
      domainId: "sociolinguistics",
      title: "Pronouncing the /t/ in right",
      domain: "Variationist sociolinguistics",
      waves: [
        {
          wave: "Wave 1",
          headline: "Census and formality readout",
          detail: "An analyst logs a released /t/ as a careful variant that correlates with class and with how much attention the speaker is paying to their own voice.",
          metrics: { provenance: 25, standardization: 88, craftTransparency: 40 }
        },
        {
          wave: "Wave 2",
          headline: "Local clique identity",
          detail: "An ethnographer spends a year in one school and finds the nerds and the burnouts using crisp /t/ to mark a boundary against the group across the hall.",
          metrics: { provenance: 68, standardization: 52, craftTransparency: 72 }
        },
        {
          wave: "Wave 3",
          headline: "Persona and indexical field",
          detail: "The same crisp /t/ pulls from a whole field of meanings, articulate or exasperated or English inflected or playfully nerdy, depending on how the speaker styles the moment.",
          metrics: { provenance: 94, standardization: 20, craftTransparency: 95 }
        }
      ]
    },
    {
      id: "thought",
      domainId: "cbt",
      title: "Walking into a talk you are scared of",
      domain: "Cognitive and behavioral therapy",
      waves: [
        {
          wave: "Wave 1",
          headline: "Graduated exposure",
          detail: "Rank the feared speaking situations from one to ten and step onto small stages without escaping until the panic response habituates.",
          metrics: { provenance: 35, standardization: 85, craftTransparency: 60 }
        },
        {
          wave: "Wave 2",
          headline: "Thought record",
          detail: "Catch the fortune telling on paper, weigh the evidence from talks that already happened, and write a balanced replacement belief.",
          metrics: { provenance: 65, standardization: 75, craftTransparency: 78 }
        },
        {
          wave: "Wave 3",
          headline: "Defusion and values",
          detail: "Notice that your mind is playing the bombing the talk story again without arguing with it, then speak with the nerves still in the room.",
          metrics: { provenance: 92, standardization: 38, craftTransparency: 92 }
        }
      ]
    },
    {
      id: "interface",
      domainId: "hci",
      title: "Designing a digital tool",
      domain: "Human computer interaction",
      waves: [
        {
          wave: "Wave 1",
          headline: "Cut operator keystrokes by 18 percent",
          detail: "Bring single users into a lab, time target clicks against Fitts's law, and remove menu errors from a workstation.",
          metrics: { provenance: 30, standardization: 92, craftTransparency: 50 }
        },
        {
          wave: "Wave 2",
          headline: "Co design a hospital shift handoff",
          detail: "Shadow nurses and clerks on the ward and build the shared board around real interruptions, tacit knowledge, and team accountability.",
          metrics: { provenance: 72, standardization: 58, craftTransparency: 80 }
        },
        {
          wave: "Wave 3",
          headline: "A family photo archive across decades",
          detail: "Task completion time is the wrong measure. Design for nostalgia, grief, privacy boundaries, and memory that outlives the app.",
          metrics: { provenance: 94, standardization: 24, craftTransparency: 93 }
        }
      ]
    }
  ],

  customWavePresets: [
    {
      name: "Craft beer",
      w1: "Post Prohibition adjunct macro lagers, shelf stable and uniformly fizzy",
      w2: "1970s and 80s microbrew pioneers and brewpubs, Anchor and Sierra Nevada",
      w3: "Hyper local taprooms, single hop hazy IPAs, spontaneous wild and farmhouse fermentations",
      mechanism: "commodity-craft"
    },
    {
      name: "Wine",
      w1: "Bulk jug table wine and anonymous regional blends",
      w2: "Varietal labels, 100 point scores, and oaked international prestige",
      w3: "Low intervention wine: native yeasts, skin contact, tiny grower transparency",
      mechanism: "commodity-craft"
    },
    {
      name: "Web and computing",
      w1: "Static read only pages, directories, and dial up portals",
      w2: "Centralized social feeds, mobile cloud platforms, and algorithmic scale",
      w3: "Local first software, open protocols, user owned graphs, malleable tools",
      mechanism: "structure-context"
    },
    {
      name: "Ramen outside Japan",
      w1: "1970s freeze dried instant noodle bricks in dorm kitchens",
      w2: "2000s urban tonkotsu boom and queues outside ramen shops",
      w3: "Regional tare craft, heritage wheat house noodles, hyper specific broths",
      mechanism: "commodity-craft"
    }
  ],

  quizScenarios: [
    {
      id: "q1",
      domainId: "chocolate",
      prompt:
        "A chocolate maker buys fermented cacao directly from one cooperative in Piura, Peru, roasts it lightly in small batches, and uses only cacao and cane sugar so the raspberry acidity comes through.",
      question: "Which wave pattern is this, and why?",
      choices: [
        {
          label: "Wave 1, democratizing a shelf stable household commodity",
          correct: false,
          feedback: "Wave 1 chocolate, like early mass market milk bars, optimized for cost, uniformity, and shelf life. Sugar and vanillin hid the bean."
        },
        {
          label: "Wave 2, branded dark percentage luxury couverture",
          correct: false,
          feedback: "Close, because quality rose in wave 2. But second wave boutiques mostly melted couverture blended by country or percentage rather than roasting a single farm's beans."
        },
        {
          label: "Wave 3, farm level terroir with minimal masking",
          correct: true,
          feedback: "Right. Like third wave coffee, bean to bar chocolate strips out heavy roast and vanilla so farm genetics and fermentation can be tasted."
        }
      ]
    },
    {
      id: "q2",
      domainId: "sociolinguistics",
      prompt:
        "A linguist hears a teenager use crisp, released /t/ endings to land a dry joke, then drop them seconds later when speaking warmly to the same friend.",
      question: "Which wave of sociolinguistics was built to explain that switch?",
      choices: [
        {
          label: "Wave 1, macro census correlation",
          correct: false,
          feedback: "A first wave survey aggregates across whole interviews by class and formality, so a stance shift inside one conversation mostly looks like a shift in attention paid to speech."
        },
        {
          label: "Wave 3, stylistic agency and the indexical field",
          correct: true,
          feedback: "Correct. Eckert's third wave treats features as semiotic resources with an indexical field of possible meanings that speakers deploy to build stance in real time."
        },
        {
          label: "Wave 2, static neighborhood loyalty",
          correct: false,
          feedback: "Second wave ethnography maps who hangs out with whom. It does not explain one speaker remixing features within a single conversation."
        }
      ]
    },
    {
      id: "q3",
      domainId: "emo",
      prompt:
        "Around 2011, DIY bands in Philadelphia and the Midwest skipped the glossy 2006 arena version of emo to revive the intricate 1997 sound of Cap'n Jazz and American Football.",
      question: "What does that tell you about how cultural waves move?",
      choices: [
        {
          label: "Waves always progress in one direction, from worse to better",
          correct: false,
          feedback: "Cultural waves are not software releases. Later waves frequently rebel against the commercialized one by reaching backward."
        },
        {
          label: "A leapfrog revival: wave 4 rebels against wave 3 by relighting wave 2",
          correct: true,
          feedback: "Yes. When wave 3 grew slick and commercial, underground scenes relit wave 2's DIY ethic and math rock guitars instead of building on wave 3."
        },
        {
          label: "Earlier waves disappear once a new wave arrives",
          correct: false,
          feedback: "In music, coffee, and therapy, earlier waves keep running alongside the new one. That is the whole point of persistence."
        }
      ]
    },
    {
      id: "q4",
      domainId: "feminism",
      prompt:
        "Historian Nancy A. Hewitt proposed replacing ocean waves with radio waves when teaching the history of US feminism.",
      question: "Which blind spot of the ocean metaphor does the radio model fix?",
      choices: [
        {
          label: "Ocean waves imply empty troughs between peaks and flatten simultaneous voices into one",
          correct: true,
          feedback: "Right. Ocean waves hide continuous labor and Black, Indigenous, and local organizing between famous peaks. Radio frequencies show several movements broadcasting at once, sometimes in harmony and sometimes in static."
        },
        {
          label: "Ocean waves move too fast to measure in decades",
          correct: false,
          feedback: "Speed is not the problem. The problem is assuming one unified crest at a time and nothing in between."
        },
        {
          label: "Radio waves prove there was never any generational change",
          correct: false,
          feedback: "Hewitt keeps generational shifts. She just shows that several frequencies broadcast concurrently across the same decades."
        }
      ]
    },
    {
      id: "q5",
      domainId: "ai",
      prompt:
        "In DARPA's three waves of AI, a tax engine uses explicit statutory rules while a vision model uses billions of learned weights to spot road hazards.",
      question: "How does that framework see the two systems today?",
      choices: [
        {
          label: "Wave 2 obsoleted wave 1, so rule engines are no longer AI",
          correct: false,
          feedback: "Wave 2 wins on noisy perception, but symbolic solvers still beat it when exact statutory or mathematical guarantees are required."
        },
        {
          label: "Waves coexist as layers, and wave 3 aims to combine structure with learning",
          correct: true,
          feedback: "Correct. Launchbury's point is that wave 1 never died. Neuro symbolic work tries to fuse learned representations with verifiable reasoning."
        },
        {
          label: "Wave 1 systems learn from unlabeled video better than wave 2",
          correct: false,
          feedback: "Raw perception from messy sensory data is exactly where handcrafted rules failed and statistical learning broke through."
        }
      ]
    }
  ],

  glossary: [
    {
      term: "Relit wave",
      def: "A domain that gets reworked by a new cohort in reaction to what the previous era standardized or left out, and then numbers itself to claim the lineage."
    },
    {
      term: "Retroactive first wave",
      def: "Nobody calls it first wave feminism or first wave coffee while it is happening. The first wave only gets its number once a later wave names itself."
    },
    {
      term: "Third place",
      def: "Ray Oldenburg's term (1989) for social space that is neither home nor work, which is how second wave coffee sold the café."
    },
    {
      term: "Terroir",
      def: "Borrowed from winemaking: how soil, microclimate, altitude, variety, and processing leave a recognizable fingerprint in coffee, cacao, tea, or wine."
    },
    {
      term: "Indexical field",
      def: "Eckert's term (2008) for the constellation of meanings a linguistic feature can carry, such as precise, formal, annoyed, or nerdy, activated by context."
    },
    {
      term: "Psychological flexibility",
      def: "A core aim of third wave CBT, especially ACT: stay in contact with the present moment, including discomfort, while choosing actions that match your values."
    },
    {
      term: "Reverse wave",
      def: "Huntington's term (1991) for a period when transitions away from democracy outnumber transitions toward it."
    },
    {
      term: "Leapfrog revival",
      def: "When a new underground wave skips the immediately preceding commercial wave to revive an earlier, rawer one. Fourth wave emo is the standard example."
    },
    {
      term: "Radio wave metaphor",
      def: "Hewitt's alternative to ocean waves (2010): movements broadcast concurrently on different frequencies. Some are loud in the archive, others are jammed, none vanish in a trough."
    },
    {
      term: "Situated action",
      def: "A cornerstone of second wave HCI (Suchman, 1987): action is improvised in the moment within material and social circumstances, not just executing a stored plan."
    },
    {
      term: "Couverture",
      def: "Pre made chocolate that a chocolatier melts and tempers for bonbons. Typical of wave 2. Bean to bar makers roast and grind raw cacao themselves."
    },
    {
      term: "2 Tone",
      def: "The late 1970s British second wave of ska, centered on Coventry's 2 Tone Records, which paired Jamaican rhythms with punk speed and anti racist politics."
    }
  ],

  sources: [
    {
      id: "coffee-wiki",
      domain: "Coffee",
      cite: "Wikipedia, Third wave of coffee, summarizing the competing 1999 and 2002 coinage accounts.",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee",
      note: "Dates the Castle trade journal reference to 1999 and the Rothgeb Flamekeeper essay to 2002 or 2003."
    },
    {
      id: "coffee-castle",
      domain: "Coffee",
      cite: "Timothy J. Castle, Coffee's Third Wave, Tea and Coffee Trade Journal Asia (December 1999).",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee#History",
      note: "The earliest documented use of third wave for coffee, three years before Rothgeb's essay."
    },
    {
      id: "coffee-rothgeb",
      domain: "Coffee",
      cite: "Trish Rothgeb, Norway and Coffee, The Flamekeeper, Roasters Guild newsletter (2002).",
      url: "https://en.wikipedia.org/wiki/Third-wave_coffee#History",
      note: "The essay that defined the three waves and borrowed the frame from feminism."
    },
    {
      id: "eckert-2012",
      domain: "Sociolinguistics",
      cite: "Penelope Eckert, Three Waves of Variation Study, Annual Review of Anthropology 41 (2012).",
      url: "https://doi.org/10.1146/annurev-anthro-092611-145828",
      note: "Defines the survey, ethnographic, and stylistic waves."
    },
    {
      id: "eckert-2018",
      domain: "Sociolinguistics",
      cite: "Penelope Eckert, Meaning and Linguistic Variation: The Third Wave in Sociolinguistics (Cambridge University Press, 2018).",
      url: "https://doi.org/10.1017/9781316403242",
      note: "Collects the Detroit ethnography and indexical field papers."
    },
    {
      id: "lear-1968",
      domain: "Feminism",
      cite: "Martha Weinman Lear, The Second Feminist Wave, The New York Times Magazine (March 10, 1968).",
      url: "https://www.womenshistory.org/exhibits/feminism-first-wave-0",
      note: "The origin of the modern wave metaphor for social movements."
    },
    {
      id: "walker-1992",
      domain: "Feminism",
      cite: "Rebecca Walker, Becoming the Third Wave, Ms. (January 1992).",
      url: "https://www.britannica.com/topic/third-wave-of-feminism",
      note: "Names the third wave after the Anita Hill hearings."
    },
    {
      id: "crenshaw-1989",
      domain: "Feminism",
      cite: "Kimberlé Crenshaw, Demarginalizing the Intersection of Race and Sex, University of Chicago Legal Forum (1989).",
      url: "https://chicagounbound.uchicago.edu/uclf/vol1989/iss1/8/",
      note: "Full text of the paper that introduced intersectionality."
    },
    {
      id: "hewitt-2010",
      domain: "Wave critique",
      cite: "Nancy A. Hewitt (ed.), No Permanent Waves: Recasting Histories of U.S. Feminism (Rutgers University Press, 2010).",
      url: "https://www.rutgersuniversitypress.org/no-permanent-waves/9780813547251",
      note: "The collection that proposes radio waves in place of ocean waves."
    },
    {
      id: "ska-wiki",
      domain: "Ska",
      cite: "Wikipedia, Ska, and David V. Moskowitz, Caribbean Popular Music (2006).",
      url: "https://en.wikipedia.org/wiki/Ska",
      note: "Covers the Jamaican origin, 2 Tone (1979), and third wave ska punk."
    },
    {
      id: "ska-fourth",
      domain: "Ska",
      cite: "Jessica Lipsky, Ska Lives: On the Genre's Fourth Wave.",
      url: "https://www.jlipsky.com/ska-fourth-wave",
      note: "Reporting on post 2010 Latin and DIY ska scenes."
    },
    {
      id: "emo-history",
      domain: "Emo",
      cite: "Wikipedia, Emo, and Andy Greenwald, Nothing Feels Good: Punk Rock, Teenagers, and Emo (2003).",
      url: "https://en.wikipedia.org/wiki/Emo",
      note: "Tracks the DC origins, Midwest era, mainstream peak, and revival."
    },
    {
      id: "emo-genre-wiki",
      domain: "Emo",
      cite: "Wikipedia, Emo revival.",
      url: "https://en.wikipedia.org/wiki/Emo_revival",
      note: "Documents the late 2000s and 2010s return to 1990s Midwest emo."
    },
    {
      id: "hayes-2004",
      domain: "Psychology",
      cite: "Steven C. Hayes, Acceptance and Commitment Therapy, Relational Frame Theory, and the Third Wave of Behavioral and Cognitive Therapies, Behavior Therapy 35(4), 2004.",
      url: "https://doi.org/10.1016/S0005-7894(04)80040-6",
      note: "The paper that named the third wave of CBT."
    },
    {
      id: "hayes-hofmann-2021",
      domain: "Psychology",
      cite: "Steven C. Hayes and Stefan G. Hofmann, Third wave cognitive and behavioral therapies and process based therapy, World Psychiatry 20(3), 2021.",
      url: "https://doi.org/10.1002/wps.20884",
      note: "Reconciles the wave debate into process based therapy."
    },
    {
      id: "bodker-2006",
      domain: "HCI",
      cite: "Susanne Bødker, When Second Wave HCI Meets Third Wave Challenges, NordiCHI 2006.",
      url: "https://doi.org/10.1145/1182475.1182476",
      note: "The keynote that named third wave HCI."
    },
    {
      id: "bodker-2015",
      domain: "HCI",
      cite: "Susanne Bødker, Third wave HCI, ten years later, ACM Interactions 22(5), 2015.",
      url: "https://doi.org/10.1145/2804405",
      note: "Her own audit of what third wave HCI gained and lost."
    },
    {
      id: "darpa-ai",
      domain: "AI",
      cite: "John Launchbury, A DARPA Perspective on Artificial Intelligence (DARPA I2O, 2017).",
      url: "https://www.darpa.mil/about-us/darpa-perspective-on-ai",
      note: "Defines handcrafted knowledge, statistical learning, and contextual adaptation."
    },
    {
      id: "launchbury-talk",
      domain: "AI",
      cite: "John Launchbury, A DARPA Perspective on AI, public briefing video (2017).",
      url: "https://www.youtube.com/watch?v=-O01G3tSYpU",
      note: "The talk where the three waves framing was presented publicly."
    },
    {
      id: "huntington-1991",
      domain: "Democracy",
      cite: "Samuel P. Huntington, The Third Wave: Democratization in the Late Twentieth Century (University of Oklahoma Press, 1991).",
      url: "https://www.oupress.org/9780806125169/the-third-wave/",
      note: "Source of the third wave of democratization and reverse wave."
    },
    {
      id: "luhrmann-2019",
      domain: "Democracy",
      cite: "Anna Lührmann and Staffan I. Lindberg, A third wave of autocratization is here, Democratization 26(7), 2019.",
      url: "https://doi.org/10.1080/13510347.2019.1582029",
      note: "V Dem analysis of erosion rather than coups."
    },
    {
      id: "paxton-2000",
      domain: "Democracy",
      cite: "Pamela Paxton, Women's Suffrage and the Measurement of Democracy, Studies in Comparative International Development 35, 2000.",
      url: "https://doi.org/10.1007/BF02686119",
      note: "Shows how requiring female suffrage moves Huntington's first wave forward by decades."
    },
    {
      id: "dowie-1995",
      domain: "Environmentalism",
      cite: "Mark Dowie, Losing Ground: American Environmentalism at the Close of the Twentieth Century (MIT Press, 1995).",
      url: "https://mitpress.mit.edu/9780262540841/losing-ground/",
      note: "Periodizes conservation, regulation, market environmentalism, and justice."
    },
    {
      id: "krupp-1986",
      domain: "Environmentalism",
      cite: "Fred Krupp, New Environmentalism Factors In Economic Needs, The Wall Street Journal (November 20, 1986).",
      url: "https://www.encyclopedia.com/journals/culture-magazines/krupp-fred",
      note: "The op ed that coined third wave environmentalism."
    },
    {
      id: "ej-1991",
      domain: "Environmentalism",
      cite: "First National People of Color Environmental Leadership Summit, Principles of Environmental Justice (1991).",
      url: "https://www.ejnet.org/ej/principles.html",
      note: "The 17 principles that anchor the environmental justice wave."
    },
    {
      id: "chocolate-craft",
      domain: "Chocolate",
      cite: "Carla D. Martin and Kathryn E. Sampeck, The Bitter and Sweet of Chocolate in Europe, and craft chocolate reporting.",
      url: "https://springsmag.com/whats_next_cos/third-wave-chocolate-company/",
      note: "Shows how small cacao roasters adopted coffee's third wave vocabulary."
    }
  ]
};
