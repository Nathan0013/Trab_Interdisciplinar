const questao = document.querySelector("#questao h1");
const respostas = document.querySelector(".alternativas");
const pontuacao = document.querySelector("#pontuacao");
const container = document.querySelector(".container");

let pontos = 0;
let questaoAtual = 0;

//array para as perguntas

const questoes = [
  {
      questaoConst: "1) Qual é o maior bioma do Brasil em extensão territorial?",
      answers: [
        { option: "A) Mata Atlântica", correct: false },
        { option: "B) Cerrado", correct: false },
        { option: "C) Amazônia", correct: true },
        { option: "D) Pantanal", correct: false },
      ],
  },

  {
      questaoConst: "2) Qual bioma brasileiro é conhecido por sua vegetação densa e grande biodiversidade?",
      answers: [
        { option: "A) Pampa", correct: false },
        { option: "B) Pantanal", correct: false },
        { option: "C) Mata Atlântica", correct: true },
        { option: "D) Caatinga", correct: false },
      ],
  },

  {
      questaoConst: "3) Qual bioma é caracterizado por um clima seco e vegetação espinhosa?",
      answers: [
        { option: "A) Pantanal", correct: false },
        { option: "B) Amazônia", correct: false },
        { option: "C) Cerrado", correct: false },
        { option: "D) Caatinga", correct: true },
      ],
  },

  {
      questaoConst: "4) Qual bioma brasileiro sofre maior desmatamento devido à agropecuária?",
      answers: [
        { option: "A) Pantanal", correct: false },
        { option: "B) Amazônia", correct: true },
        { option: "C) Pampa", correct: false },
        { option: "D) Mata Atlântica", correct: false },
      ],
  },

  {
      questaoConst: "5) O que caracteriza o Pantanal?",
      answers: [
        { option: "A) Grandes altitudes", correct: false },
        { option: "B) Florestas tropicais", correct: false },
        { option: "C) Inundações periódicas", correct: true },
        { option: "D) Clima seco", correct: false },
      ],
  },

  {
     questaoConst: "6) Qual bioma é conhecido como a 'savana brasileira'?",
     answers: [
       { option: "A) Cerrado", correct: true },
       { option: "B) Amazônia", correct: false },
       { option: "C) Pampa", correct: false },
       { option: "D) Caatinga", correct: false },
    ],
  },

  {
    questaoConst: "7) Qual animal é um símbolo da Amazônia?",
    answers: [
        { option: "A) Lobo-guará", correct: false },
        { option: "B) Arara-azul", correct: false },
        { option: "C) Onça-pintada", correct: true },
        { option: "D) Tamanduá-bandeira", correct: false },
    ],
  },

  {
    questaoConst: "8) Qual bioma é encontrado no sul do Brasil e possui vegetação de gramíneas?",
    answers: [
        { option: "A) Pampa", correct: true },
        { option: "B) Cerrado", correct: false },
        { option: "C) Pantanal", correct: false },
        { option: "D) Mata Atlântica", correct: false },
    ],
  },

  {
    questaoConst: "9) Qual bioma é o lar de espécies como o lobo-guará e o tamanduá-bandeira?",
    answers: [
        { option: "A) Pampa", correct: false },
        { option: "B) Cerrado", correct: true },
        { option: "C) Amazônia", correct: false },
        { option: "D) Pantanal", correct: false },
    ],
  },

  {
    questaoConst: "10) Qual bioma brasileiro possui o maior número de rios e lagos?",
    answers: [
        { option: "A) Caatinga", correct: false },
        { option: "B) Amazônia", correct: false },
        { option: "C) Pantanal", correct: true },
        { option: "D) Pampa", correct: false },
    ],
  },
];


function carregaQuestao(){
    questao.textContent = questoes[questaoAtual].questaoConst;
    respostas.innerHTML = ""; //limpar
    
    questoes[questaoAtual].answers.forEach((resposta) => {
      const botao = document.createElement("button");
      botao.textContent = resposta.option;
      botao.addEventListener("click", () => verificaResposta(resposta.correct));
      respostas.appendChild(botao);
    });
}

function verificaResposta(certa) {
    if (certa) {
      pontos ++;
      pontuacao.textContent = `Pontuação: ${pontos}`; 
    }
    if (questaoAtual < questoes.length - 1) {
      questaoAtual++;
      carregaQuestao();
    }
    else{
      container.innerHTML = `
    <div class="espaco_pontuacao">
      <h1>Fim de Jogo!</h1>
      <h2>Você acertou ${pontos} de ${questoes.length}</h2>
    </div>
  `;
    }    
}



carregaQuestao();

