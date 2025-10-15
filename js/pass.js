/* pass.js
* Core Password Logic for Password Generator and Manager
*/
let passwords = [];

function copyToClipBoard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (window.onPasswordGenerated) window.onPasswordGenerated(text, { copied: true });
  }).catch(() => {
    if (window.onPasswordGenerated) window.onPasswordGenerated(text, { copied: false, type: 'error' });
  });
}

function genWSN(keyLength = 9,
  wordLength = keyLength - 3,
  symbolLength = 1,
  numLength = 2) {
  let word = genFakeWord(wordLength, [1]);
  let symbol = getRandomSymbol(true, symbolLength);
  let number = getRandomNumbers(numLength);
  const password = word + symbol + number;
  document.getElementById('password').value = password;
  copyToClipBoard(password);
  return password; // <-- return generated password for reuse
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
    WordList.forEach((wordAt, i) => {
      if (wordAt.length <= maxLength) {
        validWords.push(wordAt);
      }
    });
    let wordAt = Math.floor(Math.random() * validWords.length);
    return validWords[wordAt];

  } else {
    let wordAt = Math.floor(Math.random() * WordList.length);
    return WordList[wordAt];
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
  return password;
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
  let passWordList = document.getElementById('passwords');
  passWordList.innerHTML = '';
  if (passwords) {
    passwords.forEach((passAt, i) => {
      passWordList.appendChild(newPasswordEntry(passAt[0],
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

function editPasswordEntry(id) {
  let e = document.getElementById(id);
  let num = id.split('_')[1];
  let name = document.getElementById('name_' + num).value;
  let user = document.getElementById('username_' + num).value;
  let pass = document.getElementById('password_' + num).value;
  passwords[num] = [name, user, pass];
  updatePasswords();
  if (window.showFeedback) {
    window.showFeedback(`Password Entry Updated (Name: ${name} ID: ${num})`, 'success');
  }
}

function clearInputs() {
  document.getElementById('name').value = '';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function tryClearAll() {
  const doClear = () => {
    passwords = [];
    updatePasswords();
    clearInputs();
    if (window.showFeedback) window.showFeedback('All entries cleared', 'info');
  };
  if (window.customConfirm) {
    customConfirm('This will remove ALL saved password entries. Continue?', {
      title: 'Clear All Password Entries',
      okText: 'Yes, Clear All',
      cancelText: 'Cancel',
      okType: 'danger'
    }).then(ok => { if (ok) doClear(); });
  } else {
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
  const generated = genWSN(); // capture password
  document.getElementById('name').value = genFakeWord(6);
  document.getElementById('username').value = genFakeWord(6);
  addPasswordEntry();
  // restore password field so user can see/copy it after adding entry
  document.getElementById('password').value = generated;
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

// words.js Helpers

const vowel = 'aeiou';
const consonant = 'bcdfghjklmnprstvwxyz';
const vowelU = 'AEIOU';
const consonantU = 'BCDFGHJKLMNPRSTVWXYZ';
const vowelList = vowel.concat(vowelU);
const consonantList = consonant.concat(consonantU);
const numberList = '0123456789';
const symbolList = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const simpleSymbolList = '!#$&-_';

const shortestWordSize = WordList.reduce((shortestWord,
  currentWord) => currentWord.length < shortestWord.length ? currentWord : shortestWord,).length;
const longestWordSize = WordList.reduce((longestWord,
  currentWord) => currentWord.length > longestWord.length ? currentWord : longestWord,).length;
//Object key array with minLength, maxLength, and min/max/exactly the number of
// WordList to gen generate({minLength: 1, maxLength: 4, min: 9})
function generate(options) {
  // initalize random number generator for WordList if options.seed is
  // provided
  const { minLength, maxLength, ...rest } = options || {};

  function word() {
    let min = typeof minLength !== 'number' ? shortestWordSize : limitWordSize(
      minLength);
    const max = typeof maxLength !== 'number' ? longestWordSize : limitWordSize(
      maxLength);
    if (min > max) {
      min = max;
    }
    let rightSize = false;
    let wordUsed;
    while (!rightSize) {
      wordUsed = generateRandomWord();
      rightSize = wordUsed.length <= max && wordUsed.length >= min;
    }
    return wordUsed;
  }

  function generateRandomWord() {
    return WordList[randInt(WordList.length)];
  }

  // limits the size of WordList to the minimum and maximum possible
  function limitWordSize(wordSize) {
    if (wordSize < shortestWordSize) {
      wordSize = shortestWordSize;
    }
    if (wordSize > longestWordSize) {
      wordSize = longestWordSize;
    }
    return wordSize;
  }

  // random int as seeded by options.seed if applicable, or Math.random()
  // otherwise no seed
  function randInt(lessThan) {
    const r = Math.random();
    return Math.floor(r * lessThan);
  }

  // No arguments = generate one word
  if (options === undefined) {
    return word();
  }
  // Just a number = return that many WordList
  if (typeof options === 'number') {
    options = { exactly: options };
  } else if (Object.keys(rest).length === 0) {
    return word();
  }
  // options supported: exactly, min, max, join
  if (options.exactly) {
    options.min = options.exactly;
    options.max = options.exactly;
  }
  // not a number = one word par string
  if (typeof options.wordsPerString !== 'number') {
    options.wordsPerString = 1;
  }
  //not a function = returns the raw word
  if (typeof options.formatter !== 'function') {
    options.formatter = (word) => word;
  }
  //not a string = separator is a space
  if (typeof options.separator !== 'string') {
    options.separator = ' ';
  }
  const total = options.min + randInt(options.max + 1 - options.min);
  let results = [];
  let token = '';
  let relativeIndex = 0;
  for (let i = 0; i < total * options.wordsPerString; i++) {
    if (relativeIndex === options.wordsPerString - 1) {
      token += options.formatter(word(), relativeIndex);
    } else {
      token += options.formatter(word(),
        relativeIndex) + options.separator;
    }
    relativeIndex++;
    if ((i + 1) % options.wordsPerString === 0) {
      results.push(token);
      token = '';
      relativeIndex = 0;
    }
  }
  if (typeof options.join === 'string') {
    results = results.join(options.join);
  }
  return results;
}

function count(options) {
  let { minLength, maxLength } = options || {};
  if (typeof minLength !== 'number') {
    minLength = shortestWordSize;
  }
  if (typeof maxLength !== 'number') {
    maxLength = longestWordSize;
  }
  return WordList.filter((word) => word.length >= minLength && word.length <= maxLength).length;
}
