// ==UserScript==
// @name         ScalePlus Row Selection Diagnostic Tool v3
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Deep dive into CSS cascade and specificity issues
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('=== ScalePlus Row Selection Diagnostic Tool v3.0 ===');
    console.log('Deep CSS cascade analysis - reports every 2 seconds');
    console.log('');

    function getAllCSSRules(element) {
        const rules = [];
        const sheets = Array.from(document.styleSheets);
        
        for (const sheet of sheets) {
            try {
                const cssRules = Array.from(sheet.cssRules || sheet.rules || []);
                for (const rule of cssRules) {
                    if (rule.selectorText && element.matches(rule.selectorText)) {
                        const bg = rule.style.backgroundColor;
                        const color = rule.style.color;
                        if (bg || color) {
                            rules.push({
                                selector: rule.selectorText,
                                bg: bg || '',
                                color: color || '',
                                important: (bg && bg.includes('!important')) || (color && color.includes('!important')),
                                sheet: sheet.href ? sheet.href.split('/').pop() : 'inline'
                            });
                        }
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        }
        
        // Also check inline styles
        if (element.style.backgroundColor || element.style.color) {
            rules.push({
                selector: 'inline style',
                bg: element.style.backgroundColor || '',
                color: element.style.color || '',
                important: element.style.backgroundColor.includes('!important') || element.style.color.includes('!important'),
                sheet: 'inline'
            });
        }
        
        return rules;
    }

    function reportSelectedRows() {
        const grid = document.querySelector('#ListPaneDataGrid');
        if (!grid) return;

        const selectedRows = grid.querySelectorAll('tr[aria-selected="true"]');
        
        if (selectedRows.length === 0) {
            console.log('[No rows selected]');
            return;
        }

        console.log(`\n========== ${new Date().toLocaleTimeString()} - ${selectedRows.length} row(s) selected ==========`);
        
        selectedRows.forEach((row, rowIdx) => {
            console.log(`\n--- Row ${rowIdx + 1} ---`);
            console.log(`Row classes: "${row.className}"`);
            console.log(`Row aria-selected: ${row.getAttribute('aria-selected')}`);
            
            const cells = row.querySelectorAll('td, th');
            
            // Just check first data cell (index 1, since 0 is checkbox)
            const cell = cells[1];
            if (!cell) return;
            
            const styles = window.getComputedStyle(cell);
            const bg = styles.backgroundColor;
            const color = styles.color;
            
            console.log(`\n📊 First data cell (${cell.tagName}):`);
            console.log(`  Computed background: ${bg}`);
            console.log(`  Computed color: ${color}`);
            console.log(`  Classes: "${cell.className}"`);
            
            // Check for inline styles
            if (cell.style.backgroundColor || cell.style.color) {
                console.log('  ⚠️ INLINE STYLES DETECTED:');
                if (cell.style.backgroundColor) console.log(`    background-color: ${cell.style.backgroundColor}`);
                if (cell.style.color) console.log(`    color: ${cell.style.color}`);
            }
            
            // Check for problem
            const isLightBackground = bg.includes('rgb(255') || bg.includes('rgb(254') || bg.includes('rgb(253') || bg.includes('rgb(143, 190, 245)') || bg.includes('rgb(245, 245, 245)');
            const isDarkText = color.includes('rgb(0, 0, 0)') || color.includes('rgb(55, 58, 60)');
            
            if (isLightBackground || isDarkText) {
                console.log('  ⚠️ PROBLEM DETECTED - Light colors in dark mode!');
                
                // Show all matching CSS rules
                const rules = getAllCSSRules(cell);
                if (rules.length > 0) {
                    console.log('\n  📜 All CSS rules affecting this cell:');
                    rules.forEach((rule, i) => {
                        console.log(`    ${i + 1}. ${rule.selector} (${rule.sheet})`);
                        if (rule.bg) console.log(`       background-color: ${rule.bg}`);
                        if (rule.color) console.log(`       color: ${rule.color}`);
                        if (rule.important) console.log(`       ⚠️ Has !important`);
                    });
                }
                
                // Show what classes are present/missing
                console.log('\n  🔍 Class analysis:');
                console.log(`    ✓ aria-selected on row: ${row.getAttribute('aria-selected') === 'true'}`);
                console.log(`    ✓ .ui-state-active: ${cell.classList.contains('ui-state-active')}`);
                console.log(`    ✓ .ui-iggrid-selectedcell: ${cell.classList.contains('ui-iggrid-selectedcell')}`);
                console.log(`    ✓ .ui-state-default: ${cell.classList.contains('ui-state-default')}`);
                console.log(`    ✓ .ui-state-hover: ${cell.classList.contains('ui-state-hover')}`);
                console.log(`    ✓ .ui-widget-content: ${cell.classList.contains('ui-widget-content')}`);
                
            } else {
                console.log('  ✅ Correct dark colors');
                console.log(`  Classes: ${cell.className}`);
            }
        });
        
        console.log('\n==========\n');
    }

    function setupMonitoring() {
        const grid = document.querySelector('#ListPaneDataGrid');
        if (!grid) {
            console.log('Grid not found, retrying in 1 second...');
            setTimeout(setupMonitoring, 1000);
            return;
        }

        console.log('Grid found! Starting monitoring...\n');
        
        // Report every 5 seconds
        setInterval(reportSelectedRows, 5000);
        
        // Also report immediately when selection changes
        const observer = new MutationObserver(function(mutations) {
            let selectionChanged = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'aria-selected' || 
                     mutation.attributeName === 'class')) {
                    selectionChanged = true;
                }
            });
            
            if (selectionChanged) {
                console.log('[Selection/class changed - immediate report]');
                reportSelectedRows();
            }
        });

        observer.observe(grid, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
            attributeFilter: ['aria-selected', 'class']
        });
        
        console.log('Monitoring active!\n');
    }

    // Wait for page load
    setTimeout(setupMonitoring, 2000);
})();
