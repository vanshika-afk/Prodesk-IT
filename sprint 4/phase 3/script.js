// ════════════════════════════════════════════════════
//  COVER LETTER GENERATOR — script.js
//  Phase 1: Template generation
//  Phase 2: Gemini AI integration + mode toggle
//  Phase 3: PDF resume upload + context injection
// ════════════════════════════════════════════════════

// ─── State ───────────────────────────────────────────
const state = {
  name: "",
  role: "",
  company: "",
  skills: "",
  useAI: false,
  resumeText: "",   // Phase 3: extracted text from PDF
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
const loadingState = document.getElementById("loadingState");

// Phase 2
const aiToggle    = document.getElementById("aiToggle");
const modeText    = document.getElementById("modeText");
const apiKeyField = document.getElementById("apiKeyField");
const apiKeyInput = document.getElementById("apiKey");

// Phase 3
const dropzone       = document.getElementById("dropzone");
const resumeFileInput= document.getElementById("resumeFile");
const browseBtn      = document.getElementById("browseBtn");
const resumeBadge    = document.getElementById("resumeBadge");
const resumeFileName = document.getElementById("resumeFileName");
const removeResume   = document.getElementById("removeResume");

// ─── Sync Inputs → State ─────────────────────────────
nameInput.addEventListener("input",    () => { state.name    = nameInput.value.trim(); });
roleInput.addEventListener("input",    () => { state.role    = roleInput.value.trim(); });
companyInput.addEventListener("input", () => { state.company = companyInput.value.trim(); });
skillsInput.addEventListener("input",  () => { state.skills  = skillsInput.value.trim(); });

// ─── Phase 2: Mode Toggle ─────────────────────────────
aiToggle.addEventListener("change", () => {
  state.useAI = aiToggle.checked;
  modeText.textContent = state.useAI ? "AI (Gemini)" : "Template";
  apiKeyField.classList.toggle("visible", state.useAI);
  generateBtn.textContent = state.useAI ? "Generate with AI" : "Generate Letter";
});

// ════════════════════════════════════════════════════
//  PHASE 3 — PDF Upload & Text Extraction
// ════════════════════════════════════════════════════

// Tell PDF.js where its worker script is (loaded from CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Open file picker when "browse file" is clicked
browseBtn.addEventListener("click", () => resumeFileInput.click());

// Also open picker when dropzone is clicked (not on the button itself)
dropzone.addEventListener("click", (e) => {
  if (e.target !== browseBtn) resumeFileInput.click();
});

// Drag-over highlight
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));

// Drop handler
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) handlePDFFile(file);
});

// File input change handler
resumeFileInput.addEventListener("change", () => {
  if (resumeFileInput.files[0]) handlePDFFile(resumeFileInput.files[0]);
});

// Remove resume
removeResume.addEventListener("click", () => {
  state.resumeText = "";
  resumeFileInput.value = "";
  resumeBadge.style.display = "none";
  dropzone.style.display = "flex";
});

// Extract text from PDF using PDF.js
async function handlePDFFile(file) {
  if (!file.name.endsWith(".pdf")) {
    alert("Please upload a PDF file.");
    return;
  }

  dropzone.classList.add("parsing");
  dropzone.querySelector(".drop-text").innerHTML = "Reading PDF…";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    // Loop through each page and extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    state.resumeText = fullText.trim();

    // Show badge, hide dropzone
    resumeFileName.textContent = file.name;
    resumeBadge.style.display  = "flex";
    dropzone.style.display     = "none";
  } catch (err) {
    alert("Could not read the PDF. Please try a different file.");
    dropzone.querySelector(".drop-text").innerHTML =
      'Drag & drop your PDF here<br/><span class="drop-sub">or <button type="button" id="browseBtn" class="link-btn">browse file</button></span>';
  } finally {
    dropzone.classList.remove("parsing");
  }
}

// ════════════════════════════════════════════════════
//  PHASE 1 — Template Controller (always available)
// ════════════════════════════════════════════════════
function generateTemplate(name, role, company, skills) {
  return `Dear Hiring Manager at ${company},

I am ${name}, and I am writing to express my strong interest in the ${role} position at ${company}. Having worked with ${skills}, I am confident that I can contribute meaningfully to your team.

Throughout my journey, I have built hands-on experience with ${skills}. I thrive in collaborative environments where I can solve real problems and continuously grow. ${company}'s reputation for innovation and excellence makes it exactly the kind of place where I want to bring my skills.

I would love the opportunity to discuss how my background aligns with the needs of your team. Please feel free to reach out at your earliest convenience.

Thank you for your time and consideration.

Warm regards,
${name}`;
}

// ════════════════════════════════════════════════════
//  PHASE 2+3 — Gemini AI Controller
// ════════════════════════════════════════════════════
async function generateWithAI(name, role, company, skills, apiKey, resumeText) {
  // Build the system prompt — inject all state variables
  let prompt = `You are a professional cover letter writer.
Write a warm, confident, and concise cover letter for the following candidate:

- Name: ${name}
- Applying for: ${role} at ${company}
- Key Skills: ${skills}`;

  // Phase 3: Append resume context if available
  if (resumeText) {
    prompt += `\n\nHere is the candidate's resume for additional context. Use specific details from it (projects, experience, achievements) to personalize the letter:\n\n${resumeText.slice(0, 3000)}`;
  }

  prompt += `

Instructions:
- Keep it under 220 words.
- Use a professional but human tone.
- Start with "Dear Hiring Manager at ${company},"
- End with "Warm regards,\\n${name}"
- Do NOT use placeholder brackets. Use actual values only.
- Format the output as plain paragraphs separated by blank lines. No bullet points, no markdown symbols like ** or ##.`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
  return data.candidates[0].content.parts[0].text.trim();
}

// ─── Phase 3: Parse plain text → clean HTML paragraphs ──
// Splits on blank lines, wraps each chunk in <p>
function textToHTML(text) {
  return text
    .split(/\n\s*\n/)           // split on blank lines
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");
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

function showLetter(htmlContent) {
  letterOutput.innerHTML = htmlContent;
  letterOutput.classList.remove("placeholder");
}

function showError(msg) {
  letterOutput.textContent = "⚠ " + msg;
  letterOutput.classList.add("placeholder");
}

// ─── Generate Button Handler ──────────────────────────
generateBtn.addEventListener("click", async () => {
  const { name, role, company, skills, useAI, resumeText } = state;

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
      const rawText = await generateWithAI(name, role, company, skills, apiKey, resumeText);
      showLetter(textToHTML(rawText));  // Phase 3: render as HTML paragraphs
    } catch (err) {
      showError("AI error: " + err.message);
    } finally {
      setLoading(false);
    }

  } else {
    // Phase 1 template — instant
    const rawText = generateTemplate(name, role, company, skills);
    showLetter(textToHTML(rawText));
  }
});

// ─── Copy to Clipboard ────────────────────────────────
copyBtn.addEventListener("click", () => {
  // Get plain text from the rendered HTML
  const text = letterOutput.innerText;
  if (letterOutput.classList.contains("placeholder")) return;

  navigator.clipboard.writeText(text).then(() => {
    copyNotice.classList.add("show");
    setTimeout(() => copyNotice.classList.remove("show"), 2000);
  });
});
