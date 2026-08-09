/* =========================================================================
   theme.js — بيتحكم في زرار تبديل الثيم (تلقائي / أبيض / أسود)
   الملف ده مشترك بين كل صفحات الموقع، مش محتاج تعدل فيه غير لو عايز
   تغيّر ترتيب الحالات نفسه.
   ========================================================================= */
(function () {
  var STORAGE_KEY = "theme";
  var order = ["auto", "light", "dark"]; // ترتيب الدورة عند الضغط

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "auto";
    } catch (e) {
      return "auto";
    }
  }

  function apply(mode) {
    var root = document.documentElement;
    if (mode === "auto") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("data-state", mode);
  }

  function cycleTheme() {
    var current = getStored();
    var next = order[(order.indexOf(current) + 1) % order.length];
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    apply(next);
  }

  window.cycleTheme = cycleTheme;

  document.addEventListener("DOMContentLoaded", function () {
    apply(getStored());
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", cycleTheme);
  });
})();
