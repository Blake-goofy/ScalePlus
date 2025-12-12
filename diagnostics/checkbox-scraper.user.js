// ==UserScript==
// @name         ScalePlus Checkbox Diagnostic Tool
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Deep diagnostic - captures all box model properties to find root cause
// @author       Blake
// @match        https://scaleqa.byjasco.com/scale/*
// @match        https://scale20.byjasco.com/scale/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to load
    setTimeout(() => {
        console.log('=== ScalePlus Checkbox Diagnostic Tool v2.0 - Deep Analysis ===');
        console.log('Monitoring ALL box model properties. Toggle checkboxes to see what changes.');
        console.log('');
        
        let lastSnapshot = null;
        let sampleCount = 0;
        
        // Capture comprehensive box model snapshot
        function captureSnapshot(element, label) {
            const styles = window.getComputedStyle(element);
            return {
                label,
                // Dimensions
                height: styles.height,
                width: styles.width,
                minHeight: styles.minHeight,
                maxHeight: styles.maxHeight,
                // Box model
                padding: `${styles.paddingTop} ${styles.paddingRight} ${styles.paddingBottom} ${styles.paddingLeft}`,
                margin: `${styles.marginTop} ${styles.marginRight} ${styles.marginBottom} ${styles.marginLeft}`,
                border: `${styles.borderTopWidth} ${styles.borderRightWidth} ${styles.borderBottomWidth} ${styles.borderLeftWidth}`,
                // Display
                display: styles.display,
                boxSizing: styles.boxSizing,
                verticalAlign: styles.verticalAlign,
                lineHeight: styles.lineHeight,
                // Other
                overflow: styles.overflow,
                position: styles.position,
                bgColor: styles.backgroundColor,
                borderColor: styles.borderTopColor,
                // Check for inline styles
                inlineStyle: element.getAttribute('style') || 'none'
            };
        }
        
        // Compare two snapshots and log differences
        function compareSnapshots(old, current) {
            const diffs = [];
            for (const key in current) {
                if (key === 'label') continue;
                if (old[key] !== current[key]) {
                    diffs.push(`  ${key}: ${old[key]} → ${current[key]}`);
                }
            }
            return diffs;
        }
        
        const monitor = setInterval(() => {
            const rows = document.querySelectorAll('tr[data-id]');
            if (rows.length === 0) return;
            
            const firstRow = rows[0];
            const rowHeader = firstRow.querySelector('th.ui-iggrid-rowselector-class');
            const checkbox = firstRow.querySelector('span[name="chk"][data-role="checkbox"]');
            const icon = checkbox?.querySelector('.ui-icon');
            
            if (!rowHeader || !checkbox) return;
            
            // Check for other children in row header that might affect height
            const rhChildren = Array.from(rowHeader.children);
            const nonCheckboxChildren = rhChildren.filter(c => c !== checkbox && !checkbox.contains(c));
            
            const isChecked = checkbox.getAttribute('data-chk') === 'on';
            sampleCount++;
            
            // Capture full snapshot
            const snapshot = {
                state: isChecked ? 'CHECKED' : 'UNCHECKED',
                row: captureSnapshot(firstRow, 'Row'),
                rowHeader: captureSnapshot(rowHeader, 'RowHeader'),
                checkbox: captureSnapshot(checkbox, 'Checkbox'),
                icon: icon ? captureSnapshot(icon, 'Icon') : null
            };
            
            // Log basic state
            console.log(`[Sample ${sampleCount}] State: ${snapshot.state} | Row: ${snapshot.row.height} | Checkbox: ${snapshot.checkbox.height} | RowHeader children: ${rhChildren.length}`);
            
            // Log other children if any
            if (nonCheckboxChildren.length > 0 && sampleCount === 1) {
                console.log('⚠️ Row header has additional children besides checkbox:', nonCheckboxChildren);
            }
            
            // If state changed, do deep comparison
            if (lastSnapshot && lastSnapshot.state !== snapshot.state) {
                console.group(`🔍 STATE CHANGE DETECTED: ${lastSnapshot.state} → ${snapshot.state}`);
                
                // Compare row
                const rowDiffs = compareSnapshots(lastSnapshot.row, snapshot.row);
                if (rowDiffs.length > 0) {
                    console.warn('📏 ROW CHANGES:');
                    rowDiffs.forEach(d => console.log(d));
                }
                
                // Compare row header
                const rhDiffs = compareSnapshots(lastSnapshot.rowHeader, snapshot.rowHeader);
                if (rhDiffs.length > 0) {
                    console.warn('📦 ROW HEADER CHANGES:');
                    rhDiffs.forEach(d => console.log(d));
                }
                
                // Compare checkbox
                const cbDiffs = compareSnapshots(lastSnapshot.checkbox, snapshot.checkbox);
                if (cbDiffs.length > 0) {
                    console.warn('☑️ CHECKBOX CHANGES:');
                    cbDiffs.forEach(d => console.log(d));
                }
                
                // Compare icon (if both states have it)
                if (lastSnapshot.icon && snapshot.icon) {
                    const iconDiffs = compareSnapshots(lastSnapshot.icon, snapshot.icon);
                    if (iconDiffs.length > 0) {
                        console.warn('🎨 ICON CHANGES:');
                        iconDiffs.forEach(d => console.log(d));
                    }
                }
                
                console.groupEnd();
            }
            
            lastSnapshot = snapshot;
        }, 1000);
        
        // Add commands
        console.log('Commands:');
        console.log('  window.stopMonitor() - Stop monitoring');
        console.log('  window.dumpSnapshot() - Dump current full snapshot');
        
        window.stopMonitor = () => {
            clearInterval(monitor);
            console.log('Monitor stopped.');
        };
        
        window.dumpSnapshot = () => {
            if (lastSnapshot) {
                console.log('Current snapshot:', lastSnapshot);
            } else {
                console.log('No snapshot captured yet.');
            }
        };
        
    }, 1000);
})();
