const theme = document.querySelector(".theme");
function setTheme(value) {
  const dark = value === "dark";
  document.documentElement.dataset.theme = value;
  theme.setAttribute("aria-pressed", String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? "#0d1420" : "#f6f3ec";
}
let preference = "dark";
try { if (localStorage.getItem("mm-theme") === "light") preference = "light"; } catch {}
setTheme(preference);
theme.hidden = false;
theme.addEventListener("click", () => {
  preference = preference === "dark" ? "light" : "dark";
  setTheme(preference);
  try { localStorage.setItem("mm-theme", preference); } catch {}
});

const menu = document.querySelector(".menu");
const navigation = document.getElementById("navigation");
function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  navigation.dataset.collapsed = String(!open);
}
menu.hidden = false;
setMenu(false);
menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
navigation.addEventListener("click", event => {
  if (event.target.closest("a")) {
    const target = document.getElementById(event.target.closest("a").hash.slice(1));
    setMenu(false);
    if (menu.getClientRects().length && target) {
      target.tabIndex = -1;
      target.focus({preventScroll:true});
    }
  }
});

const metricOptions = {
  p99: {label:"p99 latency", unit:"ms", format:value => value.toFixed(0)},
  rps: {label:"Throughput", unit:"req/s", format:value => value.toFixed(1)},
  errors: {label:"HTTP 5xx rate", unit:"%", format:value => value.toFixed(2)}
};
const chartHost = document.getElementById("lab-chart");
const cards = document.getElementById("lab-metrics");
const select = document.getElementById("metric");
const buttons = [...document.querySelectorAll("[data-scenario]")];
let active = "steady";
let scenarios;
const number = new Intl.NumberFormat("en-US");
const show = (key, value) => {
  const {format,unit} = metricOptions[key];
  return format(value) + (unit === "%" ? "" : " ") + unit;
};

function drawChart(buckets, key) {
  const {label,format,unit} = metricOptions[key];
  const view = 600;
  const left = 68, right = 580, top = 18, bottom = 202;
  const values = buckets.map(row => row[key]);
  const maximum = Math.max(...values, key === "errors" ? 1 : 4);
  const magnitude = 10 ** Math.floor(Math.log10(maximum / 4));
  const step = Math.ceil(maximum / 4 / magnitude) * magnitude;
  const x = i => left + (right - left) * i / (values.length - 1);
  const y = value => bottom - (bottom - top) * value / (step * 4);
  const points = values.map((value, i) => x(i) + "," + y(value)).join(" ");
  const mid = (x(11) + x(12)) / 2;
  const grid = Array.from({length:5}, (_, i) => {
    const level = step * i;
    const pos = y(level);
    return '<path d="M' + left + ' ' + pos + 'H' + right + '" stroke="var(--grid)"/><text x="59" y="' + (pos + 4) + '" text-anchor="end">' + format(level) + '</text>';
  }).join("");
  return '<svg role="img" aria-label="' + label + ' in ' + unit + ' across 24 five-minute windows. Exact readings are in the table below." viewBox="0 0 ' + view + ' 225"><g fill="var(--muted)" font-family="monospace" font-size="13">' +
    grid + '<path d="M' + mid + ' ' + top + 'V' + bottom + '" stroke="var(--muted)" stroke-dasharray="4 5"/>' +
    '<polygon fill="var(--chart)" opacity=".12" points="' + left + ',' + bottom + ' ' + points + ' ' + right + ',' + bottom + '"/>' +
    '<polyline points="' + points + '" fill="none" stroke="var(--chart)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/>' +
    '<text x="' + left + '" y="220">' + unit + '</text></g></svg><div class="graph-labels"><span>−60 min</span><span>Window boundary</span><span>+60 min</span></div>';
}

function render() {
  const {buckets,baseline,comparison,note} = scenarios[active];
  cards.innerHTML = Object.entries(metricOptions).map(([key, {label}]) =>
    '<div><dt>' + label + '</dt><dd>' + show(key, comparison[key]) + '</dd><small>Before ' + show(key, baseline[key]) + '</small></div>'
  ).join("");
  chartHost.innerHTML = drawChart(buckets, select.value);
  document.getElementById("lab-note").textContent = note;
  document.getElementById("lab-rows").innerHTML = buckets.map(row =>
    '<tr><td>' + row.minute + ' min</td><td>' + number.format(row.requests) + '</td><td>' +
    show("p99", row.p99) + '</td><td>' + show("rps", row.rps) + '</td><td>' + show("errors", row.errors) + '</td></tr>'
  ).join("");
  for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.scenario === active));
}

fetch("./telemetry-data.json?v=stitch2")
  .then(response => { if (!response.ok) throw Error("Sample request failed"); return response.json(); })
  .then(data => {
    scenarios = data;
    select.addEventListener("change", render);
    for (const button of buttons) button.addEventListener("click", () => { active = button.dataset.scenario; render(); });
    render();
  })
  .catch(() => { chartHost.textContent = "Sample traffic could not be loaded. Refresh to try again."; });
