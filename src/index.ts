import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs'; // Native Node module to read/write files on your hard drive

// 1. Initialize environmental protection
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("🛑 API Key missing!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * FEATURE 1: The Dynamic Date Calculator
 * Calculates the calendar dates for the upcoming Monday through Friday.
 */
function getNextWeekDateRange(): { formattedRange: string; datesList: string[] } {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  let daysToNextMonday = (1 - currentDayOfWeek + 7) % 7;
  if (daysToNextMonday === 0) daysToNextMonday = 7; 

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToNextMonday);

  const datesList: string[] = [];
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

  // Loop 5 times to generate Monday through Friday dates
  for (let i = 0; i < 5; i++) {
    const nextWeekDay = new Date(nextMonday);
    nextWeekDay.setDate(nextMonday.getDate() + i);
    datesList.push(nextWeekDay.toLocaleDateString('en-US', options));
  }

  const formattedRange = `${datesList[0]} to ${datesList[4]}`;
  return { formattedRange, datesList };
}

/**
 * FEATURE 2: The Agent Execution Core
 */
async function runNewsletterAgent() {
  const { formattedRange, datesList } = getNextWeekDateRange();
  
  console.log(`📅 Target locked for next week: ${formattedRange}`);
  console.log("🤖 Formulating system prompt and instructing Gemini Brain...");

  const systemPrompt = `
You are an expert historical researcher and witty copywriter for a high-end American newsletter. 
Your task is to generate a weekly history column titled "NEXT WEEK IN TIME" strictly tailored for American readers.

Target Dates to cover:
${datesList.map(d => `- ${d}`).join('\n')}

For EVERY SINGLE DAY (Monday through Friday), you must generate content following this exact layout and strict guidelines:

### [DAY NUMBER] [MONTH SHORT NAME] (e.g., 22 JUN)
**On this day — [Full Day Name, Month, Date]**
*A 1-sentence punchy hook highlighting the themes of the day.*

**Celebrations & Holidays**
- Generate at least 4 or 5 National or World celebrations that are FUN, interesting, or quirky.
- CRITICAL: Prioritize official or cultural US holidays if there are any for those dates. Keep descriptions brief, punchy, and modern.

**Wisconsin & Illinois History**
- Provide exactly 1 or 2 historical events specific to Wisconsin and Illinois. 
- Frame it dynamically. Connect it to the broader American landscape or local lore when possible.

**US & World Historical Events**
- Provide 2 to 3 historical events that are universally fascinating, fun, or impactful.
- Avoid boring dry recaps. Find the unusual details (like the security guard tape in Watergate or the pack of gum for the barcode).

STYLE RULES:
1. Tone: Witty, slightly dry, deeply engaging, and highly scannable. 
2. Length: Concise. Do not make descriptions too lengthy. Keep paragraphs punchy.
3. Output Format: Return PURE markdown text only. Do not wrap your response in markdown code blocks like \\\`\\\`\\\`markdown.
`;

  try {
    let response = null;
    let attempts = 0;
    const maxAttempts = 3;
    let delayMs = 2000; // Start with a 2-second delay

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Self-Healing Retry Engine
    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
        });
        
        break; // Success! Break out of the retry loop
      } catch (error: any) {
        if (error.status === 503 && attempts < maxAttempts) {
          console.warn(`⚠️ Gemini is busy (Error 503). Attempt ${attempts}/${maxAttempts} failed. Retrying in ${delayMs / 1000} seconds...`);
          await sleep(delayMs);
          delayMs *= 2; // Exponential Backoff
        } else {
          throw error; // Pass along unexpected errors or final exhaustions
        }
      }
    }

    const content = response?.text;

    if (!content) {
      throw new Error("Received empty text back from the AI model.");
    }

    const fileName = 'next-week-newsletter.md';
    fs.writeFileSync(fileName, content, 'utf8');

    console.log("\n✨ SUCCESS!");
    console.log(`📝 Your newsletter file has been compiled and saved as: ${fileName}`);
    console.log("Check your sidebar, open the file, and view your perfectly structured content!");

  } catch (error) {
    console.error("\n❌ Agent Execution Failed!");
    console.error(error);
  }
}

// Execute the automation engine
runNewsletterAgent();