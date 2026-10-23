/*
 * Inside Legal AI — research model
 *
 * This file intentionally distinguishes vendor-stated capabilities from a
 * plausible implementation reconstruction. Product claims are linked to the
 * vendor source list rendered in the UI; proprietary internals are not implied.
 */
window.LEGAL_AI_GUIDE = {
  researchDate: '23 October 2026',
  sources: [
    {
      id: 'ds-automation',
      system: 'Docusign',
      title: 'What Is AI Contract Automation and How Does It Work?',
      url: 'https://www.docusign.com/learn/what-is-ai-contract-automation',
      date: '15 Oct 2026',
      note: 'OCR intake, extraction, structured agreement data, and Iris overview.'
    },
    {
      id: 'ds-review',
      system: 'Docusign',
      title: 'New AI Contract Review & Playbook Review Tools',
      url: 'https://www.docusign.com/releases/march-2026',
      date: '25 Mar 2026',
      note: 'AI-Assisted Review, generated playbooks, conversational redlining, and review workflow.'
    },
    {
      id: 'ds-manager',
      system: 'Docusign',
      title: 'Docusign Agreement Manager: Intelligent Agreement Repository',
      url: 'https://www.docusign.com/products/platform/navigator',
      date: '15 Jan 2026',
      note: 'Agreement Manager (formerly Navigator), custom extractions, reports, access controls, and audit features.'
    },
    {
      id: 'ds-iris',
      system: 'Docusign',
      title: 'Docusign Iris: the AI Behind Intelligent Agreement Management',
      url: 'https://www.docusign.com/en-gb/blog/docusign-iris-agreement-ai',
      date: '16 Apr 2025',
      note: 'Iris as agreement AI; AI-assisted review, custom extraction, and obligation tracking.'
    },
    {
      id: 'eve-platform',
      system: 'Eve',
      title: 'EveOS — AI Platform for Plaintiff Law Firms',
      url: 'https://www.eve.legal/platform',
      date: '18 Jun 2026',
      note: 'Atlas, Agents, Auditor, Analyst, Intake, research, integrations, and human-controlled workflows.'
    },
    {
      id: 'eve-agents',
      system: 'Eve',
      title: 'What Are AI Agents for Law Firms?',
      url: 'https://www.eve.legal/blogs/ai-agents-for-law-firms',
      date: '12 May 2026',
      note: 'Event and scheduled triggers; drafting, medical-review, and deposition agents.'
    },
    {
      id: 'eve-auditor',
      system: 'Eve',
      title: 'Eve Auditor',
      url: 'https://www.eve.legal/use-cases/ai-auditor-for-plaintiff-law',
      date: '2026',
      note: 'Nightly portfolio audit and its stated report types.'
    },
    {
      id: 'eve-research',
      system: 'Eve',
      title: 'Eve Research — Research, Right Inside Eve',
      url: 'https://www.eve.legal/use-cases/eve-research',
      date: '2026',
      note: 'Matter-local research, source links, treatment status, and legal-research scope.'
    },
    {
      id: 'eve-fact-search',
      system: 'Eve',
      title: 'What Does It Mean to “Trust” Your AI?',
      url: 'https://www.eve.legal/tort-report/what-does-it-mean-to-trust-your-ai',
      date: '26 Jul 2024',
      note: 'Eve describes Fact Search as systematic page-by-page fact and quote searching rather than RAG for that feature.'
    },
    {
      id: 'harvey-vault',
      system: 'Harvey',
      title: 'Harvey Vault',
      url: 'https://www.harvey.ai/platform/vault',
      date: '2026',
      note: 'Vault document organization and bulk review, source traceability, knowledge bases, and permissions.'
    },
    {
      id: 'harvey-tenet',
      system: 'Harvey',
      title: 'Introducing Harvey II',
      url: 'https://www.harvey.ai/blog/introducing-harvey-ii',
      date: '18 Aug 2026',
      note: 'Harvey Tenet, described as Harvey’s first model post-trained end-to-end for legal reasoning.'
    },
    {
      id: 'harvey-models',
      system: 'Harvey',
      title: 'Expanding Harvey’s Model Offerings',
      url: 'https://www.harvey.ai/blog/expanding-harveys-model-offerings',
      date: '13 May 2025',
      note: 'Public statement on optimizing Anthropic and Google foundation models through cloud providers.'
    },
    {
      id: 'harvey-security',
      system: 'Harvey',
      title: 'Secure Legal AI for the Most Sensitive Matters',
      url: 'https://www.harvey.ai/security',
      date: '2 Oct 2024',
      note: 'No-training commitment, retention, regional controls, encryption, and enterprise controls.'
    },
    {
      id: 'harvey-data-factory',
      system: 'Harvey',
      title: 'Using Agents to Scale Harvey’s Knowledge Sources',
      url: 'https://www.harvey.ai/blog/using-agents-to-scale-harveys-knowledge-sources',
      date: '2 Feb 2026',
      note: 'Harvey’s public description of a Data Factory pipeline for legal knowledge sources.'
    },
    {
      id: 'harvey-workflow',
      system: 'Harvey',
      title: 'How Our In-House Legal Team Uses Harvey to Work Smarter',
      url: 'https://www.harvey.ai/blog/how-harveys-legal-team-uses-harvey-to-work-smarter',
      date: '13 Oct 2026',
      note: 'Workflow Builder blocks: user input, AI action, logic, and output.'
    },
    {
      id: 'cc-launch',
      system: 'CoCounsel',
      title: 'Thomson Reuters Launches the Next Generation of CoCounsel Legal',
      url: 'https://www.thomsonreuters.com/en/press-releases/2026/august/thomson-reuters-launches-next-generation-of-cocounsel-legal-the-ai-ecosystem-built-for-legal-professionals',
      date: '20 Aug 2026',
      note: 'Agentic architecture, Anthropic Claude Agent SDK, verified authority, Tabular Analysis, and Deep Research Verify.'
    },
    {
      id: 'cc-features',
      system: 'CoCounsel',
      title: 'CoCounsel Legal Features',
      url: 'https://legal.thomsonreuters.com/en/products/cocounsel-legal/features',
      date: '2026',
      note: 'Deep Research, document analysis, Tabular Analysis, and Word drafting product features.'
    },
    {
      id: 'cc-ledger',
      system: 'CoCounsel',
      title: 'CoCounsel Legal, Reimagined',
      url: 'https://www.thomsonreuters.com/en-us/posts/innovation/cocounsel-legal-reimagined/',
      date: '23 Apr 2026',
      note: 'Public description of citation-ledger architecture and grounded source handling.'
    },
    {
      id: 'cc-authority',
      system: 'CoCounsel',
      title: 'How Trustworthy Content Transforms Legal Deep Research',
      url: 'https://legal.thomsonreuters.com/en/insights/white-papers/how-trustworthy-content-transforms-legal-deep-research',
      date: '3 Nov 2025',
      note: 'Westlaw content, KeyCite, Key Number System, annotated statutes, and attorney-editor foundation.'
    },
    {
      id: 'legora-aos',
      system: 'Legora',
      title: 'Legora aOS',
      url: 'https://legora.com/product/aos',
      date: '13 May 2026',
      note: 'aOS layers, legal agentic harness, model selection, tool routing, memory, guardrails, audit trails, and ethical walls.'
    },
    {
      id: 'legora-agent',
      system: 'Legora',
      title: 'Legora Agent',
      url: 'https://legora.com/product/agent',
      date: '29 Jul 2026',
      note: 'Agent planning, execution, review, delivery, and reusable Skills.'
    },
    {
      id: 'legora-skills',
      system: 'Legora',
      title: 'Introducing Skills',
      url: 'https://legora.com/blog/introducing-skills',
      date: '5 Oct 2026',
      note: 'Skills as Markdown instructions encoding standards, processes, and preferences.'
    },
    {
      id: 'legora-intake',
      system: 'Legora',
      title: 'Legora Launches Intake',
      url: 'https://legora.com/newsroom/legora-launches-intake-an-agentic-front-door-for-in-house-legal-teams',
      date: '13 Oct 2026',
      note: 'Slack intake, tracked tasks, lawyer-review default, routine-request execution options, and operational analytics.'
    },
    {
      id: 'legora-integrations',
      system: 'Legora',
      title: 'Legora Launches Integration Ecosystem',
      url: 'https://legora.com/newsroom/legora-launches-integration-ecosystem-spanning-the-enterprise-legal-stack',
      date: '14 Oct 2026',
      note: 'Document, research, data-room, eDiscovery, ethical-wall, and CLM integrations with permission carry-through.'
    }
  ],

  vendors: [
    {
      id: 'docusign',
      name: 'Docusign IAM',
      sourceSystem: 'Docusign',
      color: '#72e7d0',
      type: 'Agreement intelligence · lifecycle automation',
      subtitle: 'Agreement Manager (formerly Navigator), AI-Assisted Review, and Agreement Desk turn agreement files into searchable, actionable records.',
      thesis: '<strong>Architectural center:</strong> a canonical agreement-data layer. The product’s compounding value comes when extraction, review, workflow, and obligation tracking all operate on the same permissioned contract object — not from a chatbot alone.',
      matrix: {
        job: 'Contract intake, extraction, review, negotiation, obligations',
        data: 'Agreements + CLM / CRM workflow context',
        model: 'Iris selects agreement AI models; exact model stack undisclosed',
        orchestration: 'Document-to-data pipeline + playbook-guided review + workflow routing',
        proof: 'Source-linked terms, editable fields, playbooks, permissions, audit trail'
      },
      kpis: [
        { label: 'Data gravity', text: 'Executed and in-flight agreements across the business' },
        { label: 'Primary loop', text: 'Ingest → structure → review / act → keep obligations current' },
        { label: 'Trust primitive', text: 'Evidence-backed fields and suggested changes a user can accept or edit' }
      ],
      facts: [
        {
          title: 'Iris is the agreement-AI layer.',
          text: 'Docusign says Iris is embedded across Intelligent Agreement Management and is trained to identify, classify, and extract agreement-specific concepts and data; it also says Iris selects the appropriate agreement AI models for use cases.',
          source: 'ds-automation'
        },
        {
          title: 'Intake starts with document conversion.',
          text: 'Docusign describes legacy or new documents entering intake, OCR making scanned PDFs searchable, then AI-driven extraction of terms and clauses into structured agreement data.',
          source: 'ds-automation'
        },
        {
          title: 'Review is policy-conditioned generation.',
          text: 'AI-Assisted Review can compare agreements with pre-approved playbooks, flag mismatch, suggest markup, answer questions, and create draft playbooks from reference agreements.',
          source: 'ds-review'
        },
        {
          title: 'The repository is an application service, not just storage.',
          text: 'Agreement Manager offers AI/custom extractions, reporting, agreement access controls, and activity tracking. Docusign renamed Navigator to Agreement Manager in 2026 materials.',
          source: 'ds-manager'
        }
      ],
      unknown: 'Docusign does not publicly name the foundation models, fine-tuning corpus, embedding model, confidence calibration method, or exact service topology behind Iris. Treat the boxes below that say “reconstruction” as a strong way to build this class of system — not leaked vendor internals.',
      nodes: [
        { title: 'Agreement sources', sub: 'PDF · DOCX · eSign · CLM', status: 'public' },
        { title: 'Intake & OCR', sub: 'text + layout + versions', status: 'public' },
        { title: 'Agreement record', sub: 'typed fields + spans', status: 'inferred' },
        { title: 'Iris intelligence', sub: 'extract · compare · draft', status: 'public' },
        { title: 'Policy & workflow', sub: 'playbook · approvals · tasks', status: 'inferred' },
        { title: 'Reviewable action', sub: 'redline · report · reminder', status: 'public' }
      ],
      scenarios: [
        {
          title: 'Portfolio extraction',
          prompt: '“Which supplier agreements auto-renew in the next 120 days and have a liability cap below our standard?”',
          result: 'A filtered set of agreements with extracted dates / caps, source locations, and an action queue.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Import + identity', 'Legacy files and eSignature agreements arrive with tenant, user, source, and permission metadata.'],
            ['Normalize', 'OCR / document parsing produces searchable text while preserving page, clause, and version coordinates.'],
            ['Build a contract object', 'A typed record stores party, term, renewal, monetary, clause, and source-span evidence; this is the likely product backbone.'],
            ['Extract + resolve', 'Agreement-specific models identify candidate values, normalize them, and attach confidence / evidence rather than only free-text answers.'],
            ['Query + policy join', 'Structured filters find renewal windows; an approved policy definition supplies “below our standard.”'],
            ['Review + act', 'The user opens the evidence, corrects uncertain fields, and creates an owner task / reminder rather than trusting an invisible batch result.']
          ]
        },
        {
          title: 'Playbook review',
          prompt: '“Review this counterparty MSA against our SaaS playbook and propose only high-priority changes.”',
          result: 'Clause-level findings, grounded explanations, and suggested edits that are still drafts until accepted.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Identify the review object', 'The system version-locks the uploaded agreement and captures review context: deal type, side, jurisdiction, and playbook version.'],
            ['Segment by legal structure', 'Section headings, definitions, tables, and clause boundaries are recovered so an edit can be applied to a meaningful span.'],
            ['Compile policy', 'A playbook should become testable policy objects: issue, preferred language, fallbacks, escalation rule, severity, and approved examples.'],
            ['Run hybrid checks', 'Deterministic checks handle required / forbidden terms; a language model compares semantic meaning and drafts a proposal where language differs.'],
            ['Ground every finding', 'Each flag links to the source clause and the exact policy / precedent it triggered. The model is not allowed to invent a policy.'],
            ['Human applies a patch', 'Generate a native redline / comment only after the reviewer sees it; acceptance and edits become feedback for playbook maintenance, not silent training.']
          ]
        },
        {
          title: 'Obligation monitor',
          prompt: '“Alert Procurement before termination notice is due, but only if the business owner has not renewed.”',
          result: 'A durable scheduled workflow driven by a verified obligation object, not a one-off LLM answer.',
          activeNodes: [0, 2, 3, 4, 5],
          steps: [
            ['Model the obligation', 'Represent actor, action, deadline rule, notice period, source span, timezone, status, and owning team as first-class fields.'],
            ['Compute deterministically', 'Calculate dates from normalized terms using a rules engine. Never ask a language model to be the clock.'],
            ['Check business state', 'A workflow connector queries whether a renewal / approval has already occurred, with idempotency keys.'],
            ['Trigger policy', 'Thresholds decide whether to nudge, open a task, or escalate. Model-generated language may personalize the notification, not authorize it.'],
            ['Show provenance', 'The alert exposes the agreement, source clause, computed date, and last checked data so the owner can correct it.']
          ]
        }
      ],
      reconstruction: [
        {
          title: 'Evidence-first contract schema',
          text: 'Store every extracted value as <code>value + normalized form + field type + source span + extractor version + confidence + reviewer state</code>. That gives search, reports, reminders, and corrections one shared truth.'
        },
        {
          title: 'A router, not one giant model',
          text: 'Route by task: OCR/layout, document type, entity resolution, high-precision extraction, semantic clause matching, generative redline, and summarization have different latency, cost, and error profiles.'
        },
        {
          title: 'Playbook compiler + policy engine',
          text: 'Convert human guidelines into structured rules plus exemplars. Use exact logic for hard constraints and LLM judgment only for semantic equivalence / drafting; log the policy version on every finding.'
        }
      ],
      pipeline: [
        { title: '1 · Acquire', text: 'Upload, email, eSignature, or connector; assign tenant / role / matter-like context; virus scan, dedupe, version fingerprint.' },
        { title: '2 · Parse', text: 'OCR + layout + section hierarchy + tables + defined-term links; preserve immutable text offsets and document version lineage.' },
        { title: '3 · Structure', text: 'Extract / normalize fields and clauses; entity-resolve parties; write evidence-bearing agreement objects and search indexes.' },
        { title: '4 · Operate', text: 'Serve search, review, reporting, and event schedules; capture edits as supervised correction data after governance review.' }
      ],
      interview: {
        question: 'Design custom extraction for a company’s 2 million legacy contracts. It must support audit-ready renewal and payment reporting in 60 days.',
        framing: 'The wrong opening is “put all PDFs into a vector DB.” The hard part is defining a stable agreement schema, validating high-impact fields, and creating an exception path that humans can clear faster than the backlog grows.',
        bullets: [
          '<strong>Contract:</strong> start with 8–12 business-critical fields and a source-span requirement; define field semantics, normalization, and acceptable error by use case.',
          '<strong>Pipeline:</strong> async ingestion → content hash / dedupe → OCR/layout → document-type router → extraction candidates → schema validation → human queue.',
          '<strong>Models:</strong> use specialized document extraction / layout models plus constrained LLM adjudication for ambiguous clauses; batch by document family and cache parse artifacts.',
          '<strong>Quality:</strong> stratified gold set by contract type, scan quality, language, and clause novelty. Measure span overlap, normalized exact match, abstention, and reviewer agreement — not only “LLM accuracy.”',
          '<strong>Rollout:</strong> dual-run against a manual sample; launch read-only reports first; require field verification before downstream reminders or external notifications.'
        ]
      },
      evals: [
        { title: 'Field fidelity', text: 'Normalized exact match + source-span overlap, split by field criticality and document condition.' },
        { title: 'Clause policy', text: 'Issue recall, false-positive burden, semantic-equivalence accuracy, and redline acceptance / substantial-edit rate.' },
        { title: 'Workflow safety', text: 'Correct deadline computation, duplicate notification rate, action authorization violations, and audit completeness.' },
        { title: 'Operations', text: 'Cost per contract, p95 extraction latency, backlog age, reviewer minutes per accepted field, and index freshness.' }
      ],
      sourceIds: ['ds-automation', 'ds-review', 'ds-manager', 'ds-iris']
    },

    {
      id: 'eve',
      name: 'EveOS',
      sourceSystem: 'Eve',
      color: '#ffbb8c',
      type: 'Plaintiff-firm operating system · proactive casework',
      subtitle: 'A matter-centric system for intake, medical-record understanding, drafting, research, nightly case auditing, and portfolio insight.',
      thesis: '<strong>Architectural center:</strong> a continuously updated case graph / “living case file.” The product is valuable because incoming records update structured matter state, which triggers agents and feeds recurring portfolio review — a very different loop from “upload one document and chat.”',
      matrix: {
        job: 'Plaintiff intake, case development, medical review, drafting, proactive portfolio audit',
        data: 'Matter files, medical records / bills, calls, firm work product, case-management data',
        model: 'Foundation-model and training details not publicly named',
        orchestration: 'Event-triggered + scheduled agents around a continuously updated case state',
        proof: 'Page-level record citations, attorney review, matter isolation, case-specific templates'
      },
      kpis: [
        { label: 'Data gravity', text: 'The evolving plaintiff matter, especially medical records and operational signals' },
        { label: 'Primary loop', text: 'New evidence → Atlas update → agent / audit → staff decision → matter state' },
        { label: 'Trust primitive', text: 'Cited facts inside the case plus lawyer approval before consequential work' }
      ],
      facts: [
        {
          title: 'Atlas is described as a self-updating case-data layer.',
          text: 'Eve says Atlas reads records, bills, documents, and calls as they arrive and structures a live view of matter people, stages, dollars, documents, deadlines, and facts.',
          source: 'eve-platform'
        },
        {
          title: 'Agents can be event or schedule triggered.',
          text: 'Eve publicly describes triggers on new documents / events and scheduled triggers; examples include medical-overview updates, drafting, and deposition summarization.',
          source: 'eve-agents'
        },
        {
          title: 'Auditor is a recurring whole-portfolio capability.',
          text: 'Eve says Auditor reviews active cases nightly and currently advertises reports for TBI indicators, incomplete MRIs, mass-tort eligibility, impairment / disability, and insurance / liability overview.',
          source: 'eve-auditor'
        },
        {
          title: 'Research and fact finding are framed as verifiable.',
          text: 'Eve says legal research is inside the matter with source links and treatment status. Separately, it describes Fact Search as systematic page-by-page fact / quote searching rather than RAG for that specific feature.',
          source: 'eve-research'
        }
      ],
      unknown: 'Eve’s public pages describe product behavior, not its base models, retrieval indexes, medical-coding pipeline, fine-tuning data, or scheduler implementation. In particular, “not RAG” is a claim about the Fact Search feature, not a license to infer the architecture of every Eve feature.',
      nodes: [
        { title: 'Matter events', sub: 'records · bills · calls · intake', status: 'public' },
        { title: 'Parse & classify', sub: 'documents → evidence units', status: 'inferred' },
        { title: 'Atlas case state', sub: 'facts · parties · stage · gaps', status: 'public' },
        { title: 'Evidence / research', sub: 'record search + legal sources', status: 'public' },
        { title: 'Agents & Auditor', sub: 'event jobs + nightly scan', status: 'public' },
        { title: 'Staff decision', sub: 'draft · task · escalation', status: 'public' }
      ],
      scenarios: [
        {
          title: 'New medical record',
          prompt: 'A 180-page orthopedic record and bill are uploaded. “Update the chronology and flag gaps before the next demand.”',
          result: 'A cited chronology / bill cross-check plus a review queue — not an untraceable medical conclusion.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Create an immutable ingest event', 'Fingerprint the record, attach it to the correct matter, preserve page order, MIME / OCR quality, uploader, and access policy.'],
            ['Understand document structure', 'Classify record / bill / imaging / correspondence; extract date, provider, diagnosis, procedure, medication, and narrative candidates with page anchors.'],
            ['Reconcile into case state', 'Resolve duplicate dates, provider aliases, and contradictions. Keep raw assertions separate from a derived “case fact” so later records can revise it.'],
            ['Search for evidence exhaustively', 'For a high-stakes fact request, page-level or exhaustive search avoids the “top-k missed it” failure mode. This fits Eve’s public Fact Search description.'],
            ['Run the medical-overview agent', 'Generate a structured chronology, missing-bill / treatment-gap candidates, and a draft explanation from cited evidence, with abstention for unclear handwriting or conflict.'],
            ['Route to humans', 'A paralegal / attorney accepts, corrects, or rejects results. Corrections should update matter state and evaluation data, not automatically fine-tune a shared model.']
          ]
        },
        {
          title: 'Nightly Auditor',
          prompt: '“Across all active matters, surface cases whose records suggest a missed TBI or ordered-but-uncompleted MRI.”',
          result: 'A ranked, evidence-backed work queue with severity / confidence, not an autonomous valuation or medical diagnosis.',
          activeNodes: [0, 2, 3, 4, 5],
          steps: [
            ['Select eligible matters', 'A batch planner applies firm / practice-area / status filters and records the snapshot timestamp so results are reproducible.'],
            ['Use incremental state', 'Scan deltas and cached case representations where possible. Reprocessing every token nightly is expensive and can create inconsistent outputs.'],
            ['Apply audit specifications', 'Each audit has a written case definition, evidence requirements, exclusions, severity rubric, and no-evidence / uncertainty state.'],
            ['Gather supporting record spans', 'Use high-recall search or a deterministic page sweep for targeted evidence, then rerank / verify before producing a finding.'],
            ['Rank + suppress noise', 'Calibrate threshold by review capacity and harm. Group duplicate findings and respect prior attorney disposition so closed issues do not reappear forever.'],
            ['Create a human-owned task', 'Show why this surfaced, what evidence supports it, and which next action is suggested. The attorney decides case strategy and any client communication.']
          ]
        },
        {
          title: 'Firm-voice demand draft',
          prompt: '“Prepare a demand draft using our California MVA style and the current medical chronology.”',
          result: 'A draft grounded in the selected matter facts and a versioned firm template, ready for attorney editing.',
          activeNodes: [0, 2, 3, 4, 5],
          steps: [
            ['Select scope explicitly', 'Choose matter, facts / chronology version, jurisdiction, case type, document template, and attorney / firm style profile.'],
            ['Retrieve examples safely', 'Use permissioned, de-identified where appropriate, approved work-product exemplars and a document-style specification; do not retrieve cross-matter secrets by semantic similarity alone.'],
            ['Make a draft plan', 'First build an outline populated with cited case facts; hold unsupported slots open instead of filling them with plausible prose.'],
            ['Generate section by section', 'Use constrained generation that maps each factual assertion to a case-fact identifier and each legal claim to a research citation.'],
            ['Run validations', 'Check names, dates, arithmetic, page citations, conflicting injuries, privilege labels, and formatting before the draft reaches a reviewer.'],
            ['Attorney approves content', 'Writing-style fit is useful; legal theory, requested amount, and client communications remain decisions for the responsible lawyer.']
          ]
        }
      ],
      reconstruction: [
        {
          title: 'Separate evidence from case facts',
          text: 'Implement an append-only evidence ledger (<code>doc, page, quote, parser version</code>) and a derived fact graph (<code>fact, assertions, confidence, status, reviewer</code>). Never overwrite a patient / case fact because one model saw a new page.'
        },
        {
          title: 'Two execution clocks',
          text: 'Use an event bus for record-arrival agents and a workflow scheduler for Auditor. Persist idempotency keys, snapshot IDs, audit version, and prior disposition so overnight work is reproducible and non-spammy.'
        },
        {
          title: 'Recall-first → review-first',
          text: 'For possible missed value, tune candidate generation for recall and send uncertain results to a queue. For drafting or filing-adjacent outputs, tune for evidence coverage and require explicit human approval.'
        }
      ],
      pipeline: [
        { title: '1 · Ingest events', text: 'CMS / CRM, scanner, email, portal, and call events land with matter routing, access scope, dedupe hash, and event time.' },
        { title: '2 · Evidence layer', text: 'OCR / parse / classify into page-level evidence, medical entities, document relationships, and source anchors; preserve raw content.' },
        { title: '3 · Case projection', text: 'Build Atlas-like structured projections: people, timeline, treatment, bills, claims, tasks, and unresolved contradictions.' },
        { title: '4 · Work engine', text: 'Trigger agents and scheduled audits; write cited drafts / tasks; capture dispositions and feed a reviewed gold set.' }
      ],
      interview: {
        question: 'Design a nightly “missed case value” auditor for 80,000 plaintiff matters with new medical records arriving all day.',
        framing: 'The key trade-off is not model cleverness. It is high recall without exploding paralegal workload, while preserving page-level evidence, HIPAA / matter boundaries, and reproducible recommendations.',
        bullets: [
          '<strong>Define audit contracts:</strong> a clinical / legal advisory board writes positive evidence, exclusions, severity, escalation, and a “not enough evidence” state for every audit type.',
          '<strong>Incremental architecture:</strong> maintain a materialized case view; dirty only matters affected by new evidence / rule changes; periodically run a full consistency sweep.',
          '<strong>Candidate pipeline:</strong> cheap deterministic / model-assisted screen → high-recall evidence gathering → stronger reasoning pass → citation verifier → calibrated queue.',
          '<strong>Human factors:</strong> batch and dedupe related findings; preserve reviewer dispositions; give staff a one-click reason-to-dismiss; schedule against capacity and case urgency.',
          '<strong>Safety:</strong> label as an operational suggestion, never diagnosis; encrypt, enforce matter scopes, audit every access, and prohibit direct external action without approval.'
        ]
      },
      evals: [
        { title: 'Chronology quality', text: 'Event extraction F1, temporal ordering, provider / bill reconciliation, page-citation precision, and contradiction capture.' },
        { title: 'Audit utility', text: 'Sensitivity against adjudicated positives, precision at available reviewer capacity, calibration, duplicate rate, and time-to-disposition.' },
        { title: 'Draft integrity', text: 'Unsupported-fact rate, source coverage, template / jurisdiction correctness, attorney edit distance, and harmful-style drift.' },
        { title: 'Matter safety', text: 'Cross-matter retrieval attempts blocked, access-log completeness, stale-state rate, and scheduled-job idempotency / failure recovery.' }
      ],
      sourceIds: ['eve-platform', 'eve-agents', 'eve-auditor', 'eve-research', 'eve-fact-search']
    },

    {
      id: 'harvey',
      name: 'Harvey',
      sourceSystem: 'Harvey',
      color: '#f294ba',
      type: 'Enterprise legal workspace · knowledge + document-scale agents',
      subtitle: 'A secure legal work layer spanning Vault-scale document review, legal knowledge, connectors, agent workflows, drafting, and firm / matter governance.',
      thesis: '<strong>Architectural center:</strong> permission-aware context assembly at enterprise scale. Harvey’s visible product span suggests the important abstraction is a governed workspace that can join firm knowledge, licensed sources, and large document collections before a model / agent produces cited work.',
      matrix: {
        job: 'Diligence, large-document analysis, research, drafting, reusable legal workflows',
        data: 'Vaults, knowledge bases, firm systems, licensed / public legal sources',
        model: 'Harvey Tenet post-trained for legal reasoning; public multi-model integrations',
        orchestration: 'Workspace / Vault retrieval + model routing + agents / workflow blocks',
        proof: 'Citations, matter-level isolation, permission carry-through, audit / retention controls'
      },
      kpis: [
        { label: 'Data gravity', text: 'Firm knowledge plus high-volume matter / transaction document sets' },
        { label: 'Primary loop', text: 'Permissioned retrieval → analysis / tool use → cited work product → reviewer feedback' },
        { label: 'Trust primitive', text: 'Traceable source citations backed by matter-aware access controls' }
      ],
      facts: [
        {
          title: 'Vault is built for large legal-document collections.',
          text: 'Harvey describes Vaults as secure stores for up to 100,000 documents and says bulk analysis / extraction is traceable back to source; it also advertises permission and knowledge-base controls.',
          source: 'harvey-vault'
        },
        {
          title: 'Harvey publicly names a legal post-trained model.',
          text: 'In August 2026, Harvey introduced Harvey Tenet as its first model “post-trained end-to-end for legal reasoning.” Earlier public material also described incorporating and optimizing Anthropic and Google foundation models via cloud providers.',
          source: 'harvey-tenet'
        },
        {
          title: 'Legal source coverage itself is a pipeline.',
          text: 'Harvey has publicly described a “Data Factory” that uses agents to discover legal sources and turn them into tools, scaling coverage across jurisdictions and data sources.',
          source: 'harvey-data-factory'
        },
        {
          title: 'Customer-data governance is a product constraint.',
          text: 'Harvey says it does not train underlying models on customer inputs, outputs, or uploaded documents; it also describes regional control, retention policies, audit logs, and enterprise access controls.',
          source: 'harvey-security'
        }
      ],
      unknown: 'Harvey has disclosed unusually useful model and governance signals, but not the Tenet architecture / training recipe, routing policy, retrieval ranking algorithm, citation validator, Vault indexing format, or exact provider assignments per request. Avoid claiming that a particular answer used a particular model without telemetry.',
      nodes: [
        { title: 'Firm + matter sources', sub: 'Vault · DMS · authorities', status: 'public' },
        { title: 'Permissioned connector', sub: 'identity · ethics walls · sync', status: 'public' },
        { title: 'Knowledge indexes', sub: 'chunks · metadata · evidence IDs', status: 'inferred' },
        { title: 'Model / agent router', sub: 'Tenet + frontier models', status: 'public' },
        { title: 'Tools & citation check', sub: 'search · extract · verify', status: 'inferred' },
        { title: 'Workspace output', sub: 'table · memo · draft · task', status: 'public' }
      ],
      scenarios: [
        {
          title: 'Vault due diligence',
          prompt: '“Across this data room, identify change-of-control, assignment, and consent issues; put each answer in a reviewable table.”',
          result: 'A structured issue table where each row carries document / source evidence and can be filtered into a diligence workstream.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Freeze an authorized corpus', 'Capture the Vault / data-room snapshot, active permissions, document hashes, task schema, and the issue definitions before model work begins.'],
            ['Parse once, index many ways', 'A production design retains page / heading / table structure and indexes both exact legal phrases and semantic chunks; it must not discard document coordinates.'],
            ['Decompose the assignment', 'Translate “change of control, assignment, consent” into row schemas, subquestions, clause variants, exclusions, and an evidence / uncertainty policy.'],
            ['Route specialized work', 'Batch cheap classification and high-recall retrieval; send ambiguous / dense candidates to longer-context legal reasoning or a review agent.'],
            ['Verify evidence', 'Require a direct supporting span per table cell. A separate checker compares output claim / label to that span and marks unsupported answers as “needs review.”'],
            ['Publish a live table', 'Rows retain query, corpus snapshot, model / prompt / policy version, citations, confidence, and reviewer status so a lawyer can filter and correct at scale.']
          ]
        },
        {
          title: 'Cited legal research',
          prompt: '“Analyze the enforceability risk for this clause under the specified jurisdiction, using approved authorities and our prior advice.”',
          result: 'A research-and-drafting workflow that visibly separates authority retrieval, firm precedent, analysis, and user judgment.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Set source policy', 'Classify which repositories are allowed: current licensed authority, approved firm work product, matter file, and possibly the web. Record jurisdiction and currency cutoff.'],
            ['Plan retrieval', 'A planner breaks the question into doctrine, statute / case, factual application, and precedent subqueries. Tool calls are bounded by budget and source policy.'],
            ['Retrieve with permissions first', 'Authorization filters run before vector / keyword ranking, not after. Retrieve enough context to interpret holdings rather than snippets that only mention a term.'],
            ['Synthesize from evidence', 'The reasoning model receives a closed evidence packet with canonical citation metadata; prompt it to state uncertainty and not manufacture authority.'],
            ['Run adversarial checks', 'Verify citation existence, current treatment / source date where available, proposition support, jurisdiction, and whether cited precedent is actually permitted.'],
            ['Draft for review', 'Offer a cited memo / clause / email as a review object. Lawyer edits should identify whether the miss was retrieval, reasoning, policy, or presentation.']
          ]
        },
        {
          title: 'Reusable workflow',
          prompt: '“Make a repeatable NDA intake workflow that asks for missing context, runs the playbook, and produces a lawyer-reviewable reply.”',
          result: 'A controlled task graph, not one mega-prompt; public Harvey material describes workflow blocks for user input, AI action, logic, and output.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Specify input contract', 'Collect counterparty, relationship, jurisdiction, urgency, document, and requester permissions with typed validation.'],
            ['Build explicit blocks', 'Model input, retrieval, playbook review, missing-information branch, draft, reviewer approval, and send are distinct idempotent steps.'],
            ['Encode approval edges', 'The workflow engine, not a model’s prose, decides when an attorney approval is mandatory or a low-risk response can proceed.'],
            ['Observe every run', 'Store input snapshot, selected sources, tool calls, output schema, reviewer action, failure reason, cost, and latency for debugging / eval.'],
            ['Improve safely', 'Use accepted / edited outputs in a consented, reviewed evaluation loop; keep customer matter content out of any shared-model training unless contractually authorized.']
          ]
        }
      ],
      reconstruction: [
        {
          title: 'Context as a governed data product',
          text: 'Build retrieval around an access-aware evidence object (<code>tenant, matter, document, span, permission snapshot, provenance</code>). The model sees only context selected after policy enforcement, not a pooled firm vector store.'
        },
        {
          title: 'Application-level mixture of models',
          text: 'Use a task router informed by risk / latency / cost: parsers and classifiers for bulk work; long-context or legal post-trained models for ambiguous reasoning; verifier models / rules for source support. Record the choice.'
        },
        {
          title: 'Tables are a control surface',
          text: 'For diligence, a table with evidence, status, owner, and correction state is safer than an eloquent memo. It makes coverage measurable, supports human queueing, and lets results be rerun selectively.'
        }
      ],
      pipeline: [
        { title: '1 · Connect', text: 'Onboard DMS / data room / knowledge sources with OAuth or enterprise identities; mirror permissions and observe sync / revocation events.' },
        { title: '2 · Curate', text: 'Parse documents, retain coordinates, enrich metadata, dedupe / version, and build separate tenant / matter indexes plus source-quality metadata.' },
        { title: '3 · Execute', text: 'Plan → permission-filtered retrieve → route model / tools → generate typed output → verify citations / schema → write immutable trace.' },
        { title: '4 · Learn', text: 'Route reviewer corrections into source / policy / prompt / model failure buckets; refresh gold tasks and evaluation sets without leaking customer data.' }
      ],
      interview: {
        question: 'Design a permission-aware due-diligence agent that can analyze 50,000 data-room documents and export an issues list in one business day.',
        framing: 'Start with coverage and evidence—not an autonomous agent. A great answer makes “every document / every question / every source” observable and lets a lawyer safely correct the long tail.',
        bullets: [
          '<strong>Corpus contract:</strong> snapshot all documents / permissions, parse once, record unparseable files, and define an issue table with mandatory evidence fields.',
          '<strong>Scale:</strong> fan out stateless extraction workers over document shards; use durable queues, checkpoints, content hashes, and a merge phase; reserve expensive models for candidate clauses.',
          '<strong>Retrieval:</strong> hybrid lexical + semantic retrieval with structured metadata filters. Use document-level coverage accounting so “no issue found” is distinguishable from “not processed.”',
          '<strong>Agent boundary:</strong> allow retrieval, extract, compare, and draft tools; prohibit external side effects. Enforce time / token / document budgets and a stop / escalate state.',
          '<strong>Validation:</strong> verify every row against a span, audit the full negative sample, score by document family and issue type, and deliver a reviewer queue before calling it complete.'
        ]
      },
      evals: [
        { title: 'Coverage', text: 'Documents parsed / processed, questions run per document, unparseable rate, and “no answer” versus “not evaluated” separation.' },
        { title: 'Evidence quality', text: 'Citation precision / recall, proposition support, span grounding, stale-authority rate, and abstention correctness.' },
        { title: 'Access safety', text: 'Permission-filter test suite, revocation propagation time, cross-matter canary tests, and audit-trace completeness.' },
        { title: 'Workflow value', text: 'Issue recall at reviewer capacity, reviewer minutes / useful finding, correction taxonomy, p95 latency, and dollars / matter.' }
      ],
      sourceIds: ['harvey-vault', 'harvey-tenet', 'harvey-models', 'harvey-security', 'harvey-data-factory', 'harvey-workflow']
    },

    {
      id: 'cocounsel',
      name: 'CoCounsel Legal',
      sourceSystem: 'CoCounsel',
      color: '#8da5ff',
      type: 'Authority-grounded legal research · agentic work product',
      subtitle: 'Thomson Reuters’ legal-AI environment combines Westlaw / Practical Law authority, firm knowledge, Deep Research, document analysis, drafting, and source verification.',
      thesis: '<strong>Architectural center:</strong> authoritative legal content plus provenance. The defensibility advantage is not merely a better answer model; it is a system that can plan research over curated sources, preserve legal metadata, and verify exactly what supports a proposition.',
      matrix: {
        job: 'Cited legal research, document analysis, briefs, drafting, high-volume tabular review',
        data: 'Westlaw / Practical Law authority + organization knowledge + matter documents',
        model: 'Built on Anthropic Claude Agent SDK; proprietary legal-focused model for Tabular Analysis',
        orchestration: 'Plan → parallel legal tools / retrieval → reason → citation ledger / verify → work product',
        proof: 'Verified authority, KeyCite / editorial metadata, source passages, citation ledger'
      },
      kpis: [
        { label: 'Data gravity', text: 'Curated legal authority and the metadata that says how it is treated / organized' },
        { label: 'Primary loop', text: 'Research plan → authoritative retrieval → cited synthesis → verification → lawyer decision' },
        { label: 'Trust primitive', text: 'Structured source provenance and verification, not a model-generated Bluebook-looking string' }
      ],
      facts: [
        {
          title: 'The agentic stack is publicly described.',
          text: 'Thomson Reuters says the 2026 CoCounsel Legal experience is built on Anthropic’s Claude Agent SDK and can plan, reason, and execute legal workflows while grounding output in traceable authority.',
          source: 'cc-launch'
        },
        {
          title: 'Research is connected to proprietary legal content.',
          text: 'CoCounsel says it reasons from Westlaw, Practical Law, and organization knowledge. Its materials describe Deep Research as multi-step planning and retrieval with cited reports.',
          source: 'cc-features'
        },
        {
          title: 'High-volume review is a typed, tabular task.',
          text: 'Tabular Analysis is advertised for up to 10,000 documents and 100 questions, with source-traceable results. Thomson Reuters says a proprietary legal-focused model powers this feature.',
          source: 'cc-launch'
        },
        {
          title: 'Citation provenance is product infrastructure.',
          text: 'Thomson Reuters describes a patent-pending citation-ledger architecture that tracks each source the agent brings into context and the passages it reads.',
          source: 'cc-ledger'
        }
      ],
      unknown: 'Public releases identify Claude Agent SDK and a proprietary legal-focused model for one feature, but do not expose prompt templates, internal sub-agent boundaries, content-index topology, post-training data, the exact verifier model, or raw chain-of-thought. A visible research trace should be designed as reviewable evidence / plan artifacts, not assumed to be model-private reasoning.',
      nodes: [
        { title: 'Matter request', sub: 'question · docs · venue', status: 'public' },
        { title: 'Authority sources', sub: 'Westlaw · Practical Law · firm', status: 'public' },
        { title: 'Plan & tool router', sub: 'decompose · parallelize', status: 'public' },
        { title: 'Legal analysis', sub: 'research · review · draft', status: 'public' },
        { title: 'Citation ledger', sub: 'source span → proposition', status: 'public' },
        { title: 'Verified work product', sub: 'report · table · brief', status: 'public' }
      ],
      scenarios: [
        {
          title: 'Deep Research',
          prompt: '“Prepare a cited, jurisdiction-specific research memo on this issue. Identify controlling authority, conflicting lines, and practical next steps.”',
          result: 'A reviewable report with a plan, authoritative sources, proposition-level citations, and verification checks.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Bind the legal frame', 'Capture jurisdiction, court / venue, date / currency, procedural posture, fact assumptions, and the requested standard of proof. This constrains retrieval before the model writes.'],
            ['Decompose the problem', 'Create query families for controlling statute / rule, current treatment, leading cases, contrary authority, factual analogs, and secondary guidance.'],
            ['Use typed legal tools', 'Search legal sources through tools that return not just text but citation metadata, jurisdiction, date, treatment, editorial concepts, and source identifiers.'],
            ['Build evidence packets', 'Assemble full passages around holdings / rules rather than raw top-k snippets. Keep a ledger of every document, passage, and tool response brought into context.'],
            ['Synthesize with constraints', 'Require proposition IDs, mandatory citations, explicit counterauthority, and an “insufficient authority” option. Prohibit free-form citations unavailable in the ledger.'],
            ['Verify then review', 'Run a source-support check: does this passage support this statement, is it current, and does the citation resolve? The lawyer still assesses relevance and strategy.']
          ]
        },
        {
          title: 'Tabular Analysis',
          prompt: '“Across these 4,000 contracts, answer 40 diligence questions. Make every yes / no / unclear cell footnoted to the source.”',
          result: 'A dynamic review table where the unit of work is <em>document × question</em>, with coverage and evidence visible.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Create a question schema', 'Each column specifies scope, allowable answer types, required evidence, confidence / unclear behavior, and how to normalize values.'],
            ['Partition for scale', 'Fan out documents / questions with shared task IDs. Keep per-cell lifecycle state: queued, parsed, answered, verified, uncertain, reviewed.'],
            ['Triage cheaply', 'Use rules / classifiers / metadata to avoid expensive full reasoning where a question is clearly inapplicable, while retaining an audit trail for the negative decision.'],
            ['Answer over local evidence', 'Retrieve / read bounded document context per cell, then use a legal-focused model to produce a typed answer and cited evidence span.'],
            ['Validate cells', 'Check the cited span exists, answer format is legal, the evidence supports the label, and confidence / uncertainty is calibrated.'],
            ['Enable review as computation', 'Filtering, correction, adding questions, and rerunning subsets should preserve old runs and make coverage / changes explicit.']
          ]
        },
        {
          title: 'Brief / draft builder',
          prompt: '“Draft a motion section using the selected arguments, matter facts, and currently valid authority. Leave disputed facts clearly labeled.”',
          result: 'A source-aware drafting pipeline where legal authority and factual record have different provenance and validation rules.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Separate source types', 'Facts come from the matter record; propositions of law come from current authority; model language / how-to guidance is not treated as controlling law.'],
            ['Create an argument map', 'Associate each claim with required elements, supporting / contrary facts, candidate authority, and a citation status before prose generation.'],
            ['Draft under a schema', 'Generate headings, rule, application, and counterargument sections with a structured claim-to-evidence map rather than one unconstrained completion.'],
            ['Check factual assertions', 'Every assertion about the record must map to exhibit / document evidence; unsupported text is highlighted or omitted.'],
            ['Check legal assertions', 'Each legal statement maps through the citation ledger to an authoritative passage / current treatment check.'],
            ['Preserve attorney agency', 'Only the lawyer selects theory, factual characterization, and filing decision; the system makes those choice points obvious rather than quietly resolving them.']
          ]
        }
      ],
      reconstruction: [
        {
          title: 'Citations are structured edges',
          text: 'Represent <code>claim → source → exact passage → metadata → verification result</code> in a ledger. Render the citation from metadata; never let the generative model create the sole canonical case name / reporter / pin cite.'
        },
        {
          title: 'Authority-aware hybrid retrieval',
          text: 'Use text / vector retrieval plus legal metadata, citation graph traversal, jurisdiction / date filters, editorial concepts, and current-treatment services. A semantic neighbor is not necessarily good law.'
        },
        {
          title: 'Plans are observable state',
          text: 'Persist the task plan, tool calls, retrieved source set, coverage gaps, and verifier outcomes as a review trail. Do not expose or depend on raw hidden chain-of-thought as a product control.'
        }
      ],
      pipeline: [
        { title: '1 · Curate authority', text: 'Ingest editorially managed legal content and updates with stable citations, hierarchy, jurisdiction, dates, treatment / relationship metadata, and source licenses.' },
        { title: '2 · Join firm context', text: 'Connect matter documents / precedent with permissions, version / source labels, and clear separation from authoritative legal content.' },
        { title: '3 · Research / reason', text: 'Plan query graph → execute typed source tools → assemble evidence packets → generate claim schema → attach ledger citations.' },
        { title: '4 · Verify / deliver', text: 'Validate source existence / support / treatment; write versioned report, table, or Word draft with reviewer notes and task provenance.' }
      ],
      interview: {
        question: 'Design a deep-research system that produces a jurisdiction-specific memo lawyers can cite and rely on.',
        framing: 'Say “I will design a legal evidence system with an AI synthesis layer,” not “I will make a search chatbot.” Legal currency, hierarchy, jurisdiction, and proposition support are first-class data problems.',
        bullets: [
          '<strong>Authority ingestion:</strong> acquire licensed / official source data with stable IDs, legal hierarchy, effective / decision dates, treatment status, update feeds, and editorial metadata.',
          '<strong>Query plan:</strong> make the agent produce a typed research plan; restrict tools to authoritative sources and pass jurisdiction / cutoff / factual assumptions into every retrieval call.',
          '<strong>Retrieval:</strong> combine exact citations / citations graph / legal taxonomy / keyword / embeddings. Rerank for controlling authority and proposition-bearing passages, not generic semantic similarity.',
          '<strong>Grounded synthesis:</strong> generate a claim graph where each material sentence references one or more retrieved source spans. Refuse / mark unknown if evidence is absent or conflicting.',
          '<strong>Verification:</strong> independently test citation resolve, jurisdiction, currency, and whether the span entails the claim. Review against a lawyer-authored gold memo set and adversarial counterauthority cases.'
        ]
      },
      evals: [
        { title: 'Authority retrieval', text: 'Controlling-authority recall, jurisdiction / date accuracy, treatment freshness, counterauthority recall, and passage-level relevance.' },
        { title: 'Groundedness', text: 'Citation existence, source-support / entailment, unsupported material-claim rate, misattribution rate, and correct refusal rate.' },
        { title: 'Table execution', text: 'Cell coverage, answer schema validity, per-cell evidence precision, unclear-state calibration, and reviewer correction / document.' },
        { title: 'Research utility', text: 'Attorney task time, missed-authority rate, plan efficiency, citation-verification time, and work-product acceptability.' }
      ],
      sourceIds: ['cc-launch', 'cc-features', 'cc-ledger', 'cc-authority']
    },

    {
      id: 'legora',
      name: 'Legora aOS',
      sourceSystem: 'Legora',
      color: '#b8f376',
      type: 'Legal agentic operating system · cross-workflow execution',
      subtitle: 'An agentic legal work layer spanning intake, drafting, research, document review, workflows, firm knowledge, integrations, and client collaboration.',
      thesis: '<strong>Architectural center:</strong> an orchestration and governance plane. Legora’s public description explicitly foregrounds tool routing, control flow, memory management, model selection, guardrails, Skills, and parallel specialist agents — the “operating system” framing is about coordinating legal work, not simply answering questions.',
      matrix: {
        job: 'End-to-end legal intake, research, review, drafting, diligence, workflow execution',
        data: 'DMS / knowledge / matter systems + playbooks / precedents + operational work state',
        model: 'Publicly says model selection is part of harness; exact foundation models undisclosed',
        orchestration: 'Planner + legal agent harness + Skills + tool graph + subagents + human gates',
        proof: 'Ethical walls, permission carry-through, citations, full audit trail, configurable approval'
      },
      kpis: [
        { label: 'Data gravity', text: 'Institutional legal knowledge plus the systems where tasks, matters, and documents already live' },
        { label: 'Primary loop', text: 'Request → contextualize → plan / delegate → tool execution → review → deliver / learn' },
        { label: 'Trust primitive', text: 'Policy-enforced context and action traces across systems, not only output quality' }
      ],
      facts: [
        {
          title: 'aOS describes the orchestration layer directly.',
          text: 'Legora says its agentic harness handles tool routing, control flow, memory management, model selection, and guardrails, and can deploy specialist sub-agents in parallel for multi-step workflows.',
          source: 'legora-aos'
        },
        {
          title: 'Institutional know-how is an explicit input.',
          text: 'Legora says playbooks, precedent libraries, clause banks, and negotiated positions are layered into agent actions. Its Skills are described as Markdown instructions capturing team standards, processes, and preferences.',
          source: 'legora-skills'
        },
        {
          title: 'Access policy is presented as architecture.',
          text: 'Legora says ethical walls and role-based access control protect matters / projects, with audit trails for tool calls, file access, and agent action.',
          source: 'legora-aos'
        },
        {
          title: 'Intake makes the human-action boundary configurable.',
          text: 'Legora describes Slack Intake as asking for missing information, creating tracked tasks, preparing work through Skills / playbooks, and defaulting to lawyer review; routine pre-approved work can have different completion rules.',
          source: 'legora-intake'
        }
      ],
      unknown: 'Legora is unusually explicit about the capabilities of its harness, but it does not publicly name all underlying model providers, private memory topology, sub-agent prompts, tool-selection policy, or cross-tenant execution architecture. “Memory” in a product description should never be treated as an excuse to persist confidential data without retention and permission design.',
      nodes: [
        { title: 'Request channels', sub: 'Slack · Outlook · web · Word', status: 'public' },
        { title: 'Identity / ethical wall', sub: 'role · matter · action scope', status: 'public' },
        { title: 'Context & Skills', sub: 'DMS · precedent · playbooks', status: 'public' },
        { title: 'Agentic harness', sub: 'plan · route · memory · models', status: 'public' },
        { title: 'Specialist tools', sub: 'search · review · draft · task', status: 'public' },
        { title: 'Audited delivery', sub: 'approval · write-back · trace', status: 'public' }
      ],
      scenarios: [
        {
          title: 'In-house intake',
          prompt: 'In Slack: “Can Sales sign this customer’s NDA today?”',
          result: 'A tracked, permissioned task that gathers missing facts, chooses a low-risk or lawyer-review path, and returns a traceable response.',
          activeNodes: [0, 1, 2, 3, 4, 5],
          steps: [
            ['Authenticate + identify scope', 'Resolve requester, company, matter / account, jurisdiction, and authorization before touching precedent or documents.'],
            ['Classify the request', 'An intake classifier maps the message to NDA / commercial request / urgency and assesses whether mandatory data is missing.'],
            ['Ask targeted questions', 'Use a form / conversational state machine for counterparty paper, entity, governing law, deal size, timing, and acceptable fallback; do not let the agent guess.'],
            ['Load only approved context', 'Retrieve the relevant Skill, current playbook, clause library, account history, and accessible documents through policy-filtered connectors.'],
            ['Plan / execute bounded tools', 'The harness may compare paper, build a redline, assign an owner, or draft an answer. The policy engine controls whether each tool action is allowed.'],
            ['Apply approval level', 'Low-risk auto-complete is an explicit policy with tests; otherwise a lawyer sees evidence, redline, source context, and proposed reply before delivery.']
          ]
        },
        {
          title: 'Agentic due diligence',
          prompt: '“Review this data room, create a diligence tracker, flag change-of-control and privacy issues, and draft a client update.”',
          result: 'A fan-out / fan-in task graph in which document review, issue aggregation, source verification, and drafting are individually observable.',
          activeNodes: [1, 2, 3, 4, 5],
          steps: [
            ['Gate the corpus', 'Connect to data room through existing permission model and snapshot the allowed files / versions. An ethical wall is applied before retrieval and after any sync change.'],
            ['Compile the Skill', 'A reusable diligence Skill supplies issue taxonomy, definitions, severity, report format, escalation policy, client tone, and prohibited actions.'],
            ['Create a durable plan', 'Planner creates a task graph: inventory → shard review → extract evidence → dedupe / resolve → reviewer checkpoint → client-update draft.'],
            ['Delegate specialists', 'Parallel workers perform constrained issue extraction on shards. They report typed findings, evidence IDs, confidence, and reasons — never just prose.'],
            ['Aggregate and challenge', 'A merger agent clusters duplicates / contradictions; a verifier agent checks source support and a coverage service detects unreviewed documents.'],
            ['Deliver under approval', 'The system writes a tracker / draft only to authorized location after user approval. Full task, tool, source, and action logs remain reviewable.']
          ]
        },
        {
          title: 'Firm playbook redline',
          prompt: '“Apply our supplier MSA playbook, consider the last negotiated position, and prepare a response for partner review.”',
          result: 'A contextual agent workflow where firm expertise is versioned and treated as governed input, not hidden “memory.”',
          activeNodes: [1, 2, 3, 4, 5],
          steps: [
            ['Resolve knowledge scope', 'Find the right legal entity, practice group, counterparty, deal type, and applicable Skill / playbook version; deny inaccessible precedent.'],
            ['Separate standards from history', 'Use canonical playbook rules for policy; use prior negotiations as contextual examples with clear labels. Do not silently turn a prior exception into a standard.'],
            ['Plan clause-level work', 'Create clause tasks with severity / owner / fallback selection. Retrieve exact source sections and selected precedent before model generation.'],
            ['Use tool-mediated editing', 'Draft proposed changes through a document-editing tool that emits diffs and comments instead of allowing an agent to overwrite the source document blindly.'],
            ['Validate output', 'Check sources, defined terms, conflicts between edits, policy compliance, and document formatting. Fail closed if context is unavailable or contradictions remain.'],
            ['Route to reviewer', 'Partner receives an issue list, redline, rationale, source / precedent links, and the ability to accept, reject, or alter each decision.']
          ]
        }
      ],
      reconstruction: [
        {
          title: 'Treat the harness as a workflow engine',
          text: 'Persist a task DAG with explicit state, tool contracts, retry / idempotency behavior, budgets, and authorization scopes. An “agent” should not be a while-loop that can keep calling tools until it feels done.'
        },
        {
          title: 'Context policy precedes model policy',
          text: 'Every connector response needs a policy filter and provenance envelope before it can join the context window. Context selection is where most confidentiality failures occur; prompts cannot fix an overbroad retrieval set.'
        },
        {
          title: 'Skills need lifecycle management',
          text: 'Version, test, approve, scope, and revoke Skills like code / policies. Run a sandbox suite before enabling automatic behavior; attach every run to the precise Skill and playbook revision.'
        }
      ],
      pipeline: [
        { title: '1 · Govern connectors', text: 'Register systems of record, map user / group / matter permissions, retain access provenance, and process permission revocations / ethical-wall updates.' },
        { title: '2 · Compile context', text: 'Version Skills / playbooks / templates; retrieve policy-filtered matter knowledge; assemble a task-scoped context bundle with source and expiry metadata.' },
        { title: '3 · Orchestrate', text: 'Plan a bounded DAG, select models / tools, run specialists in parallel, persist intermediate artifacts, enforce budgets / approvals / idempotency.' },
        { title: '4 · Audit & improve', text: 'Record tool calls, file access, source spans, decisions, output diffs, approvals, failures, and user corrections; use a safe eval / release pipeline.' }
      ],
      interview: {
        question: 'Design an agentic legal-intake platform that works in Slack, can access a DMS and CLM, and may complete only pre-approved low-risk requests.',
        framing: 'The hard design is authorization choreography: what data may enter context, what an agent can do, who must approve, and how you prove later that it followed those rules.',
        bullets: [
          '<strong>Policy model:</strong> define principals, resources, matters / ethical walls, purposes, actions, risk tiers, and approval authorities. Evaluate policy at every tool call—not only at login.',
          '<strong>Task state machine:</strong> received → needs-info → planned → executing → needs-review → approved / rejected → delivered; persist state with idempotency keys and immutable event log.',
          '<strong>Tool contracts:</strong> give agents typed tools with narrow capabilities (search, compare, draft, create task, write draft). Separate reversible drafts from external sends / signatures.',
          '<strong>Context / memory:</strong> build short-lived task memory and curated / versioned knowledge references. Make retention, redaction, residency, and deletion explicit; never call a giant latent memory “safe.”',
          '<strong>Release safety:</strong> test Skills and policies in a sandbox, replay logged cases, use canary tenants / feature flags, measure tool / policy failures, and maintain a human kill switch.'
        ]
      },
      evals: [
        { title: 'Policy safety', text: 'Cross-wall retrieval blocks, least-privilege tool use, revocation propagation, action-authorization accuracy, and complete audit events.' },
        { title: 'Agent execution', text: 'Plan completion, tool schema validity, retries / idempotency, budget adherence, loop / runaway rate, and safe stop / escalation behavior.' },
        { title: 'Knowledge fit', text: 'Correct Skill / playbook selection, version adherence, accessible-precedent precision, and policy drift / stale-context detection.' },
        { title: 'Human workflow', text: 'Time to triage, approval burden, acceptance / edit rate, user overrides, task leakage, and client-facing error severity.' }
      ],
      sourceIds: ['legora-aos', 'legora-agent', 'legora-skills', 'legora-intake', 'legora-integrations']
    }
  ],

  referenceStack: [
    { index: '01', color: '#ffbb8c', mode: 'System of record', title: 'Permissioned inputs', text: 'Documents, messages, records, sources, and identities enter with tenant / matter / purpose / retention metadata.' },
    { index: '02', color: '#72e7d0', mode: 'Deterministic service', title: 'Parse & normalize', text: 'OCR, layout, sectioning, entities, versions, dates, fields, source spans, and document lineage.' },
    { index: '03', color: '#8da5ff', mode: 'Evidence service', title: 'Retrieve & reason over sources', text: 'Hybrid / graph retrieval, legal metadata, reranking, context packaging, and permission filtering before model context.' },
    { index: '04', color: '#f294ba', mode: 'Probabilistic service', title: 'Models & agents', text: 'Task route, plan, tool calls, extraction, comparison, synthesis, drafting, and explicit uncertainty.' },
    { index: '05', color: '#f4dd75', mode: 'Safety service', title: 'Verify & govern', text: 'Schema / source checks, citations, policy gates, evals, audit logs, rate / cost budgets, and approval rules.' },
    { index: '06', color: '#b8f376', mode: 'Human system', title: 'Review & learn', text: 'Lawyer / staff queue, corrections, dispositions, playbook updates, gold data, monitoring, and release control.' }
  ],

  lenses: [
    {
      label: 'Lens: trust',
      title: 'Where does a claim come from?',
      text: '<strong>Design move:</strong> make every material output item carry a source handle: document / page / paragraph or authority ID / passage, retrieval timestamp, policy / model version, and verification status. Then force the UI to make “no evidence” visible.'
    },
    {
      label: 'Lens: cost',
      title: 'Where should expensive reasoning run?',
      text: '<strong>Design move:</strong> parse / classify / cache once, cheaply triage the corpus, and reserve long-context / agentic reasoning for ambiguous candidates. Batch document work, persist intermediate artifacts, and rerun only affected cells.'
    },
    {
      label: 'Lens: confidentiality',
      title: 'What may enter the context window?',
      text: '<strong>Design move:</strong> enforce tenant, matter, ethical-wall, and purpose rules in retrieval / connector services. Do not retrieve broadly and hope system prompts prevent disclosure. Log every context source.'
    },
    {
      label: 'Lens: legal quality',
      title: 'How do you measure useful correctness?',
      text: '<strong>Design move:</strong> score the pipeline at the unit that matters: extracted field + span, research proposition + source, document × question cell, or task transition. Separate retrieval misses, reasoning mistakes, and presentation problems.'
    },
    {
      label: 'Lens: autonomy',
      title: 'What is allowed to change the world?',
      text: '<strong>Design move:</strong> classify actions as read, draft, reversible write, external send, and irrevocable / high-impact. Put model output behind a policy-controlled state machine and require stronger authority as impact increases.'
    }
  ],

  drills: [
    {
      prompt: 'Design a legal-AI clause-review feature that works in Word and suggests redlines against a company playbook.',
      answer: [
        '<strong>Input contract:</strong> Word document version, document type, deal metadata, side / jurisdiction, selected playbook revision, and user / matter permission.',
        '<strong>Core representation:</strong> parse sections / clauses / defined terms; store raw text spans and a typed issue schema. Compile playbook to deterministic rules + approved examples + escalation metadata.',
        '<strong>Pipeline:</strong> clause router → exact / semantic policy comparison → supported finding → constrained proposed diff → source / playbook link → reviewer approval.',
        '<strong>Safety + eval:</strong> native tracked-change draft only; no auto-send. Measure clause recall, false-positive burden, source support, redline acceptance / edit rate, and damaging false negatives.'
      ]
    },
    {
      prompt: 'Design a plaintiff-firm assistant that builds medical chronologies and finds treatment gaps without practicing medicine.',
      answer: [
        '<strong>Evidence first:</strong> ingest page-level records / bills with OCR quality, source page, document type, matter scope, and immutable evidence IDs.',
        '<strong>State model:</strong> derive a versioned timeline of date, provider, event, condition, procedure, bill, and contradiction. Separate observed record text from inferred case facts.',
        '<strong>Workflow:</strong> high-recall candidate extraction → temporal / provider reconciliation → cited chronology → gap candidates with uncertainty → staff review queue. Never label a finding as a medical diagnosis.',
        '<strong>Evaluation:</strong> event extraction / ordering, bill-to-record match, citation precision, gap sensitivity at review capacity, correction rate, and cross-matter-access tests.'
      ]
    },
    {
      prompt: 'Design an AI legal-research agent that cannot fabricate case citations.',
      answer: [
        '<strong>Closed evidence universe:</strong> only typed search tools can return legal sources; each returns a stable authority ID, date / treatment metadata, and exact passages.',
        '<strong>Plan and retrieval:</strong> route by jurisdiction, issue, hierarchy, and temporal scope; combine citation / keyword / taxonomy / semantic retrieval and collect counterauthority.',
        '<strong>Citation ledger:</strong> generation emits claim IDs that can attach only to source IDs from the current ledger. Render citation text from metadata, not model prose.',
        '<strong>Independent verifier:</strong> validate source existence, current treatment, jurisdiction, passage support, and unsupported-claim refusal. Evaluate against lawyer-authored gold memos and adversarial prompts.'
      ]
    },
    {
      prompt: 'Design a legal agent that can take a Slack request through to a low-risk automated answer but sends complex work to counsel.',
      answer: [
        '<strong>Policy:</strong> model principal, matter / ethical wall, purpose, requested action, risk class, allowed tools, and required approval role. Check it on every tool call.',
        '<strong>Task engine:</strong> durable state machine: received → clarify → plan → execute → review / auto-complete → deliver; add idempotency, retries, budgets, and an emergency kill switch.',
        '<strong>Context:</strong> only retrieve permitted, versioned Skills / playbooks / documents. Treat communications as untrusted data, not instructions.',
        '<strong>Observability:</strong> log source IDs, tool calls, action decisions, policy results, output version, and human override; replay runs in sandbox before widening autonomy.'
      ]
    }
  ]
};
