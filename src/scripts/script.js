// Objects
import tables from '../data/tables.js'
import pages from '../data/pages.js'
import reports from '../data/reports.js'
var objects = tables;

// Global variables
const root = document.documentElement;
const settingsButton = document.getElementById('settingsButton');
const copyButton = document.getElementById('copyButton');
const copyText = document.getElementById('copyText');
const copiedIcon = document.getElementById('copiedIcon');
const objectTypeInput = document.getElementById('objectType');
const objectNameInput = document.getElementById('objectName');
const objectIdInput = document.getElementById('objectId');
const errorMsg = document.getElementById('objectIdError');
const openButton = document.getElementById('openButton');
const card = document.getElementById('card');
const saveButton = document.getElementById('saveButton');
const defaultObjectType = document.getElementById('defaultObjectType');
const verifyObjectId = document.getElementById('verifyObjectId');
const darkModeCheck = document.getElementById('darkMode');
const addSpice = document.getElementById('addSpiceCheck');
const spiceColorPicker = document.getElementById('colorPicker');
const spiceColorPickerButton = document.getElementById('colorPickerButton');
const nameDropdown = document.getElementById('nameDropdown');
// const copyRightText = document.querySelector('.copyright');
const secondsSavedLbl = document.getElementById('secondsSavedLbl');
const coffeeButton = document.getElementById('coffeeButton');
const coffeeButtonQR = document.getElementById('coffeeButtonQR');
const closeQrPopup = document.getElementById('closeQrPopup');
const qrPopup = document.getElementById('qrPopup');
let selectedDropdownItem = -1;
let filteredNames = [];
let errorState = false;
let settingsOpen = false;
let colorPickerOpen = false;
let copyClicked = false;
let qrPopupVisible = false;
let secondsSaved = 0;

init()

// Event Listeners
settingsButton.addEventListener('click', flipCard);

coffeeButton.addEventListener('click', redirectToCoffee);
coffeeButtonQR.addEventListener('click', toggleQRPopupVisible);
closeQrPopup.addEventListener('click', toggleQRPopupVisible);

settingsButton.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
        flipCard();
        saveButton.focus();
    }
});

settingsButton.addEventListener('mouseenter', function () {
    if (addSpice.checked) {
        settingsButton.style.animation = 'rotate 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
});

settingsButton.addEventListener('mouseleave', function () {
    if (addSpice.checked) {
        settingsButton.style.animation = 'none';
    }
});

copiedIcon.addEventListener('mouseenter', function () {
    copyText.style.opacity = 1;
});
copiedIcon.addEventListener('mouseleave', function () {
    if (!copyClicked) {
        copyText.style.opacity = 0;
    }
});
copyButton.addEventListener('mouseenter', function () {
    copyText.style.opacity = 1;
});
copyButton.addEventListener('mouseleave', function () {
    if (!copyClicked) {
        copyText.style.opacity = 0;
    }
});

copyButton.addEventListener('click', function () {
    copyObjectToClipboard();
});

spiceColorPickerButton.addEventListener('click', () => {
    if (colorPickerOpen) {
        spiceColorPicker.blur();
    } else {
        spiceColorPicker.click();
    }
    colorPickerOpen = !colorPickerOpen;
});

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
    if (colorPickerOpen && !spiceColorPickerButton.contains(event.target)) {
        spiceColorPicker.blur();
        colorPickerOpen = false;
    }
});

darkModeCheck.addEventListener('change', toggleDarkmode);
addSpice.addEventListener('change', toggleSpice);
spiceColorPicker.addEventListener('input', setSpiceColor);

// Functions
function init() {
    loadSettings();
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    // copyRightText.innerHTML = '© Vincent Goessens - 2023-' + currentYear;
    objectNameInput.focus();
}

function loadSettings() {
    const defaultObjectTypeValue = localStorage.getItem('defaultObjectType');
    if (defaultObjectTypeValue !== null) {
        defaultObjectType.value = defaultObjectTypeValue;
        objectTypeInput.value = defaultObjectTypeValue;
        setObjectType();
    }
    const verifyObjectIdValue = localStorage.getItem('verifyObjectId');
    if (verifyObjectIdValue !== null) {
        verifyObjectId.checked = verifyObjectIdValue === 'true';
    } else {
        verifyObjectId.checked = true;
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
    secondsSaved = parseInt(localStorage.getItem('secondsSaved') || 0);
    setTimeSavedLbl();
}

function saveSettings() {
    localStorage.setItem('defaultObjectType', defaultObjectType.value);
    localStorage.setItem('verifyObjectId', verifyObjectId.checked);
    localStorage.setItem('darkMode', darkModeCheck.checked);
    localStorage.setItem('addSpice', addSpice.checked);
    localStorage.setItem('spiceColor', spiceColorPicker.value);
    localStorage.setItem('secondsSaved', secondsSaved);
    loadSettings();
    reset();
    setObjectType();
}

function addTimeSaved(seconds) {
    secondsSaved += seconds;
    localStorage.setItem('secondsSaved', secondsSaved);
    setTimeSavedLbl();
}

function setTimeSavedLbl() {
    const hours = Math.floor(secondsSaved / 3600);
    const minutes = Math.floor((secondsSaved % 3600) / 60);
    const seconds = secondsSaved % 60;
    let txt;
    hours > 0 ? txt = hours + 'h ' : txt = '';
    minutes > 0 ? txt += minutes + 'm ' : '';
    txt += seconds + 's';
    secondsSavedLbl.textContent = txt;
}

function toggleDarkmode() {
    if (darkModeCheck.checked) {
        // Dark mode
        root.style.setProperty('--html-color', '#1a1a1a');
        root.style.setProperty('--bg-color-one', '#17181a');
        root.style.setProperty('--bg-color-two', '#2d2d2d');
        root.style.setProperty('--invert-percentage', '100%');
        root.style.setProperty('--text-color', '#dddddd');
        root.style.setProperty('--input-bg-color', '#333');
        root.style.setProperty('--input-text-color', '#fff');
        root.style.setProperty('--input-border-color', '#555');
        root.style.setProperty('--button-hover-percentage', '110%');
        root.style.setProperty('--dropdown-selected-bg', '#292929');
        root.style.setProperty('--button-shadow-color', '#141414');
        root.style.setProperty('--button-border-color', '#363636');
    } else {
        // Light mode
        root.style.setProperty('--html-color', '#fdffff');
        root.style.setProperty('--bg-color-one', '#fdffff');
        root.style.setProperty('--bg-color-two', '#f5feff');
        root.style.setProperty('--invert-percentage', '0%');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--input-bg-color', '#fff');
        root.style.setProperty('--input-text-color', '#333');
        root.style.setProperty('--input-border-color', '#ccc');
        root.style.setProperty('--button-hover-percentage', '97%');
        root.style.setProperty('--dropdown-selected-bg', '#e9eff0');
        root.style.setProperty('--button-shadow-color', '#a1a1a1');
        root.style.setProperty('--button-border-color', '#969696');
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

function flipCard() {
    if (!settingsOpen) {
        card.style.transform = 'rotateY(180deg)';
        settingsOpen = true;
    } else {
        card.style.transform = 'rotateY(0deg)';
        settingsOpen = false;
    }
}

function redirectToCoffee() {
    saveSettings();
    chrome.tabs.create({ url: 'https://donate.stripe.com/aEUeYe64AcD04GA4gg' });
}

function toggleQRPopupVisible() {
    if (!qrPopupVisible) {
        qrPopup.classList.add('visible');
        qrPopupVisible = true;
    } else {
        qrPopup.classList.remove('visible');
        qrPopupVisible = false;
    }
}


function copyObjectToClipboard() {
    addTimeSaved(10);
    copyClicked = true;
    var copyObjectType = objectTypeInput.value;
    var copyObjectName = objectNameInput.value;
    var copyObjectId = objectIdInput.value;
    navigator.clipboard.writeText(copyObjectType + ': "' + copyObjectName + '" (' + copyObjectId + ')');
    copiedIcon.style.visibility = 'visible';
    copyButton.style.visibility = 'hidden';
    copyText.textContent = 'Copied!';
    copyText.style.opacity = 1;
    setTimeout(function () {
        copiedIcon.style.visibility = 'hidden';
        copyButton.style.visibility = 'visible';
        copyText.style.opacity = 0;
        copyText.textContent = 'Copy';
        copyClicked = false;
    }, 2000);
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
    if (!verifyObjectId.checked) {
        return;
    }
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
    objectNameInput.focus();
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
    filteredNames.sort((a, b) => a.name.length - b.name.length);
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
        return;
    }

    if (verifyObjectId.checked) {
        if (objectIdValue === '') {
            setErrorMsg();
        }
        if (errorState) {
            return;
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var environmentName = '';
        var companyString = '';
        var tenantString = '';
        const currentUrl = tabs[0].url.toLowerCase();
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
        const tenantIndex = currentUrl.indexOf("tenant=")
        if (tenantIndex !== -1) {
            const firstAmpersandIndex = currentUrl.indexOf("&", tenantIndex);
            if (firstAmpersandIndex !== -1) {
                var tenantString = currentUrl.substring(tenantIndex, firstAmpersandIndex);
            } else {
                var tenantString = currentUrl.substring(tenantIndex);
            }
        }

        // Add time saved
        addTimeSaved(15);

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