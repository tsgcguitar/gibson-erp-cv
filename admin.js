(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const configured = cfg.supabaseUrl && !cfg.supabaseUrl.includes('YOUR_PROJECT') &&
    cfg.supabasePublishableKey && !cfg.supabasePublishableKey.includes('xxxxxxxx');

  if (!configured) {
    document.getElementById('setup-warning').classList.remove('hidden');
    return;
  }

  const client = supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const $ = id => document.getElementById(id);

  const state = {
    articles: [],
    projects: [],
    certifications: []
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

  function getHomeFromForm() {
    return {
      siteName: $('home-site-name-editor').value.trim(),
      eyebrow: $('home-eyebrow-editor').value.trim(),
      title: $('home-title-editor').value.trim(),
      copy: $('home-copy-editor').value.trim(),
      focusTitle: $('home-focus-title-editor').value.trim(),
      focusAreas: $('home-focus-editor').value
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean),
      buttons: [
        { label: $('home-btn1-label').value.trim(), href: $('home-btn1-href').value.trim() || '#articles', primary: true },
        { label: $('home-btn2-label').value.trim(), href: $('home-btn2-href').value.trim() || '#resume' },
        { label: $('home-btn3-label').value.trim(), href: $('home-btn3-href').value.trim() || '#projects' },
        { label: $('home-btn4-label').value.trim(), href: $('home-btn4-href').value.trim() || '#certifications' }
      ]
    };
  }

  function fillHomeForm(home) {
    const data = { ...defaultHome, ...(home || {}) };
    const buttons = Array.isArray(data.buttons) ? data.buttons : defaultHome.buttons;

    $('home-site-name-editor').value = data.siteName || '';
    $('admin-site-brand').textContent = data.siteName || defaultHome.siteName;
    $('home-eyebrow-editor').value = data.eyebrow || '';
    $('home-title-editor').value = data.title || '';
    $('home-copy-editor').value = data.copy || '';
    $('home-focus-title-editor').value = data.focusTitle || '';
    $('home-focus-editor').value = (data.focusAreas || []).join('\n');

    for (let i = 0; i < 4; i++) {
      $('home-btn' + (i + 1) + '-label').value = buttons[i]?.label || '';
      $('home-btn' + (i + 1) + '-href').value = buttons[i]?.href || '';
    }
    renderHomePreview();
  }

  function renderHomePreview() {
    const data = getHomeFromForm();
    $('admin-site-brand').textContent = data.siteName || defaultHome.siteName;
    $('home-admin-preview-title').textContent = data.title || '首頁標題';
    $('home-admin-preview-copy').textContent = data.copy || '';
    $('home-admin-preview-focus').innerHTML = data.focusAreas
      .map(item => `<span>${escapeHtml(item)}</span>`)
      .join('');
  }

  function msg(text, kind = 'notice') {
    $('global-message').innerHTML = text ? `<div class="${kind}">${escapeHtml(text)}</div>` : '';
  }

  function loginMsg(text) {
    $('login-message').innerHTML = text ? `<div class="notice">${escapeHtml(text)}</div>` : '';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function md(text) {
    return DOMPurify.sanitize(marked.parse(text || '', { breaks: true }));
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async function isAdmin() {
    const { data, error } = await client.rpc('is_admin');
    return !error && data === true;
  }

  async function refreshSession() {
    const { data } = await client.auth.getUser();
    if (!data.user) return showLogin();
    if (!(await isAdmin())) {
      await client.auth.signOut();
      loginMsg('這個帳號不是 Admin。');
      return showLogin();
    }
    showAdmin();
    await loadAll();
  }

  function showLogin() {
    $('login-card').classList.remove('hidden');
    $('admin-area').classList.add('hidden');
  }

  function showAdmin() {
    $('login-card').classList.add('hidden');
    $('admin-area').classList.remove('hidden');
  }

  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    loginMsg('');
    const { error } = await client.auth.signInWithPassword({
      email: $('login-email').value.trim(),
      password: $('login-password').value
    });
    if (error) return loginMsg(error.message);
    await refreshSession();
  });

  $('logout-btn').addEventListener('click', async () => {
    await client.auth.signOut();
    showLogin();
  });

  document.querySelectorAll('.admin-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      $(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });

  async function loadAll() {
    const [a, p, c, r, h] = await Promise.all([
      client.from('articles').select('*').order('created_at', { ascending: false }),
      client.from('projects').select('*').order('created_at', { ascending: false }),
      client.from('certifications').select('*').order('sort_order'),
      client.from('pages').select('*').eq('slug', 'resume').maybeSingle(),
      client.from('pages').select('*').eq('slug', 'home').maybeSingle()
    ]);
    if (a.error || p.error || c.error) {
      msg((a.error || p.error || c.error).message);
      return;
    }
    state.articles = a.data || [];
    state.projects = p.data || [];
    state.certifications = c.data || [];
    renderLists();
    if (r.data) {
      $('resume-content-editor').value = r.data.content || '';
      renderResumePreview();
    }

    let home = defaultHome;
    if (h.data?.content) {
      try { home = { ...defaultHome, ...JSON.parse(h.data.content) }; }
      catch (err) { console.warn('Invalid home data, using defaults.', err); }
    }
    fillHomeForm(home);
  }

  function renderLists() {
    $('article-admin-list').innerHTML = state.articles.map(a => `
      <button data-id="${a.id}" class="admin-item">
        <strong>${escapeHtml(a.title)}</strong>
        <span>${a.published ? 'Published' : 'Draft'} · ${escapeHtml(a.category)}</span>
      </button>`).join('');
    $('project-admin-list').innerHTML = state.projects.map(p => `
      <button data-id="${p.id}" class="admin-item">
        <strong>${escapeHtml(p.title)}</strong><span>${p.published ? 'Published' : 'Draft'}</span>
      </button>`).join('');
    $('cert-admin-list').innerHTML = state.certifications.map(c => `
      <button data-id="${c.id}" class="admin-item">
        <strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.issuer)}</span>
      </button>`).join('');

    document.querySelectorAll('#article-admin-list .admin-item').forEach(btn => btn.addEventListener('click', () => editArticle(btn.dataset.id)));
    document.querySelectorAll('#project-admin-list .admin-item').forEach(btn => btn.addEventListener('click', () => editProject(btn.dataset.id)));
    document.querySelectorAll('#cert-admin-list .admin-item').forEach(btn => btn.addEventListener('click', () => editCert(btn.dataset.id)));
  }

  async function uploadImage(file, folder) {
    if (!file) throw new Error('沒有選擇圖片。');
    if (!file.type.startsWith('image/')) throw new Error('只能上傳圖片。');
    if (file.size > 5 * 1024 * 1024) throw new Error('圖片請控制在 5 MB 內。');

    const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
    const path = `${folder}/${crypto.randomUUID()}-${safe}`;
    const { error } = await client.storage.from('portfolio-media').upload(path, file, {
      upsert: false,
      contentType: file.type
    });
    if (error) throw error;
    return client.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
  }

  // Home
  [
    'home-site-name-editor',
    'home-eyebrow-editor', 'home-title-editor', 'home-copy-editor',
    'home-focus-title-editor', 'home-focus-editor',
    'home-btn1-label', 'home-btn1-href',
    'home-btn2-label', 'home-btn2-href',
    'home-btn3-label', 'home-btn3-href',
    'home-btn4-label', 'home-btn4-href'
  ].forEach(id => $(id).addEventListener('input', renderHomePreview));

  $('save-home').addEventListener('click', async () => {
    const home = getHomeFromForm();
    const { error } = await client.from('pages').upsert({
      slug: 'home',
      title: 'Home',
      content: JSON.stringify(home),
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    msg(error ? error.message : '首頁已儲存。重新整理公開網站就會看到新內容。');
  });

  // Articles
  function clearArticle() {
    $('article-id').value = '';
    $('article-title').value = '';
    $('article-slug').value = '';
    $('article-category').value = 'SAP MM';
    $('article-summary').value = '';
    $('article-cover').value = '';
    $('article-content').value = '';
    $('article-published').checked = true;
    $('article-featured').checked = false;
    $('delete-article').classList.add('hidden');
    renderArticlePreview();
  }

  function editArticle(id) {
    const a = state.articles.find(x => x.id === id);
    if (!a) return;
    $('article-id').value = a.id;
    $('article-title').value = a.title || '';
    $('article-slug').value = a.slug || '';
    $('article-category').value = a.category || '';
    $('article-summary').value = a.summary || '';
    $('article-cover').value = a.cover_image || '';
    $('article-content').value = a.content || '';
    $('article-published').checked = !!a.published;
    $('article-featured').checked = !!a.featured;
    $('delete-article').classList.remove('hidden');
    renderArticlePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderArticlePreview() {
    $('article-preview').innerHTML = md($('article-content').value || '*開始寫文章…*');
  }

  $('new-article').addEventListener('click', clearArticle);
  $('article-content').addEventListener('input', renderArticlePreview);
  $('article-title').addEventListener('input', () => {
    if (!$('article-id').value && !$('article-slug').dataset.touched) {
      $('article-slug').value = slugify($('article-title').value);
    }
  });
  $('article-slug').addEventListener('input', () => {
    $('article-slug').dataset.touched = '1';
    $('article-slug').value = slugify($('article-slug').value);
  });

  $('article-cover-file').addEventListener('change', async e => {
    try {
      msg('圖片上傳中…');
      $('article-cover').value = await uploadImage(e.target.files[0], 'article-covers');
      msg('封面上傳完成。');
    } catch (err) { msg(err.message); }
  });

  $('article-inline-file').addEventListener('change', async e => {
    try {
      msg('圖片上傳中…');
      const file = e.target.files[0];
      const url = await uploadImage(file, 'article-content');
      const alt = file.name.replace(/\.[^.]+$/, '');
      $('article-content').value += `\n\n![${alt}](${url})\n`;
      renderArticlePreview();
      msg('圖片已上傳，而且已插入文章內容。');
    } catch (err) { msg(err.message); }
  });

  $('save-article').addEventListener('click', async () => {
    const id = $('article-id').value;
    const payload = {
      title: $('article-title').value.trim(),
      slug: slugify($('article-slug').value || $('article-title').value),
      category: $('article-category').value.trim() || 'SAP',
      summary: $('article-summary').value.trim(),
      cover_image: $('article-cover').value.trim() || null,
      content: $('article-content').value,
      published: $('article-published').checked,
      featured: $('article-featured').checked,
      updated_at: new Date().toISOString()
    };
    if (!payload.title || !payload.slug) return msg('標題與 slug 不能空白。');

    const result = id
      ? await client.from('articles').update(payload).eq('id', id)
      : await client.from('articles').insert(payload);
    if (result.error) return msg(result.error.message);
    msg('文章已儲存。');
    clearArticle();
    await loadAll();
  });

  $('delete-article').addEventListener('click', async () => {
    const id = $('article-id').value;
    if (!id || !confirm('確定刪除這篇文章？')) return;
    const { error } = await client.from('articles').delete().eq('id', id);
    if (error) return msg(error.message);
    msg('文章已刪除。');
    clearArticle();
    await loadAll();
  });

  // Projects
  function clearProject() {
    $('project-id').value = '';
    $('project-title').value = '';
    $('project-slug').value = '';
    $('project-summary').value = '';
    $('project-content').value = '';
    $('project-image').value = '';
    $('project-url').value = '';
    $('project-published').checked = true;
    $('project-featured').checked = false;
    $('delete-project').classList.add('hidden');
  }

  function editProject(id) {
    const p = state.projects.find(x => x.id === id);
    if (!p) return;
    $('project-id').value = p.id;
    $('project-title').value = p.title || '';
    $('project-slug').value = p.slug || '';
    $('project-summary').value = p.summary || '';
    $('project-content').value = p.content || '';
    $('project-image').value = p.image_url || '';
    $('project-url').value = p.project_url || '';
    $('project-published').checked = !!p.published;
    $('project-featured').checked = !!p.featured;
    $('delete-project').classList.remove('hidden');
  }

  $('new-project').addEventListener('click', clearProject);
  $('project-title').addEventListener('input', () => {
    if (!$('project-id').value) $('project-slug').value = slugify($('project-title').value);
  });
  $('project-image-file').addEventListener('change', async e => {
    try {
      msg('圖片上傳中…');
      $('project-image').value = await uploadImage(e.target.files[0], 'project-images');
      msg('專案圖片上傳完成。');
    } catch (err) { msg(err.message); }
  });

  $('save-project').addEventListener('click', async () => {
    const id = $('project-id').value;
    const payload = {
      title: $('project-title').value.trim(),
      slug: slugify($('project-slug').value || $('project-title').value),
      summary: $('project-summary').value.trim(),
      content: $('project-content').value,
      image_url: $('project-image').value.trim() || null,
      project_url: $('project-url').value.trim() || null,
      published: $('project-published').checked,
      featured: $('project-featured').checked
    };
    const result = id
      ? await client.from('projects').update(payload).eq('id', id)
      : await client.from('projects').insert(payload);
    if (result.error) return msg(result.error.message);
    msg('專案已儲存。');
    clearProject();
    await loadAll();
  });

  $('delete-project').addEventListener('click', async () => {
    const id = $('project-id').value;
    if (!id || !confirm('確定刪除這個專案？')) return;
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) return msg(error.message);
    clearProject(); await loadAll(); msg('專案已刪除。');
  });

  // Certifications
  function clearCert() {
    $('cert-id').value = '';
    $('cert-name').value = '';
    $('cert-issuer').value = 'SAP';
    $('cert-date').value = '';
    $('cert-url').value = '';
    $('cert-order').value = 10;
    $('cert-published').checked = true;
    $('cert-image').value = '';
    $('cert-preview-image').classList.add('hidden');
    $('delete-cert').classList.add('hidden');
  }

  function editCert(id) {
    const c = state.certifications.find(x => x.id === id);
    if (!c) return;
    $('cert-id').value = c.id;
    $('cert-name').value = c.name || '';
    $('cert-issuer').value = c.issuer || '';
    $('cert-date').value = c.issue_date || '';
    $('cert-url').value = c.credential_url || '';
    $('cert-order').value = c.sort_order ?? 10;
    $('cert-published').checked = !!c.published;
    $('cert-image').value = c.image_url || '';
    if (c.image_url) {
      $('cert-preview-image').src = c.image_url;
      $('cert-preview-image').classList.remove('hidden');
    } else {
      $('cert-preview-image').classList.add('hidden');
    }
    $('delete-cert').classList.remove('hidden');
  }

  $('new-cert').addEventListener('click', clearCert);
  $('cert-image-file').addEventListener('change', async e => {
    try {
      msg('圖片上傳中…');
      const url = await uploadImage(e.target.files[0], 'certificates');
      $('cert-image').value = url;
      $('cert-preview-image').src = url;
      $('cert-preview-image').classList.remove('hidden');
      msg('證照圖片上傳完成。');
    } catch (err) { msg(err.message); }
  });

  $('save-cert').addEventListener('click', async () => {
    const id = $('cert-id').value;
    const payload = {
      name: $('cert-name').value.trim(),
      issuer: $('cert-issuer').value.trim(),
      issue_date: $('cert-date').value || null,
      credential_url: $('cert-url').value.trim() || null,
      image_url: $('cert-image').value.trim() || null,
      published: $('cert-published').checked,
      sort_order: Number($('cert-order').value || 10)
    };
    const result = id
      ? await client.from('certifications').update(payload).eq('id', id)
      : await client.from('certifications').insert(payload);
    if (result.error) return msg(result.error.message);
    msg('證照已儲存。');
    clearCert(); await loadAll();
  });

  $('delete-cert').addEventListener('click', async () => {
    const id = $('cert-id').value;
    if (!id || !confirm('確定刪除這張證照？')) return;
    const { error } = await client.from('certifications').delete().eq('id', id);
    if (error) return msg(error.message);
    clearCert(); await loadAll(); msg('證照已刪除。');
  });

  // Resume
  function renderResumePreview() {
    $('resume-preview').innerHTML = md($('resume-content-editor').value || '*開始寫履歷…*');
  }
  $('resume-content-editor').addEventListener('input', renderResumePreview);

  $('resume-inline-file').addEventListener('change', async e => {
    try {
      msg('照片上傳中…');
      const file = e.target.files[0];
      const url = await uploadImage(file, 'resume-images');
      const alt = file.name.replace(/\.[^.]+$/, '') || 'Profile photo';
      const editor = $('resume-content-editor');
      const start = editor.selectionStart ?? editor.value.length;
      const end = editor.selectionEnd ?? start;
      const markdown = `\n\n![${alt}](${url})\n\n`;
      editor.value = editor.value.slice(0, start) + markdown + editor.value.slice(end);
      editor.focus();
      editor.selectionStart = editor.selectionEnd = start + markdown.length;
      renderResumePreview();
      msg('照片已上傳並插入履歷。');
      e.target.value = '';
    } catch (err) {
      msg(err.message);
    }
  });

  $('save-resume').addEventListener('click', async () => {
    const { error } = await client.from('pages').upsert({
      slug: 'resume',
      title: 'Resume',
      content: $('resume-content-editor').value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });
    msg(error ? error.message : '履歷已儲存。');
  });

  refreshSession();
})();
