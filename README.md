# MindNook — AI-Powered Journaling & NLP Analysis Platform

> *A full-stack application that transforms personal writing into structured self-insight using large language models, sentiment analysis, and real-time vocabulary feedback.*

![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Deno%20%7C%20Supabase-1b2e2b?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-LLaMA%203.3%2070B%20via%20Groq-d9c5b2?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-7ecb84?style=flat-square)
![TechRxiv](https://img.shields.io/badge/Preprint-TechRxiv%20%7C%20IEEE-blue?style=flat-square)

---

## 📄 Research Foundation

This application is the prototype system described in the TechRxiv preprint (powered by IEEE).

> Gabu Sai Yamini Devi. *"A System-Level Framework for Sentiment-Aware Reflective Writing Systems: Modeling Temporal Emotional Patterns with Interpretability and Ethical Safety."* TechRxiv (IEEE Preprint), February 2026. DOI: `10.36227/techrxiv.177274130.07417144/v1`

**[→ Read the Paper](sentiment_aware_framework.pdf)**

The paper formally proves that sentiment polarity S(x) is **not a sufficient statistic** for intent-aware action selection, and proposes a 5-layer framework integrating pragmatic reasoning, temporal pattern recognition, and utility-theoretic decision making under asymmetric intervention costs.

MindNook implements **Layer 1** of that framework — sentiment detection, lexical analysis, and LLM-based feedback — and serves as the empirical prototype motivating the remaining layers, which are planned future work.

---

## 🌐 Live Demo

**[mindnook-hcj.vercel.app](https://mindnook-hcj.vercel.app)**

---

## ✨ Key Features

- AI-powered sentiment analysis of journal entries
- Vocabulary richness and lexical diversity tracking
- Grammar mistake detection and improvement tracking
- Emotion-aware motivational stories and quotes
- Longitudinal writing progress analytics

---

## 🗂 Project Structure

```
MindNook-HCJ/
│
├── Frontend/
│   ├── index.html
│   ├── canvas.html
│   ├── canvas.js
│   ├── canvas.css
│   ├── sentiment.html
│   ├── vocab.html
│   └── history.html
│
├── supabase/
│   └── functions/
│       └── analyze-journal/
│           └── index.ts
│
├── sentiment_aware_framework.pdf
│
└── README.md
```

---

## 1. Problem Statement

Despite the well-documented cognitive and emotional benefits of reflective writing, most journaling tools remain static — they store text but provide no analytical feedback. Users have no way to track emotional trends over time, identify linguistic weaknesses, or receive contextually relevant writing suggestions based on their own entries.

This project addresses the gap between passive journaling and active self-improvement by building a system that:

- Performs **real-time sentiment classification** on free-form personal writing
- Extracts **lexical diversity metrics**, repeated word patterns, and grammar errors
- Generates **contextually grounded narrative content** (stories and quotes) tailored to the detected emotional state
- Persists all analysis to a **relational database** to support longitudinal mood and vocabulary tracking

---

## 2. Why It Matters

**From an NLP research perspective:** Free-form journaling is an underexplored domain for applied language models. Unlike product reviews or news articles, journal entries are informal, emotionally rich, and highly personal — making them a challenging and meaningful testbed for sentiment analysis and lexical analysis pipelines.

**From a systems perspective:** This project demonstrates the integration of a serverless edge function (Deno on Supabase) as a lightweight LLM gateway, decoupling the frontend from direct API key exposure while enabling low-latency inference via Groq's inference acceleration layer.

**From a human-computer interaction perspective:** The design prioritizes psychological safety — the interface is distraction-free, the feedback is non-judgmental, and the system never surfaces raw critique without pairing it with constructive alternatives.

**From a research continuity perspective:** This prototype operationalizes the observations from Section 6 of the accompanying paper, where prototype deployment revealed systematic failure modes of sentiment-only systems — context collapse, therapeutic misalignment, and intent ambiguity — that the full 5-layer framework is designed to resolve.

---

## 3. Dataset

This application does not use a pre-existing benchmark dataset. Instead, it operates on **user-generated journal entries** as live inference input. Analysis is performed on each entry at write-time.

For the client-side tone analysis module, two curated lexicons were hand-constructed:

| Lexicon | Size | Coverage |
|---|---|---|
| Positive word set | ~120 lemmas | Joy, gratitude, calm, motivation, achievement |
| Negative word set | ~130 lemmas | Sadness, anxiety, frustration, fear, defeat |

Stemming heuristics (suffix stripping: `-ing`, `-ed`, `-ly`, `-ness`, `-ful`, `-less`, `-s`) are applied before lookup to improve recall without requiring a full morphological analyzer.

The LLM (LLaMA 3.3 70B) serves as the primary analysis engine for fields where rule-based approaches are insufficient: grammar correction, expression enrichment, and narrative generation.

---

## 4. Methodology

The pipeline follows a **hybrid architecture** combining rule-based NLP with LLM inference:

```
User Entry (Quill Rich Text Editor)
        │
        ▼
  [Client-side preprocessing]
  - Tokenisation (regex-based)
  - Stopword-aware unique word count
  - Lexical diversity: TTR = unique_tokens / total_tokens
  - Tone classification via lexicon lookup + stemming
        │
        ▼
  [Edge Function: Deno / Supabase]
  - Structured prompt construction
  - LLM call → LLaMA 3.3 70B via Groq API
  - JSON schema enforcement (response_format: json_object)
        │
        ▼
  [LLM-returned fields]
  - Sentiment: Positive / Negative / Neutral
  - Grammar mistake count + corrections
  - Vocabulary upgrade suggestions (entry-specific)
  - Expression enrichment (weak phrase → stronger alternative)
  - Contextual narrative: alternating story / quote per entry
        │
        ▼
  [Supabase PostgreSQL persistence]
  - Full analysis record stored per entry
  - Enables streak tracking, mood timeline, aggregate statistics
```

Client-side and LLM-returned tone counts are blended (averaged) when both are non-zero, improving robustness against hallucinated counts from the model.

> The theoretical justification for this hybrid architecture — specifically why sentiment detection alone is insufficient and must be augmented with contextual reasoning — is formalized in the accompanying research paper (see Research Foundation above).

---

## 5. Model Architecture

### LLM Backbone

| Property | Value |
|---|---|
| Model | `llama-3.3-70b-versatile` |
| Provider | Groq (low-latency inference) |
| Deployment | Supabase Edge Function (Deno runtime) |
| Prompt strategy | Single-turn, structured JSON schema injection |
| Output format | `response_format: json_object` enforced |

### Prompt Design

The system uses **schema-constrained prompting** — each prompt explicitly specifies the required JSON keys and value types. This eliminates post-processing ambiguity and reduces hallucination of unexpected fields. Example (analysis prompt):

```
Analyze this journal entry: "${text}". Return ONLY valid JSON with exactly these keys:
{
  "sentiment": "Positive or Negative or Neutral",
  "moodLifter": "...",
  "wordCount": <number>,
  "sentenceCount": <number>,
  "mistakeCount": <number>,
  "vocabularySuggestions": ["...", "...", "..."]
}
```

For narrative generation, separate prompts are issued for **story mode** (120–180 word arc: situation → struggle → turning point → uplift) and **quote mode** (attributed, non-cliché quotation matched to detected emotional themes), with the mode alternating per session via localStorage state.

### Client-Side NLP Module

Independent of the LLM, the frontend computes:

- **Type-Token Ratio (TTR)** — lexical diversity index (0–1)
- **Average sentence length** — structural complexity proxy
- **Tone word ratio** — positive / negative / neutral word counts via lexicon + stemming
- **Repeated word detection** — frequency threshold flagging

This dual-layer design means the system degrades gracefully if the LLM call fails — core metrics remain available.

### Relation to the 5-Layer Framework

The paper proposes five layers for full intent-aware response selection. The current implementation covers:

| Framework Layer | Description | Status |
|---|---|---|
| L1 — Sentiment Detection | Polarity classification via LLM + client-side lexicon | ✅ Implemented |
| L2 — Pragmatic Analysis | Speech act classification (assertion / question / expression) | 📋 Planned future work |
| L3 — Temporal Pattern Recognition | LSTM-based sentiment trend modeling over history | 📋 Planned future work |
| L4 — Goal Alignment | Mapping detected patterns to user goals | 📋 Planned future work |
| L5 — Utility-Based Action Selection | Optimal action under asymmetric intervention costs | 📋 Planned future work |

---

## 6. Results

The following are observed from manual evaluation across test entries:

| Metric | Observation |
|---|---|
| Sentiment classification | Consistent with human judgment on clearly valenced entries; ambiguous entries tend toward Neutral |
| Grammar correction | High precision on common errors (subject-verb agreement, punctuation); lower recall on stylistic issues |
| Vocabulary enrichment | Suggestions are contextually grounded — pulled from actual entry vocabulary, not generic lists |
| Narrative generation | Story mode produces coherent 6–8 sentence arcs; quote mode attribution is occasionally generic |
| Lexical diversity (TTR) | Correlates meaningfully with perceived vocabulary richness across test entries |
| Latency | Groq inference typically returns within 1–2 seconds; three async AI calls on the vocab page run in parallel |

> **Note:** Formal benchmark evaluation (e.g., against SemEval sentiment datasets) is planned as future work. Current results reflect qualitative assessment consistent with the system-level observations documented in Section 6 of the paper.

---

## 7. Limitations

- **L1-only coverage:** The current system implements sentiment detection but not the pragmatic, temporal, or goal-aware layers proposed in the framework. This means it is subject to the failure modes documented in the paper — context collapse, therapeutic misalignment, and intent ambiguity — which the full framework is designed to address.

- **LLM non-determinism:** Repeated analysis of the same entry may return slightly different sentiment labels or mistake counts. The blended client-side / LLM tone counting partially mitigates this for tone bars.

- **Lexicon coverage:** The hand-curated positive/negative word sets cover common emotional vocabulary but miss domain-specific or culturally nuanced expressions. A distributional lexicon (e.g., NRC Emotion Lexicon) would improve coverage.

- **Grammar checker scope:** The LLM is prompted to find mistakes but is not a dedicated grammar model (e.g., GrammarBERT). It may miss subtle errors or flag stylistic choices as errors.

- **No user authentication:** The current build uses the Supabase anon key with no row-level security tied to user identity. All entries are stored in a single shared table — unsuitable for production deployment without auth.

- **localStorage dependency:** Sentiment and vocabulary pages depend on `localStorage` to receive analysis data. Clearing browser storage between pages breaks the flow.

- **TTR sensitivity to entry length:** Type-Token Ratio decreases as text length increases, making cross-entry comparisons of lexical diversity unreliable at different word counts. A corrected metric (e.g., MATTR or MTLD) would be more robust — as noted in the paper's research agenda (Section 9).

---

## 8. Future Work

The following items align directly with the research agenda outlined in the paper (Section 9):

- **Implement Layers 2–5** of the framework — pragmatic analysis, LSTM-based temporal pattern recognition, goal alignment, and utility-theoretic action selection with asymmetric cost thresholds (τ* = C_fp / C_fp + C_fn)
- **User authentication & multi-user support** via Supabase Auth with row-level security policies
- **Longitudinal NLP analysis** — track vocabulary growth, sentiment trends, and writing complexity over weeks/months with time-series visualisations
- **Upgraded lexical diversity metric** — replace TTR with Moving-Average TTR (MATTR) to control for text length
- **Fine-tuned sentiment model** — explore fine-tuning a smaller model (e.g., DistilBERT) on journal-domain data for faster, more consistent classification
- **Named entity and topic extraction** — surface recurring themes, people, and places across a user's entries
- **Empirical validation study** — randomized comparison between sentiment-only and multi-layer system as proposed in Section 9.9 of the paper (N ≈ 100, mixed-effects model analysis)
- **Privacy-preserving personalization** — federated learning and on-device processing as outlined in Section 9.8
- **Multi-language support** — extend the lexicon and prompt pipeline to support non-English entries

---

## 9. How to Run

> 🌐 **Live version available at:** [mindnook-hcj.vercel.app](https://mindnook-hcj.vercel.app).

### Prerequisites

- [Node.js](https://nodejs.org/) (for local development server, e.g. VS Code Live Server or `npx serve`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for edge function deployment)
- A Groq API key

### Local Frontend

```bash
# Clone the repo
git clone https://github.com/yamireddy04/MindNook-HCJ.git
cd MindNook-HCJ/Frontend

# Open with any static server, e.g.:
npx serve .
# or use VS Code Live Server extension
```

Navigate to `http://localhost:5500/Frontend/index.html`

### Edge Function (Supabase)

```bash
# From repo root
cd supabase/functions/analyze-journal

# Set your Groq API key as a Supabase secret
supabase secrets set GROQ_API_KEY=your_key_here

# Deploy the function
supabase functions deploy analyze-journal
```

### Database

In your Supabase project, create the `journal_entries` table:

```sql
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  content text,
  sentiment text,
  mood_lifter_content text,
  word_count int,
  sentence_count int,
  mistake_count int,
  lexical_feedback text[],
  unique_words int,
  readability text,
  writing_style text,
  lexical_diversity float,
  repeated_words text[],
  positive_word_count int,
  negative_word_count int,
  neutral_word_count int,
  emotion_words text[],
  progress_summary text,
  grammar_trend text,
  vocabulary_trend text
);
```

### Environment

No `.env` file is needed for the frontend. The Supabase anon key is safe to expose client-side (it is a public key by design). The **Groq API key must never be in the frontend** — it lives only in the Supabase edge function environment.

---

## 10. Summary

MindNook is a full-stack NLP application and research prototype that bridges the gap between passive journaling and data-driven self-reflection. It operationalizes Layer 1 of a formally published sentiment-aware framework, demonstrating practical application of large language models in a constrained, schema-enforced inference setting, combined with client-side lexical analysis for resilience and speed.

| Layer | Technology |
|---|---|
| Frontend | HTML/CSS/JS, Quill.js rich text editor |
| AI Inference | LLaMA 3.3 70B via Groq API |
| Backend / API | Deno edge function on Supabase |
| Database | Supabase PostgreSQL |
| Visualisation | Chart.js (sentiment timeline, tone donut) |
| Hosting | Vercel (frontend) + Supabase Edge (serverless functions) |

The project is deliberately scoped as a **research prototype** — prioritising architectural clarity, NLP pipeline design, and UX over production hardening. It serves as the empirical foundation for more rigorous experimentation with journal-domain language modeling, longitudinal affect tracking, and the full intent-aware response selection framework described in the accompanying paper.

---

> 📄 **Paper:** [A System-Level Framework for Sentiment-Aware Reflective Writing Systems](sentiment_aware_framework.pdf) — TechRxiv (IEEE), February 2026

*Built by Yamini Reddy · MindNook © 2026*
