import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(new URL("../site/css/estilo.css", import.meta.url), "utf-8");

/** Cores definidas em :root (--nome: #rrggbb). */
const cor = Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]));

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste da WCAG 2.x. */
function razao(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Texto comum precisa de 4,5:1 (WCAG AA, critério 1.4.3).
const PARES = [
  ["texto", "farinha"],
  ["texto", "papel"],
  ["suave", "farinha"],
  ["suave", "papel"],
  ["suave", "creme"],
  ["vermelho", "farinha"],
  ["vermelho", "papel"],
  ["vermelho", "creme"],
  ["verde", "farinha"],
  ["verde", "papel"],
  ["verde", "creme"],
  ["crosta-esc", "farinha"],
  ["ink", "manteiga"],
];

describe("contraste das cores do site (WCAG AA)", () => {
  it("as cores do :root foram lidas", () => {
    for (const nome of ["farinha", "papel", "creme", "texto", "suave", "vermelho", "verde", "botao"]) assert.ok(cor[nome], nome);
  });

  for (const [frente, fundo] of PARES) {
    it(`${frente} sobre ${fundo} tem pelo menos 4,5:1`, () => {
      const r = razao(cor[frente], cor[fundo]);
      assert.ok(r >= 4.5, `${frente} (${cor[frente]}) sobre ${fundo} (${cor[fundo]}): ${r.toFixed(2)}:1`);
    });
  }

  it("texto claro sobre os botões tem pelo menos 4,5:1", () => {
    const fundos = {
      ".botao": cor.botao,
      ".botao:hover": /\.botao:hover \{[^}]*background: (#[0-9a-f]{6})/i.exec(css)?.[1],
      ".botao-zap": /\.botao-zap \{ background: (#[0-9a-f]{6})/i.exec(css)?.[1],
      ".botao-zap:hover": /\.botao-zap:hover \{ background: (#[0-9a-f]{6})/i.exec(css)?.[1],
    };
    for (const [seletor, fundo] of Object.entries(fundos)) {
      assert.ok(fundo, `fundo de ${seletor} não encontrado`);
      const r = razao("#fffaf0", fundo);
      assert.ok(r >= 4.5, `${seletor}: ${fundo} dá ${r.toFixed(2)}:1`);
    }
  });

  it("o aviso de erro e o texto da caixa de erros passam no AA", () => {
    assert.ok(razao("#a8321c", cor.papel) >= 4.5);
    assert.ok(razao("#7a2412", "#fff1ec") >= 4.5);
  });
});
