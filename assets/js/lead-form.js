/* =========================================================================
   Formulário de lead antes do WhatsApp.
   Clique em qualquer link do WhatsApp → abre o formulário → envio:
     1) grava na planilha (Apps Script)
     2) dispara a conversão Lead (Meta, GA4, Google Ads, LinkedIn)
     3) segue para o mesmo link do WhatsApp
   ========================================================================= */
(function () {
  "use strict";
  var cfg = window.LP_TRACKING_CONFIG || {};
  var PJ_OPTIONS = ["1 a 10", "11 a 30", "31 a 100", "Mais de 100"];

  /* ---------- estilos (isolados com prefixo lf-) ---------- */
  var css = [
    ".lf-overlay{position:fixed;inset:0;z-index:100;background:rgba(12,31,92,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .2s}",
    ".lf-overlay.lf-open{opacity:1;pointer-events:auto}",
    ".lf-box{position:relative;width:100%;max-width:440px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:20px;padding:28px 24px 24px;box-shadow:0 24px 60px rgba(12,31,92,.35);transform:translateY(16px);transition:transform .25s ease;font-family:var(--font-jakarta, 'Plus Jakarta Sans'),sans-serif;color:#0f172a}",
    ".lf-open .lf-box{transform:none}",
    ".lf-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;background:transparent;border-radius:999px;font-size:24px;line-height:1;color:#64748b;cursor:pointer}",
    ".lf-close:hover{background:#f1f5f9;color:#0f172a}",
    ".lf-title{font-family:var(--font-outfit, Outfit),sans-serif;font-size:1.5rem;font-weight:700;line-height:1.2;margin:0 32px 6px 0;color:#0c1f5c}",
    ".lf-sub{font-size:.9rem;color:#475569;margin:0 0 20px}",
    ".lf-field{margin-bottom:14px}",
    ".lf-field label{display:block;font-size:.8rem;font-weight:600;color:#334155;margin-bottom:6px}",
    ".lf-field input,.lf-field select{width:100%;box-sizing:border-box;height:46px;border:1px solid #cbd5e1;border-radius:12px;padding:0 14px;font-size:1rem;font-family:inherit;color:#0f172a;background:#fff;outline:none;transition:border-color .15s, box-shadow .15s;appearance:none}",
    ".lf-field select{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.6' fill='none'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}",
    ".lf-field input:focus,.lf-field select:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.18)}",
    ".lf-field.lf-err input,.lf-field.lf-err select{border-color:#dc2626}",
    ".lf-msg{display:none;font-size:.75rem;color:#dc2626;margin-top:4px}",
    ".lf-err .lf-msg{display:block}",
    ".lf-submit{width:100%;height:50px;margin-top:6px;border:0;border-radius:999px;background:#2563eb;color:#fff;font-size:1rem;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s}",
    ".lf-submit:hover{background:#1d4ed8}",
    ".lf-submit[disabled]{opacity:.7;cursor:wait}",
    ".lf-note{font-size:.72rem;color:#64748b;text-align:center;margin:12px 0 0}",
    ".lf-note a{color:#475569}",
    ".lf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- markup ---------- */
  var overlay = document.createElement("div");
  overlay.className = "lf-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="lf-box" role="dialog" aria-modal="true" aria-labelledby="lf-title">' +
      '<button type="button" class="lf-close" aria-label="Fechar">×</button>' +
      '<h2 class="lf-title" id="lf-title">Solicite sua demonstração</h2>' +
      '<p class="lf-sub">Preencha os dados e fale agora com um especialista da ContrataPJ no WhatsApp.</p>' +
      '<form novalidate>' +
        '<div class="lf-field"><label for="lf-nome">Nome</label><input id="lf-nome" name="nome" autocomplete="name" placeholder="Seu nome completo" required><div class="lf-msg">Informe seu nome.</div></div>' +
        '<div class="lf-field"><label for="lf-empresa">Nome da empresa</label><input id="lf-empresa" name="empresa" autocomplete="organization" placeholder="Empresa onde você trabalha" required><div class="lf-msg">Informe o nome da empresa.</div></div>' +
        '<div class="lf-field"><label for="lf-tel">Telefone (WhatsApp)</label><input id="lf-tel" name="telefone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(11) 99999-9999" required><div class="lf-msg">Informe um telefone válido com DDD.</div></div>' +
        '<div class="lf-field"><label for="lf-pjs">Quantidade de PJs</label><select id="lf-pjs" name="qtd_pjs" required><option value="" selected disabled>Selecione</option>' +
          PJ_OPTIONS.map(function (o) { return "<option>" + o + "</option>"; }).join("") +
        '</select><div class="lf-msg">Selecione a quantidade de PJs.</div></div>' +
        '<div class="lf-hp" aria-hidden="true"><label>Não preencha<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<button type="submit" class="lf-submit">Falar com especialista no WhatsApp</button>' +
        '<p class="lf-note">Seus dados estão protegidos. <a href="https://contratapj.com.br/politica-de-privacidade/" target="_blank" rel="noopener">Política de privacidade</a></p>' +
      "</form>" +
    "</div>";
  document.body.appendChild(overlay);

  var form = overlay.querySelector("form");
  var tel = form.elements.telefone;
  var submit = form.querySelector(".lf-submit");
  var targetHref = null, lastFocus = null;

  /* máscara de telefone BR */
  tel.addEventListener("input", function () {
    var d = tel.value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    tel.value = out;
  });

  function open(href) {
    targetHref = href;
    lastFocus = document.activeElement;
    overlay.classList.add("lf-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { form.elements.nome.focus(); }, 50);
    if (window.LPTrack) LPTrack.event("lead_form_open", {});
  }
  function close() {
    overlay.classList.remove("lf-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  overlay.querySelector(".lf-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("lf-open")) close(); });

  /* intercepta TODOS os links do WhatsApp (inclusive o botão flutuante e os do menu mobile) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="whatsapp.com"], a[href*="wa.me"]');
    if (!a || overlay.contains(a)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(a.href);
  }, true);

  /* validação */
  function check() {
    var ok = true;
    var rules = {
      nome: function (v) { return v.trim().length >= 2; },
      empresa: function (v) { return v.trim().length >= 2; },
      telefone: function (v) { var d = v.replace(/\D/g, ""); return d.length === 10 || d.length === 11; },
      qtd_pjs: function (v) { return !!v; }
    };
    Object.keys(rules).forEach(function (k) {
      var el = form.elements[k], bad = !rules[k](el.value);
      el.closest(".lf-field").classList.toggle("lf-err", bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  form.addEventListener("input", function (e) {
    var f = e.target.closest(".lf-field"); if (f) f.classList.remove("lf-err");
  });

  function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
      });
  }
  function cookie(n) { var m = document.cookie.match("(?:^|; )" + n + "=([^;]*)"); return m ? decodeURIComponent(m[1]) : ""; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.website.value) return; // robô
    if (!check()) return;
    submit.disabled = true; submit.textContent = "Enviando…";

    var digits = tel.value.replace(/\D/g, "");
    var attr = (window.LPTrack && LPTrack.attribution()) || {};
    var last = attr.last || {}, first = attr.first || {};
    var eventId = uuid();
    var lead = {
      data_hora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      nome: form.elements.nome.value.trim(),
      empresa: form.elements.empresa.value.trim(),
      telefone: tel.value,
      telefone_e164: "+55" + digits,
      qtd_pjs: form.elements.qtd_pjs.value,
      utm_source: last.utm_source || "", utm_medium: last.utm_medium || "",
      utm_campaign: last.utm_campaign || "", utm_content: last.utm_content || "", utm_term: last.utm_term || "",
      gclid: last.gclid || "", fbclid: last.fbclid || "",
      first_utm_source: first.utm_source || "", first_utm_campaign: first.utm_campaign || "",
      fbp: cookie("_fbp"), fbc: cookie("_fbc"),
      pagina: location.href.split("#")[0],
      referrer: document.referrer || "",
      user_agent: navigator.userAgent,
      event_id: eventId
    };

    /* 1) planilha — sendBeacon sobrevive ao redirecionamento */
    if (cfg.SHEETS_ENDPOINT) {
      var body = JSON.stringify(lead);
      var sent = false;
      try { sent = navigator.sendBeacon(cfg.SHEETS_ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" })); } catch (err) {}
      if (!sent) {
        try { fetch(cfg.SHEETS_ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: body }); } catch (err) {}
      }
    }

    /* 2) conversão Lead */
    var first_name = lead.nome.split(/\s+/)[0], last_name = lead.nome.split(/\s+/).slice(1).join(" ");
    if (window.fbq && cfg.META_PIXEL_ID) {
      // correspondência avançada: o pixel faz o hash dos dados antes de enviar
      fbq("init", cfg.META_PIXEL_ID, { fn: first_name.toLowerCase(), ln: last_name.toLowerCase(), ph: "55" + digits, country: "br", external_id: eventId });
    }
    if (window.gtag && cfg.GOOGLE_ADS_ID) {
      gtag("set", "user_data", { phone_number: "+55" + digits, address: { first_name: first_name, last_name: last_name, country: "BR" } });
    }
    if (window.LPTrack) {
      LPTrack.event("lead_form_submit", {
        event_id: eventId, qtd_pjs: lead.qtd_pjs,
        content_name: "LP ContrataPJ - Demonstração", value: 0, currency: "BRL"
      });
    }

    /* 3) WhatsApp (mesmo link de antes, já decorado com as UTMs) */
    setTimeout(function () {
      if (window.LPTrack) LPTrack.event("whatsapp_redirect", { cta_url: targetHref });
      window.location.href = targetHref;
    }, 700);
  });
})();
