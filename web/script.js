(function () {
  "use strict";

  // Smooth-scroll for nav links (with sticky-header offset)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  // Click-to-copy for terminal blocks
  document.querySelectorAll(".terminal").forEach(function (term) {
    term.addEventListener("click", function () {
      var text = term.getAttribute("data-copy") || "";
      var done = function () {
        term.classList.add("copied");
        var label = term.querySelector(".terminal-copy");
        var prev = label ? label.textContent : "";
        if (label) label.textContent = "copied!";
        setTimeout(function () {
          term.classList.remove("copied");
          if (label) label.textContent = prev;
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
  }

  // Highlight the line at the reading position in the teleprompter demo
  var demoScroll = document.querySelector(".demo-scroll");
  if (demoScroll) {
    var lines = demoScroll.querySelectorAll("p");
    var viewport = demoScroll.parentElement;
    var readingLineY = viewport.offsetHeight / 2;

    function updateActiveLine() {
      var scrollRect = demoScroll.getBoundingClientRect();
      var viewportRect = viewport.getBoundingClientRect();
      var scrollTop = scrollRect.top - viewportRect.top;

      var activeIndex = -1;
      for (var i = 0; i < lines.length; i++) {
        var lineRect = lines[i].getBoundingClientRect();
        var lineCenter = lineRect.top + lineRect.height / 2 - viewportRect.top;
        if (Math.abs(lineCenter - readingLineY) < lineRect.height / 2) {
          activeIndex = i;
          break;
        }
      }

      for (var i = 0; i < lines.length; i++) {
        if (i === activeIndex) {
          lines[i].classList.add("active");
        } else {
          lines[i].classList.remove("active");
        }
      }
    }

    function tick() {
      updateActiveLine();
      requestAnimationFrame(tick);
    }
    tick();
  }

  // Subtle fade-in on scroll for sections
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.opacity = "1";
            en.target.style.transform = "none";
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(".section").forEach(function (s) {
      s.style.opacity = "0";
      s.style.transform = "translateY(10px)";
      s.style.transition = "opacity 520ms ease, transform 520ms ease";
      io.observe(s);
    });
  }

  // Show the latest stable release version on the Download button.
  // href already points to /releases/latest (server-side redirect), so this
  // is a progressive enhancement - if the API call fails, nothing breaks.
  var dlBtn = document.getElementById("download-btn");
  if (dlBtn) {
    var verSpan = dlBtn.querySelector(".ver");
    fetch("https://api.github.com/repos/jatinkrmalik/pmptr/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (rel) {
        if (rel && rel.tag_name) {
          if (verSpan) verSpan.textContent = " " + rel.tag_name;
          if (rel.html_url) dlBtn.setAttribute("href", rel.html_url);
        }
      })
      .catch(function () {});
  }
})();
