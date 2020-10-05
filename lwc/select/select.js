import { LightningElement, api, track } from 'lwc';

const MINIMUM_SEARCH_TERM_LENGTH = 1; // Min number of chars required to search.
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search.
const KEYS = { ENTER: 13, ARROW_UP: 38, ARROW_DOWN: 40 };
const HAS_FOCUS = 'slds-has-focus';
const DROPDOWN_CLASS = '.filtered-item-dropdown';
const SCROLL_OPTION = { behavior: "smooth", block: "end", inline: "nearest" };

export default class Select extends LightningElement {
    @api label;
    @api placeholder = 'Search...';
    @api variant = 'standard';
    @api readOnly = false;
    @api disabled = false;
    @api required = false;
    @api multiple = false;
    @api isSelectAll = false;
    @api componentId = null;
    @api noRecordMessage = 'No records found according to the search term.';

    @track filteredOptions = [];
    @track allSelectedItem = [];
    @track hasfilteredOptions = false;
    @track hasNoRecord = false;
    @track isAllSelected = false;
    @track selectCheckboxIcon = ''
    @track selectedInputValue = '';

    allOptions = [];
    userDisplayText;
    focusIndex = -1;
    hasRendered = false;

    @api get options() {
        return this.options;
    }
    set options(items) {
        this.allOptions = (items && items.length) ? JSON.parse(JSON.stringify(items)) : [];
        this.allSelectedItem = JSON.parse(JSON.stringify(this.allOptions.filter(result => result.selected)));
    }

    renderedCallback() {
        if (this.hasRendered) return;
        this.hasRendered = true;
        this.setInputValue(false);
        let self = this;
        this.template.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        document.addEventListener('click', function(event) {
            self.closeAllDropDown();
        });
    }

    handleFocusAndInput(event) {
        if(this.checkUserAccess()){
            return;
        }
        this.focusIndex = -1;
        this.updateSearchTerm(event.target.value);
    }

    handleBlur() {
        this.focusIndex = -1;
        this.hasNoRecord = false;
    }

    handleClick(event) {
        if(this.checkUserAccess()){
            return;
        }
        if (this.multiple) {
            event.stopPropagation();
            this.userinput('');
            this.updateSearchTerm('');
        }
    }

    handleAllSelectClick(){
        this.isAllSelected = !this.isAllSelected;
        this.selectCheckboxIcon = this.isAllSelected ? 'utility:check' : '';
        const filteredResult = this.manageSelectionSet(this.filteredOptions, this.isAllSelected);
        this.filteredOptions = [...filteredResult];
        const allResult = this.manageSelectionSet(this.allOptions, this.isAllSelected);
        this.allOptions = [...allResult];
        this.allSelectedItem = ( this.isAllSelected ?  [...this.allOptions] : [] );
    }

    manageSelectionSet(data, isActive){
        let filteredResult = data.map(x => {
            let obj = Object.assign({}, x);
            obj.selected = isActive;
            return obj;
        })
        return filteredResult;
    }

    arrowNavigationUp(event) {
        if ((this.hasItems || this.hasNoRecord) && event.which === KEYS.ARROW_UP) {
            const dropdown = [...this.template.querySelectorAll(DROPDOWN_CLASS)];
            dropdown.map(li => li.firstChild.classList.remove(HAS_FOCUS));
            const itemCount = (dropdown.length - 1);
            if (this.focusIndex !== -1) {
                if (itemCount !== (this.focusIndex + itemCount)) {
                    if (this.focusIndex) {
                        --this.focusIndex;
                    } else {
                        this.focusIndex = itemCount;
                    }
                } else if (this.focusIndex === 1) {
                    this.focusIndex = 0;
                } else if (itemCount === (this.focusIndex + itemCount)) {
                    this.focusIndex = itemCount;
                }
            } else {
                this.focusIndex = itemCount;
            }
            dropdown[this.focusIndex].firstChild.classList.add(HAS_FOCUS);
            dropdown[this.focusIndex].firstChild.scrollIntoView(SCROLL_OPTION);
        } else if (event.which === KEYS.ENTER && this.focusIndex !== -1) {
            this.handleResultEnter();
        }
    }

    arrowNavigationDown(event) {
        if ((this.hasItems || this.hasNoRecord) && event.which === KEYS.ARROW_DOWN) {
            const dropdown = [...this.template.querySelectorAll(DROPDOWN_CLASS)];
            const itemCount = (dropdown.length - 1);
            if (itemCount !== this.focusIndex) {
                (this.focusIndex !== -1) ? dropdown[this.focusIndex].firstChild.classList.remove(HAS_FOCUS): null;
                dropdown[++this.focusIndex].firstChild.classList.add(HAS_FOCUS);
            } else if (itemCount === this.focusIndex) {
                dropdown[this.focusIndex].firstChild.classList.remove(HAS_FOCUS);
                this.focusIndex = 0;
                dropdown[this.focusIndex].firstChild.classList.add(HAS_FOCUS);
            }
            dropdown[this.focusIndex].firstChild.scrollIntoView(SCROLL_OPTION);

        }
    }

    handleResultEnter() {
        const dropdown = [...this.template.querySelectorAll(DROPDOWN_CLASS)];
        if (dropdown && dropdown.length) {
            let value = dropdown[this.focusIndex].dataset.value;
            if (value != 'no-record-found' && value != 'select-all-options') {
                this.maintainSelection(value);
                if (!this.multiple) {
                    this.template.querySelector('lightning-input').blur()
                }
            }else if(value == 'select-all-options'){
                this.handleAllSelectClick();
            }
        }
    }

    clearFocus() {
        if (this.focusIndex === -1) return;
        this.focusIndex = -1;
        [...this.template.querySelectorAll(DROPDOWN_CLASS)].map(li => li.firstChild.classList.remove(HAS_FOCUS));
    }

    handleSelectedOption(event) {
        event.stopPropagation();
        this.maintainSelection(event.currentTarget.dataset.value);
        this.template.querySelector('lightning-input').focus();
    }

    maintainSelection(selectedItemValue) {;
        try {
            const selectedOption = selectedItemValue.toLowerCase();
            let selectedItem = this.allOptions.filter(result => result.value.toLowerCase() === selectedOption);
            if (selectedItem.length === 0) {
                return;
            }
            let isExist = false;
            if (this.multiple) {
                const index = this.allSelectedItem.findIndex(item => item.value.toLowerCase() == selectedOption);
                if (index !== -1) {
                    isExist = true;
                    this.allSelectedItem.splice(index, 1);
                }
            }

            let newSelection, item = this.jsonparse(selectedItem[0]);
            if (this.multiple) {
                newSelection = isExist ? [...this.allSelectedItem] : [...this.allSelectedItem, item];
            } else {
                newSelection = [item];
            }
            this.allSelectedItem = this.jsonparse(newSelection);

            let result = this.allOptions.map(x => {
                let option = this.allSelectedItem.find(item => item.value.toLowerCase() === x.value.toLowerCase());
                let seletedOption = Object.assign({}, x);
                seletedOption.selected = (option != undefined);
                return seletedOption;
            })
            this.allOptions = [...result];

            if (this.multiple) {
                this.setCheckSymbolOnSelectedOptions();
                this.setInputValue(false);
            } else {
                this.setInputValue(false);
                this.hideDropdown();
                this.onItemSelectedEvent();
            }

            if(this.multiple){
                this.isAllSelected = (this.allSelectedItem.length ===  this.allOptions.length);
                this.selectCheckboxIcon = this.isAllSelected ? 'utility:check' : '';
            }
           

        } catch (error) {
            console.log('error : ', error);
        }
    }

    updateSearchTerm(value) {
        this.hasNoRecord = false;
        if (!this.hasOptions) return;
        const searchTerm = value.trim().replace(/\*/g, '').toLowerCase();
        if (searchTerm.length < MINIMUM_SEARCH_TERM_LENGTH) {
            this.filteredOptions = [...this.allOptions];
            return;
        }
        const filteredItems = this.allOptions.filter(item => {
            return item.label && item.label.toLowerCase().startsWith(searchTerm);
        });
        this.hasNoRecord = (filteredItems.length == 0);
        this.filteredOptions = filteredItems.length ? [...filteredItems] : [];
    }

    setInputValue(isEvent) {
        let value = '';
        if (this.allSelectedItem.length) {
            if (this.multiple) {
                let selectedItems = this.allSelectedItem.map(item => {
                    return item.label;
                });
                const itemCount = (selectedItems.length - 2);
                value = (selectedItems.length && selectedItems.length < 3) ? selectedItems.join(', ') : `${selectedItems.splice(0, 2).join(', ')}, ( ${itemCount} More Items. )`;
                
                if(this.hasItems || this.hasNoRecord){
                    this.userDisplayText = value;
                }else{
                    this.userDisplayText = undefined;
                    this.userinput(value);
                }
            } else {
                value = this.allSelectedItem[0].label;
                this.userinput(value);
            }
        }else{
            this.userDisplayText = undefined;
            this.userinput(value);
        }//else

        if (isEvent) {
            this.onItemSelectedEvent();
        }
    }

    setCheckSymbolOnSelectedOptions() {
        let result = this.filteredOptions.map(x => {
            let option = this.allSelectedItem.find(item => item.value.toLowerCase() === x.value.toLowerCase());
            let seletedOption = Object.assign({}, x);
            seletedOption.selected = (option != undefined);
            return seletedOption;
        })
        this.filteredOptions = [...result];
    }

    hideDropdown() {
        // Delay hiding combobox so that we can capture selected result
        window.setTimeout((self) => {
            self.hasNoRecord = false;
            self.filteredOptions = [];
        }, SEARCH_DELAY, this);
    }

    singleInputValue() {
        let searchTerm = this.template.querySelector('lightning-input').value.trim().replace(/\*/g, '').toLowerCase();
        if (searchTerm.length < MINIMUM_SEARCH_TERM_LENGTH) {
            this.filteredOptions = [];
            this.allOptions.map(item => {
                item.selected = false;
                return item;
            });
            this.allSelectedItem = [];
        } else {
            let selectedItem = this.allOptions.filter(result => result.label.toLowerCase() === searchTerm);
            if (selectedItem && selectedItem.length) {
                let result = this.allOptions.map(x => {
                    let option = selectedItem.find(item => item.value.toLowerCase() === x.value.toLowerCase());
                    let seletedOption = Object.assign({}, x);
                    seletedOption.selected = (option != undefined);
                    return seletedOption;
                })
                this.allOptions = [...result];
                this.userinput(selectedItem[0].label);
                this.allSelectedItem = selectedItem;
            } else {
                this.allSelectedItem = [];
                this.userinput('');
            }
        }
        this.onItemSelectedEvent();
    }

    closeAllDropDown() {
        if (this.hasItems) {
            this.hasNoRecord = false;
            this.filteredOptions = [];
            if (this.multiple) {
                this.setInputValue(true);
            } else {
                this.singleInputValue();
            }
        }
    };

    onItemSelectedEvent() {
      this.allSelectedItem.map(item => {
            item.selected = true;
            return item;
        });
        let selectedValue = this.allSelectedItem.length ? (this.multiple ? this.allSelectedItem : this.allSelectedItem[0]) : null;
        let data = {
            componentId: this.componentId,
            value: selectedValue,
            options: [...this.allOptions]
        }
        this.dispatchEvent(new CustomEvent('select', { detail: this.jsonparse(data) }));
    }

    userinput(val) {
        this.template.querySelector('lightning-input').value = val;
    }

    jsonparse(data) {
        return JSON.parse(JSON.stringify(data));
    }

    checkUserAccess(){
        return (this.disabled ||  this.readOnly);
    }

    //getter functions
    get hasOptions() {
        return (this.allOptions.length > 0);
    }
    get hasItems() {
        return (this.filteredOptions.length > 0);
    }
    get inputPlaceHolder(){
        return (this.userDisplayText ? this.userDisplayText : this.placeholder);
    }
    get allSelectCheckbox(){
        return  ((this.multiple && this.isSelectAll) && (this.allOptions.length === this.filteredOptions.length));
    }
    get inputboxType(){
        return (this.disabled ||  this.readOnly) ? 'text' : 'search';
    }
}