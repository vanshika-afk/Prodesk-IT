// ─── State ────────────────────────────────────────────
const state = {
  name: "",
  role: "",
  company: "",
  skills: "",
};

// ─── DOM References ───────────────────────────────────
const nameInput     = document.getElementById("name");
const roleInput     = document.getElementById("role");
const companyInput  = document.getElementById("company");
const skillsInput   = document.getElementById("skills");
const generateBtn   = document.getElementById("generateBtn");
const copyBtn       = document.getElementById("copyBtn");
const letterOutput  = document.getElementById("letterOutput");
const copyNotice    = document.getElementById("copyNotice");

// ─── Sync Inputs → State ─────────────────────────────
nameInput.addEventListener("input",    () => { state.name    = nameInput.value.trim(); });
roleInput.addEventListener("input",    () => { state.role    = roleInput.value.trim(); });
companyInput.addEventListener("input", () => { state.company = companyInput.value.trim(); });
skillsInput.addEventListener("input",  () => { state.skills  = skillsInput.value.trim(); });

// ─── Controller: Build Letter ─────────────────────────
function generateLetter(name, role, company, skills) {
  if (!name || !role || !company || !skills) {
    return null; // signal that fields are missing
  }

  return `Dear Hiring Manager at ${company},

I am ${name}, and I am writing to express my strong interest in the ${role} position at ${company}. Having worked with ${skills}, I am confident that I can contribute meaningfully to your team.

Throughout my journey, I have built hands-on experience with ${skills}. I thrive in collaborative environments where I can solve real problems and continuously grow. ${company}'s reputation for innovation and excellence makes it exactly the kind of place where I want to bring my skills.

I would love the opportunity to discuss how my background aligns with the needs of your team. Please feel free to reach out at your earliest convenience.

Thank you for your time and consideration.

Warm regards,
${name}`;
}

// ─── Generate Button Handler ──────────────────────────
generateBtn.addEventListener("click", () => {
  const letter = generateLetter(
    state.name,
    state.role,
    state.company,
    state.skills
  );

  if (!letter) {
    letterOutput.textContent = "Please fill in all four fields before generating.";
    letterOutput.classList.add("placeholder");
    return;
  }

  letterOutput.textContent = letter;
  letterOutput.classList.remove("placeholder");
});

// ─── Copy to Clipboard Handler ────────────────────────
copyBtn.addEventListener("click", () => {
  const text = letterOutput.textContent;

  if (!text || letterOutput.classList.contains("placeholder")) return;

  navigator.clipboard.writeText(text).then(() => {
    copyNotice.classList.add("show");
    setTimeout(() => copyNotice.classList.remove("show"), 2000);
  });
});

// ─── Init: set placeholder style ─────────────────────
letterOutput.classList.add("placeholder");
