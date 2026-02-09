/**
 * Sumi Worker: 정적 에셋 서빙 + POST /api/interest 처리
 */

const MAX_NAME = 50;
const MAX_CONTACT = 100;
const MAX_MESSAGE = 500;
const INTEREST_PARTS = new Set(['CALF', 'FOOT']);

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  DISCORD_WEBHOOK_URL?: string;
}

interface InterestBody {
  name?: string;
  contact?: string;
  interest_parts?: string[];
  willing_to_pay?: boolean;
  message?: string;
  consent_contact?: boolean;
  company?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  page_path?: string;
}

function jsonResponse(data: unknown, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function validateBody(body: unknown): { ok: true; data: InterestBody } | { ok: false; status: number; message: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, message: 'Invalid JSON' };
  }
  const b = body as Record<string, unknown>;

  if (b.company && String(b.company).trim() !== '') {
    return { ok: false, status: 400, message: 'Invalid request' };
  }

  const interestParts = Array.isArray(b.interest_parts) ? b.interest_parts : [];
  const filtered = interestParts.filter((v): v is string => typeof v === 'string' && INTEREST_PARTS.has(v));
  if (filtered.length < 1) {
    return { ok: false, status: 400, message: 'interest_parts: 최소 1개 선택 (CALF, FOOT)' };
  }

  if (typeof b.willing_to_pay !== 'boolean') {
    return { ok: false, status: 400, message: 'willing_to_pay: true 또는 false 필요' };
  }

  const name = b.name != null ? String(b.name).trim() : '';
  if (name.length > MAX_NAME) {
    return { ok: false, status: 400, message: `name: 최대 ${MAX_NAME}자` };
  }

  const contact = b.contact != null ? String(b.contact).trim() : '';
  if (contact.length > MAX_CONTACT) {
    return { ok: false, status: 400, message: `contact: 최대 ${MAX_CONTACT}자` };
  }

  const message = b.message != null ? String(b.message).trim() : '';
  if (message.length > MAX_MESSAGE) {
    return { ok: false, status: 400, message: `message: 최대 ${MAX_MESSAGE}자` };
  }

  const data: InterestBody = {
    name: name || undefined,
    contact: contact || undefined,
    interest_parts: filtered,
    willing_to_pay: b.willing_to_pay,
    message: message || undefined,
    consent_contact: Boolean(b.consent_contact),
    utm_source: b.utm_source != null ? String(b.utm_source) : undefined,
    utm_medium: b.utm_medium != null ? String(b.utm_medium) : undefined,
    utm_campaign: b.utm_campaign != null ? String(b.utm_campaign) : undefined,
    referrer: b.referrer != null ? String(b.referrer) : undefined,
    page_path: b.page_path != null ? String(b.page_path) : undefined,
  };
  return { ok: true, data };
}

function generateId(): string {
  return crypto.randomUUID();
}

function buildDiscordMessage(data: InterestBody): string {
  const parts = data.interest_parts ?? [];
  const interestLabel = parts.includes('CALF') && parts.includes('FOOT') ? '종아리, 발' : parts.includes('CALF') ? '종아리' : '발';
  const payLabel = data.willing_to_pay ? 'O' : 'X';
  const msg = (data.message ?? '').replace(/\s+/g, ' ').slice(0, 200);
  const lines = [
    '**새 유료 의사 확인 (숨이)**',
    `이름: ${data.name ?? '—'}`,
    `연락처: ${data.contact ?? '—'}`,
    `관심 부위: ${interestLabel}`,
    `유료 의사: ${payLabel}`,
  ];
  if (msg) lines.push(`메시지: ${msg}`);
  return lines.join('\n');
}

async function notifyDiscord(webhookUrl: string, data: InterestBody): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: buildDiscordMessage(data) }),
    });
  } catch (_) {
    // 알림 실패해도 제출은 성공 처리
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/interest' && request.method === 'POST') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }
      const validated = validateBody(body);
      if (!validated.ok) {
        return jsonResponse({ error: validated.message }, validated.status);
      }
      const { data } = validated;
      const id = generateId();
      const userAgent = request.headers.get('User-Agent') ?? null;
      await env.DB.prepare(
        `INSERT INTO su_interest_leads (id, name, contact, interest_parts, willing_to_pay, message, utm_source, utm_medium, utm_campaign, referrer, page_path, user_agent, consent_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          data.name ?? null,
          data.contact ?? null,
          JSON.stringify(data.interest_parts),
          data.willing_to_pay ? 1 : 0,
          data.message ?? null,
          data.utm_source ?? null,
          data.utm_medium ?? null,
          data.utm_campaign ?? null,
          data.referrer ?? null,
          data.page_path ?? null,
          userAgent,
          data.consent_contact ? 1 : 0
        )
        .run();
      if (env.DISCORD_WEBHOOK_URL) {
        ctx.waitUntil(notifyDiscord(env.DISCORD_WEBHOOK_URL, data));
      }
      return jsonResponse({ id }, 201);
    }
    return env.ASSETS.fetch(request);
  },
};
