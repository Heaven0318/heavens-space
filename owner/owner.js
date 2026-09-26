(() => {
  const config = window.HeavensConfig || {};
  const base = (config.supabaseUrl || '').replace(/\/$/, '');
  const key = config.supabasePublishableKey || '';
  const loginPanel = document.getElementById('login-panel');
  const inboxPanel = document.getElementById('inbox-panel');
  const loginStatus = document.getElementById('login-status');
  const inboxStatus = document.getElementById('inbox-status');
  const list = document.getElementById('message-list');
  const logoutButton = document.getElementById('logout');
  let session = null;
  let messages = [];

  function showLogin(message = '') {
    session = null;
    messages = [];
    sessionStorage.removeItem('heavensOwnerSession');
    loginPanel.hidden = false;
    inboxPanel.hidden = true;
    logoutButton.hidden = true;
    list.replaceChildren();
    loginStatus.textContent = message;
  }
  function headers() { return { apikey: key, Authorization: `Bearer ${session.access_token}` }; }
  async function api(path, options = {}) {
    const response = await fetch(`${base}${path}`, { ...options, headers: { ...headers(), ...options.headers } });
    if (response.status === 401 || response.status === 403) {
      showLogin('Your session expired or access was denied. Please sign in again.');
      throw new Error('Session expired');
    }
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  }
  async function refreshToken() {
    if (!session || session.expires_at > Date.now() + 60000) return;
    const response = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    if (!response.ok) { showLogin('Session expired. Please sign in again.'); throw new Error('Session expired'); }
    const data = await response.json();
    session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000 };
    sessionStorage.setItem('heavensOwnerSession', JSON.stringify(session));
  }
  async function verifyOwner() {
    await refreshToken();
    const rows = await api('/rest/v1/owner_accounts?select=id&limit=1');
    if (!rows.length) { showLogin('This account is not authorized as an owner.'); return false; }
    loginPanel.hidden = true;
    inboxPanel.hidden = false;
    logoutButton.hidden = false;
    return true;
  }
  async function loadMessages() {
    if (!session) return;
    inboxStatus.textContent = 'Loading messages…';
    try {
      await refreshToken();
      messages = await api('/rest/v1/contact_messages?select=id,name,email,subject,message,created_at,is_read,is_archived&order=created_at.desc&limit=500');
      render();
      inboxStatus.textContent = `${messages.length} message${messages.length === 1 ? '' : 's'} loaded${messages.length === 500 ? ' (showing newest 500)' : ''}.`;
    } catch (error) { if (session) inboxStatus.textContent = `Could not load messages: ${error.message}`; }
  }
  function render() {
    const search = document.getElementById('search').value.trim().toLowerCase();
    const filter = document.getElementById('filter').value;
    const visible = messages.filter((item) => {
      const matches = [item.name, item.email, item.subject, item.message].some((part) => part.toLowerCase().includes(search));
      return matches && (filter === 'archived' ? item.is_archived : !item.is_archived && (filter === 'all' || (filter === 'read' ? item.is_read : !item.is_read)));
    });
    list.replaceChildren();
    if (!visible.length) { const empty = document.createElement('p'); empty.textContent = 'No messages match this view.'; list.append(empty); return; }
    visible.forEach((item) => {
      const card = document.createElement('article');
      card.className = `message ${item.is_read ? '' : 'unread'} ${item.is_archived ? 'archived' : ''}`;
      const head = document.createElement('div'); head.className = 'message-head';
      const title = document.createElement('h2'); title.textContent = item.subject;
      const date = document.createElement('time'); date.className = 'meta'; date.dateTime = item.created_at; date.textContent = new Date(item.created_at).toLocaleString();
      head.append(title, date);
      const sender = document.createElement('p'); sender.className = 'meta'; sender.textContent = `${item.name} · ${item.email}`;
      const body = document.createElement('p'); body.className = 'body'; body.textContent = item.message;
      const actions = document.createElement('div'); actions.className = 'actions';
      const action = (label, callback) => { const button = document.createElement('button'); button.textContent = label; button.addEventListener('click', callback); actions.append(button); };
      action(item.is_read ? 'MARK UNREAD' : 'MARK READ', () => update(item, { is_read: !item.is_read }));
      action(item.is_archived ? 'RESTORE' : 'ARCHIVE', () => update(item, { is_archived: !item.is_archived }));
      action('DELETE', () => remove(item));
      card.append(head, sender, body, actions); list.append(card);
    });
  }
  async function update(item, changes) {
    try {
      await refreshToken();
      await api(`/rest/v1/contact_messages?id=eq.${encodeURIComponent(item.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(changes) });
      Object.assign(item, changes); render(); inboxStatus.textContent = 'Message updated.';
    } catch (error) { if (session) inboxStatus.textContent = `Update failed: ${error.message}`; }
  }
  async function remove(item) {
    if (!window.confirm('Permanently delete this message? This cannot be undone.')) return;
    try {
      await refreshToken();
      await api(`/rest/v1/contact_messages?id=eq.${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      messages = messages.filter((entry) => entry.id !== item.id); render(); inboxStatus.textContent = 'Message deleted.';
    } catch (error) { if (session) inboxStatus.textContent = `Delete failed: ${error.message}`; }
  }
  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!base || !key) { loginStatus.textContent = 'Supabase is not configured yet.'; return; }
    const button = event.currentTarget.querySelector('button'); button.disabled = true; loginStatus.textContent = 'Signing in…';
    try {
      const response = await fetch(`${base}/auth/v1/token?grant_type=password`, {
        method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value })
      });
      if (!response.ok) throw new Error('Invalid credentials or access unavailable.');
      const data = await response.json();
      session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000 };
      sessionStorage.setItem('heavensOwnerSession', JSON.stringify(session));
      document.getElementById('login-password').value = '';
      if (await verifyOwner()) await loadMessages();
    } catch (error) { if (session) showLogin(error.message); else loginStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  logoutButton.addEventListener('click', async () => {
    try { if (session) await api('/auth/v1/logout', { method: 'POST' }); } catch { /* local session is cleared regardless */ }
    showLogin('Signed out.');
  });
  document.getElementById('search').addEventListener('input', render);
  document.getElementById('filter').addEventListener('change', render);
  document.getElementById('refresh').addEventListener('click', loadMessages);
  try { session = JSON.parse(sessionStorage.getItem('heavensOwnerSession') || 'null'); } catch { session = null; }
  if (session && base && key) verifyOwner().then((allowed) => { if (allowed) loadMessages(); }).catch(() => showLogin('Please sign in again.'));
  else showLogin(!base || !key ? 'Supabase is not configured yet.' : '');
})();
