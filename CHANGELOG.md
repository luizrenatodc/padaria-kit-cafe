# Changelog

Mudanças notáveis do projeto, da mais recente para a mais antiga.

## Sem versão (main)

### Corrigido
- Datas que não existem no calendário (como 31/11) eram aceitas e viravam o dia seguinte; agora `validarData` as recusa.
- Rascunhos e pedidos salvos com tipo de entrega, janela ou papel de cartão desconhecidos agora voltam ao padrão em vez de deixar a tela e a mensagem em desacordo.
- O servidor local (`npm start`) caía com uma URL de escape inválido (como `/%E0%A4%A`); agora responde 400.
- A área de texto da prévia do WhatsApp não tinha nome acessível.

### Acessibilidade
- Cada campo com erro aponta para o seu aviso com `aria-describedby`; o resumo do kit é anunciado como status; aviso para quem está sem JavaScript.
- Contraste das cores de texto e dos botões ajustado para o nível AA (4,5:1), com teste automático.

### Segurança
- Content-Security-Policy e política de referência no HTML.

### Interno
- Testes de borda de datas, validação e mensagem; testes do servidor, de acessibilidade, de segurança e de contraste.
- Fins de linha padronizados em LF, `.editorconfig` e `.gitattributes`.
- Documentação de arquitetura (`docs/arquitetura.md`) e `SECURITY.md`.

## 1.0.0

Primeira versão: montagem do kit com capacidade da cesta, desconto progressivo, restrições alimentares, cartão com mensagem, janelas de entrega, pedido pelo WhatsApp e pedidos guardados no aparelho.
