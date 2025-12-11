// ==UserScript==
// @name         ScalePlus Checkbox Diagnostic Tool
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Scrapes checkbox HTML and computed styles for debugging
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to load
    setTimeout(() => {
        console.log('=== ScalePlus Checkbox Diagnostic Tool ===');
        
        // Find first few rows
        const rows = document.querySelectorAll('tr[data-id]');
        console.log(`Found ${rows.length} rows`);
        
        if (rows.length > 0) {
            const firstRow = rows[0];
            const rowHeader = firstRow.querySelector('th.ui-iggrid-rowselector-class');
            const checkbox = firstRow.querySelector('span[name="chk"][data-role="checkbox"]');
            
            if (rowHeader) {
                console.log('\n=== ROW HEADER (TH) ===');
                console.log('HTML:', rowHeader.outerHTML);
                const thStyles = window.getComputedStyle(rowHeader);
                console.log('Computed Styles:');
                console.log('  height:', thStyles.height);
                console.log('  padding:', thStyles.padding);
                console.log('  margin:', thStyles.margin);
                console.log('  line-height:', thStyles.lineHeight);
                console.log('  vertical-align:', thStyles.verticalAlign);
                console.log('  display:', thStyles.display);
            }
            
            if (checkbox) {
                console.log('\n=== CHECKBOX SPAN ===');
                console.log('HTML:', checkbox.outerHTML);
                const cbStyles = window.getComputedStyle(checkbox);
                console.log('Computed Styles:');
                console.log('  width:', cbStyles.width);
                console.log('  height:', cbStyles.height);
                console.log('  padding:', cbStyles.padding);
                console.log('  margin:', cbStyles.margin);
                console.log('  border:', cbStyles.border);
                console.log('  background-color:', cbStyles.backgroundColor);
                console.log('  display:', cbStyles.display);
                console.log('  vertical-align:', cbStyles.verticalAlign);
                console.log('  box-sizing:', cbStyles.boxSizing);
                
                const icon = checkbox.querySelector('.ui-icon');
                if (icon) {
                    console.log('\n=== CHECKBOX ICON ===');
                    console.log('HTML:', icon.outerHTML);
                    const iconStyles = window.getComputedStyle(icon);
                    console.log('Computed Styles:');
                    console.log('  width:', iconStyles.width);
                    console.log('  height:', iconStyles.height);
                    console.log('  background-color:', iconStyles.backgroundColor);
                    console.log('  background-image:', iconStyles.backgroundImage);
                }
            }
            
            // Get a checked checkbox if one exists
            const checkedCheckbox = document.querySelector('span[name="chk"][data-chk="on"]');
            if (checkedCheckbox) {
                console.log('\n=== CHECKED CHECKBOX ===');
                console.log('HTML:', checkedCheckbox.outerHTML);
                const checkedStyles = window.getComputedStyle(checkedCheckbox);
                console.log('Computed Styles:');
                console.log('  background-color:', checkedStyles.backgroundColor);
                console.log('  border:', checkedStyles.border);
                console.log('  border-color:', checkedStyles.borderColor);
            }
            
            console.log('\n=== FULL ROW HTML (first row) ===');
            console.log(firstRow.outerHTML);
        }
        
        // Create a modal to display results
        createDiagnosticModal();
        
    }, 2000);
    
    function createDiagnosticModal() {
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
            max-width: 800px;
            max-height: 600px;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        const rows = document.querySelectorAll('tr[data-id]');
        const firstRow = rows[0];
        const rowHeader = firstRow?.querySelector('th.ui-iggrid-rowselector-class');
        const checkbox = firstRow?.querySelector('span[name="chk"][data-role="checkbox"]');
        
        let content = '<h2 style="margin-top:0;">Checkbox Diagnostic Results</h2>';
        content += '<p>Check browser console for full details. Copy text below:</p>';
        content += '<textarea readonly style="width:100%; height:400px; font-family:monospace; font-size:11px;">';
        
        if (rowHeader) {
            content += '=== ROW HEADER HTML ===\n';
            content += rowHeader.outerHTML + '\n\n';
            
            const thStyles = window.getComputedStyle(rowHeader);
            content += '=== ROW HEADER STYLES ===\n';
            content += `height: ${thStyles.height}\n`;
            content += `padding: ${thStyles.padding}\n`;
            content += `margin: ${thStyles.margin}\n`;
            content += `line-height: ${thStyles.lineHeight}\n\n`;
        }
        
        if (checkbox) {
            content += '=== CHECKBOX HTML ===\n';
            content += checkbox.outerHTML + '\n\n';
            
            const cbStyles = window.getComputedStyle(checkbox);
            content += '=== CHECKBOX STYLES ===\n';
            content += `width: ${cbStyles.width}\n`;
            content += `height: ${cbStyles.height}\n`;
            content += `padding: ${cbStyles.padding}\n`;
            content += `margin: ${cbStyles.margin}\n`;
            content += `border: ${cbStyles.border}\n`;
            content += `background-color: ${cbStyles.backgroundColor}\n`;
            content += `border-color: ${cbStyles.borderColor}\n\n`;
        }
        
        if (firstRow) {
            content += '=== FULL ROW HTML ===\n';
            content += firstRow.outerHTML;
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
