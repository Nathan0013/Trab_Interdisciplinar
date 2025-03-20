import getWord from "./words.js";

const contentBtns = document.querySelector(".btns");
const contentGuessWord = document.querySelector(".guess-word");
const img = document.querySelector("img");
const contentClue = document.querySelector(".clue");
const btnNew = document.querySelector(".new");
btnNew.onclick = () => init();
let indexImg;

init();

function init() {
  indexImg = 1;
  img.src = `img/img1.png`;

  generateGuessSection();
  generateButtons();
}

function generateGuessSection() {
  contentGuessWord.textContent = "";

  const { word, clue } = getWord();
  const wordWithoutAccent = word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  Array.from(wordWithoutAccent).forEach((letter) => {
    const span = document.createElement("span");

    span.textContent = "_";
    span.setAttribute("word", letter.toUpperCase());
    contentGuessWord.appendChild(span);
  });

  contentClue.textContent = `Dica: ${clue}`;
}

function wrongAnswer() {
  indexImg++;
  img.src = `img/img${indexImg}.png`;

  if (indexImg === 7) {
    setTimeout(() => {
      alert("Perdeu :/");
      init();
    }, 100);
  }
}

function verifyLetter(letter) {
  const arr = document.querySelectorAll(`[word="${letter}"]`);

  if (!arr.length) wrongAnswer();

  arr.forEach((e) => {
    e.textContent = letter;
  });

  const spans = document.querySelectorAll(`.guess-word span`);
  const won = !Array.from(spans).find((span) => span.textContent === "_");

  if (won) {
    setTimeout(() => {
      alert("Ganhou!!!");
      init();
    }, 100);
  }
}
function handleForcaWin() {
  const playerName = localStorage.getItem('jogador') || 'Anonymous';
  const wordLength = document.querySelectorAll('.guess-word span').length;
  const errors = indexImg - 1;
  const score = calculateForcaScore(errors, wordLength);
  
  rankingManager.updatePlayerScore(playerName, 'forca', score);
  
  setTimeout(() => {
    alert(`Ganhou!!! Pontuação: ${score}`);
    init();
  }, 100);
}
const homeButton = document.querySelector('.home-button');
homeButton.addEventListener('click', (event) => {
    const confirmExit = confirm('Tem certeza que deseja voltar ao menu?');
    if (!confirmExit) {
        event.preventDefault(); // Cancela o redirecionamento se o jogador cancelar
    }
});
function generateButtons() {
  contentBtns.textContent = "";

  for (let i = 97; i < 123; i++) {
    const btn = document.createElement("button");
    const letter = String.fromCharCode(i).toUpperCase();
    btn.textContent = letter;

    btn.onclick = () => {
      btn.disabled = true;
      btn.style.backgroundColor = "gray";
      verifyLetter(letter);
    };

    contentBtns.appendChild(btn);
  }
}
function calculateForcaScore(errors, wordLength) {
  // Pontuação base: 100 pontos
  // Subtrai 10 pontos para cada erro
  // Adiciona um bônus com base no tamanho da palavra
  const baseScore = 100;
  const errorPenalty = errors * 10;
  const lengthBonus = wordLength * 5;
  
  return Math.max(0, baseScore - errorPenalty + lengthBonus);
}