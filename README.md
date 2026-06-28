# TabTidy

TabTidy 是一个本地 Chrome 扩展，用于通过相邻新建标签页、相邻复制标签页和可视化 Tab Board 保持标签页整洁。

## 当前功能

- 在当前标签页右侧立即新建标签页。
- 一键复制当前标签页，并把复制出的网页放到当前标签页右侧。
- 如果当前标签页位于 Chrome 标签组中，新建或复制出的标签页会自动加入同一个标签组。
- 当前标签页是固定标签页时，新建或复制出的标签页会保留固定状态。
- 打开全页面 Tab Board，管理所有普通 Chrome 窗口中的标签页。
- 按 Chrome 原生标签组顺序展示标签页，未分组标签页会按连续区段展示。
- 在 Tab Board 中显示最近可见页面的 16:9 本地缓存缩略图。
- 对无法截图的页面显示字母占位，例如 Chrome 内部页面、扩展页面或受保护页面。
- 在 Tab Board 中激活、左移、右移、移出分组、关闭和拖拽标签页。
- 标签页、标签组或缩略图缓存变化时，Tab Board 会自动刷新。
- 缩略图只保存在本机 Chrome 扩展存储中，TabTidy 不会上传截图。

## 快捷键

- macOS：`Command+Shift+Y`；Windows/Linux：`Ctrl+Shift+Y`。在当前标签页右侧新建标签页。
- macOS：`Command+Shift+H`；Windows/Linux：`Ctrl+Shift+H`。复制当前标签页到右侧。
- macOS：`Command+Shift+U`；Windows/Linux：`Ctrl+Shift+U`。打开 Tab Board。

Chrome 不允许扩展覆盖 `Command+T` 这类浏览器保留快捷键。
你可以在 `chrome://extensions/shortcuts` 中自定义 TabTidy 的快捷键。

## 本地安装

1. 打开 `chrome://extensions`。
2. 开启右上角 **Developer mode**。
3. 点击 **Load unpacked**。
4. 选择这个 `tab-tidy` 文件夹。
5. 如需调整快捷键，打开 `chrome://extensions/shortcuts`。

## 交互模型

当前标签页在分组内时，TabTidy 会在它右侧新建或复制标签页，把新标签页加入同一个分组，并激活新标签页。

当前标签页不在分组内时，TabTidy 会在它右侧新建或复制一个普通未分组标签页，并激活新标签页。

Tab Board 会作为普通未分组管理标签页打开在当前标签页旁边。它不会自动加入当前分组，因为它是管理工具，而不是用户浏览上下文的一部分。

缩略图只会在 Chrome 允许的情况下从当前可见页面生成：标签页被激活后、活动标签页加载完成后，或打开 Tab Board 之前。后台标签页、Chrome 内部页面、扩展页面和其他受保护页面可能会显示占位符。

Chrome 扩展不能修改原生标签栏布局、标签 hover 宽度或标签栏动画。TabTidy 的可视化管理能力都在自己的 Tab Board 中实现。

## 权限说明

- `tabs`：查询、创建、复制、移动、激活和关闭标签页。
- `tabGroups`：读取原生标签组信息，把标签页加入分组或移出分组。
- `storage` / `unlimitedStorage`：在本地保存最近可见标签页的缩略图缓存。
- `activeTab` / `<all_urls>`：对当前可见的普通网页生成本地缩略图。
