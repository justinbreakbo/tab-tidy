const NO_GROUP = -1;
const THUMBNAIL_KEY_PREFIX = "thumbnail:";
const THUMBNAIL_VERSION = 2;
const MAX_THUMBNAILS = 180;
const THUMBNAIL_WIDTH = 720;
const CAPTURE_DELAY_MS = 700;

const captureTimers = new Map();
let captureChain = Promise.resolve();

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab;
}

function getThumbnailKey(tabId) {
  return `${THUMBNAIL_KEY_PREFIX}${tabId}`;
}

function canCaptureTab(tab) {
  if (!tab?.id || !tab.windowId || !tab.active) return false;
  if (!tab.url) return true;

  try {
    const protocol = new URL(tab.url).protocol;
    return ["http:", "https:", "file:"].includes(protocol);
  } catch {
    return false;
  }
}

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function resizeScreenshot(dataUrl) {
  if (!globalThis.OffscreenCanvas || !globalThis.createImageBitmap) {
    return dataUrl;
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, THUMBNAIL_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d", { alpha: false });

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const thumbnailBlob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.78
  });
  const bytes = new Uint8Array(await thumbnailBlob.arrayBuffer());

  return `data:image/jpeg;base64,${bytesToBase64(bytes)}`;
}

async function pruneThumbnails() {
  const items = await chrome.storage.local.get(null);
  const entries = Object.entries(items)
    .filter(([key]) => key.startsWith(THUMBNAIL_KEY_PREFIX))
    .sort(([, a], [, b]) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (entries.length <= MAX_THUMBNAILS) return;

  const staleKeys = entries.slice(MAX_THUMBNAILS).map(([key]) => key);
  await chrome.storage.local.remove(staleKeys);
}

async function captureTabThumbnail(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!canCaptureTab(tab)) return;

  const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "jpeg",
    quality: 82
  });
  const thumbnail = await resizeScreenshot(screenshot);

  await chrome.storage.local.set({
    [getThumbnailKey(tab.id)]: {
      capturedUrl: tab.url || "",
      dataUrl: thumbnail,
      title: tab.title || "",
      version: THUMBNAIL_VERSION,
      updatedAt: Date.now()
    }
  });
  await pruneThumbnails();
}

function queueThumbnailCapture(tabId, delay = CAPTURE_DELAY_MS) {
  if (!tabId) return;

  clearTimeout(captureTimers.get(tabId));
  captureTimers.set(
    tabId,
    setTimeout(() => {
      captureTimers.delete(tabId);
      captureChain = captureChain
        .catch(() => {})
        .then(() => captureTabThumbnail(tabId))
        .catch((error) => {
          console.debug("TabTidy thumbnail capture skipped:", error?.message || error);
        });
    }, delay)
  );
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

async function duplicateTabToRight() {
  const current = await getCurrentTab();
  if (!current?.id) return;

  const duplicated = await chrome.tabs.duplicate(current.id);
  if (!duplicated?.id) return;

  if (current.pinned !== duplicated.pinned) {
    await chrome.tabs.update(duplicated.id, { pinned: current.pinned });
  }

  await chrome.tabs.move(duplicated.id, {
    index: current.index + 1,
    windowId: current.windowId
  });

  if (current.groupId !== NO_GROUP) {
    await chrome.tabs.group({
      groupId: current.groupId,
      tabIds: duplicated.id
    });
  }

  await chrome.tabs.update(duplicated.id, { active: true });
}

async function openTabBoard() {
  const current = await getCurrentTab();
  const url = chrome.runtime.getURL("manager.html");

  if (!current) {
    await chrome.tabs.create({ active: true, url });
    return;
  }

  await captureTabThumbnail(current.id).catch(() => {});

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

  if (command === "duplicate-tab-to-right") {
    duplicateTabToRight();
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

  if (message?.type === "duplicate-tab-to-right") {
    duplicateTabToRight().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === "open-tab-board") {
    openTabBoard().then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  queueThumbnailCapture(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    queueThumbnailCapture(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  clearTimeout(captureTimers.get(tabId));
  captureTimers.delete(tabId);
  chrome.storage.local.remove(getThumbnailKey(tabId));
});
