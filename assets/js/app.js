/* Interações da LP (substitui o React original). */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byText = function (sel, txt) { return $$(sel).find(function (e) { return e.textContent.trim() === txt; }); };

  /* 1) Acordeões: módulos ("+") e FAQ */
  $$('button[aria-expanded]').forEach(function (btn) {
    if (btn.getAttribute("aria-label") === "Abrir menu") return;
    var panel = btn.nextElementSibling;
    if (!panel || !panel.classList.contains("grid")) return;
    var icon = btn.querySelector("span:last-child");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("grid-rows-[0fr]", !open);
      panel.classList.toggle("grid-rows-[1fr]", open);
      panel.classList.toggle("mt-3", open);
      if (icon && icon.textContent.trim() === "+" && icon.hasAttribute("style")) {
        icon.style.transform = open ? "rotate(45deg)" : "none"; // card de módulo
      } else if (icon && /^[+–]$/.test(icon.textContent.trim())) {
        icon.textContent = open ? "–" : "+"; // FAQ
      }
    });
  });

  /* 2) Menu do topo: efeito de hover (camada que gira) */
  $$('div[style*="rotateX(90deg)"]').forEach(function (layer) {
    var host = layer.closest("a, li") || layer.parentElement;
    layer.style.transition = "opacity .25s ease, transform .25s ease";
    host.addEventListener("mouseenter", function () { layer.style.opacity = "1"; layer.style.transform = "rotateX(0deg)"; });
    host.addEventListener("mouseleave", function () { layer.style.opacity = "0"; layer.style.transform = "rotateX(90deg)"; });
  });
  // brilhos radiais que aparecem só no hover
  $$('div[style*="radial-gradient"][style*="opacity:0"]').forEach(function (g) {
    var host = g.parentElement;
    g.style.transition = "opacity .3s ease";
    host.addEventListener("mouseenter", function () { g.style.opacity = "1"; });
    host.addEventListener("mouseleave", function () { g.style.opacity = "0"; });
  });

  /* 3) Destaques "Tudo o que você precisa..." com troca automática */
  (function () {
    var h = byText("h3", "Contratos automáticos");
    if (!h) return;
    var list = h.closest(".cursor-pointer").parentElement;
    var cards = $$(":scope > .cursor-pointer", list);
    var imgWrap = list.nextElementSibling && list.nextElementSibling.querySelector("div[style]");
    var img = imgWrap && imgWrap.querySelector("img");
    var images = [
      "assets/img/img-home-dash1-1024x765.png",
      "assets/img/img-home-contract.png",
      "assets/img/img-home-notas-1.png",
      "assets/img/img-home-dash2-1024x765.png"
    ];
    var DURATION = 5000, current = 0, start = 0, raf;
    if (imgWrap) { imgWrap.style.transition = "opacity .6s ease, transform .6s ease"; }
    function paint(i) {
      cards.forEach(function (c, k) {
        var on = k === i;
        var box = c.firstElementChild, ico = box.firstElementChild;
        var t = box.querySelector("h3"), p = box.querySelector("p"), bar = box.querySelector(".h-1");
        box.className = box.className.replace(/\s*(bg-white|md:shadow-xl|rounded-xl|md:border|border-slate-200)/g, "") +
          (on ? " bg-white md:shadow-xl rounded-xl md:border border-slate-200" : "");
        ico.classList.toggle("bg-brand-600", on); ico.classList.toggle("text-white", on);
        ico.classList.toggle("bg-brand-600/10", !on); ico.classList.toggle("text-brand-600", !on);
        t.classList.toggle("text-slate-900", on); t.classList.toggle("text-slate-700", !on);
        p.classList.toggle("text-slate-600", on); p.classList.toggle("text-slate-500", !on);
        bar.innerHTML = on ? '<div class="h-full bg-gradient-to-r from-brand-500 to-brand-600" style="width:0%"></div>' : "";
      });
      if (img) {
        imgWrap.style.opacity = "0";
        setTimeout(function () {
          img.src = images[i]; img.alt = cards[i].querySelector("h3").textContent;
          imgWrap.style.opacity = "1"; imgWrap.style.transform = "none";
        }, 200);
      }
    }
    function go(i) { current = i; start = performance.now(); paint(i); }
    function tick(now) {
      var fill = cards[current].querySelector(".h-1 > div");
      var pct = Math.min(100, ((now - start) / DURATION) * 100);
      if (fill) fill.style.width = pct + "%";
      if (pct >= 100) go((current + 1) % cards.length);
      raf = requestAnimationFrame(tick);
    }
    cards.forEach(function (c, k) { c.addEventListener("click", function () { go(k); }); });
    go(0); raf = requestAnimationFrame(tick);
  })();

  /* 4) "6 razões": abas Empresas / Prestadores */
  (function () {
    var bE = byText("button", "Empresas"), bP = byText("button", "Prestadores");
    if (!bE || !bP) return;
    var sec = bE.closest("section");
    var titles = $$("h3", sec);
    var svg = function (inner) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white drop-shadow" aria-hidden="true">' + inner + "</svg>";
    };
    var data = {
      empresas: titles.map(function (h) {
        return [h.textContent, h.parentElement.querySelector("svg").outerHTML];
      }),
      prestadores: [
        ["Onboarding facilitado", svg('<circle cx="9" cy="8" r="3"></circle><path d="M3 20v-1a6 6 0 0 1 9-5.2"></path><path d="M17 8v6"></path><path d="M14 11h6"></path>')],
        ["Abertura de empresa", svg('<path d="M4 21V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v15"></path><path d="M11 21v-9h7a1 1 0 0 1 1 1v8"></path><path d="M6.5 8h2M6.5 11h2M6.5 14h2"></path><path d="M14 15h2M14 18h2"></path><path d="M3 21h18"></path>')],
        ["Geração de notas fiscais", svg('<path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21z"></path><path d="M9 8h6"></path><path d="M9 12h6"></path>')],
        ["Pagamento de DAS", svg('<path d="M12 3l8 5H4z"></path><path d="M4 11h16"></path><path d="M6 11v7M10 11v7M14 11v7M18 11v7"></path><path d="M3 21h18"></path>')],
        ["Assinatura de contratos", svg('<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path><path d="M13 3v5h5"></path><path d="M8 16.5c1-1.6 2-1.6 3 0s2 1.6 3 0"></path><path d="M16.5 19.5l3.7-3.7 1.6 1.6-3.7 3.7H16.5z"></path>')],
        ["Monitoramento do CNPJ", svg('<path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"></path><path d="M9 12l2 2 4-4"></path>')]
      ]
    };
    var ON = ["bg-brand-600", "text-white", "shadow"], OFF = ["text-slate-600", "hover:text-slate-900"];
    function set(which) {
      [[bE, "empresas"], [bP, "prestadores"]].forEach(function (pair) {
        var on = pair[1] === which;
        ON.forEach(function (c) { pair[0].classList.toggle(c, on); });
        OFF.forEach(function (c) { pair[0].classList.toggle(c, !on); });
      });
      titles.forEach(function (h, i) {
        h.textContent = data[which][i][0];
        var old = h.parentElement.querySelector("svg");
        if (old) old.outerHTML = data[which][i][1];
      });
    }
    bE.addEventListener("click", function () { set("empresas"); });
    bP.addEventListener("click", function () { set("prestadores"); });
  })();

  /* 5) Carrossel de vídeos (pilha de cartões) */
  (function () {
    var next = $('[aria-label="Próximo vídeo"]'), prev = $('[aria-label="Vídeo anterior"]');
    if (!next) return;
    var sec = next.closest("section");
    var slides = $$('[aria-label^="Reproduzir"]', sec).map(function (b) { return b.parentElement; });
    var dots = $$(".w-2.h-2", next.parentElement);
    var firstAlt = slides[0].querySelector("img").alt;
    var caption = $$("p", sec).find(function (p) { return p.textContent.trim() === firstAlt; });
    var STACK = [
      { z: 3, o: 1, t: "none" },
      { z: 2, o: 0.6, t: "translateY(12px) scale(0.95) rotate(-2deg)" },
      { z: 1, o: 0.3, t: "translateY(24px) scale(0.95) rotate(-4deg)" }
    ];
    var cur = 0, n = slides.length;
    function stopVideos() {
      $$("iframe", sec).forEach(function (f) {
        var b = f.parentElement.querySelector("button");
        if (b) b.style.display = "";
        f.remove();
      });
    }
    function render() {
      slides.forEach(function (s, i) {
        var pos = (i - cur + n) % n, st = STACK[Math.min(pos, STACK.length - 1)];
        s.style.transition = "transform .45s cubic-bezier(.4,0,.2,1), opacity .45s ease";
        s.style.zIndex = st.z; s.style.opacity = st.o; s.style.transform = st.t;
        s.style.pointerEvents = pos === 0 ? "auto" : "none";
        var btn = s.querySelector("button"); btn.tabIndex = pos === 0 ? 0 : -1;
        var play = btn.querySelector("span.absolute");
        if (play) play.style.display = pos === 0 ? "" : "none";
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("bg-brand-600", i === cur); d.classList.toggle("bg-slate-300", i !== cur);
      });
      if (caption) caption.textContent = slides[cur].querySelector("img").alt;
    }
    function go(d) { stopVideos(); cur = (cur + d + n) % n; render(); }
    next.addEventListener("click", function () { go(1); });
    prev.addEventListener("click", function () { go(-1); });
    // play icon no slide ativo (o SSR só traz o ícone no primeiro)
    var tpl = slides[0].querySelector("button span.absolute");
    slides.forEach(function (s) {
      var btn = s.querySelector("button");
      if (tpl && !btn.querySelector("span.absolute")) btn.appendChild(tpl.cloneNode(true));
      btn.addEventListener("click", function () {
        var id = (btn.querySelector("img").src.match(/vi\/([^/]+)\//) || [])[1];
        if (!id) return;
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        f.title = btn.querySelector("img").alt;
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true;
        f.className = "absolute inset-0 w-full h-full";
        btn.style.display = "none";
        s.appendChild(f);
        if (window.LPTrack) window.LPTrack.event("video_play", { video_id: id });
      });
    });
    // arrastar para o lado (mobile)
    var x0 = null;
    slides.forEach(function (s) {
      s.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      s.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });
    });
    render();
  })();

  /* 5b) Busca no FAQ */
  (function () {
    var input = $$("input").find(function (i) { return /pergunta/i.test(i.placeholder || ""); });
    if (!input) return;
    var sec = input.closest("section");
    var items = $$("button[aria-expanded]", sec).map(function (b) { return b.parentElement; });
    var norm = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
    input.addEventListener("input", function () {
      var q = norm(input.value.trim());
      items.forEach(function (it) { it.style.display = !q || norm(it.textContent).indexOf(q) > -1 ? "" : "none"; });
    });
  })();

  /* 6) Menu mobile */
  (function () {
    var btn = $('[aria-label="Abrir menu"]');
    if (!btn) return;
    var links = $$("header nav a").map(function (a) {
      return '<a href="' + a.href + '" style="font-size:1rem;font-weight:500;color:#1e293b;text-decoration:none">' +
        ((a.querySelector(".text-sm") || a).textContent.trim()) + "</a>";
    });
    var cta = $("header a.shiny-cta"), login = $('header a[href*="login"]');
    var overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:60;opacity:0;pointer-events:none;transition:opacity .2s";
    var panel = document.createElement("div");
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Menu");
    panel.style.cssText = "position:fixed;top:0;right:0;height:100%;width:300px;max-width:85vw;background:#fff;z-index:61;box-shadow:-8px 0 24px rgba(0,0,0,.15);padding:16px;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;gap:16px;font-family:inherit";
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center"><strong style="font-size:1rem">Menu</strong>' +
      '<button type="button" aria-label="Fechar menu" style="font-size:1.5rem;line-height:1;background:none;border:0;cursor:pointer">×</button></div>' +
      '<nav style="display:flex;flex-direction:column;gap:16px;margin-top:8px">' + links.join("") + "</nav>" +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">' +
      (cta ? cta.outerHTML.replace('class="', 'class="w-full ') : "") +
      (login ? '<a href="' + login.href + '" target="_blank" rel="noopener noreferrer" style="text-align:center;border:1px solid #e2e8f0;border-radius:9999px;padding:8px 20px;font-size:.875rem;color:#0f172a;text-decoration:none">Login</a>' : "") +
      "</div>";
    document.body.appendChild(overlay); document.body.appendChild(panel);
    function toggle(open) {
      btn.setAttribute("aria-expanded", String(open));
      overlay.style.opacity = open ? "1" : "0"; overlay.style.pointerEvents = open ? "auto" : "none";
      panel.style.transform = open ? "none" : "translateX(100%)";
      document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { toggle(true); });
    overlay.addEventListener("click", function () { toggle(false); });
    panel.querySelector('[aria-label="Fechar menu"]').addEventListener("click", function () { toggle(false); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
  })();
})();
