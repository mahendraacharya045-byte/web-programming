/* Bapsang: shared script. Each feature only runs if its elements exist on the page. */
(function () {
  "use strict";
  var FR = { 0.25: "\u00BC", 0.5: "\u00BD", 0.75: "\u00BE" };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var announcer = $("#announcer");
  function say(msg) { if (!announcer) return; announcer.textContent = ""; setTimeout(function () { announcer.textContent = msg; }, 50); }

  /* ---------- Footer year ---------- */
  $$(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- Mobile navigation ---------- */
  var toggle = $("#nav-toggle"), menu = $("#nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
      }
    });
  }

  /* ---------- Dish photos hotlinked from Wikipedia (nothing downloaded) ---------- */
  function setPhoto(el, url) {
    var fig = $("figure", el), svg = fig && $("svg", fig);
    if (!svg || $(".photo", fig)) return;
    var img = new Image();
    img.className = "photo"; img.width = 640; img.height = 400; img.loading = "lazy"; img.decoding = "async";
    img.alt = el.dataset.title + ", served as a finished dish";
    img.onload = function () { svg.replaceWith(img); var c = $(".credit", fig); if (c) c.hidden = false; };
    img.src = url; /* on error the SVG illustration simply stays */
  }
  $$("[data-wiki]").forEach(function (el) {
    var title = el.dataset.wiki, key = "bapsang-img-" + title, cached = null;
    try { cached = sessionStorage.getItem(key); } catch (e) {}
    if (cached) { setPhoto(el, cached); return; }
    fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var src = d && d.thumbnail && d.thumbnail.source; if (!src) return;
        src = src.replace(/\/\d+px-/, "/640px-");
        try { sessionStorage.setItem(key, src); } catch (e) {}
        setPhoto(el, src);
      }).catch(function () {});
  });

  /* ---------- Recipes page ---------- */
  var recipes = $$(".recipe");
  if (recipes.length) {
    function fmt(n, u) {
      if (u === "g" || u === "ml") return String(Math.round(n / 5) * 5);
      var r = Math.round(n * 4) / 4, w = Math.floor(r), p = +(r - w).toFixed(2);
      return ((w > 0 ? w : "") + (p ? (FR[p] || "") : "")) || "\u00BC";
    }
    /* Servings */
    recipes.forEach(function (rec) {
      var base = +rec.dataset.base, cur = base, count = $(".count", rec), amts = $$(".amt", rec);
      function render() {
        amts.forEach(function (a) { var u = a.dataset.unit; a.textContent = fmt(+a.dataset.amt * cur / base, u) + (u ? " " + u : ""); });
        count.textContent = cur + (cur === 1 ? " serving" : " servings");
      }
      $$(".servings button", rec).forEach(function (b) {
        b.addEventListener("click", function () { cur = Math.min(12, Math.max(1, cur + (+b.dataset.dir))); render(); });
      });
      rec._servings = function () { return cur; };
    });

    /* Favorites */
    var favs = []; try { favs = JSON.parse(store("bapsang-favs") || "[]"); } catch (e) { favs = []; }
    function paintFav(rec) {
      var on = favs.indexOf(rec.id) > -1, b = $(".fav", rec);
      b.setAttribute("aria-pressed", on); $(".heart", b).innerHTML = on ? "&#9829;" : "&#9825;";
    }
    recipes.forEach(function (rec) {
      paintFav(rec);
      $(".fav", rec).addEventListener("click", function () {
        var i = favs.indexOf(rec.id), name = $("h2", rec).textContent;
        if (i > -1) { favs.splice(i, 1); say(name + " removed from favorites"); } else { favs.push(rec.id); say(name + " added to favorites"); }
        store("bapsang-favs", JSON.stringify(favs)); paintFav(rec); applyFilters();
      });
    });

    /* Search + filter */
    var search = $("#search"), results = $("#results"), empty = $("#empty"), filter = "all";
    function applyFilters() {
      var q = search.value.trim().toLowerCase(), shown = 0;
      recipes.forEach(function (rec) {
        var okQ = !q || rec.dataset.name.indexOf(q) > -1 || rec.dataset.text.indexOf(q) > -1;
        var okF = filter === "all" || (filter === "fav" ? favs.indexOf(rec.id) > -1 : rec.dataset.cat === filter);
        rec.hidden = !(okQ && okF); if (okQ && okF) shown++;
      });
      empty.hidden = shown > 0;
      results.textContent = "Showing " + shown + " of " + recipes.length + " recipes" + (filter === "fav" && !shown && !q ? ". You have no favorites yet." : "");
    }
    search.addEventListener("input", applyFilters);
    $$(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".chip").forEach(function (o) { o.setAttribute("aria-pressed", o === c); });
        filter = c.dataset.filter; applyFilters();
      });
    });
    applyFilters();

    /* Copy shopping list */
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      return new Promise(function (res, rej) {
        var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); }
        document.body.removeChild(ta);
      });
    }
    $$(".copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var rec = btn.closest(".recipe"), name = $("h2", rec).textContent;
        var lines = $$(".ingredients li", rec).filter(function (li) { return !$("input", li).checked; })
          .map(function (li) { return "- " + $("label span", li).textContent.replace(/\s+/g, " ").trim(); });
        if (!lines.length) { say("Every ingredient is ticked off. Nothing to copy."); return; }
        copyText(name + " (" + rec._servings() + " servings)\n" + lines.join("\n"))
          .then(function () { say("Shopping list copied: " + lines.length + " items"); }, function () { say("Could not copy. Select the ingredients manually."); });
      });
    });

    /* Print one recipe */
    $$(".print").forEach(function (b) {
      b.addEventListener("click", function () {
        var rec = b.closest(".recipe");
        recipes.forEach(function (r) { r.dataset.was = r.hidden; if (r !== rec) r.hidden = true; });
        window.print();
        recipes.forEach(function (r) { r.hidden = r.dataset.was === "true"; });
      });
    });

    /* Step timers */
    function beep() { try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); setTimeout(function () { o.stop(); c.close(); }, 500); } catch (e) {} }
    function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
    $$(".timer-btn").forEach(function (btn) {
      var out = btn.parentNode.querySelector(".timer-out"), id = null, end = 0, mins = +btn.dataset.min, lab = btn.dataset.label;
      function reset() { clearInterval(id); id = null; btn.textContent = "Start " + mins + " min timer"; btn.setAttribute("aria-label", "Start " + mins + " minute timer for " + lab); }
      btn.addEventListener("click", function () {
        if (id) { reset(); out.textContent = ""; say("Timer stopped"); return; }
        end = Date.now() + mins * 60000; out.textContent = mmss(mins * 60);
        btn.textContent = "Stop timer"; btn.setAttribute("aria-label", "Stop timer for " + lab); say("Timer started for " + mins + " minutes");
        id = setInterval(function () {
          var left = Math.max(0, Math.round((end - Date.now()) / 1000)); out.textContent = mmss(left);
          if (left === 0) { reset(); out.textContent = "Done!"; beep(); say("Timer finished for " + lab); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
        }, 500);
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  var form = $("#contact-form");
  if (form) {
    var fields = [
      { id: "name", test: function (v) { return v.trim().length >= 2; }, msg: "Enter your name (at least 2 characters)." },
      { id: "email", test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: "Enter an email address like name@example.com." },
      { id: "topic", test: function (v) { return v !== ""; }, msg: "Choose a topic." },
      { id: "message", test: function (v) { return v.trim().length >= 10; }, msg: "Write a message of at least 10 characters." }
    ];
    var summary = $("#error-summary"), list = $("#error-list"), box = $("#form-box"), done = $("#form-done");
    function setError(f, show) {
      var input = $("#" + f.id), err = $("#" + f.id + "-error");
      if (show) { input.setAttribute("aria-invalid", "true"); err.textContent = f.msg; }
      else { input.removeAttribute("aria-invalid"); err.textContent = ""; }
    }
    fields.forEach(function (f) {
      $("#" + f.id).addEventListener("blur", function () { setError(f, !f.test(this.value)); });
      $("#" + f.id).addEventListener("input", function () { if (this.getAttribute("aria-invalid")) setError(f, !f.test(this.value)); });
    });
    var msgBox = $("#message"), counter = $("#counter");
    if (msgBox && counter) msgBox.addEventListener("input", function () { counter.textContent = msgBox.value.length + " characters"; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = fields.filter(function (f) { var ok = f.test($("#" + f.id).value); setError(f, !ok); return !ok; });
      if (bad.length) {
        list.innerHTML = "";
        bad.forEach(function (f) {
          var li = document.createElement("li"), a = document.createElement("a");
          a.href = "#" + f.id; a.textContent = f.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); $("#" + f.id).focus(); });
          li.appendChild(a); list.appendChild(li);
        });
        summary.hidden = false; summary.focus(); return;
      }
      summary.hidden = true;
      /* Demo only: nothing is sent anywhere. */
      form.hidden = true; done.hidden = false; $("#done-name").textContent = $("#name").value.trim(); done.focus();
    });
    $("#reset-form").addEventListener("click", function () {
      form.reset(); fields.forEach(function (f) { setError(f, false); });
      if (counter) counter.textContent = "0 characters";
      done.hidden = true; form.hidden = false; $("#name").focus();
    });
  }
})();
