// 👋 You don't need to edit this file!
// It reads your settings from my-website.js and makes the page work.
// In Part 2 it sends what visitors type to the backend (server.js).

(function () {
  "use strict";

  // ---------- 1. Make sure my-website.js loaded ----------
  if (typeof MY_WEBSITE === "undefined") {
    document.body.innerHTML =
      '<div class="oops">' +
      "<h1>Oops! There’s a typo in my-website.js</h1>" +
      "<p>Your website couldn’t read its settings. Open <code>my-website.js</code> and check:</p>" +
      "<ul>" +
      "<li>Every piece of text has a <code>\"</code> at the start <strong>and</strong> the end.</li>" +
      "<li>Every line ends with a comma <code>,</code></li>" +
      "<li>You didn’t use <code>\"</code> inside your text (use <code>'</code> instead).</li>" +
      "<li>Your quotes are straight <code>\"</code>, not curly <code>“ ”</code>. (Mac TextEdit sometimes changes them: retype them in nano instead.)</li>" +
      "<li>The <code>[ ]</code> around your examples and the <code>{ }</code> at the top and bottom are still there.</li>" +
      "</ul>" +
      "<p>Fix it, save, and refresh this page.</p></div>";
    return;
  }

  var site = MY_WEBSITE;
  var THEMES = ["lavender", "pumpkin", "midnight", "forest", "ocean", "bubblegum"];
  var FONTS = {
    modern:  "Montserrat:wght@500;600;700;800",
    classic: "Fraunces:wght@600;800&family=Source+Serif+4:wght@400;600",
    playful: "Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700",
    techy:   "JetBrains+Mono:wght@600;800&family=IBM+Plex+Sans:wght@400;600"
  };

  function text(value, fallback) {
    return (typeof value === "string" && value.trim() !== "") ? value : fallback;
  }

  // ---------- 2. Fill the page with your settings ----------
  var theme = THEMES.indexOf(site.theme) >= 0 ? site.theme : "lavender";
  var font = FONTS[site.font] ? site.font : "modern";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-font", font);

  var fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=" + FONTS[font] + "&display=swap";
  document.head.appendChild(fontLink);

  var siteName = text(site.siteName, "My AI Website");
  document.title = siteName;
  document.getElementById("siteName").textContent = siteName;
  document.getElementById("emoji").textContent = text(site.emoji, "✨");
  document.getElementById("tagline").textContent = text(site.tagline, "");
  document.getElementById("description").textContent = text(site.description, "");
  document.getElementById("inputLabel").textContent = text(site.inputLabel, "Ask me anything");
  document.getElementById("answerTitle").textContent = text(site.answerTitle, "Answer");
  document.getElementById("madeBy").textContent = text(site.madeBy, "you");

  var input = document.getElementById("userInput");
  input.placeholder = text(site.inputPlaceholder, "Type here…");

  var button = document.getElementById("askButton");
  var buttonText = text(site.buttonText, "Ask");
  button.textContent = buttonText;

  var examples = Array.isArray(site.examples) ? site.examples.filter(function (e) { return typeof e === "string" && e.trim(); }) : [];
  var chipBox = document.getElementById("examples");
  if (examples.length === 0) {
    document.getElementById("examplesRow").hidden = true;
  }
  examples.forEach(function (example) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = example;
    chip.addEventListener("click", function () {
      input.value = example;
      input.focus();
    });
    chipBox.appendChild(chip);
  });

  // ---------- 3. Demo mode or real AI? ----------
  var modeNote = document.getElementById("modeNote");
  var live = false;

  function setDemo(reason) {
    live = false;
    modeNote.className = "mode";
    modeNote.textContent = reason || "Demo mode: pretend answers until Part 2";
  }

  if (location.protocol === "file:") {
    setDemo();
  } else {
    fetch("api/status")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (status) {
        if (status && status.ready) {
          live = true;
          modeNote.className = "mode live";
          modeNote.textContent = "Connected to AI";
        } else if (status) {
          setDemo("Demo mode: " + (status.reason || "add your API key to connect the AI"));
        } else {
          setDemo();
        }
      })
      .catch(function () { setDemo(); });
  }

  // ---------- 4. Show answers nicely ----------
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Turns simple formatting (**bold**, - bullet points, blank lines) into HTML
  function format(answer) {
    var lines = escapeHtml(answer).split(/\r?\n/);
    var html = "", para = [], list = [];
    function inline(s) {
      return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^#{1,6}\s*(.*)$/, "<strong>$1</strong>");
    }
    function flushPara() { if (para.length) { html += "<p>" + para.map(inline).join("<br>") + "</p>"; para = []; } }
    function flushList() { if (list.length) { html += "<ul>" + list.map(function (li) { return "<li>" + inline(li) + "</li>"; }).join("") + "</ul>"; list = []; } }
    lines.forEach(function (line) {
      var bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (bullet) { flushPara(); list.push(bullet[1]); }
      else if (line.trim() === "") { flushPara(); flushList(); }
      else { flushList(); para.push(line); }
    });
    flushPara(); flushList();
    return html;
  }

  var answerBox = document.getElementById("answerBox");
  var answerText = document.getElementById("answerText");

  function show(html) {
    answerBox.hidden = false;
    answerText.innerHTML = html;
  }

  // ---------- 5. When someone clicks the button ----------
  function getAnswer(message) {
    var demoAnswer = { answer: text(site.demoAnswer, "This is a pretend answer. In Part 2 a real AI will answer here!") };
    if (!live) {
      return new Promise(function (resolve) { setTimeout(function () { resolve(demoAnswer); }, 700); });
    }
    return fetch("api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) return { error: data.error || "Something went wrong (error " + r.status + ")." };
          return { answer: data.answer || "" };
        });
      })
      .catch(function () {
        return { error: "Couldn’t reach the backend. Is server.js still running in your terminal?" };
      });
  }

  document.getElementById("askForm").addEventListener("submit", function (event) {
    event.preventDefault();
    var message = input.value.trim();
    if (!message) return;

    button.disabled = true;
    button.textContent = "Thinking…";
    show('<div class="dots" aria-label="Loading"><span>•</span><span>•</span><span>•</span></div>');

    getAnswer(message).then(function (result) {
      if (result.error) {
        show('<p class="error">' + escapeHtml(result.error) + "</p>");
      } else {
        show(format(result.answer) || "<p>(The AI sent back an empty answer. Try again!)</p>");
      }
      button.disabled = false;
      button.textContent = buttonText;
    });
  });

  // Ctrl+Enter or Cmd+Enter also sends
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      document.getElementById("askForm").requestSubmit();
    }
  });
})();
