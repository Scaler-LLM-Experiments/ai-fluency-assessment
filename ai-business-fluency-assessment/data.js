const ROLES = [
  "Product Manager",
  "Business / Strategy Consultant",
  "Operations / Supply Chain Manager",
  "Marketing / Growth Manager",
  "Tech Professional transitioning to Business",
  "Founder / Entrepreneur",
  "Finance / Commercial Manager",
];

const ROLE_DESCS = {
  "Product Manager": "Building products, defining roadmaps",
  "Business / Strategy Consultant": "Advising clients, driving strategy",
  "Operations / Supply Chain Manager": "Optimizing processes, managing logistics",
  "Marketing / Growth Manager": "Running campaigns, driving growth",
  "Tech Professional transitioning to Business": "Moving from code to commerce",
  "Founder / Entrepreneur": "Building a company from scratch",
  "Finance / Commercial Manager": "Managing money, driving deals",
};

const ROLE_TRANSITIONS = {
  "Product Manager": "AI-First Product Leader",
  "Business / Strategy Consultant": "AI Strategy Advisor",
  "Operations / Supply Chain Manager": "AI-Driven Operations Leader",
  "Marketing / Growth Manager": "AI-Powered Growth Strategist",
  "Tech Professional transitioning to Business": "Technical Business Leader",
  "Founder / Entrepreneur": "AI-Native Founder",
  "Finance / Commercial Manager": "AI-Augmented Finance Leader",
};

const ROLE_TRANSITION_SKILLS = {
  "Product Manager": [
    {label:"AI-First Spec Writing", detail:"Generate PRDs, user stories & edge cases with prompt chains in Claude"},
    {label:"AI Agent Design for Products", detail:"Build multi-agent systems with tool-use, orchestration & fallback paths"},
    {label:"AI-Powered User Research", detail:"Auto-synthesize NPS, reviews & Gong calls into roadmap-ready insights"},
    {label:"Prompt Playbook Engineering", detail:"Build reusable prompt libraries your entire PM team runs on"},
    {label:"AI Feature Evaluation", detail:"Define confidence thresholds, hallucination guardrails & human-in-the-loop flows"},
    {label:"AI Analytics Pipelines", detail:"SQL generation → cohort analysis → churn prediction without the data team"},
    {label:"AI Competitive Intelligence", detail:"Weekly auto-monitoring of competitor changelogs, pricing & feature launches"},
    {label:"AI Stakeholder Automation", detail:"Sprint reviews, exec summaries & board narratives auto-generated from data"},
    {label:"AI Productivity OS", detail:"Meeting prep → action items → Jira tickets — fully AI-orchestrated"},
    {label:"AI Adoption Leadership", detail:"Team training, tool policy, prompt playbooks & measurable productivity gains"},
  ],
  "Marketing / Growth Manager": [
    {label:"AI Copy Generation at Scale", detail:"50+ ad variations per campaign across Google, Meta & LinkedIn in minutes"},
    {label:"AI Campaign Intelligence", detail:"Feed ROAS data → get budget reallocation, channel strategy & anomaly alerts"},
    {label:"AI-Powered CRO", detail:"Auto-audit landing pages, generate test hypotheses from heatmap data"},
    {label:"AI Content Engines", detail:"SEO brief → first draft → social snippets → email teasers in one workflow"},
    {label:"AI Creative Benchmarking", detail:"Extract winning patterns from top ads — hooks, CTAs, imagery, copy length"},
    {label:"AI Lifecycle Automation", detail:"Dynamic email sequences that adapt to behavior signals in real-time"},
    {label:"Prompt Playbook Engineering", detail:"Campaign-type prompt chains your whole team uses daily"},
    {label:"AI Marketing Analytics", detail:"Multi-channel attribution, ROAS breakdowns & reallocation recs in 30 min"},
    {label:"AI Productivity OS", detail:"Campaign briefs from meeting notes, auto-generated weekly reports"},
    {label:"AI Adoption Leadership", detail:"Build the AI-first marketing org — playbooks, tools, culture"},
  ],
  "Business / Strategy Consultant": [
    {label:"AI-Powered Client Research", detail:"Annual reports → structured strategy analysis in hours, not weeks"},
    {label:"AI Strategy Synthesis", detail:"Porter's, SWOT & value chain via prompt chains that produce deck-ready output"},
    {label:"AI Financial Case Building", detail:"Assumption frameworks, scenario analysis & board-ready narratives from raw data"},
    {label:"AI Deliverable Acceleration", detail:"50-page strategy reports in 4 days using AI storyboarding & synthesis"},
    {label:"AI Market Sizing", detail:"Bottom-up + top-down models with confidence intervals & source tracking"},
    {label:"AI Interview Analysis", detail:"Transcription → theme extraction → cross-stakeholder pattern synthesis"},
    {label:"AI Competitive Monitoring", detail:"Auto-track competitor moves, hiring, pricing — weekly intel briefs"},
    {label:"Prompt Playbook Engineering", detail:"Client-ready prompt chains for every workstream in your practice"},
    {label:"AI Productivity OS", detail:"Meeting briefs, follow-up drafts & project knowledge bases on autopilot"},
    {label:"AI Adoption Leadership", detail:"Practice-wide AI playbooks, analyst training & margin improvement"},
  ],
  "Operations / Supply Chain Manager": [
    {label:"AI Demand Forecasting", detail:"Multi-variable models with seasonality that improve accuracy 10-15%"},
    {label:"AI Process Optimization", detail:"Feed cycle times & defect rates → get bottleneck analysis & fix recommendations"},
    {label:"AI Supplier Intelligence", detail:"Auto-generated scorecards, risk assessments & negotiation strategies"},
    {label:"AI Inventory Management", detail:"Dynamic safety stock, predictive stockouts & dead stock alerts across 1000s of SKUs"},
    {label:"AI Logistics Optimization", detail:"Route planning, carrier selection & load optimization saving 10-15% on freight"},
    {label:"AI Quality & Compliance", detail:"Predictive quality models + auto-generated audit-ready documentation"},
    {label:"Prompt Playbook Engineering", detail:"Ops-specific prompt chains with data verification guardrails"},
    {label:"AI Operational Reporting", detail:"Raw KPIs → narrative summaries with exceptions & recommendations in 30 min"},
    {label:"AI Productivity OS", detail:"Daily exception surfacing, supplier comms & meeting prep on autopilot"},
    {label:"AI Adoption Leadership", detail:"Map AI use cases across ops, deploy tools, train team, measure ROI"},
  ],
  "Tech Professional transitioning to Business": [
    {label:"AI-Powered Business Storytelling", detail:"Feed tech specs → get exec narratives, board decks & business cases"},
    {label:"AI Financial Analysis", detail:"P&L deep-dives, unit economics modeling & CAC/LTV analysis using Claude"},
    {label:"AI Product Strategy", detail:"Generate competitive analyses, mini-PRDs & market sizing with AI frameworks"},
    {label:"AI Business Case Engineering", detail:"ROI models, payback calculations & risk quantification that get funded"},
    {label:"AI Cross-Functional Fluency", detail:"Analyze marketing funnels, sales pipelines & ops metrics with AI assistance"},
    {label:"AI Stakeholder Intelligence", detail:"Influence mapping, meeting prep & audience-tailored communication at scale"},
    {label:"AI-Powered GTM Design", detail:"Go-to-market frameworks, positioning & channel strategy using AI synthesis"},
    {label:"Prompt Playbook Engineering", detail:"Tech→business translation prompts that leverage your engineering depth"},
    {label:"AI Productivity OS", detail:"Dual-purpose stack — Cursor for code, Claude for business, Perplexity for research"},
    {label:"AI Adoption Leadership", detail:"Bridge tech & business — enable AI across every function in your org"},
  ],
  "Founder / Entrepreneur": [
    {label:"AI-Powered GTM Execution", detail:"Positioning, channel strategy & launch messaging across platforms from one brief"},
    {label:"AI Investor Relations", detail:"Auto-generated updates, board prep, pitch narratives & Q&A anticipation"},
    {label:"AI Hiring & People Ops", detail:"JDs, screening rubrics, interview scorecards & onboarding — 2x faster"},
    {label:"AI Financial Command", detail:"Revenue projections, scenario modeling & runway management like a funded Series B"},
    {label:"AI Product Velocity", detail:"User stories from interviews → prioritization → specs developers build from"},
    {label:"AI Customer Intelligence", detail:"Call synthesis → churn signals → upsell detection → personalized outreach"},
    {label:"AI Operations at Scale", detail:"SOPs, vendor frameworks & compliance from ad-hoc chaos to real systems"},
    {label:"Prompt Playbook Engineering", detail:"Founder prompt library — every repeating process has an AI workflow"},
    {label:"AI Productivity OS", detail:"Virtual co-founder — think, communicate, analyze & execute 12+ hrs/week faster"},
    {label:"AI-First Culture Building", detail:"Team playbooks, hiring for AI fluency, productivity measurement"},
  ],
  "Finance / Commercial Manager": [
    {label:"AI Financial Modeling", detail:"Model structures, Excel formulas & sensitivity analysis at 2x speed"},
    {label:"AI Dynamic Forecasting", detail:"Rolling forecasts that auto-adjust, flag variances & generate commentary"},
    {label:"AI Deal Intelligence", detail:"Scenario modeling, pricing benchmarks & term sheet analysis in minutes"},
    {label:"AI Compliance Automation", detail:"Regulatory monitoring → impact assessment → action plans → policy drafts"},
    {label:"AI Executive Reporting", detail:"Auto-generated narratives — board version, exec version, ops version"},
    {label:"AI Treasury Management", detail:"Cash flow modeling with receivable aging, seasonal patterns & liquidity alerts"},
    {label:"AI Cost Intelligence", detail:"Spend analytics, vendor risk scoring & procurement negotiation strategies"},
    {label:"Prompt Playbook Engineering", detail:"Finance-specific prompt chains with hallucination guardrails built in"},
    {label:"AI Productivity OS", detail:"Recurring reports, dataset analysis & meeting briefs fully automated"},
    {label:"AI Adoption Leadership", detail:"Map AI to every finance process, train team, measure & present ROI"},
  ],
};

const ROLE_SKILLS = {
  "Product Manager": [
    {
      area: "AI-assisted PRD & spec writing",
      levels: [
        "You write PRDs manually in Google Docs. AI hasn't entered your spec workflow.",
        "You've used ChatGPT to brainstorm feature ideas or clean up PRD language. You copy-paste and edit.",
        "You have a go-to prompt that generates PRD sections — problem statement, user stories, success metrics, edge cases. You iterate with the model until the spec is tight. Your PRDs come out 2x faster.",
        "You've built a PRD template as a system prompt. You feed it customer research, ticket data, and competitive context — and it generates a first draft that your engineering team actually reviews seriously. You use AI to stress-test your own specs by asking \"what will break?\"",
        "Your team's spec process runs through AI. New PMs on your team use your prompt templates. You've integrated spec generation into your workflow tools (Notion AI, Linear, etc.) and the output quality is indistinguishable from a senior PM's manual work.",
      ],
    },
    {
      area: "Using AI agents for product research & discovery",
      levels: [
        "You Google for competitor info and manually read through reviews, forums, and reports.",
        "You've asked ChatGPT or Perplexity to summarize a competitor's product page or a market report.",
        "You run structured research sessions — you prompt AI with specific research briefs (\"Analyze the onboarding flows of these 5 competitors and identify the 3 biggest UX gaps\"). You use Perplexity for real-time data and Claude for synthesis.",
        "You've built a research workflow: competitive monitoring prompts you run weekly, customer feedback synthesis pipelines (app reviews → themes → opportunities), and you combine multiple AI tools to triangulate insights.",
        "You've built or spec'd an AI-powered research system for your product team. Agents auto-monitor competitor changelogs, synthesize NPS verbatims, and surface opportunity areas. You've moved from \"I use AI to research\" to \"AI runs our research layer.\"",
      ],
    },
    {
      area: "Prompt engineering for product workflows",
      levels: [
        "You type natural language into ChatGPT and take whatever comes out.",
        "You've learned to add context — \"You are a senior PM at a B2B SaaS company\" — and you get noticeably better outputs.",
        "You write structured prompts with role, context, constraints, and output format. You test variations. You've written 10+ prompts you reuse regularly — for user story generation, bug triage summaries, release notes, and stakeholder updates.",
        "You design prompt chains — discovery prompt → PRD prompt → edge case finder → test case generator. You anticipate hallucination risks and add guardrails (\"Only cite data from the attached document\"). Your team uses your prompts.",
        "You've built a prompt playbook for your PM org. You understand when to use system prompts vs. few-shot examples vs. chain-of-thought. You've debugged enough prompts to predict which design choices matter for product work. You shape how your org interacts with LLMs.",
      ],
    },
    {
      area: "AI for user data analysis & product metrics",
      levels: [
        "You look at dashboards someone else built. You maybe pull basic numbers from Amplitude or Mixpanel.",
        "You've asked AI to explain a metric trend or write a SQL query for you.",
        "You regularly use AI to write SQL, analyze funnel data, build cohort analyses, and identify patterns in user behavior. You paste data into Claude and get actionable insights in minutes instead of waiting for the analytics team.",
        "You've built an analytics workflow where AI handles the heavy lifting — you feed it raw event data, retention tables, or survey responses, and it produces structured analyses with recommendations. You validate AI outputs against your product intuition and business logic.",
        "You've built or spec'd AI-powered analytics features into your product. Your team uses AI to run automated cohort analyses, churn prediction models, or feature adoption scoring. You've moved analytics from \"pull request to data team\" to \"self-serve with AI guardrails.\"",
      ],
    },
    {
      area: "Building & speccing AI-powered features",
      levels: [
        "You haven't been involved in defining or shipping AI features.",
        "You've seen AI features in other products and have opinions, but haven't written specs for one.",
        "You've written a PRD for an AI-powered feature — defined the user problem, the AI's role, success metrics, and edge cases. You understand that AI features need evaluation criteria, not just acceptance criteria.",
        "You actively collaborate with ML/AI engineers on feature design. You define fallback behavior, confidence thresholds, human-in-the-loop flows, and feedback loops. You've shipped at least one AI feature and learned from its failure modes.",
        "You lead AI product strategy at your company. You evaluate build vs. buy vs. fine-tune decisions. You've designed evaluation frameworks for AI features (accuracy, latency, cost, user trust). Your AI features have measurable business impact and you can articulate exactly why each design choice was made.",
      ],
    },
    {
      area: "AI agents: from basic automation to orchestrated systems",
      levels: [
        "You've heard of AI agents but haven't used or built one.",
        "You've tried a basic agent — maybe a GPT with custom instructions, or a simple Zapier AI workflow.",
        "You've built or spec'd an agent that handles a real task end-to-end: a customer support triage agent, a bug classification bot, or a research assistant that pulls data from multiple sources. It works, but it's brittle.",
        "Your agents are robust — they handle errors, have fallback paths, and you've tested them against edge cases. You chain agents together (Agent A's output feeds Agent B). You understand tool-use, function calling, and context window management.",
        "You've built an integrated agent system — a multi-agent workflow where specialized agents collaborate. You've designed the orchestration layer, defined agent boundaries, and measured system-level performance. You're the person your org comes to for \"how should we use agents for X?\"",
      ],
    },
    {
      area: "AI for stakeholder communication & alignment",
      levels: [
        "You write all your stakeholder emails, updates, and presentations manually.",
        "You've used AI to draft a status update or clean up a presentation.",
        "You use AI to generate weekly product updates, executive summaries, and board-ready narratives from raw data. You edit for voice and accuracy, but AI does the first 80%.",
        "You've built communication templates — AI generates your sprint reviews from Jira data, your monthly business reviews from metrics dashboards, and your strategy narratives from research docs. Your stakeholders don't know (or care) that AI helped.",
        "You've systematized product communication with AI. New PMs on your team use your templates. You've built workflows where AI translates technical updates into business language, customizes messaging for different audiences (eng vs. exec vs. customer), and maintains a consistent product narrative.",
      ],
    },
    {
      area: "AI-powered user feedback synthesis",
      levels: [
        "You read user feedback manually — support tickets, NPS comments, app reviews — one by one.",
        "You've pasted a batch of feedback into ChatGPT and asked for themes.",
        "You run structured feedback analysis — you prompt AI with your product context and taxonomy, feed it hundreds of reviews or tickets, and get a prioritized list of themes with supporting quotes. You do this monthly.",
        "You've built a feedback pipeline: raw data (Intercom, Zendesk, app reviews, Gong calls) → AI-powered theme extraction → opportunity scoring → prioritization input for your roadmap. It runs with minimal manual effort.",
        "You've productized feedback synthesis for your org. PMs, designers, and CS teams use the system you built. It auto-surfaces emerging issues, tracks sentiment trends over time, and connects user pain to revenue impact. Your roadmap decisions are visibly data-backed because of this system.",
      ],
    },
    {
      area: "Personal AI productivity system",
      levels: [
        "You open ChatGPT occasionally when you're stuck on something.",
        "You use 1–2 AI tools regularly — maybe ChatGPT for writing and Perplexity for research.",
        "You have a personal AI stack — specific tools for specific tasks. Claude for deep analysis, Perplexity for research, Notion AI for docs, Granola or Otter for meetings. You save 5+ hours/week.",
        "You've built a personal productivity OS. AI handles your meeting prep (auto-generates briefs from past notes + agenda), your writing (first drafts of everything from emails to strategy docs), and your research (competitive monitoring, market analysis). You've measured the time savings.",
        "You've built an integrated system — your personal AI workflow feeds your product work seamlessly. Meeting notes auto-generate action items that create Jira tickets. Research auto-populates your competitive dashboard. Your productivity system is something other PMs ask you about and try to replicate.",
      ],
    },
    {
      area: "Leading AI adoption in your product org",
      levels: [
        "You use AI individually. Your team doesn't have shared AI practices.",
        "You've shared an AI tip or tool recommendation in a team Slack channel.",
        "You've piloted an AI tool for your team — maybe an AI-powered user research tool, a Copilot setup, or an AI writing assistant. You got at least 3 teammates to adopt it.",
        "You've led AI adoption for your product team — defined which tools to use for what, created prompt templates, run training sessions, and measured adoption metrics. Your team is measurably more productive.",
        "You drive AI strategy for your product org. You've defined the AI toolkit policy, created an internal AI playbook, and built a culture where AI-assisted work is the default. You present AI productivity gains to leadership and influence org-wide AI adoption.",
      ],
    },
  ],

  "Marketing / Growth Manager": [
    {
      area: "AI for ad copy & creative production",
      levels: [
        "You write all ad copy manually. Every headline, description, and CTA is crafted from scratch.",
        "You've used ChatGPT to brainstorm headlines or generate copy variations for a campaign.",
        "You generate first-draft copy for all channels (Google, Meta, LinkedIn, email) with AI. You prompt with your ICP, value props, tone guidelines, and character limits. You produce 20 variations in the time it took to write 3 manually.",
        "You've built a copy generation system — you feed AI your best-performing ads, brand voice guidelines, and campaign brief, and it generates platform-specific copy that consistently beats your baseline CTR. You A/B test AI-generated vs. human-written copy.",
        "You run creative production at scale with AI. Your entire ad copy pipeline is AI-assisted — from brief to first draft to variations to localization. You've built prompt templates your team uses daily. You track which AI-generated hooks outperform and feed that back into the prompts.",
      ],
    },
    {
      area: "AI-powered campaign strategy & audience targeting",
      levels: [
        "You define audiences based on demographics, past campaign data, and gut feel.",
        "You've used AI to analyze past campaign performance or brainstorm new audience segments.",
        "You use AI to analyze your CRM/campaign data, identify high-converting segments, and suggest targeting strategies. You prompt with your funnel data and AI maps out audience-channel-message combinations you hadn't considered.",
        "You've built an AI-assisted campaign planning workflow — AI ingests your historical performance data, competitive landscape, and market signals, then generates a prioritized campaign plan with budget allocation recommendations.",
        "You've built an AI-powered growth intelligence system. It monitors campaign performance in real-time, surfaces anomalies, recommends reallocation, and generates strategic recommendations. Your marketing team operates on AI-generated insights, not just dashboards.",
      ],
    },
    {
      area: "AI for content marketing at scale",
      levels: [
        "You write all blog posts, newsletters, and content pieces manually.",
        "You've used AI to outline a blog post or generate a first draft that you heavily edited.",
        "You use AI to research topics, generate detailed outlines, write first drafts, and create social media repurposing — all from a single content brief. Your content output has 3x'd without adding headcount.",
        "You've built a content engine — AI generates content briefs from SEO data, writes drafts in your brand voice, creates social media snippets, email teasers, and meta descriptions. You edit for quality and publish. Your cost per content piece has dropped 60%.",
        "You run a full AI-powered content operation. Programmatic SEO pages, personalized email sequences, dynamic landing page copy — all AI-generated with human QA. You've built the prompts, templates, and workflows that your entire content team runs on.",
      ],
    },
    {
      area: "AI for creative benchmarking & design direction",
      levels: [
        "You brief designers manually and provide subjective feedback on creatives.",
        "You've used AI to generate mood boards, analyze competitor creatives, or get design feedback.",
        "You use AI to systematically benchmark competitor creatives — you feed it landing pages, ad creatives, and email designs and get structured analyses of visual patterns, copy frameworks, and UX choices. This directly informs your creative briefs.",
        "You've built a creative intelligence workflow — AI analyzes your top-performing creatives, identifies winning patterns (color, copy length, CTA placement, imagery style), and generates data-backed creative briefs for your design team.",
        "You've built an AI-assisted creative system where design briefs are auto-generated from performance data, AI generates creative variations (via Midjourney/DALL-E), and you test at a velocity that was previously impossible. Your creative hit rate has measurably improved.",
      ],
    },
    {
      area: "AI for conversion rate optimization",
      levels: [
        "You run A/B tests occasionally based on best practices or gut feel.",
        "You've used AI to analyze A/B test results or brainstorm landing page improvements.",
        "You use AI to audit landing pages — you feed it your page, funnel data, and competitor pages, and get specific recommendations for headline, CTA, social proof placement, and form optimization. You implement and test these systematically.",
        "You've built a CRO workflow with AI — it analyzes heatmap data, session recording summaries, and funnel metrics to generate prioritized optimization hypotheses. You run 3x more experiments because AI handles the analysis and ideation.",
        "You've built an AI-powered CRO system. AI generates landing page variations, writes test hypotheses from user behavior data, and prioritizes experiments by expected impact. Your conversion rates improve month-over-month because the system compounds learnings.",
      ],
    },
    {
      area: "Prompt engineering for marketing workflows",
      levels: [
        "You type basic requests into ChatGPT — \"Write me an email about X.\"",
        "You've learned to provide brand voice, audience context, and desired tone in your prompts.",
        "You write structured prompts with persona, brand guidelines, channel constraints, and performance benchmarks. You have 10+ reusable prompts for different marketing tasks — launch emails, ad copy, social posts, PR pitches.",
        "You build prompt chains for campaigns — audience research prompt → messaging framework prompt → copy generation prompt → variation prompt. You test across models (GPT-4 for strategy, Claude for long-form, etc.). Your team uses your prompts daily.",
        "You've built a marketing prompt playbook that your entire team runs on. Every campaign type has a prompt workflow. You've measured which prompts produce copy that converts vs. copy that just sounds good. You train new marketers on prompt-first workflows.",
      ],
    },
    {
      area: "AI for marketing analytics & attribution",
      levels: [
        "You look at dashboards in Google Analytics or your ad platform. You pull reports manually.",
        "You've used AI to explain a metric trend, build a UTM structure, or analyze campaign data.",
        "You regularly use AI to analyze multi-channel campaign data — you paste performance data into Claude and get channel-by-channel breakdowns, ROAS analysis, and budget reallocation recommendations. Decisions that took a day now take 30 minutes.",
        "You've built an analytics workflow where AI ingests your marketing data (ad spend, conversions, LTV, cohort data), generates weekly performance narratives, flags anomalies, and recommends actions. Your weekly reporting is 80% automated.",
        "You've built an AI-powered marketing intelligence layer. It connects to your data sources, generates real-time insights, predicts campaign performance, and auto-generates stakeholder reports. Your CMO gets AI-generated briefs that are more insightful than what the BI team manually produced.",
      ],
    },
    {
      area: "AI for email & lifecycle marketing",
      levels: [
        "You write every email manually and send to broad segments.",
        "You've used AI to draft email sequences or generate subject line variations.",
        "You use AI to generate complete lifecycle sequences — welcome series, nurture flows, re-engagement campaigns — with personalized copy for different segments. You test AI-generated subject lines against your manual ones.",
        "You've built an AI-powered email system — AI generates personalized content blocks based on user behavior, optimizes send times, and creates dynamic sequences that adapt based on engagement. Your email revenue per send has measurably increased.",
        "You run hyper-personalized lifecycle marketing with AI. Every email is dynamically generated based on user data, behavior signals, and predicted intent. You've built the content generation layer, the personalization logic, and the measurement framework. This is a competitive moat, not just an optimization.",
      ],
    },
    {
      area: "Personal AI productivity system for marketers",
      levels: [
        "You open ChatGPT when you need help writing something.",
        "You use 1–2 AI tools regularly — ChatGPT for copy, maybe Canva AI for quick graphics.",
        "You have a marketing AI stack — ChatGPT/Claude for copy and strategy, Perplexity for competitive research, Midjourney for creative concepts, AI transcription for customer call analysis. You save 6+ hours/week.",
        "You've built a marketing productivity OS — AI drafts your campaign briefs from meeting notes, generates your weekly reports from platform data, handles first-draft copy for every channel, and monitors competitors. You've measured and can prove the time savings.",
        "You've built an integrated system that other marketers want to copy. Your workflow is: AI monitors → AI analyzes → AI drafts → you decide → AI executes. You've become the \"AI marketing person\" in your org and others model their workflows on yours.",
      ],
    },
    {
      area: "Leading AI adoption in your marketing team",
      levels: [
        "You use AI individually. Your team writes and plans manually.",
        "You've shared an AI trick with your team — a prompt for ad copy, a tool for social scheduling.",
        "You've piloted AI tools for your marketing team — got 3+ people using AI for copy generation, research, or analytics. You've shown it saves time on real campaigns.",
        "You've restructured your team's workflow around AI — defined which tools to use for each stage of campaign production, created prompt libraries, and run training sessions. Campaign turnaround time has measurably decreased.",
        "You've built an AI-first marketing org. Every campaign runs through AI-assisted workflows. You've defined the AI toolkit, created the playbooks, and built a culture where AI-assisted output is the baseline. You present AI-driven efficiency gains and performance improvements to leadership.",
      ],
    },
  ],

  "Business / Strategy Consultant": [
    {
      area: "AI for client research & industry analysis",
      levels: [
        "You Google client companies, read annual reports, and manually build research decks.",
        "You've used ChatGPT to summarize an earnings call or a market report.",
        "You run structured research briefs through AI — \"Analyze this company's last 3 annual reports, identify strategic themes, map them against industry trends.\" You synthesize across multiple sources in hours, not days. Your research quality has visibly improved.",
        "You've built a client research workflow — AI ingests public filings, competitor data, news, and market reports, then generates structured analysis decks with themes, risks, and strategic options. You focus on insight, not information gathering.",
        "You've built an AI-powered research capability for your practice. Analysts use your prompt templates and workflows. Client research that took a team 2 weeks now takes 3 days. Partners notice the speed and depth improvement.",
      ],
    },
    {
      area: "AI for strategy framework application & synthesis",
      levels: [
        "You manually apply frameworks — Porter's Five Forces, SWOT, value chain analysis — building slides from scratch.",
        "You've used AI to populate a strategy framework with data or generate a first draft of a SWOT analysis.",
        "You prompt AI with structured inputs (industry data, competitive landscape, client specifics) and it generates framework-ready analysis that you refine. Your first-draft strategy decks are ready in half the time.",
        "You've built prompt chains for strategy work — data ingestion → framework application → insight extraction → recommendation generation. AI handles the analytical heavy-lifting, you focus on the \"so what\" and client-specific judgment.",
        "You've codified your firm's strategy methodology into AI workflows. Junior consultants use your system to generate first-draft analyses that would normally require a senior associate. You've changed how your team approaches strategy work.",
      ],
    },
    {
      area: "AI for financial modeling & business case development",
      levels: [
        "You build financial models in Excel from scratch. Every assumption, formula, and scenario is manual.",
        "You've used AI to explain a financial concept, check a formula, or brainstorm model assumptions.",
        "You use AI to build model structures — you describe the business case, and AI generates the assumption framework, revenue build-up logic, and sensitivity variables. You still build the model, but AI saves you 40% of the design work.",
        "You feed AI your data tables and it generates scenario analyses, waterfall charts, and executive summaries. You use AI to stress-test your assumptions — \"What breaks this business case? What are the hidden risks in these projections?\"",
        "You've built AI-assisted financial analysis workflows for your team. Analysts use your templates to generate model structures, validate assumptions against industry benchmarks, and produce board-ready financial narratives. The quality floor has risen across your practice.",
      ],
    },
    {
      area: "AI for presentation & deliverable production",
      levels: [
        "You build every client deck manually — writing, structuring, formatting, iterating.",
        "You've used AI to draft slide copy or reorganize a presentation narrative.",
        "You use AI to generate presentation narratives from raw analysis — you feed it your findings and it produces a storyline with slide-by-slide content, key messages, and supporting data points. You format and refine, but the thinking structure comes fast.",
        "You've built a deliverable production system — AI generates storyboards from project briefs, drafts executive summaries from detailed analyses, and creates appendix content from raw data. Your team delivers faster with higher narrative quality.",
        "You've systematized deliverable production for your practice. Templates, prompt workflows, and quality standards are codified. A 50-page strategy report that took 2 weeks of production work now takes 4 days. Clients consistently praise the insight density.",
      ],
    },
    {
      area: "AI for market sizing & opportunity assessment",
      levels: [
        "You research market sizes through Google, Statista, and industry reports — manually triangulating numbers.",
        "You've used AI to find market data or calculate a basic TAM/SAM/SOM.",
        "You use AI to build bottom-up and top-down market sizing models — you provide the logic framework and data sources, AI generates the calculations, sensitivity ranges, and comparable benchmarks. Your market sizing is faster and more rigorous.",
        "You've built a market sizing workflow — AI pulls comparable data, generates multiple estimation approaches, flags where your assumptions are weakest, and produces presentation-ready outputs with confidence intervals.",
        "You've codified market sizing into an AI-powered capability. Your team uses prompt templates that enforce rigor — multiple approaches, explicit assumptions, sensitivity analysis, and source tracking. Junior consultants produce partner-quality market sizing on their first try.",
      ],
    },
    {
      area: "Prompt engineering for consulting workflows",
      levels: [
        "You ask ChatGPT basic questions and accept whatever it gives you.",
        "You've learned to give detailed context — client industry, project scope, desired output format.",
        "You write structured prompts for each phase of consulting work — research, analysis, synthesis, recommendation. You have reusable prompts for client briefs, competitive analysis, and stakeholder interviews. You iterate until outputs are client-ready.",
        "You build prompt chains for complete workstreams — intake prompt → research prompt → analysis prompt → recommendation prompt → executive summary prompt. You anticipate where AI will hallucinate (made-up market data, fake company info) and add verification steps.",
        "You've built a consulting prompt playbook. Your firm uses your workflows. You train new consultants on prompt-first approaches. You understand which consulting tasks benefit from AI (research, synthesis, first-draft analysis) and which don't (client judgment, relationship nuance, political navigation).",
      ],
    },
    {
      area: "AI for interview synthesis & qualitative research",
      levels: [
        "You take manual notes in stakeholder interviews and write up findings by hand.",
        "You've used AI to transcribe an interview or summarize meeting notes.",
        "You run all client interviews through AI — transcription → theme extraction → quote identification → cross-interview pattern analysis. What took 2 hours of synthesis per interview now takes 20 minutes.",
        "You've built an interview analysis system — AI processes multiple interviews, identifies patterns across stakeholders, flags contradictions, and generates a structured findings report with supporting quotes. Your qualitative research is more rigorous because AI catches patterns humans miss.",
        "You've productized qualitative research for your practice. The interview-to-insight pipeline is systematized. Stakeholder research that took weeks now produces richer, better-structured findings in days. Partners use your system for every engagement.",
      ],
    },
    {
      area: "AI for competitive & due diligence analysis",
      levels: [
        "You manually research competitors — reading websites, analyst reports, and news articles one by one.",
        "You've used AI to summarize a competitor's strategy or compare two companies.",
        "You use AI to run structured competitive analyses — you feed it a framework (capabilities matrix, feature comparison, market positioning) and it generates a comprehensive competitive landscape from public data. You verify and add judgment.",
        "You've built competitive intelligence workflows — AI monitors competitor moves (product launches, hiring patterns, partnership announcements, pricing changes), generates weekly intelligence briefs, and flags strategic implications for your client.",
        "You've built a competitive intelligence capability for your firm. Due diligence analyses that required 3 analysts for 2 weeks now take 1 analyst for 4 days. Your AI-powered approach has become a differentiator in how your firm wins engagements.",
      ],
    },
    {
      area: "Personal AI productivity system for consultants",
      levels: [
        "You use ChatGPT occasionally when you're stuck.",
        "You use AI regularly for writing — email drafts, meeting summaries, brainstorming.",
        "You have a consultant's AI stack — Claude for deep analysis and writing, Perplexity for real-time research, Granola for meeting notes, Gamma or Beautiful.ai for deck drafts. You save 8+ hours/week.",
        "You've built a consulting productivity OS — AI auto-generates meeting briefs before client calls, synthesizes your notes after, drafts follow-up emails, and maintains your project knowledge base. Your utilization rate is higher because non-billable work takes half the time.",
        "You've built an integrated system that makes you measurably faster than peers. Research → analysis → synthesis → deliverable → client communication — AI assists at every stage. Other consultants ask you to teach them your setup. You're the go-to \"AI-powered consultant\" in your firm.",
      ],
    },
    {
      area: "Leading AI adoption in your consulting practice",
      levels: [
        "You use AI individually. Your team does consulting the traditional way.",
        "You've shared an AI tool recommendation or prompt trick with your project team.",
        "You've piloted AI tools on a client engagement — used AI for research, analysis, or deliverable production and demonstrated time/quality improvements to your team lead.",
        "You've driven AI adoption for your practice — created AI usage guidelines, prompt templates for common deliverables, and trained analysts on AI-first workflows. Engagement margins have improved because your team produces faster.",
        "You've shaped your firm's AI strategy. You've defined how AI should be used across engagement types, created the playbooks, and built a culture where AI-assisted work is the standard. You present AI efficiency gains to partners and influence firm-wide adoption.",
      ],
    },
  ],

  "Operations / Supply Chain Manager": [
    {
      area: "AI for demand forecasting & planning",
      levels: [
        "You forecast demand using historical averages and Excel models. Adjustments are based on gut feel and sales input.",
        "You've used AI to analyze past demand patterns or generate a simple forecast from historical data.",
        "You use AI to build multi-variable demand models — you feed it historical sales, seasonality data, promotional calendars, and external factors. AI generates forecasts with confidence intervals and flags anomalies. Your forecast accuracy has improved 10–15%.",
        "You've built a demand planning workflow where AI ingests POS data, inventory levels, lead times, and market signals to generate SKU-level forecasts with automated reorder recommendations. You review exceptions, not every SKU.",
        "You've built an AI-powered demand planning system for your organization. It auto-adjusts forecasts based on real-time signals, generates scenario plans for disruptions, and has reduced stockouts and excess inventory measurably. Your planning team operates on AI recommendations, not spreadsheets.",
      ],
    },
    {
      area: "AI for process optimization & efficiency",
      levels: [
        "You identify process bottlenecks through observation and manual time studies.",
        "You've used AI to analyze process data or brainstorm efficiency improvements.",
        "You regularly feed process data (cycle times, throughput, defect rates, downtime logs) into AI and get structured analyses — bottleneck identification, root cause hypotheses, and improvement recommendations. You implement the top suggestions.",
        "You've built an AI-assisted continuous improvement workflow — AI monitors process KPIs, detects anomalies, generates root cause analyses, and recommends corrective actions. Your improvement cycle time has halved.",
        "You've deployed AI-powered process optimization across your operations. AI models simulate process changes before implementation, predict failure points, and optimize schedules dynamically. Your operation runs on data-driven decisions, not experience-based guesses.",
      ],
    },
    {
      area: "AI for supplier management & procurement",
      levels: [
        "You manage suppliers through spreadsheets, emails, and manual performance tracking.",
        "You've used AI to draft RFQs, analyze supplier quotes, or summarize vendor performance data.",
        "You use AI to evaluate suppliers — you feed it performance data (quality, delivery, pricing history) and it generates scorecards, risk assessments, and negotiation briefs. Your supplier reviews are faster and more data-driven.",
        "You've built a procurement intelligence workflow — AI analyzes market pricing trends, flags cost-saving opportunities, generates negotiation strategies based on supplier dependency and market conditions, and auto-drafts contract terms.",
        "You've built an AI-powered procurement system. It monitors commodity prices, predicts cost movements, auto-generates RFQs, evaluates bids against multi-dimensional criteria, and surfaces strategic sourcing opportunities. Your procurement team makes better decisions faster.",
      ],
    },
    {
      area: "AI for inventory & warehouse optimization",
      levels: [
        "You manage inventory with basic min/max levels and manual cycle counts.",
        "You've used AI to analyze inventory data or calculate optimal reorder points.",
        "You use AI to optimize inventory levels — dynamic safety stock calculations, ABC-XYZ analysis, and dead stock identification. AI processes your SKU-level data and recommends actions you'd never get to manually across thousands of items.",
        "You've built an AI-assisted inventory system — it monitors stock levels in real-time, predicts stockouts before they happen, optimizes warehouse slotting based on pick patterns, and generates exception reports. Your carrying costs have dropped measurably.",
        "You've deployed AI-driven inventory optimization across your network. Multiple warehouses, dynamic allocation, predictive replenishment — AI manages the complexity that humans can't handle at scale. You've reduced working capital while improving service levels.",
      ],
    },
    {
      area: "AI for logistics & transportation optimization",
      levels: [
        "You plan routes and shipments manually or using basic tools. Carrier selection is based on rate sheets.",
        "You've used AI to analyze shipping data or optimize a route plan.",
        "You use AI to optimize transportation — you feed it shipment data, carrier rates, constraints, and delivery windows, and it generates optimized load plans and route recommendations. You save 10–15% on freight costs on routes you've optimized.",
        "You've built a logistics optimization workflow — AI consolidates orders, selects optimal carriers, plans routes considering real-time constraints (traffic, weather, capacity), and generates cost-benefit analyses for logistics decisions.",
        "You've deployed an AI-powered logistics system. It dynamically optimizes your transportation network — real-time route adjustments, predictive capacity booking, automated carrier negotiations, and continuous cost optimization. Your logistics cost per unit has improved quarter over quarter.",
      ],
    },
    {
      area: "Prompt engineering for operations workflows",
      levels: [
        "You ask ChatGPT basic questions about operational challenges.",
        "You've learned to provide specific data and context — \"Given these lead times and demand patterns, how should I adjust safety stock?\"",
        "You write structured prompts for operational analysis — demand analysis, supplier evaluation, process mapping, root cause analysis. You have go-to prompts for recurring operational tasks that produce consistent, useful outputs.",
        "You build prompt chains for complex operational decisions — data analysis prompt → scenario modeling prompt → recommendation prompt → implementation plan prompt. You know where AI hallucinates in operations (fake benchmarks, unrealistic efficiency numbers) and add verification steps.",
        "You've built an operations prompt playbook. Your team uses these workflows for standard analyses. New ops managers can produce senior-quality analyses using your prompt templates. You've fundamentally changed how your team approaches operational problem-solving.",
      ],
    },
    {
      area: "AI for quality management & compliance",
      levels: [
        "You track quality through manual inspections and spreadsheet-based reports.",
        "You've used AI to analyze quality data or generate a non-conformance report.",
        "You use AI to analyze quality trends — defect patterns, Pareto analysis, process capability calculations. AI identifies correlations you'd miss in manual analysis and generates structured improvement recommendations.",
        "You've built an AI-assisted quality system — it monitors quality KPIs in real-time, predicts quality risks based on process parameters, generates corrective action plans, and auto-drafts compliance documentation.",
        "You've deployed AI-powered quality management. Predictive quality models flag issues before they reach customers. Compliance documentation is auto-generated and audit-ready. Your quality costs have dropped while customer satisfaction has improved.",
      ],
    },
    {
      area: "AI for operational reporting & communication",
      levels: [
        "You compile operational reports manually — pulling data from multiple systems into Excel and PowerPoint.",
        "You've used AI to draft an operational summary or format a report.",
        "You use AI to generate operational reports — you feed it raw KPI data and it produces narrative summaries with trend analysis, exception highlights, and recommendations. Your weekly ops review prep takes 30 minutes instead of half a day.",
        "You've built a reporting workflow — AI auto-ingests operational data, generates daily/weekly/monthly reports with context-aware narratives, and highlights only what needs human attention. Your leadership gets better information faster.",
        "You've systematized operational reporting with AI. Every operational review — from daily standups to quarterly business reviews — runs on AI-generated analyses and narratives. The data-to-decision cycle has compressed from days to hours.",
      ],
    },
    {
      area: "Personal AI productivity system for ops managers",
      levels: [
        "You use ChatGPT occasionally for ad-hoc questions.",
        "You use AI regularly for writing and basic analysis.",
        "You have an ops manager's AI stack — Claude for analysis and reporting, Perplexity for benchmarking and research, AI transcription for supplier calls and team meetings. You save 5+ hours/week on administrative and analytical tasks.",
        "You've built a productivity OS for operations — AI handles your daily reporting, meeting summaries, supplier communication drafts, and exception analysis. You focus on decisions and relationships, not data wrangling.",
        "You've built an integrated system where AI is your operational co-pilot. It surfaces what needs your attention each morning, generates the analyses you need before you ask, and handles the documentation you used to spend hours on. Other ops managers want your setup.",
      ],
    },
    {
      area: "Leading AI adoption in your operations team",
      levels: [
        "You use AI individually. Your operations team runs on spreadsheets and legacy systems.",
        "You've shown your team an AI tool — maybe for report generation or data analysis.",
        "You've piloted AI tools in your operations — demand planning, quality analysis, or reporting — and demonstrated measurable improvements to your leadership.",
        "You've driven AI adoption across your operations function — defined use cases, deployed tools, created SOPs, and trained your team. At least 3 operational processes now run faster or more accurately because of AI.",
        "You've transformed your operations with AI. It's embedded in how your team forecasts, plans, monitors, and reports. You've measured and presented the ROI. You're the person leadership asks about \"how should we use AI in operations?\"",
      ],
    },
  ],

  "Tech Professional transitioning to Business": [
    {
      area: "AI for business communication & storytelling",
      levels: [
        "You communicate in technical terms. Business stakeholders often ask you to \"translate\" what you mean.",
        "You've used AI to rewrite technical content in business language — emails, updates, presentations.",
        "You use AI to bridge the tech-business gap — you feed it technical details and get business-ready narratives. You prompt with audience context (\"Write this for a VP of Sales who cares about revenue impact, not architecture\") and the output lands.",
        "You've built communication templates — AI translates your technical work into business cases, executive summaries, and stakeholder updates. You customize for different audiences automatically. Non-technical leaders now understand your impact clearly.",
        "You've mastered AI-assisted business communication. You produce executive-quality strategy narratives, board decks, and business cases that no one would guess came from an engineer. AI handles the translation, you bring the technical depth that gives your business arguments an unfair advantage.",
      ],
    },
    {
      area: "AI for understanding business metrics & P&L",
      levels: [
        "You know revenue and costs exist but haven't analyzed a P&L or business metrics dashboard yourself.",
        "You've used AI to explain financial concepts — unit economics, gross margin, CAC/LTV, burn rate.",
        "You regularly use AI to analyze business data — you paste revenue reports, funnel data, or financial summaries into Claude and get structured analyses. You ask \"What would a CFO flag in this data?\" and get useful answers.",
        "You've built a business analysis workflow — AI helps you build financial models, analyze cohort economics, and prepare business reviews. You participate in P&L discussions with confidence because AI helps you prep.",
        "You've become fluent in business metrics with AI as your accelerator. You build business cases, analyze ROI, and present financial arguments that earn credibility from business leaders. Your technical background + business fluency makes you a rare, valuable profile.",
      ],
    },
    {
      area: "AI for product thinking & strategy",
      levels: [
        "You think about features and code, not user problems or business strategy.",
        "You've used AI to brainstorm product ideas or understand a product strategy framework.",
        "You use AI to develop product thinking — you prompt it with user problems and get structured analyses of market opportunity, competitive landscape, and solution approaches. You write product notes that PMs take seriously.",
        "You've built product strategy skills with AI — you generate competitive analyses, write mini-PRDs, and create product proposals that include market sizing, user segmentation, and success metrics. AI bridges the gap between your technical intuition and formal product thinking.",
        "You lead product strategy discussions. You combine your technical depth with AI-powered business analysis to propose products others can't — you see technical feasibility AND business viability simultaneously. You're the \"technical PM\" everyone wants on their team.",
      ],
    },
    {
      area: "AI for market research & competitive intelligence",
      levels: [
        "You don't actively track market trends or competitors in your domain.",
        "You've used AI to summarize a competitor's product or a market trend article.",
        "You use AI to run structured competitive analyses — you prompt with specific comparison frameworks and get analyses of how your product compares on features, pricing, positioning, and technical architecture. You bring insights to product discussions.",
        "You've built a research workflow — AI monitors competitors, synthesizes industry reports, and generates strategic summaries. You show up to business meetings with market context that surprises non-technical leaders.",
        "You've become the person who bridges technical and market intelligence. Your AI-powered research connects technology trends to business opportunities. You write the analysis that shapes your company's product strategy.",
      ],
    },
    {
      area: "AI for stakeholder management & influence",
      levels: [
        "You work with stakeholders but struggle to align business and technical priorities.",
        "You've used AI to prepare for a stakeholder meeting — generating talking points or anticipating questions.",
        "You use AI to prepare for every important meeting — it generates stakeholder briefs, anticipates objections, and helps you frame technical decisions in business terms. Your meetings are more productive because you come prepared.",
        "You've built a stakeholder management system — AI helps you map influence, track priorities across stakeholders, and generate tailored communication for each. You manage cross-functional alignment more effectively than most pure business people.",
        "You've become an exceptional cross-functional leader. AI handles the prep, you bring the judgment. You navigate business politics, build executive relationships, and drive decisions that balance technical excellence with business outcomes.",
      ],
    },
    {
      area: "Prompt engineering for business-technical bridge roles",
      levels: [
        "You use AI for coding tasks but haven't applied it to business problems.",
        "You've started prompting AI for business tasks — drafting emails to non-technical stakeholders, summarizing business meetings.",
        "You write structured prompts for both technical and business tasks. You leverage your technical understanding to write better prompts than most business people — you understand context windows, model limitations, and prompt structure at a deeper level.",
        "You build sophisticated prompt workflows that bridge tech and business — translating architecture decisions into business impact assessments, converting sprint outputs into stakeholder updates, and generating business cases from technical specs.",
        "You've built prompt systems that make you a force multiplier. Your technical understanding of LLMs combined with your growing business acumen means your AI outputs are more accurate and nuanced than what pure business or pure tech people produce.",
      ],
    },
    {
      area: "AI for building business cases & ROI analysis",
      levels: [
        "You build features but can't articulate their business value in financial terms.",
        "You've used AI to understand what a business case should include or to estimate the impact of a project.",
        "You use AI to build business cases for technical projects — you describe the project and AI helps you frame the ROI, model the cost savings, and articulate the business value. Your proposals get approved more often because they speak the language of business.",
        "You've built a business case workflow — AI helps you model different scenarios, calculate payback periods, and generate executive summaries. You present technical investments as business investments, complete with financial projections and risk analysis.",
        "You're the engineer who can sell technical projects to the board. Your AI-assisted business cases are rigorous, credible, and compelling. Leadership funds your proposals because you quantify impact in terms they care about — revenue, cost, risk, time-to-market.",
      ],
    },
    {
      area: "AI for understanding operations, marketing & sales",
      levels: [
        "You know these functions exist but don't understand their workflows or metrics.",
        "You've used AI to learn about go-to-market strategies, sales funnels, or operational metrics.",
        "You use AI to actively build cross-functional knowledge — you analyze marketing campaigns, understand sales pipeline metrics, and learn operational workflows. When you sit in cross-functional meetings, you contribute meaningfully.",
        "You've built a learning system — AI helps you prepare for cross-functional interactions, understand the metrics each team cares about, and contribute technical solutions to business problems. You're no longer \"just the tech person\" in the room.",
        "You're a true generalist-specialist. You understand how every business function works, can analyze their data, and propose AI-powered solutions for their problems. Your technical background + business breadth makes you a future COO/CPO candidate.",
      ],
    },
    {
      area: "Personal AI productivity system for career transitioners",
      levels: [
        "You use AI for coding assistance but not for business skill-building.",
        "You use AI for both technical and business tasks — coding help AND email drafting.",
        "You have a dual-purpose AI stack — Copilot/Cursor for code, Claude for business analysis, Perplexity for market research, AI transcription for meetings. You save 6+ hours/week AND you're building business skills simultaneously.",
        "You've built a career transition OS — AI accelerates your learning (explains business concepts on demand, simulates stakeholder conversations), handles your communication gap (translates tech to business), and makes you productive in business tasks faster than a typical MBA grad.",
        "You've built an integrated system that makes your transition seamless. AI is your real-time business mentor, communication coach, and analytical assistant. You're equally effective in technical deep-dives and business strategy sessions because AI covers your gaps while you build the real skills.",
      ],
    },
    {
      area: "Leading AI adoption as a tech-business bridge",
      levels: [
        "You use AI individually for your own work.",
        "You've helped a non-technical colleague use AI for the first time.",
        "You've identified and piloted AI tools for a business team — helping marketing use AI for copy, or helping ops use AI for reporting. Your technical understanding lets you evaluate and deploy AI tools faster than non-technical teams can.",
        "You've become the AI champion across functions — you lead AI adoption not just for your engineering team but for business teams who need someone technical to guide them. You evaluate tools, create workflows, and train people.",
        "You drive AI strategy across the organization. Your unique position — understanding both the technology and the business applications — makes you the most valuable person in the AI adoption conversation. You shape the company's AI roadmap.",
      ],
    },
  ],

  "Founder / Entrepreneur": [
    {
      area: "AI for GTM strategy & launch execution",
      levels: [
        "You plan go-to-market manually — brainstorming, competitor googling, and writing everything from scratch.",
        "You've used AI to brainstorm positioning ideas, draft a launch plan, or research competitors.",
        "You use AI to build complete GTM strategies — you prompt with your product, ICP, market context, and AI generates positioning options, channel strategies, launch timelines, and messaging frameworks. Your launches are more structured and faster.",
        "You've built a GTM workflow — AI generates your competitive positioning, creates launch messaging per channel, drafts PR pitches, writes landing page copy, and creates investor-ready launch decks. You focus on strategy and relationships, AI handles production.",
        "You run your entire GTM through AI-assisted workflows. From market research to positioning to launch execution to post-launch analysis. Your launches are faster, more data-driven, and better-messaged than startups with 3x your team size.",
      ],
    },
    {
      area: "AI for fundraising & investor communication",
      levels: [
        "You write pitch decks and investor updates manually.",
        "You've used AI to draft a section of a pitch deck or clean up an investor update.",
        "You use AI to generate investor-quality narratives — you feed it your metrics, milestones, and market context, and it produces pitch deck copy, update emails, and Q&A prep that anticipates investor concerns. Your communication is sharper.",
        "You've built an investor communication workflow — AI generates your monthly updates from raw metrics, prepares you for board meetings with briefing docs, and creates data rooms with narrative context. You spend time on relationships, not production.",
        "You've systematized investor relations with AI. Updates auto-generate from your dashboards. Board prep is AI-assisted. Your narrative consistency across all touchpoints (deck, updates, one-on-ones) is airtight because AI maintains it. Investors comment on your communication quality.",
      ],
    },
    {
      area: "AI for hiring, team building & people management",
      levels: [
        "You write job descriptions from scratch and screen resumes manually.",
        "You've used AI to draft JDs, screening criteria, or interview questions.",
        "You use AI for your entire hiring workflow — AI generates JDs from role requirements, creates screening rubrics, drafts outreach messages for candidates, and generates structured interview scorecards. Your hiring moves 2x faster.",
        "You've built a people management system with AI — AI helps you write performance reviews, generate 1-on-1 agendas based on team OKRs, draft difficult feedback conversations, and create onboarding materials for new hires. You manage a growing team more effectively.",
        "You've built AI-powered people operations for your startup. From hiring pipeline to onboarding to performance management — AI handles the admin so you can focus on culture and strategy. Your team of 10 runs like a team of 20 operationally.",
      ],
    },
    {
      area: "AI for financial planning & runway management",
      levels: [
        "You manage finances in a basic spreadsheet. Burn rate calculations are rough.",
        "You've used AI to build a basic financial model or analyze your burn rate.",
        "You use AI to build financial models — revenue projections, scenario planning, cash flow forecasts. You feed it your actuals and assumptions, and it generates models with sensitivity analysis. You make better funding and spending decisions.",
        "You've built a financial planning workflow — AI monitors your actuals vs. projections, flags variance, generates board-ready financial updates, and models the impact of hiring/pricing/expansion decisions on your runway.",
        "You run financial operations with AI as your virtual CFO. Monthly close reports, budget vs. actuals, fundraising scenarios, pricing optimization — all AI-assisted. You make financial decisions with the rigor of a funded startup twice your size.",
      ],
    },
    {
      area: "AI for product development & iteration",
      levels: [
        "You build product based on intuition and direct customer conversations. No systematic process.",
        "You've used AI to brainstorm features, write user stories, or prioritize a backlog.",
        "You use AI throughout your product process — generating user stories from customer interviews, prioritizing features based on impact/effort analysis, writing specs that your developers can actually build from. Your product velocity has increased.",
        "You've built a product development system — AI synthesizes customer feedback into opportunities, generates PRDs, creates test scenarios, and writes release notes. You make product decisions faster because the analytical prep work is automated.",
        "You run product development like a senior PM org with AI as force multiplier. Customer insights → opportunity identification → spec → build → measure — AI accelerates every stage. Your startup iterates faster than competitors with dedicated product teams.",
      ],
    },
    {
      area: "Prompt engineering for founder workflows",
      levels: [
        "You type whatever comes to mind into ChatGPT.",
        "You've learned to give context about your startup — stage, market, customers — and get better outputs.",
        "You have a library of founder-specific prompts — for investor emails, customer research, team communication, strategy sessions. You've written 15+ prompts you use weekly. AI is a daily tool, not an occasional novelty.",
        "You build prompt workflows for end-to-end tasks — pitch deck creation, GTM planning, financial modeling, hiring. You chain prompts together and test across models (Claude for long analysis, GPT for creative, Perplexity for research).",
        "You've codified your entire startup's AI-first approach. Every repeating process has a prompt workflow. New team members get a startup AI playbook on day one. Your prompt engineering skill is a legitimate competitive advantage in speed and quality.",
      ],
    },
    {
      area: "AI for customer development & sales",
      levels: [
        "You talk to customers informally and track feedback in your head or scattered notes.",
        "You've used AI to draft sales emails, prepare for customer calls, or summarize feedback.",
        "You use AI for structured customer development — AI synthesizes call notes into patterns, generates discovery questions for different customer segments, drafts sales proposals, and creates follow-up sequences. Your sales cycle is more systematic.",
        "You've built a customer intelligence system — AI analyzes all customer touchpoints (calls, emails, support tickets, usage data), identifies churn signals, surfaces upsell opportunities, and generates personalized outreach. You understand your customers better than you could manually.",
        "You've built AI-powered customer operations. From first touch to retention — AI handles the analytical layer. You know which customer segments are growing, which are churning, and why. Your sales process is data-driven despite having no sales ops team.",
      ],
    },
    {
      area: "AI for operations & scaling",
      levels: [
        "You handle operations manually — everything from vendor management to compliance is ad hoc.",
        "You've used AI to draft SOPs, vendor emails, or process documentation.",
        "You use AI to systematize your startup's operations — generating SOPs from your ad-hoc processes, creating vendor evaluation frameworks, drafting contracts, and building operational dashboards. Your chaos starts to look like a real company.",
        "You've built operational systems with AI — automated reporting, vendor management workflows, compliance checklists, and team playbooks. You spend less time firefighting and more time on strategy because processes actually exist.",
        "You've built a scalable operating system for your startup with AI. Operations that would normally require an ops hire run on AI-assisted workflows. Investors notice your operational maturity. You're ready to scale because the operational foundation is solid.",
      ],
    },
    {
      area: "Personal AI productivity system for founders",
      levels: [
        "You're overwhelmed and barely have time to try AI tools.",
        "You use ChatGPT for quick tasks — drafting emails, brainstorming, research.",
        "You have a founder's AI stack — Claude for deep thinking and analysis, Perplexity for market research, AI for meeting notes, Notion AI for documentation. You save 8+ hours/week and those hours go back into building.",
        "You've built a founder productivity OS — AI drafts your investor updates from metrics, prepares you for board meetings, generates your weekly team communication, handles first drafts of everything. You've measured: AI saves you 12+ hours/week.",
        "You've built an integrated system that makes you operate like a founder with a full C-suite. AI is your virtual co-founder — it helps you think strategically, communicate clearly, analyze deeply, and move fast. Other founders ask how you get so much done with a small team. This is your answer.",
      ],
    },
    {
      area: "Leading AI-first culture in your startup",
      levels: [
        "You use AI personally but your team doesn't.",
        "You've encouraged your team to try AI tools.",
        "You've defined which AI tools your startup uses and gotten the whole team on board. At least 3 workflows now run through AI — writing, research, customer analysis.",
        "You've built an AI-first startup — every team member has AI in their workflow, you've created shared prompt libraries, and you measure the productivity impact. New hires are selected partly for AI fluency.",
        "AI-first is your startup's competitive advantage. It's in your culture, your hiring criteria, your processes, and your product. You operate with the output of a team 3x your size because AI amplifies every person. This is a deliberate strategy, not just tool adoption.",
      ],
    },
  ],

  "Finance / Commercial Manager": [
    {
      area: "AI for financial analysis & modeling",
      levels: [
        "You build financial models in Excel from scratch. Every formula, scenario, and assumption is manual work.",
        "You've used AI to check a formula, explain a financial concept, or brainstorm model assumptions.",
        "You use AI to accelerate financial modeling — it generates model structures from your description, writes Excel formulas, builds scenario frameworks, and creates sensitivity analysis templates. Your models get built in half the time.",
        "You've built financial analysis workflows — you feed AI your raw data (P&L, balance sheet, cash flow) and it generates variance analysis, trend identification, and executive narratives. You focus on judgment and recommendations, AI handles the analytical grunt work.",
        "You've systematized financial analysis with AI for your team. Standard analyses (monthly close commentary, budget vs. actuals, forecasts) are AI-assisted with human validation. Your finance team produces faster, more insightful work because AI handles the routine analytical layer.",
      ],
    },
    {
      area: "AI for budgeting & forecasting",
      levels: [
        "You build annual budgets in spreadsheets using last year's numbers plus adjustments.",
        "You've used AI to analyze budget variances or build a basic forecast model.",
        "You use AI to build dynamic forecasts — feeding it historical data, growth assumptions, and market context. AI generates scenario-based budgets (bull/base/bear), identifies where your assumptions are weakest, and creates presentation-ready output.",
        "You've built a forecasting system — AI monitors actuals vs. budget in real-time, adjusts rolling forecasts based on trend data, flags material variances before month-end, and generates management commentaries. Your forecasting is continuous, not quarterly.",
        "You've deployed AI-powered financial planning for your organization. FP&A that required a team of 5 runs with 2 people and AI. Forecasts are more accurate, faster, and more granular. Leadership trusts your numbers because the analytical rigor is visible.",
      ],
    },
    {
      area: "AI for commercial deal analysis & pricing",
      levels: [
        "You evaluate deals using standard spreadsheet models and gut feel for pricing.",
        "You've used AI to analyze a deal structure or brainstorm pricing strategies.",
        "You use AI to analyze commercial deals — you feed it deal terms, comparable transactions, and market benchmarks, and it generates deal assessments, risk flags, and negotiation recommendations. You evaluate deals faster and catch risks earlier.",
        "You've built a deal analysis workflow — AI models deal economics under different scenarios, benchmarks pricing against market data, generates term sheet analyses, and creates internal approval documents. Your deal velocity has increased without sacrificing diligence.",
        "You've built an AI-powered commercial intelligence system. Pricing optimization uses AI-driven market analysis. Deal evaluation is systematic and data-rich. Your commercial team makes better pricing and deal decisions because the analytical foundation is stronger.",
      ],
    },
    {
      area: "AI for audit, compliance & risk management",
      levels: [
        "You handle compliance manually — checklist-driven reviews, manual documentation, and spreadsheet tracking.",
        "You've used AI to draft compliance documentation or understand a new regulation.",
        "You use AI to accelerate compliance work — analyzing regulatory changes for impact, generating audit checklists, reviewing contracts for compliance gaps, and creating documentation frameworks. Compliance prep that took weeks now takes days.",
        "You've built a compliance workflow — AI monitors regulatory changes, assesses their impact on your business, generates compliance action plans, and drafts policy updates. Your audit preparation is largely AI-assisted with human validation at key checkpoints.",
        "You've deployed AI-powered compliance for your organization. Regulatory monitoring is automated, audit trails are AI-generated, and risk assessments are continuous rather than periodic. Your compliance function is more thorough and faster than before AI.",
      ],
    },
    {
      area: "AI for management reporting & business intelligence",
      levels: [
        "You compile management reports manually — pulling data from multiple systems and building slides.",
        "You've used AI to format a report or draft an executive summary from data.",
        "You use AI to generate management reports — you feed it raw financial data and it produces narrative commentaries, trend analyses, and variance explanations. Your monthly reporting cycle is 40% faster.",
        "You've built a reporting workflow — AI auto-generates standard reports from your data, creates different versions for different audiences (board, exec team, ops), and flags the issues that need human attention. You spend time on insights, not formatting.",
        "You've systematized business intelligence with AI. Every recurring report is AI-generated with human QA. Your leadership gets more timely, more insightful financial narratives. The data-to-decision cycle has compressed from days to hours.",
      ],
    },
    {
      area: "Prompt engineering for finance workflows",
      levels: [
        "You ask ChatGPT basic finance questions.",
        "You've learned to provide specific financial context — \"Analyze this P&L for a SaaS company with 80% gross margins.\"",
        "You write structured prompts for finance tasks — variance analysis, ratio calculations, forecast generation, and audit preparation. You have 10+ reusable prompts that produce consistent, professional outputs.",
        "You build prompt chains for complex financial work — data ingestion prompt → analysis prompt → recommendation prompt → presentation prompt. You know where AI hallucinates in finance (making up benchmark data, incorrect formulas) and you add verification steps.",
        "You've built a finance prompt playbook for your team. Every recurring financial analysis has a prompt workflow. Junior analysts produce senior-quality outputs using your templates. You've fundamentally changed how your finance team approaches analytical work.",
      ],
    },
    {
      area: "AI for treasury & cash flow management",
      levels: [
        "You manage cash flow in spreadsheets with basic projections.",
        "You've used AI to build a cash flow forecast or analyze working capital trends.",
        "You use AI to build dynamic cash flow models — it factors in receivable aging, payable schedules, seasonal patterns, and growth assumptions. Your cash forecasting is more granular and accurate.",
        "You've built a cash management workflow — AI monitors daily cash positions, projects short-term and long-term liquidity, flags potential shortfalls weeks in advance, and generates financing recommendations.",
        "You've deployed AI-powered treasury management. Cash flow forecasting is continuous, scenario-aware, and integrated with your operational data. Your CFO makes capital allocation decisions based on AI-generated projections that have proven more accurate than manual forecasts.",
      ],
    },
    {
      area: "AI for vendor & cost management",
      levels: [
        "You track vendor costs in spreadsheets and negotiate contracts based on experience and market knowledge.",
        "You've used AI to analyze vendor spend data or draft a contract review.",
        "You use AI to analyze vendor performance and costs — benchmarking against market rates, identifying consolidation opportunities, and generating negotiation strategies based on contract terms and spend patterns.",
        "You've built a procurement analytics workflow — AI monitors spend categories, identifies cost reduction opportunities, benchmarks vendor pricing, and generates executive summaries of procurement performance. Your cost savings pipeline is data-driven.",
        "You've deployed AI-powered cost management. Spend analytics are automated, vendor risk is continuously monitored, and procurement decisions are supported by AI-generated market intelligence. Your cost-to-revenue ratio has improved measurably because of systematic AI-powered analysis.",
      ],
    },
    {
      area: "Personal AI productivity system for finance professionals",
      levels: [
        "You use ChatGPT occasionally for ad-hoc questions.",
        "You use AI regularly — for writing, basic calculations, and report formatting.",
        "You have a finance professional's AI stack — Claude for analysis and narrative writing, AI for Excel/Sheets automation, Perplexity for market research and benchmarks. You save 6+ hours/week on reporting and analysis.",
        "You've built a finance productivity OS — AI handles your recurring reports, generates your meeting briefs, drafts your emails, and helps you analyze any dataset in minutes. Your throughput has doubled.",
        "You've built an integrated system that makes you the most productive finance person in your org. AI handles 80% of your analytical work, and you focus on judgment, relationships, and strategy. Other finance professionals want to learn your setup.",
      ],
    },
    {
      area: "Leading AI adoption in your finance team",
      levels: [
        "You use AI individually. Your finance team runs on Excel and manual processes.",
        "You've shown a teammate an AI trick — generating formulas, drafting reports.",
        "You've piloted AI tools for your finance team — maybe AI-assisted reporting, automated reconciliation, or intelligent forecasting. You've demonstrated measurable time savings.",
        "You've driven AI adoption across your finance function — defined AI use cases per finance process, created prompt templates, and trained your team. At least 3 finance workflows run faster because of AI.",
        "You've transformed your finance function with AI. From close processes to forecasting to reporting — AI is embedded. You've measured and presented the efficiency gains. You're the person leadership consults on \"how should finance use AI?\"",
      ],
    },
  ],
};

const BANDS = [
  {
    min:10,max:18,label:"AI Curious",cls:"band-curious",ringCls:"ring-fill-curious",
    meaning:"Right now, AI is changing how every industry works — and you haven't started using it yet. That's not a criticism, it's a fact. The people in your role who figure this out in the next 12 months will pull ahead. The ones who don't will struggle to stay relevant. The good news? You don't need to become a coder. You need the right framework.",
  },
  {
    min:19,max:28,label:"AI Aware",cls:"band-aware",ringCls:"ring-fill-aware",
    meaning:"You've started using AI, which puts you ahead of many. But there's a big difference between using ChatGPT once a week and actually transforming how you work. Right now, you're scratching the surface. Professionals who go deeper — who learn to build workflows, automate decisions, and lead with AI — will be the ones who get promoted, hired, and trusted with bigger roles.",
  },
  {
    min:29,max:38,label:"AI Capable",cls:"band-capable",ringCls:"ring-fill-capable",
    meaning:"You're already better at AI than most people in your role. That's the good news. The not-so-good news? Everyone is catching up fast. The gap between 'good with AI' and 'irreplaceable because of AI' is exactly where career acceleration happens. You need peers at your level and structured challenges to push further.",
  },
  {
    min:39,max:50,label:"AI Leader",cls:"band-leader",ringCls:"ring-fill-leader",
    meaning:"You're in the top tier. Most people in your role aren't close to where you are. But here's what separates leaders from legends: scaling your impact beyond yourself. Building systems, training teams, driving org-wide change. That's the next level — and it's hard to do alone.",
  },
];
