# Arquitetura

Site estático, sem build e sem dependências. O navegador carrega módulos ES direto de `site/`; `npm start` só serve a pasta para que os módulos funcionem (`file://` não serve).

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `site/index.html` | Estrutura da página: passos do kit, resumo, diálogo da mensagem do WhatsApp. Traz a CSP em `<meta>`. |
| `site/css/estilo.css` | Visual. As cores ficam em variáveis no `:root`; o contraste delas é conferido por teste. |
| `site/js/dados.js` | Dados fictícios: negócio, tamanhos, embalagens, categorias, itens, extras, janelas de entrega, descontos e frete. Preços em centavos. |
| `site/js/kit.js` | Regras do kit. Só funções puras, sem acesso ao DOM, e é aqui que ficam os testes. |
| `site/js/app.js` | Interface: desenha o catálogo, liga os eventos, chama `kit.js` e atualiza a tela. |
| `site/js/ilustracoes.js` | Desenhos em SVG (sprites dos itens, cesta, caixa, hero). |
| `scripts/servir.mjs` | Servidor estático local para `npm start`. |
| `scripts/telas.mjs`, `scripts/montar_gif.py` | Geram as capturas e o GIF de `docs/` usando o site de verdade. |

## Fluxo de dados

O `app.js` mantém um único objeto `estado` e nunca o altera no lugar: cada ação chama uma função de `kit.js` que devolve um estado novo.

```
clique ou digitação -> ajustarItem / trocarTamanho / campos -> novo estado
                                                                   |
                      atualizar(): calcular(estado), validar, desenhar ticket e recibo
                                                                   |
                                          grava o rascunho no localStorage
```

Formato do estado (`estadoInicial()`):

- `tamanho` (`p`, `m` ou `g`), `embalagem` (`caixa` ou `cesta`)
- `itens`: mapa `id -> quantidade`
- `dieta`: restrições marcadas (sem glúten, sem lactose, vegano)
- `cartao`: `ativo`, `estilo`, `para`, `de`, `texto`
- `extras`: lista de ids
- `entrega`: `tipo` (`entrega` ou `retirada`), `data`, `janela`, dados do cliente e endereço

## Regras de `kit.js`

- **Capacidade.** Cada item ocupa `slots` lugares e cada tamanho tem uma capacidade (8, 14 ou 24). `ajustarItem` recusa o que não cabe e devolve o motivo para a tela. Há um teto de 12 unidades por item. Ao diminuir o tamanho, `trocarTamanho` tira primeiro o que foi adicionado por último.
- **Preço.** `calcular` soma embalagem (depende do tamanho e do tipo), itens com desconto, extras, frete e taxa da janela. O desconto é progressivo sobre os itens (5% a partir de R$ 100,00 e 10% a partir de R$ 180,00) e não incide em embalagem, extras nem frete. O frete é grátis acima de R$ 160,00 em itens já com desconto; na retirada não há frete nem taxa de janela.
- **Restrições.** Item atende a restrição se tiver a tag correspondente. Marcar uma restrição filtra o catálogo; se o kit já tinha itens que não servem, `conflitosDieta` os lista e a mensagem do pedido avisa.
- **Datas.** A padaria fecha às segundas. Pedidos feitos até as 18h entram para o dia seguinte; depois disso, para o dia depois dele. `primeiraDataDisponivel` pula a segunda, `ultimaDataDisponivel` limita a 30 dias e `validarData` recusa formato inválido, dia que não existe no calendário, passado, segunda-feira e datas distantes.
- **Validação.** `validar` devolve uma lista de `{ campo, mensagem }`. A tela marca o campo com `aria-invalid` e escreve a mensagem no aviso ligado a ele.
- **Mensagem.** `montarMensagem` gera o texto do pedido em formato do WhatsApp e `linkWhatsapp` o codifica em um link `wa.me`. O número é fictício.

## Persistência

Só no navegador, via `localStorage`, com `try/catch` para quando o armazenamento estiver indisponível:

- rascunho do kit atual (gravado a cada alteração);
- até 8 pedidos guardados no aparelho.

`restaurar` reconstrói o estado a partir do que foi gravado: descarta ids que não existem mais no catálogo, quantidades inválidas, tipo de entrega, janela e papel de cartão desconhecidos, e apara o kit se ele não couber no tamanho.

## Testes

`npm test` roda `node --test test/*.test.js` e cobre as regras de `kit.js`, o servidor local, a acessibilidade e a CSP do HTML estático e o contraste das cores do CSS.

## Publicação

O workflow `pages.yml` publica a pasta `site/` no GitHub Pages a cada push na `main`. O `testes.yml` roda os testes em push e em pull request.
