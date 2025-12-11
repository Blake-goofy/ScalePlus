// ==UserScript==
// @name         ScalePlus Checkbox Diagnostic Tool
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Continuous row height monitor - manually toggle checkboxes
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to load
    setTimeout(() => {
        console.log('=== ScalePlus Checkbox Diagnostic Tool v1.3 - Continuous Monitor ===');
        console.log('Monitoring row heights every 1 second. Manually toggle checkboxes with your mouse.');
        console.log('');
        
        let lastRowHeight = null;
        let lastCheckboxHeight = null;
        let lastCheckboxBgColor = null;
        let sampleCount = 0;
        
        const monitor = setInterval(() => {
            const rows = document.querySelectorAll('tr[data-id]');
            if (rows.length === 0) return;
            
            const firstRow = rows[0];
            const rowHeader = firstRow.querySelector('th.ui-iggrid-rowselector-class');
            const checkbox = firstRow.querySelector('span[name="chk"][data-role="checkbox"]');
            
            if (!rowHeader || !checkbox) return;
            
            const rowStyles = window.getComputedStyle(firstRow);
            const rhStyles = window.getComputedStyle(rowHeader);
            const cbStyles = window.getComputedStyle(checkbox);
            
            const rowHeight = rowStyles.height;
            const checkboxHeight = cbStyles.height;
            const checkboxBgColor = cbStyles.backgroundColor;
            const isChecked = checkbox.getAttribute('data-chk') === 'on' ? 'CHECKED' : 'UNCHECKED';
            
            sampleCount++;
            
            // Always log the current state
            console.log(`[Sample ${sampleCount}] Row: ${rowHeight} | Checkbox: ${checkboxHeight} | BG: ${checkboxBgColor} | State: ${isChecked}`);
            
            // Alert if something changed
            if (lastRowHeight !== null && rowHeight !== lastRowHeight) {
                console.warn(`⚠️ ROW HEIGHT CHANGED: ${lastRowHeight} -> ${rowHeight}`);
            }
            if (lastCheckboxHeight !== null && checkboxHeight !== lastCheckboxHeight) {
                console.warn(`⚠️ CHECKBOX HEIGHT CHANGED: ${lastCheckboxHeight} -> ${checkboxHeight}`);
            }
            if (lastCheckboxBgColor !== null && checkboxBgColor !== lastCheckboxBgColor) {
                console.warn(`⚠️ CHECKBOX BG COLOR CHANGED: ${lastCheckboxBgColor} -> ${checkboxBgColor}`);
            }
            
            lastRowHeight = rowHeight;
            lastCheckboxHeight = checkboxHeight;
            lastCheckboxBgColor = checkboxBgColor;
        }, 1000);
        
        // Add a stop button to console
        console.log('Type: window.stopMonitor() to stop monitoring');
        window.stopMonitor = () => {
            clearInterval(monitor);
            console.log('Monitor stopped.');
        };
        
    }, 1000);
})();
