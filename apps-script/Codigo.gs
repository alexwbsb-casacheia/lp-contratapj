/**
 * Recebe os leads do formulário da LP ContrataPJ e grava na aba "Leads".
 *
 * Como instalar (uma vez):
 *  1. Na planilha: Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 *  2. Salve. Clique em Implantar → Nova implantação → tipo "App da Web".
 *       Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 *  3. Autorize e copie a URL que termina em /exec.
 *  4. Cole a URL em SHEETS_ENDPOINT no index.html da LP.
 */
var ABA = "Leads";
var COLUNAS = [
  "data_hora", "nome", "empresa", "telefone", "telefone_e164", "qtd_pjs",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "fbclid", "first_utm_source", "first_utm_campaign",
  "fbp", "fbc", "pagina", "referrer", "user_agent", "event_id"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var dados = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!dados.nome || !dados.telefone) return resposta({ ok: false, erro: "dados incompletos" });

    var aba = garantirAba();
    var linha = COLUNAS.map(function (c) {
      var v = dados[c] == null ? "" : String(dados[c]).slice(0, 500);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // evita fórmula injetada
    });
    aba.appendRow(linha);
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Teste rápido: abrir a URL /exec no navegador deve mostrar {"ok":true,"status":"online"}
function doGet() {
  garantirAba();
  return resposta({ ok: true, status: "online" });
}

function garantirAba() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight("bold");
  }
  return aba;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
