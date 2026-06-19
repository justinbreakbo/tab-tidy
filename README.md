# TabTidy

TabTidy 是一个本地 Chrome 扩展，用来让标签页保持整齐。

## 功能

- 在当前标签页右侧立即新建标签页。
- 如果当前标签页在 Chrome 分组内，新标签页会自动加入同一个分组。
- 打开全屏 Tab Board，快速管理所有标签页。
- 在 Tab Board 里展示最近访问时缓存的标签页缩略图，帮助快速识别页面。
- 在 Tab Board 里激活、左移、右移、移出分组、关闭和拖拽标签页。

## 快捷键

- `Command+Shift+Y`：在当前标签页右侧新建标签页。
- `Command+Shift+U`：打开 TabTidy 的 Tab Board。

Chrome 不允许扩展覆盖 `Command+T` 这类浏览器保留快捷键。
你可以在 `chrome://extensions/shortcuts` 里自定义 TabTidy 的快捷键。

## 本地安装

1. 打开 `chrome://extensions`。
2. 开启右上角 **Developer mode**。
3. 点击 **Load unpacked**。
4. 选择这个 `TabTidy` 文件夹。
5. 如需调整快捷键，打开 `chrome://extensions/shortcuts`。

## 交互模型

当前标签页在分组内时，TabTidy 会在它右侧新建标签页，并把新标签页加入同一个分组。

当前标签页不在分组内时，TabTidy 会在它右侧新建一个普通未分组标签页。

Tab Board 会在标签页被激活、页面加载完成，或打开 Tab Board 前缓存当前可见页面的缩略图。Chrome 扩展不能静默截图后台标签页，所以未访问或不可截图的标签页会显示字母占位。

Chrome 扩展不能修改原生标签栏的 hover 宽度、布局或动画。TabTidy 的视觉管理能力都放在自己的 Tab Board 里实现。

## 权限说明

- `tabs`：查询、创建、移动、激活和关闭标签页。
- `tabGroups`：读取分组信息，并把标签页加入或移出分组。
- `storage` / `unlimitedStorage`：在本地保存最近访问标签页的缩略图缓存。
- `activeTab` / `<all_urls>`：对当前可见的普通网页生成缩略图。截图只保存在本机扩展存储中，不会上传。
