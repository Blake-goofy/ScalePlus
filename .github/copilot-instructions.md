# ScalePlus Copilot Instructions

## Project Overview
ScalePlus is a Tampermonkey userscript that enhances the Scale application UI with modular feature enhancements. It uses a modular architecture where `main.js` serves as an orchestrator loading independent feature modules from `modules/`.

## Architecture

### Module System
- **Entry Point**: `main.js` loads all modules via `@require` directives and waits for them to initialize
- **Module Pattern**: Each module exports a namespace object to `window.ScalePlus*` (e.g., `window.ScalePlusDarkMode`, `window.ScalePlusFavorites`)
- **Module Loading**: Main script uses `waitForModules()` promise to ensure all modules are loaded before initialization
- **Module Structure**: Every module is a self-contained userscript with its own `@name`, `@namespace`, and IIFE wrapper

### Core Modules
- `settings.js` - Central settings management with localStorage persistence
- `utilities.js` - Shared helper functions (URL parsing, visibility checks, text normalization)
- `settings-ui.js` - Modal-based settings interface, injects into Scale navigation
- `dark-mode.js` - CSS injection for dark theme styling
- `favorites.js` - Default filter management with user-scoped localStorage keys
- `search-pane.js` - Auto-shows search pane on page load
- `context-menu.js` - Right-click menus for grid items and favorites
- `keyboard.js` - Custom keyboard shortcuts (Enter, F5) and mouse interactions
- `environment-labels.js` - Visual environment indicators (QA/Production)
- `advanced-criteria.js` - Enhances advanced search criteria UI
- `tooltips.js` - Adds tooltips to UI elements

## Coding Conventions

### Module Initialization Pattern
```javascript
(function() {
    'use strict';
    
    window.ScalePlusModuleName = {
        init() {
            console.log('[ScalePlus ModuleName] Module initialized');
            // initialization code
        },
        // other methods
    };
    
    window.ScalePlusModuleName.init();
})();
```

### Settings Access
- Always check if module is enabled: `window.ScalePlusSettings?.isEnabled(window.ScalePlusSettings.SETTINGS.SETTING_KEY)`
- Settings keys defined in `SETTINGS` object, defaults in `DEFAULTS` object
- Use `getSetting()` and `setSetting()` for direct localStorage access

### Page Detection
Every Scale-specific module should check environment:
```javascript
function isScalePage() {
    const url = window.location.href;
    return url.includes('/scale/') || url.includes('/Scale/');
}
```
Skip initialization on RF pages (different UI structure).

### User-Scoped Storage
Favorites and user-specific settings use username from cookie:
```javascript
getUsernameFromCookie() {
    const allCookies = document.cookie;
    const cookie = allCookies.split('; ').find(row => row.startsWith('UserInformation='));
    // parse UserName from cookie value
}
```
Storage keys: `${formId}${FeatureName}${username}`

### DOM Manipulation
- Use `window.ScalePlusUtilities.isVisible(el)` to check element visibility (handles `offsetParent`, computed styles, disabled classes)
- Wait for DOM elements with polling pattern: `const tryClick = () => { if (element) { ... } else { setTimeout(tryClick, 200); }}`
- For mutations, use `MutationObserver` with specific target selectors

### Style Injection and UI Integration
**CRITICAL**: Always reference existing Scale application elements when adding UI components to ensure compatibility between different versions of Scale.

```javascript
// Style injection pattern
const style = document.createElement('style');
style.id = 'unique-style-id';
style.textContent = `/* CSS here */`;
document.head.appendChild(style);
```

**Scale UI Adoption Guidelines**:
- **Extract colors from existing Scale elements**: Use `getComputedStyle()` to retrieve colors from Scale modals, buttons, or panels instead of hardcoding hex values
- **Reuse Scale components**: Clone or reference existing Scale UI components (modals, toggles, buttons) for consistent styling
- **Adopt Scale animations**: Match transition durations and animation styles from existing Scale elements
- **Example**: When creating a modal, inspect an existing Scale modal's computed styles for background colors, border radius, shadows, and fonts

```javascript
// Example: Extract modal background color from existing Scale modal
const existingModal = document.querySelector('.modal-content');
if (existingModal) {
    const bgColor = getComputedStyle(existingModal).backgroundColor;
    const borderRadius = getComputedStyle(existingModal).borderRadius;
    // Use these values in your custom styles
}
```

Dark mode styles use `body.scaleplus-dark-mode` class prefix for specificity.

## Development Workflow

### Testing
- Load script in Tampermonkey on Scale QA environment (`scaleqa.byjasco.com`)
- Check browser console for `[ScalePlus ModuleName]` initialization logs
- Test features via "Configure workstation" settings modal

### Adding New Features
1. Create new module file in `modules/` directory
2. Add `@require` directive in `main.js` for new module
3. Add module check to `waitForModules()` promise in `main.js`
4. Add setting key to `settings.js` SETTINGS and DEFAULTS objects
5. Add UI toggle in `settings-ui.js` modal HTML
6. Update README.md with feature documentation

### GitHub Distribution
Script is distributed via raw GitHub URLs in `@require` and `@updateURL` directives. Main script URL:
`https://raw.githubusercontent.com/Blake-goofy/ScalePlus/main/main.js`

## Important Context

### Target Application
Scale is a web application with specific DOM structure:
- Grid component: `#ListPaneDataGrid_scroll`
- Navigation buttons: `#InsightMenuApply`, `#InsightMenuActionStopSearch`
- Favorites: `.favoritefilters` container
- Form identification: URL pattern `/insights/(\d+)` contains form ID

### Userscript Constraints
- No access to Scale's internal JavaScript (different execution context)
- Must use DOM observation and mutation events to detect changes
- localStorage is shared across all Scale pages for same domain
- `@grant none` means running in page context, not isolated

### Multi-User Environment
Features must handle multiple users on same browser (shared computer scenarios). Use user-scoped localStorage keys via `getUsernameFromCookie()` for personalized settings like default filters.
