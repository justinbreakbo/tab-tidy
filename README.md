# TabTidy

TabTidy 是一个本地 Chrome 扩展，用来让标签页保持整齐。

## 功能

- 在当前标签页右侧立即新建标签页。
- 如果当前标签页在 Chrome 分组内，新标签页会自动加入同一个分组。
- 打开全屏 Tab Board，快速管理所有标签页。
- 在 Tab Board 里 hover 分组时，组内标签卡片会展开，方便看清标题。
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

Chrome 扩展不能修改原生标签栏的 hover 宽度，因此 TabTidy 把“hover 分组展开标签标题”的交互放在自己的 Tab Board 里实现。
