const keys = {
    "en": ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter", "z", "x", "c", "v", "b", "n", "m", "delete"],
    "de": ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü", "a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä", "enter", "y", "x", "c", "v", "b", "n", "m", "delete"]
}
const lang = "en";
let valid;
let solution;
const keyboard = document.querySelector(".keyboard");
const popup = document.getElementById("popup");
const tiles = [...document.querySelectorAll(".box>.tile")]
const tileLines = []
const wordSize = 5;
const maxGuesses = 6;
let currentLine;
let currentTile;

async function setWord() {
    const response = await fetch("files/words_en.json");
    valid = await response.json();
    solution = [...valid[Math.floor(Math.random()*valid.length)]];
    console.log(solution);
}

function showPopup(type) {
    if (type == "short") {
        popup.textContent = "Not enough letters";
    } else if (type == "invalid") {
        popup.textContent = "Invalid word";
    } else if (type == "loss") {
        popup.textContent = "Out of guesses :'(";
    } else if (type == "win") {
        popup.textContent = "You won !";
    }
    popup.show();
    setTimeout(() => {
        popup.close();
        popup.textContent = "";
    }, 4000);
}

function clickHandler(event) {
    if (!["enter", "delete"].includes(event.target.id) && currentTile) {
        insertLetter(event.target);
    } else if (event.target.id == "enter") {
        enterWord();
    } else if (event.target.id == "delete") {
        deleteLetter();
    }
}

function insertLetter(target) {
    currentTile.textContent = target.id;
    currentTile.classList.add("guessing");
    const index = currentLine.indexOf(currentTile);
    if (index >= wordSize) {
        currentTile = null;
    } else {
        currentTile = currentLine[index+1];
    }
}

function deleteLetter() {
    if (!currentTile) {
        currentTile = currentLine[currentLine.length-1];
    } else {
        const index = currentLine.indexOf(currentTile);
        if (index == 0) {
            return;
        }
        currentTile = currentLine[index-1];
    }
    currentTile.classList.remove("guessing");
    currentTile.textContent = "";
}

function getCurrentWord() {
    let word = "";
    currentLine.forEach((element) => {
        word += element.innerText;
    })
    return word.toLowerCase();
}

function checkDuplicateLetter(letter) {
    let missedChecked = 0;
     currentLine.forEach(element => {
        if (element.textContent.toLowerCase().trim() == letter && (element.classList.contains("missed") || element.classList.contains("correct"))) {
            missedChecked++
        }
    });
    if (missedChecked < solution.filter(x => x==letter).length) {
        return "missed";
    }
    else {return "incorrect";}
}

function enterWord() {
    if (document.querySelectorAll(".box>.guessing").length != 5) {
        showPopup("short");
        return;
    }

    const word = getCurrentWord();
    
    if (!valid.includes(word)) {
        showPopup("invalid");
        return;
    }

    currentLine.forEach((element, index) => {
        const letter = element.textContent.toLowerCase();
        let result;
        element.classList.remove("guessing");
        if (letter == solution[index]) {
            result = "correct";
        } else if (solution.includes(letter)) {
            result = checkDuplicateLetter(letter);
        } else {
            result = "incorrect";
        }
        element.classList.add(result);
        const key = document.querySelector(`.keyboard>#${letter}`);
        if (key.classList.length == 1) {
            key.classList.add(result);
        } else if (result == "correct") {
            key.classList.add(result);
        }
    });

    if (word == solution.join("")) {
        // end game win
        keyboard.classList.add("disabled")
        showPopup("win");
    } else {
        const lineIndex = tileLines.indexOf(currentLine);
        if (lineIndex+1 >= maxGuesses) {
            // end game loss !!!!
            keyboard.classList.add("disabled")
            showPopup("loss");
        } else {
            currentLine = tileLines[lineIndex+1];
            currentTile = currentLine[0];
        }
    }

}

function compileKeyboard() {
    keys[lang].forEach((key) => {
        const keyElement = keyboard.appendChild(document.createElement("div"));
        keyElement.textContent = key;
        keyElement.id = key;
        keyElement.classList.add("key");
        keyElement.style.gridArea = key;
        keyElement.addEventListener("click", clickHandler);
    });
}

function compileTileLines() {
    for (let i = 0; i < tiles.length; i += wordSize) {
        const chunk = tiles.slice(i, i + wordSize);
        tileLines.push(chunk);
    }
    currentLine = tileLines[0];
    currentTile = currentLine[0];
}

function init() {
    compileKeyboard();
    compileTileLines();
}

setWord().then(() => {
    init();
});
