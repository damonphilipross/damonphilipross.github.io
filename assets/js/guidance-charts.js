/* Charts for "I let code decide whether guidance went up or down".
   Same conventions as asx-charts.js: Chart.js from CDN, each chart only
   initialises if its canvas is on the page. Data: guidance-eval
   results/scores_production_prompt.csv (5 models x 40 x 2 = 400 attempts). */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (typeof Chart === "undefined") return;

    var FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
    Chart.defaults.font.family = FONT;
    Chart.defaults.color = "#6b7280";
    Chart.defaults.font.size = 13;

    var GRID = "#eef0f2";
    var INK = "#111827";
    var INDIGO = "#4f46e5"; // model's own label
    var SLATE = "#94a3b8";  // code
    var GREEN = "#10b981";
    var AMBER = "#f59e0b";
    var RED = "#ef4444";

    var MODELS = ["GLM 5.3 Flash", "MiMo v2.5", "DeepSeek V4 Pro", "Haiku 5.5", "Qwen 3.7 Flash"];
    // order matches MODELS
    var LABEL = [100, 100, 100, 97.5, 92.5];
    var CODE = [91.2, 92.5, 96.2, 91.2, 91.2];
    var COST = [0.23, 0.86, 3.42, 1.40, 0.20];
    // attempts out of 80: both right, only label right, only code right, neither
    var BOTH = [73, 74, 77, 73, 70];
    var ONLY_LABEL = [7, 6, 3, 5, 4];
    var ONLY_CODE = [0, 0, 0, 0, 3];
    var NEITHER = [0, 0, 0, 2, 3];

    function title(text) {
      return {
        display: true, text: text, align: "start", color: INK,
        font: { size: 16, weight: "700" }, padding: { bottom: 14 },
      };
    }

    // ------------------------------------------------ label vs code
    var lc = document.getElementById("chart-label-vs-code");
    if (lc) {
      new Chart(lc, {
        type: "bar",
        data: {
          labels: MODELS,
          datasets: [
            { label: "Model's own label", data: LABEL, backgroundColor: INDIGO, borderRadius: 6, barPercentage: 0.8, categoryPercentage: 0.7 },
            { label: "My code, from the model's numbers", data: CODE, backgroundColor: SLATE, borderRadius: 6, barPercentage: 0.8, categoryPercentage: 0.7 },
          ],
        },
        options: {
          indexAxis: "y", responsive: true, maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            title: title("Direction accuracy, % of 80 attempts"),
            legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: "rectRounded" } },
            tooltip: { callbacks: { label: function (c) { return "  " + c.dataset.label + ": " + c.parsed.x + "%"; } } },
          },
          scales: {
            x: { min: 80, max: 100, grid: { color: GRID }, ticks: { callback: function (v) { return v + "%"; } }, border: { display: false } },
            y: { grid: { display: false }, ticks: { color: INK, font: { size: 14, weight: "600" } }, border: { display: false } },
          },
        },
      });
    }

    // ------------------------------------------------ where errors sit
    var ag = document.getElementById("chart-agreement");
    if (ag) {
      new Chart(ag, {
        type: "bar",
        data: {
          labels: MODELS,
          datasets: [
            { label: "Agree, both right", data: BOTH, backgroundColor: GREEN },
            { label: "Disagree, label right", data: ONLY_LABEL, backgroundColor: INDIGO },
            { label: "Disagree, code right", data: ONLY_CODE, backgroundColor: AMBER },
            { label: "Both wrong or blank", data: NEITHER, backgroundColor: RED },
          ],
        },
        options: {
          indexAxis: "y", responsive: true, maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            title: title("When label and code agree, they're right: 0 wrong agreements in 400"),
            legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: "rectRounded" } },
            tooltip: { callbacks: { label: function (c) { return "  " + c.dataset.label + ": " + c.parsed.x + " of 80"; } } },
          },
          scales: {
            x: { stacked: true, max: 80, grid: { color: GRID }, border: { display: false } },
            y: { stacked: true, grid: { display: false }, ticks: { color: INK, font: { size: 14, weight: "600" } }, border: { display: false } },
          },
        },
      });
    }

    // ------------------------------------------------ cost vs accuracy
    var cs = document.getElementById("chart-cost");
    if (cs) {
      var pts = MODELS.map(function (m, i) { return { x: COST[i], y: LABEL[i], name: m }; });
      var nameLabels = {
        id: "nameLabels",
        afterDatasetsDraw: function (chart) {
          var ctx = chart.ctx;
          chart.getDatasetMeta(0).data.forEach(function (pt, i) {
            var d = pts[i];
            ctx.save();
            ctx.font = "600 12px " + FONT;
            ctx.fillStyle = INK;
            var right = d.x > 2;
            ctx.textAlign = right ? "right" : "left";
            var dy = d.name === "MiMo v2.5" ? 16 : d.name === "GLM 5.3 Flash" ? -12 : -12;
            ctx.fillText(d.name + "  $" + d.x.toFixed(2), pt.x + (right ? -10 : 10), pt.y + dy);
            ctx.restore();
          });
        },
      };
      new Chart(cs, {
        type: "scatter",
        data: { datasets: [{ data: pts, backgroundColor: INDIGO, pointRadius: 7, pointHoverRadius: 9 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            title: title("Same score, 15x the price"),
            legend: { display: false },
            tooltip: { callbacks: { label: function (c) { return "  " + c.raw.name + ": " + c.raw.y + "% at $" + c.raw.x.toFixed(2) + " per 1,000"; } } },
          },
          scales: {
            x: { type: "logarithmic", min: 0.1, max: 6, grid: { color: GRID }, border: { display: false },
                 title: { display: true, text: "US$ per 1,000 announcements (log scale)" },
                 ticks: { callback: function (v) { return [0.1, 0.2, 0.5, 1, 2, 5].indexOf(v) >= 0 ? "$" + v : ""; } } },
            y: { min: 90, max: 101, grid: { color: GRID }, border: { display: false },
                 title: { display: true, text: "Label accuracy" },
                 ticks: { callback: function (v) { return v <= 100 ? v + "%" : ""; } } },
          },
        },
        plugins: [nameLabels],
      });
    }
  });
})();
