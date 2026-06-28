document.getElementById("newRight").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "new-tab-to-right" });
  window.close();
});

document.getElementById("duplicateRight").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "duplicate-tab-to-right" });
  window.close();
});

document.getElementById("openBoard").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "open-tab-board" });
  window.close();
});
