const questao = document.querySelector("#questao h1");
const respostas = document.querySelector(".alternativas");
const pontuacao = document.querySelector("#pontuacao");
const container = document.querySelector(".container");

let pontos = 0;
let questaoAtual = 0;

//array para as perguntas

const questoes = [
    {
        questaoConst: "1) Qual é a unidade básica de dados na computação que pode assumir os valores 0 ou 1?",
        answers: [
          { option: "A) Byte", correct: false },
          { option: "B) Bit", correct: true },
          { option: "C) Kilobyte", correct: false },
          { option: "D) Megabit", correct: false },
        ],
    },

      {
        questaoConst: "2) O que significa a sigla CPu em computação?",
        answers: [
          { option: "A) Core Peripheral Unit", correct: false },
          { option: "B) Computer Personal Unit", correct: false },
          { option: "C) Control Program Usage", correct: false },
          { option: "D) Central Processing Unit", correct: true },
        ],
    },

      {
        questaoConst: "3) O que é um algoritmo?",
        answers: [
          {option: "A) Um tipo de software", correct: false },
          {option: "B) Uma sequência de passos para resolver um problema", correct: true },
          {option: "C) Um hardware de alta performance", correct: false },
          {option: "D) Uma linguagem de programação", correct: false },
        ],
    },

      {
        questaoConst: "4) Qual protocolo é usado para transferir páginas web na internet?",
        answers: [
          {option: "A) FTP", correct: false },
          {option: "B) SMTP", correct: false },
          {option: "C) HTTP", correct: true },
          {option: "D) TCP", correct: false },
        ],
    },

      {
        questaoConst: "5) Qual é a principal função do sistema operacional?",
        answers: [
          {option: "A) Gerenciar hardware e software", correct: true },
          {option: "B) Proteger contra vírus", correct: false },
          {option: "C) Executar cálculos complexos", correct: false },
          {option: "D) Criar programas", correct: false },
        ],
    },

      {
       questaoConst: "6) O que significa a sigla URL?",
       answers: [
         {option: "A) Universal Resource Locator", correct: false },
         {option: "B) Unique Retrieval Link", correct: false },
         {option: "C) Uniform Resource Locator", correct: true },
         {option: "D) Unified Reference Language", correct: false },
      ],
    },

    {
      questaoConst: "7) O que significa 'open source' no contexto de software?",
      answers: [
          {option: "A) Software que exige pagamento para uso", correct: false },
          {option: "B) Software que funciona apenas em código aberto", correct: false },
          {option: "C) Software de uso exclusivo para empresas", correct: false },
          {option: "D) Software que pode ser alterado e distribuído livremente", correct: true },
      ],
    },

    {
      questaoConst: "8) Qual é o principal objetivo de uma linguagem de marcação como HTML?",
      answers: [
          {option: "A) Criar scripts para interatividade", correct: false },
          {option: "B) Definir a estrutura de uma página web", correct: true },
          {option: "C) Estilizar elementos da página", correct: false },
          {option: "D) Processar dados no servidor", correct: false },
      ],
    },

    {
      questaoConst: "9) O que é um endereço IP?",
      answers: [
          {option: "A) Um identificador único para dispositivos em uma rede", correct: true },
          {option: "B) Um protocolo de transferência de arquivos", correct: false },
          {option: "C) Um tipo de memória volátil", correct: false },
          {option: "D) Um sistema de segurança para redes", correct: false },
      ],
    },

    {
      questaoConst: "10) Qual é o propósito do comando 'ping' em redes de computadores?",
      answers: [
          {option: "A) Testar a conectividade entre dispositivos", correct: true },
          {option: "B) Monitorar o uso de memória", correct: false },
          {option: "C) Verificar o status de arquivos no sistema", correct: false },
          {option: "D) Configurar o endereço IP de um dispositivo", correct: false },
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

