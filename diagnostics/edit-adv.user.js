// ==UserScript==
// @name         ScalePlus Advanced Criteria Context Menu Test
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Test script for advanced criteria right-click context menu
// @author       Blake
// @match        https://scaleqa.byjasco.com/*
// @match        https://scale20.byjasco.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[ScalePlus AdvCrit Context Menu Test] Starting...');

    class AdvCritContextMenu {
        constructor() {
            this.menu = null;
            this.currentTarget = null;
        }

        init() {
            console.log('[ScalePlus AdvCrit Context Menu Test] Initializing...');
            this.injectStyles();
            this.createMenu();
            this.attachGlobalHandlers();
            this.attachRightClickHandlers();
            console.log('[ScalePlus AdvCrit Context Menu Test] Initialized!');
        }

        injectStyles() {
            if (document.getElementById('advcrit-context-menu-styles')) return;

            const contextMenuStyles = `
                .advcrit-context-menu {
                    position: fixed;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    z-index: 100000;
                    min-width: 150px;
                    padding: 4px 0;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    pointer-events: auto;
                }
                .advcrit-context-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    cursor: pointer;
                    color: #333;
                    text-decoration: none;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    font-size: 14px;
                }
                .advcrit-context-menu-item:hover {
                    background-color: #f5f5f5;
                }
                .advcrit-context-menu-item:active {
                    background-color: #e8e8e8;
                }
                .advcrit-context-menu-item.disabled {
                    color: #999;
                    cursor: not-allowed;
                }
                .advcrit-context-menu-item.disabled:hover {
                    background-color: transparent;
                }
                .advcrit-context-menu-icon {
                    margin-right: 8px;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                .advcrit-context-menu-separator {
                    height: 1px;
                    background-color: #e0e0e0;
                    margin: 4px 0;
                }
                
                /* Dark mode styles for context menu */
                body.scaleplus-dark-mode .advcrit-context-menu {
                    background: #2a2a2a !important;
                    border: 1px solid #3a3a3a !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-item {
                    color: #e0e0e0 !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-item:hover {
                    background-color: #3a3a3a !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-item:active {
                    background-color: #4a4a4a !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-item.disabled {
                    color: #666 !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-item.disabled:hover {
                    background-color: transparent !important;
                }
                body.scaleplus-dark-mode .advcrit-context-menu-separator {
                    background-color: #3a3a3a !important;
                }
                
                /* Highlight for right-clicked row */
                #SearchPaneAdvCritAdvCritGrid tr.advcrit-context-highlight td {
                    box-shadow: inset 0 0 0 2px #4f93e4 !important;
                    background-color: rgba(79, 147, 228, 0.2) !important;
                    position: relative !important;
                }
                
                /* Dark mode highlight */
                body.scaleplus-dark-mode #SearchPaneAdvCritAdvCritGrid tr.advcrit-context-highlight td {
                    box-shadow: inset 0 0 0 2px #5ba3e0 !important;
                    background-color: rgba(91, 163, 224, 0.25) !important;
                }
            `;

            const style = document.createElement('style');
            style.id = 'advcrit-context-menu-styles';
            style.textContent = contextMenuStyles;
            document.head.appendChild(style);
            console.log('[ScalePlus AdvCrit Context Menu Test] Styles injected');
        }

        createMenu() {
            this.menu = document.createElement('div');
            this.menu.className = 'advcrit-context-menu';
            this.menu.style.display = 'none';
            document.body.appendChild(this.menu);
            console.log('[ScalePlus AdvCrit Context Menu Test] Menu created');
        }

        attachGlobalHandlers() {
            document.addEventListener('click', (e) => {
                if (!this.menu.contains(e.target)) {
                    this.hide();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                }
            });

            this.menu.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            console.log('[ScalePlus AdvCrit Context Menu Test] Global handlers attached');
        }

        show(x, y, items, target = null) {
            this.currentTarget = target;
            this.menu.innerHTML = '';

            items.forEach(item => {
                if (item.separator) {
                    const separator = document.createElement('div');
                    separator.className = 'advcrit-context-menu-separator';
                    this.menu.appendChild(separator);
                    return;
                }

                const menuItem = document.createElement('button');
                menuItem.className = 'advcrit-context-menu-item';
                if (item.disabled) {
                    menuItem.classList.add('disabled');
                }

                if (item.icon) {
                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'advcrit-context-menu-icon';
                    if (item.icon.includes(' ')) {
                        iconSpan.innerHTML = `<i class="${item.icon}"></i>`;
                    } else if (item.icon.startsWith('fa-')) {
                        iconSpan.innerHTML = `<i class="fa ${item.icon}"></i>`;
                    } else if (item.icon.startsWith('glyphicon-')) {
                        iconSpan.innerHTML = `<span class="glyphicon ${item.icon}"></span>`;
                    } else {
                        iconSpan.textContent = item.icon;
                    }
                    menuItem.appendChild(iconSpan);
                }

                const textSpan = document.createElement('span');
                textSpan.textContent = item.label;
                menuItem.appendChild(textSpan);

                if (!item.disabled && item.action) {
                    menuItem.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.action(this.currentTarget);
                        this.hide();
                    });
                }

                this.menu.appendChild(menuItem);
            });

            const menuX = Math.max(10, Math.min(x, window.innerWidth - 200));
            const menuY = Math.max(10, Math.min(y, window.innerHeight - 100));

            this.menu.style.left = `${menuX}px`;
            this.menu.style.top = `${menuY}px`;
            this.menu.style.display = 'block';

            this.menu.offsetHeight;

            const rect = this.menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (rect.right > viewportWidth) {
                this.menu.style.left = `${Math.max(10, viewportWidth - rect.width - 10)}px`;
            }
            if (rect.bottom > viewportHeight) {
                this.menu.style.top = `${Math.max(10, viewportHeight - rect.height - 10)}px`;
            }
        }

        hide() {
            if (this.menu) {
                this.menu.style.display = 'none';
            }
            this.removeHighlight();
            this.currentTarget = null;
        }

        removeHighlight() {
            const highlighted = document.querySelectorAll('.advcrit-context-highlight');
            highlighted.forEach(el => el.classList.remove('advcrit-context-highlight'));
        }

        highlightRow(row) {
            this.removeHighlight();
            if (row) {
                row.classList.add('advcrit-context-highlight');
            }
        }

        handleAdvCritRightClick(e) {
            if (e.button !== 2) return;

            // Find the row that was right-clicked
            let row = e.target;
            while (row && row.tagName !== 'TR') {
                row = row.parentElement;
            }

            // Check if this is a row in the advanced criteria grid
            if (!row || !row.getAttribute('data-id')) {
                return;
            }

            // Check if the row is inside the advanced criteria grid
            const grid = row.closest('#SearchPaneAdvCritAdvCritGrid');
            if (!grid) {
                return;
            }

            console.log('[ScalePlus AdvCrit Context Menu Test] Right-clicked row:', row);
            console.log('[ScalePlus AdvCrit Context Menu Test] Row data-id:', row.getAttribute('data-id'));

            e.preventDefault();
            e.stopPropagation();

            // Highlight the row
            this.highlightRow(row);

            const menuItems = [
                {
                    label: 'Edit',
                    icon: 'fas fa-pencil-alt',
                    action: (target) => {
                        console.log('[ScalePlus AdvCrit Context Menu Test] Edit clicked for row:', target);
                        this.editRow(target);
                    }
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    action: (target) => {
                        console.log('[ScalePlus AdvCrit Context Menu Test] Delete clicked for row:', target);
                        this.deleteRow(target);
                    }
                }
            ];

            this.show(e.pageX, e.pageY, menuItems, row);
        }

        extractRowData(row) {
            if (!row) return null;

            const cells = row.querySelectorAll('td[role="gridcell"]');
            if (cells.length < 4) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Row does not have enough cells');
                return null;
            }

            const data = {
                condition: cells[0].textContent.trim(),
                field: cells[1].textContent.trim(),
                operand: cells[2].textContent.trim(),
                value: cells[3].textContent.trim(),
                rowId: row.getAttribute('data-id')
            };

            console.log('[ScalePlus AdvCrit Context Menu Test] Extracted row data:', data);
            return data;
        }

        async editRow(row) {
            if (!row) {
                console.error('[ScalePlus AdvCrit Context Menu Test] No row to edit');
                return;
            }

            // Extract the row data
            const rowData = this.extractRowData(row);
            if (!rowData) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Could not extract row data');
                return;
            }

            console.log('[ScalePlus AdvCrit Context Menu Test] Starting edit process for:', rowData);

            // Step 1: Click the Add button to open the form
            const addButton = document.querySelector('#SearchPaneAdvCrit_AddButton');
            if (!addButton) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Could not find Add button');
                return;
            }

            console.log('[ScalePlus AdvCrit Context Menu Test] Clicking Add button...');
            addButton.click();

            // Wait for the form to appear
            await this.waitForElement('#SearchPaneAdvCrit_Field', 2000);

            // Step 2: Set Condition (always set it, as it retains the last used value)
            console.log('[ScalePlus AdvCrit Context Menu Test] Setting condition to:', rowData.condition);
            await this.setComboValue('#SearchPaneAdvCrit_FilterCond', rowData.condition);

            // No fixed delay - setComboValue already waits for value to be set

            // Step 3: Set Field
            console.log('[ScalePlus AdvCrit Context Menu Test] Setting field to:', rowData.field);
            await this.setComboValue('#SearchPaneAdvCrit_Field', rowData.field);

            // Wait for the Operand combo to be enabled (already has fast polling)
            console.log('[ScalePlus AdvCrit Context Menu Test] Waiting for Operand combo to be enabled...');
            await this.waitForComboEnabled('#SearchPaneAdvCrit_Operand', 3000);
            console.log('[ScalePlus AdvCrit Context Menu Test] Operand combo is now enabled');

            // Step 4: Set Operand
            console.log('[ScalePlus AdvCrit Context Menu Test] Setting operand to:', rowData.operand);
            await this.setComboValue('#SearchPaneAdvCrit_Operand', rowData.operand);

            // No fixed delay - setComboValue already waits for value to be set

            // Step 5: Set Value (if needed and field is visible/enabled)
            // Wait for value field to stabilize after operand selection
            let valueField = null;
            const valueFieldStart = Date.now();
            while (Date.now() - valueFieldStart < 1000) {
                valueField = document.querySelector('#SearchPaneAdvCrit_Value');
                if (valueField && !valueField.disabled) {
                    // Field is ready
                    break;
                }
                await this.sleep(50);
            }
            
            if (valueField && !valueField.disabled && rowData.value) {
                console.log('[ScalePlus AdvCrit Context Menu Test] Setting value to:', rowData.value);
                await this.setTextEditorValue('#SearchPaneAdvCrit_Value', rowData.value);
                await this.sleep(50); // Small delay for value to register
                
                // Focus the value field and move cursor to end
                const valueInput = document.querySelector('#SearchPaneAdvCrit_Value');
                if (valueInput) {
                    valueInput.focus();
                    // Move cursor to end of text
                    if (valueInput.setSelectionRange) {
                        const len = valueInput.value.length;
                        valueInput.setSelectionRange(len, len);
                    }
                    console.log('[ScalePlus AdvCrit Context Menu Test] Focus set to value field');
                }
            } else {
                console.log('[ScalePlus AdvCrit Context Menu Test] Value field not needed or disabled');
            }

            // Step 6: Enable Save button and bind custom behavior to delete the original row when clicked
            const saveButton = document.querySelector('#SearchPaneAdvCrit_SaveButton');
            if (saveButton) {
                console.log('[ScalePlus AdvCrit Context Menu Test] Force-enabling Save button...');
                
                // Remove disabled attribute and property
                saveButton.removeAttribute('disabled');
                saveButton.disabled = false;
                
                console.log('[ScalePlus AdvCrit Context Menu Test] Save button enabled. Binding delete behavior...');
                
                // Bind a one-time event listener to delete the original row when Save is clicked
                const deleteOriginalRow = () => {
                    console.log('[ScalePlus AdvCrit Context Menu Test] Save clicked, deleting original row...');
                    // Wait a moment for the save to complete and new row to be added
                    setTimeout(() => {
                        this.deleteRow(row);
                    }, 500);
                    
                    // Remove this listener after it fires once
                    saveButton.removeEventListener('click', deleteOriginalRow);
                };
                
                saveButton.addEventListener('click', deleteOriginalRow);
                
                console.log('[ScalePlus AdvCrit Context Menu Test] Edit form ready - user can now modify and click Save');
            } else {
                console.error('[ScalePlus AdvCrit Context Menu Test] Save button not found');
            }
        }

        waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const checkInterval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(checkInterval);
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        reject(new Error(`Timeout waiting for element: ${selector}`));
                    }
                }, 100);
            });
        }

        waitForComboEnabled(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const checkInterval = setInterval(() => {
                    const wrapper = document.querySelector(selector);
                    if (wrapper) {
                        const hasDisabledClass = wrapper.classList.contains('ui-igCombo-disabled') || 
                                                 wrapper.classList.contains('ui-state-disabled');
                        const hasDisabledAttr = wrapper.hasAttribute('aria-disabled') && 
                                                wrapper.getAttribute('aria-disabled') === 'true';
                        const inputDisabled = wrapper.querySelector('input[disabled]') !== null;
                        
                        const isEnabled = !hasDisabledClass && !hasDisabledAttr && !inputDisabled;
                        
                        if (isEnabled) {
                            console.log('[ScalePlus AdvCrit Context Menu Test] Combo is now enabled:', selector);
                            clearInterval(checkInterval);
                            resolve(wrapper);
                        } else {
                            // Log periodically to show we're checking
                            if ((Date.now() - startTime) % 1000 < 150) {
                                console.log('[ScalePlus AdvCrit Context Menu Test] Still waiting... disabled class:', hasDisabledClass, 
                                           'disabled attr:', hasDisabledAttr, 'input disabled:', inputDisabled);
                            }
                        }
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        console.error('[ScalePlus AdvCrit Context Menu Test] Timeout - combo never became enabled:', selector);
                        const wrapper = document.querySelector(selector);
                        if (wrapper) {
                            console.log('[ScalePlus AdvCrit Context Menu Test] Final state:', {
                                classes: wrapper.className,
                                ariaDisabled: wrapper.getAttribute('aria-disabled'),
                                hasDisabledInput: wrapper.querySelector('input[disabled]') !== null
                            });
                        }
                        reject(new Error(`Timeout waiting for combo to be enabled: ${selector}`));
                    }
                }, 100);
            });
        }

        waitForSaveButtonEnabled(selector, timeout = 3000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const checkInterval = setInterval(() => {
                    const button = document.querySelector(selector);
                    if (button && !button.disabled && !button.hasAttribute('disabled')) {
                        console.log('[ScalePlus AdvCrit Context Menu Test] Save button is now enabled');
                        clearInterval(checkInterval);
                        resolve(button);
                    } else {
                        // Log periodically
                        if ((Date.now() - startTime) % 500 < 150) {
                            console.log('[ScalePlus AdvCrit Context Menu Test] Still waiting for Save button... disabled:', 
                                       button ? button.disabled : 'button not found');
                        }
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        console.error('[ScalePlus AdvCrit Context Menu Test] Timeout - Save button never became enabled');
                        const button = document.querySelector(selector);
                        if (button) {
                            console.log('[ScalePlus AdvCrit Context Menu Test] Final button state:', {
                                disabled: button.disabled,
                                hasDisabledAttr: button.hasAttribute('disabled'),
                                className: button.className
                            });
                        }
                        reject(new Error(`Timeout waiting for Save button to be enabled: ${selector}`));
                    }
                }, 100);
            });
        }

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Wait for a combo value to be set correctly
         * @param {jQuery} combo - The combo element
         * @param {string} expectedIdentifier - The expected identifier value
         * @param {number} timeout - Max time to wait in ms
         */
        async waitForComboValue(combo, expectedIdentifier, timeout = 2000) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const currentValue = combo.igCombo('value');
                
                // Check if value is set correctly (handle both string and array returns)
                if (currentValue === expectedIdentifier || 
                    (Array.isArray(currentValue) && currentValue.length > 0 && currentValue[0] === expectedIdentifier)) {
                    return true;
                }
                
                // Fast retry - check every 50ms
                await this.sleep(50);
            }
            return false;
        }

        /**
         * Wait for combo dropdown to show filtered results
         * @param {jQuery} combo - The combo element
         * @param {number} timeout - Max time to wait in ms
         */
        async waitForDropdownFiltered(combo, timeout = 1000) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                try {
                    // Check if dropdown is visible and has items
                    const dropdownList = combo.igCombo('listItems');
                    if (dropdownList && dropdownList.length > 0) {
                        return true;
                    }
                } catch (e) {
                    // Ignore errors during polling
                }
                
                // Fast retry - check every 30ms
                await this.sleep(30);
            }
            return false;
        }

        async setComboValue(selector, value) {
            const combo = $(selector);
            if (!combo.length) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Combo not found:', selector);
                return;
            }

            console.log('[ScalePlus AdvCrit Context Menu Test] Setting combo value:', selector, value);
            
            // The Field combo doesn't respond well to select(), so use typing method for it
            const isFieldCombo = selector.includes('_Field');

            try {
                // Get the combo data
                const comboData = combo.data('igCombo');
                if (!comboData) {
                    console.error('[ScalePlus AdvCrit Context Menu Test] Combo data not found for:', selector);
                    return;
                }

                console.log('[ScalePlus AdvCrit Context Menu Test] Looking for value:', value);

                // Try to get data using the igCombo API methods
                let dataSource = null;
                let dataArray = [];

                // Try different ways to access the data
                if (comboData.options.dataSource) {
                    dataSource = comboData.options.dataSource;
                    
                    // Check if it's already an array
                    if (Array.isArray(dataSource)) {
                        dataArray = dataSource;
                    }
                    // Check if it has a data() method (Infragistics DataSource)
                    else if (typeof dataSource.data === 'function') {
                        dataArray = dataSource.data();
                    }
                    // Check if it has a dataView property
                    else if (dataSource.dataView && Array.isArray(dataSource.dataView)) {
                        dataArray = dataSource.dataView;
                    }
                    // Check if it has a _data property
                    else if (dataSource._data && Array.isArray(dataSource._data)) {
                        dataArray = dataSource._data;
                    }
                }

                // Try using the combo's data() method
                if (dataArray.length === 0 && typeof combo.igCombo === 'function') {
                    try {
                        const allData = combo.igCombo('dataBind');
                        if (allData && Array.isArray(allData)) {
                            dataArray = allData;
                        }
                    } catch (e) {
                        console.log('[ScalePlus AdvCrit Context Menu Test] Could not get data via dataBind');
                    }
                }

                console.log('[ScalePlus AdvCrit Context Menu Test] DataArray length:', dataArray.length);
                if (dataArray.length > 0) {
                    console.log('[ScalePlus AdvCrit Context Menu Test] First item sample:', dataArray[0]);
                }

                // Find the item in the data source that matches our value
                let item = null;
                let partialMatch = null; // Store partial match as fallback
                
                for (let i = 0; i < dataArray.length; i++) {
                    const dsItem = dataArray[i];
                    
                    // 1. Exact match (highest priority)
                    if (dsItem.DisplayText === value || 
                        dsItem.Description === value ||
                        dsItem.Identifier === value) {
                        item = dsItem;
                        break;
                    }
                    
                    // 2. Pattern match for condition codes - "OR" matches "Any are met (OR)"
                    if (dsItem.DisplayText && dsItem.DisplayText.includes(`(${value})`) ||
                        dsItem.Description && dsItem.Description.includes(`(${value})`)) {
                        item = dsItem;
                        break;
                    }
                    
                    // 3. Case-insensitive contains - but only store as partial match (lowest priority)
                    if (!partialMatch) {
                        const valueLower = value.toLowerCase();
                        const displayLower = (dsItem.DisplayText || '').toLowerCase();
                        const descLower = (dsItem.Description || '').toLowerCase();
                        
                        // For operators, only match if the display text equals the value (avoids "=" matching "!=")
                        if (value.length <= 2 && (value === '=' || value === '!=' || value === '<' || value === '>' || value === '<=' || value === '>=')) {
                            if (displayLower === valueLower || descLower === valueLower) {
                                partialMatch = dsItem;
                            }
                        } else if (displayLower.includes(valueLower) || descLower.includes(valueLower)) {
                            partialMatch = dsItem;
                        }
                    }
                }
                
                // Use partial match only if no exact match found
                if (!item && partialMatch) {
                    item = partialMatch;
                }

                if (item) {
                    console.log('[ScalePlus AdvCrit Context Menu Test] Found matching item:', item);
                    
                    // Find the index of the item in the dataArray
                    let itemIndex = -1;
                    for (let i = 0; i < dataArray.length; i++) {
                        if (dataArray[i].Identifier === item.Identifier) {
                            itemIndex = i;
                            break;
                        }
                    }
                    console.log('[ScalePlus AdvCrit Context Menu Test] Item index:', itemIndex);
                    
                    // Use typing method for all combos - more reliable and avoids animation timing issues
                    try {
                        console.log('[ScalePlus AdvCrit Context Menu Test] Using typing method...');
                        
                        // Get the input field
                        const inputField = combo.parent().find('input.ui-igcombo-field')[0];
                        if (inputField) {
                            // Focus the input
                            inputField.focus();
                            await this.sleep(30);
                            
                            // Clear and set value
                            inputField.value = '';
                            inputField.value = item.DisplayText;
                            
                            // Trigger input event
                            inputField.dispatchEvent(new Event('input', { bubbles: true }));
                            inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                            
                            // Wait for dropdown to show filtered results (smart polling)
                            const dropdownReady = await this.waitForDropdownFiltered(combo, 1000);
                            if (dropdownReady) {
                                console.log('[ScalePlus AdvCrit Context Menu Test] Dropdown filtered and ready');
                                // Give it extra time to fully render
                                await this.sleep(150);
                            } else {
                                console.warn('[ScalePlus AdvCrit Context Menu Test] Dropdown may not be ready, proceeding anyway');
                                await this.sleep(200);
                            }
                            
                            // Ensure input still has focus before pressing Enter
                            inputField.focus();
                            await this.sleep(50);
                            
                            // Press Enter to select - must bubble for igCombo to handle it
                            const enterKeyDown = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            inputField.dispatchEvent(enterKeyDown);
                            
                            const enterKeyPress = new KeyboardEvent('keypress', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            inputField.dispatchEvent(enterKeyPress);
                            
                            const enterKeyUp = new KeyboardEvent('keyup', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            inputField.dispatchEvent(enterKeyUp);
                            
                            // Give Enter more time to be processed
                            await this.sleep(150);
                            
                            // Wait for the value to be set (fast polling)
                            const valueSet = await this.waitForComboValue(combo, item.Identifier, 1500);
                            if (valueSet) {
                                console.log('[ScalePlus AdvCrit Context Menu Test] Value set successfully:', combo.igCombo('value'));
                            } else {
                                console.warn('[ScalePlus AdvCrit Context Menu Test] Value may not be set correctly:', combo.igCombo('value'));
                            }
                        } else {
                            console.error('[ScalePlus AdvCrit Context Menu Test] Could not find input field');
                        }
                    } catch (err) {
                        console.error('[ScalePlus AdvCrit Context Menu Test] Error in typing method:', err);
                        
                        // Ultimate fallback - direct value setting
                        console.log('[ScalePlus AdvCrit Context Menu Test] Falling back to direct value setting');
                        combo.igCombo('closeDropDown');
                        await this.sleep(100);
                        
                        combo.igCombo('text', item.DisplayText);
                        await this.sleep(100);
                        combo.igCombo('value', item.Identifier);
                        await this.sleep(200);
                        
                        // Try to manually trigger the event
                        const ui = {
                            owner: combo,
                            items: [item],
                            oldItems: [],
                            value: item.Identifier,
                            text: item.DisplayText
                        };
                        combo.trigger('igcomboselectionchanged', ui);
                    }
                } else {
                    console.error('[ScalePlus AdvCrit Context Menu Test] Could not find item matching:', value);
                    console.log('[ScalePlus AdvCrit Context Menu Test] Available items (first 5):', 
                        dataArray.slice(0, 5).map(i => ({
                            DisplayText: i.DisplayText, 
                            Identifier: i.Identifier
                        }))
                    );
                }
            } catch (err) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Error setting combo value:', err);
            }
        }

        async setTextEditorValue(selector, value) {
            const editor = $(selector);
            if (!editor.length) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Text editor not found:', selector);
                return;
            }

            try {
                const editorData = editor.data('igTextEditor');
                if (editorData) {
                    editor.igTextEditor('value', value);
                } else {
                    // Fallback to direct input manipulation
                    editor.val(value);
                    editor.trigger('change');
                }
            } catch (err) {
                console.error('[ScalePlus AdvCrit Context Menu Test] Error setting text editor value:', err);
            }
        }

        deleteRow(row) {
            if (!row) {
                console.error('[ScalePlus AdvCrit Context Menu Test] No row to delete');
                return;
            }

            console.log('[ScalePlus AdvCrit Context Menu Test] Attempting to delete row:', row);

            // Find the delete button and click it
            // The delete button appears on hover, so we need to trigger the hover state first
            const deleteButton = document.querySelector('#SearchPaneAdvCritAdvCritGrid_updating_deletehover');
            
            if (deleteButton) {
                console.log('[ScalePlus AdvCrit Context Menu Test] Found delete button, clicking...');
                
                // First, we need to make sure the row is selected/focused
                // Try to find a cell in the row and click it to select the row
                const firstCell = row.querySelector('td[role="gridcell"]');
                if (firstCell) {
                    firstCell.click();
                    
                    // Wait a moment for the grid to register the selection
                    setTimeout(() => {
                        // Now try to click the delete button
                        const deleteIcon = deleteButton.querySelector('.ui-iggrid-deleteicon');
                        if (deleteIcon) {
                            deleteIcon.click();
                            console.log('[ScalePlus AdvCrit Context Menu Test] Clicked delete icon');
                        } else {
                            deleteButton.click();
                            console.log('[ScalePlus AdvCrit Context Menu Test] Clicked delete button');
                        }
                    }, 100);
                }
            } else {
                console.error('[ScalePlus AdvCrit Context Menu Test] Could not find delete button');
                
                // Alternative approach: try to trigger the row's delete through jQuery if available
                if (window.$ && typeof $.ig !== 'undefined') {
                    try {
                        const rowId = row.getAttribute('data-id');
                        console.log('[ScalePlus AdvCrit Context Menu Test] Trying jQuery approach with row ID:', rowId);
                        $('#SearchPaneAdvCritAdvCritGrid').igGridUpdating('deleteRow', rowId);
                        console.log('[ScalePlus AdvCrit Context Menu Test] jQuery delete executed');
                    } catch (err) {
                        console.error('[ScalePlus AdvCrit Context Menu Test] jQuery delete failed:', err);
                    }
                }
            }
        }

        attachRightClickHandlers() {
            document.addEventListener('contextmenu', (e) => {
                this.handleAdvCritRightClick(e);
            }, true); // Use capture phase to ensure we get the event

            console.log('[ScalePlus AdvCrit Context Menu Test] Right-click handler attached');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const menu = new AdvCritContextMenu();
            menu.init();
        });
    } else {
        const menu = new AdvCritContextMenu();
        menu.init();
    }
})();
