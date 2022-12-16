var colorSel = undefined; // color currently selected
var count = undefined;   // number of turns user took
var previousGuess = [];  // an array to store previous guesses of user
var isGameOver = undefined;  // status of the game (game is over or not)
var computerAnswer = undefined;  // computer answer key 
// dictionary for colors set
const colors = {
  B: "Blue",
  W: "White",
  R: "Red",
  P: "Purple",
  G: "Green",
  Y: "Yellow",
};
var parse = undefined;  // used to parse the JSON object

// To check if browser supports images
if (!document.images) {
  alert(
    "This browser doesn't support images. Page will not work properly. Upgrade your browser or try another browswer."
  );
}
// set Cookie for browser
if (!document.cookie) {
  setCookie();
}
/*
          Function's name: replaceAt
          @param: str, index, replaceValue
          @return: a new string after modifying from original string
          Purpose: change string's content [note: string object is immutable]
*/

const replaceAt = function (str, index, replaceValue) {
  let res = "";
  for (let i = 0; i < str.length; i++) {
    if (i === index) {
      res += replaceValue;
    } else {
      res += str[i];
    }
  }
  return res;
};

/*
          Function's name: generateComputerKey
          @param: 
          @return: a computer key  
          Purpose: generate a random computer key
*/

const generateComputerKey = () => {
  let computerAnswer = "";
  const colors = [null, "B", "W", "R", "P", "G", "Y"];
  for (let i = 1; i <= 4; i++) {
    let index = Math.floor(Math.random() * 6) + 1;
    computerAnswer += colors[index];
  }
  return computerAnswer;
};

/*
          Function's name: savegame
          @param: 
          @return:   
          Purpose: update local storage of game each turn
*/
const savegame = () => {
  // To check if browser supports localStorage
  if (typeof Storage === "undefined") {
    alert("The Local Storage is not supported in the web browser");
    return;
  }
  localStorage.setItem("sGame", JSON.stringify(newGame));
  setCookie();
};

/*
          Function's name: initialize
          @param: 
          @return:   
          Purpose: initialize the game  
*/
function initialize() {
  parse = JSON.parse(localStorage.getItem("sGame"));
  let gOver = getCookie();
  let promptS = `Game in progress:\n Do you want to continue playing it? \n
  'y' = continues with game. (Default - hit 'Enter key' or 'OK') \n
  any other key = starts a new game, or \n
  Cancel = starts a new game.`;

  // if turnno of sGame in local storage in range from 1 -> 9  & game status (from Cookies) is not over
  // then ask for restoring or starting new game

  // NOTE: For Chrome, Cookies won't work (gOver === "false" in this case) if a broswer doesn't open concurrently with a live editor. 
  // backup solution if the game won't ask about restoring: 
  // replace: gOver === "false" to parse.gover === "n"
  if (gOver === "false" && parse.turnno > 0 && parse.turnno < 10) {
    let input = prompt(promptS, "y");
    if (input !== "y") {
      newgame();
    } else {
      restoregame();
    }
  } else {
    newgame();
  }
}

/*
          Function's name: selectedcolor
          @param: color
          @return:   
          Purpose: display which color is selected
*/
function selectedcolor(color) {
  // check if game is over
  if (isGameOver) {
    alert("Game Over. Must hit ReStart to start a new game!");
    return;
  }
  colorSel = document.getElementById(color);
  document.getElementById("sInfo").value = "Selected: " + color;
}
/*
          Function's name: pastecolor
          @param: number
          @return:   
          Purpose: display which color is pasted
*/
function pastecolor(number) {
  // check if game is over
  if (isGameOver) {
    alert("Game Over. Must hit ReStart to start a new game!");
    return;
  }
  document.getElementById("sInfo").value = "Pasted: " + colorSel.id;
  newGame.colortopaste = colorSel.id;
  let colorPaste = document.getElementById(number);
  colorPaste.src = colorSel.src;
  let colorSelValue = colorSel.getAttribute("value");
  colorPaste.setAttribute("value", colorSelValue);
}
/*
          Function's name: checkanswer
          @param: 
          @return:   
          Purpose: check if user's guess matches with computer answer
*/
function checkanswer() {
  // check if game is over
  if (isGameOver) {
    alert("Game Over. Must hit ReStart to start a new game!");
    return;
  }
  // check if all answer boxes are filled
  for (let i = 1; i <= 4; i++) {
    let pasteValue = document.getElementById(`${i}`).getAttribute("value");
    // store current colors in local storage
    eval("newGame.curcolor" + i + "='" + colors[pasteValue] + "';");

    if (pasteValue === "") {
      alert(
        "All Answer Boxes must be filled with a Color prior to Check Answer."
      );
      return;
    }
  }

  // get guess value after checking answer
  let guessValue = "";
  for (let i = 1; i <= 4; i++) {
    let pasteValue = document.getElementById(`${i}`).getAttribute("value");
    guessValue += " " + pasteValue;
  }

  // check previous guesses and current guess is the same or not
  if (previousGuess.includes(guessValue)) {
    alert(
      "Your guess is probably the same as one of your previous guesses. Please try another guess!!!"
    );
    return;
  } else {
    previousGuess.push(guessValue);
  }

  // display guess
  document.getElementById(`Guess${count}`).value = guessValue;
  // store guess in local storage
  eval("newGame.guess" + count + "='" + guessValue + "';");

  // declaring a string copy of guessValue string (remove all space)
  let guessValueCopy = guessValue.replaceAll(" ", "");
  let computerAnswerCopy = computerAnswer;
  let clue = "";
  
  // Check exact colors exact position
  for (let i = 0; i < 4; i++) {
    if (computerAnswerCopy[i] === guessValueCopy[i]) {
      guessValueCopy = replaceAt(guessValueCopy, i, ".");
      computerAnswerCopy = replaceAt(computerAnswerCopy, i, ".");
      clue += "X";
    }
  }
  // Check right colors wrong position
  for (let i = 0; i < 4; i++) {
    if (computerAnswerCopy[i] !== ".") {
      for (let j = 0; j < 4; j++) {
        if (
          guessValueCopy[j] !== "." &&
          guessValueCopy[j] === computerAnswerCopy[i]
        ) {
          clue += "O";
          guessValueCopy = replaceAt(guessValueCopy, j, ".");
          break;
        }
      }
      computerAnswerCopy = replaceAt(computerAnswerCopy, i, ".");
    }
  }

  // display clue
  clue = clue.split("").join(" ");
  document.getElementById(`Clue${count}`).value = clue;

  // store clue in local
  eval("newGame.clues" + count + "='" + clue + "';");

  if (clue === "X X X X") {
    showwin(count);
    return;
  }

  document.getElementById("sInfo").value =
    "Checked Guesses. Turn#: " + count + " completed.";
  newGame.turnno++;
  count++;
  savegame();
  if (count > 10) {
    showlost();
    return;
  }
}
/*
          Function's name: showwin
          @param: tried
          @return:   
          Purpose: display message if user wins
*/
function showwin(tried) {
  let winMessage = "";
  switch (tried) {
    case 1:
      winMessage +=
        "You won: WOW! You are lucky. Take me to Las Vegas when you go. Answer was ";
      break;
    case 2:
      winMessage += "You won: Excellent! You are extremely lucky. Answer was ";
      break;
    case 3:
      winMessage += "You won: Superior! You are very lucky. Answer was ";
      break;
    case 4:
      winMessage +=
        "You won: Extremely Good! Your logic skills are great. Answer was ";
      break;
    case 5:
      winMessage +=
        "You won: Very Good! Your logic skills are very good. Answer was ";
      break;
    case 6:
      winMessage += "You won: Good! Your logic skills are good. Answer was ";
      break;
    case 7:
      winMessage +=
        "You won: Nicely Done! Your logic skills are developing very well. Answer was ";
      break;
    case 8:
      winMessage +=
        "You won: Smile! Your logic skills are doing well. Answer was ";
      break;
    case 9:
      winMessage +=
        "You won: Got it! Your logic skills are starting to show up. Answer was ";
      break;
    case 10:
      winMessage +=
        "You won: Right! Your logic skills are adequate. Answer was ";
      break;
  }
  isGameOver = true;
  document.getElementById("sInfo").value = winMessage + computerAnswer;
  // update gameOver in local storage
  newGame.turnno = count;
  newGame.gover = "y";
  savegame();
}
/*
          Function's name: showlost
          @param: 
          @return:   
          Purpose: display answer if user loses
*/
function showlost() {
  isGameOver = true;
  document.getElementById("sInfo").value =
    "You Lost. Your logic skills need practice. Keep playing game. Answer was " +
    computerAnswer;
  // update gameOver in local storage
  newGame.gover = "y";
  savegame();
}
/*
          Function's name: showhelp
          @param: 
          @return:   
          Purpose: pop up showhelp window
*/
function showhelp() {
  window.open(
    "UserHelp.html",
    "newwin",
    `toolbar=no,
      location=no,
      status=no,
      menubar=no,
      scrollbars=yes,
      resizable=yes,
      width=300,
      height=400`
  );
}
/*
          Function's name: newgame
          @param: 
          @return:   
          Purpose: reset everything to start a new game
*/
function newgame() {
  console.log("newgame")
  count = 1;
  isGameOver = false;
  previousGuess = [];
  colorSel = undefined;
  // renew computer answer
  computerAnswer = generateComputerKey();
  document.getElementById("sInfo").value = "Ready to play...";

  // reset default images
  for (let i = 1; i <= 4; i++) {
    document.getElementById(i).src = "QuestionRectangle.GIF";
    document.getElementById(i).setAttribute("value", "");
    eval("newGame.curcolor" + i + "= 'Question'");
  }

  // local storage setting
  localStorage.removeItem("sGame");
  newGame.turnno = 0;
  newGame.answer = computerAnswer;
  newGame.gover = "n";
  newGame.colortopaste = "?";

  for (let i = 1; i <= 10; i++) {
    document.getElementById(`Guess${i}`).value = "";
    eval("newGame.clues" + i + "= '?'");
    eval("newGame.guess" + i + "= '?'");
    document.getElementById(`Clue${i}`).value = "";
  }

  savegame();
}
/*
          Function's name: restoregame
          @param: 
          @return:   
          Purpose: restore the game if it has not finished yet
*/
function restoregame() {
  console.log("restoregame")
  document.getElementById("sInfo").value = "Game restored and ready to play...";
  // restore computer answer
  computerAnswer = parse.answer;
  newGame.answer = parse.answer;
  newGame.turnno = parse.turnno;
  count = parse.turnno + 1;
  // restore "gover"
  newGame.gover = "n";
  isGameOver = false;
  // restore "colortopaste"
  newGame.colortopaste = parse.colortopaste;
 

  for (let i = 1; i <= 4; i++) {
      // restore images
    document.getElementById(`${i}`).src = document.getElementById(
      eval("parse.curcolor" + i)).src;
      // set value for color pasted
    document.getElementById(i).setAttribute("value", eval("parse.curcolor" + i)[0]);
      // restore curcolors
      eval("newGame.curcolor" + i + " = " + "parse.curcolor" + i);
  }
   // restore guesses, clues & array of prevous guesses
  for (let i = 1; i <= count; i++) {
    document.getElementById(`Clue${i}`).value = eval("parse.clues" + i);
    eval("newGame.clues" + i + " = " + "parse.clues" + i);
    document.getElementById(`Guess${i}`).value = eval("parse.guess" + i);
    eval("newGame.guess" + i + " = " + "parse.guess" + i);
    previousGuess.push(eval("parse.guess" + i));
  }
  savegame();
}
/*
          Function's name: setCookie
          @param: 
          @return:   
          Purpose: set cookie for game's status to hold the status of the game
*/

function setCookie() {
  // set expiration day is 1 week
  const iExpdays = 7;
  var dNow = new Date();
  dNow.setTime(dNow.getTime() + iExpdays * 24 * 60 * 60 * 1000);
  document.cookie = `isGameOver=${encodeURIComponent(isGameOver)};`;
  document.cookie = `expires=${dNow.toUTCString()};`;
}

/*
          Function's name: getCookie
          @param: 
          @return:   
          Purpose: get cookie for game's status
*/
function getCookie() {
  let mycookie = document.cookie;
  fixed_cookie = decodeURIComponent(mycookie);
  thepairs = fixed_cookie.split(";");
  let res = undefined;
  thepairs.forEach((object) => {
    let element = object.split("=");
    let key = element[0],
      value = element[1];
    if (key !== null && key === "isGameOver") {
      res = value;
    }
  });
  return res;
}
