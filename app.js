/* ==========================================================
   CareerCraft — Final app.js (Complete & Ready)
   - Works with the final index.html and styles.css
   - Navigation uses .menu-btn
   - Includes About modal open/close handlers
   - Persists interview favorites in localStorage
   ========================================================== */

/* -------------------------
   Local datasets
   ------------------------- */
const JOB_KEYWORDS = {
  "software engineer": {
    technical: ["Java", "Dart", "Flutter", "Git", "REST API", "SQL", "OOP"],
    tools: ["Android Studio", "VS Code", "Postman"],
    soft: ["Problem Solving", "Teamwork", "Communication"]
  },
  "data analyst": {
    technical: ["SQL", "Excel", "Python", "Pandas", "Power BI"],
    tools: ["Tableau", "Power BI"],
    soft: ["Critical Thinking", "Attention to Detail"]
  },
  "ui ux designer": {
    technical: ["Figma", "Adobe XD", "Prototyping", "Wireframing"],
    tools: ["Figma", "Sketch"],
    soft: ["Creativity", "User Empathy"]
  },
  "product manager": {
    technical: ["Roadmap Planning", "A/B Testing", "Metrics Analysis"],
    tools: ["Jira", "Trello", "Notion"],
    soft: ["Stakeholder Management", "Communication"]
  }
};

const INTERVIEW_QUESTIONS = {
  hr: [
    "Tell me about yourself.",
    "Why do you want to work here?",
    "Where do you see yourself in 5 years?"
  ],
  technical: [
    "Explain the difference between REST and SOAP.",
    "What is OOP? Provide examples.",
    "How do you optimize SQL queries?"
  ],
  behavioral: [
    "Describe a time you faced a conflict in a team.",
    "Tell about a situation where you had to learn something quickly."
  ]
};

const PROFILE_TEMPLATES = {
  "developer": {
    headline: "Software Developer | Building Mobile & Web Solutions",
    about: "Motivated developer experienced in building responsive apps using modern stacks.",
    skills: ["Flutter", "Dart", "JavaScript", "Git", "REST APIs"]
  },
  "data analyst": {
    headline: "Data Analyst | Turning Data into Insights",
    about: "Data-driven analyst skilled with SQL, Python, visualization tools.",
    skills: ["SQL", "Python", "Pandas", "Power BI", "Excel"]
  },
  "designer": {
    headline: "UI/UX Designer | Crafting Intuitive Experiences",
    about: "Creative designer focused on user-centered interfaces.",
    skills: ["Figma", "Prototyping", "User Research"]
  }
};

/* -------------------------
   Utilities
   ------------------------- */
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function countWords(text) { return (text || '').trim().split(/\s+/).filter(Boolean).length; }
function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', right: '18px', bottom: '18px', padding: '10px 14px',
    background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '10px', zIndex: 9999, fontSize: '13px'
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 1600);
}

/* -------------------------
   Element refs (safe-get)
   ------------------------- */
const panels = {
  resume: document.getElementById('panel-resume'),
  keywords: document.getElementById('panel-keywords'),
  interview: document.getElementById('panel-interview'),
  profile: document.getElementById('panel-profile')
};

const resumeInput = document.getElementById('resumeInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resumeResult = document.getElementById('resumeResult');
const resumeScore = document.getElementById('resumeScore');
const quickScore = document.getElementById('quickScore');
const wordCountEl = document.getElementById('wordCount');
const clearResume = document.getElementById('clearResume');

const jobTitle = document.getElementById('jobTitle');
const findBtn = document.getElementById('findKeywords');
const keywordsResult = document.getElementById('keywordsResult');

const startQ = document.getElementById('startQ');
const nextQ = document.getElementById('nextQ');
const qCategory = document.getElementById('qCategory');
const qText = document.getElementById('qText');
const favToggle = document.getElementById('favToggle');
const favCountEl = document.getElementById('favCount');

const roleSelect = document.getElementById('roleSelect');
const generateProfile = document.getElementById('generateProfile');
const profileResult = document.getElementById('profileResult');
const copyAll = document.getElementById('copyAll');

const openAbout = document.getElementById('openAbout');
const aboutPanel = document.getElementById('aboutPanel');
const closeAbout = document.getElementById('closeAbout');

/* -------------------------
   Navigation (menu-btn)
   ------------------------- */
function setActive(target) {
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.target === target));
  Object.keys(panels).forEach(k => {
    if (!panels[k]) return;
    panels[k].classList.remove('active-card');
    panels[k].style.display = (k === target) ? 'block' : 'none';
  });
  if (panels[target]) panels[target].classList.add('active-card');
}
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => setActive(btn.dataset.target));
  btn.setAttribute('tabindex', '0');
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') setActive(btn.dataset.target); });
});

/* Ensure initial state (resume visible) */
setActive('resume');

/* -------------------------
   Resume Analyzer
   ------------------------- */
function analyzeResume(text) {
  const lower = (text || '').toLowerCase();
  let score = 0;
  const missing = [];

  if (lower.includes('experience') || lower.includes('work experience')) score += 25; else missing.push('Experience section');
  if (lower.includes('education')) score += 25; else missing.push('Education section');
  if (lower.includes('skills') || lower.includes('technical skills')) score += 25; else missing.push('Skills section');
  if (lower.includes('projects') || lower.includes('academic projects')) score += 25; else missing.push('Projects section');

  const words = countWords(text);
  if (words < 150) { score = Math.max(0, score - 10); if (!missing.includes('Consider adding more details')) missing.push('Consider adding more details (resume short)'); }

  return { score, missing, words };
}

function renderResumeResult({ score, missing, words }) {
  resumeResult.innerHTML = `
    <div style="margin-bottom:12px;font-size:18px;font-weight:700">Score: ${score}%</div>
    <div class="muted">Detected words: ${words}</div>
    <div style="margin-top:12px;font-weight:700">Suggestions</div>
    ${missing.length ? '<ul class="muted">' + missing.map(m => `<li>${escapeHtml(m)}</li>`).join('') + '</ul>' : '<div class="muted">All key sections found — consider quantifying achievements.</div>'}
  `;
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', () => {
    const text = resumeInput ? resumeInput.value : '';
    const res = analyzeResume(text);
    if (resumeScore) resumeScore.textContent = `Score: ${res.score}%`;
    if (quickScore) quickScore.textContent = `${res.score}%`;
    if (wordCountEl) wordCountEl.textContent = res.words;
    renderResumeResult(res);
  });
}
if (clearResume) {
  clearResume.addEventListener('click', () => {
    if (resumeInput) resumeInput.value = '';
    if (resumeScore) resumeScore.textContent = 'Score: —';
    if (quickScore) quickScore.textContent = '—%';
    if (resumeResult) resumeResult.innerHTML = '';
    if (wordCountEl) wordCountEl.textContent = '0';
  });
}
if (resumeInput) {
  resumeInput.addEventListener('input', () => {
    if (wordCountEl) wordCountEl.textContent = countWords(resumeInput.value);
  });
}

/* Preload sample text for demo (keeps UI lively) */
if (resumeInput) {
  resumeInput.value = `John Doe
Summary: Passionate software developer...
Experience: Worked at XYZ...
Education: B.Tech in Computer Science...
Skills: Flutter, Dart, Git, REST API
Projects: Built mobile apps for attendance and events.`;
  if (wordCountEl) wordCountEl.textContent = countWords(resumeInput.value);
}

/* -------------------------
   Job Keyword Finder
   ------------------------- */
if (findBtn) {
  findBtn.addEventListener('click', () => {
    const q = (jobTitle && jobTitle.value || '').trim().toLowerCase();
    if (!q) { if (keywordsResult) keywordsResult.innerHTML = `<div class="muted">Please enter a job title.</div>`; return; }
    let match = JOB_KEYWORDS[q] || null;
    if (!match) {
      for (const k of Object.keys(JOB_KEYWORDS)) {
        if (k.includes(q) || q.includes(k.split(' ')[0])) { match = JOB_KEYWORDS[k]; break; }
      }
    }
    if (!match) { if (keywordsResult) keywordsResult.innerHTML = `<div class="muted">No data found for "<strong>${escapeHtml(q)}</strong>". Try "software engineer".</div>`; return; }
    if (keywordsResult) {
      keywordsResult.innerHTML = `
        ${match.technical ? '<div style="font-weight:700">Technical</div><div class="tags">' + match.technical.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('') + '</div>' : ''}
        ${match.tools ? '<div style="font-weight:700;margin-top:8px">Tools</div><div class="tags">' + match.tools.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('') + '</div>' : ''}
        ${match.soft ? '<div style="font-weight:700;margin-top:8px">Soft skills</div><div class="tags">' + match.soft.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('') + '</div>' : ''}
        <div class="muted" style="margin-top:8px">Tip: include top 3 technical skills & 2 tools for ATS match.</div>
      `;
    }
  });
}

/* -------------------------
   Interview Trainer
   ------------------------- */
let currentQuestion = null;
let favorites = JSON.parse(localStorage.getItem('cc_favorites') || '[]');

function saveFavorites() { localStorage.setItem('cc_favorites', JSON.stringify(favorites)); }

function getRandomQuestion(cat) {
  const list = INTERVIEW_QUESTIONS[cat] || [];
  if (!list.length) return "No questions found for this category.";
  return list[Math.floor(Math.random() * list.length)];
}

function loadQuestion() {
  const cat = qCategory ? qCategory.value : 'hr';
  currentQuestion = getRandomQuestion(cat);
  if (qText) qText.textContent = currentQuestion;
  if (favToggle) {
    if (favorites.includes(currentQuestion)) favToggle.classList.add('active'); else favToggle.classList.remove('active');
  }
}

if (startQ) {
  startQ.addEventListener('click', () => {
    loadQuestion();
    if (nextQ) nextQ.style.display = 'inline-block';
  });
}
if (nextQ) {
  nextQ.addEventListener('click', loadQuestion);
}
if (favToggle) {
  favToggle.addEventListener('click', () => {
    if (!currentQuestion) return;
    const idx = favorites.indexOf(currentQuestion);
    if (idx === -1) { favorites.push(currentQuestion); favToggle.classList.add('active'); }
    else { favorites.splice(idx, 1); favToggle.classList.remove('active'); }
    if (favCountEl) favCountEl.textContent = favorites.length;
    saveFavorites();
  });
}

/* Self-rate buttons inside interview card (delegated binding) */
document.addEventListener('click', function (e) {
  const btn = e.target.closest && e.target.closest('button[data-rate]');
  if (!btn) return;
  const r = btn.dataset.rate;
  const msg = r === '1' ? 'Poor — practice more.' : r === '2' ? 'Average — good attempt.' : 'Good — strong answer.';
  if (qText && currentQuestion) {
    const prev = qText.textContent;
    qText.textContent = `${currentQuestion} — (You rated: ${msg})`;
    setTimeout(() => { qText.textContent = currentQuestion; }, 1200);
  } else {
    toast(msg);
  }
});

/* restore fav count */
if (favCountEl) favCountEl.textContent = (favorites || []).length;

/* -------------------------
   Profile Enhancer
   ------------------------- */
(function initRoles() {
  if (!roleSelect) return;
  roleSelect.innerHTML = Object.keys(PROFILE_TEMPLATES).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
})();

if (generateProfile) {
  generateProfile.addEventListener('click', () => {
    const role = roleSelect ? roleSelect.value : null;
    const tpl = PROFILE_TEMPLATES[role];
    if (!tpl) { if (profileResult) profileResult.innerHTML = `<div class="muted">No template found.</div>`; return; }
    if (profileResult) {
      profileResult.innerHTML = `
        <div style="font-weight:700">Headline</div>
        <div style="margin-top:6px">${escapeHtml(tpl.headline)}</div>
        <div style="margin-top:12px;font-weight:700">About</div>
        <div style="margin-top:6px">${escapeHtml(tpl.about)}</div>
        <div style="margin-top:12px;font-weight:700">Skills</div>
        <div class="tags">${tpl.skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')}</div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button id="copyHeadline" class="btn-ghost">Copy Headline</button>
          <button id="copyAbout" class="btn-ghost">Copy About</button>
        </div>
      `;
      const ch = document.getElementById('copyHeadline');
      const ca = document.getElementById('copyAbout');
      if (ch) ch.addEventListener('click', () => { navigator.clipboard.writeText(tpl.headline); toast('Headline copied'); });
      if (ca) ca.addEventListener('click', () => { navigator.clipboard.writeText(tpl.about); toast('About copied'); });
    }
  });
}
if (copyAll) {
  copyAll.addEventListener('click', () => {
    const role = roleSelect ? roleSelect.value : null;
    const tpl = PROFILE_TEMPLATES[role];
    if (!tpl) return toast('Select a role first');
    navigator.clipboard.writeText(`${tpl.headline}\n\n${tpl.about}\n\nSkills: ${tpl.skills.join(', ')}`);
    toast('Profile copied to clipboard');
  });
}

/* -------------------------
   About modal handlers
   ------------------------- */
if (openAbout && aboutPanel) {
  openAbout.addEventListener('click', () => { aboutPanel.style.display = 'flex'; });
}
if (closeAbout && aboutPanel) {
  closeAbout.addEventListener('click', () => { aboutPanel.style.display = 'none'; });
}
if (aboutPanel) {
  aboutPanel.addEventListener('click', (e) => { if (e.target === aboutPanel) aboutPanel.style.display = 'none'; });
}

/* -------------------------
   Final small initializations
   ------------------------- */
/* Fill demo values for quick demo */
if (jobTitle) jobTitle.value = 'software engineer';
if (roleSelect && !roleSelect.value) roleSelect.value = Object.keys(PROFILE_TEMPLATES)[0];

/* ensure quickScore shows initial */
if (quickScore) quickScore.textContent = '—%';
