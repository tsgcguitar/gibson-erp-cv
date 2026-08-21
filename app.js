(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const configured = cfg.supabaseUrl && !cfg.supabaseUrl.includes('YOUR_PROJECT') &&
    cfg.supabasePublishableKey && !cfg.supabasePublishableKey.includes('xxxxxxxx');

  document.getElementById('year').textContent = new Date().getFullYear();

  const demo = {
    articles: [
      {
        id: 'demo-a1',
        slug: 'sap-procurement-process',
        title: 'SAP Procurement Process Explained',
        summary: '從 PR、PO、收貨到 MIRO，把採購流程用商業情境講清楚。',
        category: 'SAP MM',
        content: `# SAP Procurement Process

## Business Scenario
部門需要向供應商購買材料或服務。

## Process Flow
PR → PO → Goods Receipt → Invoice Verification → Payment

## Key Transactions
- ME51N
- ME21N
- MIGO
- MIRO

## Summary
真正重要的不是背 T-Code，而是知道採購、倉庫、財務之間的資料怎麼串起來。`,
        cover_image: null
      },
      {
        id: 'demo-a2',
        slug: 'sap-intercompany-sales',
        title: 'SAP Intercompany Sales Process',
        summary: '一家公司接客戶訂單，另一家公司出貨時，SAP 怎麼處理？',
        category: 'SAP SD',
        content: `# SAP Intercompany Sales

## Business Scenario
Company A 接單，但庫存在 Company B，由 Company B 出貨。

## Typical Flow
Sales Order → Delivery → PGI → Customer Billing → Intercompany Billing

## Key Point
要先分清楚誰對客戶銷售、誰出貨、公司間如何開立內部帳務。`,
        cover_image: null
      }
    ],
    projects: [
      {
        id: 'demo-p1',
        slug: 'po-confirmation-integration',
        title: 'PO Confirmation Integration',
        summary: '把外部 PO confirmation 資料整合回 SAP。',
        content: `# PO Confirmation Integration

## Problem
外部系統送來的 confirmation 需要穩定更新到 SAP。

## Analysis
需要處理輸入驗證、confirmation control、更新與 log。

## Solution
建立結構化整合流程與錯誤追蹤。

## Result
使用者可以更容易確認資料是否成功更新，也更容易查問題。`,
        image_url: null
      },
      {
        id: 'demo-p2',
        slug: 'report-performance',
        title: 'SAP Report Performance Optimization',
        summary: '找出重複 DB access，降低報表不必要的查詢。',
        content: `# SAP Report Performance Optimization

## Problem
報表執行時間不穩定。

## Analysis
在 material / plant loop 中發現重複 DB access。

## Solution
把可重用的資料讀取移出 inner loop。

## Result
降低 DB time，並讓效能問題更容易量測與說明。`,
        image_url: null
      }
    ],
    certifications: [
      { id: 'demo-c1', name: 'SAP Certified Associate — Sourcing and Procurement', issuer: 'SAP', issue_date: '', image_url: null, credential_url: null },
      { id: 'demo-c2', name: 'SAP Certified Associate — Sales', issuer: 'SAP', issue_date: '', image_url: null, credential_url: null }
    ],
    resume: `# Frank Hsieh

**SAP MM / SD · ERP · Business Systems**

## Core Skills
- SAP MM
- SAP SD
- ERP / Business Systems
- Requirement Analysis
- UAT / Production Support
- Process Documentation

## About
這是 Demo 履歷。設定 Supabase 後，可以直接到 **Admin** 頁面修改。`
  };

  const defaultHome = {
    siteName: 'Frank Hsieh',
    eyebrow: 'SAP · ERP · BUSINESS SYSTEMS',
    title: '把商業流程，變成真正能運作的系統。',
    copy: 'SAP MM / SD、ERP 專案、流程說明、問題分析、系統整合與專業證照作品集。',
    focusTitle: 'Focus Areas',
    focusAreas: ['SAP MM', 'SAP SD', 'Procurement', 'Order-to-Cash', 'Integration', 'Support', 'UAT', 'Process Design', 'Performance'],
    buttons: [
      { label: '看 SAP 文章', href: '#articles', primary: true },
      { label: '看履歷', href: '#resume' },
      { label: '看專案', href: '#projects' },
      { label: '看證照', href: '#certifications' }
    ]
  };

  function applyHome(home) {
    const data = { ...defaultHome, ...(home || {}) };
    const focusAreas = Array.isArray(data.focusAreas) ? data.focusAreas : defaultHome.focusAreas;
    const buttons = Array.isArray(data.buttons) ? data.buttons : defaultHome.buttons;

    const siteName = data.siteName || defaultHome.siteName;
    document.getElementById('site-brand').textContent = siteName;
    document.getElementById('footer-brand').textContent = siteName;
    document.title = `${siteName} | SAP & ERP Portfolio`;

    document.getElementById('home-eyebrow').textContent = data.eyebrow || '';
    document.getElementById('home-title').textContent = data.title || '';
    document.getElementById('home-copy').textContent = data.copy || '';
    document.getElementById('home-focus-title').textContent = data.focusTitle || '';

    document.getElementById('home-focus-areas').innerHTML = focusAreas
      .filter(Boolean)
      .map(item => `<span class="focus-filter-chip" data-focus="${escapeHtml(item)}" role="button" tabindex="0" title="查看 ${escapeHtml(item)} 相關文章" style="cursor:pointer">${escapeHtml(item)}</span>`)
      .join('');

    for (let i = 0; i < 4; i++) {
      const el = document.getElementById(`home-btn-${i + 1}`);
      const btn = buttons[i] || {};
      if (!btn.label) {
        el.classList.add('hidden');
        continue;
      }
      el.classList.remove('hidden');
      el.textContent = btn.label;
      el.href = btn.href || '#';
      el.classList.toggle('primary', !!btn.primary);
      el.classList.toggle('secondary', !btn.primary);
    }
  }

  function md(text) {
    return DOMPurify.sanitize(marked.parse(text || '', { breaks: true }));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function articleCard(a) {
    return `
      <button class="card article-card-btn" data-slug="${escapeHtml(a.slug)}">
        ${a.cover_image ? `<img class="card-image" src="${escapeHtml(a.cover_image)}" alt="">` : ''}
        <span class="pill">${escapeHtml(a.category)}</span>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.summary)}</p>
        <span class="text-link">Read article →</span>
      </button>`;
  }


  let activeArticleFilter = '';

  function normalizeText(value) {
    return String(value ?? '')
      .toLowerCase()
      .replace(/[–—_]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function articleMatchesFocus(article, focus) {
    const target = normalizeText(focus);
    if (!target) return true;

    const category = normalizeText(article.category);
    if (category === target) return true;

    // Fallback: even when the article category is "SAP MM",
    // a Focus Area such as "Procurement" can still match article text.
    const haystack = normalizeText([
      article.category,
      article.title,
      article.summary,
      article.content
    ].filter(Boolean).join(' '));

    return haystack.includes(target);
  }

  function ensureArticleFilterStatus() {
    let bar = document.getElementById('article-filter-status');
    if (bar) return bar;

    bar = document.createElement('div');
    bar.id = 'article-filter-status';
    bar.style.display = 'none';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'space-between';
    bar.style.gap = '12px';
    bar.style.margin = '0 0 22px';
    bar.style.padding = '12px 16px';
    bar.style.border = '1px solid rgba(148, 163, 184, .22)';
    bar.style.borderRadius = '14px';

    bar.innerHTML = `
      <span id="article-filter-label"></span>
      <button id="clear-article-filter" type="button" class="button secondary" style="padding:8px 14px">顯示全部</button>
    `;

    const grid = document.getElementById('article-grid');
    grid.parentNode.insertBefore(bar, grid);

    document.getElementById('clear-article-filter').addEventListener('click', () => {
      renderArticleList('');
    });

    return bar;
  }

  function updateFocusChipState(filter) {
    document.querySelectorAll('.focus-filter-chip').forEach(chip => {
      const active = !!filter && normalizeText(chip.dataset.focus) === normalizeText(filter);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      chip.style.opacity = active ? '1' : '';
      chip.style.transform = active ? 'translateY(-1px)' : '';
      chip.style.boxShadow = active ? '0 0 0 2px rgba(100, 220, 205, .35)' : '';
    });
  }

  function renderArticleList(filter = '') {
    activeArticleFilter = filter;
    const matched = filter
      ? articles.filter(article => articleMatchesFocus(article, filter))
      : articles;

    document.getElementById('article-grid').innerHTML = matched.length
      ? matched.map(articleCard).join('')
      : `<div class="empty-state">目前沒有「${escapeHtml(filter)}」相關文章。</div>`;

    wireArticleButtons();
    updateFocusChipState(filter);

    const bar = ensureArticleFilterStatus();
    if (filter) {
      bar.style.display = 'flex';
      document.getElementById('article-filter-label').innerHTML =
        `文章篩選：<strong>${escapeHtml(filter)}</strong> · ${matched.length} 篇`;
    } else {
      bar.style.display = 'none';
    }
  }

  function wireFocusAreaFilters() {
    document.querySelectorAll('.focus-filter-chip').forEach(chip => {
      const run = () => {
        const focus = chip.dataset.focus || '';
        // Clicking the currently active chip again returns to all articles.
        renderArticleList(normalizeText(activeArticleFilter) === normalizeText(focus) ? '' : focus);
        document.getElementById('articles').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      chip.addEventListener('click', run);
      chip.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          run();
        }
      });
    });
  }

  function projectCard(p) {
    return `
      <article class="project-card" id="${escapeHtml(p.slug)}">
        ${p.image_url ? `<img class="project-image" src="${escapeHtml(p.image_url)}" alt="">` : `<div class="project-image project-placeholder">PROJECT</div>`}
        <div>
          <h2>${escapeHtml(p.title)}</h2>
          <p class="muted">${escapeHtml(p.summary)}</p>
          <div class="markdown">${md(p.content)}</div>
          ${p.project_url ? `
            <div style="margin-top:18px">
              <a class="button primary"
                 href="${escapeHtml(p.project_url)}"
                 target="_blank"
                 rel="noopener noreferrer">
                查看專案網站 →
              </a>
            </div>
          ` : ''}
        </div>
      </article>`;
  }

  function certCard(c) {
    return `
      <article class="cert-card">
        <div class="cert-image-wrap">
          ${c.image_url ? `<img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.name)}">` : `<div class="cert-placeholder">CERTIFICATE</div>`}
        </div>
        <div class="cert-body">
          <h2>${escapeHtml(c.name)}</h2>
          <p>${escapeHtml(c.issuer)}</p>
          ${c.issue_date ? `<p class="muted">Issued ${escapeHtml(c.issue_date)}</p>` : ''}
          ${c.credential_url ? `<a class="text-link" href="${escapeHtml(c.credential_url)}" target="_blank" rel="noopener">View credential →</a>` : ''}
        </div>
      </article>`;
  }

  let articles = [];

  function wireArticleButtons() {
    document.querySelectorAll('.article-card-btn').forEach(btn => {
      btn.addEventListener('click', () => openArticle(btn.dataset.slug));
    });
  }

  function openArticle(slug) {
    const article = articles.find(a => a.slug === slug);
    if (!article) return;
    const detail = document.getElementById('article-detail');
    document.getElementById('article-detail-content').innerHTML = `
      <div class="eyebrow">${escapeHtml(article.category)}</div>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <p class="article-summary">${escapeHtml(article.summary)}</p>
      ${article.cover_image ? `<img class="article-cover" src="${escapeHtml(article.cover_image)}" alt="">` : ''}
      <div class="markdown">${md(article.content)}</div>`;
    detail.classList.remove('hidden');
    document.body.classList.add('article-open');
    history.replaceState(null, '', `#article/${encodeURIComponent(slug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeArticle() {
    document.getElementById('article-detail').classList.add('hidden');
    document.body.classList.remove('article-open');
    history.replaceState(null, '', '#articles');
    document.getElementById('articles').scrollIntoView();
  }

  document.getElementById('close-article').addEventListener('click', closeArticle);

  async function load() {
    let projects = demo.projects;
    let certifications = demo.certifications;
    let resume = demo.resume;
    let home = defaultHome;
    articles = demo.articles;

    if (configured) {
      const client = supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
      const [a, p, c, r, h] = await Promise.all([
        client.from('articles').select('*').eq('published', true).order('created_at', { ascending: false }),
        client.from('projects').select('*').eq('published', true).order('created_at', { ascending: false }),
        client.from('certifications').select('*').eq('published', true).order('sort_order'),
        client.from('pages').select('*').eq('slug', 'resume').maybeSingle(),
        client.from('pages').select('*').eq('slug', 'home').maybeSingle()
      ]);

      if (!a.error) articles = a.data || [];
      if (!p.error) projects = p.data || [];
      if (!c.error) certifications = c.data || [];
      if (!r.error && r.data) resume = r.data.content;
      if (!h.error && h.data?.content) {
        try { home = { ...defaultHome, ...JSON.parse(h.data.content) }; }
        catch (err) { console.warn('Invalid home page data, using defaults.', err); }
      }
    }

    applyHome(home);

    renderArticleList('');
    wireFocusAreaFilters();
    document.getElementById('project-list').innerHTML = projects.length
      ? projects.map(projectCard).join('')
      : '<div class="empty-state">還沒有公開專案。</div>';
    document.getElementById('cert-grid').innerHTML = certifications.length
      ? certifications.map(certCard).join('')
      : '<div class="empty-state">還沒有公開證照。</div>';
    document.getElementById('resume-content').innerHTML = md(resume);

    const match = location.hash.match(/^#article\/(.+)$/);
    if (match) openArticle(decodeURIComponent(match[1]));
  }

  load().catch(err => {
    console.error(err);
    document.getElementById('article-grid').innerHTML = '<div class="notice">讀取資料失敗，請檢查 config.js 與 Supabase。</div>';
  });
})();

/* =========================================================
   CYBER HERO EFFECTS
   Gibson Hsieh SAP / ERP Portfolio
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const hero = document.querySelector(".cyber-hero");

  if (!hero) return;


  /* =====================================================
     1. Mouse Follow Light
  ===================================================== */

  hero.addEventListener("pointermove", (event) => {

    const rect = hero.getBoundingClientRect();

    if (!rect.width || !rect.height) return;


    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;


    hero.style.setProperty(
      "--mx",
      `${Math.max(0, Math.min(100, x))}%`
    );

    hero.style.setProperty(
      "--my",
      `${Math.max(0, Math.min(100, y))}%`
    );

  });


  hero.addEventListener("pointerleave", () => {

    hero.style.setProperty(
      "--mx",
      "50%"
    );

    hero.style.setProperty(
      "--my",
      "50%"
    );

  });



  /* =====================================================
     2. Reduced Motion
  ===================================================== */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;



  /* =====================================================
     3. Particle Generator
  ===================================================== */

  const particleLayer =
    hero.querySelector(".hero-particles");


  if (
    particleLayer &&
    !reducedMotion
  ) {

    particleLayer.innerHTML = "";


    const particleCount =
      window.innerWidth <= 650
        ? 18
        : 34;


    for (
      let i = 0;
      i < particleCount;
      i++
    ) {

      const particle =
        document.createElement("span");


      particle.className =
        "hero-particle";


      const size =
        Math.random() * 3 + 1;


      const hue =
        175 + Math.random() * 155;


      particle.style.setProperty(
        "--x",
        `${Math.random() * 100}%`
      );


      particle.style.setProperty(
        "--y",
        `${Math.random() * 100}%`
      );


      particle.style.setProperty(
        "--size",
        `${size}px`
      );


      particle.style.setProperty(
        "--hue",
        hue
      );


      particle.style.setProperty(
        "--duration",
        `${5 + Math.random() * 8}s`
      );


      particle.style.setProperty(
        "--delay",
        `${Math.random() * -10}s`
      );


      particleLayer.appendChild(
        particle
      );

    }

  }



  /* =====================================================
     4. Digital Decode Title
  ===================================================== */

  function runTitleDecode() {

    const title =
      document.getElementById(
        "home-title"
      );


    if (
      !title ||
      reducedMotion
    ) {
      return;
    }


    const originalText =
      title.textContent.trim();


    if (!originalText) return;


    const characters =
      "01<>[]{}#*+/|░▒▓◇◆";


    const totalFrames =
      26;


    let frame =
      0;


    const timer =
      window.setInterval(() => {

        const progress =
          frame / totalFrames;


        title.textContent =
          [...originalText]
            .map(
              (
                character,
                index
              ) => {

                if (
                  character === " " ||
                  character === "，" ||
                  character === "。" ||
                  character === "/" ||
                  character === "、" ||
                  character === "·"
                ) {

                  return character;

                }


                const revealPoint =
                  index /
                  originalText.length;


                if (
                  revealPoint <
                  progress
                ) {

                  return character;

                }


                if (
                  Math.random() >
                  0.5
                ) {

                  return characters[
                    Math.floor(
                      Math.random() *
                      characters.length
                    )
                  ];

                }


                return character;

              }
            )
            .join("");


        frame++;


        if (
          frame >
          totalFrames
        ) {

          window.clearInterval(
            timer
          );


          title.textContent =
            originalText;

        }

      }, 42);

  }



  /* 等原本 Supabase / Home 資料載入後再跑 */

  window.setTimeout(
    runTitleDecode,
    700
  );



  /* =====================================================
     5. HUD 3D Mouse Tilt
  ===================================================== */

  const panel =
    hero.querySelector(
      ".hud-panel"
    );


  if (
    panel &&
    !reducedMotion &&
    window.matchMedia(
      "(pointer:fine)"
    ).matches
  ) {

    panel.addEventListener(
      "pointermove",
      (event) => {

        const rect =
          panel.getBoundingClientRect();


        const px =
          (event.clientX -
            rect.left) /
            rect.width -
          0.5;


        const py =
          (event.clientY -
            rect.top) /
            rect.height -
          0.5;


        const rotateX =
          -py * 3.5;


        const rotateY =
          px * 4.5;


        panel.style.transform =
          `
          perspective(900px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-4px)
          `;

      }
    );


    panel.addEventListener(
      "pointerleave",
      () => {

        panel.style.transform =
          "";

      }
    );

  }



  /* =====================================================
     6. Restore Cyber Arrow On Main Button
  ===================================================== */

  window.setTimeout(() => {

    const button =
      document.getElementById(
        "home-btn-1"
      );


    if (
      button &&
      !button.querySelector(
        ".button-arrow"
      )
    ) {

      const label =
        button.textContent.trim();


      button.innerHTML =
        `
        <span>${label}</span>
        <span class="button-arrow">↗</span>
        `;

    }

  }, 1000);



  /* =====================================================
     7. Skill Chips Stagger Animation
  ===================================================== */

  window.setTimeout(() => {

    const chips =
      document.querySelectorAll(
        ".hud-skills span"
      );


    chips.forEach(
      (
        chip,
        index
      ) => {

        chip.style.opacity =
          "0";


        chip.style.transform =
          "translateY(12px)";


        chip.style.transition =
          `
          opacity .45s ease,
          transform .45s ease,
          border-color .25s ease,
          box-shadow .25s ease
          `;


        window.setTimeout(
          () => {

            chip.style.opacity =
              "1";


            chip.style.transform =
              "translateY(0)";

          },
          600 +
          index * 70
        );

      }
    );

  }, 200);



  /* =====================================================
     8. HUD Boot Effect
  ===================================================== */

  const core =
    hero.querySelector(
      ".hud-core"
    );


  if (
    core &&
    !reducedMotion
  ) {

    core.style.opacity =
      "0";


    core.style.transform =
      "scale(.72)";


    core.style.transition =
      `
      opacity .8s ease,
      transform .9s
      cubic-bezier(.2,.8,.2,1)
      `;


    window.setTimeout(
      () => {

        core.style.opacity =
          "1";


        core.style.transform =
          "scale(1)";

      },
      450
    );

  }

});
