import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf-8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

describe("acessibilidade do HTML", () => {
  it("ids são únicos", () => {
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(repetidos, []);
  });

  it("todo aria-describedby e aria-labelledby aponta para um id que existe", () => {
    for (const [, attr, lista] of html.matchAll(/aria-(describedby|labelledby)="([^"]+)"/g)) {
      for (const id of lista.split(/\s+/)) assert.ok(ids.includes(id), `aria-${attr} aponta para #${id}, que não existe`);
    }
  });

  it("cada aviso de erro está ligado ao seu campo por aria-describedby", () => {
    const avisos = ids.filter((id) => id.startsWith("erro-")).filter((id) => id !== "erro-form");
    assert.ok(avisos.length >= 6);
    for (const id of avisos) {
      assert.match(html, new RegExp(`aria-describedby="[^"]*\\b${id}\\b[^"]*"`), `nenhum campo aponta para #${id}`);
    }
  });

  it("todo campo de formulário tem rótulo (label envolvente ou aria-label)", () => {
    const campos = [...html.matchAll(/<(input|textarea)\b[^>]*>/g)].filter((m) => !/type="(checkbox|radio|hidden)"/.test(m[0]));
    assert.ok(campos.length >= 8);
    for (const [tag] of campos) {
      const id = /\sid="([^"]+)"/.exec(tag)?.[1];
      const posicao = html.indexOf(tag);
      const antes = html.slice(Math.max(0, posicao - 400), posicao);
      const dentroDeLabel = antes.lastIndexOf("<label") > antes.lastIndexOf("</label>");
      assert.ok(dentroDeLabel || /aria-label=/.test(tag), `campo sem rótulo: ${id ?? tag}`);
    }
  });

  it("a página declara idioma, viewport, link de pular e aviso sem JavaScript", () => {
    assert.match(html, /<html lang="pt-BR">/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /class="pular" href="#montar"/);
    assert.match(html, /<noscript>/);
  });
});
