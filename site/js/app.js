import { CATEGORIAS, EMBALAGENS, ESTILOS_CARTAO, EXTRAS, ITENS, JANELAS, LIMITE_CARTAO, NEGOCIO, RESTRICOES, TAMANHOS } from "./dados.js";
import {
  ajustarItem, calcular, conflitosDieta, estadoInicial, formatarBRL, formatarData, formatarTelefone, itemAtende,
  linkWhatsapp, montarMensagem, primeiraDataDisponivel, restaurar, trocarTamanho, ultimaDataDisponivel, validar,
} from "./kit.js";
import { embalagemSVG, heroSVG, injetarSprites, sprite } from "./ilustracoes.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

const CHAVE_RASCUNHO = "cp:rascunho";
const CHAVE_SALVOS = "cp:salvos";
const ler = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* armazenamento indisponível */ } };

let estado = restaurar(ler(CHAVE_RASCUNHO));
let tentouEnviar = false;
let chavesAnteriores = null;
let totaisAnimados = new Map();

injetarSprites();
$("#hero-arte").innerHTML = heroSVG();

// --- montagem da interface fixa ----------------------------------------------------

function iconeTamanho(id) {
  const n = { p: 1, m: 2, g: 4 }[id];
  const pao = ["baguete", "croissant", "boule", "frances"];
  const cores = { baguete: ["#d58a38", "#efc67f", "#9b5a1c"], croissant: ["#dc9a40", "#f3cf86", "#9c5a1b"], boule: ["#b8692b", "#e8c280", "#7a3f17"], frances: ["#d9923f", "#f1cf8a", "#a8621f"] };
  return Array.from({ length: n }, (_, i) => sprite(pao[i], cores[pao[i]])).join("");
}

function montarFixos() {
  $("#tamanhos").insertAdjacentHTML("beforeend", Object.values(TAMANHOS).map((t) => `
    <label class="op"><input type="radio" name="tamanho" value="${t.id}"><span class="op-card">
      <span class="op-ico">${iconeTamanho(t.id)}</span><b>${t.nome}</b><small>${t.detalhe}</small><em>${t.capacidade} lugares</em>
      <span class="carimbo carimbo-red escolhido">escolhido</span></span></label>`).join(""));

  $("#embalagens").insertAdjacentHTML("beforeend", Object.values(EMBALAGENS).map((e) => `
    <label class="op"><input type="radio" name="embalagem" value="${e.id}"><span class="op-card">
      <b>${e.nome}</b><small>${e.detalhe}</small><em data-preco-emb="${e.id}"></em>
      <span class="carimbo carimbo-red escolhido">escolhido</span></span></label>`).join(""));

  $("#dieta-chips").innerHTML = RESTRICOES.map((r) => `<button type="button" class="chip" data-dieta="${r.id}" aria-pressed="false">${r.nome}</button>`).join("");

  $("#categorias").innerHTML = CATEGORIAS.map((cat) => `
    <section class="cat" data-cat="${cat.id}" aria-labelledby="cat-${cat.id}">
      <header><h4 id="cat-${cat.id}">${cat.nome}</h4><p>${cat.nota}</p></header>
      <div class="itens">${ITENS.filter((i) => i.cat === cat.id).map(cartaoItem).join("")}</div>
    </section>`).join("");

  $("#estilos-cartao").insertAdjacentHTML("beforeend", ESTILOS_CARTAO.map((e) => `<label class="est"><input type="radio" name="estilo-cartao" value="${e.id}"><span>${e.nome}</span></label>`).join(""));

  $("#extras").innerHTML = EXTRAS.map((x) => `
    <label class="extra"><input type="checkbox" data-extra="${x.id}">${sprite(x.icone, x.id === "vela" ? ["#fff", "#c8553d", "#fff"] : ["#fff", "#fff", "#fff"])}
      <span class="extra-txt"><b>${x.nome}</b><small>${x.detalhe}</small><span class="preco">+${formatarBRL(x.preco)}</span></span></label>`).join("");

  $("#tipos-entrega").insertAdjacentHTML("beforeend", `
    <label class="op"><input type="radio" name="tipo" value="entrega"><span class="op-card"><b>Entrega em casa</b><small>Levamos na janela que você escolher. Frete de ${formatarBRL(1400)}, grátis a partir de ${formatarBRL(16000)} em itens.</small><span class="carimbo carimbo-red escolhido">escolhido</span></span></label>
    <label class="op"><input type="radio" name="tipo" value="retirada"><span class="op-card"><b>Retiro na padaria</b><small>Rua do Forno, 42. Pronto a partir das 7h, sem frete.</small><span class="carimbo carimbo-red escolhido">escolhido</span></span></label>`);

  $("#janelas").insertAdjacentHTML("beforeend", JANELAS.map((j) => `
    <label class="janela"><input type="radio" name="janela" value="${j.id}"><span><b>${j.nome} · ${j.rotulo}</b><small>${j.extra ? "+" + formatarBRL(j.extra) : "sem custo"}</small></span></label>`).join(""));
}

const nbsp = (t) => t.replace(/(\d+) (g|ml|un)/g, "$1 $2");

function cartaoItem(i) {
  const tags = i.tags.map((t) => `<li class="${t === "vegano" ? "v" : ""}">${RESTRICOES.find((r) => r.id === t).nome}</li>`).join("");
  return `<article class="item" data-id="${i.id}">
    <div class="prato">${sprite(i.icone, i.cores)}<span class="qtd-selo" aria-hidden="true"></span></div>
    <h5>${nbsp(i.nome)}</h5>
    <p>${i.desc}${i.slots > 1 ? " Ocupa 2 lugares." : ""}</p>
    <ul class="tags" aria-label="Restrições atendidas">${tags}</ul>
    <p class="fora-aviso">Fora das restrições marcadas</p>
    <div class="item-rod">
      <span class="preco">${formatarBRL(i.preco)}</span>
      <div class="stepper" role="group" aria-label="${esc(i.nome)}">
        <button type="button" class="menos" data-acao="menos" aria-label="Tirar um: ${esc(i.nome)}">−</button>
        <output aria-live="off">0</output>
        <button type="button" class="mais" data-acao="mais" aria-label="Colocar um: ${esc(i.nome)}">+</button>
      </div>
    </div></article>`;
}

// --- atualização -------------------------------------------------------------------

function animarValor(el, centavos) {
  const de = totaisAnimados.get(el) ?? centavos;
  totaisAnimados.set(el, centavos);
  if (reduzir || de === centavos) { el.textContent = formatarBRL(centavos); return; }
  const ini = performance.now();
  const dur = 380;
  const passo = (t) => {
    const k = Math.min(1, (t - ini) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = formatarBRL(Math.round(de + (centavos - de) * e));
    if (k < 1 && totaisAnimados.get(el) === centavos) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

function unidades() {
  const lista = [];
  for (const [id, q] of Object.entries(estado.itens)) {
    const it = ITENS.find((x) => x.id === id);
    if (!it) continue;
    for (let k = 0; k < q; k++) lista.push({ chave: `${id}#${k}`, icone: it.icone, cores: it.cores });
  }
  return lista;
}

function recibo(c, { ticket }) {
  const tam = TAMANHOS[estado.tamanho];
  const emb = EMBALAGENS[estado.embalagem];
  const un = unidades();
  const chaves = new Set(un.map((u) => u.chave));
  const novas = ticket && chavesAnteriores ? new Set([...chaves].filter((k) => !chavesAnteriores.has(k))) : new Set();
  if (ticket) chavesAnteriores = chaves;
  const pct = Math.min(100, (c.slots / c.capacidade) * 100);
  const linhas = c.linhas.length
    ? c.linhas.map((l) => `<li><span>${l.qtd}×</span><span>${esc(l.nome)}</span><b>${formatarBRL(l.total)}</b></li>`).join("")
    : '<li class="nada">A cesta está vazia. Que tal começar por um pão quentinho?</li>';
  const entrega = estado.entrega;
  const linhaFrete = entrega.tipo === "retirada"
    ? '<div class="gratis"><dt>Retirada na padaria</dt><dd>sem frete</dd></div>'
    : c.freteGratis ? '<div class="gratis"><dt>Frete</dt><dd>grátis</dd></div>' : `<div><dt>Frete</dt><dd>${formatarBRL(c.frete)}</dd></div>`;
  let dica = "";
  if (c.unidades) {
    if (c.proximoDesconto) dica = `Faltam ${formatarBRL(c.proximoDesconto.minimo - c.subtotalItens)} em itens para ${c.proximoDesconto.pct}% de desconto.`;
    else dica = "Você alcançou o maior desconto: 10% nos itens.";
    if (c.faltaParaFreteGratis > 0 && c.faltaParaFreteGratis < 4000) dica += ` E ${formatarBRL(c.faltaParaFreteGratis)} para o frete sair de graça.`;
  }
  const conflitos = conflitosDieta(estado);
  const alerta = conflitos.length
    ? `<div class="alerta-dieta"><b>Atenção às restrições</b>${conflitos.map((x) => `Fora de “${x.nome.toLowerCase()}”: ${x.itens.map(esc).join(", ")}.`).join("<br>")}</div>`
    : "";
  return `
    <div class="ticket-topo"><h3>${tam.nome} · ${emb.nome.toLowerCase()}</h3><span class="carimbo carimbo-red">seu kit</span></div>
    <div class="ticket-arte">${embalagemSVG(estado.embalagem, un, novas)}</div>
    <div class="lugares"><div class="barra-lugares ${pct >= 100 ? "cheia" : ""}" role="progressbar" aria-valuemin="0" aria-valuemax="${c.capacidade}" aria-valuenow="${c.slots}" aria-label="Lugares ocupados"><i style="width:${pct}%"></i></div><span>${c.slots} de ${c.capacidade} lugares</span></div>
    <ul class="linhas">${linhas}</ul>
    <dl class="somas">
      <div><dt>${emb.nome} (${tam.nome.toLowerCase()})</dt><dd>${formatarBRL(c.embalagem)}</dd></div>
      <div><dt>Itens</dt><dd>${formatarBRL(c.subtotalItens)}</dd></div>
      ${c.desconto ? `<div class="desc"><dt>Desconto de ${c.descontoPct}%</dt><dd>−${formatarBRL(c.desconto)}</dd></div>` : ""}
      ${c.extras.length ? `<div><dt>Extras</dt><dd>${formatarBRL(c.totalExtras)}</dd></div>` : ""}
      ${linhaFrete}
      ${c.taxaJanela ? `<div><dt>Janela madrugadão</dt><dd>${formatarBRL(c.taxaJanela)}</dd></div>` : ""}
      <div class="total"><dt>Total</dt><dd data-total>${formatarBRL(c.total)}</dd></div>
    </dl>
    ${dica ? `<p class="dica-ticket">${dica}</p>` : ""}
    ${alerta}
    ${ticket ? '<a class="botao ir" href="#resumo">Finalizar pedido ↓</a>' : ""}`;
}

function atualizar({ salvar = true } = {}) {
  const c = calcular(estado);

  // opções
  $$('input[name="tamanho"]').forEach((i) => (i.checked = i.value === estado.tamanho));
  $$('input[name="embalagem"]').forEach((i) => (i.checked = i.value === estado.embalagem));
  $$("[data-preco-emb]").forEach((e) => (e.textContent = formatarBRL(EMBALAGENS[e.dataset.precoEmb].precos[estado.tamanho])));
  $$('input[name="tipo"]').forEach((i) => (i.checked = i.value === estado.entrega.tipo));
  $$('input[name="janela"]').forEach((i) => { i.checked = i.value === estado.entrega.janela; i.disabled = estado.entrega.tipo === "retirada"; });
  $$('input[name="estilo-cartao"]').forEach((i) => (i.checked = i.value === estado.cartao.estilo));
  $$("[data-extra]").forEach((i) => (i.checked = estado.extras.includes(i.dataset.extra)));
  $$(".chip").forEach((b) => b.setAttribute("aria-pressed", String(estado.dieta.includes(b.dataset.dieta))));
  $("#endereco").hidden = estado.entrega.tipo === "retirada";

  // itens
  let visiveis = 0;
  for (const card of $$(".item")) {
    const it = ITENS.find((x) => x.id === card.dataset.id);
    const q = estado.itens[it.id] ?? 0;
    const atende = itemAtende(it, estado.dieta);
    card.hidden = !atende && q === 0;
    card.classList.toggle("fora", !atende && q > 0);
    card.classList.toggle("tem", q > 0);
    const out = $("output", card);
    if (out.textContent !== String(q)) { out.textContent = q; if (!reduzir) { out.classList.remove("bate"); void out.offsetWidth; out.classList.add("bate"); } }
    $(".qtd-selo", card).textContent = `×${q}`;
    $(".menos", card).disabled = q === 0;
    if (!card.hidden) visiveis++;
  }
  for (const sec of $$(".cat")) sec.hidden = !$$(".item", sec).some((i) => !i.hidden);
  $("#vazio-filtro").hidden = visiveis > 0;

  // cartão
  $("#cartao-ativo").checked = estado.cartao.ativo;
  $("#cartao-campos").hidden = !estado.cartao.ativo;
  $("#cartao-cont").textContent = estado.cartao.texto.length;
  const cc = estado.cartao;
  $("#cartao-previa").innerHTML = !cc.ativo
    ? '<div class="cartinha fantasma"><span>Ligue o cartão e escreva a sua mensagem. Ela aparece aqui, do jeito que vai chegar.</span></div>'
    : `<div class="cartinha ${cc.estilo}"><span class="para">${cc.para ? "Para " + esc(cc.para) + "," : "&nbsp;"}</span><span class="corpo ${cc.texto ? "" : "vazio"}">${cc.texto ? esc(cc.texto) : "Sua mensagem aparece aqui, escrita à mão."}</span><span class="de">${cc.de ? "— " + esc(cc.de) : ""}</span></div>`;

  // resumo
  $("#ticket").innerHTML = recibo(c, { ticket: true });
  $("#recibo-final").innerHTML = `<div class="recibo">${recibo(c, { ticket: false })}</div>`;
  const qtd = c.unidades ? `${c.unidades} ${c.unidades === 1 ? "item" : "itens"}` : "Kit vazio";
  $("#mini-qtd").textContent = qtd;
  $("#barra-qtd").textContent = qtd;
  const totalVisivel = c.unidades ? c.total : 0;
  animarValor($("#mini-total"), totalVisivel);
  animarValor($("#barra-total"), totalVisivel);
  const tot = $("#ticket [data-total]");
  if (tot) { totaisAnimados.set(tot, totaisAnimados.get($("#mini-total")) ?? c.total); animarValor(tot, c.total); }

  if (tentouEnviar) mostrarErros(false);
  if (salvar) gravar(CHAVE_RASCUNHO, estado);
}

// --- avisos, farelo, erros -----------------------------------------------------------

let tToast;
function aviso(texto) {
  const el = $("#toast");
  el.textContent = texto;
  el.hidden = false;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
  clearTimeout(tToast);
  tToast = setTimeout(() => (el.hidden = true), 4200);
}

function farelo(botao) {
  if (reduzir) return;
  const r = botao.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const f = document.createElement("span");
    f.className = "farelo";
    const ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.6;
    const dist = 26 + Math.random() * 30;
    f.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 14}px;--rot:${Math.random() * 360}deg;width:${4 + Math.random() * 5}px`;
    document.body.append(f);
    f.addEventListener("animationend", () => f.remove());
  }
}

const CAMPOS = { data: "#data", nome: "#nome", telefone: "#telefone", rua: "#rua", numero: "#numero", bairro: "#bairro", cartao: "#cartao-texto" };

function mostrarErros(rolar) {
  const erros = validar(estado, new Date());
  $$("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
  $$(".erro").forEach((e) => (e.textContent = ""));
  for (const e of erros) {
    const campo = $(CAMPOS[e.campo] ?? "");
    const msg = $(`#erro-${e.campo}`);
    if (campo) campo.setAttribute("aria-invalid", "true");
    if (msg) msg.textContent = e.mensagem;
  }
  const caixa = $("#erros-form");
  caixa.hidden = erros.length === 0;
  caixa.innerHTML = erros.length ? `<b>Falta pouco para encomendar:</b><ul>${erros.map((e) => `<li>${esc(e.mensagem)}</li>`).join("")}</ul>` : "";
  if (erros.length && rolar) {
    const primeiro = erros.find((e) => CAMPOS[e.campo]);
    const alvo = primeiro ? $(CAMPOS[primeiro.campo]) : $("#categorias");
    alvo.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "center" });
    alvo.focus?.({ preventScroll: true });
  }
  return erros;
}

// --- eventos ------------------------------------------------------------------------------

function ligarEventos() {
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.name === "tamanho") {
      const r = trocarTamanho(estado, el.value);
      estado = r.estado;
      if (r.removidos.length) aviso(`Tiramos ${r.removidos.length} ${r.removidos.length === 1 ? "item" : "itens"} que não cabiam no tamanho menor.`);
    } else if (el.name === "embalagem") estado = { ...estado, embalagem: el.value };
    else if (el.name === "tipo") estado = { ...estado, entrega: { ...estado.entrega, tipo: el.value } };
    else if (el.name === "janela") estado = { ...estado, entrega: { ...estado.entrega, janela: el.value } };
    else if (el.name === "estilo-cartao") estado = { ...estado, cartao: { ...estado.cartao, estilo: el.value } };
    else if (el.id === "cartao-ativo") estado = { ...estado, cartao: { ...estado.cartao, ativo: el.checked } };
    else if (el.dataset.extra) {
      const set = new Set(estado.extras);
      el.checked ? set.add(el.dataset.extra) : set.delete(el.dataset.extra);
      estado = { ...estado, extras: [...set] };
    } else return;
    atualizar();
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.acao) {
      const id = b.closest(".item").dataset.id;
      const r = ajustarItem(estado, id, b.dataset.acao === "mais" ? 1 : -1);
      if (r.motivo) { aviso(r.motivo); return; }
      estado = r.estado;
      if (b.dataset.acao === "mais") {
        farelo(b);
        const m = $("#mini-cesta");
        m.classList.remove("bate");
        void m.offsetWidth;
        m.classList.add("bate");
      }
      atualizar();
    } else if (b.dataset.dieta) {
      const set = new Set(estado.dieta);
      set.has(b.dataset.dieta) ? set.delete(b.dataset.dieta) : set.add(b.dataset.dieta);
      estado = { ...estado, dieta: [...set] };
      atualizar();
    }
  });

  const campos = {
    "#cartao-para": (v) => ({ cartao: { ...estado.cartao, para: v } }),
    "#cartao-de": (v) => ({ cartao: { ...estado.cartao, de: v } }),
    "#cartao-texto": (v) => ({ cartao: { ...estado.cartao, texto: v.slice(0, LIMITE_CARTAO) } }),
  };
  for (const [sel, fn] of Object.entries(campos)) {
    $(sel).addEventListener("input", (e) => { estado = { ...estado, ...fn(e.target.value) }; atualizar(); });
  }
  const entregaCampos = ["data", "nome", "rua", "numero", "complemento", "bairro", "obs"];
  for (const k of entregaCampos) {
    $("#" + k).addEventListener("input", (e) => { estado = { ...estado, entrega: { ...estado.entrega, [k]: e.target.value } }; atualizar(); });
  }
  $("#telefone").addEventListener("input", (e) => {
    const f = formatarTelefone(e.target.value);
    e.target.value = f;
    estado = { ...estado, entrega: { ...estado.entrega, telefone: f } };
    atualizar();
  });

  $("#btn-whats").addEventListener("click", () => {
    tentouEnviar = true;
    if (mostrarErros(true).length) return;
    $("#dlg-texto").value = montarMensagem(estado);
    $("#dlg-abrir").href = linkWhatsapp(estado);
    $("#dlg-whats").showModal();
  });
  $("#dlg-copiar").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#dlg-texto").value); aviso("Texto copiado."); }
    catch { $("#dlg-texto").select(); aviso("Selecione e copie o texto."); }
  });
  $("#btn-salvar").addEventListener("click", () => {
    if (!Object.keys(estado.itens).length) { aviso("Coloque pelo menos um item no kit antes de guardar."); return; }
    const lista = ler(CHAVE_SALVOS) ?? [];
    const c = calcular(estado);
    const id = "CP-" + Date.now().toString(36).toUpperCase().slice(-5);
    lista.unshift({ id, em: new Date().toISOString(), total: c.total, unidades: c.unidades, estado });
    gravar(CHAVE_SALVOS, lista.slice(0, 8));
    desenharSalvos();
    aviso(`Pedido ${id} guardado neste aparelho.`);
  });
  $("#btn-limpar").addEventListener("click", () => {
    if (!confirm("Começar um kit novo? O que você montou será apagado.")) return;
    estado = estadoInicial();
    preencherData();
    tentouEnviar = false;
    chavesAnteriores = null;
    sincronizarCampos();
    atualizar();
    mostrarErros(false);
    $("#erros-form").hidden = true;
    $$("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
  });
  $("#lista-salvos").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const lista = ler(CHAVE_SALVOS) ?? [];
    if (b.dataset.remontar) {
      const p = lista.find((x) => x.id === b.dataset.remontar);
      if (p) { estado = restaurar(p.estado); preencherData(); chavesAnteriores = null; sincronizarCampos(); atualizar(); aviso(`Kit ${p.id} recarregado. Confira a data de entrega.`); $("#montar").scrollIntoView({ behavior: "smooth" }); }
    } else if (b.dataset.apagar) {
      gravar(CHAVE_SALVOS, lista.filter((x) => x.id !== b.dataset.apagar));
      desenharSalvos();
    }
  });
}

function desenharSalvos() {
  const lista = ler(CHAVE_SALVOS) ?? [];
  $("#salvos").hidden = lista.length === 0;
  $("#lista-salvos").innerHTML = lista.map((p) => `<li><div><b>${p.id}</b> · ${formatarBRL(p.total)}<small>${p.unidades} itens, guardado em ${new Date(p.em).toLocaleDateString("pt-BR")}</small></div><button data-remontar="${p.id}">Remontar</button><button data-apagar="${p.id}" aria-label="Apagar ${p.id}">Apagar</button></li>`).join("");
}

function sincronizarCampos() {
  const e = estado.entrega;
  $("#data").value = e.data;
  for (const k of ["nome", "telefone", "rua", "numero", "complemento", "bairro", "obs"]) $("#" + k).value = e[k];
  $("#cartao-para").value = estado.cartao.para;
  $("#cartao-de").value = estado.cartao.de;
  $("#cartao-texto").value = estado.cartao.texto;
}

function preencherData() {
  const agora = new Date();
  const primeira = primeiraDataDisponivel(agora);
  if (!estado.entrega.data || estado.entrega.data < primeira) estado = { ...estado, entrega: { ...estado.entrega, data: primeira } };
  const d = $("#data");
  d.min = primeira;
  d.max = ultimaDataDisponivel(agora);
  $("#regra-data").textContent = `A padaria descansa às segundas. Se você pedir agora, a primeira entrega é ${formatarData(primeira)}. Pedidos feitos depois das ${NEGOCIO.horaCorte}h entram um dia depois.`;
}

// --- revelar ao rolar ---------------------------------------------------------------------------
function revelar() {
  const alvos = $$(".etiquetas li, .passo, .padaria-texto, .padaria-quadro, .titulo-sec");
  if (reduzir || !("IntersectionObserver" in window)) return;
  alvos.forEach((a, i) => { a.classList.add("revela"); a.style.transitionDelay = `${(i % 4) * 70}ms`; });
  const obs = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visivel"); obs.unobserve(en.target); } }), { threshold: 0.08 });
  alvos.forEach((a) => obs.observe(a));
}

montarFixos();
ligarEventos();
preencherData();
sincronizarCampos();
atualizar({ salvar: false });
desenharSalvos();
revelar();
if (Object.keys(estado.itens).length) aviso("Recuperamos o kit que você estava montando. Use “Começar de novo” para limpar.");
