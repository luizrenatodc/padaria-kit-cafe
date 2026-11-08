import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";

let filho;
let base = "";

function portaLivre() {
  return new Promise((ok, erro) => {
    const s = createServer();
    s.once("error", erro);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
}

describe("servidor local (npm start)", () => {
  before(async () => {
    const porta = await portaLivre();
    base = `http://127.0.0.1:${porta}`;
    const script = fileURLToPath(new URL("../scripts/servir.mjs", import.meta.url));
    filho = spawn(process.execPath, [script], { env: { ...process.env, PORT: String(porta) }, stdio: ["ignore", "pipe", "inherit"] });
    await new Promise((ok, erro) => {
      filho.once("error", erro);
      filho.once("exit", (codigo) => erro(new Error(`servidor saiu com código ${codigo}`)));
      filho.stdout.once("data", ok);
    });
  });
  after(() => filho?.kill());

  it("serve a página inicial e os módulos com o tipo certo", async () => {
    const pagina = await fetch(base + "/");
    assert.equal(pagina.status, 200);
    assert.match(pagina.headers.get("content-type"), /text\/html/);
    const modulo = await fetch(base + "/js/kit.js");
    assert.equal(modulo.status, 200);
    assert.match(modulo.headers.get("content-type"), /text\/javascript/);
  });

  it("escape inválido na URL responde 400 e o servidor continua de pé", async () => {
    for (const caminho of ["/%E0%A4%A", "/%", "/js/kit.js%00"]) {
      assert.equal((await fetch(base + caminho)).status, 400, caminho);
    }
    assert.equal((await fetch(base + "/")).status, 200);
  });

  it("arquivo que não existe responde 404", async () => {
    assert.equal((await fetch(base + "/nao-existe.html")).status, 404);
  });

  it("não sai da pasta do site", async () => {
    const r = await fetch(base + "/../package.json");
    assert.ok([400, 404].includes(r.status));
    assert.doesNotMatch(await r.text(), /padaria-kit-cafe/);
  });
});
