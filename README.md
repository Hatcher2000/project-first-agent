# Vonn-Newsletter-Agent (Next Week in Time)

## 📌 Project Context
This application is an autonomous, production-grade AI Editorial Pipeline that generates and delivers a premium weekly history column titled **"NEXT WEEK IN TIME"** tailored for an American audience. 

What started as an educational sandbox to bridge the gap between "vibe-coding" and systematic software engineering has evolved into a fully automated, cloud-native, multi-agent system. The core application runs entirely on autopilot every week, executing live web research, compiling rich media layouts, and broadcasting to multiple stakeholders.

---

## 🚀 Core Features & Engineering Milestones

*   **Multi-Agent Orchestration:** Splits cognitive tasks between two distinct AI nodes—**Agent-Historian** (handles raw historical data gathering and web research) and **Agent-Copywriter** (handles curation, American-centric tone filtering, and creative copywriting).
*   **Live Web Search Grounding:** Leverages the native Google Search engine via the `@google/genai` SDK to dynamically fetch accurate, real-time historical milestones, regional archives, and pop-culture anniversaries.
*   **Automated Cloud Execution:** Deployed using a GitHub Actions continuous integration container, scheduled via a native CRON layout to run completely hands-off every single **Tuesday at 9:00 AM EST**.
*   **Rich HTML Delivery System:** Features a robust self-healing retry network that compiles Markdown data arrays into safe, beautifully stylized HTML email newsletter layouts delivered directly to multiple inboxes via `nodemailer`.

---

## 📊 System Architecture & Data Flow

```text
[ Tuesday 9:00 AM CRON Trigger ]
               │
               ▼
   [ Dynamic Date Engine ] ──► Calculates target dates for next week
               │
               ▼
     [ Agent-Historian ] ◄───► [ Live Google Search Grounding ]
               │               (Scrapes 10-12 facts per day)
               ▼
      [ Raw Fact Dossier ]
               │
               ▼
     [ Agent-Copywriter ] ──► Filters to 7-8 highly American-resonant events
               │               (Applies witty tone & Markdown formatting)
               ▼
    [ Compiled Markdown ]
               │
               ▼
       [ Marked Engine ] ──► Converts Markdown to responsive HTML CSS card
               │
               ▼
      [ Nodemailer Core ] ──► Securely broadcasts to multiple subscriber accounts