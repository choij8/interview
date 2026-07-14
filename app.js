const STORAGE_KEY = "starInterviewRepository.entries.v1";
const CATEGORY_KEY = "starInterviewRepository.categories.v1";
const THEME_KEY = "starInterviewRepository.theme.v1";

const defaultCategories = [
  "Leadership",
  "Stakeholder Management",
  "Problem Solving",
  "Technical Delivery",
  "Teamwork",
  "Conflict & Challenges",
  "Customer Focus",
  "Failure & Learning",
  "General / Motivation"
];

const sampleEntries = [
  {
    id: crypto.randomUUID(),
    question: "Tell me about a time you influenced senior stakeholders using data.",
    category: "Stakeholder Management",
    status: "ready",
    company: "Example Company",
    role: "Senior Data Analyst",
    tags: ["stakeholders", "data storytelling", "DLP"],
    situation: "A cross-functional data loss prevention program needed clearer visibility of policy effectiveness and user behaviour across a large employee population.",
    task: "I was responsible for establishing an analytics approach that could give senior stakeholders reliable evidence, identify priority cohorts and support decisions about policy changes.",
    action: "I clarified the decisions leaders needed to make, translated them into measurable KPIs, developed dashboards and supporting analysis, and used concise visual storytelling to explain trends, risks and recommended actions. I also documented definitions and assumptions so that stakeholders had a common interpretation of the results.",
    result: "The analysis improved visibility of the program, supported targeted interventions and gave leaders a repeatable evidence base for monitoring policy effectiveness. Replace this sample with your precise metrics and outcomes.",
    notes: "Sample entry. Edit or delete it, then add your verified figures and stakeholder feedback.",
    favourite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let entries = loadEntries();
let categories = loadCategories();
let selectedId = entries[0]?.id || null;
let activeFilter = "all";
let activeCategory = null;
let editingId = null;

const $ = (id) => document.getElementById(id);

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : sampleEntries;
  } catch {
    return sampleEntries;
  }
}

function loadCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORY_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function statusLabel(status) {
  return ({ draft: "Draft", developing: "Developing", ready: "Interview ready" })[status] || status;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function filteredEntries() {
  const query = $("searchInput").value.trim().toLowerCase();
  let result = entries.filter(entry => {
    const filterPass =
      activeFilter === "all" ||
      (activeFilter === "favourite" && entry.favourite) ||
      entry.status === activeFilter;

    const categoryPass = !activeCategory || entry.category === activeCategory;
    const haystack = [
      entry.question, entry.category, entry.status, entry.company, entry.role,
      ...(entry.tags || []), entry.situation, entry.task, entry.action, entry.result, entry.notes
    ].join(" ").toLowerCase();

    return filterPass && categoryPass && (!query || haystack.includes(query));
  });

  const sort = $("sortSelect").value;
  result.sort((a, b) => {
    if (sort === "updated-desc") return new Date(b.updatedAt) - new Date(a.updatedAt);
    if (sort === "created-desc") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "title-asc") return a.question.localeCompare(b.question);
    if (sort === "company-asc") return (a.company || "").localeCompare(b.company || "");
    return 0;
  });

  return result;
}

function render() {
  renderSidebar();
  renderList();
  renderDetail();
  renderSummary();
}

function renderSidebar() {
  $("allCount").textContent = entries.length;
  $("favouriteCount").textContent = entries.filter(e => e.favourite).length;
  $("draftCount").textContent = entries.filter(e => e.status === "draft").length;
  $("readyCount").textContent = entries.filter(e => e.status === "ready").length;

  document.querySelectorAll(".nav-item[data-filter]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === activeFilter && !activeCategory);
  });

  $("categoryList").innerHTML = categories.map(category => {
    const count = entries.filter(e => e.category === category).length;
    return `<button class="nav-item category-nav ${activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)} <span>${count}</span>
    </button>`;
  }).join("");

  document.querySelectorAll(".category-nav").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      activeFilter = "all";
      $("pageTitle").textContent = activeCategory;
      $("pageSubtitle").textContent = `Interview responses filed under ${activeCategory}.`;
      render();
    });
  });
}

function renderList() {
  const result = filteredEntries();
  $("resultsLabel").textContent = `${result.length} ${result.length === 1 ? "entry" : "entries"}`;
  $("entryList").innerHTML = result.map(entry => `
    <article class="entry-card ${entry.id === selectedId ? "selected" : ""}" data-id="${entry.id}">
      <div class="entry-topline">
        <h3 class="entry-question">${escapeHtml(entry.question)}</h3>
        <span class="star-toggle">${entry.favourite ? "★" : ""}</span>
      </div>
      <div class="entry-meta">
        <span class="badge">${escapeHtml(entry.category || "Uncategorised")}</span>
        <span class="badge status-${escapeHtml(entry.status)}">${escapeHtml(statusLabel(entry.status))}</span>
        ${entry.company ? `<span class="tag">${escapeHtml(entry.company)}</span>` : ""}
      </div>
      <p class="entry-snippet">${escapeHtml(entry.result || entry.action || entry.situation || "No STAR response added yet.")}</p>
    </article>
  `).join("");

  $("emptyState").classList.toggle("hidden", result.length > 0);
  $("entryList").classList.toggle("hidden", result.length === 0);

  document.querySelectorAll(".entry-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedId = card.dataset.id;
      render();
    });
  });
}

function starSection(letter, label, value, letterClass) {
  return `
    <section class="star-section">
      <div class="star-section-header">
        <span class="star-letter ${letterClass}">${letter}</span>${label}
      </div>
      <div class="star-section-body ${value ? "" : "placeholder-text"}">${escapeHtml(value || `No ${label.toLowerCase()} added yet.`)}</div>
    </section>`;
}

function renderDetail() {
  const panel = $("detailPanel");
  const entry = entries.find(e => e.id === selectedId);

  if (!entry) {
    panel.innerHTML = `<div class="welcome-panel">
      <div class="welcome-icon">★</div>
      <h3>Select an interview entry</h3>
      <p>Review and edit the question, Situation, Task, Action and Result in one place.</p>
    </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="detail-content">
      <div class="detail-topline">
        <div>
          <p class="eyebrow">${escapeHtml(entry.category || "UNCATEGORISED")}</p>
          <h2>${escapeHtml(entry.question)}</h2>
        </div>
        <div class="detail-actions">
          <button id="favouriteDetailBtn" title="Favourite">${entry.favourite ? "★" : "☆"}</button>
          <button id="editDetailBtn">Edit</button>
          <button id="duplicateDetailBtn">Duplicate</button>
          <button id="deleteDetailBtn" class="danger">Delete</button>
        </div>
      </div>
      <p class="detail-context">
        ${entry.company ? escapeHtml(entry.company) : "No company"}
        ${entry.role ? ` · ${escapeHtml(entry.role)}` : ""}
        · ${escapeHtml(statusLabel(entry.status))}
      </p>
      <div class="tags-row">
        ${(entry.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${starSection("S", "Situation", entry.situation, "letter-s")}
      ${starSection("T", "Task", entry.task, "letter-t")}
      ${starSection("A", "Action", entry.action, "letter-a")}
      ${starSection("R", "Result", entry.result, "letter-r")}
      ${entry.notes ? `<div class="notes-box"><strong>Additional notes</strong><br><br>${escapeHtml(entry.notes)}</div>` : ""}
      <div class="timestamps">Created ${formatDate(entry.createdAt)} · Updated ${formatDate(entry.updatedAt)}</div>
    </div>`;

  $("editDetailBtn").onclick = () => openEntryDialog(entry);
  $("deleteDetailBtn").onclick = () => deleteEntry(entry.id);
  $("duplicateDetailBtn").onclick = () => duplicateEntry(entry);
  $("favouriteDetailBtn").onclick = () => {
    entry.favourite = !entry.favourite;
    entry.updatedAt = new Date().toISOString();
    persist();
    render();
  };
}

function renderSummary() {
  $("totalEntries").textContent = entries.length;
  $("readyEntries").textContent = entries.filter(e => e.status === "ready").length;
  $("categoryCount").textContent = new Set(entries.map(e => e.category).filter(Boolean)).size;
}

function populateCategorySelect(selected = "") {
  $("category").innerHTML = categories.map(c => `<option value="${escapeHtml(c)}" ${c === selected ? "selected" : ""}>${escapeHtml(c)}</option>`).join("");
}

function openEntryDialog(entry = null) {
  editingId = entry?.id || null;
  $("modalTitle").textContent = entry ? "Edit interview entry" : "New interview entry";
  populateCategorySelect(entry?.category || categories[0]);

  const fields = ["question","company","role","situation","task","action","result","notes"];
  fields.forEach(field => $(field).value = entry?.[field] || "");
  $("status").value = entry?.status || "draft";
  $("tags").value = (entry?.tags || []).join(", ");
  $("favourite").checked = Boolean(entry?.favourite);
  $("entryDialog").showModal();
  setTimeout(() => $("question").focus(), 50);
}

function closeEntryDialog() {
  $("entryDialog").close();
  editingId = null;
}

function saveEntry(event) {
  event.preventDefault();
  const now = new Date().toISOString();
  const existing = entries.find(e => e.id === editingId);

  const entry = {
    id: existing?.id || crypto.randomUUID(),
    question: $("question").value.trim(),
    category: $("category").value,
    status: $("status").value,
    company: $("company").value.trim(),
    role: $("role").value.trim(),
    tags: $("tags").value.split(",").map(t => t.trim()).filter(Boolean),
    situation: $("situation").value.trim(),
    task: $("task").value.trim(),
    action: $("action").value.trim(),
    result: $("result").value.trim(),
    notes: $("notes").value.trim(),
    favourite: $("favourite").checked,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  if (!entry.question) return;

  if (existing) {
    entries = entries.map(e => e.id === existing.id ? entry : e);
    showToast("Interview entry updated");
  } else {
    entries.unshift(entry);
    showToast("Interview entry created");
  }

  selectedId = entry.id;
  persist();
  closeEntryDialog();
  render();
}

function deleteEntry(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry || !confirm(`Delete "${entry.question}"? This cannot be undone unless you have exported a backup.`)) return;
  entries = entries.filter(e => e.id !== id);
  selectedId = entries[0]?.id || null;
  persist();
  render();
  showToast("Entry deleted");
}

function duplicateEntry(entry) {
  const copy = {
    ...entry,
    id: crypto.randomUUID(),
    question: `${entry.question} (Copy)`,
    favourite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  entries.unshift(copy);
  selectedId = copy.id;
  persist();
  render();
  showToast("Entry duplicated");
}

function clearFilters() {
  activeFilter = "all";
  activeCategory = null;
  $("searchInput").value = "";
  $("pageTitle").textContent = "All interview entries";
  $("pageSubtitle").textContent = "Build a reusable library of structured STAR responses.";
  render();
}

function exportJson() {
  const payload = {
    application: "STAR Interview Repository",
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    entries
  };
  downloadFile(`star-interview-repository-${dateStamp()}.json`, JSON.stringify(payload, null, 2), "application/json");
  showToast("JSON export created");
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = ["id","question","category","status","company","role","tags","situation","task","action","result","notes","favourite","createdAt","updatedAt"];
  const rows = entries.map(entry => headers.map(header => csvEscape(entry[header])).join(","));
  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  downloadFile(`star-interview-repository-${dateStamp()}.csv`, csv, "text/csv;charset=utf-8");
  showToast("CSV export created");
}

function dateStamp() {
  return new Date().toISOString().slice(0,10);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"'; i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field); field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(field); field = "";
      if (row.some(cell => cell !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift().map(h => h.replace(/^\uFEFF/, "").trim());
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
}

async function handleImport(file) {
  if (!file) return;
  try {
    const text = await file.text();
    let importedEntries = [];
    let importedCategories = [];

    if (file.name.toLowerCase().endsWith(".json")) {
      const data = JSON.parse(text);
      importedEntries = Array.isArray(data) ? data : data.entries;
      importedCategories = data.categories || [];
    } else {
      importedEntries = parseCsv(text).map(row => ({
        ...row,
        tags: String(row.tags || "").split("|").map(t => t.trim()).filter(Boolean),
        favourite: String(row.favourite).toLowerCase() === "true"
      }));
    }

    if (!Array.isArray(importedEntries)) throw new Error("No entries array found.");

    const now = new Date().toISOString();
    importedEntries = importedEntries
      .filter(e => e && e.question)
      .map(e => ({
        id: e.id || crypto.randomUUID(),
        question: String(e.question || ""),
        category: String(e.category || "General / Motivation"),
        status: ["draft","developing","ready"].includes(e.status) ? e.status : "draft",
        company: String(e.company || ""),
        role: String(e.role || ""),
        tags: Array.isArray(e.tags) ? e.tags : String(e.tags || "").split(/[|,]/).map(t => t.trim()).filter(Boolean),
        situation: String(e.situation || ""),
        task: String(e.task || ""),
        action: String(e.action || ""),
        result: String(e.result || ""),
        notes: String(e.notes || ""),
        favourite: e.favourite === true || String(e.favourite).toLowerCase() === "true",
        createdAt: e.createdAt || now,
        updatedAt: e.updatedAt || now
      }));

    const replace = confirm(`Import ${importedEntries.length} entries?\n\nChoose OK to replace the current repository, or Cancel to merge them with the existing entries.`);
    if (replace) {
      entries = importedEntries;
    } else {
      const currentIds = new Set(entries.map(e => e.id));
      entries = [...importedEntries.map(e => currentIds.has(e.id) ? {...e, id: crypto.randomUUID()} : e), ...entries];
    }

    categories = [...new Set([...categories, ...importedCategories, ...importedEntries.map(e => e.category).filter(Boolean)])];
    selectedId = entries[0]?.id || null;
    persist();
    render();
    showToast(`${importedEntries.length} entries imported`);
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  } finally {
    $("fileInput").value = "";
  }
}

function renderCategoryManager() {
  $("categoryManagerList").innerHTML = categories.map((category, index) => `
    <div class="category-manager-row">
      <input data-index="${index}" value="${escapeHtml(category)}" />
      <button type="button" data-delete-index="${index}" title="Delete category">✕</button>
    </div>
  `).join("");

  document.querySelectorAll("#categoryManagerList input").forEach(input => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.index);
      const oldName = categories[index];
      const newName = input.value.trim();
      if (!newName) return renderCategoryManager();
      categories[index] = newName;
      entries.forEach(entry => {
        if (entry.category === oldName) entry.category = newName;
      });
      persist();
      render();
    });
  });

  document.querySelectorAll("[data-delete-index]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.deleteIndex);
      const name = categories[index];
      if (entries.some(e => e.category === name)) {
        alert("This category is being used. Move or edit those entries before deleting it.");
        return;
      }
      categories.splice(index, 1);
      persist();
      renderCategoryManager();
      render();
    });
  });
}

function addCategory() {
  const value = $("newCategoryInput").value.trim();
  if (!value || categories.includes(value)) return;
  categories.push(value);
  $("newCategoryInput").value = "";
  persist();
  renderCategoryManager();
  render();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".nav-item[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter;
    activeCategory = null;
    $("pageTitle").textContent = btn.textContent.replace(/\d+$/, "").trim();
    $("pageSubtitle").textContent = activeFilter === "all"
      ? "Build a reusable library of structured STAR responses."
      : `Filtered interview responses: ${activeFilter}.`;
    render();
  });
});

$("newEntryBtn").onclick = () => openEntryDialog();
$("emptyNewBtn").onclick = () => openEntryDialog();
$("entryForm").addEventListener("submit", saveEntry);
$("closeModalBtn").onclick = closeEntryDialog;
$("cancelBtn").onclick = closeEntryDialog;
$("searchInput").addEventListener("input", renderList);
$("sortSelect").addEventListener("change", renderList);
$("clearFiltersBtn").onclick = clearFilters;
$("exportJsonBtn").onclick = exportJson;
$("exportCsvBtn").onclick = exportCsv;
$("importBtn").onclick = () => $("fileInput").click();
$("fileInput").addEventListener("change", e => handleImport(e.target.files[0]));

$("manageCategoriesBtn").onclick = () => {
  renderCategoryManager();
  $("categoryDialog").showModal();
};
$("closeCategoryBtn").onclick = () => $("categoryDialog").close();
$("doneCategoriesBtn").onclick = () => $("categoryDialog").close();
$("addCategoryBtn").onclick = addCategory;
$("newCategoryInput").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); addCategory(); }
});

$("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
};

if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
persist();
render();
