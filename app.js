/* Fallbakit Usage Guide — interactions. No dependencies, no build step.
   - copy buttons on every code block
   - tabbed code (Python / Node / curl, runtimes, etc.)
   - sidebar scroll-spy
   - mobile sidebar drawer
   - reveal-on-scroll
   - tiny, safe syntax tinting (comments / strings / shell prompt) */

/* ---------- tiny syntax tint ---------- *
   Deliberately conservative: only tints whole-line comments, quoted strings,
   and a leading shell prompt. Regex-on-HTML is fragile, so we operate on the
   already-escaped textContent and never try to parse full grammar. */
function tint(codeEl) {
  const lang = (codeEl.className.match(/lang-(\w+)/) || [])[1] || '';
  const raw = codeEl.textContent;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const out = raw.split('\n').map(line => {
    // shell prompt
    let m = line.match(/^(\s*)([$#])(\s)/);
    let prefix = '';
    let rest = line;
    if ((lang === 'sh' || lang === 'bash' || lang === '') && m) {
      prefix = esc(m[1]) + '<span class="tok-prompt">' + m[2] + '</span>' + m[3];
      rest = line.slice(m[0].length);
    }
    // whole-line comment
    const cm = rest.match(/^(\s*)(#.*|\/\/.*)$/);
    if (cm && lang !== 'json') {
      return prefix + esc(cm[1]) + '<span class="tok-cmt">' + esc(cm[2]) + '</span>';
    }
    // strings + trailing comment — split on quotes, tint quoted spans
    let html = '';
    let i = 0;
    const s = rest;
    while (i < s.length) {
      const ch = s[i];
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < s.length && s[j] !== ch) { if (s[j] === '\\') j++; j++; }
        html += '<span class="tok-str">' + esc(s.slice(i, Math.min(j + 1, s.length))) + '</span>';
        i = j + 1;
      } else {
        // consume until next quote
        let j = i;
        while (j < s.length && s[j] !== '"' && s[j] !== "'") j++;
        html += esc(s.slice(i, j));
        i = j;
      }
    }
    return prefix + html;
  }).join('\n');
  codeEl.innerHTML = out;
}

/* ---------- copy buttons + code chrome ---------- */
function enhanceCode() {
  document.querySelectorAll('pre > code').forEach(code => {
    tint(code);
    const pre = code.parentElement;
    if (pre.dataset.enhanced) return;
    pre.dataset.enhanced = '1';

    const lang = (code.className.match(/lang-(\w+)/) || [])[1];
    const head = document.createElement('div');
    head.className = 'code-head';
    head.innerHTML =
      `<span class="lang">${lang ? labelFor(lang) : 'shell'}</span>` +
      `<button class="copy-btn" type="button" aria-label="Copy code">` +
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>` +
      `<span class="copy-label">Copy</span></button>`;
    pre.parentNode.insertBefore(head, pre);

    head.querySelector('.copy-btn').addEventListener('click', function () {
      const text = code.textContent;
      navigator.clipboard.writeText(text).then(() => {
        this.classList.add('copied');
        this.querySelector('.copy-label').textContent = 'Copied';
        setTimeout(() => { this.classList.remove('copied'); this.querySelector('.copy-label').textContent = 'Copy'; }, 1600);
      });
    });
  });
}
function labelFor(l) {
  return ({ sh: 'shell', bash: 'shell', py: 'python', python: 'python', js: 'javascript',
    ts: 'typescript', json: 'json', yaml: 'yaml', yml: 'yaml', ini: 'env', env: 'env',
    docker: 'dockerfile', http: 'http' }[l]) || l;
}

/* ---------- tabs ---------- */
function wireTabs() {
  document.querySelectorAll('.tabs').forEach(tabs => {
    const btns = tabs.querySelectorAll('.tab-btn');
    const panels = tabs.querySelectorAll('.tab-panel');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = tabs.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
    }));
  });
}

/* ---------- scroll-spy ---------- */
function wireSpy() {
  const links = Array.from(document.querySelectorAll('.side-link'));
  const map = {};
  links.forEach(a => { const id = a.getAttribute('href').slice(1); if (id) map[id] = a; });
  const sections = Array.from(document.querySelectorAll('section[id], .hero[id]'));
  if (!sections.length) return;

  let current = '';
  const setActive = id => {
    if (id === current) return;
    current = id;
    links.forEach(a => a.classList.remove('active'));
    if (map[id]) {
      map[id].classList.add('active');
      // keep active link in view within the sidebar
      const sb = document.querySelector('.sidebar');
      if (sb) {
        const r = map[id].getBoundingClientRect(), sr = sb.getBoundingClientRect();
        if (r.top < sr.top + 60 || r.bottom > sr.bottom - 20) map[id].scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const obs = new IntersectionObserver(entries => {
    // pick the entry nearest the top that is intersecting
    const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (vis[0]) setActive(vis[0].target.id);
  }, { rootMargin: `-${60 + 12}px 0px -65% 0px`, threshold: 0 });
  sections.forEach(s => obs.observe(s));
}

/* ---------- reveal-on-scroll ---------- */
function wireReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(el => obs.observe(el));
}

/* ---------- mobile drawer ---------- */
function wireDrawer() {
  const sb = document.querySelector('.sidebar');
  const scrim = document.querySelector('.scrim');
  const btn = document.querySelector('.menu-btn');
  const open = () => { sb.classList.add('open'); if (scrim) scrim.hidden = false; };
  const close = () => { sb.classList.remove('open'); if (scrim) scrim.hidden = true; };
  if (btn) btn.addEventListener('click', () => sb.classList.contains('open') ? close() : open());
  if (scrim) scrim.addEventListener('click', close);
  sb && sb.addEventListener('click', e => { if (e.target.closest('.side-link')) close(); });
}

document.addEventListener('DOMContentLoaded', () => {
  enhanceCode();
  wireTabs();
  wireSpy();
  wireReveal();
  wireDrawer();
  // stamp year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
