// ==UserScript==
// @name         ScalePlus Checkbox Size Module
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Enlarges grid row checkboxes for easier clicking
// @author       Blake
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.ScalePlusCheckboxSize = {
        init() {
            console.log('[ScalePlus Checkbox Size] Module initialized');
            this.sizes = { checkbox: 30, icon: 26 };
            this.extractColors();
            this.injectStyles();
            this.applyCheckboxSize();
            // Re-measure after rows render to avoid gaps on varying row heights
            this.waitForRowHeader();
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
                    
                        // Recompute sizing and re-inject styles with measured values/colors
                        this.recomputeSizesAndStyles();
                }
            }, 500);
        },

        measureSizes() {
            // Derive checkbox and icon sizes from the live row header height to avoid gaps
            const fallbackCheckbox = 30;
            const fallbackIcon = 26;

            let checkboxSize = fallbackCheckbox;
            let iconSize = fallbackIcon;

            const rowHeader = document.querySelector('th.ui-iggrid-rowselector-class');
            if (rowHeader) {
                const rect = rowHeader.getBoundingClientRect();
                if (rect && rect.height) {
                    // Leave a tiny margin to avoid forcing row expansion
                    checkboxSize = Math.max(20, Math.round(rect.height - 2));
                    iconSize = Math.max(checkboxSize - 4, Math.round(checkboxSize * 0.85));
                }
            } else {
                // Fall back to any checkbox we can find
                const checkbox = document.querySelector('span[name="chk"][data-role="checkbox"]');
                if (checkbox) {
                    const rect = checkbox.getBoundingClientRect();
                    if (rect && rect.height) {
                        checkboxSize = Math.max(20, Math.round(rect.height));
                        iconSize = Math.max(checkboxSize - 4, Math.round(checkboxSize * 0.85));
                    }
                }
            }

            this.sizes = { checkbox: checkboxSize, icon: iconSize };
        },

        injectStyles() {
            this.measureSizes();

            // Use extracted colors or fallbacks
            const uncheckedBg = this.colors?.uncheckedBg || '#f4f4f8';
            const uncheckedBorder = this.colors?.uncheckedBorder || '#6f6f6f';
            const checkedBg = this.colors?.checkedBg || '#3875d7';
            const checkedBorder = this.colors?.checkedBorder || '#3875d7';
            const checkboxSize = this.sizes?.checkbox || 30;
            const iconSize = this.sizes?.icon || 26;
            
            const checkboxStyles = `
        /* Bigger Checkboxes - Make checkboxes dynamically fill row height */
        
        /* Let rows be whatever height Scale wants - don't fight it */
        body.scaleplus-bigger-checkboxes tr[data-id] {
            /* Just clean up spacing */
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* Row header - clean up padding but let Scale control height */
        body.scaleplus-bigger-checkboxes tr th.ui-iggrid-rowselector-class {
            padding: 0 !important;
            margin: 0 !important;
            vertical-align: middle !important;
            line-height: 0 !important;
            overflow: hidden !important;
        }
        
        /* Checkbox container - size will be set dynamically via JS to match row height */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            display: inline-block !important;
            padding: 0 !important;
            margin: 0 !important;
            cursor: pointer !important;
            vertical-align: middle !important;
            box-sizing: border-box !important;
            position: relative !important;
            border-top: none !important;
            border-bottom: none !important;
            /* Size set dynamically via JS */
        }
        
        /* Icon - size set dynamically via JS, centered */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] .ui-icon {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            /* Size set dynamically via JS */
        }
        
        /* Light mode - Use dynamically extracted colors from Scale's native checkboxes */
        /* Only left/right borders to fill full row height with no gaps */
        /* Use a subtly darker gray background to make it visible as clickable */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *) {
            background-color: rgb(232, 232, 236) !important;
            border-left: 1px solid ${uncheckedBorder} !important;
            border-right: 1px solid ${uncheckedBorder} !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Light mode hover state - darker for feedback */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:not(.scaleplus-dark-mode *):hover {
            background-color: rgb(215, 215, 220) !important;
            border-left-color: ${uncheckedBorder} !important;
            border-right-color: ${uncheckedBorder} !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Light mode checked state - Use extracted checkbox blue from Scale (keeps same border!) */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *),
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *) {
            background-color: ${checkedBg} !important;
            border-left-color: ${checkedBorder} !important;
            border-right-color: ${checkedBorder} !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Light mode checked hover state - slightly darker */
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:not(.scaleplus-dark-mode *):hover,
        body.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:not(.scaleplus-dark-mode *):hover {
            background-color: ${checkedBg} !important;
            border-left-color: ${checkedBorder} !important;
            border-right-color: ${checkedBorder} !important;
            filter: brightness(0.9) !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Dark mode - Keep existing dark mode styling but with larger size, only left/right borders */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"] {
            background-color: rgba(255, 255, 255, 0.08) !important;
            border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Dark mode hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"]:hover {
            background-color: rgba(255, 255, 255, 0.12) !important;
            border-left-color: rgba(255, 255, 255, 0.3) !important;
            border-right-color: rgba(255, 255, 255, 0.3) !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Dark mode checked state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"],
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active {
            background-color: rgba(79, 147, 228, 0.3) !important;
            border-left-color: rgba(79, 147, 228, 0.6) !important;
            border-right-color: rgba(79, 147, 228, 0.6) !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
        
        /* Dark mode checked hover state */
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"][data-chk="on"]:hover,
        body.scaleplus-dark-mode.scaleplus-bigger-checkboxes span[name="chk"][data-role="checkbox"].ui-state-active:hover {
            background-color: rgba(79, 147, 228, 0.4) !important;
            border-left-color: rgba(79, 147, 228, 0.7) !important;
            border-right-color: rgba(79, 147, 228, 0.7) !important;
            /* Force consistent dimensions */
            width: ${checkboxSize}px !important;
            height: ${checkboxSize}px !important;
        }
            `;

            const oldStyle = document.getElementById('scaleplus-checkbox-size-styles');
            if (oldStyle) {
                oldStyle.remove();
            }

            const styleElement = document.createElement('style');
            styleElement.id = 'scaleplus-checkbox-size-styles';
            styleElement.textContent = checkboxStyles;
            document.head.appendChild(styleElement);
        },

        waitForRowHeader() {
            const attempt = () => {
                const header = document.querySelector('th.ui-iggrid-rowselector-class');
                if (header) {
                    const rect = header.getBoundingClientRect();
                    if (rect && rect.height > 0) {
                        this.recomputeSizesAndStyles();
                        return true;
                    }
                }
                return false;
            };

            if (attempt()) return;

            const observer = new MutationObserver(() => {
                if (attempt()) {
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Safety timeout to avoid long-lived observers if rows never render
            setTimeout(() => observer.disconnect(), 6000);
        },

        recomputeSizesAndStyles() {
            this.measureSizes();
            this.injectStyles();
            this.applyCheckboxSize();
            this.enforceRowHeights();
        },

        enforceRowHeights() {
            // NEW APPROACH: Let Scale control row heights, make checkbox fill whatever height the row has
            if (!this.isScalePage()) return;
            if (!window.ScalePlusSettings?.isEnabled(window.ScalePlusSettings.SETTINGS.BIGGER_CHECKBOXES)) return;

            // Dynamically size checkboxes to match their parent row height
            const resizeCheckboxes = () => {
                const rows = document.querySelectorAll('body.scaleplus-bigger-checkboxes tr[data-id]');
                rows.forEach(row => {
                    const rowHeader = row.querySelector('th.ui-iggrid-rowselector-class');
                    const checkbox = row.querySelector('span[name="chk"][data-role="checkbox"]');
                    
                    if (rowHeader && checkbox) {
                        // Get the actual computed height of the row header
                        const headerHeight = rowHeader.getBoundingClientRect().height;
                        if (headerHeight > 0) {
                            // Make checkbox exactly match the row header height
                            checkbox.style.setProperty('width', `${headerHeight}px`, 'important');
                            checkbox.style.setProperty('height', `${headerHeight}px`, 'important');
                            
                            // Scale the icon proportionally
                            const icon = checkbox.querySelector('.ui-icon');
                            if (icon) {
                                const iconSize = Math.round(headerHeight * 0.85);
                                icon.style.setProperty('width', `${iconSize}px`, 'important');
                                icon.style.setProperty('height', `${iconSize}px`, 'important');
                                icon.style.setProperty('background-size', `${iconSize}px ${iconSize}px`, 'important');
                            }
                        }
                    }
                });
            };

            // Apply immediately
            resizeCheckboxes();

            // Watch for checkbox state changes and resize dynamically
            if (this.heightEnforcer) {
                this.heightEnforcer.disconnect();
            }

            this.heightEnforcer = new MutationObserver(() => {
                resizeCheckboxes();
            });

            this.heightEnforcer.observe(document.body, {
                subtree: true,
                attributes: true,
                attributeFilter: ['data-chk', 'class']
            });

            // Also check periodically in case we miss something
            if (this.resizeInterval) {
                clearInterval(this.resizeInterval);
            }
            this.resizeInterval = setInterval(resizeCheckboxes, 500);
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
                if (this.heightEnforcer) {
                    this.heightEnforcer.disconnect();
                }
                if (this.resizeInterval) {
                    clearInterval(this.resizeInterval);
                }
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
