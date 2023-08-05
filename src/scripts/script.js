// Objects
import tables from '../data/tables.js'
import pages from '../data/pages.js'
import reports from '../data/reports.js'
var objects = tables;

// Global variables
const root = document.documentElement;
const settingsButton = document.getElementById('settingsButton');
const objectTypeInput = document.getElementById('objectType');
const objectNameInput = document.getElementById('objectName');
const objectIdInput = document.getElementById('objectId');
const errorMsg = document.getElementById('objectIdError');
const openButton = document.getElementById('openButton');
const card = document.getElementById('card');
const saveButton = document.getElementById('saveButton');
const defaultObjectType = document.getElementById('defaultObjectType');
const darkModeCheck = document.getElementById('darkMode');
const addSpice = document.getElementById('addSpiceCheck');
const spiceColorPicker = document.getElementById('colorPicker');
const nameDropdown = document.getElementById('nameDropdown');
let selectedDropdownItem = -1;
let filteredNames = [];
let errorState = false;
let settingsOpen = false;

loadSettings();

// Event Listeners
settingsButton.addEventListener('click', flipCard);

saveButton.addEventListener('click', () => {
    saveSettings();
    flipCard();
});

objectTypeInput.addEventListener('change', () => {
    setObjectType();
    reset();
});
objectTypeInput.addEventListener('click', function (event) {
    closeDropdown();
});

objectNameInput.addEventListener('input', function (event) {
    if (objectNameInput.value.trim() === '') {
        reset();
        return;
    }
    openDropdown(event);
});
objectNameInput.addEventListener('blur', function (event) {
    if (event.relatedTarget !== null) {
        closeDropdown();
    }
});
objectNameInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        OpenURL();
    }
});
objectNameInput.addEventListener('keydown', function (event) {
    navigateDropdown(event);
});

objectIdInput.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
        validateObjectId(event);
        OpenURL();
    }
});
objectIdInput.addEventListener('blur', function (event) {
    validateObjectId(event);
});
objectIdInput.addEventListener('input', function (event) {
    if (errorState) {
        resetError();
    }
});

openButton.addEventListener('click', function () {
    OpenURL();
});

nameDropdown.addEventListener('click', function (event) {
    selectClickedDropdownItem(event);
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        if (nameDropdown.innerHTML !== '') {
            event.preventDefault();
            closeDropdown();
        }
    }
});

document.addEventListener('click', function (event) {
    if (nameDropdown.contains(event.target)) {
        selectClickedDropdownItem(event);
    } else {
        closeDropdown();
    }
});

darkModeCheck.addEventListener('change', toggleDarkmode);
addSpice.addEventListener('change', toggleSpice);
spiceColorPicker.addEventListener('input', setSpiceColor);

// Functions
function loadSettings() {
    const defaultObjectTypeValue = localStorage.getItem('defaultObjectType');
    if (defaultObjectTypeValue !== null) {
        defaultObjectType.value = defaultObjectTypeValue;
        objectTypeInput.value = defaultObjectTypeValue;
        setObjectType();
    }
    darkModeCheck.checked = localStorage.getItem('darkMode') === 'true';
    toggleDarkmode();
    addSpice.checked = localStorage.getItem('addSpice') === 'true';
    toggleSpice();
    var spiceColor = localStorage.getItem('spiceColor');
    if (spiceColor === null) {
        spiceColor = '#018ea7';
    }
    spiceColorPicker.value = spiceColor;
    setSpiceColor();
}

function saveSettings() {
    localStorage.setItem('defaultObjectType', defaultObjectType.value);
    localStorage.setItem('darkMode', darkModeCheck.checked);
    localStorage.setItem('addSpice', addSpice.checked);
    localStorage.setItem('spiceColor', spiceColorPicker.value);
    loadSettings();
    reset();
    setObjectType();
}

function toggleDarkmode() {
    if (darkModeCheck.checked) {
        // Dark mode
        root.style.setProperty('--html-color', '#000000');
        root.style.setProperty('--bg-color-one', '#17181a');
        root.style.setProperty('--bg-color-two', '#2d2d2d');
        root.style.setProperty('--invert-percentage', '100%');
        root.style.setProperty('--text-color', '#dddddd');
        root.style.setProperty('--input-bg-color', '#333');
        root.style.setProperty('--input-text-color', '#fff');
        root.style.setProperty('--input-border-color', '#555');
        root.style.setProperty('--button-hover-percentage', '115%');
    } else {
        // Light mode
        root.style.setProperty('--html-color', '#ffffff');
        root.style.setProperty('--bg-color-one', '#d5e4f3');
        root.style.setProperty('--bg-color-two', '#ffffff');
        root.style.setProperty('--invert-percentage', '0%');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--input-bg-color', '#fff');
        root.style.setProperty('--input-text-color', '#333');
        root.style.setProperty('--input-border-color', '#ccc');
        root.style.setProperty('--button-hover-percentage', '90%');
    }
    // Reload images
    document.body.offsetHeight;
}

function toggleSpice() {
    if (addSpice.checked) {
        root.style.setProperty('--spice-visibility', 'visible');
    } else {
        root.style.setProperty('--spice-visibility', 'hidden');
    }
}

function setSpiceColor() {
    root.style.setProperty('--spice-color', spiceColorPicker.value);
}

function flipCard(event) {
    if (!settingsOpen) {
        card.style.transform = 'rotateY(180deg)';
        settingsOpen = true;
    } else {
        card.style.transform = 'rotateY(0deg)';
        settingsOpen = false;
    }
}

function reset() {
    objectIdInput.value = '';
    objectNameInput.value = '';
    resetError();
    closeDropdown();
}

function resetError() {
    errorState = false;
    errorMsg.classList.remove('appear');
    closeDropdown();
}

function setErrorMsg(objectType) {
    if (objectType) {
        errorState = true;
        const object = objectType.charAt(0).toUpperCase() + objectType.slice(1);
        errorMsg.textContent = object + " ID doens't exist";
        errorMsg.classList.add('appear');
    } else {
        errorState = true;
        errorMsg.textContent = "Object ID cannot be empty";
        errorMsg.classList.add('appear');
    }
}

function setObjectType() {
    const selectedObjectType = objectTypeInput.value;
    if (selectedObjectType === 'table') {
        objects = tables;
    } else if (selectedObjectType === 'page') {
        objects = pages;
    } else if (selectedObjectType === 'report') {
        objects = reports;
    }
}

function validateObjectId(event) {
    const inputText = event.target.value.trim();
    if (inputText === '') {
        reset();
    } else {
        const objectId = parseInt(inputText);
        const objectName = objects.find(item => item.id === objectId)?.name;
        if (objectName == undefined) {
            setErrorMsg(objectTypeInput.value);
            objectNameInput.value = '';
        } else {
            objectNameInput.value = objectName;
            resetError();
        }
    }
}

function openDropdown(event) {
    closeDropdown();
    const inputText = event.target.value.trim().toLowerCase();
    filteredNames = objects.filter(item => isWildcardMatch(item.name.toLowerCase(), inputText));
    const results = filteredNames.slice(0, 5);

    results.forEach(item => {
        const objectName = item.name;
        const dropdownItem = document.createElement('div');
        dropdownItem.classList.add('dropdown-item');
        dropdownItem.textContent = objectName;
        nameDropdown.appendChild(dropdownItem);
    });
}

function closeDropdown() {
    nameDropdown.innerHTML = '';
    selectedDropdownItem = -1;
}

function selectClickedDropdownItem(event) {
    const clickedItem = event.target;
    console.log(clickedItem);

    if (clickedItem.classList.contains('dropdown-item')) {
        const objectName = clickedItem.textContent;
        const objectId = objects.find(item => item.name === objectName)?.id;
        if (objectId == undefined) {
            setErrorMsg(objectTypeInput.value);
        } else {
            objectNameInput.value = objectName;
            objectIdInput.value = objectId;
            resetError();
        }
        closeDropdown();
    }
};

function navigateDropdown(event) {
    const items = nameDropdown.getElementsByClassName('dropdown-item');

    if (event.key === 'ArrowDown' && selectedDropdownItem < items.length - 1) {
        event.preventDefault();
        selectedDropdownItem++;
        selectDropdownItem(items);
    } else if (event.key === 'ArrowUp') {
        if (selectedDropdownItem < 0) {
            event.preventDefault();
            selectedDropdownItem++;
            selectDropdownItem(items);
        } else if (selectedDropdownItem > 0){
            event.preventDefault();
            selectedDropdownItem--;
            selectDropdownItem(items);
        }
    } else if ((event.key === 'Enter' || event.key === 'Tab') && selectedDropdownItem >= 0) {
        event.preventDefault();
        objectNameInput.value = items[selectedDropdownItem].textContent;
        objectIdInput.value = objects.find(item => item.name === objectNameInput.value)?.id;
        closeDropdown();
        resetError();
    }
}

function selectDropdownItem(items) {
    for (let i = 0; i < items.length; i++) {
        if (i === selectedDropdownItem) {
            items[i].classList.add('selected');
        } else {
            items[i].classList.remove('selected');
        }
    }
}

function isWildcardMatch(name, input) {
    const inputWords = input.split(' ');
    for (const word of inputWords) {
        const wordIndex = name.indexOf(word);
        if (wordIndex === -1) {
            return false;
        }
        name = name.slice(0, wordIndex) + name.slice(wordIndex + word.length);
    }
    return true;
}

function OpenURL() {
    const objectTypeValue = objectTypeInput.value;
    const objectIdValue = objectIdInput.value.trim();

    if (objectIdValue === '') {
        setErrorMsg();
    }
    if (errorState) {
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var environmentName = '';
        var companyString = '';
        var tenantString = '';
        const currentUrl = tabs[0].url;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/") + 1);

        // Environment name
        const firstChar = currentUrl.charAt(baseUrl.length);
        if (firstChar !== '?') {
            const firstAmpersandIndex = currentUrl.indexOf("&", baseUrl.length);
            const firstQuestionMarkIndex = currentUrl.indexOf("?", baseUrl.length);
            if ((firstAmpersandIndex === -1) && (firstQuestionMarkIndex === -1)) {
                var environmentName = currentUrl.substring(baseUrl.length);
            } else {
                if ((firstAmpersandIndex !== -1) && (firstQuestionMarkIndex !== -1)) {
                    if (firstAmpersandIndex < firstQuestionMarkIndex) {
                        var environmentName = currentUrl.substring(baseUrl.length, firstAmpersandIndex);
                    } else {
                        var environmentName = currentUrl.substring(baseUrl.length, firstQuestionMarkIndex);
                    }
                } else {
                    if (firstAmpersandIndex !== -1) {
                        var environmentName = currentUrl.substring(baseUrl.length, firstAmpersandIndex);
                    }
                    if (firstQuestionMarkIndex !== -1) {
                        var environmentName = currentUrl.substring(baseUrl.length, firstQuestionMarkIndex);
                    }
                }
            }
        }
        // Company name
        const companyIndex = currentUrl.indexOf("company=");
        if (companyIndex !== -1) {
            const firstAmpersandIndex = currentUrl.indexOf("&", companyIndex);
            if (firstAmpersandIndex !== -1) {
                var companyString = currentUrl.substring(companyIndex, firstAmpersandIndex);
            } else {
                var companyString = currentUrl.substring(companyIndex);
            }
        }
        // Tenant
        const tenantIndex = currentUrl.indexOf("tenant=");
        if (tenantIndex !== -1) {
            const firstAmpersandIndex = currentUrl.indexOf("&", tenantIndex);
            if (firstAmpersandIndex !== -1) {
                var tenantString = currentUrl.substring(tenantIndex, firstAmpersandIndex);
            } else {
                var tenantString = currentUrl.substring(tenantIndex);
            }
        }

        // Create new URL
        var newUrl = baseUrl;
        if (environmentName !== '') {
            newUrl += environmentName;
        }
        newUrl += '?';
        if (companyString !== '') {
            newUrl += companyString + '&';
        }
        if (tenantString !== '') {
            newUrl += tenantString + '&';
        }

        newUrl += objectTypeValue + '=' + objectIdValue;
        chrome.tabs.create({ url: newUrl });
    });
}