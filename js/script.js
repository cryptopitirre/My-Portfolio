/* ==========================================================================
   Portfolio — Francisco-Efraín Rodríguez-Rivera
   Plain JavaScript, no libraries.

   1. Theme: starts from the visitor's system setting, the button switches
      between light and dark, and the choice is remembered on this device.
   2. Section links: the menu link for the section on screen is marked.

   This file is loaded in the <head> so a saved theme applies before the
   page paints. Everything that needs the page waits for DOMContentLoaded.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement;
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  /* ---------- Theme ---------- */

  // Storage can be blocked (private windows, strict settings), so every access is guarded.
  function readSavedTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Not saved; the theme still applies for this visit.
    }
  }

  function currentTheme() {
    var chosen = root.getAttribute("data-theme");
    if (chosen === "light" || chosen === "dark") {
      return chosen;
    }
    return systemDark && systemDark.matches ? "dark" : "light";
  }

  // Apply a saved choice right away. With no saved choice the CSS follows the system.
  var saved = readSavedTheme();
  if (saved) {
    root.setAttribute("data-theme", saved);
  }

  function updateButton(button) {
    button.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
  }

  function setUpThemeButton() {
    var button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    updateButton(button);

    button.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      saveTheme(next);
      updateButton(button);
    });

    // If the visitor has not picked a theme, follow system changes while the page is open.
    if (systemDark) {
      var onSystemChange = function () {
        if (!readSavedTheme()) {
          updateButton(button);
        }
      };
      if (systemDark.addEventListener) {
        systemDark.addEventListener("change", onSystemChange);
      } else if (systemDark.addListener) {
        systemDark.addListener(onSystemChange);
      }
    }
  }

  /* ---------- Section links ---------- */

  function setUpSectionLinks() {
    var links = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) {
      return;
    }

    var linkById = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) {
        linkById[id] = link;
        sections.push(section);
      }
    });

    function markCurrent(id) {
      links.forEach(function (link) {
        link.removeAttribute("aria-current");
      });
      if (id && linkById[id]) {
        linkById[id].setAttribute("aria-current", "true");
      }
    }

    // A section counts as "on screen" when it crosses a band near the middle of the window.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          markCurrent(entry.target.id);
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Back at the introduction, no menu link is marked.
    var hero = document.getElementById("top");
    if (hero) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          markCurrent(null);
        }
      }, { rootMargin: "-40% 0px -55% 0px" }).observe(hero);
    }
  }

  /* ---------- Start ---------- */

  function start() {
    setUpThemeButton();
    setUpSectionLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
