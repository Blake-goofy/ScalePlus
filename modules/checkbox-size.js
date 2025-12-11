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
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            width: 31.36px !important;
            height: 31.36px !important;
            min-width: 31.36px !important;
            min-height: 31.36px !important;
            display: inline-block !important;
            padding: 0 !important;
            margin: 0 !important;
            cursor: pointer !important;
            vertical-align: top !important;
            box-sizing: border-box !important;
            position: relative !important;
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
        
        /* Light mode - Match the default checkbox border color (darker blue/gray) */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *) {
            background-color: #e6e6e6 !important;
            border: 1px solid #aaaaaa !important;
        }
        
        /* Light mode hover state */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *):hover {
            background-color: #d9d9d9 !important;
            border-color: #888888 !important;
        }
        
        /* Light mode checked state - Use default checkbox blue */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *),
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *) {
            background-color: #3875d7 !important;
            border-color: #3875d7 !important;
        }
        
        /* Light mode checked hover state */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *):hover,
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *):hover {
            background-color: #2a5bb3 !important;
            border-color: #2a5bb3 !important;
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
        
        /* Dark mode checked state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"],
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active {
            background-color: rgba(79, 147, 228, 0.3) !important;
            border-color: rgba(79, 147, 228, 0.6) !important;
        }
        
        /* Dark mode checked hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:hover,
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:hover {
            background-color: rgba(79, 147, 228, 0.4) !important;
            border-color: rgba(79, 147, 228, 0.7) !important;
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
