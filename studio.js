const themeButton = document.querySelector(".theme");
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? "#181b20" : "#f6f5ee";
}
let dark = false;
try { dark = localStorage.getItem("mm-theme") === "dark"; } catch {}
setTheme(dark);
themeButton.hidden = false;
themeButton.addEventListener("click", () => {
  const next = themeButton.getAttribute("aria-pressed") !== "true";
  setTheme(next);
  try { localStorage.setItem("mm-theme", next ? "dark" : "light"); } catch {}
});
const choices = document.querySelector(".choices");
const buttons = choices.querySelectorAll("button");
function selectPane(id) {
  for (const button of buttons) {
    const selected = button.dataset.pane === id;
    button.setAttribute("aria-pressed", String(selected));
    const pane = document.getElementById(button.dataset.pane);
    if (pane) pane.hidden = id !== "all" && !selected;
  }
}
for (const button of buttons) button.addEventListener("click", () => selectPane(button.dataset.pane));
selectPane(buttons[0].dataset.pane);
choices.hidden = false;

for (const card of document.querySelectorAll(".showcase")) {
  const controls = card.querySelector(".views");
  const [ui, flow] = controls.querySelectorAll("button");
  function switchView(diagram) {
    card.querySelector(".art").hidden = diagram;
    card.querySelector(".diagram").hidden = !diagram;
    ui.setAttribute("aria-pressed", String(!diagram));
    flow.setAttribute("aria-pressed", String(diagram));
  }
  ui.onclick = () => switchView(false);
  flow.onclick = () => switchView(true);
  controls.hidden = false;
}

const typing = document.getElementById("typing");
const phrases = ["Python Backend Engineer", "DevOps Engineer", "FastAPI Developer"];
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let timer;
function animateRole() {
  clearTimeout(timer);
  typing.textContent = phrases[0];
  if (motion.matches) return;
  let index = 0, length = phrases[0].length, deleting = true;
  function update() {
    length += deleting ? -1 : 1;
    typing.textContent = phrases[index].slice(0, length);
    let delay = deleting ? 42 : 83;
    if (length === 0) {
      index = (index + 1) % phrases.length;
      deleting = false;
      delay = 220;
    } else if (length === phrases[index].length) {
      deleting = true;
      delay = 2100;
    }
    timer = setTimeout(update, delay);
  }
  timer = setTimeout(update, 2100);
}
motion.addEventListener("change", animateRole);
animateRole();
