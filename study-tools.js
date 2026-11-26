const EXAM_SUBJECTS = [
  ["Língua Portuguesa", 10, 1],
  ["Matemática/Raciocínio Lógico e Quantitativo", 10, 1],
  ["Atualidades do Mercado Financeiro", 5, 1],
  ["Ética, Compliance e ESG", 5, 1],
  ["Conhecimentos Bancários", 15, 2],
  ["Matemática Financeira", 5, 2],
  ["Noções de Probabilidade e Estatística", 5, 2],
  ["Noções de Informática e Comportamentos Digitais", 5, 2],
  ["Vendas, Negociação e Atendimento", 10, 2]
];
const CONFIDENCE_LABELS = { certain: "Tenho certeza", unsure: "Estou em dúvida", guess: "Chutei" };
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// Os primeiros blocos adotavam um tema único, sem tabela de disciplinas.
const LEGACY_SUBJECTS = {
  "2026-11-17-fundo-garantidor-de-creditos-fgc.md": 4,
  "2026-11-17-prevencao-a-lavagem-de-dinheiro-pld-e-financiamento-ao-terrorismo-ft.md": 4,
  "2026-11-18-sistema-financeiro-nacional-sfn-estrutura-orgaos-reguladores-e-operadores.md": 4,
  "2026-11-19-produtos-e-servicos-bancarios-contas-credito-e-investimentos.md": 4,
  "2026-11-20-codigo-de-defesa-do-consumidor-cdc-no-contexto-bancario.md": 4,
  "2026-11-21-meios-de-pagamento-pix-e-outros-instrumentos-eletronicos.md": 4,
  "2026-11-22-lei-geral-de-protecao-de-dados-lgpd-no-contexto-bancario.md": 7,
  "2026-11-23-mercado-de-capitais-e-instrumentos-financeiros.md": 4
};

const SUGGESTED_TOPICS = [
  "Acentuação, discurso direto e indireto, figuras de linguagem",
  "Frações, regra de três, média ponderada",
  "Open Finance, moedas digitais, fintechs, Copom e meta da Selic",
  "Guia de Conduta Ética do Banestes, ODS, prevenção à corrupção",
  "Resolução CMN nº 4.966/2021, bancassurance, modalidades de previdência",
  "Juros simples, taxa nominal, desconto composto",
  "Moda, cálculo de variância e desvio padrão",
  "Windows e Linux, Gmail, Calendar, Meet e Gemini",
  "Prospecção, fechamento e adequação da oferta"
];

let reviewMode = "due";
let reviewSubject = "";
let reviewResult = null;
let examTicker;

function buildQuestionBank() {
  const seen = new Set();
  return state.docs.flatMap(doc => {
    const parsed = parseStudyMarkdown(doc.markdown, doc.fileName);
    const rows = new Map();
    for (const row of doc.markdown.matchAll(/^\|\s*(\d+)\s*\|\s*([12])\s*\|\s*([^|]+)\|\s*([^|]+)\|/gm)) {
      rows.set(row[1], { weight: Number(row[2]), subject: row[3].trim(), topic: row[4].trim() });
    }
    const legacy = EXAM_SUBJECTS[LEGACY_SUBJECTS[doc.fileName]];
    return parsed.questions.filter(q => q.correctLetter && q.options.length === 5).map(q => {
      const info = rows.get(q.number) || {
        subject: legacy?.[0] || "Disciplina não identificada",
        weight: legacy?.[2] || null,
        topic: parsed.title
      };
      const fingerprint = q.statementLines.join(" ").replace(/^—.*?· Peso [12] /, "")
        .toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      return { ...q, ...info, docId: doc.id, key: JSON.stringify([doc.id, q.id]), fingerprint };
    }).filter(q => {
      if (seen.has(q.fingerprint)) return false;
      seen.add(q.fingerprint);
      return true;
    });
  });
}

function questionHistory(docId, questionId) {
  const progress = getDocProgress(docId);
  progress.history ||= {};
  return progress.history[questionId];
}

function recordStudyAnswer(q, letter, confidence, isReview = false, now = Date.now()) {
  const progress = getDocProgress(q.docId);
  progress.history ||= {};
  const correct = letter === q.correctLetter;
  const entry = progress.history[q.id] ||= {
    firstCorrect: correct,
    everWrong: false,
    reviewAttempts: 0,
    reviewCorrect: 0,
    streak: 0,
    dueAt: null
  };
  entry.everWrong ||= !correct;
  if (isReview) {
    entry.reviewAttempts += 1;
    entry.reviewCorrect += Number(correct);
    entry.streak = correct ? entry.streak + 1 : 0;
    const next = new Date(now);
    next.setDate(next.getDate() + (correct ? REVIEW_INTERVALS[Math.min(entry.streak - 1, REVIEW_INTERVALS.length - 1)] : 1));
    next.setHours(0, 0, 0, 0);
    entry.dueAt = next.getTime();
  } else if (!correct || confidence === "unsure" || confidence === "guess") {
    entry.streak = 0;
    entry.dueAt = now;
  }
  return correct;
}

function getReviewEntry(q) {
  const progress = getDocProgress(q.docId);
  const history = questionHistory(q.docId, q.id);
  if (history) return history;
  const answer = progress.answers[q.id];
  if (!answer || !(progress.graded || state.instantFeedback)) return null;
  const correct = answer === q.correctLetter;
  const confidence = progress.confidence?.[q.id];
  return { firstCorrect: correct, everWrong: !correct, dueAt: !correct || confidence === "guess" || confidence === "unsure" ? 0 : null };
}

function renderReviewPanel() {
  const bank = buildQuestionBank();
  const now = Date.now();
  const entries = bank.map(q => ({ q, entry: getReviewEntry(q) })).filter(item => item.entry);
  const due = entries.filter(({entry}) => entry.dueAt !== null && entry.dueAt <= now);
  const errors = entries.filter(({entry}) => entry.everWrong);
  const queue = (reviewMode === "due" ? due : errors)
    .filter(({q}) => (!reviewSubject || q.subject === reviewSubject) &&
      (reviewMode !== "errors" || !reviewedInSession.has(q.key)))
    .sort((a, b) => (a.entry.dueAt ?? Infinity) - (b.entry.dueAt ?? Infinity));
  const question = reviewResult?.q || queue[0]?.q;
  const subjectOptions = [...new Set(bank.map(q => q.subject))];
  const subjectSelect = document.getElementById("reviewSubject");
  subjectSelect.innerHTML = '<option value="">Todas as disciplinas</option>' + subjectOptions.map(subject =>
    `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join("");
  subjectSelect.value = reviewSubject;
  document.getElementById("reviewCount").textContent = `${due.length} pendente(s) hoje · ${errors.length} no caderno de erros`;
  document.getElementById("reviewMode").value = reviewMode;

  const target = document.getElementById("reviewQuestion");
  if (!question) {
    target.innerHTML = '<p class="card">Nenhuma questão nesta seleção. Erros, dúvidas e chutes entram na fila após a correção do simulado.</p>';
    return;
  }
  const result = reviewResult;
  target.innerHTML = `
    <article class="question-card">
      <div class="question-header"><strong>${escapeHtml(question.subject)}</strong><span>${escapeHtml(question.topic)}</span></div>
      <div class="question-statement">${question.statementHtml}</div>
      <div class="options-list">${question.options.map(opt => `
        <button type="button" data-review-answer="${opt.letter}" class="option-btn ${result && opt.letter === question.correctLetter ? "correct" : result?.letter === opt.letter ? "incorrect" : ""}" ${result ? "disabled" : ""}>
          <span class="option-letter">${opt.letter.toUpperCase()}</span><span>${renderInlineMarkdown(opt.text)}</span>
        </button>`).join("")}</div>
      ${result ? `<div class="question-feedback visible ${result.correct ? "is-right" : "is-wrong"}">
        <strong>${result.correct ? "Resposta correta" : "Resposta incorreta"}</strong>
        <div class="md-content">${question.commentHtml}</div>
      </div><p>Próxima revisão em ${new Date(questionHistory(question.docId, question.id).dueAt).toLocaleDateString("pt-BR")}.</p>
      <button type="button" class="btn btn-primary" data-review-next>Continuar</button>` : ""}
    </article>`;
  target.onclick = event => {
    const answer = event.target.closest("[data-review-answer]");
    if (answer && !reviewResult) {
      const previous = getReviewEntry(question);
      const progress = getDocProgress(question.docId);
      progress.history ||= {};
      if (previous && !progress.history[question.id]) {
        progress.history[question.id] = { reviewAttempts: 0, reviewCorrect: 0, streak: 0, ...previous };
      }
      const letter = answer.dataset.reviewAnswer;
      reviewResult = { q: question, letter, correct: recordStudyAnswer(question, letter, null, true) };
      if (reviewMode === "errors") reviewedInSession.add(question.key);
      saveState();
      renderReviewPanel();
      target.querySelector("[data-review-next]")?.focus();
    } else if (event.target.closest("[data-review-next]")) {
      reviewResult = null;
      renderReviewPanel();
      target.querySelector("[data-review-answer]")?.focus();
    }
  };
}

const reviewedInSession = new Set();

function renderCoveragePanel() {
  const bank = buildQuestionBank();
  const activeTopics = new Set(bank.map(q => q.topic.toLocaleLowerCase("pt-BR")));
  const rows = EXAM_SUBJECTS.map(([subject, required, weight], index) => {
    const items = bank.filter(q => q.subject === subject && q.weight === weight);
    const entries = items.map(getReviewEntry).filter(Boolean);
    const correct = entries.filter(entry => entry.firstCorrect).length;
    const reviews = entries.reduce((sum, entry) => sum + (entry.reviewAttempts || 0), 0);
    const reviewCorrect = entries.reduce((sum, entry) => sum + (entry.reviewCorrect || 0), 0);
    const topics = new Map();
    for (const q of items) {
      const topic = topics.get(q.topic) || { total: 0, practiced: 0 };
      topic.total += 1;
      topic.practiced += Number(Boolean(getReviewEntry(q)));
      topics.set(q.topic, topic);
    }
    const suggestions = SUGGESTED_TOPICS[index].split(", ").filter(topic => !activeTopics.has(topic.toLocaleLowerCase("pt-BR")));
    return `<details class="card coverage-item">
      <summary><strong>${escapeHtml(subject)}</strong><span>${items.length} no banco · ${required} na prova · peso ${weight}</span></summary>
      <p>Praticadas ${entries.length}/${items.length} · Acertos iniciais ${correct}/${entries.length} · Acertos nas revisões ${reviewCorrect}/${reviews} · Pontos perdidos nas primeiras tentativas ${(entries.length - correct) * weight}</p>
      <p><strong>Temas com questões</strong> — ${[...topics].map(([topic, count]) => `${escapeHtml(topic)} (${count.practiced}/${count.total} praticadas)`).join(" · ") || "Nenhum tema registrado."}</p>
      ${suggestions.length ? `<p><strong>Assuntos para conferir no acervo</strong> — ${escapeHtml(suggestions.join(" · "))}</p>` : ""}
      <p><button type="button" class="btn btn-xs" data-review-subject="${escapeHtml(subject)}">Revisar esta disciplina</button></p>
    </details>`;
  });
  document.getElementById("coverageContent").innerHTML = rows.join("");
}

function getExamGroups(bank) {
  return EXAM_SUBJECTS.map(([subject, quota, weight]) => ({
    subject, quota, weight, questions: bank.filter(q => q.subject === subject && q.weight === weight)
  }));
}

function shuffleQuestions(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function finishFullExam(now = Date.now()) {
  const exam = state.exam;
  if (!exam || exam.finishedAt) return;
  exam.finishedAt = now;
  for (const [index, question] of exam.questions.entries()) {
    const answer = exam.answers[index];
    if (!answer) continue;
    const previous = getReviewEntry(question);
    const progress = getDocProgress(question.docId);
    progress.history ||= {};
    if (previous && !progress.history[question.id]) {
      progress.history[question.id] = { reviewAttempts: 0, reviewCorrect: 0, streak: 0, ...previous };
    }
    recordStudyAnswer(question, answer, null, false, now);
  }
  saveState();
}

function renderFullExam() {
  clearInterval(examTicker);
  const panel = document.getElementById("fullExamContent");
  const exam = state.exam;
  if (!exam) {
    const groups = getExamGroups(buildQuestionBank());
    const missing = groups.filter(group => group.questions.length < group.quota);
    panel.innerHTML = `<div class="card"><h3>Prova completa</h3>
      <p>70 questões, com 30 de peso 1 e 40 de peso 2. O gabarito abre ao finalizar.</p>
      ${missing.length ? `<p>Para reproduzir a distribuição do edital, faltam questões nas disciplinas abaixo.</p>
        <ul>${missing.map(group => `<li>${escapeHtml(group.subject)} · faltam ${group.quota - group.questions.length}</li>`).join("")}</ul>` : ""}
      <label><input type="checkbox" id="fullExamTimed" checked> Cronômetro de 4 horas</label>
      <p><button type="button" class="btn btn-primary" id="startFullExam" ${missing.length ? "disabled" : ""}>Começar prova</button></p></div>`;
    panel.querySelector("#startFullExam").onclick = () => {
      state.exam = {
        questions: groups.flatMap(group => shuffleQuestions(group.questions).slice(0, group.quota)),
        answers: {},
        index: 0,
        deadline: panel.querySelector("#fullExamTimed").checked ? Date.now() + 4 * 60 * 60 * 1000 : null
      };
      saveState();
      renderFullExam();
    };
    return;
  }
  if (!exam.finishedAt && exam.deadline && exam.deadline <= Date.now()) finishFullExam();
  if (exam.finishedAt) {
    const earned = exam.questions.reduce((sum, q, index) => sum + (exam.answers[index] === q.correctLetter ? q.weight : 0), 0);
    const total = exam.questions.reduce((sum, q) => sum + q.weight, 0);
    panel.innerHTML = `<div class="card"><h3>Resultado · ${earned}/${total} pontos</h3>
      <button class="btn" type="button" id="resetFullExam">Novo simulado</button></div>` + exam.questions.map((q, index) => `
      <details class="card"><summary>Questão ${index + 1} · ${escapeHtml(q.subject)} · ${exam.answers[index] === q.correctLetter ? "correta" : exam.answers[index] ? "incorreta" : "em branco"}</summary>
      ${q.statementHtml}<p>Gabarito ${q.correctLetter.toUpperCase()} · Sua resposta ${exam.answers[index]?.toUpperCase() || "em branco"}</p>
      <ol type="A">${q.options.map(opt => `<li>${renderInlineMarkdown(opt.text)}</li>`).join("")}</ol>${q.commentHtml}</details>`).join("");
    panel.querySelector("#resetFullExam").onclick = () => {
      state.exam = null;
      saveState();
      renderFullExam();
    };
    return;
  }
  const question = exam.questions[exam.index];
  panel.innerHTML = `<article class="question-card">
    <div class="question-header"><strong>Questão ${exam.index + 1}/70</strong><span id="examClock"></span></div>
    <p>${escapeHtml(question.subject)} · Peso ${question.weight} · ${Object.keys(exam.answers).length} respondidas</p>
    ${question.statementHtml}
    <div class="options-list">${question.options.map(opt => `<button type="button" class="option-btn ${exam.answers[exam.index] === opt.letter ? "selected" : ""}" data-exam-answer="${opt.letter}"><span class="option-letter">${opt.letter.toUpperCase()}</span><span>${renderInlineMarkdown(opt.text)}</span></button>`).join("")}</div>
    <div class="study-actions">
      <button type="button" class="btn" id="examPrevious" ${exam.index === 0 ? "disabled" : ""}>Anterior</button>
      <label>Ir para questão <select id="examJump">${exam.questions.map((_, index) => `<option value="${index}" ${index === exam.index ? "selected" : ""}>${index + 1}${exam.answers[index] ? " ✓" : ""}</option>`).join("")}</select></label>
      <button type="button" class="btn" id="examNext" ${exam.index === exam.questions.length - 1 ? "disabled" : ""}>Próxima</button>
      <button type="button" class="btn btn-primary" id="examFinish">Finalizar</button>
    </div></article>`;
  const move = index => {
    exam.index = index;
    saveState();
    renderFullExam();
  };
  panel.querySelectorAll("[data-exam-answer]").forEach(button => {
    button.onclick = () => {
      if (exam.deadline && exam.deadline <= Date.now()) {
        finishFullExam();
      } else {
        exam.answers[exam.index] = button.dataset.examAnswer;
        saveState();
      }
      renderFullExam();
    };
  });
  panel.querySelector("#examPrevious").onclick = () => move(exam.index - 1);
  panel.querySelector("#examNext").onclick = () => move(exam.index + 1);
  panel.querySelector("#examJump").onchange = event => move(Number(event.target.value));
  panel.querySelector("#examFinish").onclick = () => {
    const blank = exam.questions.length - Object.keys(exam.answers).length;
    if (blank && !window.confirm(`Há ${blank} questão(ões) em branco. Finalizar agora?`)) return;
    finishFullExam();
    renderFullExam();
  };
  if (exam.deadline) {
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((exam.deadline - Date.now()) / 1000));
      if (!seconds) {
        finishFullExam();
        renderFullExam();
        return;
      }
      panel.querySelector("#examClock").textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(value => String(value).padStart(2, "0")).join(":");
    };
    tick();
    if (!exam.finishedAt) examTicker = setInterval(tick, 1000);
  }
}

function bindStudyTools() {
  document.querySelectorAll("[data-study-tab]").forEach(button => {
    button.onclick = () => {
      if (button.dataset.studyTab === "revisao") {
        reviewMode = "due";
        reviewSubject = "";
        reviewResult = null;
      }
      state.activeTab = button.dataset.studyTab;
      saveState();
      renderActiveDocument();
    };
  });
  document.getElementById("quizQuestionsContainer").onchange = event => {
    const input = event.target.closest("[data-quiz-confidence]");
    const doc = getActiveDoc();
    if (!input || !doc) return;
    const progress = getDocProgress(doc.id);
    progress.confidence ||= {};
    const questionId = input.dataset.quizConfidence;
    progress.confidence[questionId] = input.value;
    if (progress.graded || state.instantFeedback) {
      const q = parseStudyMarkdown(doc.markdown, doc.fileName).questions.find(item => item.id === questionId);
      const chosen = progress.answers[questionId];
      if (q?.correctLetter && chosen) {
        recordStudyAnswer({ ...q, docId: doc.id }, chosen, input.value);
      }
    }
    saveState();
  };
  document.getElementById("reviewMode").onchange = event => {
    reviewMode = event.target.value;
    reviewedInSession.clear();
    reviewResult = null;
    renderReviewPanel();
  };
  document.getElementById("reviewSubject").onchange = event => {
    reviewSubject = event.target.value;
    reviewResult = null;
    renderReviewPanel();
  };
  document.getElementById("coverageContent").onclick = event => {
    const button = event.target.closest("[data-review-subject]");
    if (!button) return;
    reviewSubject = button.dataset.reviewSubject;
    reviewMode = "due";
    reviewResult = null;
    state.activeTab = "revisao";
    saveState();
    renderActiveDocument();
  };
}

function renderStudyTools() {
  clearInterval(examTicker);
  if (state.exam?.deadline && state.exam.deadline <= Date.now()) finishFullExam();
  if (state.activeTab === "revisao") renderReviewPanel();
  if (state.activeTab === "edital") renderCoveragePanel();
  if (state.activeTab === "prova") renderFullExam();
}

function recordBlockAnswers(doc) {
  const progress = getDocProgress(doc.id);
  const { questions } = parseStudyMarkdown(doc.markdown, doc.fileName);
  for (const question of questions) {
    const letter = progress.answers[question.id];
    if (letter && question.correctLetter) {
      recordStudyAnswer({ ...question, docId: doc.id }, letter, progress.confidence?.[question.id]);
    }
  }
}

function examForStorage() {
  if (!state.exam) return null;
  const { questions, ...exam } = state.exam;
  return { ...exam, keys: questions.map(question => question.key) };
}

function restoreSavedExam(exam) {
  const keys = exam?.keys;
  if (!Array.isArray(keys) || keys.length !== 70 || new Set(keys).size !== 70
      || !Number.isInteger(exam.index) || exam.index < 0 || exam.index >= keys.length) return null;
  const bank = new Map(buildQuestionBank().map(q => [q.key, q]));
  const questions = keys.map(key => bank.get(key));
  if (questions.some(q => !q)) return null;
  if (EXAM_SUBJECTS.some(([subject, quota, weight]) =>
    questions.filter(q => q.subject === subject && q.weight === weight).length !== quota)) return null;
  const answers = {};
  for (const [index, q] of questions.entries()) {
    const chosen = exam.answers?.[index];
    if (q.options.some(option => option.letter === chosen)) answers[index] = chosen;
  }
  return {
    questions, answers, index: exam.index,
    deadline: Number.isFinite(exam.deadline) ? exam.deadline : null,
    finishedAt: Number.isFinite(exam.finishedAt) ? exam.finishedAt : null
  };
}
