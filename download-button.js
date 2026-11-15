/* Talk Tuk Tuk - DOWNLOAD (install app) button
   Adds a purple DOWNLOAD button next to the "Learning Khmer" badge.
   Android Chrome: opens the real install pop-up.
   Anywhere else: shows simple step-by-step help. */
(function () {
  "use strict";

  // Already installed and running as an app: no button needed
  var standalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
  if (standalone) { return; }

  var deferredPrompt = null;

  // Chrome tells us when the app can be installed
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function showHelp() {
    var ua = navigator.userAgent || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|Messenger|TikTok/i.test(ua);
    var steps;

    if (inApp) {
      steps = [
        "This page is open inside another app.",
        "Tap the menu and choose Open in Chrome (or Open in browser).",
        "Then tap DOWNLOAD again."
      ];
    } else if (isIOS) {
      steps = [
        "Open this page in Safari.",
        "Tap the Share button (the square with an arrow).",
        "Tap Add to Home Screen, then tap Add."
      ];
    } else {
      steps = [
        "Open this page in the Chrome app.",
        "Tap the three dots at the top right.",
        "Tap Install app (or Add to Home screen).",
        "If you do not see it, refresh the page and try again."
      ];
    }

    var overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);" +
      "display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;";

    var box = document.createElement("div");
    box.style.cssText =
      "background:#fff;border-radius:20px;padding:24px;max-width:380px;width:100%;" +
      "box-sizing:border-box;font-family:Nunito,sans-serif;color:#1a1a2e;";

    var title = document.createElement("div");
    title.textContent = "Get Talk Tuk Tuk on your phone";
    title.style.cssText =
      "font-family:'Fredoka One',cursive;font-size:22px;color:#6200EA;margin-bottom:12px;text-align:center;";

    var list = document.createElement("ol");
    list.style.cssText = "margin:0 0 18px 20px;padding:0;font-size:15px;line-height:1.6;";
    steps.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      list.appendChild(li);
    });

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "Got it";
    close.style.cssText =
      "width:100%;background:#6200EA;color:#fff;border:none;border-radius:30px;padding:12px;" +
      "font-family:'Fredoka One',cursive;font-size:17px;cursor:pointer;";
    close.addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) { overlay.remove(); }
    });

    box.appendChild(title);
    box.appendChild(list);
    box.appendChild(close);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  ready(function () {
    var badge = document.querySelector(".lang-badge");
    if (!badge || document.getElementById("ttt-download-btn")) { return; }

    // Put the language badge and the button side by side on one row
    var row = document.createElement("div");
    row.id = "ttt-download-row";
    row.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;" +
      "flex-wrap:wrap;gap:10px;margin:10px 12px 0;";
    badge.parentNode.insertBefore(row, badge);
    badge.style.margin = "0";
    row.appendChild(badge);

    var btn = document.createElement("button");
    btn.id = "ttt-download-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Download the Talk Tuk Tuk app");
    btn.style.cssText =
      "display:inline-flex;align-items:center;gap:8px;background:#6200EA;color:#fff;" +
      "border:none;border-radius:16px;padding:9px 16px 9px 10px;" +
      "font-family:'Fredoka One',cursive;font-size:17px;letter-spacing:0.5px;cursor:pointer;" +
      "box-shadow:0 4px 14px rgba(98,0,234,0.45);-webkit-tap-highlight-color:transparent;";
    btn.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><path d="M12 7v8M8.5 11.5L12 15l3.5-3.5"/></svg>' +
      "<span>DOWNLOAD</span>";

    btn.addEventListener("click", function () {
      if (deferredPrompt) {
        var p = deferredPrompt;
        deferredPrompt = null;
        p.prompt();
      } else {
        showHelp();
      }
    });
    row.appendChild(btn);

    // Once installed, the button disappears
    window.addEventListener("appinstalled", function () {
      if (btn.parentNode) { btn.parentNode.removeChild(btn); }
    });
  });
})();
