// Ficheiro: script.js

// --- LÓGICA DA PÁGINA DE LOGIN (index.html) ---

// Verifica se estamos na página de login antes de executar o código relacionado a ela
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        // Impede o envio padrão do formulário
        event.preventDefault(); 

        // Coleta os dados do jogador
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const difficulty = document.getElementById('difficulty').value;

        // Armazena os dados no navegador para usar na próxima página
        localStorage.setItem('playerFullName', fullname);
        localStorage.setItem('playerEmail', email);
        localStorage.setItem('gameDifficulty', difficulty);

        // Redireciona o jogador para a página do jogo
        window.location.href = 'game.html';
    });
}

// --- LÓGICA DA PÁGINA DO JOGO (game.html) ---

// Verifica se estamos na página do jogo
if (document.getElementById('game-container')) {
    // Elementos da Interface
    const timerEl = document.getElementById('timer');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const gameContainer = document.getElementById('game-container');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreEl = document.getElementById('finalScore');
    const gameOverTitleEl = document.getElementById('gameOverTitle');

    // Variáveis do Jogo
    let score = 0;
    let lives = 3;
    let timeLeft = 60; // 60 segundos
    let timerInterval;
    const sentencesOnScreen = []; // Guarda as frases que estão na tela
    
    // Configurações baseadas na dificuldade
    const difficulty = localStorage.getItem('gameDifficulty') || 'easy';
    const config = {
        easy: { sentenceCount: 5, speed: 1 },
        medium: { sentenceCount: 8, speed: 1.5 },
        hard: { sentenceCount: 12, speed: 2 }
    };
    const gameConfig = config[difficulty];

    // Banco de Frases (Podes adicionar quantas quiseres)
    const allSentences = [
        { text: 'Nós fomos ao parque ontem.', correct: true },
        { text: 'A gente vamos na praia amanhã.', correct: false },
        { text: 'Fazem dois anos que não o vejo.', correct: false }, // Correto: Faz
        { text: 'Existem muitas estrelas no céu.', correct: true },
        { text: 'Houveram muitos problemas na reunião.', correct: false }, // Correto: Houve
        { text: 'Ela gosta de frutas, legumes e vegetais.', correct: true },
        { text: 'Se eu ver ele, eu aviso.', correct: false }, // Correto: vir
        { text: 'O gato deitou-se no sofá.', correct: true },
        { text: 'Para mim fazer o trabalho, preciso de silêncio.', correct: false }, // Correto: eu fazer
        { text: 'A questão foi resolvida por ele.', correct: true },
        { text: 'Comprei o livro para eu ler.', correct: true },
    ];

    // Função para iniciar o jogo
    function startGame() {
        updateUI();
        startTimer();
        // Cria o número inicial de frases na tela
        for (let i = 0; i < gameConfig.sentenceCount; i++) {
            createSentence();
        }
        // Inicia a animação
        animateSentences();
    }

    // Função para atualizar a interface (pontos, vidas)
    function updateUI() {
        scoreEl.textContent = score;
        livesEl.textContent = '❤️'.repeat(lives);
    }
    
    // Função para iniciar o temporizador
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame(false); // Acaba o jogo se o tempo esgotar
            }
        }, 1000);
    }

    // Função para criar uma nova frase na tela
    function createSentence() {
        // Escolhe uma frase aleatória do banco de frases
        const sentenceData = allSentences[Math.floor(Math.random() * allSentences.length)];

        const sentenceEl = document.createElement('div');
        sentenceEl.classList.add('sentence');
        sentenceEl.textContent = sentenceData.text;
        
        // Armazena a informação se a frase é correta ou não no próprio elemento
        sentenceEl.dataset.correct = sentenceData.correct;

        // Posição e velocidade iniciais aleatórias
        const x = Math.random() * (gameContainer.clientWidth - 150); // -150 para não nascer fora
        const y = Math.random() * (gameContainer.clientHeight - 50);
        const angle = Math.random() * 2 * Math.PI; // Ângulo aleatório
        const speed = gameConfig.speed * (Math.random() * 0.5 + 0.75); // Variação de velocidade
        
        sentenceEl.style.left = `${x}px`;
        sentenceEl.style.top = `${y}px`;
        
        const sentenceObj = {
            element: sentenceEl,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed, // Velocidade horizontal
            vy: Math.sin(angle) * speed  // Velocidade vertical
        };

        sentencesOnScreen.push(sentenceObj);
        gameContainer.appendChild(sentenceEl);

        // Adiciona o evento de clique
        sentenceEl.addEventListener('click', handleSentenceClick);
    }

    // Função para lidar com o clique em uma frase
    function handleSentenceClick(event) {
        const clickedEl = event.target;
        const isCorrect = clickedEl.dataset.correct === 'true';

        if (isCorrect) {
            // Calcula pontos com base no tempo restante
            score += 10 + Math.floor(timeLeft / 10);
            // Remove a frase clicada e adiciona uma nova
            removeSentence(clickedEl);
            createSentence();
        } else {
            lives--;
            if (lives <= 0) {
                endGame(false); // Fim de jogo por errar
            }
        }
        updateUI();
    }
    
    // Função para remover um elemento de frase
    function removeSentence(sentenceEl) {
        const index = sentencesOnScreen.findIndex(s => s.element === sentenceEl);
        if (index > -1) {
            sentencesOnScreen.splice(index, 1);
        }
        sentenceEl.remove();
    }

    // Função principal de animação (faz as frases flutuarem)
    function animateSentences() {
        for (const sentence of sentencesOnScreen) {
            // Atualiza a posição
            sentence.x += sentence.vx;
            sentence.y += sentence.vy;

            // Faz a frase "quicar" nas bordas da tela
            if (sentence.x <= 0 || sentence.x + sentence.element.clientWidth >= gameContainer.clientWidth) {
                sentence.vx *= -1; // Inverte a direção horizontal
            }
            if (sentence.y <= 0 || sentence.y + sentence.element.clientHeight >= gameContainer.clientHeight) {
                sentence.vy *= -1; // Inverte a direção vertical
            }

            // Aplica a nova posição ao elemento
            sentence.element.style.left = `${sentence.x}px`;
            sentence.element.style.top = `${sentence.y}px`;
        }
        // Continua a animação no próximo frame
        requestAnimationFrame(animateSentences);
    }
    
    // Função para terminar o jogo
    function endGame(win) {
        clearInterval(timerInterval); // Para o temporizador
        gameContainer.innerHTML = ''; // Limpa a tela do jogo
        sentencesOnScreen.length = 0; // Esvazia o array

        finalScoreEl.textContent = score;
        if (win) {
            gameOverTitleEl.textContent = "Parabéns, você venceu!";
        } else {
            gameOverTitleEl.textContent = "Fim da Missão!";
        }
        gameOverScreen.style.display = 'flex';
    }

    // Inicia o jogo quando a página carregar
    startGame();
}