// Gera as capturas de docs/ e os quadros do GIF (tmp/quadros) usando o site de verdade.
// Uso: node scripts/telas.mjs     (precisa de puppeteer-core e Edge/Chrome)
//   PUPPETEER_DIR  pasta onde puppeteer-core está instalado (padrão: pasta atual)
//   NAVEGADOR      caminho do Edge/Chrome (padrão: Edge do Windows)
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const require = createRequire((process.env.PUPPETEER_DIR ?? process.cwd()).replace(/[\\/]?$/, "/"));
const puppeteer = require("puppeteer-core");
const NAVEGADOR = process.env.NAVEGADOR ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORTA = 8097;
const URL_SITE = `http://localhost:${PORTA}/`;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const servidor = spawn(process.execPath, ["scripts/servir.mjs"], { env: { ...process.env, PORT: String(PORTA) }, stdio: "ignore" });
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(URL_SITE)).ok) break; } catch { /* aguardando */ }
  await dormir(150);
}
mkdirSync("docs", { recursive: true });
rmSync("tmp/quadros", { recursive: true, force: true });
mkdirSync("tmp/quadros", { recursive: true });

const navegador = await puppeteer.launch({ executablePath: NAVEGADOR, headless: "new" });
const erros = [];

async function pagina(largura, altura, dsf = 1) {
  const p = await navegador.newPage();
  await p.setViewport({ width: largura, height: altura, deviceScaleFactor: dsf });
  await p.evaluateOnNewDocument(() => localStorage.clear());
  p.on("pageerror", (e) => erros.push(e.message));
  p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  await p.goto(URL_SITE, { waitUntil: "networkidle0" });
  await p.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  const clicar = p.click.bind(p);
  p.click = async (sel, ...r) => { try { return await clicar(sel, ...r); } catch (e) { throw new Error(`${sel}: ${e.message}`); } };
  return p;
}
const ir = async (p, sel, desloc = 92) => {
  await p.evaluate((s, d) => { document.querySelector(s).scrollIntoView({ block: "start" }); window.scrollBy(0, -d); }, sel, desloc);
  await dormir(500);
};
const mais = async (p, id, vezes = 1, pausa = 420) => {
  for (let i = 0; i < vezes; i++) {
    try { await p.click(`.item[data-id="${id}"] .mais`); } catch (e) { throw new Error(`${id}: ${e.message}`); }
    await dormir(pausa);
  }
};
const dados = async (p) => {
  await p.type("#nome", "Marina Costa", { delay: 30 });
  await p.type("#telefone", "11912345678", { delay: 30 });
  await p.type("#rua", "Rua das Acácias", { delay: 25 });
  await p.type("#numero", "120", { delay: 30 });
  await p.type("#bairro", "Jardim Primavera", { delay: 25 });
};

try {
  // ---------- capturas estáticas ----------
  let p = await pagina(1440, 900);
  await dormir(1600);
  await p.screenshot({ path: "docs/hero.png" });

  await ir(p, "#montar", 80);
  await mais(p, "baguete"); await mais(p, "croissant", 2); await mais(p, "brioche");
  await ir(p, ".cat[data-cat=doces]", 100);
  await mais(p, "brownie"); await mais(p, "fuba");
  await ir(p, ".cat[data-cat=bebidas]", 100);
  await mais(p, "cafe"); await mais(p, "laranja");
  await ir(p, ".cat[data-cat=paes]", 100);
  await dormir(500);
  await p.screenshot({ path: "docs/montagem.png" });

  await p.click('[data-dieta="vegano"]');
  await dormir(500);
  await ir(p, ".dieta", 120);
  await p.screenshot({ path: "docs/restricoes.png" });
  await p.click('[data-dieta="vegano"]');

  await ir(p, ".passo:nth-of-type(3)", 100);
  await p.click("#cartao-ativo + .trilho");
  await p.type("#cartao-para", "Mãe", { delay: 20 });
  await p.type("#cartao-texto", "Bom dia, mãe! Esse café da manhã é por minha conta. Feliz aniversário!", { delay: 10 });
  await p.type("#cartao-de", "Marina", { delay: 20 });
  await p.click('input[name="estilo-cartao"][value="floral"] + span');
  await p.click('[data-extra="flores"]');
  await dormir(500);
  await p.screenshot({ path: "docs/cartao.png" });

  await ir(p, "#resumo", 100);
  await p.click("#btn-whats");
  await dormir(500);
  const msg = await p.$eval("#erros-form", (e) => (e.hidden ? "(oculto)" : e.innerText));
  console.log("validação sem dados:", msg.replace(/\s+/g, " "));
  await dormir(700);
  await ir(p, ".passo:nth-of-type(4)", 100);
  await dados(p);
  await dormir(400);
  await p.evaluate(() => { document.querySelector(".acoes-finais").scrollIntoView({ block: "end" }); window.scrollBy(0, 60); });
  await dormir(600);
  await p.screenshot({ path: "docs/resumo.png" });
  await p.close();

  // ---------- celular ----------
  p = await pagina(390, 844, 2);
  await dormir(1500);
  await p.screenshot({ path: "docs/celular-topo.png" });
  await ir(p, "#montar", 70);
  await mais(p, "croissant", 2); await mais(p, "baguete");
  await ir(p, ".cat[data-cat=paes]", 70);
  await dormir(500);
  await p.screenshot({ path: "docs/celular-montagem.png" });
  await p.close();

  // ---------- GIF: montagem do kit ----------
  p = await pagina(1240, 760);
  await ir(p, "#montar", 78);
  const tempos = [];
  let gravando = true;
  const t0 = Date.now();
  const laco = (async () => {
    let n = 0;
    while (gravando) {
      const t = Date.now() - t0;
      try { await p.screenshot({ path: `tmp/quadros/f${String(n).padStart(4, "0")}.png` }); } catch { break; }
      tempos.push(t);
      n++;
    }
  })();
  await dormir(1200);
  await p.click('.op:has(input[value="g"])'); await dormir(900);
  await p.click('.op:has(input[value="m"])'); await dormir(700);
  await p.click('.op:has(input[value="caixa"])'); await dormir(900);
  await p.click('.op:has(input[value="cesta"])'); await dormir(800);
  await ir(p, ".cat[data-cat=paes]", 78);
  await dormir(500);
  await mais(p, "baguete", 1, 650); await mais(p, "croissant", 2, 600); await mais(p, "brioche", 1, 600);
  await ir(p, ".cat[data-cat=doces]", 78);
  await mais(p, "brownie", 1, 600); await mais(p, "cinnamon", 1, 600);
  await ir(p, ".cat[data-cat=frios]", 78);
  await mais(p, "geleia", 1, 600); await mais(p, "manteiga", 1, 600);
  await ir(p, ".cat[data-cat=bebidas]", 78);
  await mais(p, "cafe", 1, 600); await mais(p, "laranja", 1, 800);
  await ir(p, ".dieta", 100);
  await p.click('[data-dieta="vegano"]'); await dormir(1600);
  await p.click('[data-dieta="vegano"]'); await dormir(700);
  await ir(p, ".passo:nth-of-type(3)", 78);
  await p.click("#cartao-ativo + .trilho"); await dormir(500);
  await p.type("#cartao-para", "Mãe", { delay: 50 });
  await p.type("#cartao-texto", "Bom dia, mãe! Esse café é por minha conta.", { delay: 38 });
  await p.click('input[name="estilo-cartao"][value="floral"] + span'); await dormir(700);
  await p.click('[data-extra="flores"]'); await dormir(900);
  await ir(p, ".passo:nth-of-type(4)", 78);
  await dados(p);
  await dormir(500);
  await ir(p, "#resumo", 78);
  await dormir(1100);
  await p.click("#btn-whats");
  await dormir(2800);
  gravando = false;
  await laco;
  writeFileSync("tmp/quadros/tempos.json", JSON.stringify(tempos));
  console.log("quadros:", tempos.length, "duração (s):", ((Date.now() - t0) / 1000).toFixed(1));
  await p.close();
  if (erros.length) console.log("ERROS NO SITE", erros);
} catch (e) {
  console.log("FALHA:", e.message);
  process.exitCode = 1;
} finally {
  await navegador.close();
  servidor.kill();
}
