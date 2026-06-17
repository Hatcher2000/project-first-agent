import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import { marked } from 'marked';

// 1. Initialize environmental protection
dotenv.config();

if (!process.env.GEMINI_API_KEY || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("🛑 Critical Configuration Missing! Check your .env file credentials.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * UTILITY FEATURE: The Reusable Self-Healing AI Engine
 * Handles exponential backoff and optional Google Search grounding for any agent we deploy.
 */
async function executeAgentCall(prompt: string, agentName: string, useGoogleSearch: boolean = false): Promise<string> {
  let attempts = 0;
  const maxAttempts = 3;
  let delayMs = 2000;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempts < maxAttempts) {
    try {
      attempts++;
      
      // Dynamically attach Google Search tools only if the agent requests it
      const config: any = {};
      if (useGoogleSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
      });

      if (!response.text) {
        throw new Error(`[${agentName}] Received empty response from model.`);
      }

      // Spy on search queries if they exist
      const searchMetadata = (response as any).candidates?.[0]?.groundingMetadata;
      if (useGoogleSearch && searchMetadata?.webSearchQueries) {
        console.log(`🔍 ${agentName} executed live web searches:`);
        searchMetadata.webSearchQueries.forEach((q: string) => console.log(`   👉 "${q}"`));
      }

      return response.text; // Success! Return the data block out of the engine

    } catch (error: any) {
      if (error.status === 503 && attempts < maxAttempts) {
        console.warn(`⚠️ ${agentName} encountered server traffic (503). Attempt ${attempts}/${maxAttempts} failed. Retrying in ${delayMs / 1000}s...`);
        await sleep(delayMs);
        delayMs *= 2; // Exponential backoff
      } else {
        throw error; // Rethrow critical breaks or final expirations
      }
    }
  }
  throw new Error(`[${agentName}] Critical Failure after maximum retries.`);
}

/**
 * FEATURE 1: The Dynamic Date Calculator
 */
function getNextWeekDateRange(): { formattedRange: string; datesList: string[] } {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  let daysToNextMonday = (1 - currentDayOfWeek + 7) % 7;
  if (daysToNextMonday === 0) daysToNextMonday = 7; 

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToNextMonday);

  const datesList: string[] = [];
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

  for (let i = 0; i < 5; i++) {
    const nextWeekDay = new Date(nextMonday);
    nextWeekDay.setDate(nextMonday.getDate() + i);
    datesList.push(nextWeekDay.toLocaleDateString('en-US', options));
  }

  const formattedRange = `${datesList[0]} to ${datesList[4]}`;
  return { formattedRange, datesList };
}

/**
 * FEATURE 2: The Email Delivery Transport Engine
 */
async function sendNewsletterEmail(dateRange: string, markdownContent: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const compiledHtmlContent = await marked(markdownContent);
  const targetInbox = process.env.EMAIL_RECEIVER || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Vonn-Newsletter-Agent" <${process.env.EMAIL_USER}>`,
    to: targetInbox,
    subject: `📰 Next Week in Time Column Draft: [${dateRange}]`,
    text: markdownContent, 
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3e50; line-height: 1.6; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">NEXT WEEK IN TIME</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Multi-Agent Production Draft • ${dateRange}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e1e4e8; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div class="newsletter-body" style="font-size: 16px;">
            ${compiledHtmlContent}
          </div>
        </div>
        
        <footer style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;">
          <p>This layout was autonomously researched by Agent-Historian and styled by Agent-Copywriter.</p>
          <p style="font-size: 10px; color: #bdc3c7;">Project-First-Agent • Multi-Agent Build v2.0</p>
        </footer>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * FEATURE 3: The Multi-Agent Collaboration Core
 */
async function runNewsletterAgent() {
  const { formattedRange, datesList } = getNextWeekDateRange();
  
  console.log(`📅 Target locked for next week: ${formattedRange}`);

  // ==========================================
  // STAGE 1: THE AGENT-HISTORIAN (RESEARCH)
  // ==========================================
  console.log("\n🕵️‍♂️ [Agent 1/2] Deploying Agent-Historian into the live web archives...");

  const researcherPrompt = `
You are an expert deep-dive historical researcher. Your sole job is to scrape the web and extract an exhaustive collection of fascinating, verified, raw facts for these calendar dates:
${datesList.map(d => `- ${d}`).join('\n')}

For EVERY SINGLE DAY, execute Google Searches to gather:
1. At least 10 to 12 iconic American historical milestones, sports history breakthroughs, pop culture anniversaries (famous movie/music releases), space exploration markers, or major US inventions. 
2. At least 2 or 3 distinct historical occurrences unique to Wisconsin and Illinois archives.
3. A list of 5 quirky or cultural celebrations for that day.

Provide the data as a clean, massive, unformatted raw list of facts. Do not worry about catchy intros, marketing tone, wit, or layout structure. Just deliver exhaustive, accurate factual data dumps.
`;

  try {
    // Fire Agent 1 with live search enabled
    const rawResearchData = await executeAgentCall(researcherPrompt, "Agent-Historian", true);
    console.log("✅ Agent-Historian complete! Raw web research dossier locked.");

    // ==========================================
    // STAGE 2: THE AGENT-COPYWRITER (EDITORIAL)
    // ==========================================
    console.log("\n✍️ [Agent 2/2] Passing dossier to Agent-Copywriter for styling & curation...");

    const editorPrompt = `
You are a premium, high-end American newsletter editor and witty copywriter. 
Your task is to take the raw historical research dossier provided below and transform it into a perfectly polished weekly column titled "NEXT WEEK IN TIME".

Target Dates to format:
${formattedRange}

Here is the raw data dossier you must curate from:
-----
${rawResearchData}
-----

CURATION AND STYLE RULES:
1. Daily Quota: For every single day, select exactly 7 to 8 of the absolute MOST nostalgic, recognizable, or impactful events for an American reader. Leave out any obscure or dry filler.
2. Structure: Follow this exact markdown layout for each day:
   ### [DAY NUMBER] [MONTH SHORT NAME] (e.g., 22 JUN)
   **On this day — [Full Day Name, Month, Date]**
   *A 2-sentence punchy, witty hook highlighting the themes of the day. Include a fun fact or a trivia.*

   **Celebrations & Holidays**
   - Curate 4 to 5 fun or official celebrations. Prioritize US official holidays if present.
   - Include quirky or pop-culture celebrations if they exist for that day.
   - Insert a fun fact oir trivia of why it is celebrated and make it brief but engaging.

   **Wisconsin & Illinois History**
   - Provide 1 or 2 localized events. Frame them dynamically to feel integrated into local lore.
   - Highlight any connections to broader US history or culture if possible.
   - Format: [Year] - [Event Title] - [1 to 2 sentence engaging summary of the event, its significance, and any interesting trivia. Make it feel alive and connected to local culture.]
   
   **US & World Historical Events**
   - Provide your 7 to 8 curated American-focused historical/pop-culture events.
   - For each event, write a 2 to 3 sentence engaging summary that captures the significance and emotional resonance. Use a witty, slightly dry tone that appeals to nostalgia and curiosity.
   - If any space exploration milestones or major inventions are present, make sure to highlight them with a bit more flair.
   - Format: [Year] - [Event Title] - [1 to 2 sentence engaging summary of the event, its significance, and any interesting trivia. Make it feel alive and connected to local culture.]

3. Tone: Witty, slightly dry, highly engaging, and perfectly scannable. Keep descriptions concise so the long list remains incredibly snappy.
4. Output Format: Return PURE markdown text only. Do not wrap response in markdown code blocks like \\\`\\\`\\\`markdown.
`;

    // Fire Agent 2 (No live search needed here, it parses the dossier natively!)
    const finalNewsletterContent = await executeAgentCall(editorPrompt, "Agent-Copywriter", false);
    console.log("✅ Agent-Copywriter complete! Editorial layout finalized.");

    // ==========================================
    // STAGE 3: OUTPUT DISPATCH PIPELINE
    // ==========================================
    const fileName = 'next-week-newsletter.md';
    fs.writeFileSync(fileName, finalNewsletterContent, 'utf8');
    console.log(`📝 Local file compiled successfully as: ${fileName}`);

    console.log(`📨 Initiating team email dispatch pipeline to your inbox...`);
    await sendNewsletterEmail(formattedRange, finalNewsletterContent);
    
    console.log("\n✨ MULTI-AGENT SUCCESS OVERALL!");
    console.log("🚀 The collaborative draft has been compiled and emailed as a premium styled asset to your inbox!");

  } catch (error) {
    console.error("\n❌ Core Multi-Agent Pipeline Crashed!");
    console.error(error);
  }
}

// Execute the team engine
runNewsletterAgent();