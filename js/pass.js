let passwords = [];

function copyToClipBoard(text) {
    document.getElementById('info').innerText = text + ' Copied to Clipboard!';
    navigator.clipboard.writeText(text).catch(e => {
        document.getElementById('info').innerText = text + ' Failed to Copy to Clipboard!';
    });
}

function genWSN(keyLength = 9,
                wordLength = keyLength - 3,
                symbolLength = 1,
                numLength = 2) {
    let word = genFakeWord(wordLength, [1]);
    let symbol = getRandomSymbol(true, symbolLength);
    let number = getRandomNumbers(numLength);
    document.getElementById('password').value = word + symbol + number;
    copyToClipBoard(word + symbol + number);
}

function genFakeWord(length, upperCase = []) {
    let arr;
    let is_vowel = false;
    let word = '';
    if (upperCase.includes(-1)) {
        for (let i = 0; i < length; i++) {
            if (Math.random() >= 0.5) {
                upperCase.push(i);
            }
        }
    }
    for (let i = 0; i < length; i++) {
        if (upperCase.includes(i + 1)) {
            if (is_vowel) {
                arr = vowelU;
            } else {
                arr = consonantU;
            }
        } else {
            if (is_vowel) {
                arr = vowel;
            } else {
                arr = consonant;
            }
        }
        is_vowel = !is_vowel;
        word += arr.charAt(Math.floor(Math.random() * arr.length));
    }
    return word;
}

function getRandomSymbol(isSimple, num) {
    let symbol;
    if (isSimple) {
        symbol = '!#$&-_';
    } else {
        symbol = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    }
    let symbols = '';
    for (let i = 0; i < num; i++) {
        symbols += symbol.charAt(Math.floor(Math.random() * symbol.length));
    }
    return symbols
}

function getRandomNumbers(length) {
    let num = '';
    for (let i = 0; i < length; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

function getWordFromArray(maxLength = 0) {
    if (maxLength >= 1) {
        let validWords = [];
        wordList.forEach((wordAt, i) => {
            if (wordAt.length <= maxLength) {
                validWords.push(wordAt);
            }
        });
        let wordAt = Math.floor(Math.random() * validWords.length);
        return validWords[wordAt];

    } else {
        let wordAt = Math.floor(Math.random() * wordList.length);
        return wordList[wordAt];
    }
}

function genRealWord(maxLength = 0) {
    return getWordFromArray(maxLength);

}

function firstToUppercase(word) {
    const firstLetter = word.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = word.slice(1);
    return firstLetterCap + remainingLetters;
}

function genWordPassword(len,
                         cap = false,
                         capAll = false,
                         sym = false,
                         symNum = 1,
                         symSimple = true,
                         num = false,
                         numNum = 2) {
    let password = '';
    if (cap) {
        if (capAll) {
            for (let i = 0; i < len; i++) {
                password += firstToUppercase(genRealWord());
            }
        } else {
            password += firstToUppercase(genRealWord());
            for (let i = 1; i < len; i++) {
                password += genRealWord();
            }
        }
    } else {
        for (let i = 0; i < len; i++) {
            password += genRealWord();
        }
    }
    if (sym) {
        password += getRandomSymbol(symSimple, symNum);
    }
    if (num) {
        password += getRandomNumbers(numNum);
    }
    document.getElementById('password').value = password;
    copyToClipBoard(password);
}

function newPasswordEntry(name, user, pass, id) {
    let clone = document.getElementById('passEntry_').cloneNode(true);
    clone.id = clone.id + id;
    clone.name = clone.name + id;
    let cloneChildren = clone.childNodes;

    cloneChildren.forEach((childAt, i) => {
        childAt.id = childAt.id + id;
        switch (childAt.id.split('_')[0]) {
            case 'name':
                childAt.value = name;
                break;
            case 'username':
                childAt.value = user;
                break;
            case 'password':
                childAt.value = pass;
                break;
            default:
                break;
        }
    });
    return clone;
}

function updatePasswords() {
    let passwordList = document.getElementById('passwords');
    passwordList.innerHTML = '';
    if (passwords) {
        passwords.forEach((passAt, i) => {
            passwordList.appendChild(newPasswordEntry(passAt[0],
                passAt[1],
                passAt[2],
                i.toString()));
        });
    }
}

function getPasswordEntry() {
    let name = document.getElementById('name').value;
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;

    if (!user) {
        user = 'nouser';
    }
    if (!name) {
        name = 'noname';
    }
    if (pass) {
        return [name, user, pass];
    }
    return null;
}

function addPasswordEntry(num, entry) {
    if (num && entry && (entry.length === 3)) {
	passwords[num] = [entry[0], entry[1], entry[2]];
        updatePasswords();
	return true;
    }
    entry = getPasswordEntry();
    if (entry) {
        passwords.push(getPasswordEntry());
        updatePasswords();
        clearInputs();
	return true;
    }
    alert('Password is Empty!');
    return false;
}

function deletePasswordEntry(id) {
    let e = document.getElementById(id);
    let num = id.split('_')[1];
    if (e) {
	passwords.splice(num, 1);
	e.remove();
	updatePasswords();
    }
}

function editPasswordEntry (id) {
    let e = document.getElementById(id);
    let num = id.split('_')[1];
    let name = document.getElementById('name_' + num).value;
    let user = document.getElementById('username_' + num).value;
    let pass = document.getElementById('password_' + num).value;
    passwords[num] = [name, user, pass];
    updatePasswords();
    document.getElementById('info').innerText = 'Password changes saved! Name: ' + name + ' ID: ' + num;
}

function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function tryClearAll() {
    if (confirm('Are You Sure?')) {
        location.reload();
    }
}

function saveAll() {
    if (passwords.length === 0) {
        alert('No passwords to save!');
        return 0;
    }

    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    // showPrompt('Enter a valid file name:');
    const fileName = prompt('Enter a valid file name:')

    // Check if the user canceled the prompt or provided an invalid file name
    if (fileName === null) {
        alert('File name entry cancelled.');
        return 0;
    } else if (invalidChars.test(fileName)) {
        alert('File name contains invalid characters. Please try again.');
        return 0;
    }

    // Reverse passwords only if they exist and then prepend headers
    // passwords.forEach(entry => entry.reverse());
    const fileContent = [['NAME', 'USERNAME', 'PASSWORD'], ...passwords]
        .map(row => row.join(','))
        .join('\r\n');

    const timestamp = new Date().toISOString().split('T')[0];
    download(`${fileName}_${timestamp}.txt`, fileContent);
    return 1;
}

function old_saveAll() {
    if (passwords.length > 0) {
        let name = prompt('File Name?');
        if (name !== null) {
            passwords.forEach(e => {
                e.reverse();
            });
            passwords.unshift(['NAME', 'USERNAME', 'PASSWORD']);
            download(name + '_' + new Date().toISOString()
                .split('T')[0] + '.txt',
                passwords.join('\r\n'));
        }
    } else {
        alert('No Passwords to Save!');
    }
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(
            text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function genFakeUserPass(num) {
    genWSN();
    document.getElementById('name').value = genFakeWord(6);
    document.getElementById('username').value = genFakeWord(6);
    addPasswordEntry();
}

function togglePass(id) {
    let x = document.getElementById(id);
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function toggle(id) {
    let x = document.getElementById(id);
    if (x.hasAttribute("hidden")) {
        x.removeAttribute("hidden")
        x.style.display = "inline-block";
    } else {
        x.setAttribute("hidden", "")
        x.style.display = "none";
    }
}
