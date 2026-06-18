// Server-side Web Push sender — runs on a schedule via GitHub Actions.
// Delivers "urgent task" notifications to assignees even when their app is
// closed. Reads everything through the anon key (RLS on desk_* is permissive);
// the VAPID private key lives only in a GitHub Actions secret.
import webpush from 'web-push';

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT = 'mailto:reminder-it@example.com',
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing required env vars'); process.exit(1);
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Minimal PostgREST client over fetch (avoids the supabase-js WebSocket dep).
const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

async function dbSelectAllTasks() {
  const res = await fetch(`${REST}/desk_tasks?select=*`, { headers: HEADERS });
  if (!res.ok) throw new Error(`select ${res.status}: ${await res.text()}`);
  return res.json();
}
async function dbUpdateTask(id, patch) {
  await fetch(`${REST}/desk_tasks?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
}
async function dbDeleteTask(id) {
  await fetch(`${REST}/desk_tasks?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
}

const PUSH_SUB_TITLE = '__push_sub__';
const META_MARK = '§META§';
// Only consider tasks created within this window, so we never flood on first run.
const WINDOW_MS = 2 * 60 * 60 * 1000;

function unpack(stored) {
  if (!stored) return { description: '', meta: {} };
  const i = stored.indexOf(META_MARK);
  if (i === -1) return { description: stored, meta: {} };
  let meta = {};
  try { meta = JSON.parse(stored.slice(i + META_MARK.length)); } catch {}
  return { description: stored.slice(0, i).replace(/\n+$/, ''), meta };
}
function pack(description, meta) {
  const payload = {};
  if (meta.u) payload.u = 1;
  if (meta.n) payload.n = meta.n;
  if (meta.p) payload.p = 1;
  const base = (description || '').trim();
  if (Object.keys(payload).length === 0) return base || null;
  return `${base}\n${META_MARK}${JSON.stringify(payload)}`;
}

async function main() {
  const rows = await dbSelectAllTasks();

  // subscriptions grouped by member (created_by)
  const subsByMember = new Map();
  const subRowById = new Map();
  for (const r of rows) {
    if (r.title !== PUSH_SUB_TITLE) continue;
    try {
      const sub = JSON.parse(r.description);
      if (!sub?.endpoint) continue;
      if (!subsByMember.has(r.created_by)) subsByMember.set(r.created_by, []);
      subsByMember.get(r.created_by).push({ rowId: r.id, sub });
      subRowById.set(r.id, sub);
    } catch {}
  }

  const now = Date.now();
  let sent = 0, pruned = 0;

  for (const t of rows) {
    if (t.title === PUSH_SUB_TITLE) continue;
    if (t.status !== 'pending') continue;
    const { description, meta } = unpack(t.description);
    if (!meta.u || meta.p) continue;                       // not urgent, or already pushed
    if (now - new Date(t.created_at).getTime() > WINDOW_MS) continue;

    // recipients: assignee, or (public urgent) all members except the creator
    let recipientIds;
    if (t.assigned_to) recipientIds = [t.assigned_to];
    else recipientIds = [...subsByMember.keys()].filter(id => id !== t.created_by);

    const payload = JSON.stringify({
      title: `🚨 کار فوری: ${t.title}`,
      body: description ? description : 'مدیر یک کار فوری برای شما تعیین کرده',
      tag: `urgent-${t.id}`,
      url: '/tasreminder/#/desk',
      requireInteraction: true,
      urgent: true,
    });

    for (const memberId of recipientIds) {
      for (const { rowId, sub } of subsByMember.get(memberId) ?? []) {
        try {
          await webpush.sendNotification(sub, payload);
          sent++;
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            await dbDeleteTask(rowId);  // stale endpoint
            pruned++;
          } else {
            console.error('push failed', e.statusCode, e.body || e.message);
          }
        }
      }
    }

    // mark as pushed so it is never sent twice
    meta.p = 1;
    await dbUpdateTask(t.id, { description: pack(description, meta) });
  }

  console.log(`done — pushes sent: ${sent}, stale subs pruned: ${pruned}`);
}

main().catch(e => { console.error(e); process.exit(1); });
