import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf-8");
const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? "";

describe("política de segurança do conteúdo", () => {
  it("a página declara uma CSP restritiva", () => {
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self'(;|$)/, "scripts só do próprio site, sem unsafe-inline");
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /base-uri 'self'/);
    assert.doesNotMatch(csp, /script-src[^;]*unsafe/);
  });

  it("não há script inline nem manipulador de evento no HTML (a CSP os bloquearia)", () => {
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)];
    assert.ok(scripts.length >= 1);
    for (const [, attrs] of scripts) assert.match(attrs, /\ssrc="/, `script inline: <script${attrs}>`);
    assert.doesNotMatch(html, /\son(click|load|error|change|input|submit)=/i);
  });

  it("todo endereço externo usado pela página está liberado na CSP", () => {
    const liberados = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];
    for (const host of liberados) assert.ok(csp.includes(host) || html.indexOf(host) === -1, host);
    const externos = new Set([...html.matchAll(/(?:href|src)="(https:\/\/[^/"]+)/g)].map((m) => m[1]));
    for (const e of externos) {
      if (/luizrenato\.dev/.test(e)) continue; // link de navegação, não recurso
      assert.ok(liberados.includes(e), `recurso externo fora da CSP: ${e}`);
    }
  });

  it("os módulos não usam eval, new Function nem fetch para fora", () => {
    const pasta = new URL("../site/js/", import.meta.url);
    for (const arq of readdirSync(pasta)) {
      const codigo = readFileSync(new URL(arq, pasta), "utf-8");
      assert.doesNotMatch(codigo, /\beval\s*\(|new Function\s*\(/, arq);
      assert.doesNotMatch(codigo, /\bfetch\s*\(/, arq);
    }
  });

  it("links que abrem outra aba usam rel=noopener", () => {
    for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener/, tag);
  });
});
