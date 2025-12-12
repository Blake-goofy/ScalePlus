// ==UserScript==
// @name         ScalePlus Row Selection Diagnostic Tool
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Diagnose dark mode row selection styling issues (reports every 2 seconds)
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('=== ScalePlus Row Selection Diagnostic Tool v2.0 ===');
    console.log('Reports selected row state every 2 seconds');
    console.log('');

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
            console.log(`\n--- Row ${rowIdx + 1} (index ${row.rowIndex}) ---`);
            console.log(`Row classes: "${row.className}"`);
            
            const cells = row.querySelectorAll('td, th');
            const problemCells = [];
            
            cells.forEach((cell, cellIdx) => {
                const styles = window.getComputedStyle(cell);
                const bg = styles.backgroundColor;
                const color = styles.color;
                const classes = cell.className;
                
                // Check for problematic styling (light background with dark mode)
                const isLightBackground = bg.includes('rgb(255') || bg.includes('rgb(254') || bg.includes('rgb(253');
                const hasDarkText = color.includes('rgb(0') || color.includes('rgb(1') || color.includes('rgb(2');
                
                if (isLightBackground || hasDarkText) {
                    problemCells.push({
                        cellIdx,
                        tagName: cell.tagName,
                        classes,
                        bg,
                        color,
                        hasUiStateActive: classes.includes('ui-state-active'),
                        hasSelectedCell: classes.includes('ui-iggrid-selectedcell'),
                        hasUiStateHover: classes.includes('ui-state-hover'),
                        hasUiStateDefault: classes.includes('ui-state-default')
                    });
                }
            });
            
            if (problemCells.length > 0) {
                console.log(`⚠️ PROBLEM CELLS DETECTED (${problemCells.length}):`);
                problemCells.forEach(cell => {
                    console.log(`  Cell ${cell.cellIdx} (${cell.tagName}):`);
                    console.log(`    Background: ${cell.bg}`);
                    console.log(`    Color: ${cell.color}`);
                    console.log(`    Classes: "${cell.classes}"`);
                    console.log(`    ui-state-active: ${cell.hasUiStateActive}`);
                    console.log(`    ui-iggrid-selectedcell: ${cell.hasSelectedCell}`);
                    console.log(`    ui-state-hover: ${cell.hasUiStateHover}`);
                    console.log(`    ui-state-default: ${cell.hasUiStateDefault}`);
                });
            } else {
                console.log('✓ All cells look good (dark backgrounds)');
                // Show a sample cell for reference
                const sampleCell = cells[1] || cells[0];
                if (sampleCell) {
                    const styles = window.getComputedStyle(sampleCell);
                    console.log(`  Sample: bg=${styles.backgroundColor}, color=${styles.color}`);
                }
            }
        });
        
        console.log('==========\n');
    }

    function setupMonitoring() {
        const grid = document.querySelector('#ListPaneDataGrid');
        if (!grid) {
            console.log('Grid not found, retrying in 1 second...');
            setTimeout(setupMonitoring, 1000);
            return;
        }

        console.log('Grid found! Starting 2-second interval monitoring...\n');
        
        // Report every 2 seconds
        setInterval(reportSelectedRows, 2000);
        
        // Also report immediately when selection changes
        const observer = new MutationObserver(function(mutations) {
            let selectionChanged = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
                    selectionChanged = true;
                }
            });
            
            if (selectionChanged) {
                console.log('[Selection changed - immediate report]');
                reportSelectedRows();
            }
        });

        observer.observe(grid, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
            attributeFilter: ['aria-selected']
        });
        
        console.log('Monitoring active!\n');
    }

    // Wait for page load
    setTimeout(setupMonitoring, 2000);
})();
