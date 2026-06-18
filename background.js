const NO_GROUP = -1;

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab;
}

async function openNewTabToRight() {
  const current = await getCurrentTab();
  if (!current) return;

  const newTab = await chrome.tabs.create({
    active: true,
    index: current.index + 1,
    openerTabId: current.id,
    pinned: current.pinned,
    windowId: current.windowId
  });

  if (current.groupId !== NO_GROUP) {
    await chrome.tabs.group({
      groupId: current.groupId,
      tabIds: newTab.id
    });
    await chrome.tabs.update(newTab.id, { active: true });
  }
}

async function openTabBoard() {
  const current = await getCurrentTab();
  const url = chrome.runtime.getURL("manager.html");

  if (!current) {
    await chrome.tabs.create({ active: true, url });
    return;
  }

  await chrome.tabs.create({
    active: true,
    index: current.index + 1,
    openerTabId: current.id,
    url,
    windowId: current.windowId
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "new-tab-to-right") {
    openNewTabToRight();
    return;
  }

  if (command === "open-tab-board") {
    openTabBoard();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "new-tab-to-right") {
    openNewTabToRight().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === "open-tab-board") {
    openTabBoard().then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});
