// ==UserScript==
// @name         ScalePlus Checkbox Diagnostic Tool
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Scrapes checkbox HTML
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to load
    setTimeout(() => {
        console.log('=== ScalePlus Checkbox Diagnostic Tool v1.2 - State Change Detection ===');
        
        // Find first few rows
        const rows = document.querySelectorAll('tr[data-id]');
        console.log(`Found ${rows.length} rows`);
        
        if (rows.length > 0) {
            const firstRow = rows[0];
            const rowHeader = firstRow.querySelector('th.ui-iggrid-rowselector-class');
            const checkbox = firstRow.querySelector('span[name="chk"][data-role="checkbox"]');
            
            // Capture BEFORE state
            console.log('\n=== BEFORE STATE (INITIAL) ===');
            const beforeState = captureState(firstRow, rowHeader, checkbox, 'BEFORE');
            
            if (checkbox) {
                // Toggle checkbox state and capture AFTER
                const wasChecked = checkbox.getAttribute('data-chk') === 'on';
                
                console.log(`\n=== Toggling checkbox from ${wasChecked ? 'CHECKED' : 'UNCHECKED'} to ${wasChecked ? 'UNCHECKED' : 'CHECKED'} ===`);
                
                if (wasChecked) {
                    checkbox.setAttribute('data-chk', '');
                    checkbox.classList.remove('ui-state-active');
                } else {
                    checkbox.setAttribute('data-chk', 'on');
                    checkbox.classList.add('ui-state-active');
                }
                
                // Wait for style recalculation
                setTimeout(() => {
                    console.log('\n=== AFTER STATE (TOGGLED) ===');
                    const afterState = captureState(firstRow, rowHeader, checkbox, 'AFTER');
                    
                    // Show differences
                    console.log('\n=== STATE COMPARISON ===');
                    console.log('Row Header Height Change:', beforeState.rowHeight, '->', afterState.rowHeight);
                    console.log('Checkbox Height Change:', beforeState.checkboxHeight, '->', afterState.checkboxHeight);
                    console.log('Checkbox Border-Width Change:', beforeState.checkboxBorderWidth, '->', afterState.checkboxBorderWidth);
                    console.log('Row Border Change:', beforeState.rowBorder, '->', afterState.rowBorder);
                    
                    // Restore original state
                    if (wasChecked) {
                        checkbox.setAttribute('data-chk', 'on');
                        checkbox.classList.add('ui-state-active');
                    } else {
                        checkbox.setAttribute('data-chk', '');
                        checkbox.classList.remove('ui-state-active');
                    }
                    
                    // Create modal with both states
                    createDiagnosticModal(beforeState, afterState);
                }, 100);
                return;
            }
        }
        
        // Fallback if no rows found
        createDiagnosticModal();
        
    }, 2000);
    
    function captureState(row, rowHeader, checkbox, label) {
        const state = {
            label: label,
            rowHeight: 'N/A',
            rowBorder: 'N/A',
            checkboxHeight: 'N/A',
            checkboxWidth: 'N/A',
            checkboxBorderWidth: 'N/A',
            checkboxBorder: 'N/A',
            checkboxBgColor: 'N/A',
            checkboxMargin: 'N/A',
            checkboxPadding: 'N/A',
            rowHeaderHeight: 'N/A',
            rowHeaderBorder: 'N/A'
        };
        
        if (row) {
            const rowStyles = window.getComputedStyle(row);
            state.rowHeight = rowStyles.height;
            state.rowBorder = rowStyles.border;
        }
        
        if (rowHeader) {
            const rhStyles = window.getComputedStyle(rowHeader);
            state.rowHeaderHeight = rhStyles.height;
            state.rowHeaderBorder = rhStyles.border;
        }
        
        if (checkbox) {
            const cbStyles = window.getComputedStyle(checkbox);
            state.checkboxHeight = cbStyles.height;
            state.checkboxWidth = cbStyles.width;
            state.checkboxBorderWidth = cbStyles.borderWidth;
            state.checkboxBorder = cbStyles.border;
            state.checkboxBgColor = cbStyles.backgroundColor;
            state.checkboxMargin = cbStyles.margin;
            state.checkboxPadding = cbStyles.padding;
        }
        
        console.log(`${label} State:`, state);
        return state;
    }
    
    function createDiagnosticModal(beforeState, afterState) {
        const modal = document.createElement('div');
        modal.id = 'checkbox-diagnostic-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #333;
            padding: 20px;
            z-index: 10000;
            max-width: 900px;
            max-height: 600px;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        let content = '<h2 style="margin-top:0;">Checkbox State Change Diagnostic v1.2</h2>';
        content += '<p style="color: #d9534f; font-weight: bold;">⚠️ Shows height changes when toggling checkbox state</p>';
        content += '<p>Check browser console for full details. Copy text below:</p>';
        content += '<textarea readonly style="width:100%; height:400px; font-family:monospace; font-size:11px;">';
        
        if (beforeState && afterState) {
            content += '=== STATE COMPARISON ===\n\n';
            
            content += '--- ROW MEASUREMENTS ---\n';
            content += `Row Height:         ${beforeState.rowHeight} -> ${afterState.rowHeight}\n`;
            content += `Row Border:         ${beforeState.rowBorder} -> ${afterState.rowBorder}\n`;
            content += `Row Header Height:  ${beforeState.rowHeaderHeight} -> ${afterState.rowHeaderHeight}\n`;
            content += `Row Header Border:  ${beforeState.rowHeaderBorder} -> ${afterState.rowHeaderBorder}\n\n`;
            
            content += '--- CHECKBOX MEASUREMENTS ---\n';
            content += `Checkbox Height:      ${beforeState.checkboxHeight} -> ${afterState.checkboxHeight}\n`;
            content += `Checkbox Width:       ${beforeState.checkboxWidth} -> ${afterState.checkboxWidth}\n`;
            content += `Checkbox Border:      ${beforeState.checkboxBorder} -> ${afterState.checkboxBorder}\n`;
            content += `Checkbox Border-Width: ${beforeState.checkboxBorderWidth} -> ${afterState.checkboxBorderWidth}\n`;
            content += `Checkbox BG Color:    ${beforeState.checkboxBgColor} -> ${afterState.checkboxBgColor}\n`;
            content += `Checkbox Margin:      ${beforeState.checkboxMargin} -> ${afterState.checkboxMargin}\n`;
            content += `Checkbox Padding:     ${beforeState.checkboxPadding} -> ${afterState.checkboxPadding}\n\n`;
            
            content += '--- ANALYSIS ---\n';
            if (beforeState.rowHeight !== afterState.rowHeight) {
                content += `⚠️ ROW HEIGHT CHANGED: ${beforeState.rowHeight} -> ${afterState.rowHeight}\n`;
            }
            if (beforeState.rowHeaderHeight !== afterState.rowHeaderHeight) {
                content += `⚠️ ROW HEADER HEIGHT CHANGED: ${beforeState.rowHeaderHeight} -> ${afterState.rowHeaderHeight}\n`;
            }
            if (beforeState.checkboxHeight !== afterState.checkboxHeight) {
                content += `⚠️ CHECKBOX HEIGHT CHANGED: ${beforeState.checkboxHeight} -> ${afterState.checkboxHeight}\n`;
            }
            if (beforeState.checkboxBorderWidth !== afterState.checkboxBorderWidth) {
                content += `⚠️ CHECKBOX BORDER WIDTH CHANGED: ${beforeState.checkboxBorderWidth} -> ${afterState.checkboxBorderWidth}\n`;
            }
        } else {
            content += '=== NO STATE COMPARISON AVAILABLE ===\n';
            content += 'Could not capture before/after states.\n';
        }
        
        content += '</textarea>';
        content += '<button id="close-diagnostic" style="margin-top:10px; padding:10px 20px; cursor:pointer;">Close</button>';
        
        modal.innerHTML = content;
        document.body.appendChild(modal);
        
        document.getElementById('close-diagnostic').addEventListener('click', () => {
            modal.remove();
        });
        
        // Auto-select text
        const textarea = modal.querySelector('textarea');
        textarea.focus();
        textarea.select();
    }
})();
