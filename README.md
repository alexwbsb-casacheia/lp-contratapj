# LP ContrataPJ — campanha

Cópia estática da LP de contratapj.com.br, com a estrutura de tracking da agência.
No ar em https://lpb.contratapj.app.br

## Tracking
Os IDs ficam em `index.html`, no bloco `window.LP_TRACKING_CONFIG` dentro do `<head>`.
Se um campo ficar vazio, aquela ferramenta não carrega.

| Campo | Valor atual |
|---|---|
| `META_PIXEL_ID` | `6684417081655534` ([Hyper] [Site] - contratapj.com.br) |
| `GA4_ID` | `G-2RCVMYD6WL` |
| `GOOGLE_ADS_ID` | `AW-16877132024` (rótulo da conversão de Lead em `EVENT_MAP`) |
| `LINKEDIN_PARTNER_ID` | `9719769` |
| `HOTJAR_ID` | `3365272` |
| `GTM_ID` | vazio de propósito (o GTM do cliente duplicaria os eventos) |
| `WHATSAPP_NUMBER` / `WHATSAPP_MESSAGE` | vazios mantêm o número e a mensagem do cliente |
| `WHATSAPP_TAG_UTM` | adiciona `[origem|campanha|anúncio]` no fim da mensagem |

Eventos enviados: `lead_form_open`, `lead_form_submit` (Lead), `whatsapp_redirect` (Contact), `cta_click`, `video_play`, `scroll_depth`.
As UTMs e os IDs de clique (gclid, fbclid etc.) ficam salvos em `localStorage.lp_attribution` (primeiro e último acesso).
Para testar, coloque `DEBUG: true` na configuração e veja o console.

## Formulário de lead → planilha
Qualquer link do WhatsApp abre antes um formulário com nome, empresa, telefone e quantidade de PJs.
Quando a pessoa envia:
1. Os dados vão para a aba "Leads - LP" da planilha "Leads - Contrata PJ" (`SHEETS_ENDPOINT`, app da Web do Apps Script).
2. Dispara a conversão: Meta `Lead` (com eventID e correspondência avançada), GA4 `generate_lead`, Google Ads e LinkedIn (se o rótulo estiver no `EVENT_MAP`).
3. A pessoa segue para o mesmo link do WhatsApp, com `Contact` no Meta.

O código do script está em `apps-script/Codigo.gs` (projeto "LP ContrataPJ - Leads para planilha" no Apps Script).
Depois de mudar o código, publique em Implantar → Gerenciar implantações → Editar → Nova versão, mantendo a mesma URL.

## Publicação
Hospedada no GitHub Pages, a partir da branch `main` e da pasta raiz. O domínio (lpb.contratapj.app.br) está no arquivo `CNAME`.
No DNS do cliente existe o registro CNAME `lpb` → `alexwbsb-casacheia.github.io`.
