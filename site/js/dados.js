// Dados fictícios da padaria. Preços em centavos, para somar sem erro de ponto flutuante.

export const NEGOCIO = {
  nome: "Crosta & Prosa",
  slogan: "Padaria artesanal de forno de lenha",
  // número de demonstração: troque pelo da padaria real
  whatsapp: "5500000000000",
  diaFechado: 1, // segunda-feira (0 = domingo)
  horaCorte: 18, // pedidos feitos depois das 18h só entram para o dia seguinte ao próximo
  maxDiasAFrente: 30,
};

export const TAMANHOS = {
  p: { id: "p", nome: "Para um", detalhe: "1 pessoa, café sem pressa", capacidade: 8 },
  m: { id: "m", nome: "Para dois", detalhe: "2 pessoas, com sobra para o lanche", capacidade: 14 },
  g: { id: "g", nome: "Para a família", detalhe: "4 a 6 pessoas, mesa farta", capacidade: 24 },
};

export const EMBALAGENS = {
  caixa: {
    id: "caixa",
    nome: "Caixa kraft",
    detalhe: "Papel reciclado, barbante e etiqueta carimbada",
    precos: { p: 900, m: 1200, g: 1800 },
  },
  cesta: {
    id: "cesta",
    nome: "Cesta de vime",
    detalhe: "Forrada com pano xadrez. A cesta fica com você",
    precos: { p: 3400, m: 4400, g: 6200 },
  },
};

export const CATEGORIAS = [
  { id: "paes", nome: "Pães e massas folhadas", nota: "Saem do forno de madrugada, no mesmo dia da entrega." },
  { id: "doces", nome: "Doces e bolos", nota: "Tudo feito na casa, sem corante artificial." },
  { id: "frios", nome: "Frios, geleias e pastas", nota: "Para passar, rechear e dividir." },
  { id: "bebidas", nome: "Bebidas", nota: "Em garrafa de vidro ou térmica, para chegar na temperatura certa." },
];

export const RESTRICOES = [
  { id: "sem-gluten", nome: "Sem glúten" },
  { id: "sem-lactose", nome: "Sem lactose" },
  { id: "vegano", nome: "Vegano" },
];

const SG = "sem-gluten";
const SL = "sem-lactose";
const VG = "vegano";

// slots: quanto espaço o item ocupa na cesta. icone: nome do desenho; cores: [a, b, c] usadas pelo desenho.
export const ITENS = [
  // pães
  { id: "frances", cat: "paes", nome: "Pão francês (2 un)", desc: "Casca fina e estalada, miolo leve.", preco: 350, slots: 1, tags: [SL, VG], icone: "frances", cores: ["#d9923f", "#f1cf8a", "#a8621f"] },
  { id: "baguete", cat: "paes", nome: "Baguete tradicional", desc: "Fermentação de 24 horas, cortes feitos à mão.", preco: 1200, slots: 2, tags: [SL, VG], icone: "baguete", cores: ["#d58a38", "#efc67f", "#9b5a1c"] },
  { id: "boule", cat: "paes", nome: "Meia broa de fermentação natural", desc: "Crosta escura e acidez suave.", preco: 1600, slots: 2, tags: [SL, VG], icone: "boule", cores: ["#b8692b", "#e8c280", "#7a3f17"] },
  { id: "brioche", cat: "paes", nome: "Brioche de manteiga", desc: "Macio, amanteigado, levemente doce.", preco: 800, slots: 1, tags: [], icone: "brioche", cores: ["#e0a24a", "#f6d98f", "#a8641f"] },
  { id: "paoqueijo", cat: "paes", nome: "Pão de queijo mineiro (4 un)", desc: "Polvilho azedo e queijo meia cura.", preco: 900, slots: 1, tags: [SG], icone: "paoqueijo", cores: ["#e8b25a", "#f7dc9c", "#b97a2a"] },
  { id: "focaccia", cat: "paes", nome: "Focaccia de alecrim", desc: "Azeite, sal grosso e alecrim do quintal.", preco: 900, slots: 1, tags: [SL, VG], icone: "focaccia", cores: ["#e3a647", "#6c8a4a", "#a8641f"] },
  { id: "croissant", cat: "paes", nome: "Croissant de manteiga", desc: "Oitenta camadas e crocância de verdade.", preco: 1100, slots: 1, tags: [], icone: "croissant", cores: ["#dc9a40", "#f3cf86", "#9c5a1b"] },
  { id: "croissant-am", cat: "paes", nome: "Croissant de amêndoas", desc: "Recheio de frangipane e lascas tostadas.", preco: 1400, slots: 1, tags: [], icone: "croissant", cores: ["#c98535", "#f0d9a6", "#8a4d17"] },
  { id: "pao-sg", cat: "paes", nome: "Mini pão sem glúten", desc: "Farinha de arroz e mandioca, assado à parte.", preco: 1200, slots: 1, tags: [SG, SL, VG], icone: "frances", cores: ["#caa66a", "#ecd9ae", "#8c6a34"] },
  { id: "pao-batata", cat: "paes", nome: "Pão de batata vegano", desc: "Macio como algodão, sem ovo nem leite.", preco: 800, slots: 1, tags: [SL, VG], icone: "brioche", cores: ["#e9bd6a", "#f8e3b0", "#b07a2c"] },

  // doces
  { id: "fuba", cat: "doces", nome: "Bolo de fubá (fatia)", desc: "Com erva-doce e cobertura de goiabada.", preco: 700, slots: 1, tags: [SG], icone: "fatia", cores: ["#f2c94c", "#d98a8a", "#a8641f"] },
  { id: "cenoura", cat: "doces", nome: "Bolo de cenoura (fatia)", desc: "Calda de chocolate meio amargo.", preco: 800, slots: 1, tags: [], icone: "fatia", cores: ["#e8893a", "#5a3220", "#8a4d17"] },
  { id: "cinnamon", cat: "doces", nome: "Rolinho de canela", desc: "Cobertura de cream cheese e açúcar mascavo.", preco: 1200, slots: 1, tags: [], icone: "rolinho", cores: ["#c47a35", "#f6ead2", "#7a3f17"] },
  { id: "sonho", cat: "doces", nome: "Sonho de doce de leite", desc: "Frito na hora, açucarado por fora.", preco: 900, slots: 1, tags: [], icone: "sonho", cores: ["#e5a653", "#fff3d6", "#a8641f"] },
  { id: "brigadeiro", cat: "doces", nome: "Brigadeiros gourmet (2 un)", desc: "Chocolate belga e granulado crocante.", preco: 800, slots: 1, tags: [SG], icone: "bolinhas", cores: ["#4a2a1a", "#7a4a2a", "#2e1a10"] },
  { id: "brownie", cat: "doces", nome: "Brownie vegano", desc: "Cacau 70% e nozes, úmido por dentro.", preco: 1000, slots: 1, tags: [SL, VG], icone: "brownie", cores: ["#4a2a1a", "#7a4a2a", "#2e1a10"] },
  { id: "cookie-sg", cat: "doces", nome: "Cookie sem glúten", desc: "Gotas de chocolate e farinha de amêndoas.", preco: 900, slots: 1, tags: [SG], icone: "cookie", cores: ["#d9a45a", "#4a2a1a", "#a8702a"] },
  { id: "limao", cat: "doces", nome: "Tortinha de limão", desc: "Massa sablée e merengue maçaricado.", preco: 1100, slots: 1, tags: [], icone: "tortinha", cores: ["#e8c36a", "#fff8e0", "#a8702a"] },

  // frios, geleias e pastas
  { id: "minas", cat: "frios", nome: "Queijo minas frescal (150 g)", desc: "Leite de pequenos produtores da região.", preco: 1400, slots: 1, tags: [SG], icone: "queijo", cores: ["#fbf0c8", "#f3dd94", "#c9a85a"] },
  { id: "brie", cat: "frios", nome: "Queijo brie (100 g)", desc: "Casca branca e miolo cremoso.", preco: 2200, slots: 1, tags: [SG], icone: "queijo", cores: ["#fff7dc", "#f1d98a", "#d9c58a"] },
  { id: "presunto", cat: "frios", nome: "Presunto artesanal (100 g)", desc: "Cozido lentamente, sem corante.", preco: 1300, slots: 1, tags: [SG, SL], icone: "fatiado", cores: ["#e99aa0", "#f7c4c4", "#b86a70"] },
  { id: "peru", cat: "frios", nome: "Peito de peru defumado (100 g)", desc: "Defumado em lenha de macieira.", preco: 1500, slots: 1, tags: [SG, SL], icone: "fatiado", cores: ["#e8b890", "#f5d6b8", "#b8825a"] },
  { id: "requeijao", cat: "frios", nome: "Requeijão cremoso caseiro", desc: "Pote de vidro de 200 g.", preco: 1200, slots: 1, tags: [SG], icone: "frasco", cores: ["#fff4d0", "#e8d9a0", "#c9a85a"] },
  { id: "manteiga", cat: "frios", nome: "Manteiga de leite cru", desc: "Pote de 150 g, levemente salgada.", preco: 1400, slots: 1, tags: [SG], icone: "frasco", cores: ["#fbe38a", "#e8c85a", "#b8962a"] },
  { id: "ghee", cat: "frios", nome: "Manteiga ghee", desc: "Sem lactose, aroma de castanha.", preco: 1800, slots: 1, tags: [SG, SL], icone: "frasco", cores: ["#f3c64a", "#d9a42a", "#a87a14"] },
  { id: "geleia", cat: "frios", nome: "Geleia de frutas vermelhas", desc: "Pouco açúcar, muita fruta.", preco: 1500, slots: 1, tags: [SG, SL, VG], icone: "frasco", cores: ["#b8324a", "#8a1f36", "#e8c06a"] },
  { id: "pasta-gb", cat: "frios", nome: "Pasta de grão-de-bico", desc: "Com limão-siciliano e azeite.", preco: 1400, slots: 1, tags: [SG, SL, VG], icone: "frasco", cores: ["#e8cf8a", "#c9a85a", "#6c8a4a"] },

  // bebidas
  { id: "cafe", cat: "bebidas", nome: "Café coado (térmica 500 ml)", desc: "Grãos de torra média, coado na hora.", preco: 1600, slots: 2, tags: [SG, SL, VG], icone: "caneca", cores: ["#4a2a1a", "#f6efe0", "#b8692b"] },
  { id: "choc", cat: "bebidas", nome: "Chocolate quente (térmica 500 ml)", desc: "Cremoso, com cacau de verdade.", preco: 1600, slots: 2, tags: [SG], icone: "caneca", cores: ["#6a3a24", "#f6efe0", "#c9852f"] },
  { id: "laranja", cat: "bebidas", nome: "Suco de laranja natural (300 ml)", desc: "Espremido de manhã, sem açúcar.", preco: 1100, slots: 1, tags: [SG, SL, VG], icone: "copo", cores: ["#f08a24", "#fbe6b8", "#c9661a"] },
  { id: "cha", cat: "bebidas", nome: "Chá gelado de hibisco (300 ml)", desc: "Com gengibre e folhas de hortelã.", preco: 1000, slots: 1, tags: [SG, SL, VG], icone: "copo", cores: ["#b8324a", "#f6dce0", "#7a1f36"] },
  { id: "aveia", cat: "bebidas", nome: "Leite de aveia (300 ml)", desc: "Feito aqui, para o café ou para beber.", preco: 1000, slots: 1, tags: [SL, VG], icone: "copo", cores: ["#f3e6c8", "#fffaf0", "#c9b080"] },
  { id: "iogurte", cat: "bebidas", nome: "Iogurte natural com granola", desc: "Mel de abelha-jataí por cima.", preco: 1200, slots: 1, tags: [SG], icone: "frasco", cores: ["#fffaf0", "#e8d9a0", "#d9a45a"] },
];

export const EXTRAS = [
  { id: "vela", nome: "Vela de aniversário", detalhe: "Uma vela, com fósforo", preco: 300, icone: "vela" },
  { id: "flores", nome: "Mini buquê de flores do campo", detalhe: "Em potinho de vidro", preco: 2200, icone: "flores" },
  { id: "guardanapo", nome: "Guardanapo de pano bordado", detalhe: "Bordado à mão, fica de lembrança", preco: 1800, icone: "guardanapo" },
];

export const JANELAS = [
  { id: "6-8", nome: "Madrugadão", rotulo: "6h às 8h", extra: 800 },
  { id: "8-10", nome: "Café clássico", rotulo: "8h às 10h", extra: 0 },
  { id: "10-12", nome: "Brunch", rotulo: "10h às 12h", extra: 0 },
];

export const ESTILOS_CARTAO = [
  { id: "kraft", nome: "Kraft" },
  { id: "floral", nome: "Floral" },
  { id: "listrado", nome: "Listrado" },
];

/** Desconto progressivo sobre o valor dos itens (não incide em embalagem, extras nem entrega). */
export const DESCONTOS = [
  { minimo: 18000, pct: 10 },
  { minimo: 10000, pct: 5 },
];

export const FRETE = { taxa: 1400, gratisAcima: 16000 };
export const LIMITE_POR_ITEM = 12;
export const LIMITE_CARTAO = 220;
