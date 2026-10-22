/* ============================================================
   Structured Biological Knowledge Base & Plain-English Models
   Educational content only — designed for zero medical background
   with optional clinical-detail expansion.
   ============================================================ */

window.BRAIN_DOAC_DATA = {
  glossary: {
    doac: {
      title: "DOAC — Direct Oral Anticoagulant (\"New-Generation\" Blood Thinner)",
      pronounce: "DOH-ak · e.g., Eliquis, Xarelto, Savaysa, Pradaxa",
      plain: "Modern pill-form blood thinners introduced in the 2010s as a cleaner, more predictable second generation after 1950s warfarin. Instead of slowing down four different liver proteins at once, each DOAC snaps directly onto ONE specific clotting gear — either Factor Xa (like Eliquis) or Factor IIa / Thrombin (like Pradaxa)."
    },
    eliquis: {
      title: "Eliquis (apixaban)",
      pronounce: "EL-ih-kwiss · generic: ah-PIX-ah-ban",
      plain: "One of the most commonly prescribed modern DOAC pills, usually taken twice a day (~12 hours apart). Notice the syllable \"-xa-\" right inside api-XA-ban: that tells you it blocks Factor Xa, turning down the body's fibrin mesh generator so dangerous clots cannot grow in leg veins (DVT), lungs (PE), or the heart."
    },
    factorXa: {
      title: "Factor Xa (\"Factor Ten-A\")",
      pronounce: "FAK-ter TEN-ay",
      plain: "The master amplifier in your blood's clotting chain. A tiny Roman numeral 'X' means 10, and 'a' means activated. Normally, just ONE active Factor Xa molecule triggers roughly 1,000 molecules of Thrombin (Factor IIa) — a huge 'thrombin burst' that builds tough clot cables."
    },
    factorIIa: {
      title: "Factor IIa / Thrombin (\"Activated Factor Two\")",
      pronounce: "FAK-ter TOO-ay · THROM-bin",
      plain: "Activated Clotting Factor 2! Right at the finish line of clotting, Thrombin acts like molecular scissors that snip liquid Fibrinogen proteins floating in your blood so they snap together into tough, insoluble Fibrin threads. Pradaxa (dabigatran) blocks Factor IIa directly; Eliquis stops Factor II from being switched on in the first place."
    },
    platelets: {
      title: "Platelets (Primary Hemostasis — \"Brake #1\")",
      pronounce: "PLAYT-lets · also called thrombocytes",
      plain: "Tiny disc-shaped cell fragments patrolling your bloodstream by the hundreds of billions. Whenever a microscopic tear opens in a vessel wall, platelets are the first responders within seconds — grabbing onto the tear, turning spiky, firing chemical flares (TXA2), and piling together like sandbags. Eliquis leaves platelets alone, which is how you stay safe day-to-day — UNTIL alcohol stuns them!"
    },
    txa2: {
      title: "Thromboxane A2 (TXA2 — Platelet \"SOS Flare\")",
      pronounce: "throm-BOK-sayn AY-too",
      plain: "A chemical signal released by the very first platelets that touch a leak. It shouts 'EVERYBODY STICK HERE NOW!' to passing platelets and squeezes the leaky vessel tighter. Both alcohol and NSAID pills (like ibuprofen or aspirin) suppress TXA2 — leaving platelets slippery and uncoordinated."
    },
    fibrin: {
      title: "Fibrin Mesh (Secondary Hemostasis — \"Brake #2\")",
      pronounce: "FY-brin",
      plain: "Tough, rope-like protein strands woven right over a soft platelet plug to lock it permanently in place against pounding blood pressure. Think of platelets as sandbags and fibrin as steel rebar concrete."
    },
    bridgingVeins: {
      title: "Bridging Veins (Subdural Space)",
      pronounce: "BRIJ-ing vaynz",
      plain: "Delicate drainpipes that stretch across a thin fluid space from the soft, movable surface of your brain up to the rigid lining bolted to your skull. When alcohol dehydrates your brain slightly, the brain sags a millimeter or two and pulls these veins tight like guitar strings — making them easy to tear from a minor bump."
    },
    monroKellie: {
      title: "Monro–Kellie Principle (\"The Sealed Skull Box Rule\")",
      pronounce: "mun-ROH KEL-ee",
      plain: "Your adult skull is solid bone — it cannot stretch like skin on your shin when bruised. Inside is a fixed space (~1,450 mL) shared by brain tissue (80%), blood (10%), and clear cushion fluid (10%). Once extra leaked blood squeezes out the spare fluid cushion, pressure inside the skull shoots upward rapidly and presses directly on vital brain tissue."
    },
    adh: {
      title: "ADH / Vasopressin (The Brain's Water-Saving Hormone)",
      pronounce: "ay-dee-AYCH · vay-zoh-PRESS-in",
      plain: "A hormone released by your pituitary gland that tells your kidneys to hold onto water. Alcohol switches ADH OFF — which is why drinking makes you pee repeatedly, dehydrating your body AND slightly shrinking fluid cushion around your brain."
    },
    cyp3a4: {
      title: "CYP3A4 (Liver Cleanup Enzyme)",
      pronounce: "SIP-three-ay-four",
      plain: "A hardworking recycling enzyme inside liver and gut cells that gradually breaks down Eliquis and Xarelto so old doses clear out on schedule. Liver inflammation or damage from heavy drinking slows this cleanup crew down — AND reduces production of fresh clotting proteins."
    },
    andexanet: {
      title: "Andexanet alfa (Andexxa — Decoy Rescue Antidote)",
      pronounce: "an-DEX-ah-net AL-fah",
      plain: "An emergency hospital infusion built to look just like human Factor Xa, except its cutting blade is disabled. It acts as a 'molecular sponge' in the bloodstream, soaking up Eliquis or Xarelto molecules within minutes so real Factor Xa can start clotting a life-threatening bleed."
    }
  },

  drugs: {
    none: {
      name: "Healthy Baseline (No Blood Thinner)",
      generation: "Natural Hemostasis",
      targetBadge: "Both Brakes 100% Active",
      plateletFactor: 1.0,
      xaActivity: 1.0,
      iiaActivity: 1.0,
      fibrinStrength: 1.0,
      oneLine: "Both emergency safety systems work at full strength: sticky platelets pile in seconds, and Factor Xa → Factor IIa weaves dense fibrin cables in minutes.",
      halfLife: "Natural continuous turnover",
      clearance: "Liver builds clotting proteins; spleen & liver clear old cells",
      withAlcohol: "Even with NO blood thinner, a heavy alcohol binge stuns platelets (drops TXA2), spikes blood pressure, dehydrates bridging veins, and causes falls — which is why binge drinking alone increases hemorrhagic stroke risk.",
      clinical: "Intact GP Ib/IX/V & GP IIb/IIIa platelet aggregation plus full prothrombinase complex amplification (~1,000 thrombin molecules per Xa) and Factor XIIIa cross-linked fibrin polymer."
    },
    eliquis: {
      name: "Eliquis (apixaban)",
      generation: "2nd-Gen Blood Thinner · DOAC ('-xaban' family)",
      targetBadge: "Blocks Factor Xa ('Ten-a')",
      plateletFactor: 1.0,
      xaActivity: 0.24,
      iiaActivity: 0.26,
      fibrinStrength: 0.28,
      oneLine: "Precision sniper pill that plugs active Factor Xa right before the 1,000× thrombin amplifier — intentionally slowing unwanted vein/heart clots while leaving your platelets completely untouched.",
      halfLife: "~12 hours (taken twice daily for smooth, steady levels)",
      clearance: "~27% Kidneys · ~73% Liver (CYP3A4 enzyme) & gut pumps",
      withAlcohol: "DANGER DOUBLE-HIT: Eliquis intentionally holds back Brake #2 (Factor Xa → Fibrin). Your brain relies heavily on healthy Platelets (Brake #1) to seal tiny daily micro-leaks. Alcohol stuns those exact platelets, spikes blood pressure, stretches skull veins via dehydration, and masks bleed symptoms as a hangover!",
      clinical: "Reversible direct active-site inhibitor of both free and clot-bound Factor Xa (Ki ~0.08 nM). Does not require antithrombin III cofactor. Peak plasma concentration 3–4 hours post-dose."
    },
    xarelto: {
      name: "Xarelto (rivaroxaban)",
      generation: "2nd-Gen Blood Thinner · DOAC ('-xaban' family)",
      targetBadge: "Blocks Factor Xa (Once-Daily Peak)",
      plateletFactor: 1.0,
      xaActivity: 0.20,
      iiaActivity: 0.22,
      fibrinStrength: 0.24,
      oneLine: "Cousin of Eliquis in the '-xaban' family — plugs the exact same Factor Xa gear, usually taken once daily with food, giving a higher peak wave 2–4 hours after swallowing the pill.",
      halfLife: "5–9 hours young adults (11–13 hours older adults)",
      clearance: "~33% Kidneys unchanged · ~66% Liver (CYP3A4 / CYP2J2)",
      withAlcohol: "Drinking right near Xarelto's evening peak wave (for example, taking your pill with dinner AND having drinks at dinner!) stacks maximum Factor Xa blockade directly on top of acute alcohol platelet suppression and stomach irritation.",
      clinical: "Competitive direct Factor Xa inhibitor; higher peak-to-trough ratio than twice-daily apixaban. Strong hepatic CYP3A4 + P-gp dependence makes cirrhosis (Child-Pugh B/C) a strict contraindication."
    },
    pradaxa: {
      name: "Pradaxa (dabigatran)",
      generation: "2nd-Gen Blood Thinner · DOAC ('-gatran' family)",
      targetBadge: "Blocks Factor IIa ('Factor 2' / Thrombin!)",
      plateletFactor: 1.0,
      xaActivity: 1.0,
      iiaActivity: 0.22,
      fibrinStrength: 0.25,
      oneLine: "The OTHER major branch of modern 2nd-generation DOACs! Instead of Factor Xa, it grabs activated Factor II (Thrombin) directly so it can't snip Fibrinogen into Fibrin cables — plus blocks thrombin from activating extra platelets!",
      halfLife: "12–17 hours (longer if kidneys are dehydrated or slowed)",
      clearance: "~80% Kidneys! (Very light liver metabolism)",
      withAlcohol: "TRIPLE PROBLEM: (1) Blocks Factor IIa + thrombin-mediated platelet activation; (2) Alcohol switches off ADH → dehydration reduces kidney flow → Pradaxa lingers higher in blood; (3) Capsules contain tartaric acid cores that + alcohol harshly irritate the stomach lining.",
      clinical: "Univalent direct competitive thrombin (Factor IIa) inhibitor; inhibits both free and fibrin-bound IIa as well as PAR-1 thrombin-induced platelet aggregation. Reversed in emergencies by monoclonal antibody fragment idarucizumab (Praxbind)."
    },
    warfarin: {
      name: "Warfarin (Coumadin)",
      generation: "1st-Gen ('Old School' 1950s) Anticoagulant",
      targetBadge: "Blocks Vitamin K → Factors II, VII, IX, X",
      plateletFactor: 1.0,
      xaActivity: 0.28,
      iiaActivity: 0.25,
      fibrinStrength: 0.25,
      oneLine: "The older generation before DOACs: slows down Vitamin K recycling in your liver factory so FOUR clotting proteins (II, VII, IX, X) come off the assembly line unfinished.",
      halfLife: "20–60 hours (takes 3–5 days to turn on or wear off!)",
      clearance: "Liver CYP2C9 enzyme — notoriously sensitive to food, meds & alcohol",
      withAlcohol: "WILD ROLLERCOASTER: A binge night blocks liver CYP2C9 breakdown → warfarin level & INR shoot dangerously HIGH (major brain bleed risk — warfarin has roughly 2× higher spontaneous brain bleed rate than Eliquis even BEFORE alcohol!). Chronic heavy drinking flips the enzyme faster → dangerous clots!",
      clinical: "Inhibits VKORC1 epoxide reductase, preventing gamma-carboxylation of glutamate residues on Factors II, VII, IX, X and anticoagulant Proteins C & S."
    },
    aspirin: {
      name: "Aspirin / Ibuprofen (Antiplatelet / NSAID)",
      generation: "Brake #1 Blocker (NOT a DOAC — often stacked by mistake!)",
      targetBadge: "Blocks Platelet COX-1 & TXA2 Flare",
      plateletFactor: 0.34,
      xaActivity: 1.0,
      iiaActivity: 1.0,
      fibrinStrength: 0.88,
      oneLine: "Targets Brake #1 (Platelets) instead of clotting factors — turns off the TXA2 chemical SOS flare so platelets stay smooth and slippery, AND thins protective mucus in your stomach.",
      halfLife: "Aspirin locks a platelet permanently for its whole 7–10 day life!",
      clearance: "Liver & kidneys; direct local irritation on stomach wall",
      withAlcohol: "Look how similar this is to alcohol: BOTH disarm Brake #1 (Platelets) and strip stomach mucus! That is why popping Advil/Ibuprofen or Aspirin the morning after drinking WHILE taking Eliquis hammers your body from FOUR angles at once.",
      clinical: "Irreversible (aspirin) or reversible (ibuprofen/naproxen) COX-1 inhibition blocking arachidonic acid → thromboxane A2 synthesis in platelets and prostaglandin E2 cytoprotective mucus in gastric mucosa."
    }
  },

  hotspots: [
    {
      id: "bridging",
      num: 1,
      short: "Bridging Veins",
      title: "① Subdural Bridging Veins — Stretched Like Tight Guitar Strings",
      nx: 0.50,
      ny: 0.145,
      plain: "Tiny thin-walled veins cross a fluid gap from your soft brain up to the hard outer membrane bolted to your skull. Alcohol blocks your water-saving hormone (ADH), dehydrating you so your brain sags just slightly inside the skull — pulling these veins taut.",
      whyBadMix: "Even a minor cabinet bump or stumble can tear a stretched bridging vein. Normally platelets + fibrin plug low-pressure vein leaks quickly. With Eliquis holding back fibrin AND alcohol stunning platelets, venous blood oozes silently for hours into the 'subdural space' while you sleep!",
      clinical: "Subdural hematoma (SDH) arises from shear strain across parasagittal bridging veins draining cortical veins into the superior sagittal sinus. Low venous pressure permits insidious accumulation before mass effect crosses cerebral compliance."
    },
    {
      id: "skull",
      num: 2,
      short: "Rigid Skull & CSF",
      title: "② The Sealed Bone Box Rule (Monro–Kellie Principle)",
      nx: 0.77,
      ny: 0.24,
      plain: "Why is a tiny 30 mL bleed in your head life-threatening when a 30 mL bruise on your leg is harmless? Because leg skin stretches outward — your skull bone has ZERO give! Inside is a fixed space shared by brain tissue, blood vessels, and clear cushion fluid (CSF).",
      whyBadMix: "At first, a small slow bleed pushes spare CSF fluid down into your spine, so you feel totally fine or 'just mildly headachy.' Once that tiny cushion runs out (~25–35 mL), every extra drop of un-clotted blood sends skull pressure skyrocketing vertically!",
      clinical: "Intracranial compliance curve (dP/dV): once subarachnoid & ventricular CSF displacement saturates, intracranial pressure (ICP > 20–25 mmHg) rises exponentially, reducing cerebral perfusion pressure (CPP = MAP − ICP)."
    },
    {
      id: "deepArterioles",
      num: 3,
      short: "Deep Micro-Arteries",
      title: "③ Deep Penetrating Arterioles — High-Pressure Firehose Branches",
      nx: 0.50,
      ny: 0.49,
      plain: "Deep near the center of your brain, hair-thin vessels branch sharply off major high-pressure arteries to feed movement and sensation centers. They take a pounding with every heartbeat.",
      whyBadMix: "Binge drinking — AND next-morning alcohol withdrawal rebound — triggers stress hormones that spike blood pressure sharply! If high pressure pops a tiny weak spot here while both clotting brakes are cut, blood jets rapidly right into delicate brain tissue (Intracerebral Hemorrhage).",
      clinical: "Lenticulostriate and thalamoperforating perforators off the middle/posterior cerebral arteries lack gradual branching step-down; catecholamine-driven hypertension + impaired secondary hemostasis drives rapid hematoma expansion."
    },
    {
      id: "frontal",
      num: 4,
      short: "Judgment & Masking",
      title: "④ Prefrontal Cortex — 'I'm Fine, I Just Need to Sleep It Off'",
      nx: 0.24,
      ny: 0.35,
      plain: "Your front brain lobe handles risk judgment and self-monitoring — noticing when something feels wrong in your body.",
      whyBadMix: "Alcohol quiets your prefrontal cortex right when danger starts. People shrug off hitting their head on a car door, misread early confusion or slurred speech as 'still buzzed,' and go to bed alone — losing the golden early window when doctors can reverse a bleed easily.",
      clinical: "Ethanol enhances GABA-A chloride conductance and inhibits NMDA glutamate signaling across prefrontal networks, blunting executive risk appraisal and masking early Glasgow Coma Scale decline."
    },
    {
      id: "hippocampus",
      num: 5,
      short: "Memory Recorder",
      title: "⑤ Hippocampus — Forgotten Head Bumps ('Amnesia Trap')",
      nx: 0.46,
      ny: 0.59,
      plain: "Deep in your temporal lobe sits the hippocampus, the 'save button' that writes tonight's moments into long-term memory.",
      whyBadMix: "After several drinks, the hippocampus stops recording cleanly (fragmented or 'blackout' memory). Next morning in the clinic, people honestly answer 'No, I never hit my head!' even after tripping in a dark hallway at 1 AM!",
      clinical: "CA1 hippocampal long-term potentiation (LTP) is acutely blocked by ethanol via NMDA antagonism, frequently producing occult trauma history in anticoagulant-associated SDH."
    },
    {
      id: "pituitary",
      num: 6,
      short: "ADH Water Switch",
      title: "⑥ Pituitary Gland — Shutting Off Your Water-Saving Hormone",
      nx: 0.39,
      ny: 0.65,
      plain: "This pea-sized gland at the base of the brain releases ADH (vasopressin) to tell your kidneys 'save water!' Alcohol switches ADH off.",
      whyBadMix: "You lose far more water than the liquid in your drinks: (1) Brain volume dips slightly → stretches bridging veins taut; (2) Morning orthostatic dizziness makes you faint or stumble in the bathroom; (3) Concentrated blood + kidney stress alters drug clearance (especially Pradaxa!).",
      clinical: "Suppressed posterior pituitary arginine vasopressin secretion produces free-water diuresis, intracranial hypotension / meningeal traction headache, orthostatic hypotension, and transient GFR dip."
    },
    {
      id: "cerebellum",
      num: 7,
      short: "Balance Gyroscope",
      title: "⑦ Cerebellum & Brainstem — Balance Loss + Pressure Bottleneck",
      nx: 0.70,
      ny: 0.68,
      plain: "At the back-bottom of your skull sits the cerebellum (your body's balance gyroscope) right beside the brainstem (which runs breathing, heart rate, and consciousness).",
      whyBadMix: "First, alcohol scrambles cerebellar balance cells — multiplying fall and head-strike risk even at 2–4 drinks! Second, because the skull's only exit hole sits right below the brainstem, unchecked pressure from ANY growing brain bleed eventually squeezes the brainstem.",
      clinical: "Purkinje cell GABAergic potentiation causes truncal/gait ataxia and vestibular dysmetria; unchecked supratentorial or posterior fossa mass effect threatens uncal/tonsillar brainstem compression."
    }
  ],

  symptoms: [
    {
      id: "headache",
      label: "🤕 Throbbing Headache",
      hangoverWhy: "Dehydration pulls slightly on pain-sensitive brain linings (meninges), blood vessels dilate from acetaldehyde & inflammatory prostaglandins, and sleep quality crashed.",
      bleedWhy: "Expanding pooled blood physically stretches pain nerves on the dura mater lining and drives rising pressure inside the sealed bone skull.",
      redFlags: [
        "Headache gets steadily WORSE hour after hour instead of fading with water & rest",
        "Came on suddenly like a 'clap of thunder' or peaks within seconds/minutes",
        "Feels noticeably different or more severe than any normal headache you've had",
        "Happened anywhere within hours OR even days/weeks after ANY head bump while on Eliquis"
      ]
    },
    {
      id: "drowsy",
      label: "😴 Heavy Drowsiness / 'Let Me Sleep'",
      hangoverWhy: "Alcohol fragmented REM sleep and caused glutamate/adenosine rebound fatigue, leaving your brain exhausted.",
      bleedWhy: "Rising skull pressure squeezes the Reticular Activating System (your brainstem's 'awake switch') — drowsiness sliding into stupor is often the #1 warning sign of a slow subdural bleed!",
      redFlags: [
        "Hard to wake up fully, or drifts right back out mid-conversation",
        "Growing MORE sleepy later in the day when alcohol should have worn off",
        "Never leave someone on a blood thinner alone to 'sleep off' heavy drinking after a fall or head bump!"
      ]
    },
    {
      id: "nausea",
      label: "🤢 Nausea & Vomiting",
      hangoverWhy: "Alcohol irritated your stomach lining directly and acetaldehyde triggered nausea sensors.",
      bleedWhy: "Rising pressure inside the skull directly presses the brain's vomiting reflex center (area postrema) in the brainstem — triggering sudden nausea or repeated vomiting!",
      redFlags: [
        "Repeated vomiting paired with a worsening headache or neck stiffness",
        "Vomit that looks dark like coffee grounds or contains red blood (sign of stomach bleeding on Eliquis!)",
        "Black, tarry stools over the next 24–48 hours (digested blood from upper stomach bleed)"
      ]
    },
    {
      id: "dizzy",
      label: "🌀 Clumsiness, Slurred Speech or Off-Balance",
      hangoverWhy: "Alcohol changed fluid density inside your inner ear balance canals and lingered in the cerebellum.",
      bleedWhy: "Blood pressing on motor cortex, speech centers, or cerebellum blocks nerve signals to one side of the face, arm, leg, or tongue.",
      redFlags: [
        "Weakness, heaviness, numbness, or pins-and-needles on ONE side of the face, arm, or leg",
        "Slurred or garbled words AFTER enough hours have passed that alcohol should be wearing off",
        "Sudden inability to walk straight or coordinate one hand"
      ]
    },
    {
      id: "vision",
      label: "👁️ Blurry / Double Vision or Confusion",
      hangoverWhy: "Dry eyes, bright-light sensitivity (photophobia), sluggish blood sugar, and poor sleep focus.",
      bleedWhy: "Pressure inside the skull squeezes delicate eye-movement nerves (Cranial Nerves III / VI), changing pupil size or alignment, and slows cortical processing.",
      redFlags: [
        "Seeing double images side-by-side, or losing part of side vision",
        "One pupil looks noticeably larger than the other in a mirror",
        "Confusion about what day it is, repeating questions, or acting uncharacteristically 'off'"
      ]
    }
  ],

  pkScenarios: {
    steady: {
      label: "1. Prescribed Eliquis · 0 Drinks (Safe Baseline)",
      drinkCount: 0,
      skipDose: false,
      chronicLiver: false,
      summary: "Twice-daily Eliquis stays right inside the green 'Goldilocks window': enough Factor Xa blockade to stop dangerous DVT/lung/stroke clots from forming, while 100% healthy platelets instantly seal everyday microscopic leaks.",
      liverText: "CYP3A4 cleanup runs smoothly right on schedule; liver manufactures healthy baseline clotting factors.",
      stomachText: "Thick protective mucus coat intact; normal low everyday GI risk.",
      brainText: "Platelets 100% responsive, blood pressure steady, balance crisp, zero hangover masking."
    },
    light: {
      label: "2. Prescribed Eliquis · 1 Small Drink w/ Food",
      drinkCount: 1,
      skipDose: false,
      chronicLiver: false,
      summary: "Small ripple in low-risk healthy adults: mild short-lived blood vessel relaxation and tiny dip in platelet stickiness. Why context still matters: age >75, kidney/liver trouble, prior stomach ulcer, unsteady balance, or daily aspirin can make even small amounts riskier — always ask your own clinician.",
      liverText: "Alcohol dehydrogenase handles small load; minimal shift in Eliquis concentration.",
      stomachText: "Food buffers mild acid/alcohol contact (unless stacked with ibuprofen/aspirin!).",
      brainText: "Minimal dehydration if paired with water; normal awareness of symptoms."
    },
    binge: {
      label: "3. Prescribed Eliquis + Friday Night Binge (5+ Drinks)",
      drinkCount: 5,
      skipDose: false,
      chronicLiver: false,
      summary: "CRITICAL RED DANGER WINDOW: Right while Eliquis peaks in your blood (blocking Factor Xa / Fibrin), high alcohol stuns your platelets, strips stomach mucus, spikes blood pressure, dehydrates skull bridging veins, impairs balance, AND masks warning signs until morning!",
      liverText: "Acute alcohol competes for liver resources & slows clearance slightly, raising peak bleed exposure.",
      stomachText: "Protective mucus stripped away! Exposed capillaries + blocked clotting = high risk of hidden or sudden stomach bleeding.",
      brainText: "BOTH clotting brakes impaired simultaneously inside a rigid bone skull + fall & hangover camouflage."
    },
    chronic: {
      label: "4. Chronic Heavy Drinking + Eliquis",
      drinkCount: 4,
      skipDose: false,
      chronicLiver: true,
      summary: "COMPOUNDING TRIPLE HIT: Over time, heavy alcohol inflames/scars the liver (slowing CYP3A4 so Eliquis piles UP higher than intended), shrinks the liver's supply of natural clotting proteins, AND suppresses bone marrow so you have FEWER platelets even when sober!",
      liverText: "Impaired CYP3A4 drug breakdown (higher Eliquis blood levels!) + reduced natural clotting factor synthesis.",
      stomachText: "Chronic gastritis + portal vein pressure makes upper GI bleeding dangerous and frequent.",
      brainText: "Lower baseline platelets + fragile vessels + elevated drug curve 24 hours a day."
    },
    skipTrap: {
      label: "5. TRAP: 'I'll Skip My Eliquis Pills So I Can Drink!'",
      drinkCount: 5,
      skipDose: true,
      chronicLiver: false,
      summary: "DANGEROUS CLOT REBOUND TRAP! Because modern DOACs wear off fast (~12h half-life), skipping doses drops your blood protection into the red DANGER CLOT ZONE within a single day — right when alcohol dehydration concentrates your blood and spikes clot-stabilizing PAI-1! Never skip prescribed doses to drink.",
      liverText: "Drug washes out rapidly below protective floor while alcohol triggers rebound PAI-1 pro-clotting surge.",
      stomachText: "Alcohol still irritates stomach lining — AND people often panic and double-dose the next day!",
      brainText: "Unprotected risk of DVT breaking loose to lungs (PE) or stroke in atrial fibrillation — PLUS fall hazard while drinking!"
    }
  },

  myths: [
    {
      q: "\"As long as I sit on the couch and don't fall or hit my head, binge drinking on Eliquis can't hurt my brain.\"",
      truthIsMyth: true,
      headline: "Myth! Falls are huge, bit NOT the only trigger.",
      detail: "Binge drinking and next-morning alcohol rebound sharply spike blood pressure inside hair-thin deep brain arterioles while both clotting brakes (platelets + fibrin) are down — raising spontaneous microbleed and hemorrhagic stroke risk with zero fall at all. Plus, hidden stomach bleeding can make you faint standing up in the morning!"
    },
    {
      q: "\"If I wake up with a bad hangover headache while on Eliquis, popping two Ibuprofen (Advil) or Aspirin is totally harmless.\"",
      truthIsMyth: true,
      headline: "Myth — that's the classic 'Quadruple Hit' mistake!",
      detail: "Ibuprofen, naproxen (Aleve), and aspirin are NSAIDs: they block COX-1 in your platelets (making platelets EVEN less able to clot!) AND strip protective mucus off your stomach wall right after alcohol already irritated it. And remember: if a morning headache on Eliquis is worsening, don't mask it — make sure it isn't a bleed!"
    },
    {
      q: "\"I should just skip my Friday and Saturday Eliquis pills whenever I want to party safely.\"",
      truthIsMyth: true,
      headline: "Myth — skipping short-acting DOACs invites dangerous clots fast!",
      detail: "Unlike old warfarin (which stays in your system for days), Eliquis drops by half roughly every 12 hours. Skipping doses leaves a healing leg clot (DVT) or heart rhythm completely unguarded right while alcohol dehydration thickens venous flow. Always keep taking your medication as prescribed and talk to your clinician beforehand."
    },
    {
      q: "\"If someone on Eliquis bumps their head and feels completely normal 15 minutes later, they're in the clear.\"",
      truthIsMyth: true,
      headline: "Myth! Subdural venous oozing can take hours (or even days) to build pressure.",
      detail: "Remember the Sealed Skull Box curve: the first 15–25 mL of a low-pressure bridging-vein bleed quietly pushes spare fluid cushion aside with almost zero symptoms! That's why doctors recommend prompt medical evaluation after any real head impact on a blood thinner — a quick, painless 60-second head CT checks right inside."
    },
    {
      q: "\"Emergency rooms DO have specific modern tools to stop and reverse Eliquis / DOAC bleeding when someone comes in early.\"",
      truthIsMyth: false,
      headline: "TRUE — and knowing this can save a life!",
      detail: "Many patients delay going to the ER because they think 'nothing can reverse new blood thinners.' Today hospitals have 60-second CT scans plus rapid reversal medicines like Andexanet alfa (Andexxa — a decoy Factor Xa sponge for Eliquis/Xarelto), 4-Factor PCC, and Idarucizumab (Praxbind — a precision antibody antidote for Pradaxa). Getting checked EARLY makes all the difference."
    }
  ]
};
