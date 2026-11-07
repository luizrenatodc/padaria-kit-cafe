import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ITENS, TAMANHOS } from "../site/js/dados.js";
import {
  ajustarItem, calcular, conflitosDieta, descontoPct, estadoInicial, formatarTelefone, linkWhatsapp, montarMensagem,
  primeiraDataDisponivel, restaurar, slotsUsados, trocarTamanho, validar, validarData,
} from "../site/js/kit.js";

// sábado, 7 de novembro de 2026, 10h
const SABADO_MANHA = new Date(2026, 10, 7, 10, 0);
const SABADO_NOITE = new Date(2026, 10, 7, 19, 0);

function com(estado, itens) {
  let e = estado;
  for (const [id, q] of Object.entries(itens)) for (let i = 0; i < q; i++) e = ajustarItem(e, id, 1).estado;
  return e;
}

function pedidoCompleto() {
  const e = com(estadoInicial(), { baguete: 1, croissant: 2, cafe: 1 });
  e.entrega = { ...e.entrega, data: "2026-11-10", nome: "Marina Costa", telefone: "(11) 91234-5678", rua: "Rua das Acácias", numero: "120", bairro: "Jardim Primavera" };
  return e;
}

describe("catálogo", () => {
  it("ids são únicos e preços positivos", () => {
    assert.equal(new Set(ITENS.map((i) => i.id)).size, ITENS.length);
    assert.ok(ITENS.every((i) => i.preco > 0 && i.slots >= 1));
  });
  it("vegano implica sem lactose", () => {
    for (const i of ITENS) if (i.tags.includes("vegano")) assert.ok(i.tags.includes("sem-lactose"), i.id);
  });
});

describe("montagem e capacidade", () => {
  it("soma itens e conta o espaço que cada um ocupa", () => {
    const e = com(estadoInicial(), { baguete: 1, croissant: 2 });
    assert.equal(slotsUsados(e), 2 + 2);
  });

  it("barra o item que não cabe, com o motivo, sem alterar o estado", () => {
    let e = estadoInicial();
    e.tamanho = "p"; // 8 espaços
    e = com(e, { baguete: 3, croissant: 2 }); // 6 + 2 = 8
    const r = ajustarItem(e, "frances", 1);
    assert.match(r.motivo, /cheia/);
    assert.equal(r.estado, e);
  });

  it("limita unidades por item", () => {
    let e = estadoInicial();
    e.tamanho = "g";
    e = com(e, { frances: 12 });
    assert.match(ajustarItem(e, "frances", 1).motivo, /No máximo 12/);
  });

  it("não deixa a quantidade ficar negativa", () => {
    const r = ajustarItem(estadoInicial(), "frances", -1);
    assert.deepEqual(r.estado.itens, {});
  });

  it("zerar um item o tira do kit", () => {
    const e = ajustarItem(com(estadoInicial(), { frances: 1 }), "frances", -1).estado;
    assert.ok(!("frances" in e.itens));
  });

  it("ao diminuir o tamanho, tira o que foi adicionado por último até caber", () => {
    let e = estadoInicial();
    e.tamanho = "g";
    e = com(e, { frances: 4, baguete: 3, croissant: 4, cafe: 1 }); // 4 + 6 + 4 + 2 = 16
    const r = trocarTamanho(e, "p"); // cabem 8
    assert.ok(slotsUsados(r.estado) <= TAMANHOS.p.capacidade);
    assert.ok(r.removidos.length > 0);
    assert.equal(r.estado.itens.frances, 4, "o primeiro item escolhido é preservado");
  });
});

describe("preço", () => {
  it("embalagem muda com tamanho e tipo", () => {
    const e = estadoInicial();
    e.entrega.tipo = "retirada";
    assert.equal(calcular({ ...e, tamanho: "p", embalagem: "caixa" }).total, 900);
    assert.equal(calcular({ ...e, tamanho: "m", embalagem: "cesta" }).total, 4400);
    assert.equal(calcular({ ...e, tamanho: "g", embalagem: "cesta" }).total, 6200);
  });

  it("soma itens, embalagem, frete e extras", () => {
    const e = com(estadoInicial(), { baguete: 1, croissant: 2 }); // 1200 + 2200 = 3400
    e.extras = ["vela"];
    const c = calcular(e);
    assert.equal(c.subtotalItens, 3400);
    assert.equal(c.total, 4400 + 3400 + 300 + 1400); // cesta M + itens + vela + frete
  });

  it("retirada não paga frete nem taxa de janela", () => {
    const e = com(estadoInicial(), { frances: 1 });
    e.entrega = { ...e.entrega, tipo: "retirada", janela: "6-8" };
    const c = calcular(e);
    assert.equal(c.frete, 0);
    assert.equal(c.taxaJanela, 0);
  });

  it("janela madrugadão cobra a mais só na entrega", () => {
    const e = com(estadoInicial(), { frances: 1 });
    e.entrega.janela = "6-8";
    assert.equal(calcular(e).taxaJanela, 800);
  });

  it("desconto progressivo por faixa, só nos itens", () => {
    assert.equal(descontoPct(9999), 0);
    assert.equal(descontoPct(10000), 5);
    assert.equal(descontoPct(18000), 10);
    let e = estadoInicial();
    e.tamanho = "g";
    e.entrega.tipo = "retirada";
    e = com(e, { baguete: 5, croissant: 4 }); // 6000 + 4400 = 10400
    const c = calcular(e);
    assert.equal(c.descontoPct, 5);
    assert.equal(c.desconto, 520);
    assert.equal(c.total, 6200 + 10400 - 520);
  });

  it("frete grátis acima do valor mínimo, considerando o desconto", () => {
    let e = estadoInicial();
    e.tamanho = "g";
    e = com(e, { boule: 6, baguete: 6 }); // 9600 + 7200 = 16800, 5% = 840 -> 15960
    let c = calcular(e);
    assert.equal(c.freteGratis, false);
    assert.equal(c.faltaParaFreteGratis, 40);
    e = { ...e, itens: { ...e.itens, croissant: 2 } }; // +2200 = 19000, 10% -> 17100
    c = calcular(e);
    assert.equal(c.freteGratis, true);
    assert.equal(c.frete, 0);
  });

  it("indica a próxima faixa de desconto", () => {
    const c = calcular(com(estadoInicial(), { frances: 1 }));
    assert.equal(c.proximoDesconto.pct, 5);
  });

  it("ignora ids que não existem mais", () => {
    const e = estadoInicial();
    e.itens = { fantasma: 3 };
    e.extras = ["fantasma"];
    const c = calcular(e);
    assert.equal(c.subtotalItens, 0);
    assert.equal(c.totalExtras, 0);
  });
});

describe("restrições alimentares", () => {
  it("aponta os itens que quebram cada restrição marcada", () => {
    const e = com(estadoInicial(), { baguete: 1, brie: 1, geleia: 1 });
    e.dieta = ["sem-gluten", "vegano"];
    const c = conflitosDieta(e);
    assert.equal(c.length, 2);
    assert.deepEqual(c.find((x) => x.restricao === "sem-gluten").itens, ["Baguete tradicional"]);
    assert.deepEqual(c.find((x) => x.restricao === "vegano").itens, ["Queijo brie (100 g)"]);
  });
  it("sem conflito não devolve nada", () => {
    const e = com(estadoInicial(), { geleia: 1, brownie: 1 });
    e.dieta = ["vegano", "sem-lactose"];
    assert.deepEqual(conflitosDieta(e), []);
  });
});

describe("datas de entrega", () => {
  it("amanhã se o pedido for feito antes da hora de corte", () => {
    assert.equal(primeiraDataDisponivel(SABADO_MANHA), "2026-11-08");
  });
  it("depois do corte, pula um dia e a segunda-feira fechada", () => {
    assert.equal(primeiraDataDisponivel(SABADO_NOITE), "2026-11-10");
  });
  it("recusa segunda-feira, passado, hoje e datas distantes demais", () => {
    assert.match(validarData("2026-11-09", SABADO_MANHA), /descansa às segundas/);
    assert.match(validarData("2026-11-06", SABADO_MANHA), /antecedência/);
    assert.match(validarData("2026-11-07", SABADO_MANHA), /antecedência/);
    assert.match(validarData("2026-12-20", SABADO_MANHA), /30 dias/);
    assert.match(validarData("", SABADO_MANHA), /Escolha a data/);
  });
  it("aceita terça-feira", () => {
    assert.equal(validarData("2026-11-10", SABADO_MANHA), null);
  });
  it("depois do corte explica a nova data", () => {
    assert.match(validarData("2026-11-08", SABADO_NOITE), /depois das 18h/);
  });
});

describe("validação do pedido", () => {
  it("pedido completo passa", () => {
    assert.deepEqual(validar(pedidoCompleto(), SABADO_MANHA), []);
  });
  it("kit vazio e dados faltando geram erros por campo", () => {
    const campos = validar(estadoInicial(), SABADO_MANHA).map((e) => e.campo);
    for (const c of ["itens", "data", "nome", "telefone", "rua", "numero", "bairro"]) assert.ok(campos.includes(c), c);
  });
  it("retirada não exige endereço", () => {
    const e = pedidoCompleto();
    e.entrega = { ...e.entrega, tipo: "retirada", rua: "", numero: "", bairro: "" };
    assert.deepEqual(validar(e, SABADO_MANHA), []);
  });
  it("cartão ligado precisa de texto", () => {
    const e = pedidoCompleto();
    e.cartao.ativo = true;
    assert.ok(validar(e, SABADO_MANHA).some((x) => x.campo === "cartao"));
  });
  it("telefone com poucos dígitos é recusado", () => {
    const e = pedidoCompleto();
    e.entrega.telefone = "12345";
    assert.ok(validar(e, SABADO_MANHA).some((x) => x.campo === "telefone"));
  });
  it("formata telefone enquanto digita", () => {
    assert.equal(formatarTelefone("11912345678"), "(11) 91234-5678");
    assert.equal(formatarTelefone("1133334444"), "(11) 3333-4444");
    assert.equal(formatarTelefone("119"), "(11) 9");
  });
});

describe("mensagem do pedido", () => {
  it("traz itens, total, endereço e cartão", () => {
    const e = pedidoCompleto();
    e.cartao = { ativo: true, estilo: "floral", para: "Mãe", de: "Marina", texto: "Feliz aniversário!" };
    e.extras = ["flores"];
    const m = montarMensagem(e);
    assert.match(m, /1x Baguete tradicional - R\$\s12,00/);
    assert.match(m, /2x Croissant de manteiga - R\$\s22,00/);
    assert.match(m, /Mini buquê de flores do campo/);
    assert.match(m, /terça-feira, 10\/11, 8h às 10h/);
    assert.match(m, /Rua das Acácias, 120 - Jardim Primavera/);
    assert.match(m, /Para: Mãe/);
    assert.match(m, /"Feliz aniversário!"/);
    assert.match(m, new RegExp(`\\*Total: ${calcular(e).total === 0 ? "" : "R\\$"}`));
  });
  it("avisa quando um item quebra a restrição marcada", () => {
    const e = pedidoCompleto();
    e.dieta = ["sem-gluten"];
    assert.match(montarMensagem(e), /Atenção: .* fora de "sem glúten": Baguete tradicional; Croissant de manteiga/);
  });
  it("o link do WhatsApp leva o texto codificado", () => {
    const link = linkWhatsapp(pedidoCompleto());
    assert.match(link, /^https:\/\/wa\.me\/\d+\?text=/);
    assert.ok(decodeURIComponent(link.split("text=")[1]).includes("Kit Café da Manhã"));
  });
});

describe("rascunho salvo", () => {
  it("restaura o que ainda existe e descarta o resto", () => {
    const r = restaurar({ tamanho: "g", embalagem: "caixa", itens: { baguete: 2, fantasma: 5, croissant: -1 }, dieta: ["vegano", "x"], extras: ["vela", "y"] });
    assert.deepEqual(r.itens, { baguete: 2 });
    assert.deepEqual(r.dieta, ["vegano"]);
    assert.deepEqual(r.extras, ["vela"]);
    assert.equal(r.embalagem, "caixa");
  });
  it("lixo vira estado inicial", () => {
    assert.deepEqual(restaurar(null), estadoInicial());
    assert.deepEqual(restaurar("texto"), estadoInicial());
  });
  it("rascunho maior que o tamanho é aparado", () => {
    const r = restaurar({ tamanho: "p", itens: { baguete: 12 } });
    assert.ok(slotsUsados(r) <= 8);
  });
});
