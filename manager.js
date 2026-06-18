const NO_GROUP = -1;
const GROUP_COLORS = {
  grey: "#7b8794",
  blue: "#4385f5",
  red: "#d93025",
  yellow: "#f9ab00",
  green: "#188038",
  pink: "#d01884",
  purple: "#9334e6",
  cyan: "#00acc1",
  orange: "#fa7b17"
};

const board = document.getElementById("board");
const summary = document.getElementById("summary");
const windowTemplate = document.getElementById("windowTemplate");
const groupTemplate = document.getElementById("groupTemplate");
const tabTemplate = document.getElementById("tabTemplate");

let draggedTabId = null;

document.getElementById("newRight").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "new-tab-to-right" });
  await render();
});

document.getElementById("refresh").addEventListener("click", render);

function groupTabsByVisualGroup(tabs, tabGroups) {
  const groupById = new Map(tabGroups.map((group) => [group.id, group]));
  const buckets = [];
  let ungroupedRun = [];

  function flushUngrouped() {
    if (ungroupedRun.length === 0) return;
    buckets.push({
      id: NO_GROUP,
      title: "Ungrouped",
      color: "grey",
      tabs: ungroupedRun
    });
    ungroupedRun = [];
  }

  for (const tab of tabs) {
    if (tab.groupId === NO_GROUP) {
      ungroupedRun.push(tab);
      continue;
    }

    flushUngrouped();
    const existing = buckets.find((bucket) => bucket.id === tab.groupId);
    if (existing) {
      existing.tabs.push(tab);
      continue;
    }

    const group = groupById.get(tab.groupId);
    buckets.push({
      id: tab.groupId,
      title: group?.title || "Untitled group",
      color: group?.color || "grey",
      tabs: [tab]
    });
  }

  flushUngrouped();
  return buckets;
}

async function render() {
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["normal"] });
  const tabGroups = await chrome.tabGroups.query({});
  const totalTabs = windows.reduce((count, chromeWindow) => count + chromeWindow.tabs.length, 0);

  summary.textContent = `${totalTabs} tabs across ${windows.length} windows`;
  board.replaceChildren();

  for (const chromeWindow of windows) {
    const windowNode = windowTemplate.content.firstElementChild.cloneNode(true);
    const heading = windowNode.querySelector("h2");
    const meta = windowNode.querySelector(".window-header span");
    const groupsNode = windowNode.querySelector(".groups");
    const tabs = chromeWindow.tabs.sort((a, b) => a.index - b.index);
    const buckets = groupTabsByVisualGroup(tabs, tabGroups.filter((group) => group.windowId === chromeWindow.id));

    heading.textContent = chromeWindow.focused ? "Current window" : `Window ${chromeWindow.id}`;
    meta.textContent = `${tabs.length} tabs`;

    for (const bucket of buckets) {
      groupsNode.appendChild(renderGroup(bucket));
    }

    board.appendChild(windowNode);
  }
}

function renderGroup(group) {
  const groupNode = groupTemplate.content.firstElementChild.cloneNode(true);
  const dot = groupNode.querySelector(".group-dot");
  const heading = groupNode.querySelector("h3");
  const count = groupNode.querySelector(".group-count");
  const tabsNode = groupNode.querySelector(".tabs");

  dot.style.background = GROUP_COLORS[group.color] || GROUP_COLORS.grey;
  heading.textContent = group.title;
  count.textContent = `${group.tabs.length}`;

  for (const tab of group.tabs) {
    tabsNode.appendChild(renderTab(tab));
  }

  return groupNode;
}

function renderTab(tab) {
  const tabNode = tabTemplate.content.firstElementChild.cloneNode(true);
  const favicon = tabNode.querySelector("img");
  const title = tabNode.querySelector(".title");
  const moveLeft = tabNode.querySelector(".move-left");
  const moveRight = tabNode.querySelector(".move-right");
  const ungroup = tabNode.querySelector(".ungroup");
  const close = tabNode.querySelector(".close");

  tabNode.dataset.tabId = String(tab.id);
  favicon.src = tab.favIconUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' rx='4' fill='%237b8794'/%3E%3C/svg%3E";
  title.textContent = tab.title || tab.url || "Untitled tab";
  title.title = tab.url || "";
  ungroup.hidden = tab.groupId === NO_GROUP;

  title.addEventListener("click", async () => {
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });
  });

  moveLeft.addEventListener("click", async () => {
    await chrome.tabs.move(tab.id, { index: Math.max(0, tab.index - 1) });
    await render();
  });

  moveRight.addEventListener("click", async () => {
    await chrome.tabs.move(tab.id, { index: tab.index + 1 });
    await render();
  });

  ungroup.addEventListener("click", async () => {
    await chrome.tabs.ungroup(tab.id);
    await render();
  });

  close.addEventListener("click", async () => {
    await chrome.tabs.remove(tab.id);
    await render();
  });

  tabNode.addEventListener("dragstart", (event) => {
    draggedTabId = tab.id;
    tabNode.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(tab.id));
  });

  tabNode.addEventListener("dragend", () => {
    draggedTabId = null;
    tabNode.classList.remove("dragging");
    document.querySelectorAll(".drop-target").forEach((node) => node.classList.remove("drop-target"));
  });

  tabNode.addEventListener("dragover", (event) => {
    if (!draggedTabId || draggedTabId === tab.id) return;
    event.preventDefault();
    tabNode.classList.add("drop-target");
  });

  tabNode.addEventListener("dragleave", () => {
    tabNode.classList.remove("drop-target");
  });

  tabNode.addEventListener("drop", async (event) => {
    event.preventDefault();
    tabNode.classList.remove("drop-target");
    const sourceTabId = Number(event.dataTransfer.getData("text/plain"));
    if (!sourceTabId || sourceTabId === tab.id) return;

    await chrome.tabs.move(sourceTabId, {
      index: tab.index,
      windowId: tab.windowId
    });

    if (tab.groupId === NO_GROUP) {
      const source = await chrome.tabs.get(sourceTabId);
      if (source.groupId !== NO_GROUP) {
        await chrome.tabs.ungroup(sourceTabId);
      }
    } else {
      await chrome.tabs.group({
        groupId: tab.groupId,
        tabIds: sourceTabId
      });
    }

    await render();
  });

  return tabNode;
}

[
  chrome.tabs.onCreated,
  chrome.tabs.onRemoved,
  chrome.tabs.onMoved,
  chrome.tabs.onUpdated,
  chrome.tabs.onAttached,
  chrome.tabs.onDetached,
  chrome.tabs.onActivated,
  chrome.tabGroups.onCreated,
  chrome.tabGroups.onRemoved,
  chrome.tabGroups.onUpdated,
  chrome.tabGroups.onMoved
].forEach((event) => event?.addListener(render));

render();
