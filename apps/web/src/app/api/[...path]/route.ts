import { NextRequest } from 'next/server';

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:3001';

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const target = `${API_URL}${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.body,
    // @ts-expect-error - duplex is needed for streaming body
    duplex: 'half',
  });

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
