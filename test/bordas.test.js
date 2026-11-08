import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FRETE, LIMITE_POR_ITEM } from "../site/js/dados.js";
import {
  ajustarItem, calcular, descontoPct, estadoInicial, formatarBRL, formatarData, formatarTelefone, montarMensagem,
  primeiraDataDisponivel, restaurar, slotsUsados, trocarTamanho, ultimaDataDisponivel, validar,
} from "../site/js/kit.js";

function pedido(extra = {}) {
  const e = estadoInicial();
  e.itens = { baguete: 1, cafe: 1 };
  e.entrega = { ...e.entrega, data: "2026-11-10", nome: "Marina Costa", telefone: "(11) 91234-5678", rua: "Rua das Acácias", numero: "120", bairro: "Jardim Primavera" };
  return { ...e, ...extra };
}

// 2026-11-07 é sábado
const em = (m, d, h) => new Date(2026, m - 1, d, h);

describe("dinheiro e descontos: fronteiras", () => {
  it("formata centavos em reais", () => {
    assert.match(formatarBRL(0), /^R\$\s0,00$/);
    assert.match(formatarBRL(123456), /^R\$\s1\.234,56$/);
    assert.match(formatarBRL(5), /^R\$\s0,05$/);
  });
  it("o desconto muda exatamente no valor mínimo da faixa", () => {
    assert.deepEqual([9999, 10000, 17999, 18000].map(descontoPct), [0, 5, 5, 10]);
  });
  it("kit vazio custa só a embalagem mais o frete", () => {
    const c = calcular(estadoInicial());
    assert.equal(c.unidades, 0);
    assert.equal(c.total, c.embalagem + FRETE.taxa);
  });
});

describe("datas: viradas de mês e de ano", () => {
  it("31 de dezembro de manhã entrega em 1º de janeiro", () => {
    assert.equal(primeiraDataDisponivel(new Date(2026, 11, 31, 10)), "2027-01-01");
  });
  it("31 de dezembro depois do corte pula para 2 de janeiro", () => {
    assert.equal(primeiraDataDisponivel(new Date(2026, 11, 31, 18)), "2027-01-02");
  });
  it("às 17h ainda vale o dia seguinte e às 18h já não", () => {
    assert.equal(primeiraDataDisponivel(em(11, 7, 17)), "2026-11-08");
    assert.equal(primeiraDataDisponivel(em(11, 7, 18)), "2026-11-10"); // dia 9 é segunda, fechada
  });
  it("domingo pula a segunda-feira fechada", () => {
    assert.equal(primeiraDataDisponivel(em(11, 8, 10)), "2026-11-10");
  });
  it("a última data atravessa o fim do ano", () => {
    assert.equal(ultimaDataDisponivel(new Date(2026, 11, 20, 10)), "2027-01-19");
  });
  it("formata a data com o dia da semana", () => {
    assert.equal(formatarData("2026-11-10"), "terça-feira, 10/11");
    assert.equal(formatarData("2027-01-01"), "sexta-feira, 01/01");
  });
});

describe("validação: telefone, nome e cartão", () => {
  const agora = em(11, 7, 10);
  const campos = (e) => validar(e, agora).map((x) => x.campo);

  it("aceita telefone com 10 e 11 dígitos e recusa 9 e 12", () => {
    for (const [tel, ok] of [["1133334444", true], ["11912345678", true], ["113333444", false], ["119123456789", false], ["(11) abcd-efgh", false]]) {
      const e = pedido();
      e.entrega.telefone = tel;
      assert.equal(!campos(e).includes("telefone"), ok, tel);
    }
  });
  it("nome só com espaços é recusado", () => {
    const e = pedido();
    e.entrega.nome = "   ";
    assert.ok(campos(e).includes("nome"));
  });
  it("cartão ligado com mensagem só de espaços é recusado; desligado não exige texto", () => {
    const e = pedido();
    e.cartao = { ...e.cartao, ativo: true, texto: "   " };
    assert.ok(campos(e).includes("cartao"));
    e.cartao.ativo = false;
    assert.ok(!campos(e).includes("cartao"));
  });
  it("retirada não exige rua, número, bairro nem janela", () => {
    const e = pedido();
    e.entrega = { ...e.entrega, tipo: "retirada", rua: "", numero: "", bairro: "", janela: "" };
    assert.deepEqual(campos(e), []);
  });
  it("a janela inexistente barra a entrega", () => {
    const e = pedido();
    e.entrega.janela = "99-100";
    assert.ok(campos(e).includes("janela"));
  });
});

describe("telefone digitado", () => {
  it("ignora letras, limita a 11 dígitos e monta a máscara aos poucos", () => {
    assert.equal(formatarTelefone("abc11987654321999"), "(11) 98765-4321");
    assert.deepEqual(["", "1", "11", "119", "1198765", "11987654321"].map(formatarTelefone), ["", "1", "11", "(11) 9", "(11) 9876-5", "(11) 98765-4321"]);
    assert.equal(formatarTelefone("1133334444"), "(11) 3333-4444");
  });
});

describe("mensagem do pedido", () => {
  it("retirada não traz endereço nem frete", () => {
    const e = pedido();
    e.entrega.tipo = "retirada";
    const m = montarMensagem(e);
    assert.match(m, /\*Retirada na padaria\*/);
    assert.doesNotMatch(m, /Frete/);
    assert.doesNotMatch(m, /Rua das Acácias/);
  });
  it("inclui complemento e observação aparados", () => {
    const e = pedido();
    e.entrega.complemento = "  apto 12 ";
    e.entrega.obs = "  portaria 24h ";
    const m = montarMensagem(e);
    assert.match(m, /Rua das Acácias, 120 \(apto 12\) - Jardim Primavera/);
    assert.match(m, /Obs\.: portaria 24h/);
  });
  it("sem data escolhida diz 'data a combinar'", () => {
    const e = pedido();
    e.entrega.data = "";
    assert.match(montarMensagem(e), /data a combinar/);
  });
  it("cartão sem destinatário nem remetente traz só a mensagem", () => {
    const e = pedido();
    e.cartao = { ativo: true, estilo: "kraft", para: "", de: "", texto: "  Bom dia!  " };
    const m = montarMensagem(e);
    assert.match(m, /"Bom dia!"/);
    assert.doesNotMatch(m, /Para:|De:/);
  });
});

describe("montagem e rascunho: casos limite", () => {
  it("ajustar item desconhecido não altera o estado e explica", () => {
    const e = estadoInicial();
    const r = ajustarItem(e, "nao-existe", 1);
    assert.equal(r.estado, e);
    assert.match(r.motivo, /desconhecido/i);
  });
  it("trocar para um tamanho que não existe devolve o mesmo estado", () => {
    const e = pedido();
    const r = trocarTamanho(e, "gigante");
    assert.equal(r.estado, e);
    assert.deepEqual(r.removidos, []);
  });
  it("restaurar descarta quantidades inválidas e respeita o teto por item e a capacidade", () => {
    const e = restaurar({ itens: { baguete: 99, cafe: 1.5, croissant: -2, suco: "3" } });
    assert.ok(e.itens.baguete >= 1 && e.itens.baguete <= LIMITE_POR_ITEM);
    assert.ok(slotsUsados(e) <= calcular(e).capacidade);
    assert.equal(e.itens.cafe, undefined);
    assert.equal(e.itens.croissant, undefined);
  });
  it("restaurar não confia em valores que não são texto", () => {
    const e = restaurar({ entrega: { nome: 123, rua: ["x"], bairro: "Centro" } });
    assert.equal(e.entrega.nome, "");
    assert.equal(e.entrega.rua, "");
    assert.equal(e.entrega.bairro, "Centro");
  });
});
