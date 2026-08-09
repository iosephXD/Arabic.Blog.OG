/* =========================================================================
   bidi.js — بيصلّح تلقائي مشكلة اختلاط العربي والإنجليزي في نفس السطر

   بيشتغل من غير ما تعمل انت حاجة خالص:
   1) بيدّي كل فقرة/عنوان/نقطة في الصفحة اتجاه تلقائي (dir="auto") حسب
      أول حرف قوي فيها، فالفقرة العربي بتتصف يمين والإنجليزي شمال
      كل واحدة لوحدها صح.
   2) لو فقرة عربي فيها كلمة أو رقم إنجليزي جواها، بيلف حوالين الجزء
      الإنجليزي ده بتاج <bdi> تلقائي عشان يمنع مشكلة انقلاب الترتيب.

   بيتفعّل تلقائي على أي صفحة لما تفتحها، وبرضو بينادى عليه تاني بعد
   ما بوستات البلوج تتحمّل (لأنها بتتحط في الصفحة بعد التحميل).
   الملف ده مش محتاج تعدل فيه حاجة أبدًا.
   ========================================================================= */

(function () {
  var BLOCK_SELECTOR = "p, li, h1, h2, h3, h4, blockquote, td, th, dd, dt, .lead, .eyebrow, .meta, .card-link, .role, .org, .when";
  var ARABIC_RE = /[\u0600-\u06FF]/;
  var LATIN_RUN_RE = /[A-Za-z0-9][A-Za-z0-9 .,\-_'"%/()]*[A-Za-z0-9)%]|[A-Za-z0-9]/g;

  function applyBidiFix(root) {
    root = root || document.body;

    root.querySelectorAll(BLOCK_SELECTOR).forEach(function (el) {
      if (!el.hasAttribute("dir")) el.setAttribute("dir", "auto");
    });

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !ARABIC_RE.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (!/[A-Za-z0-9]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "BDI") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) textNodes.push(n);

    textNodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var lastIndex = 0;
      var match;
      LATIN_RUN_RE.lastIndex = 0;
      while ((match = LATIN_RUN_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        var bdi = document.createElement("bdi");
        bdi.textContent = match[0];
        frag.appendChild(bdi);
        lastIndex = LATIN_RUN_RE.lastIndex;
      }
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      if (frag.childNodes.length > 1 && node.parentNode) {
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  window.applyBidiFix = applyBidiFix;

  document.addEventListener("DOMContentLoaded", function () {
    applyBidiFix(document.body);
  });
})();
