/* Interactive charts for the "Can Claude do ASX equity research?" post.
   Uses Chart.js (loaded from CDN by the post). Each chart initialises only
   if its canvas is present, so this file is safe on any page. */
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
    var INDIGO = "#4f46e5";   // Our Analyst
    var SKY = "#0ea5e9";      // Claude + MCP
    var SLATE = "#94a3b8";    // Bare Claude
    var GREEN = "#10b981";
    var RED = "#ef4444";
    var AMBER = "#f59e0b";

    var money = function (v) {
      var s = Math.abs(v).toLocaleString("en-AU");
      return (v < 0 ? "-$" : "$") + s;
    };

    // ---------------------------------------------------- scoreboard
    var sc = document.getElementById("chart-scoreboard");
    if (sc) {
      new Chart(sc, {
        type: "bar",
        data: {
          labels: ["Our Analyst", "Claude + MCP", "Bare Claude"],
          datasets: [{
            data: [48, 48, 30],
            backgroundColor: [INDIGO, SKY, SLATE],
            borderRadius: 8,
            barThickness: 46,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Five rounds re-run — total score, out of 48",
              align: "start",
              color: INK,
              font: { size: 16, weight: "700" },
              padding: { bottom: 18 },
            },
            tooltip: { callbacks: { label: function (c) { return "  " + c.parsed.x + " / 48"; } } },
          },
          scales: {
            x: { max: 48, grid: { color: GRID }, ticks: { color: "#6b7280" }, border: { display: false } },
            y: { grid: { display: false }, ticks: { color: INK, font: { size: 14, weight: "600" } }, border: { display: false } },
          },
        },
      });
    }

    // ---------------------------------------------------- DWG cash flow
    var dwg = document.getElementById("chart-dwg");
    if (dwg) {
      var labels = ["Sep-25", "Dec-25", "Mar-26", "Jun-26", "Dec-26", "Mar-27", "Jun-27", "Sep-27"];
      var values = [-570370, 1078088, -770393, 538331, -75000, -75000, -75000, -75000];
      new Chart(dwg, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            data: values,
            borderRadius: 6,
            backgroundColor: function (c) {
              if (c.dataIndex >= 4) return "rgba(245,158,11,0.55)";
              return c.raw >= 0 ? GREEN : RED;
            },
            borderColor: function (c) { return c.dataIndex >= 4 ? AMBER : "rgba(0,0,0,0)"; },
            borderWidth: function (c) { return c.dataIndex >= 4 ? 2 : 0; },
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "DWG operating cash flow — four filed quarters, then the forecast",
              align: "start",
              color: INK,
              font: { size: 16, weight: "700" },
              padding: { bottom: 6 },
            },
            subtitle: {
              display: true,
              text: "Actuals from Appendix 4C filings · amber = base-case forecast (flat −$75k/qtr)",
              align: "start",
              color: "#6b7280",
              padding: { bottom: 18 },
            },
            tooltip: {
              callbacks: {
                label: function (c) {
                  var kind = c.dataIndex >= 4 ? "forecast" : "actual";
                  return "  " + money(c.raw) + "  (" + kind + ")";
                },
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#6b7280" } },
            y: {
              grid: { color: GRID },
              border: { display: false },
              ticks: { callback: function (v) { return (v / 1e6).toFixed(1) + "m"; } },
            },
          },
        },
      });
    }

    // ---------------------------------------------------- insider trades
    var ins = document.getElementById("chart-insider");
    if (ins) {
      new Chart(ins, {
        type: "bar",
        data: {
          labels: ["Alkane (disposal)", "SKS (Greg Jinks)", "SKS (Peter Jinks)", "WiseTech", "Megaport (anchor)"],
          datasets: [{
            data: [75.0, 46.7, 46.7, 20.0, 6.9],
            backgroundColor: [RED, RED, RED, RED, SLATE],
            borderRadius: 8,
            barThickness: 34,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Insider disposals the full-market sweep found — A$m",
              align: "start",
              color: INK,
              font: { size: 16, weight: "700" },
              padding: { bottom: 6 },
            },
            subtitle: {
              display: true,
              text: "Red: in no web roundup · Grey: the anchor trade the roundup carried",
              align: "start",
              color: "#6b7280",
              padding: { bottom: 18 },
            },
            tooltip: { callbacks: { label: function (c) { return "  A$" + c.parsed.x.toFixed(1) + "m"; } } },
          },
          scales: {
            x: { grid: { color: GRID }, ticks: { callback: function (v) { return "A$" + v + "m"; } }, border: { display: false } },
            y: { grid: { display: false }, ticks: { color: INK, font: { weight: "600" } }, border: { display: false } },
          },
        },
      });
    }

    // ---------------------------------------------------- q7 turnaround
    var q7 = document.getElementById("chart-q7");
    if (q7) {
      new Chart(q7, {
        type: "bar",
        data: {
          labels: ["Our Analyst — before", "Our Analyst — after fix", "Bare Claude"],
          datasets: [{
            data: [1, 9, 9],
            backgroundColor: [SLATE, INDIGO, SLATE],
            borderRadius: 8,
            barThickness: 64,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "q7 — director selling in tech, out of 9",
              align: "start",
              color: INK,
              font: { size: 16, weight: "700" },
              padding: { bottom: 18 },
            },
            tooltip: { callbacks: { label: function (c) { return "  " + c.parsed.y + " / 9"; } } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#6b7280" } },
            y: { max: 9, grid: { color: GRID }, border: { display: false }, ticks: { stepSize: 3 } },
          },
        },
      });
    }
  });
})();
