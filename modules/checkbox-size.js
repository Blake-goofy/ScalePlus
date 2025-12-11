// ==UserScript==
// @name         ScalePlus Checkbox Size Module
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enlarges grid row checkboxes for easier clicking
// @author       Blake
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.ScalePlusCheckboxSize = {
        init() {
            console.log('[ScalePlus Checkbox Size] Module initialized');
            this.extractColors();
            this.injectStyles();
            this.applyCheckboxSize();
        },

        isScalePage() {
            const url = window.location.href;
            return url.includes('/scale/') || url.includes('/Scale/');
        },

        extractColors() {
            // Extract colors from existing Scale checkboxes
            // Defaults based on Scale's natural colors from diagnostic
            this.colors = {
                uncheckedBg: 'rgb(244, 244, 248)',
                uncheckedBorder: 'rgb(111, 111, 111)',
                checkedBg: 'rgb(79, 147, 228)',
                checkedBorder: 'rgb(111, 111, 111)'  // Checked keeps same border as unchecked
            };

            // Wait a bit for DOM to be ready, then try to extract colors
            setTimeout(() => {
                const existingCheckbox = document.querySelector('span[name="chk"][data-role="checkbox"]');
                if (existingCheckbox) {
                    const styles = window.getComputedStyle(existingCheckbox);
                    this.colors.uncheckedBg = styles.backgroundColor;
                    this.colors.uncheckedBorder = styles.borderColor;
                    
                    // Try to find a checked checkbox
                    const checkedCheckbox = document.querySelector('span[name="chk"][data-chk="on"]');
                    if (checkedCheckbox) {
                        const checkedStyles = window.getComputedStyle(checkedCheckbox);
                        this.colors.checkedBg = checkedStyles.backgroundColor;
                        // Border stays the same as unchecked in Scale's design
                        this.colors.checkedBorder = styles.borderColor;
                    }
                    
                    console.log('[ScalePlus Checkbox Size] Extracted colors:', this.colors);
                    
                    // Re-inject styles with correct colors
                    const oldStyle = document.getElementById('scaleplus-checkbox-size-styles');
                    if (oldStyle) {
                        oldStyle.remove();
                    }
                    this.injectStyles();
                }
            }, 500);
        },

        injectStyles() {
            // Use extracted colors or fallbacks
            const uncheckedBg = this.colors?.uncheckedBg || '#f4f4f8';
            const uncheckedBorder = this.colors?.uncheckedBorder || '#6f6f6f';
            const checkedBg = this.colors?.checkedBg || '#3875d7';
            const checkedBorder = this.colors?.checkedBorder || '#3875d7';
            
            const checkboxStyles = `
        /* Bigger Checkboxes - Make row selection checkboxes larger and easier to click */
        
        /* Remove ALL spacing from rows and cells */
        body.scaleplus-bigger-checkboxes tr[data-id] {
            margin: 0 !important;
            padding: 0 !important;
            border-spacing: 0 !important;
        }
        
        /* Make the row header cell fill vertically and remove ALL padding/gaps */
        body.scaleplus-bigger-checkboxes tr th.ui-iggrid-rowselector-class {
            padding: 0 !important;
            margin: 0 !important;
            vertical-align: top !important;
            height: 100% !important;
            line-height: 0 !important;
            border-spacing: 0 !important;
            font-size: 0 !important;
            overflow: hidden !important;
        }
        
        /* Remove margin from the expand/collapse icon */
        body.scaleplus-bigger-checkboxes tr th.ui-iggrid-rowselector-class .ui-icon-triangle-1-e {
            margin: 0 !important;
            padding: 0 !important;
            vertical-align: top !important;
            display: inline-block !important;
            height: 100% !important;
        }
        
        /* Make checkbox container EXACTLY match the row height - fill 100% of cell */
        /* Remove top/bottom borders to fill full 31.36px height with no gaps */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            width: 29.36px !important;
            height: 31.36px !important;
            min-width: 29.36px !important;
            min-height: 31.36px !important;
            display: inline-block !important;
            padding: 0 !important;
            margin: 0 !important;
            cursor: pointer !important;
            vertical-align: top !important;
            box-sizing: border-box !important;
            position: relative !important;
            border-top: none !important;
            border-bottom: none !important;
        }
        
        /* Scale the inner icon to fill the checkbox */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] .ui-icon {
            width: 26px !important;
            height: 26px !important;
            display: block !important;
            background-size: 26px 26px !important;
            margin: 0 !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
        }
        
        /* Light mode - Use dynamically extracted colors from Scale's native checkboxes */
        /* Only left/right borders to fill full row height with no gaps */
        /* Darken background slightly to make it clear it's clickable */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *) {
            background-color: ${uncheckedBg} !important;
            border-left: 1px solid ${uncheckedBorder} !important;
            border-right: 1px solid ${uncheckedBorder} !important;
            filter: brightness(0.92) !important;
        }
        
        /* Light mode hover state - even darker */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *):hover {
            background-color: ${uncheckedBg} !important;
            border-left-color: ${uncheckedBorder} !important;
            border-right-color: ${uncheckedBorder} !important;
            filter: brightness(0.85) !important;
        }
        
        /* Light mode checked state - Use extracted checkbox blue from Scale (keeps same border!) */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *),
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *) {
            background-color: ${checkedBg} !important;
            border-left-color: ${checkedBorder} !important;
            border-right-color: ${checkedBorder} !important;
        }
        
        /* Light mode checked hover state - slightly darker */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *):hover,
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *):hover {
            background-color: ${checkedBg} !important;
            border-left-color: ${checkedBorder} !important;
            border-right-color: ${checkedBorder} !important;
            filter: brightness(0.9) !important;
        }
        
        /* Dark mode - Keep existing dark mode styling but with larger size, only left/right borders */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            background-color: rgba(255, 255, 255, 0.08) !important;
            border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Dark mode hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:hover {
            background-color: rgba(255, 255, 255, 0.12) !important;
            border-left-color: rgba(255, 255, 255, 0.3) !important;
            border-right-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        /* Dark mode checked state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"],
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active {
            background-color: rgba(79, 147, 228, 0.3) !important;
            border-left-color: rgba(79, 147, 228, 0.6) !important;
            border-right-color: rgba(79, 147, 228, 0.6) !important;
        }
        
        /* Dark mode checked hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:hover,
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:hover {
            background-color: rgba(79, 147, 228, 0.4) !important;
            border-left-color: rgba(79, 147, 228, 0.7) !important;
            border-right-color: rgba(79, 147, 228, 0.7) !important;
        }
            `;

            const styleElement = document.createElement('style');
            styleElement.id = 'scaleplus-checkbox-size-styles';
            styleElement.textContent = checkboxStyles;
            document.head.appendChild(styleElement);
        },

        applyCheckboxSize() {
            // Only apply on Scale pages
            if (!this.isScalePage()) {
                console.log('[ScalePlus Checkbox Size] Not on Scale page, skipping');
                return;
            }

            // Check if feature is enabled
            if (!window.ScalePlusSettings?.isEnabled(window.ScalePlusSettings.SETTINGS.BIGGER_CHECKBOXES)) {
                console.log('[ScalePlus Checkbox Size] Feature disabled');
                document.body.classList.remove('scaleplus-bigger-checkboxes');
                return;
            }

            // Apply the bigger checkboxes class
            document.body.classList.add('scaleplus-bigger-checkboxes');
            console.log('[ScalePlus Checkbox Size] Bigger checkboxes applied');
        }
    };

    // Initialize the module
    window.ScalePlusCheckboxSize.init();
})();
