/* =========================================================================
   nav-search.js — زرار البحث الصغير اللي في الشريط العلوي (جنب اسمك)

   بيشتغل بشكلين:
   - لو انت واقف في صفحة البلوج، البحث بيفلتر البوستات على طول
   - لو انت في أي صفحة تانية، بيودّيك لصفحة البلوج ويبحث عن نفس الكلمة
   الملف ده مش محتاج تعدل فيه حاجة.
   ========================================================================= */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var wrap = document.getElementById("nav-search");
    var btn = document.getElementById("nav-search-btn");
    var input = document.getElementById("nav-search-input");
    if (!wrap || !btn || !input) return;

    btn.addEventListener("click", function () {
      wrap.classList.toggle("open");
      if (wrap.classList.contains("open")) input.focus();
    });

    function isOnBlogList() {
      return !!document.getElementById("post-list") && typeof blogState !== "undefined";
    }

    function applySearch(value) {
      if (isOnBlogList()) {
        blogState.query = value.trim().toLowerCase();
        blogState.page = 1;
        var mainInput = document.getElementById("search-input");
        if (mainInput) mainInput.value = value;
        if (typeof renderBlogList === "function") renderBlogList();
      } else {
        window.location.href = "blog.html?q=" + encodeURIComponent(value.trim());
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") applySearch(input.value);
    });

    // على صفحة البلوج بس: كل ما تكتب حرف بيفلتر على طول
    input.addEventListener("input", function () {
      if (isOnBlogList()) applySearch(input.value);
    });

    // لو الشخص كتب في مربع البحث الرئيسي، خلي مربع النافبار يتزامن معاه
    var mainInput = document.getElementById("search-input");
    if (mainInput) {
      mainInput.addEventListener("input", function () {
        input.value = mainInput.value;
      });
    }
  });
})();
