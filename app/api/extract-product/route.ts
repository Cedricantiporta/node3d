import { NextRequest, NextResponse } from "next/server";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2_000_000;

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".localhost")) return true;
  if (lower === "0.0.0.0" || lower === "::1") return true;

  const ipv4 = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
  }

  return false;
}

function extractTag(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern);
  return match?.[1]?.trim() || undefined;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function POST(request: NextRequest) {
  let url: string | undefined;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "A product URL is required." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) URLs are supported." }, { status: 400 });
  }

  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "That host can't be fetched." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIUGCPromptFactory/1.0; +product-info-extractor)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `The page responded with status ${response.status}.` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "That URL didn't return an HTML page." },
        { status: 415 }
      );
    }

    const reader = response.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      let received = 0;
      while (received < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } else {
      html = await response.text();
    }

    const ogTitle = extractTag(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
    const ogDescription = extractTag(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
    );
    const metaDescription = extractTag(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    );

    const name = ogTitle ?? title;
    const description = ogDescription ?? metaDescription;

    if (!name && !description) {
      return NextResponse.json(
        { error: "Couldn't find any product info on that page." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      name: name ? decodeEntities(name) : undefined,
      description: description ? decodeEntities(description) : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "The page took too long to respond." }, { status: 504 });
    }
    return NextResponse.json({ error: "Couldn't reach that URL." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
