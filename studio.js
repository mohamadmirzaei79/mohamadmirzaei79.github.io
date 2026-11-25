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
    document.getElementById(button.dataset.pane).hidden = !selected;
  }
}
for (const button of buttons) button.addEventListener("click", () => selectPane(button.dataset.pane));
selectPane(buttons[0].dataset.pane);
choices.hidden = false;
