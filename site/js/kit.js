// Regras do kit: montagem, capacidade da cesta, preço, restrições, datas e mensagem do pedido.
// Tudo aqui é função pura (sem DOM), por isso é testado em test/kit.test.js.
import {
  DESCONTOS, EMBALAGENS, EXTRAS, FRETE, ITENS, JANELAS, LIMITE_CARTAO, LIMITE_POR_ITEM, NEGOCIO, RESTRICOES, TAMANHOS,
} from "./dados.js";

const porId = (lista) => Object.fromEntries(lista.map((x) => [x.id, x]));
const ITEM = porId(ITENS);
const EXTRA = porId(EXTRAS);
const JANELA = porId(JANELAS);

export function estadoInicial() {
  return {
    tamanho: "m",
    embalagem: "cesta",
    itens: {},
    dieta: [],
    cartao: { ativo: false, estilo: "kraft", para: "", de: "", texto: "" },
    extras: [],
    entrega: { tipo: "entrega", data: "", janela: "8-10", nome: "", telefone: "", rua: "", numero: "", complemento: "", bairro: "", obs: "" },
  };
}

export function formatarBRL(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function slotsUsados(estado) {
  return Object.entries(estado.itens).reduce((s, [id, q]) => s + (ITEM[id]?.slots ?? 0) * q, 0);
}

export function totalDeItens(estado) {
  return Object.values(estado.itens).reduce((s, q) => s + q, 0);
}

/**
 * Soma ou tira uma unidade de um item. Devolve o novo estado e, se a ação foi barrada,
 * o motivo (a interface mostra isso ao cliente). Nunca altera o estado recebido.
 */
export function ajustarItem(estado, id, delta) {
  const item = ITEM[id];
  if (!item) return { estado, motivo: "Item desconhecido." };
  const atual = estado.itens[id] ?? 0;
  const novo = atual + delta;
  if (novo < 0) return { estado, motivo: null };
  if (delta > 0) {
    if (atual >= LIMITE_POR_ITEM) return { estado, motivo: `No máximo ${LIMITE_POR_ITEM} unidades de cada item.` };
    const cap = TAMANHOS[estado.tamanho].capacidade;
    if (slotsUsados(estado) + item.slots * delta > cap) {
      return { estado, motivo: `A ${estado.embalagem === "caixa" ? "caixa" : "cesta"} já está cheia. Escolha um tamanho maior ou tire algo.` };
    }
  }
  const itens = { ...estado.itens };
  if (novo === 0) delete itens[id];
  else itens[id] = novo;
  return { estado: { ...estado, itens }, motivo: null };
}

/** Troca o tamanho. Se os itens não couberem no menor, tira os últimos adicionados até caber. */
export function trocarTamanho(estado, tamanho) {
  if (!TAMANHOS[tamanho]) return { estado, removidos: [] };
  let atual = { ...estado, tamanho, itens: { ...estado.itens } };
  const removidos = [];
  const ordem = Object.keys(atual.itens).reverse();
  const cap = TAMANHOS[tamanho].capacidade;
  for (const id of ordem) {
    while (slotsUsados(atual) > cap && atual.itens[id]) {
      atual = ajustarItem(atual, id, -1).estado;
      removidos.push(id);
    }
  }
  return { estado: atual, removidos };
}

export function descontoPct(subtotalItens) {
  return DESCONTOS.find((d) => subtotalItens >= d.minimo)?.pct ?? 0;
}

export function calcular(estado) {
  const emb = EMBALAGENS[estado.embalagem];
  const embalagem = emb.precos[estado.tamanho];
  const linhas = Object.entries(estado.itens)
    .filter(([id]) => ITEM[id])
    .map(([id, qtd]) => ({ id, nome: ITEM[id].nome, qtd, unitario: ITEM[id].preco, total: ITEM[id].preco * qtd }));
  const subtotalItens = linhas.reduce((s, l) => s + l.total, 0);
  const pct = descontoPct(subtotalItens);
  const desconto = Math.round((subtotalItens * pct) / 100);
  const itensComDesconto = subtotalItens - desconto;
  const extras = estado.extras.filter((id) => EXTRA[id]).map((id) => ({ id, nome: EXTRA[id].nome, total: EXTRA[id].preco }));
  const totalExtras = extras.reduce((s, e) => s + e.total, 0);

  const entrega = estado.entrega;
  const entregar = entrega.tipo === "entrega";
  const freteGratis = entregar && itensComDesconto >= FRETE.gratisAcima;
  const frete = entregar && !freteGratis ? FRETE.taxa : 0;
  const taxaJanela = entregar ? (JANELA[entrega.janela]?.extra ?? 0) : 0;
  const total = embalagem + itensComDesconto + totalExtras + frete + taxaJanela;

  const cap = TAMANHOS[estado.tamanho].capacidade;
  return {
    embalagem,
    linhas,
    subtotalItens,
    descontoPct: pct,
    desconto,
    proximoDesconto: DESCONTOS.slice().reverse().find((d) => subtotalItens < d.minimo) ?? null,
    extras,
    totalExtras,
    frete,
    freteGratis,
    faltaParaFreteGratis: entregar && !freteGratis ? FRETE.gratisAcima - itensComDesconto : 0,
    taxaJanela,
    total,
    slots: slotsUsados(estado),
    capacidade: cap,
    unidades: totalDeItens(estado),
  };
}

/** Itens do kit que não atendem as restrições marcadas, por restrição. */
export function conflitosDieta(estado) {
  const saida = [];
  for (const r of estado.dieta) {
    const quebram = Object.keys(estado.itens).filter((id) => ITEM[id] && !ITEM[id].tags.includes(r));
    if (quebram.length) saida.push({ restricao: r, nome: RESTRICOES.find((x) => x.id === r)?.nome ?? r, itens: quebram.map((id) => ITEM[id].nome) });
  }
  return saida;
}

export function itemAtende(item, dieta) {
  return dieta.every((r) => item.tags.includes(r));
}

// --- datas ---------------------------------------------------------------

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daIso = (s) => new Date(`${s}T12:00:00`);

/** Primeira data de entrega: amanhã (ou depois de amanhã, se o pedido for após a hora de corte), pulando o dia fechado. */
export function primeiraDataDisponivel(agora) {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 12);
  d.setDate(d.getDate() + (agora.getHours() >= NEGOCIO.horaCorte ? 2 : 1));
  while (d.getDay() === NEGOCIO.diaFechado) d.setDate(d.getDate() + 1);
  return iso(d);
}

export function ultimaDataDisponivel(agora) {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 12);
  d.setDate(d.getDate() + NEGOCIO.maxDiasAFrente);
  return iso(d);
}

export function validarData(dataIso, agora) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataIso ?? "")) return "Escolha a data da entrega.";
  const d = daIso(dataIso);
  // "2026-11-31" vira 1º de dezembro no Date; só vale se a data voltar igual
  if (Number.isNaN(d.getTime()) || iso(d) !== dataIso) return "Data inválida.";
  if (dataIso < primeiraDataDisponivel(agora) && d.getDay() !== NEGOCIO.diaFechado) {
    return agora.getHours() >= NEGOCIO.horaCorte
      ? `Pedidos feitos depois das ${NEGOCIO.horaCorte}h entram a partir de ${formatarData(primeiraDataDisponivel(agora))}.`
      : "Precisamos de pelo menos um dia de antecedência.";
  }
  if (d.getDay() === NEGOCIO.diaFechado) return "A padaria descansa às segundas-feiras. Escolha outro dia.";
  if (dataIso > ultimaDataDisponivel(agora)) return `Aceitamos encomendas com até ${NEGOCIO.maxDiasAFrente} dias de antecedência.`;
  return null;
}

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
export function formatarData(dataIso) {
  const d = daIso(dataIso);
  return `${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// --- validação e mensagem ------------------------------------------------

export function validar(estado, agora = new Date()) {
  const erros = [];
  const e = estado.entrega;
  if (!totalDeItens(estado)) erros.push({ campo: "itens", mensagem: "Escolha pelo menos um item para o kit." });
  const cap = TAMANHOS[estado.tamanho].capacidade;
  if (slotsUsados(estado) > cap) erros.push({ campo: "itens", mensagem: "Os itens não cabem no tamanho escolhido." });
  const erroData = validarData(e.data, agora);
  if (erroData) erros.push({ campo: "data", mensagem: erroData });
  if (!e.nome.trim()) erros.push({ campo: "nome", mensagem: "Diga o seu nome." });
  const tel = e.telefone.replace(/\D/g, "");
  if (tel.length < 10 || tel.length > 11) erros.push({ campo: "telefone", mensagem: "Informe um telefone com DDD." });
  if (e.tipo === "entrega") {
    if (!e.rua.trim()) erros.push({ campo: "rua", mensagem: "Informe a rua." });
    if (!e.numero.trim()) erros.push({ campo: "numero", mensagem: "Informe o número." });
    if (!e.bairro.trim()) erros.push({ campo: "bairro", mensagem: "Informe o bairro." });
    if (!JANELA[e.janela]) erros.push({ campo: "janela", mensagem: "Escolha a janela de entrega." });
  }
  if (estado.cartao.ativo && !estado.cartao.texto.trim()) erros.push({ campo: "cartao", mensagem: "Escreva a mensagem do cartão ou desmarque o cartão." });
  if (estado.cartao.texto.length > LIMITE_CARTAO) erros.push({ campo: "cartao", mensagem: `A mensagem do cartão tem no máximo ${LIMITE_CARTAO} letras.` });
  return erros;
}

export function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function montarMensagem(estado) {
  const c = calcular(estado);
  const e = estado.entrega;
  const emb = EMBALAGENS[estado.embalagem];
  const tam = TAMANHOS[estado.tamanho];
  const l = [];
  l.push(`Olá, ${NEGOCIO.nome}! Quero encomendar um *Kit Café da Manhã*.`, "");
  l.push(`*Kit:* ${tam.nome.toLowerCase()} em ${emb.nome.toLowerCase()} (${formatarBRL(c.embalagem)})`);
  l.push("", "*Itens*");
  for (const x of c.linhas) l.push(`• ${x.qtd}x ${x.nome} - ${formatarBRL(x.total)}`);
  if (c.desconto) l.push(`Desconto de ${c.descontoPct}% nos itens: -${formatarBRL(c.desconto)}`);
  if (c.extras.length) {
    l.push("", "*Extras*");
    for (const x of c.extras) l.push(`• ${x.nome} - ${formatarBRL(x.total)}`);
  }
  if (estado.dieta.length) {
    const nomes = estado.dieta.map((id) => RESTRICOES.find((r) => r.id === id)?.nome.toLowerCase()).join(", ");
    l.push("", `*Restrições:* ${nomes}`);
    for (const x of conflitosDieta(estado)) l.push(`Atenção: ${x.itens.length} item(ns) fora de "${x.nome.toLowerCase()}": ${x.itens.join("; ")}`);
  }
  if (estado.cartao.ativo && estado.cartao.texto.trim()) {
    l.push("", "*Cartão com mensagem*");
    if (estado.cartao.para.trim()) l.push(`Para: ${estado.cartao.para.trim()}`);
    l.push(`"${estado.cartao.texto.trim()}"`);
    if (estado.cartao.de.trim()) l.push(`De: ${estado.cartao.de.trim()}`);
  }
  l.push("", e.tipo === "entrega" ? "*Entrega*" : "*Retirada na padaria*");
  l.push(`${e.data ? formatarData(e.data) : "data a combinar"}${e.tipo === "entrega" ? `, ${JANELA[e.janela]?.rotulo ?? ""}` : ""}`);
  if (e.tipo === "entrega") {
    l.push(`${e.rua.trim()}, ${e.numero.trim()}${e.complemento.trim() ? ` (${e.complemento.trim()})` : ""} - ${e.bairro.trim()}`);
    l.push(c.freteGratis ? "Frete: grátis" : `Frete: ${formatarBRL(c.frete)}`);
    if (c.taxaJanela) l.push(`Janela madrugadão: +${formatarBRL(c.taxaJanela)}`);
  }
  if (e.obs.trim()) l.push(`Obs.: ${e.obs.trim()}`);
  l.push("", `*Total: ${formatarBRL(c.total)}*`, "", `${e.nome.trim()} - ${e.telefone.trim()}`);
  return l.join("\n");
}

export function linkWhatsapp(estado) {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(montarMensagem(estado))}`;
}

// --- persistência (rascunho e pedidos salvos) ----------------------------------

/** Restaura um estado vindo do armazenamento, descartando o que não existe mais no catálogo. */
export function restaurar(bruto) {
  const base = estadoInicial();
  if (!bruto || typeof bruto !== "object") return base;
  const e = { ...base };
  if (TAMANHOS[bruto.tamanho]) e.tamanho = bruto.tamanho;
  if (EMBALAGENS[bruto.embalagem]) e.embalagem = bruto.embalagem;
  for (const [id, q] of Object.entries(bruto.itens ?? {})) {
    if (ITEM[id] && Number.isInteger(q) && q > 0) e.itens[id] = Math.min(q, LIMITE_POR_ITEM);
  }
  e.dieta = (bruto.dieta ?? []).filter((r) => RESTRICOES.some((x) => x.id === r));
  e.extras = (bruto.extras ?? []).filter((id) => EXTRA[id]);
  e.cartao = { ...base.cartao, ...pick(bruto.cartao, ["ativo", "estilo", "para", "de", "texto"]) };
  e.entrega = { ...base.entrega, ...pick(bruto.entrega, Object.keys(base.entrega)) };
  e.cartao.ativo = Boolean(e.cartao.ativo);
  // se o rascunho antigo não cabe mais, aparar de novo
  return trocarTamanho(e, e.tamanho).estado;
}

function pick(obj, chaves) {
  const saida = {};
  if (!obj || typeof obj !== "object") return saida;
  for (const k of chaves) if (typeof obj[k] === "string" || typeof obj[k] === "boolean") saida[k] = obj[k];
  return saida;
}

export const catalogo = { item: ITEM, extra: EXTRA, janela: JANELA };
