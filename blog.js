/* =========================================================================
   blog.js — العقل بتاع نظام البلوج (Markdown بسيط، من غير أي بيلد أو تثبيت)

   إزاي يشتغل باختصار:
   - كل بوست هو ملف .md عادي جوا مجلد posts/
   - أول الملف فيه "بيانات" بسيطة بين ---  و---  (العنوان، التاريخ، الوصف، التاجات)
   - بعد كده تكتب البوست بصيغة Markdown عادي (# عنوان، **بولد**، الخ)
   - posts/manifest.js فيه قايمة بأسماء الملفات، وده الحتة الوحيدة
     اللي محتاج تضيف فيها سطر لما تعمل بوست جديد

   رابط البوست هو اسم الملف نفسه من غير ".md"، يعني ملف
   "hello-world.md" بيظهر على الرابط /blog/hello-world/
   التفاصيل الكاملة (إزاي تضيف بوست جديد برابط جميل) في ملف
   اقرأني-كيف-تعدل.txt

   الملف ده مش محتاج تعدل فيه حاجة أبدًا — إلا لو عايز تضيف تصنيف
   (تاج) جديد، وقتها هتلاقي القايمة TAG_DEFS تحت وتضيف عليها سطر
   بنفس الشكل.
   ========================================================================= */

/* ---------------------------------------------------------------------
   قايمة التصنيفات (Flairs) المتاحة. لكل تصنيف: label (اللابل اللي
   بيتعرض)، وإما:
   - bg: لون خلفية عادي (نص التصنيف بيتكتب على اللون)
   - img: صورة بدل النص — بتتقص تلقائي عشان تملى شكل الفلير المستدير
     (pill) بالكامل من غير أي فراغ. لو عايز تتحكم في عرض الصورة، ضيف
     imgW (بالبكسل، افتراضيًا 100).
--------------------------------------------------------------------- */
var TAG_DEFS = {
  politics:   { label: "Politics & سياسة",   bg: "#5b6b7c" },
  faith:      { label: "Faith & دين",        bg: "#3f6b4f" },
  society:    { label: "Society & مجتمع", img: "/img/flairs/society.png" },
  philosophy: { label: "Philosophy & فلسفة", img: "/img/flairs/Philosophy.png" },
  palestine:  { label: "Palestine & فلسطين", img: "/img/flairs/palestine.png" },
  lgbtq:      { label: "LGBTQ", img: "/img/flairs/faggots.png" },
  atheism:    { label: "Atheism & إلحاد", img: "/img/flairs/atheism.png" },
  asshole:    { label: "ASSHOLE", img: "/img/flairs/asshole.png" },
  rebuttal:   { label: "Debates & نقاشات", img: "/img/flairs/debates.png" },

  /* الـ asshole فوق ده مثال شغال فعلي على تصنيف بصورة (img) بدل لون —
     لو عايز تحول تصنيف تاني لصورة، بدّل bg: "..." بـ:
       img: "/img/flairs/اسم-الصورة.png"
     ولو عرض الصورة الافتراضي (100px) مش مناسب، ضيف imgW كمان:
       img: "/img/flairs/اسم-الصورة.png", imgW: 130 */
};

var POSTS_PER_PAGE = 5;

/** يفصل الـ front matter (بين ---) عن باقي محتوى البوست */
function parseFrontMatter(raw) {
  var match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }
  var block = match[1];
  var content = match[2];
  var data = {};
  block.split("\n").forEach(function (line) {
    var idx = line.indexOf(":");
    if (idx === -1) return;
    var key = line.slice(0, idx).trim();
    var value = line.slice(idx + 1).trim();
    data[key] = value;
  });
  return { data: data, content: content };
}

/** بيحوّل "2026-08-07" لشكل "August 07, 2026" */
function formatDate(dateStr) {
  var d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr || "";
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return months[d.getMonth()] + " " + String(d.getDate()).padStart(2, "0") + ", " + d.getFullYear();
}

/** اسم ملف "hello-world.md" -> سلاج "hello-world" -> رابط "/blog/hello-world/" */
function slugFromFilename(filename) {
  return filename.replace(/\.md$/i, "");
}
function postUrl(filename) {
  return "/blog/" + slugFromFilename(filename) + "/";
}

/** بيرجع HTML لبادچ (pill) تصنيف واحد — صورة مقصوصة بشكل الفلير بالكامل، أو نص وحده لون */
function tagBadge(slug) {
  var def = TAG_DEFS[slug];
  if (def && def.img) {
    var w = def.imgW || 100;
    return '<img class="flair-img" src="' + def.img + '" alt="' + def.label + '" title="' + def.label + '" style="width:' + w + 'px;">';
  }
  var label = def ? def.label : slug;
  var bg = def ? def.bg : "var(--accent-soft)";
  var color = def ? "#fff" : "var(--accent)";
  return '<span class="tag flair" style="background:' + bg + '; color:' + color + ';">' + label + '</span>';
}

/** بيجيب ملف بوست واحد ويرجّع بياناته + محتواه (باستخدام مساره الكامل من الجذر) */
function loadPost(filename) {
  return fetch("/posts/" + filename)
    .then(function (res) {
      if (!res.ok) throw new Error("تعذر تحميل " + filename);
      return res.text();
    })
    .then(function (raw) {
      var parsed = parseFrontMatter(raw);
      return {
        filename: filename,
        title: parsed.data.title || filename,
        date: parsed.data.date || "",
        description: parsed.data.description || "",
        tags: parsed.data.tags ? parsed.data.tags.split(",").map(function (t) { return t.trim().toLowerCase(); }).filter(Boolean) : [],
        content: parsed.content
      };
    });
}

/** بيجيب بوست باستخدام السلاج بتاعه (المشتق من رابط الصفحة) */
function loadPostBySlug(slug) {
  var match = POSTS.filter(function (f) { return slugFromFilename(f) === slug; })[0];
  if (!match) return Promise.reject(new Error("مفيش بوست بالسلاج ده: " + slug));
  return loadPost(match);
}

/* =========================================================================
   منطق صفحة البلوج (قائمة البوستات + التصنيفات + البحث + الصفحات)
   ========================================================================= */

var blogState = {
  posts: [],       // كل البوستات بعد التحميل
  activeTag: null, // التصنيف المختار حاليًا، أو null يعني "الكل"
  query: "",       // نص البحث
  page: 1
};

function initBlogPage() {
  var listEl = document.getElementById("post-list");
  if (!listEl || typeof POSTS === "undefined") return;

  // لو جاي من رابط فيه ?q=كلمة (زي البحث من الشريط العلوي)، فعّل البحث على طول
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  if (initialQuery) {
    blogState.query = initialQuery.trim().toLowerCase();
    var searchInputEl = document.getElementById("search-input");
    var navSearchInputEl = document.getElementById("nav-search-input");
    if (searchInputEl) searchInputEl.value = initialQuery;
    if (navSearchInputEl) navSearchInputEl.value = initialQuery;
  }

  Promise.all(POSTS.map(loadPost))
    .then(function (posts) {
      posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      blogState.posts = posts;
      renderFlairBar();
      renderBlogList();
    })
    .catch(function (err) {
      listEl.innerHTML = '<p style="color:var(--ink-soft);">حصل خطأ في تحميل البوستات. لو بتفتح الملف على جهازك مباشرة (file://) لازم تشغّله عن طريق سيرفر محلي بسيط — شوف ملف اقرأني-كيف-تعدل.txt.</p>';
      console.error(err);
    });

  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      blogState.query = searchInput.value.trim().toLowerCase();
      blogState.page = 1;
      var navSearchInputEl = document.getElementById("nav-search-input");
      if (navSearchInputEl) navSearchInputEl.value = searchInput.value;
      renderBlogList();
    });
  }
}

function renderFlairBar() {
  var bar = document.getElementById("flair-bar");
  if (!bar) return;

  var usedTags = {};
  blogState.posts.forEach(function (p) {
    p.tags.forEach(function (t) { usedTags[t] = true; });
  });
  var slugs = Object.keys(TAG_DEFS).filter(function (s) { return usedTags[s]; });

  if (slugs.length === 0) { bar.innerHTML = ""; return; }

  var allBtn = '<button type="button" class="flair-btn' + (blogState.activeTag === null ? " active" : "") + '" data-tag="">All</button>';
  var tagBtns = slugs.map(function (slug) {
    var def = TAG_DEFS[slug];
    var active = blogState.activeTag === slug ? " active" : "";
    if (def.img) {
      var w = (def.imgW || 100) + 16;
      return '<button type="button" class="flair-btn flair-btn-img' + active + '" data-tag="' + slug + '"><img class="flair-img-btn" src="' + def.img + '" alt="' + def.label + '" style="width:' + w + 'px;"></button>';
    }
    return '<button type="button" class="flair-btn' + active + '" data-tag="' + slug + '" style="background:' + def.bg + ';">' + def.label + '</button>';
  }).join("");

  bar.innerHTML = allBtn + tagBtns;

  bar.querySelectorAll(".flair-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tag = btn.getAttribute("data-tag");
      blogState.activeTag = tag === "" ? null : tag;
      blogState.page = 1;
      renderFlairBar();
      renderBlogList();
    });
  });
}

function getFilteredPosts() {
  return blogState.posts.filter(function (p) {
    var matchesTag = !blogState.activeTag || p.tags.indexOf(blogState.activeTag) !== -1;
    var q = blogState.query;
    var matchesQuery = !q || (p.title.toLowerCase().indexOf(q) !== -1 || p.description.toLowerCase().indexOf(q) !== -1);
    return matchesTag && matchesQuery;
  });
}

function renderBlogList() {
  var container = document.getElementById("post-list");
  if (!container) return;

  var filtered = getFilteredPosts();

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:var(--ink-soft);">مفيش بوستات مطابقة.</p>';
    renderPagination(0);
    return;
  }

  var totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  if (blogState.page > totalPages) blogState.page = totalPages;

  var start = (blogState.page - 1) * POSTS_PER_PAGE;
  var pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

  container.innerHTML = pagePosts.map(function (p) {
    var tagsHtml = p.tags.length
      ? '<div class="tags">' + p.tags.map(tagBadge).join("") + '</div>'
      : "";
    return (
      '<a href="' + postUrl(p.filename) + '" style="text-decoration:none;">' +
        '<div class="card">' +
          '<h3>' + p.title + '</h3>' +
          '<div class="meta">' + formatDate(p.date) + '</div>' +
          '<p>' + p.description + '</p>' +
          tagsHtml +
          '<span class="card-link">Read post</span>' +
        '</div>' +
      '</a>'
    );
  }).join("");

  renderPagination(totalPages);

  if (typeof applyBidiFix === "function") applyBidiFix(container);
}

function renderPagination(totalPages) {
  var pag = document.getElementById("pagination");
  if (!pag) return;
  if (totalPages <= 1) { pag.innerHTML = ""; return; }

  var buttons = [];
  buttons.push('<button type="button" class="page-btn" data-page="prev"' + (blogState.page === 1 ? " disabled" : "") + '>&lt;</button>');
  for (var i = 1; i <= totalPages; i++) {
    buttons.push('<button type="button" class="page-btn' + (i === blogState.page ? " active" : "") + '" data-page="' + i + '">' + i + '</button>');
  }
  buttons.push('<button type="button" class="page-btn" data-page="next"' + (blogState.page === totalPages ? " disabled" : "") + '>&gt;</button>');
  pag.innerHTML = buttons.join("");

  pag.querySelectorAll(".page-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-page");
      if (target === "prev") blogState.page = Math.max(1, blogState.page - 1);
      else if (target === "next") blogState.page = Math.min(totalPages, blogState.page + 1);
      else blogState.page = parseInt(target, 10);
      renderBlogList();
      var listEl = document.getElementById("post-list");
      if (listEl) listEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* =========================================================================
   منطق صفحة البوست الواحد (السلاج بييجي من رابط الصفحة /blog/<slug>/)
   ========================================================================= */

function renderSinglePost() {
  var titleEl = document.getElementById("post-title");
  var metaEl = document.getElementById("post-meta");
  var bodyEl = document.getElementById("post-body");
  var tagsEl = document.getElementById("post-tags");

  var parts = window.location.pathname.split("/").filter(Boolean); // ["blog", "hello-world"]
  var slug = parts.length ? parts[parts.length - 1] : "";

  if (!slug || typeof POSTS === "undefined") {
    bodyEl.innerHTML = "<p>مفيش بوست محدد.</p>";
    return;
  }

  loadPostBySlug(slug)
    .then(function (p) {
      document.title = "ioseph — " + p.title;
      titleEl.textContent = p.title;
      metaEl.textContent = formatDate(p.date);
      if (p.tags.length && tagsEl) {
        tagsEl.innerHTML = p.tags.map(tagBadge).join("");
      }
      bodyEl.innerHTML = marked.parse(p.content);
      if (typeof applyBidiFix === "function") {
        applyBidiFix(bodyEl);
        applyBidiFix(titleEl.parentElement);
      }
    })
    .catch(function (err) {
      bodyEl.innerHTML = '<p>حصل خطأ في تحميل البوست. لو بتفتح الملف على جهازك مباشرة (file://) لازم تشغّله عن طريق سيرفر محلي بسيط — شوف ملف اقرأني-كيف-تعدل.txt.</p>';
      console.error(err);
    });
}
