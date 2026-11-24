const urlInput = document.querySelector("#url");
const copyButton = document.querySelector("#copy");
const status = document.querySelector("#status");

async function showActiveUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) {
    urlInput.value = "";
    status.textContent = "URL unavailable";
    copyButton.disabled = true;
    return;
  }

  urlInput.value = tab.url;
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

showActiveUrl();
