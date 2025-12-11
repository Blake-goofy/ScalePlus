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
            this.injectStyles();
            this.applyCheckboxSize();
        },

        isScalePage() {
            const url = window.location.href;
            return url.includes('/scale/') || url.includes('/Scale/');
        },

        injectStyles() {
            const checkboxStyles = `
        /* Bigger Checkboxes - Make row selection checkboxes larger and easier to click */
        
        /* Make the row header cell fill vertically and remove padding/gaps */
        body.scaleplus-bigger-checkboxes tr th.ui-iggrid-rowselector-class {
            padding: 0 !important;
            margin: 0 !important;
            vertical-align: middle !important;
            height: 100% !important;
            line-height: 1 !important;
        }
        
        /* Remove margin from the expand/collapse icon */
        body.scaleplus-bigger-checkboxes tr th.ui-iggrid-rowselector-class .ui-icon-triangle-1-e {
            margin: 0 !important;
            padding: 0 !important;
            vertical-align: middle !important;
        }
        
        /* Make checkbox container fill the cell height and be square based on row height */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            min-height: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            cursor: pointer !important;
            vertical-align: middle !important;
            box-sizing: border-box !important;
        }
        
        /* Scale the inner icon to fill the checkbox */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] .ui-icon {
            width: 20px !important;
            height: 20px !important;
            display: inline-block !important;
            background-size: 20px 20px !important;
            margin: 0 !important;
        }
        
        /* Light mode - Add visual distinction with subtle background */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *) {
            background-color: rgba(0, 0, 0, 0.04) !important;
            border: 1px solid rgba(0, 0, 0, 0.12) !important;
        }
        
        /* Light mode hover state */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *):hover {
            background-color: rgba(0, 0, 0, 0.08) !important;
            border-color: rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Dark mode - Keep existing dark mode styling but with larger size */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            background-color: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Dark mode hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:hover {
            background-color: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        /* Checked state for both light and dark mode */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"],
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active {
            background-color: rgba(79, 147, 228, 0.2) !important;
            border-color: rgba(79, 147, 228, 0.5) !important;
        }
        
        /* Checked hover state */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:hover,
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:hover {
            background-color: rgba(79, 147, 228, 0.3) !important;
            border-color: rgba(79, 147, 228, 0.6) !important;
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
