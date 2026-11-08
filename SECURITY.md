# Política de segurança

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use o relato privado do GitHub: aba **Security**, **Report a vulnerability**. Descreva o que acontece, como reproduzir e o impacto que você enxerga.

## Como o projeto se protege

- Site estático: não há servidor de aplicação, banco de dados nem contas de usuário. Os dados do pedido ficam só no navegador (`localStorage`) e saem apenas quando a pessoa abre o link do WhatsApp.
- Content-Security-Policy no HTML: scripts só do próprio site, sem `eval` e sem script inline. Um teste (`test/seguranca.test.js`) falha se isso mudar.
- Texto digitado pela pessoa é escapado antes de entrar no HTML (`esc` em `app.js`) e codificado com `encodeURIComponent` no link do WhatsApp.
- O servidor local (`npm start`) recusa caminhos com `..`, byte nulo e escapes inválidos, e envia `X-Content-Type-Options` e `Referrer-Policy`.
- Dados restaurados do `localStorage` são revalidados contra o catálogo (`restaurar`), então um rascunho adulterado não injeta valores fora da lista.

## Limites conhecidos

- O servidor local serve só para desenvolvimento. Em produção o site é publicado no GitHub Pages, que define os próprios cabeçalhos HTTP.
- A CSP está no `<meta>`, por isso não cobre `frame-ancestors`; isso exigiria um cabeçalho HTTP.
- O número de WhatsApp em `dados.js` é fictício. Quem adaptar o projeto para uma padaria real deve trocá-lo.
