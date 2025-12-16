// ==UserScript==
// @name         ScalePlus Advanced Criteria Edit Module
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Edit functionality for advanced criteria rows
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

    class ScalePlusAdvancedCriteriaEditClass {
        constructor() {
            this.activeDeleteListener = null; // Track the active delete listener
            this.activeCancelListener = null; // Track the cancel listener
            console.log('[ScalePlus AdvCrit Edit] Module loaded');
        }

        init() {
            if (!isScalePage()) {
                console.log('[ScalePlus AdvCrit Edit] Not on Scale page, skipping initialization');
                return;
            }
            console.log('[ScalePlus AdvCrit Edit] Module initialized');
        }

        /**
         * Clean up any existing event listeners
         */
        cleanupListeners() {
            if (this.activeDeleteListener) {
                const saveButton = document.querySelector('#SearchPaneAdvCrit_SaveButton');
                if (saveButton) {
                    saveButton.removeEventListener('click', this.activeDeleteListener);
                    console.log('[ScalePlus AdvCrit Edit] Cleaned up old delete listener from Save button');
                }
                this.activeDeleteListener = null;
            }
            
            if (this.activeCancelListener) {
                const cancelButton = document.querySelector('#SearchPaneAdvCrit_CancelButton');
                if (cancelButton) {
                    cancelButton.removeEventListener('click', this.activeCancelListener);
                    console.log('[ScalePlus AdvCrit Edit] Cleaned up cancel listener');
                }
                this.activeCancelListener = null;
            }
        }

        /**
         * Extract data from an advanced criteria row
         */
        extractRowData(row) {
            if (!row) return null;

            const cells = row.querySelectorAll('td[role="gridcell"]');
            if (cells.length < 4) {
                console.error('[ScalePlus AdvCrit Edit] Row does not have enough cells');
                return null;
            }

            const data = {
                condition: cells[0].textContent.trim(),
                field: cells[1].textContent.trim(),
                operand: cells[2].textContent.trim(),
                value: cells[3].textContent.trim(),
                rowId: row.getAttribute('data-id')
            };

            console.log('[ScalePlus AdvCrit Edit] Extracted row data:', data);
            return data;
        }

        /**
         * Edit an advanced criteria row
         */
        async editRow(row) {
            if (!row) {
                console.error('[ScalePlus AdvCrit Edit] No row to edit');
                return;
            }

            // Extract the row data
            const rowData = this.extractRowData(row);
            if (!rowData) {
                console.error('[ScalePlus AdvCrit Edit] Could not extract row data');
                return;
            }

            console.log('[ScalePlus AdvCrit Edit] Starting edit process for:', rowData);

            // Step 1: Click the Add button to open the form
            const addButton = document.querySelector('#SearchPaneAdvCrit_AddButton');
            if (!addButton) {
                console.error('[ScalePlus AdvCrit Edit] Could not find Add button');
                return;
            }

            console.log('[ScalePlus AdvCrit Edit] Clicking Add button...');
            addButton.click();

            // Wait for the form to appear
            await this.waitForElement('#SearchPaneAdvCrit_Field', 2000);

            // Step 2: Set Condition
            console.log('[ScalePlus AdvCrit Edit] Setting condition to:', rowData.condition);
            await this.setComboValue('#SearchPaneAdvCrit_FilterCond', rowData.condition);

            // Step 3: Set Field
            console.log('[ScalePlus AdvCrit Edit] Setting field to:', rowData.field);
            await this.setComboValue('#SearchPaneAdvCrit_Field', rowData.field);

            // Wait for the Operand combo to be enabled
            console.log('[ScalePlus AdvCrit Edit] Waiting for Operand combo to be enabled...');
            await this.waitForComboEnabled('#SearchPaneAdvCrit_Operand', 3000);
            console.log('[ScalePlus AdvCrit Edit] Operand combo is now enabled');

            // Step 4: Set Operand
            console.log('[ScalePlus AdvCrit Edit] Setting operand to:', rowData.operand);
            await this.setComboValue('#SearchPaneAdvCrit_Operand', rowData.operand);

            // Step 5: Set Value (if needed and field is visible/enabled)
            let valueField = null;
            const valueFieldStart = Date.now();
            while (Date.now() - valueFieldStart < 1000) {
                valueField = document.querySelector('#SearchPaneAdvCrit_Value');
                if (valueField && !valueField.disabled) {
                    break;
                }
                await this.sleep(50);
            }
            
            if (valueField && !valueField.disabled && rowData.value) {
                console.log('[ScalePlus AdvCrit Edit] Setting value to:', rowData.value);
                await this.setTextEditorValue('#SearchPaneAdvCrit_Value', rowData.value);
                await this.sleep(50);
                
                // Focus the value field and move cursor to end
                const valueInput = document.querySelector('#SearchPaneAdvCrit_Value');
                if (valueInput) {
                    valueInput.focus();
                    if (valueInput.setSelectionRange) {
                        const len = valueInput.value.length;
                        valueInput.setSelectionRange(len, len);
                    }
                    console.log('[ScalePlus AdvCrit Edit] Focus set to value field');
                }
            } else {
                console.log('[ScalePlus AdvCrit Edit] Value field not needed or disabled');
            }

            // Step 6: Enable Save button and bind custom behavior
            const saveButton = document.querySelector('#SearchPaneAdvCrit_SaveButton');
            const cancelButton = document.querySelector('#SearchPaneAdvCrit_CancelButton');
            
            if (saveButton) {
                console.log('[ScalePlus AdvCrit Edit] Force-enabling Save button...');
                
                saveButton.removeAttribute('disabled');
                saveButton.disabled = false;
                
                console.log('[ScalePlus AdvCrit Edit] Save button enabled. Binding delete behavior...');
                
                // Clean up any existing listeners first
                this.cleanupListeners();
                
                // Create and store the delete listener
                // Store the row ID instead of the DOM element to avoid stale references
                const rowIdToDelete = rowData.rowId;
                this.activeDeleteListener = () => {
                    console.log('[ScalePlus AdvCrit Edit] Save clicked, deleting original row with ID:', rowIdToDelete);
                    setTimeout(() => {
                        this.deleteRow(rowIdToDelete);
                    }, 500);
                    // Clean up listeners after execution
                    this.cleanupListeners();
                };
                
                // Create and store the cancel listener to clean up if user cancels
                this.activeCancelListener = () => {
                    console.log('[ScalePlus AdvCrit Edit] Cancel clicked, cleaning up listeners...');
                    this.cleanupListeners();
                };
                
                saveButton.addEventListener('click', this.activeDeleteListener);
                
                if (cancelButton) {
                    cancelButton.addEventListener('click', this.activeCancelListener);
                    console.log('[ScalePlus AdvCrit Edit] Cancel button listener attached');
                }
                
                console.log('[ScalePlus AdvCrit Edit] Edit form ready - user can now modify and click Save');
            } else {
                console.error('[ScalePlus AdvCrit Edit] Save button not found');
            }
        }

        /**
         * Delete an advanced criteria row by its data-id
         */
        deleteRow(rowOrId) {
            if (!rowOrId) {
                console.error('[ScalePlus AdvCrit Edit] No row to delete');
                return;
            }

            // Get the row ID (either from the element or if it's already an ID string)
            const rowId = typeof rowOrId === 'string' ? rowOrId : rowOrId.getAttribute('data-id');
            
            if (!rowId) {
                console.error('[ScalePlus AdvCrit Edit] Could not get row ID');
                return;
            }

            console.log('[ScalePlus AdvCrit Edit] Attempting to delete row with ID:', rowId);

            // Find the row by its data-id (ensures we get the current DOM element)
            const row = document.querySelector(`#SearchPaneAdvCritAdvCritGrid tr[data-id="${rowId}"]`);
            
            if (!row) {
                console.error('[ScalePlus AdvCrit Edit] Could not find row with ID:', rowId);
                return;
            }

            console.log('[ScalePlus AdvCrit Edit] Found row to delete:', row);

            // Try jQuery approach first (most reliable)
            if (window.$ && typeof $.ig !== 'undefined') {
                try {
                    console.log('[ScalePlus AdvCrit Edit] Using jQuery approach with row ID:', rowId);
                    $('#SearchPaneAdvCritAdvCritGrid').igGridUpdating('deleteRow', rowId);
                    console.log('[ScalePlus AdvCrit Edit] jQuery delete executed successfully');
                    return;
                } catch (err) {
                    console.error('[ScalePlus AdvCrit Edit] jQuery delete failed, trying UI approach:', err);
                }
            }

            // Fallback to UI click approach
            const deleteButton = document.querySelector('#SearchPaneAdvCritAdvCritGrid_updating_deletehover');
            
            if (deleteButton) {
                console.log('[ScalePlus AdvCrit Edit] Found delete button, using UI click approach...');
                
                const firstCell = row.querySelector('td[role="gridcell"]');
                if (firstCell) {
                    firstCell.click();
                    
                    setTimeout(() => {
                        const deleteIcon = deleteButton.querySelector('.ui-iggrid-deleteicon');
                        if (deleteIcon) {
                            deleteIcon.click();
                            console.log('[ScalePlus AdvCrit Edit] Clicked delete icon');
                        } else {
                            deleteButton.click();
                            console.log('[ScalePlus AdvCrit Edit] Clicked delete button');
                        }
                    }, 100);
                } else {
                    console.error('[ScalePlus AdvCrit Edit] Could not find first cell in row');
                }
            } else {
                console.error('[ScalePlus AdvCrit Edit] Could not find delete button');
            }
        }

        // Helper methods
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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
                            clearInterval(checkInterval);
                            resolve(wrapper);
                        }
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        reject(new Error(`Timeout waiting for combo to be enabled: ${selector}`));
                    }
                }, 100);
            });
        }

        async waitForComboValue(combo, expectedIdentifier, timeout = 2000) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const currentValue = combo.igCombo('value');
                
                if (currentValue === expectedIdentifier || 
                    (Array.isArray(currentValue) && currentValue.length > 0 && currentValue[0] === expectedIdentifier)) {
                    return true;
                }
                
                await this.sleep(50);
            }
            return false;
        }

        async waitForDropdownFiltered(combo, timeout = 1000) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                try {
                    const dropdownList = combo.igCombo('listItems');
                    if (dropdownList && dropdownList.length > 0) {
                        return true;
                    }
                } catch (e) {
                    // Ignore errors during polling
                }
                
                await this.sleep(30);
            }
            return false;
        }

        async setComboValue(selector, value) {
            const combo = $(selector);
            if (!combo.length) {
                console.error('[ScalePlus AdvCrit Edit] Combo not found:', selector);
                return;
            }

            try {
                const comboData = combo.data('igCombo');
                if (!comboData) {
                    console.error('[ScalePlus AdvCrit Edit] Combo data not found for:', selector);
                    return;
                }

                // Get data source
                let dataArray = [];
                if (comboData.options.dataSource) {
                    const dataSource = comboData.options.dataSource;
                    
                    if (Array.isArray(dataSource)) {
                        dataArray = dataSource;
                    } else if (typeof dataSource.data === 'function') {
                        dataArray = dataSource.data();
                    } else if (dataSource.dataView && Array.isArray(dataSource.dataView)) {
                        dataArray = dataSource.dataView;
                    } else if (dataSource._data && Array.isArray(dataSource._data)) {
                        dataArray = dataSource._data;
                    }
                }

                if (dataArray.length === 0) {
                    try {
                        const allData = combo.igCombo('dataBind');
                        if (allData && Array.isArray(allData)) {
                            dataArray = allData;
                        }
                    } catch (e) {
                        // Ignore
                    }
                }

                // Find matching item
                let item = null;
                let partialMatch = null;
                
                for (let i = 0; i < dataArray.length; i++) {
                    const dsItem = dataArray[i];
                    
                    // Exact match
                    if (dsItem.DisplayText === value || 
                        dsItem.Description === value ||
                        dsItem.Identifier === value) {
                        item = dsItem;
                        break;
                    }
                    
                    // Pattern match for condition codes
                    if (dsItem.DisplayText && dsItem.DisplayText.includes(`(${value})`) ||
                        dsItem.Description && dsItem.Description.includes(`(${value})`)) {
                        item = dsItem;
                        break;
                    }
                    
                    // Partial match as fallback
                    if (!partialMatch) {
                        const valueLower = value.toLowerCase();
                        const displayLower = (dsItem.DisplayText || '').toLowerCase();
                        const descLower = (dsItem.Description || '').toLowerCase();
                        
                        // For operators, only exact match
                        if (value.length <= 2 && (value === '=' || value === '!=' || value === '<' || value === '>' || value === '<=' || value === '>=')) {
                            if (displayLower === valueLower || descLower === valueLower) {
                                partialMatch = dsItem;
                            }
                        } else if (displayLower.includes(valueLower) || descLower.includes(valueLower)) {
                            partialMatch = dsItem;
                        }
                    }
                }
                
                if (!item && partialMatch) {
                    item = partialMatch;
                }

                if (item) {
                    // Use typing method for reliable selection
                    const inputField = combo.parent().find('input.ui-igcombo-field')[0];
                    if (inputField) {
                        inputField.focus();
                        await this.sleep(30);
                        
                        inputField.value = '';
                        inputField.value = item.DisplayText;
                        
                        inputField.dispatchEvent(new Event('input', { bubbles: true }));
                        inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                        
                        // Wait for dropdown to filter
                        const dropdownReady = await this.waitForDropdownFiltered(combo, 1000);
                        if (dropdownReady) {
                            await this.sleep(150);
                        } else {
                            await this.sleep(200);
                        }
                        
                        // Re-focus and press Enter
                        inputField.focus();
                        await this.sleep(50);
                        
                        ['keydown', 'keypress', 'keyup'].forEach(eventType => {
                            inputField.dispatchEvent(new KeyboardEvent(eventType, {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            }));
                        });
                        
                        await this.sleep(150);
                        
                        // Wait for value to be set
                        await this.waitForComboValue(combo, item.Identifier, 1500);
                    }
                }
            } catch (err) {
                console.error('[ScalePlus AdvCrit Edit] Error setting combo value:', err);
            }
        }

        async setTextEditorValue(selector, value) {
            const editor = $(selector);
            if (!editor.length) {
                console.error('[ScalePlus AdvCrit Edit] Text editor not found:', selector);
                return;
            }

            try {
                const editorData = editor.data('igTextEditor');
                if (editorData) {
                    editor.igTextEditor('value', value);
                } else {
                    editor.val(value);
                    editor.trigger('change');
                }
            } catch (err) {
                console.error('[ScalePlus AdvCrit Edit] Error setting text editor value:', err);
            }
        }
    }

    window.ScalePlusAdvancedCriteriaEdit = new ScalePlusAdvancedCriteriaEditClass();
    window.ScalePlusAdvancedCriteriaEdit.init();
})();
