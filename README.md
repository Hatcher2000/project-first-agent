# Project: First AI Agent (Sandbox)

## 📌 Project Context
This project is an educational sandbox designed to build, test, and deploy a custom AI Agent. The primary objective is to learn practical software engineering principles, master TypeScript/JavaScript integration with LLM (Large Language Model) APIs, and establish a clean, production-grade portfolio project on GitHub and Vercel. 

---

## 🙋‍♂️ About Me
* **Level:** Complete Beginner transitioning into AI-assisted development.
* **Core Goal:** To bridge the gap between "vibe-coding" (using AI to write code) and fundamental engineering logic (understanding *why* the code works, tracking data flow, and debugging systematically).
* **Learning Philosophy:** Education over speed. Every structural change, library installation, and architectural decision must be broken down and understood.

---

## 🛠️ Rules & Guardrails
To maximize learning and maintain repository health, this project strictly adheres to the following rules:
1. **No Magic Code:** Never copy-paste a block of code without understanding what its functions, arguments, and return types are doing.
2. **Commit Early, Commit Often:** Use semantic commit messages (e.g., `feat:`, `fix:`, `docs:`) after every successful mini-milestone to build a robust GitHub contribution history.
3. **Environment Security:** Never, under any circumstances, hardcode API keys. All credentials must live in a hidden `.env` file that is ignored by Git.
4. **Console Transparency:** Use descriptive logging (`console.log`) across the application lifecycle so we can visually trace how data moves from the user, through the agent, and back.

---

## 📁 Project Structure
As the project scales, we will maintain a modular and predictable directory tree:

Project-First-Agent/
├── .env                 # Hidden file containing private API keys (Never commit!)
├── .gitignore           # Tells Git to ignore node_modules and .env
├── package.json         # Tracks project dependencies and execution scripts
├── tsconfig.json        # TypeScript compiler configurations
├── README.md            # This documentation file
└── src/
    ├── index.ts         # Main entry point where the Agent initializes
    ├── agent.ts         # Core Agent logic, system prompts, and LLM orchestration
    ├── tools/           # Custom capabilities we give our agent (e.g., fetching web data)
    └── utils/           # Helper functions (logging, formatting)