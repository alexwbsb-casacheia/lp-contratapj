/* =========================================================================
   Camada de tracking da agência. Preencha os IDs em LP_TRACKING_CONFIG
   (no <head> do index.html). Campo vazio = ferramenta não carrega.
   ========================================================================= */
(function () {
  "use strict";
  var cfg = window.LP_TRACKING_CONFIG || {};
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "gbraid", "wbraid", "ttclid"];
  var STORE = "lp_attribution";
  window.dataLayer = window.dataLayer || [];

  /* ---- 1) Captura e persistência de UTMs / click IDs (first + last touch) ---- */
  function read() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function write(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {} }
  var qs = new URLSearchParams(location.search), current = {};
  UTM_KEYS.forEach(function (k) { if (qs.get(k)) current[k] = qs.get(k); });
  var attr = read();
  if (Object.keys(current).length) {
    current.landing_ts = new Date().toISOString();
    if (!attr.first) attr.first = current;
    attr.last = current;
    write(attr);
  }
  var params = attr.last || {};

  /* ---- 2) Carrega as ferramentas configuradas ---- */
  function load(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }

  if (cfg.GTM_ID) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    load("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.GTM_ID));
  }
  if (cfg.GA4_ID || cfg.GOOGLE_ADS_ID) {
    window.gtag = function () { window.dataLayer.push(arguments); };
    load("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID || cfg.GOOGLE_ADS_ID));
    gtag("js", new Date());
    if (cfg.GA4_ID) gtag("config", cfg.GA4_ID);
    if (cfg.GOOGLE_ADS_ID) gtag("config", cfg.GOOGLE_ADS_ID);
  }
  if (cfg.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", cfg.META_PIXEL_ID);
    fbq("track", "PageView");
  }
  if (cfg.LINKEDIN_PARTNER_ID) {
    window._linkedin_partner_id = cfg.LINKEDIN_PARTNER_ID;
    window._linkedin_data_partner_ids = [cfg.LINKEDIN_PARTNER_ID];
    window.lintrk = window.lintrk || function (a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = window.lintrk.q || [];
    load("https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }
  if (cfg.TIKTOK_PIXEL_ID) {
    !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) { var s = d.createElement("script"); s.async = true; s.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + e + "&lib=" + t; d.head.appendChild(s); };
      ttq.load(cfg.TIKTOK_PIXEL_ID); ttq.page(); }(window, document, "ttq");
  }

  if (cfg.HOTJAR_ID) {
    (function (h, o, t, j, a, r) { h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: +cfg.HOTJAR_ID, hjsv: 6 }; a = o.getElementsByTagName("head")[0];
      r = o.createElement("script"); r.async = 1; r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv; a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
  }

  /* ---- 3) API única de eventos (dataLayer + GA4 + Google Ads + Meta + LinkedIn + TikTok) ---- */
  function event(name, data) {
    data = Object.assign({}, params, data || {});
    window.dataLayer.push(Object.assign({ event: name }, data));
    var map = (cfg.EVENT_MAP || {})[name] || {};
    if (window.gtag && !cfg.GTM_ID) {
      gtag("event", map.ga4 || name, data);
      if (map.google_ads && cfg.GOOGLE_ADS_ID) {
        gtag("event", "conversion", { send_to: map.google_ads, value: data.value, currency: data.currency, transaction_id: data.event_id });
      }
    }
    if (map.meta && window.fbq) {
      var opts = data.event_id ? { eventID: data.event_id } : undefined; // deduplicação com CAPI
      fbq(map.meta === "Contact" || map.meta === "Lead" ? "track" : "trackCustom", map.meta, data, opts);
    }
    if (map.linkedin && window.lintrk) window.lintrk("track", { conversion_id: map.linkedin });
    if (map.tiktok && window.ttq) ttq.track(map.tiktok, data);
    if (cfg.DEBUG) console.log("[LPTrack]", name, data, map);
  }
  window.LPTrack = { event: event, attribution: function () { return read(); } };
  window.dataLayer.push(Object.assign({ event: "lp_attribution_ready" }, params));

  /* ---- 4) CTAs: evento no clique + repasse de UTMs ---- */
  function decorate(a) {
    var href = a.getAttribute("href") || "";
    var url; try { url = new URL(href, location.href); } catch (e) { return; }
    var isWa = /(^|\.)whatsapp\.com$|^wa\.me$/.test(url.hostname);
    if (isWa) {
      if (cfg.WHATSAPP_NUMBER) url.searchParams.set("phone", cfg.WHATSAPP_NUMBER);
      if (cfg.WHATSAPP_MESSAGE) url.searchParams.set("text", cfg.WHATSAPP_MESSAGE);
      // código de rastreio no fim da mensagem, para cruzar no CRM
      if (cfg.WHATSAPP_TAG_UTM && params.utm_campaign) {
        var tag = " [" + [params.utm_source, params.utm_campaign, params.utm_content].filter(Boolean).join("|") + "]";
        url.searchParams.set("text", (url.searchParams.get("text") || "") + tag);
      }
      a.href = url.toString();
      a.dataset.lpCta = "whatsapp";
    } else if (cfg.FORWARD_UTMS_TO && cfg.FORWARD_UTMS_TO.indexOf(url.hostname) > -1) {
      UTM_KEYS.forEach(function (k) { if (params[k]) url.searchParams.set(k, params[k]); });
      a.href = url.toString();
      a.dataset.lpCta = a.dataset.lpCta || "outbound";
    }
    if (a.classList.contains("shiny-cta") || /Solicitar demonstra|Ver planos/i.test(a.textContent)) a.dataset.lpCta = a.dataset.lpCta || "cta";
  }
  function bind() {
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), decorate);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-lp-cta]");
      if (!a) return;
      var section = a.closest("section, header, footer");
      event(a.dataset.lpCta === "whatsapp" ? "whatsapp_click" : "cta_click", {
        cta_text: a.textContent.trim().slice(0, 60),
        cta_url: a.href,
        cta_section: section ? (section.id || section.tagName.toLowerCase() + "-" + Array.prototype.indexOf.call(document.querySelectorAll(section.tagName), section)) : ""
      });
    }, true);
    // profundidade de rolagem
    var marks = [25, 50, 75, 90], hit = {};
    window.addEventListener("scroll", function () {
      var pct = (scrollY + innerHeight) / document.documentElement.scrollHeight * 100;
      marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; event("scroll_depth", { percent: m }); } });
    }, { passive: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
