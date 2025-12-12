// ==UserScript==
// @name         ScalePlus Selection Method Indicator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows which selection method is active (checkbox vs cell)
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create indicator element
    const indicator = document.createElement('div');
    indicator.id = 'selection-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        display: none;
        border: 2px solid;
    `;
    document.body.appendChild(indicator);

    function checkSelectionMethod() {
        const grid = document.querySelector('#ListPaneDataGrid');
        if (!grid) return;

        const selectedRows = grid.querySelectorAll('tr[aria-selected="true"]');
        
        if (selectedRows.length === 0) {
            indicator.style.display = 'none';
            return;
        }

        indicator.style.display = 'block';
        
        // Check if selection has proper classes
        const firstRow = selectedRows[0];
        const firstCell = firstRow.querySelector('td');
        
        if (!firstCell) return;
        
        const hasSelectedCell = firstCell.classList.contains('ui-iggrid-selectedcell');
        const hasStateActive = firstCell.classList.contains('ui-state-active');
        const hasStateDefault = firstCell.classList.contains('ui-state-default');
        
        const bg = window.getComputedStyle(firstCell).backgroundColor;
        const isCorrect = bg.includes('91, 163, 224'); // Our dark blue
        
        let status = '';
        let color = '';
        
        if (isCorrect) {
            status = '✅ CORRECT COLORS';
            color = '#00ff00';
        } else {
            status = '❌ WRONG COLORS';
            color = '#ff0000';
        }
        
        indicator.style.borderColor = color;
        indicator.innerHTML = `
            ${status}<br>
            Rows: ${selectedRows.length}<br>
            Classes:<br>
            • ui-iggrid-selectedcell: ${hasSelectedCell ? '✓' : '✗'}<br>
            • ui-state-active: ${hasStateActive ? '✓' : '✗'}<br>
            • ui-state-default: ${hasStateDefault ? '✓' : '✗'}
        `;
    }

    function setupMonitoring() {
        const grid = document.querySelector('#ListPaneDataGrid');
        if (!grid) {
            setTimeout(setupMonitoring, 1000);
            return;
        }

        // Check every 500ms
        setInterval(checkSelectionMethod, 500);

        // Watch for changes
        const observer = new MutationObserver(checkSelectionMethod);
        observer.observe(grid, {
            attributes: true,
            subtree: true,
            attributeFilter: ['aria-selected', 'class']
        });
    }

    setTimeout(setupMonitoring, 2000);
})();
