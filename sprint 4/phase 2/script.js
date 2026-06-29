// ─── State ────────────────────────────────────────────
const state = {
  name: "",
  role: "",
  company: "",
  skills: "",
  useAI: false,
};

// ─── DOM References ───────────────────────────────────
const nameInput    = document.getElementById("name");
const roleInput    = document.getElementById("role");
const companyInput = document.getElementById("company");
const skillsInput  = document.getElementById("skills");
const generateBtn  = document.getElementById("generateBtn");
const copyBtn      = document.getElementById("copyBtn");
const letterOutput = document.getElementById("letterOutput");
const copyNotice   = document.getElementById("copyNotice");
const aiToggle     = document.getElementById("aiToggle");
const modeText     = document.getElementById("modeText");
const apiKeyField  = document.getElementById("apiKeyField");
const apiKeyInput  = document.getElementById("apiKey");
const loadingState = document.getElementById("loadingState");

// ─── Sync Inputs → State ──────────────────────────────
nameInput.addEventListener("input",    () => { state.name    = nameInput.value.trim(); });
roleInput.addEventListener("input",    () => { state.role    = roleInput.value.trim(); });
companyInput.addEventListener("input", () => { state.company = companyInput.value.trim(); });
skillsInput.addEventListener("input",  () => { state.skills  = skillsInput.value.trim(); });

// ─── Mode Toggle ──────────────────────────────────────
aiToggle.addEventListener("change", () => {
  state.useAI = aiToggle.checked;
  modeText.textContent = state.useAI ? "AI (Gemini)" : "Template";
  apiKeyField.classList.toggle("visible", state.useAI);
  generateBtn.textContent = state.useAI ? "Generate with AI" : "Generate Letter";
});

// ─── Template Controller (Phase 1 — kept intact) ─────
function generateTemplate(name, role, company, skills) {
  return `Dear Hiring Manager at ${company},

I am ${name}, and I am writing to express my strong interest in the ${role} position at ${company}. Having worked with ${skills}, I am confident that I can contribute meaningfully to your team.

Throughout my journey, I have built hands-on experience with ${skills}. I thrive in collaborative environments where I can solve real problems and continuously grow. ${company}'s reputation for innovation and excellence makes it exactly the kind of place where I want to bring my skills.

I would love the opportunity to discuss how my background aligns with the needs of your team. Please feel free to reach out at your earliest convenience.

Thank you for your time and consideration.

Warm regards,
${name}`;
}

// ─── AI Controller (Phase 2 — Gemini API) ────────────
async function generateWithAI(name, role, company, skills, apiKey) {
  // System prompt — state variables injected here
  const prompt = `You are a professional cover letter writer.
Write a warm, confident, and concise cover letter for the following candidate:

- Name: ${name}
- Applying for: ${role} at ${company}
- Key Skills: ${skills}

Instructions:
- Keep it under 200 words.
- Use a professional but human tone.
- Start with "Dear Hiring Manager at ${company},"
- End with "Warm regards, ${name}"
- Do NOT use placeholder brackets like [Your Name]. Use the actual values.`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "API request failed.");
  }

  const data = await response.json();
  // Extract text from Gemini response structure
  return data.candidates[0].content.parts[0].text.trim();
}

// ─── UI Helpers ───────────────────────────────────────
function setLoading(on) {
  loadingState.classList.toggle("visible", on);
  letterOutput.classList.toggle("hidden", on);
  generateBtn.disabled = on;
  generateBtn.textContent = on
    ? "Generating…"
    : state.useAI ? "Generate with AI" : "Generate Letter";
}

function showLetter(text) {
  letterOutput.textContent = text;
  letterOutput.classList.remove("placeholder");
}

function showError(msg) {
  letterOutput.textContent = "⚠ " + msg;
  letterOutput.classList.add("placeholder");
}

// ─── Generate Button Handler ──────────────────────────
generateBtn.addEventListener("click", async () => {
  const { name, role, company, skills, useAI } = state;

  // Validate fields
  if (!name || !role || !company || !skills) {
    showError("Please fill in all four fields before generating.");
    return;
  }

  if (useAI) {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showError("Please paste your Gemini API key to use AI mode.");
      return;
    }

    setLoading(true);
    try {
      const letter = await generateWithAI(name, role, company, skills, apiKey);
      showLetter(letter);
    } catch (err) {
      showError("AI error: " + err.message);
    } finally {
      setLoading(false);
    }
  } else {
    // Phase 1 template — instant, no loading needed
    showLetter(generateTemplate(name, role, company, skills));
  }
});

// ─── Copy to Clipboard ────────────────────────────────
copyBtn.addEventListener("click", () => {
  const text = letterOutput.textContent;
  if (letterOutput.classList.contains("placeholder")) return;

  navigator.clipboard.writeText(text).then(() => {
    copyNotice.classList.add("show");
    setTimeout(() => copyNotice.classList.remove("show"), 2000);
  });
});
