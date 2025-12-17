// ==UserScript==
// @name         ScalePlus Settings UI Module
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Settings modal interface for ScalePlus
// @author       Blake
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Check if we're on a Scale page (not RF page)
    function isScalePage() {
        const url = window.location.href;
        return url.includes('/scale/') || url.includes('/Scale/');
    }

    // Only initialize on Scale pages
    if (!isScalePage()) {
        console.log('[ScalePlus Settings UI] Not on Scale page, skipping initialization');
        // Export empty module so other modules don't break
        window.ScalePlusSettingsUI = {
            init: () => {},
            createSettingsModal: () => {},
            addScalePlusSettingsButton: () => {}
        };
        return;
    }

    const { SETTINGS, DEFAULTS } = window.ScalePlusSettings || {};
    
    if (!SETTINGS) {
        console.error('[ScalePlus Settings UI] Settings module not loaded');
        return;
    }

    const createSettingsModal = () => {
        const modal = document.createElement('div');
        modal.id = 'scaleplus-settings-modal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <form class="form-horizontal" id="ScalePlusSettingsModalDialogForm" novalidate="novalidate" data-controltype="form">
                        <div class="modal-header" data-controltype="modalDialogHeader" data-resourcekey="SCALEPLUSSETTINGS" data-resourcevalue="ScalePlus Settings">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                            <h4 class="modal-title">ScalePlus Settings</h4>
                        </div>
                        <div class="modal-body" data-controltype="modalDialogBody">
                            <!-- Main Settings Page -->
                            <div id="scaleplus-main-page" class="scaleplus-settings-page">
                                <div class="scaleplus-setting">
                                    <label for="right-click-toggle">Right-click menu:</label>
                                    <input type="checkbox" id="right-click-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Right-click on grid items and favorites for additional options <a href="https://github.com/Blake-goofy/ScalePlus#right-click-copy" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="dark-mode-toggle">Dark mode:</label>
                                    <input type="checkbox" id="dark-mode-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Apply dark theme to the results grid area <a href="https://github.com/Blake-goofy/ScalePlus#dark-mode" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="bigger-checkboxes-toggle">Bigger checkboxes:</label>
                                    <input type="checkbox" id="bigger-checkboxes-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Enlarge row selection checkboxes for easier clicking <a href="https://github.com/Blake-goofy/ScalePlus#bigger-checkboxes" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="f5-toggle">Custom F5 behavior:</label>
                                    <input type="checkbox" id="f5-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">When enabled, F5 triggers Play/Stop instead of page refresh</span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="env-labels-toggle">Environment labels:</label>
                                    <input type="checkbox" id="env-labels-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Show environment label in navbar <a href="https://github.com/Blake-goofy/ScalePlus#environment-labels" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>

                                <div class="scaleplus-env-names">
                                    <div class="scaleplus-env-setting">
                                        <label for="qa-name">QA Name:</label>
                                        <input type="text" id="qa-name" placeholder="QA ENVIRONMENT">
                                        <input type="text" id="qa-color" placeholder="#d0b132" maxlength="7" class="color-input">
                                        <div id="qa-color-preview" class="color-preview"></div>
                                    </div>
                                    <div class="scaleplus-env-setting">
                                        <label for="prod-name">Prod Name:</label>
                                        <input type="text" id="prod-name" placeholder="PRODUCTION ENVIRONMENT">
                                        <input type="text" id="prod-color" placeholder="#c0392b" maxlength="7" class="color-input">
                                        <div id="prod-color-preview" class="color-preview"></div>
                                    </div>
                                </div>

                                <div class="scaleplus-more-settings-link">
                                    <a href="#" id="scaleplus-show-more">More settings &gt;</a>
                                </div>
                            </div>

                            <!-- More Settings Page (rarely disabled features) -->
                            <div id="scaleplus-more-page" class="scaleplus-settings-page" style="display: none;">
                                <div class="scaleplus-setting">
                                    <label for="search-toggle">Always show search:</label>
                                    <input type="checkbox" id="search-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Automatically show the search pane when the page loads</span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="enter-toggle">Custom enter behavior:</label>
                                    <input type="checkbox" id="enter-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">When enabled, Enter triggers Play/Stop</span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="middle-click-toggle">Enhance middle click:</label>
                                    <input type="checkbox" id="middle-click-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Middle click on grid items to copy text, middle click or Ctrl+click on favorites to open in new tab <a href="https://github.com/Blake-goofy/ScalePlus#right-click-copy" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="adv-criteria-indicator-toggle">Enhance advanced criteria:</label>
                                    <input type="checkbox" id="adv-criteria-indicator-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Show count in header and condition column in advanced criteria grid <a href="https://github.com/Blake-goofy/ScalePlus#advanced-criteria-enhance" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="default-filter-toggle">Enhance favorites:</label>
                                    <input type="checkbox" id="default-filter-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Star defaults + relative date/time favorites & pending-filter tab restore <a href="https://github.com/Blake-goofy/ScalePlus#default-state-management" target="_blank" class="scaleplus-help-link">[?]</a></span>
                                </div>
                                <div class="scaleplus-setting">
                                    <label for="tab-duplicator-toggle">Tab duplicator:</label>
                                    <input type="checkbox" id="tab-duplicator-toggle" data-toggle="toggle" data-on="On" data-off="Off" data-width="100">
                                    <span class="scaleplus-setting-desc">Ctrl+D to duplicate current tab</span>
                                </div>

                                <div class="scaleplus-reset-settings">
                                    <button id="scaleplus-reset-btn" class="btn btn-warning">Reset All Settings to Defaults</button>
                                    <span class="scaleplus-reset-desc">This will reset all toggle switches above to their default values. Your saved favorites and default filters will not be affected.</span>
                                </div>

                                <div class="scaleplus-back-link">
                                    <a href="#" id="scaleplus-show-main">&lt; Back</a>
                                </div>
                            </div>
                        </div>
                    <div class="modal-footer" data-controltype="modalDialogFooter">
                        <button id="scaleplus-close-btn" class="btn btn-default" data-dismiss="modal" data-resourcekey="BTN_CLOSE" data-resourcevalue="Close">Close</button>
                    </div>
                </form>
            </div>
        </div>
        `;
        document.body.appendChild(modal);

        // Add styles
        const style = document.createElement('style');
        style.setAttribute('data-scaleplus-modal', 'true');
        style.textContent = `
            #scaleplus-settings-modal .modal-dialog {
                margin: 50px auto;
                width: 800px;
                max-width: 90vw;
            }
            #scaleplus-settings-modal .modal-content {
                border-radius: 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: none;
            }
            /* Let Scale's native modal-header styles apply */
            #scaleplus-settings-modal .modal-header {
                /* Only override positioning/layout, not colors */
            }
            #scaleplus-settings-modal .modal-header .close {
                /* Let Scale's native close button styles apply */
            }
            #scaleplus-settings-modal .modal-header .modal-title {
                /* Let Scale's native modal-title styles apply */
            }
            #scaleplus-settings-modal .modal-body {
                padding: 20px !important;
                overflow-y: auto !important;
                max-height: calc(100vh - 200px) !important;
            }
            /* Let Scale's native modal-footer styles apply */
            #scaleplus-settings-modal .modal-footer {
                /* Only override layout if needed */
            }
            #scaleplus-settings-modal .modal-footer .btn {
                /* Let Scale's native button styles apply */
            }
            .scaleplus-setting {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            .scaleplus-setting label {
                flex: 1;
                font-weight: bold;
            }
            .scaleplus-setting-desc {
                font-size: 12px;
                flex: 2;
                margin-left: 20px;
                opacity: 0.7;
            }
            .scaleplus-help-link {
                margin-left: 5px;
                text-decoration: none;
                font-size: 14px;
                color: #2563eb !important;
                opacity: 1 !important;
            }
            .scaleplus-help-link:hover {
                color: #1d4ed8 !important;
            }
            .scaleplus-env-names {
                margin-left: 0;
            }
            .scaleplus-env-names .scaleplus-setting {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            .scaleplus-env-names .scaleplus-setting label {
                flex: 1;
                font-weight: bold;
                margin-bottom: 0;
            }
            .scaleplus-env-names input {
                padding: 5px;
                border-radius: 0 !important;
                width: 100%;
                max-width: 300px;
                display: inline-block;
                flex: 2;
            }
            .scaleplus-divider {
                margin: 20px 0;
            }
            .scaleplus-advanced-label {
                font-weight: normal;
                font-size: 12px;
                margin-bottom: 10px;
                text-align: left;
                opacity: 0.7;
            }
            .scaleplus-divider-line {
                border-top: 1px solid currentColor;
                opacity: 0.3;
                margin-bottom: 15px;
            }
            .scaleplus-env-setting {
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }
            .scaleplus-env-setting label {
                font-weight: bold;
                margin-right: 10px;
                min-width: 120px;
                max-width: 200px;
                display: inline-block;
                flex: 0 0 auto;
            }
            .scaleplus-env-setting input {
                padding: 5px;
                border-radius: 0 !important;
                width: 100%;
                max-width: 300px;
                display: inline-block;
                flex: 1 1 auto;
                min-width: 200px;
            }
            .scaleplus-env-setting input.color-input {
                max-width: 100px;
                min-width: 80px;
                flex: 0 0 auto;
                font-family: monospace;
            }
            .scaleplus-env-setting .color-preview {
                width: 30px;
                height: 30px;
                border: 2px solid #999999;
                flex: 0 0 auto;
                transition: background-color 0.2s ease;
            }
            .scaleplus-more-settings-link {
                text-align: right;
                margin-top: 30px;
            }
            .scaleplus-more-settings-link a {
                color: #2563eb;
                text-decoration: none;
                font-size: 14px;
            }
            .scaleplus-more-settings-link a:hover {
                text-decoration: underline;
                color: #1d4ed8;
            }
            .scaleplus-back-link {
                text-align: left;
                margin-top: 30px;
            }
            .scaleplus-back-link a {
                color: #2563eb;
                text-decoration: none;
                font-size: 14px;
            }
            .scaleplus-back-link a:hover {
                text-decoration: underline;
                color: #1d4ed8;
            }
            .scaleplus-settings-page {
                min-height: 300px;
            }
            .scaleplus-reset-settings {
                margin-top: 30px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .scaleplus-reset-settings button {
                flex-shrink: 0;
            }
            .scaleplus-reset-desc {
                font-size: 12px;
                opacity: 0.7;
                flex: 1;
            }
            @media (max-width: 600px) {
                .scaleplus-env-names .scaleplus-setting,
                .scaleplus-env-setting {
                    flex-direction: column;
                    align-items: stretch;
                }
                .scaleplus-env-names .scaleplus-setting label,
                .scaleplus-env-setting label {
                    flex: none;
                    text-align: left;
                }
                .scaleplus-env-names input,
                .scaleplus-env-setting input {
                    flex: none;
                    min-width: 150px;
                }
            }
        `;
        document.head.appendChild(style);

        // Set initial toggle states
        const f5Toggle = modal.querySelector('#f5-toggle');
        const currentF5 = localStorage.getItem(SETTINGS.F5_BEHAVIOR);
        if (currentF5 !== 'false') {
            f5Toggle.checked = true;
        }

        const searchToggle = modal.querySelector('#search-toggle');
        const currentSearch = localStorage.getItem(SETTINGS.SHOW_SEARCH_PANE);
        if (currentSearch !== 'false') {
            searchToggle.checked = true;
        }

        const enterToggle = modal.querySelector('#enter-toggle');
        const currentEnter = localStorage.getItem(SETTINGS.CUSTOM_ENTER);
        if (currentEnter !== 'false') {
            enterToggle.checked = true;
        }

        const middleClickToggle = modal.querySelector('#middle-click-toggle');
        const currentMiddle = localStorage.getItem(SETTINGS.MIDDLE_CLICK);
        if (currentMiddle !== 'false') {
            middleClickToggle.checked = true;
        }

        const rightClickToggle = modal.querySelector('#right-click-toggle');
        const currentRightClick = localStorage.getItem(SETTINGS.RIGHT_CLICK_MENU);
        if (currentRightClick !== 'false') {
            rightClickToggle.checked = true;
        }

        const envLabelsToggle = modal.querySelector('#env-labels-toggle');
        const currentEnv = localStorage.getItem(SETTINGS.ENV_LABELS);
        if (currentEnv === 'true') {
            envLabelsToggle.checked = true;
        }

        const tabDuplicatorToggle = modal.querySelector('#tab-duplicator-toggle');
        const currentTab = localStorage.getItem(SETTINGS.TAB_DUPLICATOR);
        if (currentTab !== 'false') {
            tabDuplicatorToggle.checked = true;
        }

        const defaultFilterToggle = modal.querySelector('#default-filter-toggle');
        const currentDefaultFilter = localStorage.getItem(SETTINGS.DEFAULT_FILTER);
        if (currentDefaultFilter !== 'false') {
            defaultFilterToggle.checked = true;
        }

        const advCriteriaIndicatorToggle = modal.querySelector('#adv-criteria-indicator-toggle');
        const currentAdvCriteriaIndicator = localStorage.getItem(SETTINGS.ADV_CRITERIA_ENHANCEMENT);
        if (currentAdvCriteriaIndicator !== 'false') {
            advCriteriaIndicatorToggle.checked = true;
        }

        const darkModeToggle = modal.querySelector('#dark-mode-toggle');
        const currentDarkMode = localStorage.getItem(SETTINGS.DARK_MODE);
        if (currentDarkMode === 'true') {
            darkModeToggle.checked = true;
        }

        const biggerCheckboxesToggle = modal.querySelector('#bigger-checkboxes-toggle');
        const currentBiggerCheckboxes = localStorage.getItem(SETTINGS.BIGGER_CHECKBOXES);
        if (currentBiggerCheckboxes === 'true') {
            biggerCheckboxesToggle.checked = true;
        }

        const qaNameInput = modal.querySelector('#qa-name');
        const prodNameInput = modal.querySelector('#prod-name');
        const qaColorInput = modal.querySelector('#qa-color');
        const prodColorInput = modal.querySelector('#prod-color');
        const qaColorPreview = modal.querySelector('#qa-color-preview');
        const prodColorPreview = modal.querySelector('#prod-color-preview');

        qaNameInput.value = localStorage.getItem(SETTINGS.ENV_QA_NAME) || DEFAULTS[SETTINGS.ENV_QA_NAME];
        prodNameInput.value = localStorage.getItem(SETTINGS.ENV_PROD_NAME) || DEFAULTS[SETTINGS.ENV_PROD_NAME];
        qaColorInput.value = localStorage.getItem(SETTINGS.ENV_QA_COLOR) || DEFAULTS[SETTINGS.ENV_QA_COLOR];
        prodColorInput.value = localStorage.getItem(SETTINGS.ENV_PROD_COLOR) || DEFAULTS[SETTINGS.ENV_PROD_COLOR];

        // Page navigation handlers
        const mainPage = modal.querySelector('#scaleplus-main-page');
        const morePage = modal.querySelector('#scaleplus-more-page');
        const showMoreLink = modal.querySelector('#scaleplus-show-more');
        const showMainLink = modal.querySelector('#scaleplus-show-main');

        showMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainPage.style.display = 'none';
            morePage.style.display = 'block';
        });

        showMainLink.addEventListener('click', (e) => {
            e.preventDefault();
            morePage.style.display = 'none';
            mainPage.style.display = 'block';
        });

        // Reset settings button handler
        const resetBtn = modal.querySelector('#scaleplus-reset-btn');
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!confirm('Are you sure you want to reset all settings to their defaults? This will NOT affect your saved favorites or default filters.')) {
                return;
            }

            // Clear only the toggle settings from localStorage (not favorites data)
            const settingsKeys = [
                SETTINGS.SHOW_SEARCH_PANE,
                SETTINGS.CUSTOM_ENTER,
                SETTINGS.MIDDLE_CLICK,
                SETTINGS.RIGHT_CLICK_MENU,
                SETTINGS.F5_BEHAVIOR,
                SETTINGS.TAB_DUPLICATOR,
                SETTINGS.DEFAULT_FILTER,
                SETTINGS.ADV_CRITERIA_ENHANCEMENT,
                SETTINGS.DARK_MODE,
                SETTINGS.BIGGER_CHECKBOXES,
                SETTINGS.ENV_LABELS,
                SETTINGS.ENV_QA_NAME,
                SETTINGS.ENV_PROD_NAME,
                SETTINGS.ENV_QA_COLOR,
                SETTINGS.ENV_PROD_COLOR
            ];

            settingsKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            alert('Settings have been reset to defaults. The page will now reload.');
            window.location.reload();
        });

        // Helper function to validate hex color
        const isValidHexColor = (color) => {
            return /^#[0-9A-Fa-f]{6}$/.test(color);
        };

        // Helper function to update color preview and environment label
        const updateColorPreview = (input, preview, isProduction) => {
            const color = input.value.trim();
            if (isValidHexColor(color)) {
                preview.style.backgroundColor = color;
                // Update the actual environment label if it exists
                const envLabel = document.getElementById('scaleplus-env-label');
                const isProd = window.location.hostname === 'scale20.byjasco.com';
                if (envLabel && isProd === isProduction) {
                    envLabel.style.backgroundColor = color;
                    const navBar = document.getElementById('topNavigationBar');
                    if (navBar) {
                        navBar.style.borderBottom = `6px solid ${color}`;
                    }
                }
            } else {
                preview.style.backgroundColor = '#cccccc';
            }
        };

        // Initialize preview colors
        updateColorPreview(qaColorInput, qaColorPreview, false);
        updateColorPreview(prodColorInput, prodColorPreview, true);

        // Handle toggle changes
        $('#search-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.SHOW_SEARCH_PANE, state.toString());
            console.log(`[ScalePlus] Show search pane set to: ${state}`);
        });

        $('#enter-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.CUSTOM_ENTER, state.toString());
            console.log(`[ScalePlus] Custom Enter set to: ${state}`);
        });

        $('#middle-click-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.MIDDLE_CLICK, state.toString());
            console.log(`[ScalePlus] Middle click copy set to: ${state}`);
        });

        $('#right-click-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.RIGHT_CLICK_MENU, state.toString());
            console.log(`[ScalePlus] Right-click menu set to: ${state}`);
        });

        $('#f5-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.F5_BEHAVIOR, state.toString());
            console.log(`[ScalePlus] F5 behavior set to: ${state}`);
        });

        $('#env-labels-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.ENV_LABELS, state.toString());
            console.log(`[ScalePlus] Environment labels set to: ${state}`);
            
            // Apply or remove environment label immediately
            if (state) {
                // Add the label if it doesn't exist
                if (window.ScalePlusEnvironmentLabels && window.ScalePlusEnvironmentLabels.addEnvironmentLabel) {
                    window.ScalePlusEnvironmentLabels.addEnvironmentLabel();
                }
            } else {
                // Remove the label if it exists
                if (window.ScalePlusEnvironmentLabels && window.ScalePlusEnvironmentLabels.removeEnvironmentLabel) {
                    window.ScalePlusEnvironmentLabels.removeEnvironmentLabel();
                }
            }
        });

        $('#tab-duplicator-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.TAB_DUPLICATOR, state.toString());
            console.log(`[ScalePlus] Tab duplicator set to: ${state}`);
        });

        $('#default-filter-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.DEFAULT_FILTER, state.toString());
            console.log(`[ScalePlus] Default filter set to: ${state}`);
            // Call favorites module's update function if available
            if (window.ScalePlusFavorites && window.ScalePlusFavorites.updateFavoritesStarIcon) {
                window.ScalePlusFavorites.updateFavoritesStarIcon();
            }
        });

        $('#dark-mode-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.DARK_MODE, state.toString());
            console.log(`[ScalePlus] Dark mode set to: ${state}`);
            
            // Apply or remove dark mode immediately
            if (state) {
                if (window.ScalePlusDarkMode && window.ScalePlusDarkMode.applyDarkMode) {
                    window.ScalePlusDarkMode.applyDarkMode();
                } else {
                    document.body.classList.add('scaleplus-dark-mode');
                }
            } else {
                if (window.ScalePlusDarkMode && window.ScalePlusDarkMode.removeDarkMode) {
                    window.ScalePlusDarkMode.removeDarkMode();
                } else {
                    document.body.classList.remove('scaleplus-dark-mode');
                }
            }
        });

        $('#bigger-checkboxes-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.BIGGER_CHECKBOXES, state.toString());
            console.log(`[ScalePlus] Bigger checkboxes set to: ${state}`);
            
            // Apply or remove bigger checkboxes immediately
            if (state) {
                if (window.ScalePlusCheckboxSize && window.ScalePlusCheckboxSize.applyCheckboxSize) {
                    window.ScalePlusCheckboxSize.applyCheckboxSize();
                } else {
                    document.body.classList.add('scaleplus-bigger-checkboxes');
                }
            } else {
                document.body.classList.remove('scaleplus-bigger-checkboxes');
            }
        });

        $('#adv-criteria-indicator-toggle').on('change', function(event) {
            const state = this.checked;
            localStorage.setItem(SETTINGS.ADV_CRITERIA_ENHANCEMENT, state.toString());
            console.log(`[ScalePlus] Advanced criteria enhancement set to: ${state}`);

            // Update the counter immediately when toggled
            if (state && window.ScalePlusAdvancedCriteria && window.ScalePlusAdvancedCriteria.updateAdvancedCriteriaCount) {
                window.ScalePlusAdvancedCriteria.updateAdvancedCriteriaCount();
            } else {
                // Reset to original text when disabled
                const headers = document.querySelectorAll('h3.ui-accordion-header');
                headers.forEach(header => {
                    const link = header.querySelector('a[data-resourcekey="ADVANCEDCRITERIA"]');
                    if (link) {
                        const baseText = link.getAttribute('data-resourcevalue') || 'Advanced criteria';
                        link.textContent = baseText;
                    }
                });
            }

            // Update grid columns immediately
            setTimeout(() => {
                const $grid = $('#SearchPaneAdvCritAdvCritGrid');
                if ($grid.length && $grid.data('igGrid')) {
                    try {
                        const columns = $grid.igGrid('option', 'columns');
                        const conditionColumn = columns.find(col => col.key === 'Condition');
                        if (conditionColumn) {
                            conditionColumn.hidden = !state;
                            if (state) {
                                conditionColumn.headerText = 'Condition';
                                conditionColumn.width = '15%';
                                // Adjust other columns when showing condition
                                const fieldColumn = columns.find(col => col.key === 'Field');
                                const operandColumn = columns.find(col => col.key === 'Operand');
                                const valueColumn = columns.find(col => col.key === 'Value');
                                if (fieldColumn) fieldColumn.width = '30%';
                                if (operandColumn) operandColumn.width = '15%';
                                if (valueColumn) valueColumn.width = '30%';
                            } else {
                                // Reset to original widths when hiding condition
                                const fieldColumn = columns.find(col => col.key === 'Field');
                                const operandColumn = columns.find(col => col.key === 'Operand');
                                const valueColumn = columns.find(col => col.key === 'Value');
                                if (fieldColumn) fieldColumn.width = '40%';
                                if (operandColumn) operandColumn.width = '20%';
                                if (valueColumn) valueColumn.width = '40%';
                            }
                            $grid.igGrid('option', 'columns', columns);
                            $grid.igGrid('dataBind');
                        }
                    } catch (err) {
                        console.warn('[ScalePlus] Could not update grid columns on toggle:', err);
                    }
                }
            }, 100);
        });

        qaNameInput.addEventListener('input', () => {
            localStorage.setItem(SETTINGS.ENV_QA_NAME, qaNameInput.value);
        });

        prodNameInput.addEventListener('input', () => {
            localStorage.setItem(SETTINGS.ENV_PROD_NAME, prodNameInput.value);
        });

        qaColorInput.addEventListener('input', () => {
            const color = qaColorInput.value.trim();
            localStorage.setItem(SETTINGS.ENV_QA_COLOR, color);
            updateColorPreview(qaColorInput, qaColorPreview, false);
        });

        prodColorInput.addEventListener('input', () => {
            const color = prodColorInput.value.trim();
            localStorage.setItem(SETTINGS.ENV_PROD_COLOR, color);
            updateColorPreview(prodColorInput, prodColorPreview, true);
        });

        // Initialize bootstrap toggles
        $('#search-toggle, #enter-toggle, #middle-click-toggle, #right-click-toggle, #f5-toggle, #tab-duplicator-toggle, #default-filter-toggle, #env-labels-toggle, #adv-criteria-indicator-toggle, #dark-mode-toggle, #bigger-checkboxes-toggle').bootstrapToggle();

        // Set initial states explicitly
        $(searchToggle).bootstrapToggle(searchToggle.checked ? 'on' : 'off');
        $(enterToggle).bootstrapToggle(enterToggle.checked ? 'on' : 'off');
        $(middleClickToggle).bootstrapToggle(middleClickToggle.checked ? 'on' : 'off');
        $(rightClickToggle).bootstrapToggle(rightClickToggle.checked ? 'on' : 'off');
        $(f5Toggle).bootstrapToggle(f5Toggle.checked ? 'on' : 'off');
        $(envLabelsToggle).bootstrapToggle(envLabelsToggle.checked ? 'on' : 'off');
        $(tabDuplicatorToggle).bootstrapToggle(tabDuplicatorToggle.checked ? 'on' : 'off');
        $(defaultFilterToggle).bootstrapToggle(defaultFilterToggle.checked ? 'on' : 'off');
        $(advCriteriaIndicatorToggle).bootstrapToggle(advCriteriaIndicatorToggle.checked ? 'on' : 'off');
        $(darkModeToggle).bootstrapToggle(darkModeToggle.checked ? 'on' : 'off');
    };

    const addScalePlusSettingsButton = () => {
        // Find the ConfigureWorkStation button to insert our button near it
        const configureButton = document.getElementById('ConfigureWorkStation');
        
        if (!configureButton) {
            console.log('[ScalePlus Settings UI] ConfigureWorkStation button not found yet, will retry');
            return false;
        }
        
        // Check if we already added our button
        if (document.getElementById('ScalePlusSettings')) {
            console.log('[ScalePlus Settings UI] ScalePlus Settings button already exists, skipping');
            return true;
        }
        
        console.log('[ScalePlus Settings UI] Adding ScalePlus Settings button');
        
        // Find the parent list item
        const configureListItem = configureButton.closest('li');
        if (!configureListItem) {
            console.log('[ScalePlus Settings UI] Could not find parent list item, will retry');
            return false;
        }
        
        // Create new button in the same style as Configure Workstation
        const scalePlusListItem = document.createElement('li');
        scalePlusListItem.innerHTML = `
            <a id="ScalePlusSettings" 
               data-resourcekey="SCALEPLUSSETTINGS" 
               data-resourcevalue="ScalePlus Settings" 
               href="#" 
               data-scaleplus-settings="true">
                ScalePlus Settings
            </a>
        `;
        
        // Insert before the Configure Workstation button
        configureListItem.parentNode.insertBefore(scalePlusListItem, configureListItem);
        
        // Add click handler to open our modal
        const scalePlusButton = document.getElementById('ScalePlusSettings');
        scalePlusButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[ScalePlus Settings UI] Opening ScalePlus settings modal');
            
            const existingModal = document.getElementById('scaleplus-settings-modal');
            if (existingModal) {
                existingModal.remove();
                const existingStyle = document.querySelector('style[data-scaleplus-modal]');
                if (existingStyle) existingStyle.remove();
            }
            createSettingsModal();
            $('#scaleplus-settings-modal').modal('show');
            
            return false;
        });
        
        console.log('[ScalePlus Settings UI] ScalePlus Settings button added successfully');
        return true;
    };

    const init = () => {
        console.log('[ScalePlus Settings UI] Initializing...');
        console.log('[ScalePlus Settings UI] Document ready state:', document.readyState);
        
        // Wait for the page to be ready
        if (document.readyState === 'loading') {
            console.log('[ScalePlus Settings UI] Waiting for DOMContentLoaded...');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('[ScalePlus Settings UI] DOMContentLoaded fired');
                addScalePlusSettingsButton();
            });
        } else {
            console.log('[ScalePlus Settings UI] Document already ready, trying immediately');
            addScalePlusSettingsButton();
        }
        
        // Also watch for the button to appear dynamically
        console.log('[ScalePlus Settings UI] Setting up MutationObserver to watch for button');
        const observer = new MutationObserver((mutations) => {
            const configureButton = document.getElementById('ConfigureWorkStation');
            const scalePlusButton = document.getElementById('ScalePlusSettings');
            if (configureButton && !scalePlusButton) {
                console.log('[ScalePlus Settings UI] ConfigureWorkStation button appeared, adding ScalePlus button');
                addScalePlusSettingsButton();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    // Export module
    window.ScalePlusSettingsUI = {
        init,
        createSettingsModal,
        addScalePlusSettingsButton
    };

    console.log('[ScalePlus Settings UI] Module loaded');
    
    // Initialize the module
    window.ScalePlusSettingsUI.init();
})();
