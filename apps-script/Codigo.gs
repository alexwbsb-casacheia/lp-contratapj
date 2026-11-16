/**
 * Recebe os leads do formulário da LP ContrataPJ e grava na aba "Leads - LP"
 * da planilha "Leads - Contrata PJ". Não mexe nas outras abas.
 *
 * Como instalar (uma vez):
 *  1. Na planilha: Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 *  2. Salve. Clique em Implantar → Nova implantação → engrenagem → "App da Web".
 *       Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 *  3. Autorize e copie a URL que termina em /exec.
 *  4. Cole a URL em SHEETS_ENDPOINT no index.html da LP.
 */
var PLANILHA_ID = "1jfsKnSpagCSTvs4GYwX4er7keVU5sxnfSjT2hs864U4"; // "Leads - Contrata PJ"
var ABA = "Leads - LP";

// Ordem das colunas da aba. Cada item: [cabeçalho, função que tira o valor do lead]
var COLUNAS = [
  ["Data",                  function (d) { return d.data_hora ? d.data_hora.split(/,?\s+/)[0] : ""; }],
  ["Horário",               function (d) { return d.data_hora ? (d.data_hora.split(/,?\s+/)[1] || "") : ""; }],
  ["Nome",                  function (d) { return d.nome; }],
  ["Telefone",              function (d) { return d.telefone; }],
  ["Empresa",               function (d) { return d.empresa; }],
  ["Quantos PJ´s",          function (d) { return d.qtd_pjs; }],
  ["Plataforma",            function (d) { return d.utm_source; }],
  ["Campanha",              function (d) { return d.utm_campaign; }],
  ["Conjunto",              function (d) { return d.utm_medium; }],
  ["Criativo",              function (d) { return d.utm_content; }],
  ["Termo",                 function (d) { return d.utm_term; }],
  ["gclid",                 function (d) { return d.gclid; }],
  ["fbclid",                function (d) { return d.fbclid; }],
  ["Origem (1º acesso)",    function (d) { return d.first_utm_source; }],
  ["Campanha (1º acesso)",  function (d) { return d.first_utm_campaign; }],
  ["fbp",                   function (d) { return d.fbp; }],
  ["fbc",                   function (d) { return d.fbc; }],
  ["Página",                function (d) { return d.pagina; }],
  ["Referrer",              function (d) { return d.referrer; }],
  ["Event ID",              function (d) { return d.event_id; }]
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var dados = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!dados.nome || !dados.telefone) return resposta({ ok: false, erro: "dados incompletos" });

    var aba = garantirAba();
    var linha = COLUNAS.map(function (c) {
      var v = c[1](dados);
      v = v == null ? "" : String(v).slice(0, 500);
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
  var ss = SpreadsheetApp.openById(PLANILHA_ID);
  var aba = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS.map(function (c) { return c[0]; }));
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight("bold");
  }
  return aba;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
