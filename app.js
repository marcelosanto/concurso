/* =========================================================================
   CONTEÚDO EMBUTIDO
   Substitua o texto abaixo pelo seu INITIAL_FGC_MARKDOWN original
   (ou deixe este exemplo e use a pasta ./estudos-banestes/).
   Formato esperado: # Título / **Data:** .. | **Eixo:** .. / ## 1. Diagnóstico
   / ## 2. Material (com ###) / ## 3. Simulado (com **Gabarito Comentado**).
   ========================================================================= */
const INITIAL_FGC_MARKDOWN = `# Fundo Garantidor de Créditos (FGC)
**Data:** 17/11/2026 | **Eixo:** Conhecimentos Bancários

## 1. DIAGNÓSTICO DO FOCO
-   **Tema Escolhido:** FGC: conceitos, abrangência e limites.
-   **Justificativa:** Tema recorrente em provas da FCC.
-   **4 Subtópicos:**
  1.  O que é o FGC
  2.  Créditos garantidos
  3.  Limites de cobertura
  4.  Exceções

## 2. MATERIAL DE ESTUDO
### 1. Conceitos essenciais
-   **FGC:** Associação civil de direito privado, sem fins lucrativos, que protege depositantes e investidores.

## 3. SIMULADO FCC – 1 QUESTÃO
**Questão 1**
O FGC é:
a) Autarquia federal.
b) Associação civil de direito privado sem fins lucrativos.

**Gabarito Comentado**

**Questão 1:**
-   **Alternativa Correta: b)** O FGC é associação civil de direito privado.`;

/* ============================ UTILITÁRIOS ============================ */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hasMd = () => window.marked && window.DOMPurify;
const md = (t) => hasMd() ? DOMPurify.sanitize(marked.parse(String(t || ""))) : `<p>${esc(t)}</p>`;
const mdi = (t) => hasMd() ? DOMPurify.sanitize(marked.parseInline(String(t || ""))) : esc(t);
const hash = (s) => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };

function showToast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  $("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ============================== PARSER ============================== */
function splitTop(text) {
  let title = "", meta = "", cur = null;
  const secs = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && !title) { title = h1[1].trim(); continue; }
    if (title && !meta && !cur && /^\*\*Data:\*\*/i.test(line.trim())) { meta = line.trim(); continue; }
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) { cur = { heading: h2[1].trim(), lines: [] }; secs.push(cur); continue; }
    if (cur) cur.lines.push(line);
  }
  return { title: title || "Material de Estudo", meta, secs };
}

const Q_HEAD = /\*\*Questão\s+(\d+):?\*\*:?\s*/i;
const Q_SPLIT = /(?=\*\*Questão\s+\d+:?\*\*)/i;

function parseStudyMarkdown(markdown, fileName) {
  const top = splitTop(markdown);
  const dateLabel = (top.meta.match(/\*\*Data:\*\*\s*([^|]+)/i) || [])[1]?.trim() || "";
  const axisLabel = (top.meta.match(/\*\*Eixo:\*\*\s*([^|]+)/i) || [])[1]?.trim() || "";
  const diagnostic = { tema: "", justificativa: "", subtopicos: [] };
  const materialSections = [];
  let simuladoRaw = "", gabaritoRaw = "";

  for (const sec of top.secs) {
    const h = sec.heading.toLowerCase();
    const body = sec.lines.join("\n").trim();
    if (h.includes("diagn")) {
      diagnostic.tema = (body.match(/\*\*Tema Escolhido:\*\*\s*([^\n]+)/i) || [])[1]?.trim() || "";
      diagnostic.justificativa = (body.match(/\*\*Justificativa[^*]*:\*\*\s*([^\n]+)/i) || [])[1]?.trim() || "";
      diagnostic.subtopicos = body.split(/\r?\n/).filter((l) => /^\s+\d+\.\s+/.test(l)).map((l) => l.replace(/^\s*\d+\.\s+/, "").trim());
    } else if (h.includes("material")) {
      body.split(/^###\s+/m).forEach((part, i) => {
        if (!part.trim()) return;
        if (i === 0) { materialSections.push({ title: "Visão geral", md: part }); return; }
        const nl = part.indexOf("\n");
        materialSections.push({ title: (nl >= 0 ? part.slice(0, nl) : part).trim(), md: nl >= 0 ? part.slice(nl + 1) : "" });
      });
    } else if (h.includes("gabarito")) gabaritoRaw = body;
    else if (h.includes("simulado") || h.includes("quest")) simuladoRaw = body;
  }

  // gabarito dentro do simulado (**Gabarito Comentado**)
  const gi = simuladoRaw.search(/\*\*Gabarito[^*]*\*\*/i);
  if (!gabaritoRaw && gi >= 0) {
    gabaritoRaw = simuladoRaw.slice(gi);
    simuladoRaw = simuladoRaw.slice(0, gi).replace(/\n-{3,}\s*$/, "");
  }

  const gabaritoList = gabaritoRaw.split(Q_SPLIT).filter((c) => Q_HEAD.test(c)).map((chunk) => {
    const key = chunk.match(/Alternativa Correta:?\s*(?:\*\*)?\s*([a-e])\)/i);
    return { qNum: chunk.match(Q_HEAD)[1], correctLetter: key ? key[1].toLowerCase() : "", commentMd: chunk.replace(Q_HEAD, "") };
  });

  const questions = simuladoRaw.split(Q_SPLIT).filter((c) => Q_HEAD.test(c)).map((chunk) => {
    const number = chunk.match(Q_HEAD)[1];
    const stmt = [], options = [];
    chunk.replace(Q_HEAD, "").split(/\r?\n/).forEach((l) => {
      const t = l.trim(), m = t.match(/^([a-e])\)\s+(.+)$/i);
      if (m) options.push({ letter: m[1].toLowerCase(), text: m[2].trim() });
      else if (!options.length && t && !/^-{3,}$/.test(t)) stmt.push(t);
    });
    const g = gabaritoList.find((x) => x.qNum === number);
    return { id: `q${number}`, number, statement: stmt.join(" "), options, correctLetter: g?.correctLetter || "", commentMd: g?.commentMd || "" };
  });

  // flashcards: bullets de 1º nível no formato "- **Termo:** definição"
  const cards = [];
  materialSections.forEach((s) => s.md.split(/\r?\n/).forEach((l) => {
    const m = l.match(/^[-*+]\s+\*\*(.+?)\*\*:?\s*(.{15,})$/);
    if (m) cards.push({ id: `c${cards.length}`, front: m[1].replace(/:$/, "").trim(), back: m[2].trim(), section: s.title });
  }));

  return { title: top.title, fileName, dateLabel, axisLabel, diagnostic, materialSections, questions, gabaritoList, cards };
}

const parseCache = new Map();
function getParsed(doc) {
  const hit = parseCache.get(doc.id);
  if (hit && hit.md === doc.markdown) return hit.parsed;
  const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
  parseCache.set(doc.id, { md: doc.markdown, parsed });
  return parsed;
}

/* ============================== ESTADO ============================== */
const STORAGE_KEY = "banestes_fcc_estudos_v3";
const OLD_KEYS = ["banestes_fcc_estudos_v2", "banestes_fcc_estudos_v1"];
const STUDY_FOLDER = "./estudos-banestes";
const BUILTIN_ID = "doc-fgc-banestes";
const builtinDoc = () => ({ id: BUILTIN_ID, fileName: "fgc-conhecimentos-bancarios.md", source: "builtin", markdown: INITIAL_FGC_MARKDOWN, addedAt: "2026-11-17" });
const systemTheme = () => (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const TABS = ["diagnostico", "material", "flashcards", "simulado", "anotacoes", "gabarito"];

const freshState = () => ({
  theme: systemTheme(), focusMode: false, activeDocId: BUILTIN_ID, activeTab: "diagnostico",
  instantFeedback: true, shuffle: false, onlyWrong: false, noteSearch: "", noteScope: "current",
  editingNoteId: null, cardIdx: 0, cardFlipped: false, docs: [builtinDoc()], progress: {}, notes: []
});
let state = freshState();

function saveState() {
  try {
    const { editingNoteId, cardIdx, cardFlipped, ...persist } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch { showToast("Não foi possível salvar no navegador.", "error"); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || OLD_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (!Array.isArray(p.docs) || !p.docs.length) return;
    Object.assign(state, {
      theme: p.theme === "dark" ? "dark" : p.theme === "light" ? "light" : state.theme,
      focusMode: !!p.focusMode, activeTab: TABS.includes(p.activeTab) ? p.activeTab : "diagnostico",
      instantFeedback: p.instantFeedback !== false, shuffle: !!p.shuffle, onlyWrong: !!p.onlyWrong,
      noteSearch: p.noteSearch || "", noteScope: p.noteScope === "all" ? "all" : "current",
      docs: p.docs, progress: p.progress || {}, notes: Array.isArray(p.notes) ? p.notes : []
    });
    // material embutido sempre reflete o código atual
    state.docs = state.docs.map((d) => (d.id === BUILTIN_ID ? { ...builtinDoc(), addedAt: d.addedAt } : d));
    state.activeDocId = state.docs.some((d) => d.id === p.activeDocId) ? p.activeDocId : state.docs[0].id;
  } catch (e) { console.warn("Falha ao carregar estado:", e); }
}

function getProg(docId) {
  const p = (state.progress[docId] ||= {});
  p.reviewedIds ||= []; p.answers ||= {}; p.cards ||= {}; p.history ||= []; p.graded ||= false;
  return p;
}
const getDoc = () => state.docs.find((d) => d.id === state.activeDocId) || state.docs[0];

/* =========================== PAINÉIS =========================== */
function isReviewed(docId, id) { return getProg(docId).reviewedIds.includes(id); }
function toggleReview(id) {
  const p = getProg(getDoc().id), i = p.reviewedIds.indexOf(id);
  i >= 0 ? p.reviewedIds.splice(i, 1) : p.reviewedIds.push(id);
  saveState(); renderAll();
}
const reviewBtn = (id, on) => `<button type="button" class="review-toggle ${on ? "reviewed" : ""}" data-action="review" data-id="${id}">${on ? "✓ Revisado" : "Marcar como revisado"}</button>`;

function renderDiagnostico(docId, parsed) {
  const d = parsed.diagnostic, on = isReviewed(docId, "diag-foco");
  $("panel-diagnostico").innerHTML = `
    <div class="card ${on ? "is-reviewed" : ""}">
      <div class="card-header"><h3 class="card-title">Foco e justificativa</h3>${reviewBtn("diag-foco", on)}</div>
      <div class="md-content">
        ${d.tema ? `<p><strong>Tema:</strong> ${mdi(d.tema)}</p>` : ""}
        ${d.justificativa ? `<p><strong>Justificativa:</strong> ${mdi(d.justificativa)}</p>` : ""}
      </div>
    </div>
    <div class="card"><div class="card-header"><h3 class="card-title">Subtópicos prioritários</h3></div>
      <div class="subtopics-grid">${d.subtopicos.map((s, i) => `<div class="subtopic-pill"><b>${i + 1}.</b>${mdi(s)}</div>`).join("")}</div>
    </div>`;
}

function renderMaterial(docId, parsed) {
  const el = $("panel-material");
  if (!parsed.materialSections.length) { el.innerHTML = `<div class="card"><p>Nenhuma seção de material encontrada neste arquivo.</p></div>`; return; }
  el.innerHTML = parsed.materialSections.map((s, i) => {
    const id = `mat-${i}`, on = isReviewed(docId, id), t = s.title.toLowerCase();
    const cls = /pegadinha|alerta/.test(t) ? "alert-fcc" : /mnem|reten/.test(t) ? "mnemonic-box" : "";
    return `<div class="card ${cls} ${on ? "is-reviewed" : ""}">
      <div class="card-header"><h3 class="card-title">${esc(s.title)}</h3>${reviewBtn(id, on)}</div>
      <div class="md-content">${md(s.md)}</div></div>`;
  }).join("");
}

function renderFlashcards(docId, parsed) {
  const el = $("panel-flashcards"), cards = parsed.cards, prog = getProg(docId);
  if (!cards.length) { el.innerHTML = `<div class="card"><p>Nenhum flashcard gerado. Use itens no formato <code>- **Termo:** definição</code> no material.</p></div>`; return; }
  state.cardIdx = Math.min(Math.max(state.cardIdx, 0), cards.length - 1);
  const c = cards[state.cardIdx], known = cards.filter((x) => prog.cards[x.id] === "known").length;
  el.innerHTML = `<div class="flash-wrap">
    <div class="flash-meta"><span>Card ${state.cardIdx + 1} de ${cards.length} · ${esc(c.section)}</span><span class="flash-known">Sei: ${known}/${cards.length}</span></div>
    <button type="button" class="flashcard ${state.cardFlipped ? "back" : ""}" data-action="flip">
      ${state.cardFlipped ? `<div class="md-content">${mdi(c.back)}</div>` : `<strong>${esc(c.front)}</strong><small>Toque para ver a resposta</small>`}
    </button>
    <div class="flash-actions">
      <button type="button" class="btn" data-action="card-prev">Anterior</button>
      <button type="button" class="btn btn-danger-ghost" data-action="card-review">Revisar de novo</button>
      <button type="button" class="btn btn-success" data-action="card-known">Já sei</button>
      <button type="button" class="btn" data-action="card-next">Próximo</button>
    </div></div>`;
}
function moveCard(step, mark) {
  const doc = getDoc(), parsed = getParsed(doc), prog = getProg(doc.id), n = parsed.cards.length;
  if (!n) return;
  if (mark) prog.cards[parsed.cards[state.cardIdx].id] = mark;
  state.cardIdx = (state.cardIdx + step + n) % n; state.cardFlipped = false;
  saveState(); renderActiveDocument();
}

function orderedOptions(q) {
  return state.shuffle ? [...q.options].sort((a, b) => hash(q.id + a.letter) - hash(q.id + b.letter)) : q.options;
}

function scoreOf(parsed, prog) {
  const qs = parsed.questions;
  return { correct: qs.filter((q) => q.correctLetter && prog.answers[q.id] === q.correctLetter).length, answered: qs.filter((q) => prog.answers[q.id]).length, total: qs.length };
}

function renderSimulado(docId, parsed) {
  const prog = getProg(docId), qs = parsed.questions, box = $("quizQuestionsContainer"), banner = $("quizScoreBanner");
  $("chkInstantFeedback").checked = state.instantFeedback;
  $("chkShuffle").checked = state.shuffle;
  $("chkOnlyWrong").checked = state.onlyWrong;
  if (!qs.length) { banner.classList.remove("visible"); box.innerHTML = `<div class="card"><p>Nenhuma questão encontrada neste arquivo.</p></div>`; $("quizHistory").innerHTML = ""; return; }

  const reveal = (q) => prog.graded || (state.instantFeedback && prog.answers[q.id]);
  const wrong = (q) => prog.answers[q.id] && q.correctLetter && prog.answers[q.id] !== q.correctLetter;
  const list = state.onlyWrong ? qs.filter((q) => reveal(q) && wrong(q)) : qs;

  box.innerHTML = list.length ? list.map((q) => {
    const chosen = prog.answers[q.id] || "", opts = orderedOptions(q), show = reveal(q);
    const label = (letter) => "ABCDE"[opts.findIndex((o) => o.letter === letter)] || letter.toUpperCase();
    const optsHtml = opts.map((o, i) => {
      let cls = "";
      if (show && o.letter === q.correctLetter) cls = "correct";
      else if (show && chosen === o.letter) cls = "incorrect";
      else if (chosen === o.letter) cls = "selected";
      return `<button type="button" class="option-btn ${cls}" data-action="answer" data-id="${q.id}" data-letter="${o.letter}"><span class="option-letter">${"ABCDE"[i]}</span><span>${mdi(o.text)}</span></button>`;
    }).join("");
    let fb = "";
    if (show && q.correctLetter) {
      const ok = chosen === q.correctLetter;
      fb = `<div class="question-feedback ${ok ? "is-right" : "is-wrong"}"><div style="margin-bottom:6px">${ok ? "<strong>✓ Correta!</strong>" : `<strong>✕ Incorreta.</strong> Gabarito: <strong>${label(q.correctLetter)})</strong>`}</div><div class="md-content">${md(q.commentMd)}</div></div>`;
    }
    return `<article class="question-card"><div class="question-header"><span class="question-num">Questão ${esc(q.number)}</span>${chosen ? `<span class="badge badge-neutral">Marcada: ${label(chosen)})</span>` : ""}</div>
      <p class="question-statement">${mdi(q.statement)}</p><div class="options-list">${optsHtml}</div>${fb}</article>`;
  }).join("") : `<div class="card"><p>Nenhuma questão errada para mostrar.</p></div>`;

  const s = scoreOf(parsed, prog);
  if (prog.graded || (state.instantFeedback && s.answered)) {
    banner.classList.add("visible");
    $("quizScoreText").textContent = `${s.correct} / ${s.total} (${Math.round((s.correct / s.total) * 100)}%)`;
    $("quizScoreMessage").textContent = prog.graded ? "Simulado corrigido." : `${s.answered} de ${s.total} respondida(s).`;
  } else banner.classList.remove("visible");

  $("quizHistory").innerHTML = prog.history.length ? `<div class="card"><h3 class="card-title">Histórico de tentativas</h3><div class="history-list">${
    prog.history.slice(-8).reverse().map((h) => `<span class="history-chip">${esc(h.date)} · <b>${h.correct}/${h.total}</b> (${h.pct}%)</span>`).join("")}</div></div>` : "";
}

function selectOption(qid, letter) {
  const prog = getProg(getDoc().id);
  prog.answers[qid] = letter; prog.graded = false;
  saveState(); renderActiveDocument();
}
function gradeQuiz() {
  const doc = getDoc(), parsed = getParsed(doc), prog = getProg(doc.id), s = scoreOf(parsed, prog);
  if (!s.total) return;
  prog.graded = true;
  prog.history.push({ date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }), correct: s.correct, total: s.total, pct: Math.round((s.correct / s.total) * 100) });
  saveState(); renderActiveDocument(); showToast("Simulado corrigido e salvo no histórico.", "success");
}
function clearQuiz() {
  const prog = getProg(getDoc().id);
  prog.answers = {}; prog.graded = false;
  saveState(); renderActiveDocument(); showToast("Respostas limpas.");
}

function renderGabarito(parsed) {
  $("panel-gabarito").innerHTML = parsed.gabaritoList.length ? parsed.gabaritoList.map((g) => `
    <div class="gabarito-item"><div class="card-header"><h3 class="card-title">Questão ${esc(g.qNum)}</h3>${g.correctLetter ? `<span class="gabarito-key">Gabarito: ${g.correctLetter.toUpperCase()})</span>` : ""}</div>
    <div class="md-content">${md(g.commentMd)}</div></div>`).join("") : `<div class="card"><p>Nenhum gabarito comentado encontrado.</p></div>`;
}

/* ============================ ANOTAÇÕES ============================ */
function renderNotes(docId, parsed) {
  const sel = $("noteTopicSelect"), prev = sel.value;
  const topics = ["Geral da matéria", "Diagnóstico", ...parsed.materialSections.map((s) => s.title), "Simulado"];
  sel.innerHTML = topics.map((t) => `<option value="${esc(t)}">Tópico: ${esc(t)}</option>`).join("");
  if (topics.includes(prev)) sel.value = prev;
  $("noteFormTitle").textContent = state.editingNoteId ? "Editando anotação" : "Nova anotação";
  $("btnCancelEditNote").style.display = state.editingNoteId ? "inline-flex" : "none";
  $("btnSaveNote").textContent = state.editingNoteId ? "Atualizar anotação" : "Salvar anotação";
  $("noteSearchInput").value = state.noteSearch;
  $("noteFilterScope").value = state.noteScope;
  const q = state.noteSearch.trim().toLowerCase();
  const list = state.notes.filter((n) => state.noteScope === "all" || n.docId === docId)
    .filter((n) => !q || [n.title, n.body, n.topic, n.docTitle].some((v) => (v || "").toLowerCase().includes(q)));
  $("notesListContainer").innerHTML = list.length ? list.map((n) => `
    <article class="note-card">
      <div class="note-meta-line"><span><strong>${esc(n.docTitle || "Matéria")}</strong> • ${esc(n.topic || "Geral")}</span><span>${esc(n.updatedAt || "")}</span></div>
      ${n.title ? `<h4 class="card-title" style="margin-bottom:6px">${esc(n.title)}</h4>` : ""}
      <p class="note-text">${esc(n.body)}</p>
      <div class="note-actions"><button type="button" class="btn" data-action="edit-note" data-id="${n.id}">Editar</button>
      <button type="button" class="btn btn-danger-ghost" data-action="delete-note" data-id="${n.id}">Excluir</button></div>
    </article>`).join("") : `<div class="card"><p class="muted">Nenhuma anotação para este filtro.</p></div>`;
}

function submitNote(e) {
  e.preventDefault();
  const doc = getDoc(), parsed = getParsed(doc);
  const title = $("noteTitleInput").value.trim(), topic = $("noteTopicSelect").value, body = $("noteBodyInput").value.trim();
  if (!body) return showToast("Escreva o conteúdo da anotação.", "error");
  const now = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const target = state.editingNoteId && state.notes.find((n) => n.id === state.editingNoteId);
  if (target) Object.assign(target, { title, topic, body, updatedAt: now });
  else state.notes.unshift({ id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, docId: doc.id, docTitle: parsed.title, topic, title, body, updatedAt: now });
  showToast(target ? "Anotação atualizada." : "Anotação salva.", "success");
  state.editingNoteId = null;
  $("noteTitleInput").value = ""; $("noteBodyInput").value = "";
  saveState(); renderActiveDocument();
}
function editNote(id) {
  const n = state.notes.find((x) => x.id === id);
  if (!n) return;
  state.editingNoteId = id;
  $("noteTitleInput").value = n.title || ""; $("noteBodyInput").value = n.body || "";
  renderActiveDocument();
  if (n.topic) $("noteTopicSelect").value = n.topic;
  $("noteForm").scrollIntoView({ behavior: "smooth", block: "center" });
}
function deleteNote(id) {
  if (!confirm("Excluir esta anotação?")) return;
  state.notes = state.notes.filter((n) => n.id !== id);
  if (state.editingNoteId === id) { state.editingNoteId = null; $("noteTitleInput").value = ""; $("noteBodyInput").value = ""; }
  saveState(); renderActiveDocument(); showToast("Anotação removida.");
}

/* ============================== BACKUP ============================== */
function exportBackup() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), docs: state.docs, progress: state.progress, notes: state.notes }, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `backup-estudos-banestes-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  showToast("Backup exportado.", "success");
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(String(r.result));
      if (Array.isArray(d.docs) && d.docs.length) { state.docs = d.docs; state.activeDocId = d.docs[0].id; }
      if (d.progress && typeof d.progress === "object") state.progress = d.progress;
      if (Array.isArray(d.notes)) state.notes = d.notes;
      saveState(); renderAll(); showToast("Backup restaurado.", "success");
    } catch { showToast("Arquivo JSON inválido.", "error"); }
  };
  r.readAsText(file, "UTF-8");
}

/* ===================== ARQUIVOS .MD & SINCRONIZAÇÃO ===================== */
function upsertDoc(fileName, markdown, source) {
  const name = String(fileName || "materia.md").split("/").pop();
  const today = new Date().toLocaleDateString("pt-BR");
  const ex = state.docs.find((d) => d.fileName.toLowerCase() === name.toLowerCase());
  if (ex) { Object.assign(ex, { markdown, source, addedAt: today }); return ex; }
  const doc = { id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, fileName: name, source, markdown, addedAt: today };
  state.docs.push(doc);
  return doc;
}

function handleFiles(list) {
  const files = Array.from(list || []).filter((f) => /\.(md|markdown|txt)$/i.test(f.name));
  if (!files.length) return showToast("Selecione arquivos .md válidos.", "error");
  let done = 0, last = null;
  files.forEach((f) => {
    const r = new FileReader();
    r.onload = () => {
      last = upsertDoc(f.name, String(r.result || ""), "local");
      if (++done === files.length) { state.activeDocId = last.id; saveState(); renderAll(); showToast(`${done} arquivo(s) carregado(s).`, "success"); }
    };
    r.readAsText(f, "UTF-8");
  });
}

function repoInfo() {
  const host = location.hostname, parts = location.pathname.split("/").filter(Boolean);
  const gh = host.endsWith(".github.io") && parts.length >= 1;
  $("repoStatusLabel").textContent = gh ? `${host.replace(".github.io", "")}/${parts[0]} • ${STUDY_FOLDER}/` : `${STUDY_FOLDER}/`;
  return gh ? { owner: host.replace(".github.io", ""), repo: parts[0] } : null;
}

async function fetchText(path) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) return null;
    const t = await r.text();
    return !t.trim() || /^\s*<!doctype html>/i.test(t) ? null : t;
  } catch { return null; }
}

async function syncFolder(manual) {
  const gh = repoInfo(), names = new Set();
  try {
    const r = await fetch(`${STUDY_FOLDER}/manifest.json`, { cache: "no-store" });
    if (r.ok) {
      const m = await r.json();
      (Array.isArray(m) ? m : m.files || []).forEach((i) => { const n = typeof i === "string" ? i : i?.file; if (n && /\.md$/i.test(n)) names.add(n.split("/").pop()); });
    }
  } catch { /* sem manifest */ }
  // API do GitHub só no clique (limite de 60 req/h sem autenticação)
  if (manual && gh && !names.size) {
    try {
      const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/estudos-banestes`);
      if (r.ok) (await r.json()).forEach((i) => { if (i.type === "file" && /\.md$/i.test(i.name)) names.add(i.name); });
    } catch { /* rede/limite */ }
  }
  if (!names.size) { if (manual) showToast("Nenhum .md encontrado em ./estudos-banestes/.", "info"); return; }
  let n = 0;
  for (const name of names) {
    const t = await fetchText(`${STUDY_FOLDER}/${encodeURIComponent(name)}`);
    if (t) { upsertDoc(name, t, "github"); n++; }
  }
  if (n) { saveState(); renderAll(); if (manual) showToast(`${n} arquivo(s) sincronizado(s).`, "success"); }
  else if (manual) showToast("Os arquivos listados não puderam ser lidos.", "error");
}

/* ============================ RENDER GERAL ============================ */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.classList.toggle("focus-mode", state.focusMode);
  $("btnThemeToggle").textContent = state.theme === "dark" ? "Claro" : "Escuro";
  $("btnFocusMode").classList.toggle("btn-active", state.focusMode);
}

function renderSidebar() {
  $("fileCountLabel").textContent = state.docs.length;
  $("fileList").innerHTML = state.docs.map((d) => {
    const p = getParsed(d);
    return `<div class="file-item ${d.id === state.activeDocId ? "active" : ""}">
      <button type="button" class="file-item-btn" data-action="select-doc" data-id="${d.id}"><span class="file-name">${esc(p.title)}</span><span class="file-meta">${esc(d.fileName)}${p.axisLabel ? ` • ${esc(p.axisLabel)}` : ""}</span></button>
      ${state.docs.length > 1 ? `<button type="button" class="file-remove-btn" title="Remover matéria" aria-label="Remover matéria" data-action="remove-doc" data-id="${d.id}">×</button>` : ""}</div>`;
  }).join("");
  const doc = getDoc(), parsed = getParsed(doc), prog = getProg(doc.id);
  const total = 1 + parsed.materialSections.length;
  const done = prog.reviewedIds.filter((id) => id === "diag-foco" || /^mat-\d+$/.test(id)).length;
  const pct = Math.min(100, Math.round((done / total) * 100));
  $("progressPercent").textContent = `${pct}%`;
  $("progressCount").textContent = `${done} / ${total}`;
  $("progressBarFill").style.width = `${pct}%`;
}

function renderActiveDocument() {
  const doc = getDoc(), parsed = getParsed(doc);
  $("docHeader").innerHTML = `<div class="doc-badges">
      ${parsed.axisLabel ? `<span class="badge">${esc(parsed.axisLabel)}</span>` : ""}
      ${parsed.dateLabel ? `<span class="badge badge-neutral">📅 ${esc(parsed.dateLabel)}</span>` : ""}
      <span class="badge badge-neutral">Banca FCC • Banestes</span></div>
    <h2 class="doc-title">${esc(parsed.title)}</h2><p class="doc-source-file">Arquivo: <code>${esc(doc.fileName)}</code></p>`;
  $("materialCountBadge").textContent = parsed.materialSections.length;
  $("cardsCountBadge").textContent = parsed.cards.length;
  $("simuladoCountBadge").textContent = parsed.questions.length;
  $("anotacoesCountBadge").textContent = state.notes.filter((n) => n.docId === doc.id).length;
  document.querySelectorAll("[data-action=tab]").forEach((b) => {
    const on = b.dataset.id === state.activeTab;
    b.classList.toggle("active", on);
    if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", on);
  });
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${state.activeTab}`));
  renderDiagnostico(doc.id, parsed); renderMaterial(doc.id, parsed); renderFlashcards(doc.id, parsed);
  renderSimulado(doc.id, parsed); renderNotes(doc.id, parsed); renderGabarito(parsed);
}

function renderAll() { applyTheme(); renderSidebar(); renderActiveDocument(); }

function setTab(tab) {
  if (!TABS.includes(tab)) return;
  state.activeTab = tab; saveState(); renderActiveDocument();
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
function setDrawer(open) { $("sidebarDrawer").classList.toggle("open", open); $("drawerBackdrop").classList.toggle("open", open); }

function selectDocument(id) { state.activeDocId = id; state.editingNoteId = null; state.cardIdx = 0; state.cardFlipped = false; saveState(); renderAll(); setDrawer(false); }
function removeDocument(id) {
  if (state.docs.length <= 1) return;
  const d = state.docs.find((x) => x.id === id);
  if (!confirm(`Remover "${d?.fileName}"? Notas e respostas dessa matéria continuam salvas no backup.`)) return;
  state.docs = state.docs.filter((x) => x.id !== id);
  if (state.activeDocId === id) state.activeDocId = state.docs[0].id;
  saveState(); renderAll(); showToast("Matéria removida.");
}
function resetApplication() {
  if (!confirm("Apagar notas, respostas e matérias importadas? Exporte o backup antes.")) return;
  [STORAGE_KEY, ...OLD_KEYS].forEach((k) => localStorage.removeItem(k));
  state = freshState();
  renderAll(); showToast("Aplicação restaurada.");
}

/* ============================== EVENTOS ============================== */
const ACTIONS = {
  tab: (el) => setTab(el.dataset.id),
  review: (el) => toggleReview(el.dataset.id),
  answer: (el) => selectOption(el.dataset.id, el.dataset.letter),
  "edit-note": (el) => editNote(el.dataset.id),
  "delete-note": (el) => deleteNote(el.dataset.id),
  "select-doc": (el) => selectDocument(el.dataset.id),
  "remove-doc": (el) => removeDocument(el.dataset.id),
  flip: () => { state.cardFlipped = !state.cardFlipped; renderActiveDocument(); },
  "card-prev": () => moveCard(-1),
  "card-next": () => moveCard(1),
  "card-known": () => moveCard(1, "known"),
  "card-review": () => moveCard(1, "review")
};

function bindEvents() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el);
  });
  $("btnOpenDrawer").addEventListener("click", () => setDrawer(true));
  $("btnCloseDrawer").addEventListener("click", () => setDrawer(false));
  $("drawerBackdrop").addEventListener("click", () => setDrawer(false));
  $("btnSyncRepo").addEventListener("click", () => syncFolder(true));

  $("noteForm").addEventListener("submit", submitNote);
  $("btnCancelEditNote").addEventListener("click", () => { state.editingNoteId = null; $("noteTitleInput").value = ""; $("noteBodyInput").value = ""; renderActiveDocument(); });
  const refreshNotes = () => { saveState(); const d = getDoc(); renderNotes(d.id, getParsed(d)); };
  $("noteSearchInput").addEventListener("input", (e) => { state.noteSearch = e.target.value; refreshNotes(); });
  $("noteFilterScope").addEventListener("change", (e) => { state.noteScope = e.target.value; refreshNotes(); });

  $("btnExportJson").addEventListener("click", exportBackup);
  $("btnImportJson").addEventListener("click", () => $("jsonImportInput").click());
  $("jsonImportInput").addEventListener("change", (e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ""; });

  const fileInput = $("mdFileInput"), dz = $("dropzone");
  $("btnLoadMd").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => { handleFiles(e.target.files); e.target.value = ""; setDrawer(false); });
  dz.addEventListener("click", () => fileInput.click());
  dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("dragover"); handleFiles(e.dataTransfer.files); setDrawer(false); });

  $("btnGradeQuiz").addEventListener("click", gradeQuiz);
  $("btnClearQuiz").addEventListener("click", clearQuiz);
  [["chkInstantFeedback", "instantFeedback"], ["chkShuffle", "shuffle"], ["chkOnlyWrong", "onlyWrong"]].forEach(([id, key]) =>
    $(id).addEventListener("change", (e) => { state[key] = e.target.checked; saveState(); renderActiveDocument(); }));

  $("btnThemeToggle").addEventListener("click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; saveState(); applyTheme(); });
  const toggleFocus = () => { state.focusMode = !state.focusMode; saveState(); applyTheme(); };
  $("btnFocusMode").addEventListener("click", toggleFocus);
  $("btnResetAll").addEventListener("click", resetApplication);

  // atalhos: 1-6 abas, A-E responde a próxima questão sem resposta, F foco, setas nos flashcards
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (/^[1-6]$/.test(k)) return setTab(TABS[+k - 1]);
    if (k === "f") return toggleFocus();
    if (state.activeTab === "simulado" && /^[a-e]$/.test(k)) {
      const doc = getDoc(), parsed = getParsed(doc), prog = getProg(doc.id);
      const q = parsed.questions.find((x) => !prog.answers[x.id]);
      const opt = q && orderedOptions(q)["abcde".indexOf(k)];
      if (opt) selectOption(q.id, opt.letter);
    }
    if (state.activeTab === "flashcards") {
      if (k === "arrowright") moveCard(1);
      else if (k === "arrowleft") moveCard(-1);
      else if (k === " ") { e.preventDefault(); ACTIONS.flip(); }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  repoInfo();
  bindEvents();
  renderAll();
  syncFolder(false);
});