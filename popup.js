const urlInput = document.querySelector("#url");
const copyButton = document.querySelector("#copy");
const status = document.querySelector("#status");
const themeStatus = document.querySelector("#theme-status");
const lightThemeButton = document.querySelector("#light-theme");
const darkThemeButton = document.querySelector("#dark-theme");
let activeTabId;

async function showActiveUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) {
    urlInput.value = "";
    status.textContent = "URL unavailable";
    themeStatus.textContent = "No active website is available.";
    copyButton.disabled = true;
    return;  document.querySelector("#tab-title").textContent = tab.title;

  }

  activeTabId = tab.id;
  urlInput.value = tab.url;
}

function setSelectedTheme(theme) {
  lightThemeButton.setAttribute("aria-pressed", String(theme === "light"));
  darkThemeButton.setAttribute("aria-pressed", String(theme === "dark"));
}

async function updateThemeStatus() {
  if (activeTabId === undefined) {
    return;
  }

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      func: () => document.documentElement.getAttribute("data-ost-theme"),
    });
    const theme = result?.result;
    setSelectedTheme(theme);
    themeStatus.textContent = theme
      ? `Current website theme: ${theme}`
      : "Choose a theme for this website.";
  } catch {
    themeStatus.textContent = "Theme controls are unavailable on this page.";
  }
}

async function applyTheme(theme) {
  if (activeTabId === undefined) {
    themeStatus.textContent = "No active website is available.";
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      args: [theme],
      func: (selectedTheme) => {
        const styleId = "ost-website-theme";
        let style = document.getElementById(styleId);

        if (!style) {
          style = document.createElement("style");
          style.id = styleId;
          style.textContent = `
            html[data-ost-theme="dark"] {
              filter: invert(1) hue-rotate(180deg) !important;
              background: #fff !important;
            }
            html[data-ost-theme="dark"] img,
            html[data-ost-theme="dark"] video,
            html[data-ost-theme="dark"] canvas,
            html[data-ost-theme="dark"] iframe,
            html[data-ost-theme="dark"] svg {
              filter: invert(1) hue-rotate(180deg) !important;
            }
          `;
          (document.head || document.documentElement).appendChild(style);
        }

        document.documentElement.setAttribute("data-ost-theme", selectedTheme);
      },
    });
    setSelectedTheme(theme);
    themeStatus.textContent = `Website theme changed to ${theme}.`;
  } catch {
    themeStatus.textContent = "Could not change the theme on this page.";
  }
}

copyButton.addEventListener("click", async () => {
  if (!urlInput.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(urlInput.value);
    status.textContent = "Copied!";
  } catch {
    urlInput.select();
    status.textContent = "Press Ctrl+C to copy";
  }
});

lightThemeButton.addEventListener("click", () => applyTheme("light"));
darkThemeButton.addEventListener("click", () => applyTheme("dark"));

showActiveUrl().then(updateThemeStatus);
