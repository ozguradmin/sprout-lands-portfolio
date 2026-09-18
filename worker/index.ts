// ozgurguler.tech Worker'ı: statik siteyi (dist/) sunar, iletişim formunu Telegram'a iletir.
// Telegram token'ı artık tarayıcıya gitmez; `wrangler secret put` ile Worker'da durur.

interface Env {
  ASSETS: Fetcher;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  CONTACT_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const field = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Telegram Markdown'ında anlamı olan karakterleri kaçır.
const md = (s: string) => s.replace(/([_*`\[])/g, '\\$1');

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ error: 'not_configured' }, 503);

  if (env.CONTACT_LIMIT) {
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const { success } = await env.CONTACT_LIMIT.limit({ key: ip });
    if (!success) return json({ error: 'rate_limited' }, 429);
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const message = field(data.message, 3000);
  if (!message) return json({ error: 'empty_message' }, 400);
  const name = field(data.name, 100) || 'Belirtilmedi';
  const phone = field(data.phone, 40) || 'Belirtilmedi';
  const instagram = field(data.instagram, 60) || 'Belirtilmedi';

  const text =
    `📬 *Yeni Mesaj:*\n\n` +
    `👤 *İsim:* ${md(name)}\n` +
    `📞 *Tel:* ${md(phone)}\n` +
    `📸 *IG:* ${md(instagram)}\n\n` +
    `💬 *Mesaj:*\n${md(message)}`;

  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
  });
  return res.ok ? json({ ok: true }) : json({ error: 'upstream_failed' }, 502);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
