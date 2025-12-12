# Row Selection Dark Mode Fix - Testing Guide

## The Problem
- Checkbox selection applies **light/white background** to selected rows (wrong)
- Clicking "Frozen" column center applies **correct dark blue** background
- Only the **most recently selected row** shows the wrong colors
- Clicking near cell edges triggers wrong colors

## Root Cause Hypothesis
Scale uses **two different selection mechanisms**:
1. **Row selection** (checkbox) - sets `aria-selected="true"` but may also set jQuery UI classes like `ui-state-default`
2. **Cell selection** (clicking cell center) - sets `ui-iggrid-selectedcell` and `ui-state-active`

jQuery UI's default theme CSS is likely **more specific** than our dark mode rules and overriding them.

## The Fix
Updated `modules/dark-mode.js` with **maximum specificity** CSS selectors to override ALL jQuery UI states:
- Added rules for `ui-state-default` combined with selection classes
- Added rules for `ui-widget-content` combined with selection classes  
- Added multiple specificity levels targeting `tr[aria-selected="true"]` cells
- Used compound selectors to catch edge cases

## Testing Steps

### 1. Install the new diagnostic tool
Install `diagnostics/row-selection-scraper-v3.user.js` in Tampermonkey

### 2. Reload ScalePlus
The updated dark mode module should load automatically

### 3. Test checkbox selection
1. Select a row using the checkbox
2. Check console output - look for "PROBLEM DETECTED" or "Correct dark colors"
3. Look for the CSS rules section to see which rules are being applied
4. Check the "Class analysis" section

### 4. Test multiple selections
1. Select row 1 with checkbox
2. Select row 2 with checkbox  
3. Verify BOTH rows have dark blue background (not just the first)

### 5. Test cell selection
1. Click the center of a cell in the "Frozen" column
2. Verify it has dark blue background
3. Compare console output with checkbox selection

### 6. Review diagnostic output
The v3 diagnostic tool will show:
- ✅ Computed background/color values
- 📜 ALL CSS rules affecting the cell (with specificity info)
- 🔍 Which classes are present/missing on the cell
- ⚠️ Which rules have `!important`

## What to Report Back
1. Does checkbox selection now work correctly?
2. If still broken, paste the console output showing:
   - "📜 All CSS rules affecting this cell" section
   - "🔍 Class analysis" section
3. Any differences between first and second selected rows?

## Next Steps if Still Broken
If the issue persists, the diagnostic tool will reveal:
- Which specific CSS selector is winning the cascade
- What classes Scale is applying that we're not catching
- Whether inline styles are being used (which would need a different approach)
