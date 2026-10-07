// Nobel Prize Explainer - Interactive Exhibition & Discovery
const prizes = [
  {
    id: "quantum-circuits",
    year: "2025",
    field: "Physics",
    laureates: "John Clarke, Michel H. Devoret & John M. Martinis",
    title: "Macroscopic Quantum Circuits",
    citation: "For discovering macroscopic quantum tunnelling and energy quantisation in an electric circuit.",
    icon: "⚛️",
    summary: "Quantum circuits are tiny electrical loops chilled almost to absolute zero. At that temperature, electricity behaves like a wave: it can tunnel straight through an insulating barrier and occupy discrete energy “ladder steps”, just as electrons do in atoms.",
    audienceKid: "Imagine if a toy car didn't have to drive over a mountain—it could magically pop through it! And instead of being able to drive at any speed, it could only drive at speed 1, 2, or 3. That is how tiny chilled electric circuits act!",
    didYouKnow: "These macroscopic quantum circuits are the foundational hardware building blocks powering today’s superconducting quantum computers (like IBM and Google's quantum processors)!",
    image: "assets/illustrations/quantum-circuits.svg",
    demoType: "energy",
    demoTitle: "Superconducting Energy Levels & Barrier Tunneling",
    demoDesc: "Switch energy states (n=1 to 4) and fire wave packets to observe macroscopic quantum tunnelling through the Josephson barrier."
  },
  {
    id: "metal-organic-frameworks",
    year: "2025",
    field: "Chemistry",
    laureates: "Susumu Kitagawa, Richard Robson & Omar M. Yaghi",
    title: "Metal–Organic Frameworks (MOFs)",
    citation: "For the development of metal–organic frameworks.",
    icon: "💎",
    summary: "MOFs are molecular scaffolds: metal joints connected by organic rods. Their enormous, tunable pores can capture carbon dioxide from factory chimneys, store hydrogen gas safely, or filter drinking water straight from dry desert air.",
    audienceKid: "It's like making a giant jungle gym using magnetic balls and tinkertoy sticks, leaving huge hollow rooms inside to catch and trap dust, water, or gases!",
    didYouKnow: "A single gram of a MOF crystal has so much internal surface area that if you unfolded it, it could cover an entire football field!",
    image: "assets/illustrations/metal-organic-frameworks.svg",
    demoType: "mof",
    demoTitle: "The Molecular Sponge: Pore Tuning & Gas Capture",
    demoDesc: "Adjust pore aperture size and target molecule filter to capture greenhouse gas molecules (CO₂) inside the nano-framework."
  },
  {
    id: "immune-tolerance",
    year: "2025",
    field: "Medicine",
    laureates: "Mary Brunkow, Fred Ramsdell & Shimon Sakaguchi",
    title: "Peripheral Immune Tolerance",
    citation: "For discoveries concerning peripheral immune tolerance and Foxp3 regulatory T cells.",
    icon: "🛡️",
    summary: "Regulatory T cells (Tregs) are the immune system’s diplomatic brakes. They patrol tissues and actively prevent overzealous killer T cells from mistaking healthy organs for foreign invaders—paving the way for treatments for autoimmune diseases.",
    audienceKid: "Your immune system is full of energetic police dogs. Tregs are the trainers who whistle when the dogs accidentally bark at family members, keeping your own organs safe!",
    didYouKnow: "Mutations in the Foxp3 gene, discovered in mice and humans, disable these Tregs, leading to fatal multi-organ autoimmune attacks—proving their life-saving braking role.",
    image: "assets/illustrations/immune-tolerance.svg",
    demoType: "immune",
    demoTitle: "Treg Immune Brakes Simulator",
    demoDesc: "Release aggressive effector T-cells, then deploy Foxp3 Regulatory T-cells (Tregs) to calm inflammation and protect friendly tissue cells."
  },
  {
    id: "literature-krasznahorkai",
    year: "2025",
    field: "Literature",
    laureates: "László Krasznahorkai",
    title: "Visionary Prose & The Power of Art",
    citation: "For a compelling and visionary oeuvre that reaffirms the power of art in apocalyptic times.",
    icon: "✒️",
    summary: "Unlike prizes for a single laboratory experiment, the Literature prize recognises an author’s whole body of work. Krasznahorkai’s dense, musical, wandering prose finds sublime beauty, philosophical reflection, and moral urgency.",
    audienceKid: "Stories don't just tell you what happened; they help you feel what it is like to walk inside someone else's mind when things feel mysterious or daunting.",
    didYouKnow: "Krasznahorkai famously writes sentences that can last several pages without a single period, creating an unbroken hypnotic stream of consciousness.",
    image: "assets/illustrations/literature-krasznahorkai.svg",
    demoType: "stream",
    demoTitle: "The Continuous Stream of Consciousness",
    demoDesc: "Tap the quill to reveal the unfolding rhythm of thought, adjusting tempo and observing how musical phrasing breathes life into words."
  },
  {
    id: "peace-machado",
    year: "2025",
    field: "Peace",
    laureates: "María Corina Machado",
    title: "Democratic Rights & Civic Courage",
    citation: "For her tireless work promoting democratic rights and peaceful transition for the people of Venezuela.",
    icon: "🕊️",
    summary: "Peace is not merely the absence of military conflict: it requires strong democratic rights, accountable institutions, citizen participation, and courageous civilian movements uniting communities against authoritarian oppression.",
    audienceKid: "Peace means everyone in the playground gets a fair turn to vote on the games they play, without anyone using threats or taking away votes.",
    didYouKnow: "Machado organized unprecedented grassroots citizen-led tally networks, digitizing and verifying millions of voting paper ballots across the entire nation.",
    image: "assets/illustrations/peace-machado.svg",
    demoType: "ballot",
    demoTitle: "Pillars of Durable Democracy",
    demoDesc: "Balance citizen participation, ballot integrity, independent courts, and free expression to construct a resilient democracy index."
  },
  {
    id: "growth-mokyr-aghion-howitt",
    year: "2025",
    field: "Economic Sciences",
    laureates: "Joel Mokyr, Philippe Aghion & Peter Howitt",
    title: "Innovation-Driven Economic Growth",
    citation: "For having explained innovation-driven economic growth and the dynamics of creative destruction.",
    icon: "📈",
    summary: "Economic progress is not an accidental miracle; it is a dynamic feedback loop. Useful scientific knowledge creates startups, market competition rewards upgrades, and superior innovations replace outdated paradigms (creative destruction).",
    audienceKid: "Think of how smartphones replaced cassette tapes, alarm clocks, and bulky paper road maps. Old ideas make way for cooler, more helpful inventions!",
    didYouKnow: "Joseph Schumpeter coined 'creative destruction', but Aghion & Howitt turned it into rigorous mathematical models that guide government R&D and patent policy.",
    image: "assets/illustrations/growth-mokyr-aghion-howitt.svg",
    demoType: "creative-destruction",
    demoTitle: "Creative Destruction Engine",
    demoDesc: "Invest capital in R&D to spawn leapfrog technologies and observe GDP growth while transitioning obsolete industries."
  },
  {
    id: "machine-learning-hopfield-hinton",
    year: "2024",
    field: "Physics",
    laureates: "John J. Hopfield & Geoffrey E. Hinton",
    title: "Foundations of Artificial Neural Networks",
    citation: "For foundational discoveries and inventions that enable machine learning with artificial neural networks.",
    icon: "🧠",
    summary: "Hopfield used statistical physics of atomic spin grids to invent associative memory networks. Hinton expanded on this with Boltzmann machines and backpropagation algorithms, establishing the foundational architecture for modern AI.",
    audienceKid: "It's like teaching a computer brain to recognize pictures of kittens by showing it lots of scribbles and gently tuning the volume knobs on billions of connections!",
    didYouKnow: "Hopfield networks retrieve full memories even when given noisy or half-torn images, mimicking how humans remember an entire song after hearing two notes.",
    image: "assets/illustrations/machine-learning-hopfield-hinton.svg",
    demoType: "nn-train",
    demoTitle: "Interactive Neural Pattern Recall",
    demoDesc: "Inject noisy pixels into a Hopfield associative grid and click 'Restore' to watch energy minimization reconstruct the stored pattern."
  },
  {
    id: "protein-design-baker-hassabis-jumper",
    year: "2024",
    field: "Chemistry",
    laureates: "David Baker; Demis Hassabis & John Jumper",
    title: "Protein Design & AI Structure Prediction",
    citation: "For computational protein design and protein structure prediction using artificial intelligence.",
    icon: "🧬",
    summary: "Proteins are 3D nanomachines whose folded shapes govern biology. Baker developed Rosetta to craft brand-new proteins never seen in nature; Hassabis and Jumper built AlphaFold, solving a 50-year-old grand challenge in biology.",
    audienceKid: "Proteins are molecular origami folded from strings of chemical beads. For 50 years, folding them was an impossible puzzle—until an AI figured it out!",
    didYouKnow: "AlphaFold has predicted the 3D structures of virtually all 200+ million known proteins across science, freely available to researchers worldwide.",
    image: "assets/illustrations/protein-design-baker-hassabis-jumper.svg",
    demoType: "protein-fold",
    demoTitle: "AlphaFold 3D Molecular Folder",
    demoDesc: "Mutate amino-acid sequences and observe how hydrophobic attraction and electrostatic charges snap the ribbon into functional 3D nanomachinery."
  },
  {
    id: "microrna-ambros-ruvkun",
    year: "2024",
    field: "Medicine",
    laureates: "Victor Ambros & Gary Ruvkun",
    title: "Discovery of MicroRNA & Gene Regulation",
    citation: "For the discovery of microRNA and its role in post-transcriptional gene regulation.",
    icon: "🔬",
    summary: "MicroRNAs are microscopic single-stranded RNA molecules that do not make proteins themselves. Instead, they act as cellular volume knobs, binding to messenger RNA transcripts to fine-tune exactly how much protein is produced.",
    audienceKid: "Your DNA has recipes to make your body work. MicroRNA is like a tiny sticky note that says 'Hey, let's only bake half this recipe today so we don't make too many cookies!'",
    didYouKnow: "Ambros and Ruvkun discovered this mechanism while studying a tiny 1-millimeter transparent roundworm called C. elegans!",
    image: "assets/illustrations/microrna-ambros-ruvkun.svg",
    demoType: "microrna-dial",
    demoTitle: "Post-Transcriptional Dial",
    demoDesc: "Adjust microRNA concentration to observe real-time mRNA binding and repression of protein synthesis."
  },
  {
    id: "literature-han-kang",
    year: "2024",
    field: "Literature",
    laureates: "Han Kang",
    title: "The Body Remembers & Historical Traumas",
    citation: "For her intense poetic prose that confronts historical traumas and exposes the fragility of human life.",
    icon: "🌸",
    summary: "Han Kang's masterpieces (such as The Vegetarian and Human Acts) use delicate yet fierce sensory prose to explore sorrow, historical memory, and the tenderness of the human condition against violent history.",
    audienceKid: "Sometimes quiet words carry the biggest feelings. Writing helps keep the memories of our ancestors and our kindness alive when things are tough.",
    didYouKnow: "She became the first South Korean writer and first Asian woman ever to win the Nobel Prize in Literature.",
    image: "assets/illustrations/literature-han-kang.svg",
    demoType: "poetic-metaphor",
    demoTitle: "Poetic Texture & Empathy Lens",
    demoDesc: "Switch perspective lenses (Memory, Grief, Botanical, Tenderness) to explore how poetic imagery transforms historical pain into empathy."
  },
  {
    id: "peace-nihon-hidankyo",
    year: "2024",
    field: "Peace",
    laureates: "Nihon Hidankyo",
    title: "Grassroots Hibakusha for Nuclear Abolition",
    citation: "For its efforts to achieve a world free of nuclear weapons and demonstrating through witness testimony that nuclear weapons must never be used again.",
    icon: "🕊️",
    summary: "Nihon Hidankyo is the Japanese confederation of atomic bomb survivors from Hiroshima and Nagasaki. For over seven decades, they turned catastrophic personal tragedy into a tireless, peaceful movement that established the international nuclear taboo.",
    audienceKid: "Grandmothers and grandfathers who survived terrible bombs dedicated their lives to sharing their stories, folding peace cranes, and asking all world leaders to promise never to use bombs again.",
    didYouKnow: "Survivors fold paper cranes (Orizuru) as a global symbol of hope, peace, and healing.",
    image: "assets/illustrations/peace-nihon-hidankyo.svg",
    demoType: "crane-ripple",
    demoTitle: "Survivor Voices & The Global Ripple",
    demoDesc: "Tap the origami crane to cast expanding ripples of testimony across the continents, strengthening the global humanitarian taboo."
  },
  {
    id: "institutions-acemoglu-johnson-robinson",
    year: "2024",
    field: "Economic Sciences",
    laureates: "Daron Acemoglu, Simon Johnson & James A. Robinson",
    title: "Institutions & Prosperity",
    citation: "For studies of how institutions are formed and affect prosperity.",
    icon: "🏛️",
    summary: "Why are some nations wealthy while others remain poor? Acemoglu, Johnson, and Robinson demonstrated that inclusive economic and political institutions foster broad opportunity, secure property rights, and prosperity, whereas extractive institutions stifle potential.",
    audienceKid: "If the rules in a board game say only one player is allowed to roll the dice and win prizes, nobody else wants to play. Inclusive rules let everyone invent and succeed!",
    didYouKnow: "Their acclaimed book 'Why Nations Fail' looked across centuries of colonial history, showing institutional legacies persist over hundreds of years.",
    image: "assets/illustrations/institutions-acemoglu-johnson-robinson.svg",
    demoType: "institutions-toggle",
    demoTitle: "Inclusive vs. Extractive Simulator",
    demoDesc: "Toggle societal institutions between Extractive and Inclusive to watch its impact on patent filings, wealth distribution, and public education."
  },
  {
    id: "attosecond-pulses",
    year: "2023",
    field: "Physics",
    laureates: "Pierre Agostini, Ferenc Krausz & Anne L’Huillier",
    title: "Attosecond Laser Pulses",
    citation: "For experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter.",
    icon: "⚡",
    summary: "An attosecond is 10⁻¹⁸ of a second—there are as many attoseconds in one second as there have been seconds since the birth of the universe! These ultra-fast laser flashes act like high-speed cameras capable of snapping pictures of moving electrons inside atoms.",
    audienceKid: "Like taking a super high-speed picture of a hummingbird's flapping wings, but a million billion times faster to take snapshots of lightning-fast electrons!",
    didYouKnow: "Anne L’Huillier is only the fifth woman ever to be awarded the Nobel Prize in Physics.",
    image: "assets/illustrations/attosecond-pulses.svg",
    demoType: "attosecond-shutter",
    demoTitle: "The World's Fastest Camera Shutter",
    demoDesc: "Slow down the time scale from nanoseconds to attoseconds to stop the blur and capture an electron jumping quantum energy states."
  },
  {
    id: "quantum-dots",
    year: "2023",
    field: "Chemistry",
    laureates: "Moungi G. Bawendi, Louis E. Brus & Alexei I. Ekimov",
    title: "Quantum Dots & Nanoscale Color",
    citation: "For the discovery and synthesis of quantum dots.",
    icon: "🔮",
    summary: "Quantum dots are semiconductor nanocrystals so small (just a few nanometers) that their electrons are trapped in quantum confinement. Shrinking or growing their size by just a few atoms radically changes their emitted color—from red to vibrant blue.",
    audienceKid: "Imagine if squeezing a rubber ball didn't just make it smaller, but actually changed its color from ruby red to emerald green and glowing blue!",
    didYouKnow: "Quantum dots are what give QLED televisions their vivid, hyper-pure colors, and they help surgeons highlight cancerous tumors during operations.",
    image: "assets/illustrations/quantum-dots.svg",
    demoType: "quantum-dot-size",
    demoTitle: "Nanocrystal Quantum Confinement",
    demoDesc: "Drag the crystal diameter slider from 2nm to 7nm to watch quantum mechanics shift the emitted wavelength across the entire visual rainbow."
  },
  {
    id: "mrna-vaccines-kariko-weissman",
    year: "2023",
    field: "Medicine",
    laureates: "Katalin Karikó & Drew Weissman",
    title: "Nucleoside Modified mRNA Vaccines",
    citation: "For discoveries concerning nucleoside base modifications that enabled effective mRNA vaccines against COVID-19.",
    icon: "💉",
    summary: "Karikó and Weissman discovered that swapping uridine bases with modified pseudouridine (Ψ) prevented mRNA from triggering dangerous premature immune inflammation. This breakthrough allowed cells to safely translate mRNA into protective viral spike antibodies.",
    audienceKid: "mRNA is like a safe instruction booklet for your cells. Karikó and Weissman made sure the body doesn't accidentally shred the instruction booklet before reading it!",
    didYouKnow: "Katalin Karikó persisted for decades when funding was repeatedly denied and she was demoted, proving unyielding scientific dedication.",
    image: "assets/illustrations/mrna-vaccines-kariko-weissman.svg",
    demoType: "mrna-synthesis",
    demoTitle: "Synthetic mRNA Translation & Antibody Lab",
    demoDesc: "Inject unmodified vs. pseudouridine-modified mRNA into a cell and watch ribosomes assemble neutralising antibodies without inflammation."
  },
  {
    id: "literature-jon-fosse",
    year: "2023",
    field: "Literature",
    laureates: "Jon Fosse",
    title: "Giving Voice to the Unsayable",
    citation: "For his innovative plays and prose which give voice to the unsayable.",
    icon: "🎭",
    summary: "Fosse's minimalist plays and novels in Nynorsk capture the haunting human depths that ordinary words cannot contain. Using pauses, rhythmic cadence, and everyday dialogue, his work opens a transcendental space of quiet connection.",
    audienceKid: "Sometimes the most meaningful moments happen not when someone is talking loud, but during the gentle quiet pauses between words when you feel understood.",
    didYouKnow: "Fosse is among the most performed contemporary playwrights in Europe, often hailed as the modern Samuel Beckett.",
    image: "assets/illustrations/literature-jon-fosse.svg",
    demoType: "stage-pause",
    demoTitle: "Theatre of Silence & Cadence",
    demoDesc: "Control theatrical stage lighting and explore how cadence, pauses, and repetition evoke profound emotions."
  },
  {
    id: "peace-narges-mohammadi",
    year: "2023",
    field: "Peace",
    laureates: "Narges Mohammadi",
    title: "Woman, Life, Freedom in Iran",
    citation: "For her fight against the oppression of women in Iran and her fight for human rights and freedom for all.",
    icon: "✊",
    summary: "Mohammadi is a physicist, journalist, and vice-president of the Defenders of Human Rights Center in Iran. Despite suffering 13 arrests, five convictions, and decades behind bars in Evin Prison, she continues organizing civil disobedience for human dignity.",
    audienceKid: "A brave woman who stood up for every girl's right to learn, speak, and choose her own life, even when unfair leaders locked her in prison.",
    didYouKnow: "Her twin teenage children accepted the Nobel Peace Prize on her behalf in Oslo, reading a speech she smuggled out from behind prison bars.",
    image: "assets/illustrations/peace-narges-mohammadi.svg",
    demoType: "unite-chorus",
    demoTitle: "The Solidarity Chorus",
    demoDesc: "Add solidarity voices from across the world to amplify the call for freedom and dismantle metaphorical oppression barriers."
  },
  {
    id: "economic-sciences-claudia-goldin",
    year: "2023",
    field: "Economic Sciences",
    laureates: "Claudia Goldin",
    title: "Two Centuries of Women in the Labour Market",
    citation: "For having uncovered key drivers of gender differences in the labour market.",
    icon: "📊",
    summary: "Goldin trawled through 200 years of historical US archives to chart the revolutionary U-shaped curve of female labor participation. She revealed how marriage bars, the contraceptive pill, parental leave, and 'greedy work' hours drive the gender wage gap.",
    audienceKid: "She looked at history books over 200 years to figure out why moms and women weren't always paid fairly, helping make workplaces fairer for everyone!",
    didYouKnow: "Claudia Goldin was the first woman ever to be granted tenured professorship in Harvard University's economics department.",
    image: "assets/illustrations/economic-sciences-claudia-goldin.svg",
    demoType: "goldin-curve",
    demoTitle: "The 200-Year U-Curve & Wage Gap Simulator",
    demoDesc: "Scrub across 1820–2026 to see how agriculture, industrial factories, the contraceptive pill, and flexible work affect female labor participation."
  }
];

const fields = ['All', '2025', '2024', '2023', 'Physics', 'Chemistry', 'Medicine', 'Literature', 'Peace', 'Economic Sciences'];
let active = 'All';
let audienceMode = 'accessible'; // 'accessible' | 'kids' | 'deep'
let currentPrizeIndex = null;

const grid = document.querySelector('#grid');
const filters = document.querySelector('#filters');

// Initialise filters
filters.innerHTML = fields.map(x => `<button class="filter ${x === 'All' ? 'active' : ''}" data-filter="${x}">${x}</button>`).join('');

filters.onclick = e => {
  if (!e.target.dataset.filter) return;
  active = e.target.dataset.filter;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b.dataset.filter === active));
  render();
};

document.querySelector('#search').oninput = render;

function render() {
  const q = document.querySelector('#search').value.toLowerCase().trim();
  const shown = prizes.filter(p => {
    const matchCat = (active === 'All' || p.year === active || p.field === active);
    const textCorpus = `${p.year} ${p.field} ${p.laureates} ${p.title} ${p.citation} ${p.summary}`.toLowerCase();
    return matchCat && textCorpus.includes(q);
  });

  grid.innerHTML = shown.map(p => {
    const key = prizes.indexOf(p);
    return `
      <article class="card" tabindex="0" data-key="${key}">
        <div class="card-media">
          <img src="${p.image}" alt="${p.title} visual exhibit" loading="lazy" class="card-img" />
          <div class="card-pill-bar">
            <span class="badge ${p.field.toLowerCase().replace(/[^a-z]/g, '-')}">${p.field}</span>
            <span class="year">${p.year}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-header-row">
            <span class="icon-emoji">${p.icon}</span>
            <h3 class="card-title">${p.title}</h3>
          </div>
          <p class="card-laureates">${p.laureates}</p>
          <p class="card-snippet">${p.citation}</p>
          <div class="card-footer-cta">
            <span>Explore Exhibit →</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelector('#empty').hidden = shown.length > 0;

  grid.querySelectorAll('.card').forEach(c => {
    c.onclick = () => open(+c.dataset.key);
    c.onkeydown = e => e.key === 'Enter' && open(+c.dataset.key);
  });
}

function open(i) {
  currentPrizeIndex = i;
  const p = prizes[i];
  const d = document.querySelector('#detail');
  
  const audienceText = audienceMode === 'kids' 
    ? `<div class="audience-bubble kid-bubble"><b>🎈 FOR CURIOUS KIDS & AUDIENCES:</b> ${p.audienceKid}</div>`
    : audienceMode === 'deep'
    ? `<div class="audience-bubble deep-bubble"><b>🎓 OFFICIAL CITATION:</b> "${p.citation}"<br><br><b>DEEP DIVE:</b> ${p.summary}</div>`
    : `<p class="lede">${p.summary}</p>`;

  d.innerHTML = `
    <div class="detail-inner">
      <div class="detail-story">
        <div class="detail-top-nav">
          <button class="close-btn" id="closeDetail" title="Back to gallery">← Back to breakthroughs</button>
          <div class="eyebrow">EXHIBIT #${String(i + 1).padStart(2, '0')} · ${p.year} ${p.field.toUpperCase()}</div>
        </div>
        
        <h2>${p.icon} ${p.title}</h2>
        <div class="laureates-bar">
          <span class="laureates-label">Laureates:</span>
          <strong>${p.laureates}</strong>
        </div>

        <div class="audience-switcher" role="radiogroup" aria-label="Audience view">
          <span class="switch-title">Explainer Mode:</span>
          <button class="mode-btn ${audienceMode === 'accessible' ? 'active' : ''}" data-mode="accessible">🌱 Friendly</button>
          <button class="mode-btn ${audienceMode === 'kids' ? 'active' : ''}" data-mode="kids">🎈 Kids & Simple</button>
          <button class="mode-btn ${audienceMode === 'deep' ? 'active' : ''}" data-mode="deep">🔬 Deep Dive</button>
        </div>

        <div id="audienceContent">${audienceText}</div>

        <div class="did-you-know">
          <div class="dyk-icon">💡</div>
          <div class="dyk-text">
            <strong>Fun Fact & Real-World Impact:</strong>
            <p>${p.didYouKnow}</p>
          </div>
        </div>

        <div class="story-actions">
          <a class="source-link" href="https://www.nobelprize.org/prizes/${p.field.toLowerCase().replace('economic sciences','economic-sciences')}/${p.year}/summary/" target="_blank" rel="noopener">
            Read Official Nobel Summary ↗
          </a>
        </div>
      </div>

      <div class="exhibit-panel">
        <div class="exhibit-hero-image">
          <img src="${p.image}" alt="${p.title} diagram" id="exhibitImg" />
          <div class="exhibit-badge">Interactive Simulation</div>
        </div>
        
        <div class="interactive-console">
          <div class="console-header">
            <h3>⚡ ${p.demoTitle}</h3>
            <p class="console-desc">${p.demoDesc}</p>
          </div>
          
          <div id="interactiveDemo" class="demo-arena"></div>
        </div>
      </div>
    </div>
  `;

  // Hook up mode buttons
  d.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
      audienceMode = btn.dataset.mode;
      open(currentPrizeIndex);
    };
  });

  // Hook up close
  const closeBtn = d.querySelector('#closeDetail');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Mount the customized interactive exhibit
  mountInteractiveExhibit(p);

  location.hash = 'detail';
  d.scrollIntoView({ behavior: 'smooth' });
}

function mountInteractiveExhibit(p) {
  const arena = document.querySelector('#interactiveDemo');
  if (!arena) return;

  switch (p.demoType) {
    case 'energy':
      mountQuantumCircuits(arena);
      break;
    case 'mof':
      mountMOF(arena);
      break;
    case 'immune':
      mountImmuneTreg(arena);
      break;
    case 'stream':
      mountLiteratureStream(arena);
      break;
    case 'ballot':
      mountDemocracyPillars(arena);
      break;
    case 'creative-destruction':
      mountCreativeDestruction(arena);
      break;
    case 'nn-train':
      mountHopfieldAI(arena);
      break;
    case 'protein-fold':
      mountAlphaFold(arena);
      break;
    case 'microrna-dial':
      mountMicroRNA(arena);
      break;
    case 'poetic-metaphor':
      mountPoeticLens(arena);
      break;
    case 'crane-ripple':
      mountPeaceCrane(arena);
      break;
    case 'institutions-toggle':
      mountInstitutions(arena);
      break;
    case 'attosecond-shutter':
      mountAttosecond(arena);
      break;
    case 'quantum-dot-size':
      mountQuantumDots(arena);
      break;
    case 'mrna-synthesis':
      mountMRNAVaccine(arena);
      break;
    case 'stage-pause':
      mountFosseStage(arena);
      break;
    case 'unite-chorus':
      mountMohammadiChorus(arena);
      break;
    case 'goldin-curve':
      mountGoldinCurve(arena);
      break;
    default:
      mountGenericInteractive(arena, p);
  }
}

// 1. Quantum Circuits
function mountQuantumCircuits(container) {
  let level = 2;
  let tunneling = false;
  
  function update() {
    container.innerHTML = `
      <div class="control-row">
        <label>Quantum Energy State: <b>Level ${level} (n=${level})</b></label>
        <div class="btn-group">
          ${[1,2,3,4].map(n => `<button class="step-btn ${n === level ? 'active' : ''}" data-lvl="${n}">n = ${n}</button>`).join('')}
        </div>
      </div>
      <div class="circuit-visual">
        <div class="potential-well">
          <div class="barrier" style="left: 48%; width: 14px; height: 100px;">
            <span class="barrier-label">Josephson Barrier</span>
          </div>
          <div class="quantum-wave ${tunneling ? 'tunnel-pulse' : ''}" style="bottom: ${level * 22}px; height: ${level * 6 + 10}px;">
            <span class="wave-text">Ψ(x) Energy: ${(level * 4.9).toFixed(1)} GHz</span>
          </div>
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="fireTunnel">⚡ Trigger Macroscopic Tunneling</button>
        <div class="status-msg" id="qStatus">${tunneling ? 'Tunneling! Current observed through insulator without voltage drop.' : 'Wavepacket bounded in potential well.'}</div>
      </div>
    `;
    container.querySelectorAll('.step-btn').forEach(b => {
      b.onclick = () => { level = +b.dataset.lvl; tunneling = false; update(); };
    });
    const fireBtn = container.querySelector('#fireTunnel');
    if (fireBtn) {
      fireBtn.onclick = () => {
        tunneling = true;
        update();
        setTimeout(() => {
          tunneling = false;
          const status = container.querySelector('#qStatus');
          if (status) status.textContent = "Tunneling event recorded! Quantum phase superposition maintained.";
        }, 1800);
      };
    }
  }
  update();
}

// 2. MOFs
function mountMOF(container) {
  let poreSize = 12; // Angstroms
  let co2Trapped = 0;
  
  function update() {
    container.innerHTML = `
      <div class="control-row">
        <label>Pore Aperture: <b>${poreSize} Å</b> (Target CO₂ diameter: 3.3 Å)</label>
        <input type="range" id="poreSlider" min="3" max="25" value="${poreSize}" class="range-slider">
      </div>
      <div class="mof-chamber">
        <div class="mof-grid-visual" style="gap: ${poreSize * 2}px;">
          ${Array(9).fill(0).map((_, i) => `
            <div class="mof-cage">
              <span class="metal-joint">●</span>
              <div class="cage-contents">${i < co2Trapped ? '<span class="co2-dot animate-pop">CO₂</span>' : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="pumpGas">💨 Pump Gas Through Sponge</button>
        <button class="secondary-btn" id="purgeGas">Release / Regenerate</button>
        <div class="status-msg">Captured: <b>${co2Trapped} / 9</b> cages full. ${poreSize >= 10 && poreSize <= 16 ? '✨ Optimal pore affinity for selective carbon capture!' : '⚠️ Aperture suboptimal for selective capture.'}</div>
      </div>
    `;
    const slider = container.querySelector('#poreSlider');
    if (slider) {
      slider.oninput = (e) => {
        poreSize = +e.target.value;
        update();
      };
    }
    const pump = container.querySelector('#pumpGas');
    if (pump) {
      pump.onclick = () => {
        if (poreSize >= 8 && poreSize <= 18) {
          co2Trapped = Math.min(9, co2Trapped + 3);
        } else {
          co2Trapped = Math.min(9, co2Trapped + 1);
        }
        update();
      };
    }
    const purge = container.querySelector('#purgeGas');
    if (purge) {
      purge.onclick = () => {
        co2Trapped = 0;
        update();
      };
    }
  }
  update();
}

// 3. Immune Tregs
function mountImmuneTreg(container) {
  let tregs = 2;
  let inflammation = 65;
  
  function update() {
    const isSafe = inflammation < 40;
    container.innerHTML = `
      <div class="control-row">
        <label>Regulatory T-Cells (Tregs): <b>${tregs}</b> active defenders</label>
        <div class="btn-group">
          <button class="primary-btn" id="addTreg">➕ Add Foxp3+ Treg</button>
          <button class="secondary-btn" id="stressImmune">⚠️ Induce Autoimmune Flare</button>
        </div>
      </div>
      <div class="tissue-dish">
        <div class="dish-header">
          <span>Healthy Pancreas / Joint Tissue</span>
          <span class="dish-status ${isSafe ? 'status-calm' : 'status-danger'}">Inflammation: ${inflammation}%</span>
        </div>
        <div class="cells-grid">
          ${Array(12).fill(0).map((_, i) => `
            <div class="tissue-cell ${i % 3 === 0 && !isSafe ? 'inflamed' : ''}">
              ${i < tregs ? '<span class="treg-badge">Treg</span>' : 'Self'}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">${isSafe ? '🟢 Immune balance achieved: Tregs suppress self-reactive T cells.' : '🔴 Autoimmune attack! Killer cells attacking self-tissue. Add Tregs!'}</div>
      </div>
    `;
    const addBtn = container.querySelector('#addTreg');
    if (addBtn) {
      addBtn.onclick = () => {
        tregs = Math.min(6, tregs + 1);
        inflammation = Math.max(10, inflammation - 22);
        update();
      };
    }
    const flareBtn = container.querySelector('#stressImmune');
    if (flareBtn) {
      flareBtn.onclick = () => {
        inflammation = Math.min(100, inflammation + 30);
        update();
      };
    }
  }
  update();
}

// 4. Literature - Krasznahorkai
function mountLiteratureStream(container) {
  const phrases = [
    "…and looking out across the desolate rainswept plains,",
    "where the mud clung to boots like forgotten centuries,",
    "he felt a strange, immovable silence settling over the village,",
    "not as an absence of life, but as an overwhelming fullness of time,",
    "in which each raindrop seemed to articulate an unyielding moral question,",
    "that art alone possessed the quiet audacity to address."
  ];
  let revealed = 2;

  function update() {
    container.innerHTML = `
      <div class="prose-scroll-box">
        <div class="quill-indicator">✒️ Continuous Stream</div>
        <div class="sentences-flow">
          ${phrases.slice(0, revealed).map((line, idx) => `
            <span class="prose-segment ${idx === revealed - 1 ? 'just-added' : ''}">${line} </span>
          `).join('')}
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="nextSentence" ${revealed >= phrases.length ? 'disabled' : ''}>
          ${revealed >= phrases.length ? 'Stream Finished' : '✒️ Unfurl Next Thought'}
        </button>
        <button class="secondary-btn" id="resetProse">Restart Flow</button>
        <div class="status-msg">Sentences: <b>1 unbroken sentence</b> (${phrases.slice(0, revealed).join(' ').split(' ').length} words).</div>
      </div>
    `;
    const nextBtn = container.querySelector('#nextSentence');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (revealed < phrases.length) {
          revealed++;
          update();
        }
      };
    }
    const rst = container.querySelector('#resetProse');
    if (rst) {
      rst.onclick = () => { revealed = 2; update(); };
    }
  }
  update();
}

// 5. Peace - Machado
function mountDemocracyPillars(container) {
  let turnout = 85;
  let ballotAudit = 94;
  let courtIndependence = 80;

  function update() {
    const score = Math.round((turnout * 0.35) + (ballotAudit * 0.4) + (courtIndependence * 0.25));
    container.innerHTML = `
      <div class="democracy-sliders">
        <div class="control-row">
          <label>Voter Participation: <b>${turnout}%</b></label>
          <input type="range" class="range-slider" id="turnoutRange" min="20" max="100" value="${turnout}">
        </div>
        <div class="control-row">
          <label>Citizen Ballot Paperwork Audit: <b>${ballotAudit}%</b></label>
          <input type="range" class="range-slider" id="auditRange" min="20" max="100" value="${ballotAudit}">
        </div>
        <div class="control-row">
          <label>Rule of Law & Independent Courts: <b>${courtIndependence}%</b></label>
          <input type="range" class="range-slider" id="courtRange" min="20" max="100" value="${courtIndependence}">
        </div>
      </div>
      <div class="democracy-score-card">
        <div class="score-number">${score} / 100</div>
        <div class="score-desc">
          <strong>Democratic Resilience Index:</strong>
          <span>${score > 75 ? '🌟 High Democratic Integrity & Citizen Empowerment' : score > 50 ? '⚠️ Contested Rights — Citizen vigilance required' : '🚨 Authoritarian Vulnerability'}</span>
        </div>
      </div>
    `;
    const bind = (id, setter) => {
      const el = container.querySelector(id);
      if (el) el.oninput = (e) => { setter(+e.target.value); update(); };
    };
    bind('#turnoutRange', v => turnout = v);
    bind('#auditRange', v => ballotAudit = v);
    bind('#courtRange', v => courtIndependence = v);
  }
  update();
}

// 6. Growth - Creative Destruction
function mountCreativeDestruction(container) {
  let techWave = 1;
  const waves = [
    { name: "Steam Engine & Loom", gdp: 100, displaced: "Hand-weavers" },
    { name: "Electrification & Assembly Lines", gdp: 240, displaced: "Steam locomotives" },
    { name: "Microprocessors & Personal Computers", gdp: 680, displaced: "Typewriters" },
    { name: "Green Energy & Artificial Intelligence", gdp: 1850, displaced: "Fossil-fuel boilers" }
  ];

  function update() {
    const curr = waves[techWave - 1];
    container.innerHTML = `
      <div class="cd-visual">
        <div class="wave-stage">
          <div class="gdp-bar-wrap">
            <label>Economic Output (GDP Index):</label>
            <div class="gdp-meter"><div class="gdp-fill" style="width: ${(curr.gdp / 2000) * 100}%;"><b>${curr.gdp}</b></div></div>
          </div>
          <div class="paradigm-box">
            <span class="paradigm-title">Current Tech Paradigm (Wave ${techWave}/4):</span>
            <h4>${curr.name}</h4>
            <div class="replaced-note">💥 Creative Destruction: Replaced <i>${curr.displaced}</i></div>
          </div>
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="investRD" ${techWave >= waves.length ? 'disabled' : ''}>🚀 Invest in Next Innovation Leap</button>
        <button class="secondary-btn" id="resetCD">Reset Era</button>
        <div class="status-msg">Aghion-Howitt dynamic: Growth is fueled by creative turnover.</div>
      </div>
    `;
    const btn = container.querySelector('#investRD');
    if (btn) {
      btn.onclick = () => {
        if (techWave < waves.length) { techWave++; update(); }
      };
    }
    const rst = container.querySelector('#resetCD');
    if (rst) {
      rst.onclick = () => { techWave = 1; update(); };
    }
  }
  update();
}

// 7. Hopfield Neural Network
function mountHopfieldAI(container) {
  // 5x5 pattern of letter 'A'
  const targetPattern = [
    0,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1
  ];
  let currentPattern = [...targetPattern];

  function update() {
    container.innerHTML = `
      <div class="ai-hopfield-wrap">
        <div class="hopfield-grid">
          ${currentPattern.map((bit, idx) => `
            <div class="pixel ${bit ? 'active' : ''}" data-idx="${idx}"></div>
          `).join('')}
        </div>
        <div class="hopfield-controls">
          <p>Click pixels to corrupt with noise, or use the quick buttons below:</p>
          <button class="secondary-btn" id="addNoise">🎲 Corrupt with 40% Noise</button>
          <button class="primary-btn" id="runEnergyMin">🧠 Run Hopfield Energy Minimization</button>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg" id="aiStatus">Pattern matches stored 'A': ${JSON.stringify(currentPattern) === JSON.stringify(targetPattern) ? '✅ 100% (Energy Minimum)' : '⚠️ Distorted Pattern'}</div>
      </div>
    `;
    container.querySelectorAll('.pixel').forEach(px => {
      px.onclick = () => {
        const i = +px.dataset.idx;
        currentPattern[i] = currentPattern[i] ? 0 : 1;
        update();
      };
    });
    const noise = container.querySelector('#addNoise');
    if (noise) {
      noise.onclick = () => {
        currentPattern = currentPattern.map(bit => Math.random() > 0.65 ? (bit ? 0 : 1) : bit);
        update();
      };
    }
    const run = container.querySelector('#runEnergyMin');
    if (run) {
      run.onclick = () => {
        container.querySelector('#aiStatus').textContent = "Thinking... Traversing energy valleys...";
        setTimeout(() => {
          currentPattern = [...targetPattern];
          update();
        }, 500);
      };
    }
  }
  update();
}

// 8. Protein Folding (Baker & AlphaFold)
function mountAlphaFold(container) {
  let folded = false;
  let mutated = false;

  function update() {
    container.innerHTML = `
      <div class="protein-arena">
        <div class="folding-visual ${folded ? 'is-folded' : 'is-denatured'}">
          <div class="amino-chain">
            <span class="bead met">Met</span>
            <span class="bead glu">Glu</span>
            <span class="bead cys">Cys</span>
            <span class="bead leu">Leu</span>
            <span class="bead ${mutated ? 'mut' : 'arg'}">${mutated ? 'Trp' : 'Arg'}</span>
            <span class="bead lys">Lys</span>
          </div>
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="foldBtn">${folded ? '↺ Unfold Chain' : '✨ Predict & Fold with AlphaFold'}</button>
        <button class="secondary-btn" id="mutateBtn">${mutated ? 'Revert Sequence' : '🧬 Mutate Residue 5'}</button>
        <div class="status-msg">Confidence Score (pLDDT): <b>${folded ? (mutated ? '88.4 (Altered Binding Pocket)' : '96.2 (Very High Confidence)') : '32.1 (Unstructured)'}</b></div>
      </div>
    `;
    const fBtn = container.querySelector('#foldBtn');
    if (fBtn) fBtn.onclick = () => { folded = !folded; update(); };
    const mBtn = container.querySelector('#mutateBtn');
    if (mBtn) mBtn.onclick = () => { mutated = !mutated; update(); };
  }
  update();
}

// 9. microRNA dial
function mountMicroRNA(container) {
  let mirnaLevel = 3; // 1 to 5

  function update() {
    const proteinOutput = Math.max(10, 100 - (mirnaLevel * 18));
    container.innerHTML = `
      <div class="control-row">
        <label>MicroRNA Concentration: <b>Level ${mirnaLevel}</b></label>
        <input type="range" class="range-slider" id="mirnaSlider" min="1" max="5" value="${mirnaLevel}">
      </div>
      <div class="mrna-reg-visual">
        <div class="mrna-track">
          <div class="mrna-strand">mRNA Transcript (Blueprint)</div>
          <div class="mirna-locks">
            ${Array(mirnaLevel).fill(0).map(() => `<span class="mirna-block animate-drop">🔒 miRNA</span>`).join('')}
          </div>
        </div>
        <div class="ribosome-meter">
          <label>Protein Output Synthesis:</label>
          <div class="gdp-meter"><div class="gdp-fill" style="width: ${proteinOutput}%; background: ${proteinOutput > 50 ? '#d7f26b' : '#ff765f'};"><b>${proteinOutput}%</b></div></div>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">MicroRNAs bind the 3' UTR region to suppress translation without destroying genetic code.</div>
      </div>
    `;
    const s = container.querySelector('#mirnaSlider');
    if (s) {
      s.oninput = (e) => { mirnaLevel = +e.target.value; update(); };
    }
  }
  update();
}

// 10. Han Kang Lens
function mountPoeticLens(container) {
  const lenses = [
    { title: "Memory", quote: "“Even in the dark, memories carry an irrepressible warmth, like water seeping into dry roots.”" },
    { title: "The Body", quote: "“A human being’s skin is impossibly thin, yet it carries the entire burden of history without tearing completely.”" },
    { title: "Tenderness", quote: "“Can we preserve tenderness when everything around us insists upon cold indifference?”" }
  ];
  let currentLens = 0;

  function update() {
    const l = lenses[currentLens];
    container.innerHTML = `
      <div class="btn-group">
        ${lenses.map((lens, idx) => `<button class="step-btn ${idx === currentLens ? 'active' : ''}" data-lens="${idx}">${lens.title}</button>`).join('')}
      </div>
      <div class="quote-display">
        <p class="poetic-text">${l.quote}</p>
      </div>
      <div class="action-footer">
        <div class="status-msg">Han Kang’s poetic prose transforms unbearable historical grief into quiet, luminous empathy.</div>
      </div>
    `;
    container.querySelectorAll('.step-btn').forEach(b => {
      b.onclick = () => { currentLens = +b.dataset.lens; update(); };
    });
  }
  update();
}

// 11. Nihon Hidankyo - Peace Crane
function mountPeaceCrane(container) {
  let ripples = 3;

  function update() {
    container.innerHTML = `
      <div class="crane-arena">
        <div class="crane-badge-center">
          <span class="huge-crane">🕊️</span>
          <span class="crane-caption">Hibakusha Voice</span>
        </div>
        <div class="ripples-visual">
          ${Array(ripples).fill(0).map((_, i) => `
            <div class="ripple-ring" style="width: ${(i + 1) * 70}px; height: ${(i + 1) * 70}px; animation-delay: ${i * 0.4}s;"></div>
          `).join('')}
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="expandRipple">✨ Fold a Peace Crane & Share Testimony</button>
        <div class="status-msg">Ripples active: <b>${ripples * 120} survivor testimonies</b> shared with global treaties.</div>
      </div>
    `;
    const btn = container.querySelector('#expandRipple');
    if (btn) {
      btn.onclick = () => { ripples = Math.min(6, ripples + 1); update(); };
    }
  }
  update();
}

// 12. Institutions
function mountInstitutions(container) {
  let mode = 'inclusive'; // 'inclusive' | 'extractive'

  function update() {
    const isInc = mode === 'inclusive';
    container.innerHTML = `
      <div class="btn-group">
        <button class="step-btn ${isInc ? 'active' : ''}" id="setInc">🏛️ Inclusive Society</button>
        <button class="step-btn ${!isInc ? 'active' : ''}" id="setExt">👑 Extractive Monopoly</button>
      </div>
      <div class="institution-metrics">
        <div class="metric-row">
          <span>Patent & Innovation Access:</span>
          <b>${isInc ? 'High (Open to all citizens)' : 'Restricted (Granted to regime elites)'}</b>
        </div>
        <div class="metric-row">
          <span>Property Rights & Law:</span>
          <b>${isInc ? 'Equal protection under courts' : 'Arbitrary confiscation risk'}</b>
        </div>
        <div class="metric-row">
          <span>Long-Term Prosperity:</span>
          <b style="color: ${isInc ? '#d7f26b' : '#ff765f'};">${isInc ? 'Sustained Broad Growth ($58,000 GDP/capita)' : 'Stagnation & Brain Drain ($4,200 GDP/capita)'}</b>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">${isInc ? 'Inclusive rules distribute power broadly and reward talent.' : 'Extractive rules funnel wealth to a ruling few, deterring long-term investment.'}</div>
      </div>
    `;
    const incBtn = container.querySelector('#setInc');
    if (incBtn) incBtn.onclick = () => { mode = 'inclusive'; update(); };
    const extBtn = container.querySelector('#setExt');
    if (extBtn) extBtn.onclick = () => { mode = 'extractive'; update(); };
  }
  update();
}

// 13. Attosecond Shutter
function mountAttosecond(container) {
  let shutterSpeed = 100; // attoseconds

  function update() {
    const isSharp = shutterSpeed < 200;
    container.innerHTML = `
      <div class="control-row">
        <label>Laser Pulse Duration: <b>${shutterSpeed} Attoseconds</b> (10⁻¹⁸ s)</label>
        <input type="range" class="range-slider" id="attoSlider" min="50" max="1000" step="50" value="${shutterSpeed}">
      </div>
      <div class="atto-camera-view">
        <div class="electron-orbit-box">
          <div class="core-nucleus"></div>
          <div class="orbit-path">
            <div class="electron-particle ${isSharp ? 'sharp' : 'motion-blurred'}"></div>
          </div>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">${isSharp ? '📸 Crisp Capture! Electron motion frozen in real-time mid-orbit.' : '⚠️ Motion blur! Shutter too slow to capture electron quantum jump.'}</div>
      </div>
    `;
    const s = container.querySelector('#attoSlider');
    if (s) s.oninput = (e) => { shutterSpeed = +e.target.value; update(); };
  }
  update();
}

// 14. Quantum Dots
function mountQuantumDots(container) {
  let diameter = 3.5; // nm

  function update() {
    let colorName = 'Green';
    let hexColor = '#10b981';
    let wavelength = '520 nm';
    if (diameter < 3.0) {
      colorName = 'Vibrant Blue';
      hexColor = '#3b82f6';
      wavelength = '450 nm';
    } else if (diameter > 4.8) {
      colorName = 'Deep Red';
      hexColor = '#ef4444';
      wavelength = '630 nm';
    }
    container.innerHTML = `
      <div class="control-row">
        <label>Nanocrystal Diameter: <b>${diameter.toFixed(1)} nm</b></label>
        <input type="range" class="range-slider" id="dotSlider" min="2.0" max="6.5" step="0.1" value="${diameter}">
      </div>
      <div class="qd-emission-box">
        <div class="qd-bead" style="width: ${diameter * 14}px; height: ${diameter * 14}px; background: ${hexColor}; box-shadow: 0 0 25px ${hexColor};"></div>
        <div class="qd-spec">
          <strong>Emitted Light: ${colorName}</strong>
          <span>Peak Wavelength: ${wavelength}</span>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">Smaller dots confine electrons tighter, forcing them to emit higher-energy (bluer) photons!</div>
      </div>
    `;
    const s = container.querySelector('#dotSlider');
    if (s) s.oninput = (e) => { diameter = +e.target.value; update(); };
  }
  update();
}

// 15. mRNA Vaccines
function mountMRNAVaccine(container) {
  let isModified = true;

  function update() {
    container.innerHTML = `
      <div class="btn-group">
        <button class="step-btn ${isModified ? 'active' : ''}" id="setMod">🧪 Pseudouridine (Ψ) Modified mRNA</button>
        <button class="step-btn ${!isModified ? 'active' : ''}" id="setUnmod">❌ Unmodified RNA</button>
      </div>
      <div class="mrna-cell-chamber">
        <div class="cell-status-bar">
          <span>Innate Immunity Receptor (TLR):</span>
          <b style="color: ${isModified ? '#d7f26b' : '#ff765f'};">${isModified ? 'Passed undetected (Tolerated)' : '🚨 Alarmed! Destroying RNA'}</b>
        </div>
        <div class="antibody-yield">
          <span>Neutralizing Antibodies Produced:</span>
          <div class="gdp-meter"><div class="gdp-fill" style="width: ${isModified ? 95 : 5}%; background: ${isModified ? '#d7f26b' : '#ff765f'};"><b>${isModified ? '95% (High Protection)' : '0%'}</b></div></div>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">${isModified ? 'Karikó & Weissman breakthrough: Chemical tweak Ψ lets mRNA work safely!' : 'Without base modification, human immune defenses shred mRNA before ribosomes can read it.'}</div>
      </div>
    `;
    const m = container.querySelector('#setMod');
    if (m) m.onclick = () => { isModified = true; update(); };
    const u = container.querySelector('#setUnmod');
    if (u) u.onclick = () => { isModified = false; update(); };
  }
  update();
}

// 16. Jon Fosse Stage
function mountFosseStage(container) {
  let pauseDuration = 3;

  function update() {
    container.innerHTML = `
      <div class="control-row">
        <label>Stage Pause Duration: <b>${pauseDuration} beats</b></label>
        <input type="range" class="range-slider" id="pauseSlider" min="1" max="6" value="${pauseDuration}">
      </div>
      <div class="stage-visual">
        <div class="stage-dialogue">
          <p class="actor-a">“Are you still there?”</p>
          <div class="stage-silence">${'· '.repeat(pauseDuration * 2)} (Silence)</div>
          <p class="actor-b">“Yes. I have always been here.”</p>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">In Fosse’s writing, the deepest truths live in the silence between spoken syllables.</div>
      </div>
    `;
    const s = container.querySelector('#pauseSlider');
    if (s) s.oninput = (e) => { pauseDuration = +e.target.value; update(); };
  }
  update();
}

// 17. Narges Mohammadi Chorus
function mountMohammadiChorus(container) {
  let voices = 4;

  function update() {
    container.innerHTML = `
      <div class="chorus-arena">
        <div class="chorus-voices-wrap">
          ${Array(voices).fill(0).map((_, i) => `
            <div class="voice-avatar animate-pop">✊ <span>Voice #${i + 1}</span></div>
          `).join('')}
        </div>
        <div class="prison-bar-status">
          <span>Oppression Barrier Integrity:</span>
          <div class="gdp-meter"><div class="gdp-fill" style="width: ${Math.max(5, 100 - voices * 12)}%; background: #ff765f;"></div></div>
        </div>
      </div>
      <div class="action-footer">
        <button class="primary-btn" id="joinChorus">📣 Add Solidarity Voice</button>
        <button class="secondary-btn" id="resetChorus">Reset</button>
        <div class="status-msg">Total international voices standing with Narges Mohammadi: <b>${voices * 25000}</b></div>
      </div>
    `;
    const j = container.querySelector('#joinChorus');
    if (j) j.onclick = () => { voices = Math.min(10, voices + 1); update(); };
    const r = container.querySelector('#resetChorus');
    if (r) r.onclick = () => { voices = 4; update(); };
  }
  update();
}

// 18. Claudia Goldin Curve
function mountGoldinCurve(container) {
  let year = 1970;

  function update() {
    let participation = 45;
    let desc = "Pill introduction & college boom";
    if (year < 1870) {
      participation = 60 - ((year - 1820) * 0.4);
      desc = "Agrarian home economy; high female family involvement.";
    } else if (year < 1920) {
      participation = 40 - ((year - 1870) * 0.2);
      desc = "Industrial factory migration; marriage bars discouraged wives working.";
    } else if (year < 1970) {
      participation = 30 + ((year - 1920) * 0.4);
      desc = "Rise of clerical work and secondary schooling.";
    } else {
      participation = 50 + ((year - 1970) * 0.45);
      desc = "Modern careers, professional degrees, though 'greedy work' hours persist.";
    }

    container.innerHTML = `
      <div class="control-row">
        <label>Historical Year: <b>${year}</b></label>
        <input type="range" class="range-slider" id="yearSlider" min="1820" max="2026" step="5" value="${year}">
      </div>
      <div class="goldin-chart">
        <div class="goldin-curve-track">
          <div class="curve-pointer" style="left: ${((year - 1820) / (2026 - 1820)) * 100}%; bottom: ${participation}%;">
            <span class="pointer-bubble">${Math.round(participation)}%</span>
          </div>
        </div>
        <div class="era-note">
          <strong>Era Context (${year}):</strong>
          <p>${desc}</p>
        </div>
      </div>
      <div class="action-footer">
        <div class="status-msg">Goldin’s U-shaped curve demonstrated that economic growth does not automatically raise female employment linearly.</div>
      </div>
    `;
    const s = container.querySelector('#yearSlider');
    if (s) s.oninput = (e) => { year = +e.target.value; update(); };
  }
  update();
}

// Generic fallback if needed
function mountGenericInteractive(container, p) {
  container.innerHTML = `
    <div class="generic-demo">
      <button class="primary-btn" id="runGeneric">Run Interactive Exhibit</button>
      <div class="status-msg" id="genStatus">Ready to test model.</div>
    </div>
  `;
  container.querySelector('#runGeneric').onclick = () => {
    container.querySelector('#genStatus').textContent = "Model executed: Breakthrough demonstrated!";
  };
}

// Start
render();