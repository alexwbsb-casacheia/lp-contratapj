# LP ContrataPJ — campanha

Cópia estática da LP de contratapj.com.br, com a estrutura de tracking da agência.

## Tracking
Os IDs ficam em `index.html`, no bloco `window.LP_TRACKING_CONFIG` dentro do `<head>`.
Se um campo ficar vazio, aquela ferramenta não carrega.

| Campo | Exemplo |
|---|---|
| `GTM_ID` | `GTM-XXXXXXX` |
| `GA4_ID` / `GOOGLE_ADS_ID` | use só se não estiverem no GTM |
| `META_PIXEL_ID` | `1234567890` |
| `LINKEDIN_PARTNER_ID`, `TIKTOK_PIXEL_ID` | opcionais |
| `WHATSAPP_NUMBER` / `WHATSAPP_MESSAGE` | vazios mantêm o número e a mensagem do cliente |
| `WHATSAPP_TAG_UTM` | adiciona `[origem|campanha|anúncio]` no fim da mensagem |

Eventos enviados para o `dataLayer`: `lp_attribution_ready`, `whatsapp_click`, `cta_click`, `video_play`, `scroll_depth`.
As UTMs e os IDs de clique (gclid, fbclid etc.) ficam salvos em `localStorage.lp_attribution` (primeiro e último acesso).
Para testar, coloque `DEBUG: true` na configuração e veja o console.

## Formulário de lead → planilha
Qualquer link do WhatsApp abre antes um formulário com nome, empresa, telefone e quantidade de PJs.
Quando a pessoa envia:
1. Os dados vão para a planilha (`SHEETS_ENDPOINT`, um app da Web do Apps Script).
2. Dispara a conversão: Meta `Lead` (com eventID e correspondência avançada), GA4 `generate_lead`, Google Ads e LinkedIn (se o rótulo estiver no `EVENT_MAP`).
3. A pessoa segue para o mesmo link do WhatsApp, com `Contact` no Meta.

Para instalar o script na planilha, siga as instruções no topo de `apps-script/Codigo.gs`.

## Publicação
Hospedada no GitHub Pages, a partir da branch `main` e da pasta raiz. O domínio está no arquivo `CNAME`.
No DNS, crie um registro CNAME do subdomínio apontando para `<conta>.github.io`.
