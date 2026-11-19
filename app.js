/* =========================================================================
   CONFIGURAÇÕES & ESTADO GLOBAL (SEM DADOS MOCADOS)
   ========================================================================= */
const STORAGE_KEY = "banestes_fcc_estudos_v2";
const STUDY_FOLDER_PATH = "./estudos-banestes";

let state = {
  theme: "light",
  focusMode: false,
  activeDocId: null,
  activeTab: "diagnostico",
  instantFeedback: true,
  docSearch: "",
  materialSearch: "",
  noteSearch: "",
  noteScope: "current",
  editingNoteId: null,
  githubRepoSlug: "",
  docs: [],
  progress: {},
  notes: []
};

/* =========================================================================
   UTILITÁRIOS DE SEGURANÇA, MARKDOWN & NOTIFICAÇÕES
   ========================================================================= */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  html = html.replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  return html;
}

function renderBlockMarkdown(mdText) {
  const lines = String(mdText || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      out.push("<hr />");
      continue;
    }

    const headingMatch = trimmed.match(/^(#{3,5})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      const level = Math.min(5, headingMatch[1].length + 1);
      out.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeLists();
      out.push(`<blockquote>${renderInlineMarkdown(trimmed.replace(/^>\s*/, ""))}</blockquote>`);
      continue;
    }

    const ulMatch = trimmed.match(/^[*+-]\s+(.+)$/);
    if (ulMatch) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${renderInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${renderInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  return out.join("\n");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    setTimeout(() => toast.remove(), 220);
  }, 3400);
}

/* =========================================================================
   PARSER ROBUSTO PARA OS ARQUIVOS .MD DE ESTUDO (DIAGNÓSTICO, MATERIAL,
   SIMULADO FCC E GABARITO COMENTADO)
   ========================================================================= */
function parseStudyMarkdown(markdown, fileName = "") {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");

  let title = "";
  let dateLabel = "";
  let axisLabel = "";

  const sectionBuckets = {
    diagnostico: [],
    material: [],
    simulado: [],
    gabarito: []
  };

  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Título H1
    if (!title && /^#\s+(.+)$/.test(trimmed)) {
      title = trimmed.replace(/^#\s+/, "").trim();
      continue;
    }

    // Metadados (Data / Eixo) antes da Seção 1
    if (!currentSection && (/\*\*Data:\*\*/i.test(trimmed) || /\*\*Eixo:\*\*/i.test(trimmed))) {
      const dateMatch = trimmed.match(/\*\*Data:\*\*\s*([^|]+)/i);
      const axisMatch = trimmed.match(/\*\*Eixo:\*\*\s*([^|]+)/i);
      if (dateMatch) dateLabel = dateMatch[1].trim();
      if (axisMatch) axisLabel = axisMatch[1].trim();
      continue;
    }

    // Detecção das grandes seções
    if (/^##\s*1\.\s*DIAGN[ÓO]STICO/i.test(trimmed) || /^##\s*DIAGN[ÓO]STICO/i.test(trimmed)) {
      currentSection = "diagnostico";
      continue;
    }
    if (/^##\s*2\.\s*MATERIAL/i.test(trimmed) || /^##\s*MATERIAL DE ESTUDO/i.test(trimmed)) {
      currentSection = "material";
      continue;
    }
    if (/^##\s*3\.\s*SIMULADO/i.test(trimmed) || /^##\s*SIMULADO/i.test(trimmed)) {
      currentSection = "simulado";
      continue;
    }
    if (
      /^#{2,4}\s*Gabarito(?:\s+Comentado)?\s*:?\s*$/i.test(trimmed) ||
      /^\*\*Gabarito(?:\s+Comentado)?\s*:?\*\*\s*:?\s*$/i.test(trimmed)
    ) {
      currentSection = "gabarito";
      continue;
    }

    if (currentSection) {
      sectionBuckets[currentSection].push(line);
    }
  }

  if (!title) {
    title = fileName
      .replace(/\.md$/i, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // 1. Parse Diagnóstico
  const diagnostic = parseDiagnosticLines(sectionBuckets.diagnostico);

  // 2. Parse Material de Estudo
  const materialSections = parseMaterialLines(sectionBuckets.material);

  // 3. Parse Gabarito Comentado (antes para mapear respostas às questões)
  const gabaritoList = parseGabaritoLines(sectionBuckets.gabarito);
  const gabaritoByNum = new Map();
  gabaritoList.forEach(item => {
    if (item.qNum) gabaritoByNum.set(String(item.qNum), item);
  });

  // 4. Parse Questões do Simulado
  const questions = parseSimuladoLines(sectionBuckets.simulado, gabaritoByNum, gabaritoList);

  return {
    title,
    dateLabel,
    axisLabel,
    diagnostic,
    materialSections,
    questions,
    gabaritoList
  };
}

function parseDiagnosticLines(lines) {
  let tema = "";
  let justificativa = "";
  const subtopicos = [];
  const extraLines = [];
  let inSubtopicos = false;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const temaMatch = trimmed.match(/^(?:[-*]\s*)?\*\*Tema\s+escolhido\s*:?\*\*\s*:?\s*(.+)$/i);
    if (temaMatch) {
      tema = temaMatch[1].trim();
      inSubtopicos = false;
      continue;
    }

    const justMatch = trimmed.match(/^(?:[-*]\s*)?\*\*Justificativa[^*]*\*\*\s*:?\s*(.+)$/i);
    if (justMatch) {
      justificativa = justMatch[1].trim();
      inSubtopicos = false;
      continue;
    }

    if (/^(?:[-*]\s*)?\*\*4\s*Subt[óo]picos\s*:?\*\*/i.test(trimmed) || /^4\s*Subt[óo]picos\s*:?/i.test(trimmed)) {
      inSubtopicos = true;
      continue;
    }

    if (inSubtopicos) {
      const itemMatch = trimmed.match(/^(?:\d+[.)]|[-*])\s+(.+)$/);
      if (itemMatch) {
        subtopicos.push(itemMatch[1].trim());
        continue;
      }
    }

    extraLines.push(raw);
  }

  return {
    tema,
    justificativa,
    subtopicos,
    extraHtml: extraLines.length > 0 ? renderBlockMarkdown(extraLines.join("\n")) : ""
  };
}

function parseMaterialLines(lines) {
  const sections = [];
  let current = null;

  const pushCurrent = () => {
    if (current) {
      current.html = renderBlockMarkdown(current.rawLines.join("\n"));
      sections.push(current);
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    // Formato A: ### 1. Conceitos essenciais
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      pushCurrent();
      current = {
        title: h3Match[1].replace(/:$/, "").trim(),
        rawLines: []
      };
      continue;
    }

    // Formato B: * **1. Conceitos essenciais:** (bullet raiz em negrito)
    const rootBulletSection = raw.match(/^[*+-]\s+\*\*(\d+\.\s*[^*]+?)\*\*\s*:?\s*(.*)$/);
    if (rootBulletSection) {
      pushCurrent();
      current = {
        title: rootBulletSection[1].replace(/:$/, "").trim(),
        rawLines: rootBulletSection[2] ? [rootBulletSection[2]] : []
      };
      continue;
    }

    if (!current) {
      if (!trimmed) continue;
      current = {
        title: "Visão Geral do Conteúdo",
        rawLines: []
      };
    }

    // Remove indentação extra de sub-listas quando veio de Formato B
    current.rawLines.push(raw.replace(/^ {2,4}/, ""));
  }

  pushCurrent();
  return sections;
}

function parseGabaritoLines(lines) {
  const items = [];
  let current = null;

  const finalizeCurrent = () => {
    if (!current) return;
    const fullText = `${current.headerExtra}\n${current.rawLines.join("\n")}`;
    const ansMatch =
      fullText.match(/(?:Alternativa\s+Correta|Gabarito|Resposta(?:\s+Correta)?)\s*:?\s*\**\s*\(?([a-eA-E])\)?/i) ||
      fullText.match(/(?:Alternativa|Letra)\s*\**\s*\(?([a-eA-E])\)?\b/i);

    current.correctLetter = ansMatch ? ansMatch[1].toLowerCase() : "";
    current.commentHtml = renderBlockMarkdown(current.rawLines.join("\n"));
    items.push(current);
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) continue;

    // Cabeçalho da questão no gabarito: **Questão 1:** ou **Questão 1 - Resposta: D** ou ### Questão 1
    const qHeaderMatch = trimmed.match(
      /^(?:#{2,4}\s*)?(?:\*\*)?Quest[ãa]o\s*(\d+)(?:\s*[-–:.]\s*(.+?))?(?:\*\*)?\s*:?\s*$/i
    );

    if (qHeaderMatch) {
      finalizeCurrent();
      current = {
        qNum: String(Number(qHeaderMatch[1])),
        headerExtra: (qHeaderMatch[2] || "").replace(/\*\*/g, "").trim(),
        rawLines: []
      };
      continue;
    }

    if (current) {
      current.rawLines.push(raw);
    }
  }

  finalizeCurrent();
  return items;
}

function parseSimuladoLines(lines, gabaritoByNum, gabaritoList) {
  const questions = [];
  let current = null;

  const finalizeQuestion = () => {
    if (!current) return;
    const qIndex = questions.length;
    const gab = gabaritoByNum.get(String(current.number)) || gabaritoList[qIndex] || null;
    current.correctLetter = gab ? gab.correctLetter : "";
    current.commentHtml = gab ? gab.commentHtml : "";
    current.statementHtml = renderBlockMarkdown(current.statementLines.join("\n"));
    questions.push(current);
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) continue;

    // Início de questão: **Questão 1**, **Questão 1:**, ### Questão 1
    const qStartMatch = trimmed.match(
      /^(?:#{2,4}\s*)?(?:\*\*)?Quest[ãa]o\s*(\d+)(?:\*\*)?\s*:?\s*(.*)$/i
    );

    if (qStartMatch) {
      finalizeQuestion();
      const numStr = String(Number(qStartMatch[1]));
      const inlineRest = (qStartMatch[2] || "").replace(/^\*\*\s*/, "").trim();
      current = {
        id: `q-${numStr}-${questions.length + 1}`,
        number: numStr,
        statementLines: inlineRest ? [inlineRest] : [],
        options: []
      };
      continue;
    }

    if (!current) continue;

    // Alternativa a) .. e) ou A) .. E)
    const optMatch = trimmed.match(/^(?:[-*]\s*)?(?:\*\*)?\(?([a-eA-E])\)?[.)]\s*(?:\*\*)?\s*(.+)$/);
    if (optMatch) {
      current.options.push({
        letter: optMatch[1].toLowerCase(),
        text: optMatch[2].trim()
      });
      continue;
    }

    // Se já começou as alternativas, continua o texto da última alternativa; senão faz parte do enunciado
    if (current.options.length > 0) {
      const lastOpt = current.options[current.options.length - 1];
      lastOpt.text += ` ${trimmed}`;
    } else {
      current.statementLines.push(trimmed);
    }
  }

  finalizeQuestion();
  return questions;
}

/* =========================================================================
   PERSISTÊNCIA NO LOCALSTORAGE
   ========================================================================= */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: state.theme,
      focusMode: state.focusMode,
      activeDocId: state.activeDocId,
      activeTab: state.activeTab,
      instantFeedback: state.instantFeedback,
      noteScope: state.noteScope,
      githubRepoSlug: state.githubRepoSlug,
      docs: state.docs,
      progress: state.progress,
      notes: state.notes
    }));
  } catch (err) {
    showToast("Aviso: não foi possível salvar no navegador.", "error");
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    state.theme = parsed.theme === "dark" ? "dark" : "light";
    state.focusMode = Boolean(parsed.focusMode);
    state.activeTab = parsed.activeTab || "diagnostico";
    state.instantFeedback = parsed.instantFeedback !== undefined ? Boolean(parsed.instantFeedback) : true;
    state.noteScope = parsed.noteScope === "all" ? "all" : "current";
    state.githubRepoSlug = typeof parsed.githubRepoSlug === "string" ? parsed.githubRepoSlug : "";
    state.docs = Array.isArray(parsed.docs) ? parsed.docs : [];
    state.activeDocId = parsed.activeDocId || (state.docs[0] ? state.docs[0].id : null);
    state.progress = parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {};
    state.notes = Array.isArray(parsed.notes) ? parsed.notes : [];
  } catch (err) {
    console.warn("Falha ao carregar estado salvo:", err);
  }
}

function getDocProgress(docId) {
  if (!state.progress[docId]) {
    state.progress[docId] = {
      reviewedIds: [],
      answers: {},
      graded: false
    };
  }
  if (!Array.isArray(state.progress[docId].reviewedIds)) {
    state.progress[docId].reviewedIds = [];
  }
  if (!state.progress[docId].answers || typeof state.progress[docId].answers !== "object") {
    state.progress[docId].answers = {};
  }
  return state.progress[docId];
}

function getActiveDoc() {
  if (!state.docs.length) return null;
  return state.docs.find(d => d.id === state.activeDocId) || state.docs[0];
}

function isBlockReviewed(docId, blockId) {
  return getDocProgress(docId).reviewedIds.includes(blockId);
}

window.toggleReview = function(blockId) {
  const doc = getActiveDoc();
  if (!doc) return;
  const prog = getDocProgress(doc.id);
  const idx = prog.reviewedIds.indexOf(blockId);
  if (idx >= 0) {
    prog.reviewedIds.splice(idx, 1);
  } else {
    prog.reviewedIds.push(blockId);
  }
  saveState();
  renderAll();
};

/* =========================================================================
   RENDERIZAÇÃO DOS PAINÉIS DE ESTUDO
   ========================================================================= */
function renderDiagnosticoPanel(docId, parsed) {
  const panel = document.getElementById("panel-diagnostico");
  const diag = parsed.diagnostic;
  const reviewId = "diag-foco";
  const isReviewed = isBlockReviewed(docId, reviewId);

  panel.innerHTML = `
    <div class="card ${isReviewed ? "is-reviewed" : ""}">
      <div class="card-header">
        <h3 class="card-title">Foco do Edital &amp; Justificativa (FCC / Banestes)</h3>
        <button type="button" class="review-toggle ${isReviewed ? "reviewed" : ""}" onclick="toggleReview('${reviewId}')">
          ${isReviewed ? "✓ Revisado" : "Marcar como revisado"}
        </button>
      </div>
      <div class="md-content">
        ${diag.tema ? `<p><strong>Tema Escolhido:</strong> ${renderInlineMarkdown(diag.tema)}</p>` : ""}
        ${diag.justificativa ? `<p><strong>Justificativa da Escolha:</strong> ${renderInlineMarkdown(diag.justificativa)}</p>` : ""}
        ${!diag.tema && !diag.justificativa && diag.extraHtml ? diag.extraHtml : ""}
      </div>
    </div>

    ${diag.subtopicos.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Subtópicos Prioritários</h3>
        </div>
        <div class="subtopics-grid">
          ${diag.subtopicos.map((st, idx) => `
            <div class="subtopic-pill">
              <span class="subtopic-num">0${idx + 1}.</span>
              ${renderInlineMarkdown(st)}
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
  `;
}

function renderMaterialPanel(docId, parsed) {
  const container = document.getElementById("materialCardsContainer");
  const query = state.materialSearch.trim().toLowerCase();

  if (parsed.materialSections.length === 0) {
    container.innerHTML = `<div class="card"><p>Nenhuma seção de material encontrada neste arquivo <code>.md</code>.</p></div>`;
    return;
  }

  const filtered = parsed.materialSections
    .map((sec, idx) => ({ sec, idx }))
    .filter(({ sec }) => {
      if (!query) return true;
      return (
        sec.title.toLowerCase().includes(query) ||
        sec.rawLines.join(" ").toLowerCase().includes(query)
      );
    });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="card"><p>Nenhum tópico do material corresponde a "<strong>${escapeHtml(state.materialSearch)}</strong>".</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(({ sec, idx }) => {
    const blockId = `mat-${idx}`;
    const isReviewed = isBlockReviewed(docId, blockId);
    const lowerTitle = sec.title.toLowerCase();
    const extraClass = lowerTitle.includes("pegadinha") || lowerTitle.includes("alerta")
      ? "alert-fcc"
      : (lowerTitle.includes("mnemônico") || lowerTitle.includes("retenção") ? "mnemonic-box" : "");

    return `
      <div class="card ${extraClass} ${isReviewed ? "is-reviewed" : ""}">
        <div class="card-header">
          <h3 class="card-title">${escapeHtml(sec.title)}</h3>
          <button type="button" class="review-toggle ${isReviewed ? "reviewed" : ""}" onclick="toggleReview('${blockId}')">
            ${isReviewed ? "✓ Revisado" : "Marcar como revisado"}
          </button>
        </div>
        <div class="md-content">${sec.html}</div>
      </div>
    `;
  }).join("");
}

function renderSimuladoPanel(docId, parsed) {
  const progress = getDocProgress(docId);
  const questions = parsed.questions;
  const container = document.getElementById("quizQuestionsContainer");
  const banner = document.getElementById("quizScoreBanner");
  const answeredPill = document.getElementById("quizAnsweredPill");

  document.getElementById("chkInstantFeedback").checked = state.instantFeedback;

  if (questions.length === 0) {
    banner.classList.remove("visible");
    answeredPill.textContent = "0 / 0 respondidas";
    container.innerHTML = `
      <div class="card">
        <p style="margin: 0;">Nenhuma questão encontrada neste arquivo <code>.md</code>. Verifique se a seção possui o título <code>## 3. SIMULADO FCC</code>.</p>
      </div>
    `;
    return;
  }

  let correctCount = 0;
  let answeredCount = 0;

  container.innerHTML = questions.map((q, idx) => {
    const chosen = progress.answers[q.id] || "";
    if (chosen) answeredCount++;
    const isCorrect = Boolean(chosen && q.correctLetter && chosen === q.correctLetter);
    if (isCorrect) correctCount++;

    const reveal = Boolean(progress.graded || (state.instantFeedback && chosen));

    const optionsHtml = q.options.map(opt => {
      const isSelected = chosen === opt.letter;
      let statusClass = "";
      if (reveal && q.correctLetter) {
        if (opt.letter === q.correctLetter) {
          statusClass = "correct";
        } else if (isSelected && opt.letter !== q.correctLetter) {
          statusClass = "incorrect";
        }
      } else if (isSelected) {
        statusClass = "selected";
      }

      return `
        <button
          type="button"
          class="option-btn ${statusClass}"
          onclick="selectQuizOption('${q.id}', '${opt.letter}')"
        >
          <span class="option-letter">${opt.letter.toUpperCase()}</span>
          <span>${renderInlineMarkdown(opt.text)}</span>
        </button>
      `;
    }).join("");

    let feedbackHtml = "";
    if (reveal) {
      if (q.correctLetter) {
        const fbClass = isCorrect ? "is-right" : "is-wrong";
        const fbLead = isCorrect
          ? `<strong>✓ Resposta correta!</strong>`
          : `<strong>✕ Resposta incorreta.</strong> Gabarito: <strong>${q.correctLetter.toUpperCase()})</strong>`;
        feedbackHtml = `
          <div class="question-feedback visible ${fbClass}">
            <div style="margin-bottom: 6px;">${fbLead}</div>
            <div class="md-content">${q.commentHtml || ""}</div>
          </div>
        `;
      } else if (q.commentHtml) {
        feedbackHtml = `
          <div class="question-feedback visible">
            <div class="md-content">${q.commentHtml}</div>
          </div>
        `;
      }
    }

    return `
      <article class="question-card">
        <div class="question-header">
          <span class="question-num">Questão ${escapeHtml(q.number || String(idx + 1))}</span>
          ${chosen ? `<span class="badge badge-neutral">Marcada: ${chosen.toUpperCase()})</span>` : ""}
        </div>
        <div class="question-statement">${q.statementHtml}</div>
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
      </article>
    `;
  }).join("");

  answeredPill.textContent = `${answeredCount} / ${questions.length} respondidas`;

  if (progress.graded || (state.instantFeedback && answeredCount > 0)) {
    const pct = Math.round((correctCount / questions.length) * 100);
    banner.classList.add("visible");
    document.getElementById("quizScoreText").textContent = `${correctCount} / ${questions.length} (${pct}%)`;
    document.getElementById("quizScoreMessage").textContent = progress.graded
      ? (pct >= 80 ? "Excelente desempenho nível FCC!" : "Revise os comentários abaixo para fixar as pegadinhas.")
      : `${answeredCount} de ${questions.length} questão(ões) respondida(s).`;
  } else {
    banner.classList.remove("visible");
  }
}

window.selectQuizOption = function(questionId, letter) {
  const doc = getActiveDoc();
  if (!doc) return;
  const prog = getDocProgress(doc.id);
  prog.answers[questionId] = letter;
  saveState();
  renderAll();
};

function gradeCurrentQuiz() {
  const doc = getActiveDoc();
  if (!doc) return;
  const prog = getDocProgress(doc.id);
  prog.graded = true;
  saveState();
  renderAll();
  showToast("Simulado corrigido e salvo!", "success");
}

function clearCurrentQuiz() {
  const doc = getActiveDoc();
  if (!doc) return;
  const prog = getDocProgress(doc.id);
  prog.answers = {};
  prog.graded = false;
  saveState();
  renderAll();
  showToast("Respostas limpas. Bom novo treino!");
}

function renderGabaritoPanel(parsed) {
  const panel = document.getElementById("panel-gabarito");
  if (parsed.gabaritoList.length === 0) {
    panel.innerHTML = `<div class="card"><p style="margin: 0;">Nenhum gabarito comentado encontrado neste arquivo <code>.md</code>.</p></div>`;
    return;
  }

  panel.innerHTML = parsed.gabaritoList.map(item => `
    <div class="gabarito-item">
      <div class="card-header" style="margin-bottom: 8px;">
        <h3 class="card-title">Questão ${escapeHtml(item.qNum)}</h3>
        ${item.correctLetter ? `<span class="gabarito-key">Gabarito: ${item.correctLetter.toUpperCase()})</span>` : ""}
      </div>
      <div class="md-content">${item.commentHtml}</div>
    </div>
  `).join("");
}

/* =========================================================================
   ANOTAÇÕES PESSOAIS & BACKUP JSON
   ========================================================================= */
function renderNotesPanel(docId, parsed) {
  const topicSelect = document.getElementById("noteTopicSelect");
  const currentTopicVal = topicSelect.value;
  const topics = [
    "Geral da Matéria",
    "Diagnóstico do Foco",
    ...parsed.materialSections.map(s => s.title),
    "Simulado FCC"
  ];

  topicSelect.innerHTML = topics.map(t => `<option value="${escapeHtml(t)}">Tópico: ${escapeHtml(t)}</option>`).join("");
  if (topics.includes(currentTopicVal)) {
    topicSelect.value = currentTopicVal;
  }

  const formTitle = document.getElementById("noteFormTitle");
  const cancelBtn = document.getElementById("btnCancelEditNote");
  const saveBtn = document.getElementById("btnSaveNote");
  if (state.editingNoteId) {
    formTitle.textContent = "Editando Anotação";
    cancelBtn.style.display = "inline-flex";
    saveBtn.textContent = "Atualizar Anotação";
  } else {
    formTitle.textContent = "Nova Anotação de Estudo";
    cancelBtn.style.display = "none";
    saveBtn.textContent = "Salvar Anotação";
  }

  document.getElementById("noteSearchInput").value = state.noteSearch;
  document.getElementById("noteFilterScope").value = state.noteScope;

  const query = state.noteSearch.trim().toLowerCase();
  const filteredNotes = state.notes
    .filter(n => state.noteScope === "all" || n.docId === docId)
    .filter(n => {
      if (!query) return true;
      return (
        (n.title || "").toLowerCase().includes(query) ||
        (n.body || "").toLowerCase().includes(query) ||
        (n.topic || "").toLowerCase().includes(query) ||
        (n.docTitle || "").toLowerCase().includes(query)
      );
    });

  const listContainer = document.getElementById("notesListContainer");
  if (filteredNotes.length === 0) {
    listContainer.innerHTML = `
      <div class="card">
        <p style="margin: 0; color: var(--text-muted);">
          Nenhuma anotação encontrada. Use o formulário acima para salvar seus resumos e lembretes de prova.
        </p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filteredNotes.map(note => `
    <article class="note-card">
      <div class="note-meta-line">
        <span><strong>${escapeHtml(note.docTitle || "Matéria")}</strong> • ${escapeHtml(note.topic || "Geral")}</span>
        <span>${escapeHtml(note.updatedAt || "")}</span>
      </div>
      ${note.title ? `<h4 class="card-title" style="margin-bottom: 6px;">${escapeHtml(note.title)}</h4>` : ""}
      <p class="note-text">${escapeHtml(note.body)}</p>
      <div class="note-actions">
        <button type="button" class="btn btn-xs" onclick="editNote('${note.id}')">Editar</button>
        <button type="button" class="btn btn-xs btn-danger-ghost" onclick="deleteNote('${note.id}')">Excluir</button>
      </div>
    </article>
  `).join("");
}

function handleNoteSubmit(e) {
  e.preventDefault();
  const doc = getActiveDoc();
  if (!doc) return;
  const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
  const title = document.getElementById("noteTitleInput").value.trim();
  const topic = document.getElementById("noteTopicSelect").value || "Geral da Matéria";
  const body = document.getElementById("noteBodyInput").value.trim();

  if (!body) {
    showToast("Digite o conteúdo da anotação.", "error");
    return;
  }

  const nowStr = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  if (state.editingNoteId) {
    const target = state.notes.find(n => n.id === state.editingNoteId);
    if (target) {
      target.title = title;
      target.topic = topic;
      target.body = body;
      target.updatedAt = nowStr;
    }
    state.editingNoteId = null;
    showToast("Anotação atualizada!", "success");
  } else {
    state.notes.unshift({
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      docId: doc.id,
      docTitle: parsed.title,
      topic,
      title,
      body,
      updatedAt: nowStr
    });
    showToast("Anotação salva!", "success");
  }

  document.getElementById("noteTitleInput").value = "";
  document.getElementById("noteBodyInput").value = "";
  saveState();
  renderActiveDocument();
}

window.editNote = function(noteId) {
  const note = state.notes.find(n => n.id === noteId);
  if (!note) return;
  state.editingNoteId = note.id;
  document.getElementById("noteTitleInput").value = note.title || "";
  document.getElementById("noteBodyInput").value = note.body || "";
  renderActiveDocument();
  const selectEl = document.getElementById("noteTopicSelect");
  if (note.topic) selectEl.value = note.topic;
  document.getElementById("noteForm").scrollIntoView({ behavior: "smooth", block: "center" });
};

window.deleteNote = function(noteId) {
  state.notes = state.notes.filter(n => n.id !== noteId);
  if (state.editingNoteId === noteId) {
    state.editingNoteId = null;
    document.getElementById("noteTitleInput").value = "";
    document.getElementById("noteBodyInput").value = "";
  }
  saveState();
  renderActiveDocument();
  showToast("Anotação removida.");
};

function exportBackupJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    docs: state.docs,
    progress: state.progress,
    notes: state.notes
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-estudos-banestes-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Backup JSON exportado!", "success");
}

function importBackupJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || "{}"));
      if (Array.isArray(data.docs)) {
        state.docs = data.docs;
        state.activeDocId = data.docs[0] ? data.docs[0].id : null;
      }
      if (data.progress && typeof data.progress === "object") {
        state.progress = data.progress;
      }
      if (Array.isArray(data.notes)) {
        state.notes = data.notes;
      }
      saveState();
      renderAll();
      showToast("Backup JSON restaurado!", "success");
    } catch (err) {
      showToast("Arquivo JSON inválido.", "error");
    }
  };
  reader.readAsText(file, "UTF-8");
}

/* =========================================================================
   IMPORTAÇÃO & SINCRONIZAÇÃO COM ./estudos-banestes/
   ========================================================================= */
function upsertMarkdownDocument(fileName, markdown, source = "local") {
  const cleanName = String(fileName || "materia.md").split("/").pop();
  const existing = state.docs.find(d => d.fileName.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    existing.markdown = markdown;
    existing.source = source;
    existing.addedAt = new Date().toLocaleDateString("pt-BR");
    return existing;
  }
  const newDoc = {
    id: `doc-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
    fileName: cleanName,
    source,
    markdown,
    addedAt: new Date().toLocaleDateString("pt-BR")
  };
  state.docs.push(newDoc);
  return newDoc;
}

function handleFilesLoaded(fileList) {
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList).filter(f => /\.(md|markdown|txt)$/i.test(f.name) && f.name.toLowerCase() !== "readme.md");
  if (files.length === 0) {
    showToast("Nenhum arquivo .md válido encontrado.", "error");
    return;
  }

  let processed = 0;
  let lastDoc = null;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      lastDoc = upsertMarkdownDocument(file.name, String(reader.result || ""), "local");
      processed++;
      if (processed === files.length) {
        if (!state.activeDocId || files.length === 1) {
          state.activeDocId = lastDoc.id;
        }
        saveState();
        renderAll();
        showToast(`${processed} arquivo(s) .md carregado(s)!`, "success");
      }
    };
    reader.readAsText(file, "UTF-8");
  });
}

function detectGitHubRepoInfo() {
  const label = document.getElementById("repoStatusLabel");
  const slugInput = document.getElementById("githubRepoSlugInput");
  if (slugInput && state.githubRepoSlug) {
    slugInput.value = state.githubRepoSlug;
  }

  // 1. Se o usuário informou manualmente usuario/repo
  if (state.githubRepoSlug && state.githubRepoSlug.includes("/")) {
    const [owner, repo] = state.githubRepoSlug.split("/").map(s => s.trim());
    if (owner && repo) {
      label.textContent = `${owner}/${repo} • estudos-banestes/`;
      return { hasGitHubRepo: true, owner, repo };
    }
  }

  // 2. Detecção automática via GitHub Pages (project site ou user root site)
  const host = window.location.hostname || "";
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (host.endsWith(".github.io")) {
    const owner = host.replace(".github.io", "");
    const repo = pathParts.length >= 1 ? pathParts[0] : `${owner}.github.io`;
    label.textContent = `${owner}/${repo} • estudos-banestes/`;
    return { hasGitHubRepo: true, owner, repo };
  }

  label.textContent = `Pasta • ./estudos-banestes/`;
  return { hasGitHubRepo: false };
}

async function fetchMarkdownFromRelativePath(relPath) {
  try {
    const res = await fetch(relPath, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim() || /^\s*<!doctype html>/i.test(text)) return null;
    return text;
  } catch (_) {
    return null;
  }
}

async function syncEstudosBanestesFolder(notifyUser = false) {
  const repoInfo = detectGitHubRepoInfo();
  const candidateMap = new Map(); // fileName -> downloadUrl (opcional)

  // 1. Tenta ./estudos-banestes/manifest.json (funciona em qualquer servidor estático)
  try {
    const manRes = await fetch(`${STUDY_FOLDER_PATH}/manifest.json`, { cache: "no-store" });
    if (manRes.ok) {
      const manData = await manRes.json();
      const list = Array.isArray(manData) ? manData : (Array.isArray(manData.files) ? manData.files : []);
      list.forEach(item => {
        const name = typeof item === "string" ? item : (item && item.file);
        if (name && /\.md$/i.test(name)) {
          candidateMap.set(name.split("/").pop(), null);
        }
      });
    }
  } catch (_) {
    // Ignora ausência de manifest.json
  }

  // 2. Consulta a API pública do GitHub na pasta estudos-banestes
  if (repoInfo.hasGitHubRepo) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/estudos-banestes`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const items = await apiRes.json();
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (item && item.type === "file" && /\.md$/i.test(item.name) && item.name.toLowerCase() !== "readme.md") {
              candidateMap.set(item.name, item.download_url || null);
            }
          });
        }
      }
    } catch (_) {
      // Ignora erro de rede/CORS
    }
  }

  if (candidateMap.size === 0) {
    if (notifyUser) {
      showToast("Nenhum .md encontrado automaticamente. Use 'Importar .md' ou configure o repositório.", "info");
    }
    return;
  }

  let importedCount = 0;
  for (const [fileName, downloadUrl] of candidateMap.entries()) {
    let mdContent = await fetchMarkdownFromRelativePath(`${STUDY_FOLDER_PATH}/${fileName}`);
    if (!mdContent && downloadUrl) {
      mdContent = await fetchMarkdownFromRelativePath(downloadUrl);
    }
    if (mdContent) {
      upsertMarkdownDocument(fileName, mdContent, "github");
      importedCount++;
    }
  }

  if (importedCount > 0) {
    // Ordena os documentos por nome de arquivo (data crescente/decrescente)
    state.docs.sort((a, b) => a.fileName.localeCompare(b.fileName));
    if (!state.activeDocId || !state.docs.some(d => d.id === state.activeDocId)) {
      state.activeDocId = state.docs[0].id;
    }
    saveState();
    renderAll();
    if (notifyUser) {
      showToast(`${importedCount} matéria(s) sincronizada(s) de ./estudos-banestes/!`, "success");
    }
  } else if (notifyUser) {
    showToast("Não foi possível ler os arquivos .md listados.", "error");
  }
}

/* =========================================================================
   RENDERIZAÇÃO GERAL, TEMA, MODO FOCO & LIMPEZA
   ========================================================================= */
function applyThemeAndFocus() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.classList.toggle("focus-mode", state.focusMode);

  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");
  if (state.theme === "dark") {
    themeLabel.textContent = "Claro";
    themeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  } else {
    themeLabel.textContent = "Escuro";
    themeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  const focusBtn = document.getElementById("btnFocusMode");
  focusBtn.classList.toggle("btn-active", state.focusMode);
}

function renderSidebar() {
  const fileListEl = document.getElementById("fileList");
  const progressCard = document.getElementById("sidebarProgressCard");
  document.getElementById("fileCountLabel").textContent = String(state.docs.length);

  if (state.docs.length === 0) {
    fileListEl.innerHTML = `
      <p class="helper-hint" style="padding: 8px 4px;">
        Nenhuma matéria importada ainda.
      </p>
    `;
    progressCard.style.display = "none";
    return;
  }

  progressCard.style.display = "block";
  const docQuery = state.docSearch.trim().toLowerCase();

  const filteredDocs = state.docs.filter(doc => {
    if (!docQuery) return true;
    const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
    return (
      parsed.title.toLowerCase().includes(docQuery) ||
      doc.fileName.toLowerCase().includes(docQuery) ||
      parsed.axisLabel.toLowerCase().includes(docQuery)
    );
  });

  fileListEl.innerHTML = filteredDocs.map(doc => {
    const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
    const isActive = doc.id === state.activeDocId;
    const prog = getDocProgress(doc.id);
    const qTotal = parsed.questions.length;
    const qCorrect = parsed.questions.filter(q => q.correctLetter && prog.answers[q.id] === q.correctLetter).length;
    const qAnswered = Object.keys(prog.answers).length;

    return `
      <div class="file-item ${isActive ? "active" : ""}">
        <button type="button" class="file-item-btn" onclick="selectDocument('${doc.id}')">
          <span class="file-name">${escapeHtml(parsed.title)}</span>
          <span class="file-meta">
            <span>${escapeHtml(parsed.dateLabel || doc.fileName)}</span>
            ${qTotal > 0 ? `<span class="file-mini-badge ${qCorrect === qTotal && qTotal > 0 ? "done" : ""}">${qAnswered > 0 ? `${qCorrect}/${qTotal} acertos` : `${qTotal} questões`}</span>` : ""}
          </span>
        </button>
        <button type="button" class="file-remove-btn" title="Remover matéria" onclick="removeDocument('${doc.id}')">×</button>
      </div>
    `;
  }).join("");

  const doc = getActiveDoc();
  if (!doc) return;
  const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
  const totalBlocks = 1 + parsed.materialSections.length;
  const prog = getDocProgress(doc.id);
  const validReviewed = prog.reviewedIds.filter(id => id === "diag-foco" || /^mat-\d+$/.test(id));
  const pct = totalBlocks > 0 ? Math.min(100, Math.round((validReviewed.length / totalBlocks) * 100)) : 0;

  document.getElementById("progressPercent").textContent = `${pct}%`;
  document.getElementById("progressCount").textContent = `${validReviewed.length} / ${totalBlocks}`;
  document.getElementById("progressBarFill").style.width = `${pct}%`;
}

window.selectDocument = function(docId) {
  state.activeDocId = docId;
  state.editingNoteId = null;
  state.materialSearch = "";
  const matInput = document.getElementById("materialSearchInput");
  if (matInput) matInput.value = "";
  saveState();
  renderAll();
  setDrawerOpen(false);
};

window.removeDocument = function(docId) {
  state.docs = state.docs.filter(d => d.id !== docId);
  if (state.activeDocId === docId) {
    state.activeDocId = state.docs[0] ? state.docs[0].id : null;
  }
  saveState();
  renderAll();
  showToast("Matéria removida.");
};

function renderDocHeader(doc, parsed) {
  const headerEl = document.getElementById("docHeader");
  headerEl.innerHTML = `
    <div class="doc-badges">
      ${parsed.axisLabel ? `<span class="badge">${escapeHtml(parsed.axisLabel)}</span>` : ""}
      ${parsed.dateLabel ? `<span class="badge badge-neutral">Data: ${escapeHtml(parsed.dateLabel)}</span>` : ""}
      <span class="badge badge-neutral">Banca FCC • Banestes</span>
    </div>
    <h2 class="doc-title">${escapeHtml(parsed.title)}</h2>
    <p class="doc-source-file">Arquivo: <code>${escapeHtml(doc.fileName)}</code></p>
  `;
}

function renderActiveDocument() {
  const emptyView = document.getElementById("emptyStateView");
  const activeContainer = document.getElementById("activeDocContainer");
  const doc = getActiveDoc();

  if (!doc) {
    emptyView.style.display = "block";
    activeContainer.style.display = "none";
    return;
  }

  emptyView.style.display = "none";
  activeContainer.style.display = "block";

  const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);

  renderDocHeader(doc, parsed);

  document.getElementById("materialCountBadge").textContent = String(parsed.materialSections.length);
  document.getElementById("simuladoCountBadge").textContent = String(parsed.questions.length);

  const docNotesCount = state.notes.filter(n => n.docId === doc.id).length;
  document.getElementById("anotacoesCountBadge").textContent = String(docNotesCount);

  const validTabs = ["diagnostico", "material", "simulado", "anotacoes", "gabarito"];
  if (!validTabs.includes(state.activeTab)) {
    state.activeTab = "diagnostico";
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const active = btn.dataset.tab === state.activeTab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  });

  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.remove("active");
  });
  const activePanel = document.getElementById(`panel-${state.activeTab}`);
  if (activePanel) activePanel.classList.add("active");

  renderDiagnosticoPanel(doc.id, parsed);
  renderMaterialPanel(doc.id, parsed);
  renderSimuladoPanel(doc.id, parsed);
  renderNotesPanel(doc.id, parsed);
  renderGabaritoPanel(parsed);
}

function renderAll() {
  applyThemeAndFocus();
  renderSidebar();
  renderActiveDocument();
}

function resetApplication() {
  localStorage.removeItem(STORAGE_KEY);
  const keptSlug = state.githubRepoSlug;
  state = {
    theme: "light",
    focusMode: false,
    activeDocId: null,
    activeTab: "diagnostico",
    instantFeedback: true,
    docSearch: "",
    materialSearch: "",
    noteSearch: "",
    noteScope: "current",
    editingNoteId: null,
    githubRepoSlug: keptSlug,
    docs: [],
    progress: {},
    notes: []
  };
  renderAll();
  syncEstudosBanestesFolder(true);
}

function setDrawerOpen(open) {
  const sidebar = document.getElementById("sidebarDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  sidebar.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
}

/* =========================================================================
   EVENT LISTENERS & INICIALIZAÇÃO
   ========================================================================= */
function bindEvents() {
  // Drawer mobile
  document.getElementById("btnOpenDrawer").addEventListener("click", () => setDrawerOpen(true));
  document.getElementById("btnCloseDrawer").addEventListener("click", () => setDrawerOpen(false));
  document.getElementById("drawerBackdrop").addEventListener("click", () => setDrawerOpen(false));

  // Sincronização ./estudos-banestes/
  document.getElementById("btnSyncRepo").addEventListener("click", () => syncEstudosBanestesFolder(true));
  document.getElementById("btnEmptySync").addEventListener("click", () => syncEstudosBanestesFolder(true));

  // Salvar slug usuario/repo
  document.getElementById("btnSaveRepoSlug").addEventListener("click", () => {
    state.githubRepoSlug = document.getElementById("githubRepoSlugInput").value.trim();
    saveState();
    syncEstudosBanestesFolder(true);
  });

  // Inputs de arquivo e pasta
  const fileInput = document.getElementById("mdFileInput");
  const folderInput = document.getElementById("mdFolderInput");

  document.getElementById("btnLoadMd").addEventListener("click", () => fileInput.click());
  document.getElementById("btnSelectFilesInline").addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  document.getElementById("btnSelectFolderInline").addEventListener("click", (e) => {
    e.stopPropagation();
    folderInput.click();
  });
  document.getElementById("btnEmptyLoadFiles").addEventListener("click", () => fileInput.click());
  document.getElementById("btnEmptyLoadFolder").addEventListener("click", () => folderInput.click());

  fileInput.addEventListener("change", (e) => {
    handleFilesLoaded(e.target.files);
    fileInput.value = "";
    setDrawerOpen(false);
  });

  folderInput.addEventListener("change", (e) => {
    handleFilesLoaded(e.target.files);
    folderInput.value = "";
    setDrawerOpen(false);
  });

  // Dropzone
  const dropzone = document.getElementById("dropzone");
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFilesLoaded(e.dataTransfer.files);
    setDrawerOpen(false);
  });

  // Busca de matérias na sidebar & busca no material
  document.getElementById("docSearchInput").addEventListener("input", (e) => {
    state.docSearch = e.target.value;
    renderSidebar();
  });

  document.getElementById("materialSearchInput").addEventListener("input", (e) => {
    state.materialSearch = e.target.value;
    const doc = getActiveDoc();
    if (doc) renderMaterialPanel(doc.id, parseStudyMarkdown(doc.markdown, doc.fileName));
  });

  // Navegação de abas (Desktop + Mobile)
  const switchTab = (tabName) => {
    if (!tabName) return;
    state.activeTab = tabName;
    saveState();
    renderActiveDocument();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Atalhos de teclado (Alt + 1..5 para abas)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      const map = ["diagnostico", "material", "simulado", "anotacoes", "gabarito"];
      switchTab(map[Number(e.key) - 1]);
    }
  });

  // Anotações
  document.getElementById("noteForm").addEventListener("submit", handleNoteSubmit);
  document.getElementById("btnCancelEditNote").addEventListener("click", () => {
    state.editingNoteId = null;
    document.getElementById("noteTitleInput").value = "";
    document.getElementById("noteBodyInput").value = "";
    renderActiveDocument();
  });
  document.getElementById("noteSearchInput").addEventListener("input", (e) => {
    state.noteSearch = e.target.value;
    const doc = getActiveDoc();
    if (doc) renderNotesPanel(doc.id, parseStudyMarkdown(doc.markdown, doc.fileName));
  });
  document.getElementById("noteFilterScope").addEventListener("change", (e) => {
    state.noteScope = e.target.value;
    saveState();
    const doc = getActiveDoc();
    if (doc) renderNotesPanel(doc.id, parseStudyMarkdown(doc.markdown, doc.fileName));
  });

  // Backup JSON
  document.getElementById("btnExportJson").addEventListener("click", exportBackupJson);
  const jsonInput = document.getElementById("jsonImportInput");
  document.getElementById("btnImportJson").addEventListener("click", () => jsonInput.click());
  jsonInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importBackupJson(e.target.files[0]);
    e.target.value = "";
  });

  // Simulado
  document.getElementById("btnGradeQuiz").addEventListener("click", gradeCurrentQuiz);
  document.getElementById("btnClearQuiz").addEventListener("click", clearCurrentQuiz);
  document.getElementById("chkInstantFeedback").addEventListener("change", (e) => {
    state.instantFeedback = e.target.checked;
    saveState();
    renderActiveDocument();
  });

  // Tema, Foco e Limpar
  document.getElementById("btnThemeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyThemeAndFocus();
  });

  document.getElementById("btnFocusMode").addEventListener("click", () => {
    state.focusMode = !state.focusMode;
    saveState();
    applyThemeAndFocus();
  });

  document.getElementById("btnResetAll").addEventListener("click", resetApplication);
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  detectGitHubRepoInfo();
  bindEvents();
  renderAll();
  syncEstudosBanestesFolder(false);
});