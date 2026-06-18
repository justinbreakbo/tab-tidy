# TabTidy Project Plan

## Product Goal

TabTidy helps Chrome users keep many tabs orderly with low-friction shortcuts and a visual management board.

The product feeling should be tidy, direct, and practical: tabs should land where users expect, groups should stay coherent, and cleanup should take fewer context switches.

## Core User Problems

- `Command+T` opens a new tab at the far right of the tab strip, not beside the current working context.
- Chrome tab groups become hard to inspect when many tabs are compressed.
- Managing many tabs requires repeated right-clicks, dragging in the native tab strip, or hunting through tiny tab titles.

## MVP Scope

### 1. New Tab To The Right

Shortcut: `Command+Shift+Y`

Behavior:

- If the current tab is ungrouped, create a new ungrouped tab immediately to its right.
- If the current tab is inside a Chrome tab group, create a new tab immediately to its right and add it to the same group.
- Keep the new tab active after creation.
- Preserve pinned state when the current tab is pinned.

Rationale:

The current tab represents the active working context. A new blank tab should inherit that local context without forcing the user to manually move it back from the far right.

### 2. Tab Board

Shortcut: `Command+Shift+U`

Behavior:

- Open a full-page TabTidy board beside the current tab.
- Show all normal Chrome windows.
- Show tabs grouped by their native Chrome tab group.
- Show ungrouped tabs as ungrouped runs, preserving visual order.
- Let users activate, move, ungroup, close, and drag tabs.

Rationale:

The native tab strip is optimized for quick switching, not cleanup. The board gives users a larger, calmer surface for tab organization.

### 3. Group Hover Expansion

Behavior:

- In the TabTidy board, hovering or focusing a group expands the minimum width of tab cards.
- Expanded cards reveal more title text and make group contents easier to scan.

Rationale:

Chrome extensions cannot resize the native Chrome tab strip. TabTidy should provide this interaction in its own management surface instead of pretending to control unsupported browser UI.

## Interaction Model

### Creating Tabs

Current tab inside group:

1. Create new tab at `current.index + 1`.
2. Add new tab to `current.groupId`.
3. Activate the new tab.

Current tab outside group:

1. Create new tab at `current.index + 1`.
2. Leave it ungrouped.
3. Activate the new tab.

TabTidy board tab:

- Opening the board creates a normal ungrouped tool tab beside the current tab.
- The board is not automatically added to the current group, because it is a management tool rather than part of the user's browsing context.

### Moving Tabs In The Board

Controls:

- Activate: click tab title.
- Move left: click left arrow.
- Move right: click right arrow.
- Ungroup: click Ungroup on grouped tabs.
- Close: click close.
- Drag and drop: drop a tab onto another tab to move it near that tab.

Drag behavior:

- Dropping onto a grouped tab moves the source tab near the target and adds it to the target group.
- Dropping onto an ungrouped tab moves the source tab near the target and removes it from its existing group if needed.

## Technical Design

### Extension Type

- Chrome Manifest V3 extension.
- No build step.
- No npm dependencies.
- Loaded locally through `chrome://extensions` using "Load unpacked".

### Files

- `manifest.json`: extension metadata, permissions, commands.
- `background.js`: shortcut command handlers and tab creation behavior.
- `popup.html`, `popup.css`, `popup.js`: lightweight extension popup.
- `manager.html`, `manager.css`, `manager.js`: full-page tab board.
- `README.md`: install and usage notes.
- `PROJECT_PLAN.md`: product and implementation plan.

### Permissions

- `tabs`: query, create, move, activate, and close tabs.
- `tabGroups`: read group metadata and add/remove tabs from groups.

### Shortcut Limits

Chrome does not allow extensions to override reserved browser shortcuts such as `Command+T`.

Default shortcuts:

- `Command+Shift+Y`: new tab to the right.
- `Command+Shift+U`: open tab board.

Users can customize shortcuts at `chrome://extensions/shortcuts`.

## Known Browser API Limits

- Extensions cannot change the native Chrome tab strip layout.
- Extensions cannot make native grouped tabs wider on hover.
- Extensions cannot reliably override built-in Chrome shortcuts such as `Command+T`.
- Some internal Chrome pages may limit favicon or URL visibility.

## Quality Bar

The extension should:

- Avoid surprising group changes.
- Keep tab order stable unless the user explicitly moves a tab.
- Refresh the board after tab mutations.
- Stay usable with many tabs and multiple windows.
- Avoid broad permissions that are not needed.

## Future Iterations

### Better Movement

- Add "move to group" menus.
- Add "move to new group" action.
- Add drag-to-empty-group-zone support.
- Add keyboard navigation inside the board.

### Cleanup Tools

- Close duplicate tabs.
- Close tabs from the same domain.
- Save selected tabs as a named set.
- Collapse or expand native Chrome tab groups from the board.

### Search And Filtering

- Search tabs by title or URL.
- Filter by window, group, domain, audible state, pinned state, or active state.
- Highlight stale tabs by last access time if a reliable signal is available.

### Visual Polish

- Add extension icons.
- Improve empty states.
- Add compact and comfortable board density modes.
- Add clearer selected and drag target states.

### Publishing Prep

- Add finalized icons at all required sizes.
- Add screenshots.
- Add privacy note explaining that TabTidy does not collect or transmit browsing data.
- Test on current Chrome stable, Chrome Beta, and Chromium-based browsers.

## Release Checklist

- Load unpacked extension successfully.
- Verify `Command+Shift+Y` in ungrouped tabs.
- Verify `Command+Shift+Y` inside a tab group.
- Verify new tab remains active.
- Verify `Command+Shift+U` opens the board.
- Verify group hover expansion in the board.
- Verify activate, move, drag, ungroup, and close actions.
- Verify multiple windows render correctly.
- Verify shortcuts are listed at `chrome://extensions/shortcuts`.
