/* Shared header/footer + small page behaviours.
   Header and footer live here so the nav is edited in one place. */

const NAV = [
  ["research.html", "Research"],
  ["people.html", "People"],
  ["news.html", "News & Fun"],
  ["publications.html", "Publications"],
  ["structures.html", "Structures"],
  ["software.html", "Software"],
  ["join.html", "Join us"],
  ["contact.html", "Contact"],
];

(function layout() {
  const here = location.pathname.split("/").pop() || "index.html";

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="container">
      <a class="brand" href="index.html">
        <span class="brand-mark">K</span>
        <span>Klumpe Lab<small>IMP · IMBA · Vienna BioCenter</small></span>
      </a>
      <nav class="nav" id="site-nav">
        ${NAV.map(([href, label]) =>
          `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`
        ).join("")}
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Switch between light and dark mode">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
      </div>
    </div>`;
  document.body.prepend(header);

  // Light/dark switch: starts from the system setting, then remembers the visitor's choice
  // for every page of the site.
  const themeBtn = header.querySelector(".theme-toggle");
  const saved = () => { try { const t = localStorage.getItem("theme"); return t === "light" || t === "dark" ? t : null; } catch (e) { return null; } };
  const applySaved = () => {
    const t = saved();
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    label();
  };
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const label = () => themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  applySaved();                                          // fallback if a cached page lacks the early <head> script
  addEventListener("pageshow", applySaved);              // pages restored with the Back/Forward buttons
  addEventListener("storage", (e) => { if (e.key === "theme") applySaved(); });  // other open tabs
  themeBtn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    label();
  });

  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <span>© ${new Date().getFullYear()} Klumpe Lab · IMP & IMBA, Vienna BioCenter</span>
      <span><a href="contact.html">Contact</a> · <a href="join.html">Join us</a> · <a href="https://www.imp.ac.at" rel="noopener">imp.ac.at</a></span>
    </div>`;
  document.body.append(footer);
})();

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const initials = (name) => { const p = name.trim().split(/\s+/); return p[0][0] + (p.length > 1 ? p[p.length - 1][0] : ""); };
// "2026-05-30" → "30 May 2026"; month-only "2026-05" → "May 2026".
const fmtDate = (iso) => new Date(iso.length === 7 ? iso + "-01" : iso).toLocaleDateString("en-GB",
  iso.length === 7 ? { month: "short", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" });

/* ---------- Publications ---------- */
// Short label for the placeholder tile of papers without an image.
const PUB_LABELS = {
  "Nature Communications": "Nat Commun", "Nature Methods": "Nat Methods", "Journal of Structural Biology": "JSB",
  "Current Opinion in Structural Biology": "COSB", "Biochemical Society Transactions": "Biochem Soc Trans",
  "Plant Physiology": "Plant Physiol", "Biochemical and Biophysical Research Communications": "BBRC",
  "Computational and Structural Biotechnology Journal": "CSBJ", "Microscopy Today": "Microsc Today",
  "Ultramicroscopy": "Ultra­micro­scopy",
};
const pubLabel = (p) => ({ thesis: "Thesis", patent: "Patent", chapter: "Book chapter" })[p.type]
  || PUB_LABELS[p.journal] || p.journal.replace(/\s*\d.*$/, "");
function renderPublications(target, { limit, search, filter } = {}) {
  let pubs = [...LAB.publications].sort((a, b) => b.year - a.year);
  const OTHER = ["chapter", "patent"];
  if (filter && filter !== "all") pubs = pubs.filter((p) => filter === "other" ? OTHER.includes(p.type) : p.type === filter);
  if (search) {
    const q = search.toLowerCase();
    pubs = pubs.filter((p) => [p.title, p.authors, p.journal].join(" ").toLowerCase().includes(q));
  }
  if (limit) pubs = pubs.slice(0, limit);

  if (!pubs.length) { target.innerHTML = `<p class="muted">No publications match.</p>`; return; }

  let html = "", lastYear = null;
  for (const p of pubs) {
    if (!limit && p.year !== lastYear) { html += `<div class="pub-year">${p.year}</div>`; lastYear = p.year; }
    const authors = esc(p.authors).replace(/Klumpe S[A-Z]*/g, (m) => `<span class="me">${m}</span>`);
    const links = Object.entries(p.links || {}).map(([k, v]) => `<a href="${esc(v)}">${esc(k)}</a>`).join("");
    const thumb = p.image
      ? `<img class="pub-thumb" src="${esc(p.image)}" alt="" loading="lazy">`
      : `<div class="pub-thumb pub-thumb-empty" aria-hidden="true">${esc(pubLabel(p))}</div>`;
    html += `
      <article class="pub">
        ${p.links?.DOI ? `<a class="pub-thumb-link" href="${esc(p.links.DOI)}" tabindex="-1" aria-hidden="true">${thumb}</a>` : thumb}
        <div class="pub-main">
          <div class="pub-title">${esc(p.title)}</div>
          <div class="pub-authors">${authors}</div>
          <div class="pub-venue">${esc(p.journal)}${limit ? ` · ${p.year}` : ""}${p.type !== "article" ? ` · <span class="tag">${esc(p.type)}</span>` : ""}</div>
          ${links ? `<div class="pub-links">${links}</div>` : ""}
        </div>
      </article>`;
  }
  target.innerHTML = html;
}

function initPublicationsPage() {
  const list = $("#pub-list");
  if (!list) return;
  const input = $("#pub-search");
  let filter = "all";
  const draw = () => renderPublications(list, { search: input.value, filter });
  input.addEventListener("input", draw);
  document.querySelectorAll("[data-pubfilter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      filter = btn.dataset.pubfilter;
      document.querySelectorAll("[data-pubfilter]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      draw();
    })
  );
  draw();
}

/* ---------- News ---------- */
function renderNews(target, { limit, kind } = {}) {
  let items = [...LAB.news].sort((a, b) => b.date.localeCompare(a.date));
  if (kind && kind !== "all") items = items.filter((n) => n.kind === kind);
  if (limit) items = items.slice(0, limit);
  if (!items.length) {
    target.innerHTML = `<p class="muted">${kind === "fun" ? "Lab life posts are coming soon — retreats, cakes and the occasional failed experiment." : "Nothing here yet."}</p>`;
    return;
  }

  if (limit) {
    target.innerHTML = items.map((n) => `
      <a class="card${n.image ? " has-thumb" : ""}" href="${esc(n.link || (n.id ? `news.html#${n.id}` : "news.html"))}">
        ${n.image ? `<img class="news-card-thumb" src="${esc(n.image)}" alt="" loading="lazy">` : ""}
        <div class="meta">${fmtDate(n.date)} · <span class="tag ${n.kind === "fun" ? "fun" : ""}">${n.kind}</span></div>
        <h3>${esc(n.title)}</h3>
        <p class="muted">${esc(n.text)}</p>
      </a>`).join("");
  } else {
    target.innerHTML = items.map((n) => `
      <article class="news-item"${n.id ? ` id="${esc(n.id)}"` : ""}>
        <div class="news-date">${fmtDate(n.date)}</div>
        <div class="news-body${n.image || n.portrait ? " has-thumb" : ""}">
          ${n.image ? `<img class="news-thumb" src="${esc(n.image)}" alt="${esc(n.imageAlt || "")}" loading="lazy">` : ""}
          ${n.portrait ? `<img class="news-thumb news-portrait" src="${esc(n.portrait)}" alt="" loading="lazy">` : ""}
          <div>
            <span class="tag ${n.kind === "fun" ? "fun" : ""}">${n.kind}</span>
            <h3 style="margin-top:.5rem">${esc(n.title)}</h3>
            <p>${linkLabs(esc(n.text))}</p>
            ${n.link ? `<a href="${esc(n.link)}">Read more →</a>` : ""}
            ${n.imageLarge ? `
            <details class="news-more"${location.hash === `#${n.id}` ? " open" : ""}>
              <summary>Read more</summary>
              ${n.more ? `<p>${esc(n.more)}</p>` : ""}
              <img class="zoomable" src="${esc(n.imageLarge)}" alt="${esc(n.imageAlt || "")}" loading="lazy" tabindex="0" role="button" aria-label="Show image full screen">
            </details>` : ""}
          </div>
        </div>
      </article>`).join("");
  }
}

function initNewsPage() {
  const list = $("#news-list");
  if (!list) return;
  const draw = (kind) => renderNews(list, { kind });
  document.querySelectorAll("[data-newsfilter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-newsfilter]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      draw(btn.dataset.newsfilter);
    })
  );
  draw("all");
}

/* ---------- People ---------- */
// Turns lab names listed in LAB.labLinks into links inside already-escaped text.
const linkLabs = (html) => Object.entries(LAB.labLinks || {}).reduce(
  (out, [name, url]) => out.split(esc(name)).join(`<a href="${esc(url)}" rel="noopener">${esc(name)}</a>`), html);

function initPeoplePage() {
  const grid = $("#people-grid");
  if (!grid) return;
  const surname = (p) => p.sortName || p.name.trim().split(/\s+/).pop();
  const sorted = [...LAB.people].sort((a, b) =>
    (b.lead ? 1 : 0) - (a.lead ? 1 : 0) || surname(a).localeCompare(surname(b)));
  const card = (p) => `
    <article class="card person">
      <div class="avatar${p.photo?.endsWith(".svg") ? " avatar-art" : ""}">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}">` : (p.sortName ? p.name[0] + p.sortName[0] : initials(p.name))}</div>
      <h3>${esc(p.name)}</h3>
      ${p.role ? `<div class="role">${esc(p.role)}</div>` : ""}
      ${p.bio ? `<p>${linkLabs(esc(p.bio))}</p>` : ""}
      ${p.links ? `<div class="pub-links">${Object.entries(p.links).map(([k, v]) => `<a href="${esc(v)}" rel="noopener">${esc(k)}</a>`).join("")}</div>` : ""}
    </article>`;
  grid.innerHTML = sorted.filter((p) => !p.honorary).map(card).join("");
  const honorary = sorted.filter((p) => p.honorary);
  const hGrid = $("#honorary-grid");
  if (hGrid) {
    if (honorary.length) hGrid.innerHTML = honorary.map(card).join("");
    else document.querySelector("#honorary-section")?.remove();
  }
  const alumni = $("#alumni");
  if (alumni) {
    const list = [...LAB.alumni].sort((a, b) => surname(a).localeCompare(surname(b)));
    if (list.length) alumni.innerHTML = list.map(card).join("");
    else document.querySelector("#alumni-section")?.remove();
  }
  const animals = $("#animals-grid");
  if (animals) {
    if (LAB.labAnimals?.length) animals.innerHTML = LAB.labAnimals.map(card).join("").replace(/<h3>([^<]+)<\/h3>/g, "<h3><em>$1</em></h3>");
    else document.querySelector("#animals-section")?.remove();
  }
}

/* ---------- Software ---------- */
function initSoftwarePage() {
  const grid = $("#software-grid");
  if (!grid) return;
  grid.innerHTML = LAB.software.map((s) => `
    <article class="card">
      <div class="sw-head">
        <div>
          <h3>${esc(s.name)}</h3>
          <div class="meta">${esc(s.status)}</div>
        </div>
        <div class="sw-icon">${esc(s.name.slice(0, 2))}</div>
      </div>
      <p>${esc(s.description)}</p>
      <div class="stack">${s.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="pub-links">${Object.entries(s.links).map(([k, v]) => `<a href="${esc(v)}">${esc(k)} →</a>`).join("")}</div>
    </article>`).join("");
}

/* ---------- Full-screen image viewer ---------- */
function initLightbox() {
  let box = null, lastFocus = null;
  const close = () => {
    if (!box) return;
    box.remove(); box = null;
    document.body.style.overflow = "";
    lastFocus?.focus();
  };
  const open = (img) => {
    lastFocus = img;
    box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", img.alt || "Image");
    box.innerHTML = `<img src="${esc(img.currentSrc || img.src)}" alt="${esc(img.alt)}">
      <button class="lightbox-close" aria-label="Close">×</button>`;
    box.addEventListener("click", close);
    document.body.append(box);
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close").focus();
  };
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img.zoomable");
    if (img) { e.preventDefault(); open(img); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    else if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("img.zoomable")) { e.preventDefault(); open(e.target); }
  });
}

/* ---------- Structure gallery ---------- */
function initStructures() {
  const grid = $("#structure-gallery");
  if (!grid) return;
  // Always list models first, then maps, then tomograms. Within each type: groups in
  // LAB.structureFirstGroups lead (in that order), groups in LAB.structureLastGroups
  // trail, everything else sits in between; newest first inside each of those.
  const KIND_ORDER = { Model: 0, Map: 1, Tomogram: 2 };
  const first = LAB.structureFirstGroups || [];
  const last = LAB.structureLastGroups || [];
  const rank = (g) => first.includes(g) ? first.indexOf(g) : last.includes(g) ? 1000 + last.indexOf(g) : 500;
  const S = [...LAB.structures].sort((a, b) =>
    (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) ||
    rank(a.group) - rank(b.group) ||
    b.released.localeCompare(a.released) || b.id.localeCompare(a.id));
  const image = (s) => {
    if (s.db === "PDB") { const l = s.id.toLowerCase(); return `https://cdn.rcsb.org/images/structures/${l.slice(1, 3)}/${l}/${l}_assembly-1.jpeg`; }
    return `https://ftp.ebi.ac.uk/pub/databases/emdb/structures/${s.id}/images/emd_${s.id.replace("EMD-", "")}.png`;
  };
  const page = (s) => s.db === "PDB" ? `https://www.rcsb.org/structure/${s.id}` : `https://www.ebi.ac.uk/emdb/${s.id}`;
  const state = { group: "all", kind: "all" };

  const draw = () => {
    const items = S.filter((s) => (state.group === "all" || s.group === state.group) && (state.kind === "all" || s.kind === state.kind));
    grid.innerHTML = items.length ? items.map((s) => `
      <article class="card structure">
        <a class="structure-img" href="${page(s)}" rel="noopener">
          <img src="${image(s)}" alt="${esc(s.title)}" loading="lazy">
          <span class="pdb-id">${s.db === "PDB" ? "PDB " : ""}${esc(s.id)}</span>
          <span class="kind-tag">${esc(s.kind)}</span>
        </a>
        <h3 title="${esc(s.title)}">${esc(s.title)}</h3>
        <div class="meta">${esc(s.method)}${s.resolution ? ` · ${s.resolution} Å` : ""}</div>
        <div class="pub-links">
          <a href="${page(s)}" rel="noopener">${s.db === "PDB" ? "RCSB" : "EMDB"}</a>
          ${s.emdb ? `<a href="https://www.ebi.ac.uk/emdb/${esc(s.emdb)}" rel="noopener">${esc(s.emdb)}</a>` : ""}
          <a href="${esc(s.doi)}" rel="noopener">${esc(s.paper)}</a>
        </div>
      </article>`).join("") : `<p class="muted">No entries match these filters.</p>`;
  };

  const chipRow = (el, key, values) => {
    el.innerHTML = ["all", ...values].map((v) => {
      const n = v === "all" ? S.length : S.filter((s) => s[key] === v).length;
      return `<button class="chip" data-v="${esc(v)}" aria-pressed="${v === "all"}">${v === "all" ? "All" : esc(v)} <span class="muted">${n}</span></button>`;
    }).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-v]");
      if (!b) return;
      el.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      state[key] = b.dataset.v;
      draw();
    });
  };
  const groups = LAB.structureGroups || [...new Set(S.map((s) => s.group))];
  chipRow($("#structure-filters"), "group", groups.filter((g) => S.some((s) => s.group === g)));
  chipRow($("#structure-kinds"), "kind", ["Model", "Map", "Tomogram"].filter((k) => S.some((s) => s.kind === k)));
  draw();
}

/* ---------- Sponsors ---------- */
function initSponsors() {
  document.querySelectorAll("[data-sponsors]").forEach((el) => {
    el.innerHTML = LAB.sponsors.map((s) => `
      <a class="sponsor" href="${esc(s.url)}" rel="noopener" title="${esc(s.name)}">
        <img src="${esc(s.logo)}" alt="${esc(s.name)}" loading="lazy">
      </a>`).join("");
  });
}

/* ---------- Home ---------- */
function initHome() {
  const n = $("#home-news");
  if (n) renderNews(n, { limit: 3 });
  const p = $("#home-pubs");
  if (p) renderPublications(p, { limit: 3 });
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initPublicationsPage();
  initNewsPage();
  initPeoplePage();
  initSoftwarePage();
  initSponsors();
  initLightbox();
  initStructures();
});
