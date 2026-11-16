# LP ContrataPJ â€” campanha

CÃ³pia estÃ¡tica da LP de contratapj.com.br, com a estrutura de tracking da agÃªncia.

## Tracking
Os IDs ficam em `index.html`, no bloco `window.LP_TRACKING_CONFIG` dentro do `<head>`.
Se um campo ficar vazio, aquela ferramenta nÃ£o carrega.

| Campo | Exemplo |
|---|---|
| `GTM_ID` | `GTM-XXXXXXX` |
| `GA4_ID` / `GOOGLE_ADS_ID` | use sÃ³ se nÃ£o estiverem no GTM |
| `META_PIXEL_ID` | `1234567890` |
| `LINKEDIN_PARTNER_ID`, `TIKTOK_PIXEL_ID` | opcionais |
| `WHATSAPP_NUMBER` / `WHATSAPP_MESSAGE` | vazios mantÃªm o nÃºmero e a mensagem do cliente |
| `WHATSAPP_TAG_UTM` | adiciona `[origem|campanha|anÃºncio]` no fim da mensagem |

Eventos enviados para o `dataLayer`: `lp_attribution_ready`, `whatsapp_click`, `cta_click`, `video_play`, `scroll_depth`.
As UTMs e os IDs de clique (gclid, fbclid etc.) ficam salvos em `localStorage.lp_attribution` (primeiro e Ãºltimo acesso).
Para testar, coloque `DEBUG: true` na configuraÃ§Ã£o e veja o console.

## FormulÃ¡rio de lead â†’ planilha
Qualquer link do WhatsApp abre antes um formulÃ¡rio com nome, empresa, telefone e quantidade de PJs.
Quando a pessoa envia:
1. Os dados vÃ£o para a planilha (`SHEETS_ENDPOINT`, um app da Web do Apps Script).
2. Dispara a conversÃ£o: Meta `Lead` (com eventID e correspondÃªncia avanÃ§ada), GA4 `generate_lead`, Google Ads e LinkedIn (se o rÃ³tulo estiver no `EVENT_MAP`).
3. A pessoa segue para o mesmo link do WhatsApp, com `Contact` no Meta.

Para instalar o script na planilha, siga as instruÃ§Ãµes no topo de `apps-script/Codigo.gs`.

## PublicaÃ§Ã£o
Hospedada no GitHub Pages, a partir da branch `main` e da pasta raiz. O domÃ­nio estÃ¡ no arquivo `CNAME`.
No DNS, crie um registro CNAME do subdomÃ­nio apontando para `<conta>.github.io`.
