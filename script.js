window.addEventListener('DOMContentLoaded', () => {

    // --- Bloco de código para index.html ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Lógica dos Astronautas, Formulário e Modal
        const astroContainer = document.getElementById('astro-container');
        if (astroContainer) {
            const astronautImages = ['Astro Foguete.png', 'Astro Peso.png', 'Astro Super.png', 'Astro Voo.png'];
            function createRandomAstronaut() {
                const astroImg = document.createElement('img');
                const randomImage = astronautImages[Math.floor(Math.random() * astronautImages.length)];
                astroImg.src = `Imagens/${randomImage}`;
                astroImg.className = 'astro-dynamic';
                const startX = Math.random() * window.innerWidth; const startY = window.innerHeight + 150;
                const endX = startX + (Math.random() * 400 - 200); const endY = -200;
                astroImg.style.left = `${startX}px`; astroImg.style.top = `${startY}px`;
                const duration = Math.random() * 8 + 10; const delay = Math.random() * 5;
                astroImg.style.transition = `transform ${duration}s linear ${delay}s`;
                astroContainer.appendChild(astroImg);
                setTimeout(() => { astroImg.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`; }, 100);
                setTimeout(() => { astroImg.remove(); }, (duration + delay) * 1000 + 1000);
            }
            function spawnAstronauts() { createRandomAstronaut(); const randomInterval = Math.random() * 5000 + 3000; setTimeout(spawnAstronauts, randomInterval); }
            spawnAstronauts();
        }

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            localStorage.setItem('playerFullName', document.getElementById('fullname').value);
            localStorage.setItem('playerEmail', document.getElementById('email').value);
            window.location.href = 'game.html';
        });
        
        const tutorialModal = document.getElementById('tutorialModal');
        const tutorialBtn = document.getElementById('tutorialBtn');
        const closeBtn = tutorialModal.querySelector('.close-btn');
        tutorialBtn.onclick = function() { tutorialModal.style.display = 'flex'; }
        closeBtn.onclick = function() { tutorialModal.style.display = 'none'; }
        window.onclick = function(event) { if (event.target == tutorialModal) { tutorialModal.style.display = 'none'; } }
    }

    // --- Bloco de código para game.html ---
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        
        const timerEl = document.getElementById('timer');
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const multiplierEl = document.getElementById('multiplier');
        const progressBarEl = document.getElementById('level-progress-bar');
        const gameUi = document.querySelector('.game-ui');
        const resultsScreen = document.getElementById('resultsScreen');
        const finalScoreEl = document.getElementById('finalScore');
        const mistakesListEl = document.getElementById('mistakesList');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn'); // Botão Menu Inicial
        
        let score = 0, lives = 3, timeLeft = 60, timerInterval;
        const sentencesOnScreen = [];
        let mistakeTracker = {};
        let currentLevel = 1;
        let correctHitCounter = 0;
        let scoreMultiplier = 1;

        const levelThresholds = { 2: 350, 3: 900, 4: Infinity };
        const config = { 1: { sentenceCount: 7, speed: 1.3 }, 2: { sentenceCount: 10, speed: 1.8 }, 3: { sentenceCount: 12, speed: 2.4 }};
        const sentencesByLevel = {
            1: [
                { text: 'Posso ajudar em mais alguma coisa?', correct: true, correction: null }, { text: 'Sua solicitação foi registrada com sucesso.', correct: true, correction: null }, { text: 'Lamento pelo transtorno e agradeço a sua paciência.', correct: true, correction: null }, { text: 'O sistema está instável hoje.', correct: true, correction: null }, { text: 'Por favor, confirme seus dados para eu poder continuar.', correct: true, correction: null }, { text: 'Os sistema estão instáveis hoje.', correct: false, correction: 'Erro de concordância nominal. O correto é: "O sistema está..."' }, { text: 'A gente vamos verificar o que aconteceu.', correct: false, correction: 'Erro de concordância verbal. O correto é: "A gente vai..." ou "Nós vamos..."' }, { text: 'O cliente está de mal humor.', correct: false, correction: 'Erro de ortografia. "Mal" é o oposto de "bem". "Mau" é o oposto de "bom". O correto é: "mau humor".' }, { text: 'Vou estar verificando sua solicitação.', correct: false, correction: 'Gerundismo. A forma mais direta e profissional é: "Vou verificar sua solicitação."' }, { text: 'Segue em anexo as fatura solicitada.', correct: false, correction: 'Erro de concordância. O correto é: "Segue em anexo a fatura..." ou "Seguem em anexo as faturas..."' }, { text: 'Tem poblemas com sua fatura?', correct: false, correction: 'Erro de ortografia. O correto é "problemas".' }, { text: 'Seje paciente, por favor.', correct: false, correction: 'Erro de conjugação verbal. O correto é "Seja paciente...".' },
            ],
            2: [
                { text: 'Compreendo sua frustração e lamento pelo ocorrido.', correct: true, correction: null }, { text: 'Seguem anexas as faturas solicitadas.', correct: true, correction: null }, { text: 'Houveram muitas reclamações sobre esse serviço.', correct: false, correction: 'O verbo "haver" no sentido de "existir" é impessoal: "Houve muitas reclamações..."' }, { text: 'Faz muitos anos que sou cliente.', correct: true, correction: null }, { text: 'É proíbido a entrada de pessoas não autorizadas.', correct: false, correction: 'Sem o artigo, a concordância é "proibido". Com artigo "a", o correto é: "É proibida a entrada..."' }, { text: 'Estou aqui para o que for preciso.', correct: true, correction: null }, { text: 'Ficou algumas dúvidas sobre o procedimento?', correct: false, correction: 'Concordância verbal. Correto: "Ficaram algumas dúvidas?"' }, { text: 'Existe muitas possibilidades de resolvermos isso.', correct: false, correction: 'Concordância verbal. Correto: "Existem muitas possibilidades..."' }
            ],
            3: [
                { text: 'Agradecemos à preferência.', correct: false, correction: 'Não há crase antes de substantivos gerais sem artigo definido. Correto: "Agradecemos a preferência."' }, { text: 'O procedimento visa à melhoria contínua dos nossos serviços.', correct: true, correction: null }, { text: 'Vou verificar o seu caso e dar-lhe um retorno o mais breve possível.', correct: true, correction: null }, { text: 'Prefiro mais agilidade do que um desconto.', correct: false, correction: 'O verbo "preferir" já indica uma escolha. Correto: "Prefiro agilidade a um desconto."' }, { text: 'O suporte informou que a situação já foi resolvida.', correct: true, correction: null }, { text: 'Chegamos em São Paulo para a reunião.', correct: false, correction: 'Verbos de movimento usam "a". Correto: "Chegamos a São Paulo..."' }, { text: 'O produto está disponível a pronta entrega.', correct: false, correction: 'A expressão "à pronta entrega" exige crase.' }, { text: 'Ficamos felizes em tê-lo como cliente.', correct: true, correction: null }
            ]
        };
        let currentSentences = sentencesByLevel[currentLevel];
       
        function getSentenceFromDOM(element) { return Object.values(sentencesByLevel).flat().find(s => s.text === element.textContent); }
        
        function updateProgressBar() {
            const prevThreshold = (currentLevel === 1) ? 0 : levelThresholds[currentLevel];
            const nextThreshold = levelThresholds[currentLevel + 1];
            if (!nextThreshold || nextThreshold === Infinity) {
                progressBarEl.style.width = '100%';
                return;
            }
            const range = nextThreshold - prevThreshold;
            const progressInLevel = score - prevThreshold;
            const progress = (progressInLevel / range) * 100;
            progressBarEl.style.width = `${Math.max(0, Math.min(progress, 100))}%`;
        }
        
        function updateUI() {
            scoreEl.textContent = score;
            livesEl.textContent = '❤️'.repeat(lives);
            multiplierEl.textContent = `x${scoreMultiplier}`;
            if (scoreMultiplier > 1) { multiplierEl.classList.add('active'); } 
            else { multiplierEl.classList.remove('active'); }
            updateProgressBar();
        }

        function removeSentence(sentenceEl, delay = 0) {
            setTimeout(() => {
                const index = sentencesOnScreen.findIndex(s => s.element === sentenceEl);
                if (index > -1) { sentencesOnScreen.splice(index, 1); }
                if (sentenceEl.parentElement) {
                    sentenceEl.remove();
                }
            }, delay);
        }

        function handleSentenceClick(event) {
            const clickedEl = event.target;
            const sentenceData = getSentenceFromDOM(clickedEl);
            if (!sentenceData || clickedEl.classList.contains('clicked')) return;
            
            clickedEl.classList.add('clicked');

            if (sentenceData.correct) {
                correctHitCounter++;
                if (correctHitCounter >= 5) { scoreMultiplier = 2; }
                score += (5 + timeLeft) * scoreMultiplier;
                
                clickedEl.classList.add('correct-flash');
                setTimeout(() => {
                    removeSentence(clickedEl);
                    if (correctHitCounter % 5 === 0 && correctHitCounter > 0) {
                        refreshBoard(true);
                    } else {
                        checkBoardStateAndReplace();
                    }
                    checkLevelUp();
                    updateUI();
                }, 500);

            } else {
                lives--;
                correctHitCounter = 0;
                scoreMultiplier = 1;
                const mistakeText = sentenceData.text;
                if (mistakeTracker[mistakeText]) { mistakeTracker[mistakeText].count++; }
                else { mistakeTracker[mistakeText] = { count: 1, correction: sentenceData.correction }; }
                
                clickedEl.classList.add('incorrect-shake');
                
                setTimeout(() => {
                    removeSentence(clickedEl);
                    checkBoardStateAndReplace();
                    updateUI();
                    if (lives <= 0) { endGame(); }
                }, 500);
            }
            updateUI();
        }

        function createSentence(forceCorrect = false) {
            let sentencePool = currentSentences; if (forceCorrect) { sentencePool = currentSentences.filter(s => s.correct); }
            const existingTexts = sentencesOnScreen.map(s => s.element.textContent);
            let availablePool = sentencePool.filter(s => !existingTexts.includes(s.text));
            if (availablePool.length === 0) { availablePool = sentencePool; }
            if (availablePool.length === 0) return;
            const sentenceData = availablePool[Math.floor(Math.random() * availablePool.length)];
            const sentenceEl = document.createElement('div'); sentenceEl.classList.add('sentence'); sentenceEl.textContent = sentenceData.text;
            const topBoundary = gameUi.offsetHeight + 10;
            const x = Math.random() * (gameContainer.clientWidth - 250);
            const y = Math.random() * (gameContainer.clientHeight - topBoundary - 100) + topBoundary;
            const angle = Math.random() * 2 * Math.PI; const speed = config[currentLevel].speed * (Math.random() * 0.5 + 0.75);
            sentenceEl.style.left = `${x}px`; sentenceEl.style.top = `${y}px`;
            const sentenceObj = { element: sentenceEl, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
            sentencesOnScreen.push(sentenceObj);
            gameContainer.appendChild(sentenceEl);
            sentenceEl.addEventListener('click', handleSentenceClick);
        }

        function checkBoardStateAndReplace() {
            const correctOnScreen = sentencesOnScreen.filter(s => getSentenceFromDOM(s.element)?.correct).length;
            if (correctOnScreen < 1) { createSentence(true); } else { createSentence(false); }
        }
        
        function refreshBoard(isCombo) {
            if (isCombo) {
                const reshuffleIndicator = document.createElement('div');
                reshuffleIndicator.textContent = "COMBO x2!";
                reshuffleIndicator.className = 'game-indicator';
                document.body.appendChild(reshuffleIndicator);
                setTimeout(() => { reshuffleIndicator.style.opacity = 1; }, 10);
                setTimeout(() => { 
                    reshuffleIndicator.style.opacity = 0; 
                    setTimeout(() => { reshuffleIndicator.remove(); }, 500);
                }, 1000);
            }
            sentencesOnScreen.forEach(s => s.element.remove());
            sentencesOnScreen.length = 0;
            for (let i = 0; i < config[currentLevel].sentenceCount; i++) { createSentence(false); }
            ensureCorrectOption();
        }

        function ensureCorrectOption() {
            const hasCorrect = sentencesOnScreen.some(s => getSentenceFromDOM(s.element)?.correct);
            if (!hasCorrect && sentencesOnScreen.length > 0) {
                removeSentence(sentencesOnScreen[0].element);
                createSentence(true);
            }
        }
        
        function resetGame() {
            score = 0; lives = 3; timeLeft = 60; currentLevel = 1;
            correctHitCounter = 0; scoreMultiplier = 1; mistakeTracker = {};
            currentSentences = sentencesByLevel[currentLevel];
            resultsScreen.style.display = 'none';
            gameContainer.innerHTML = '';
            gameUi.style.display = 'flex';
            startGame();
        }
        
        if(playAgainBtn) {
            playAgainBtn.addEventListener('click', resetGame);
        }

        if(mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        function startGame() {
            updateUI();
            startTimer();
            refreshBoard(false);
            animateSentences();
        }
        
        function startTimer() {
            timerEl.textContent = timeLeft;
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                if (timeLeft <= 0) { endGame(); }
            }, 1000);
        }
        
        function checkLevelUp() {
            const nextLevel = currentLevel + 1;
            if (levelThresholds[nextLevel] && score >= levelThresholds[nextLevel]) {
                currentLevel = nextLevel;
                currentSentences = sentencesByLevel[currentLevel];
                timeLeft = 60;
                correctHitCounter = 0;
                scoreMultiplier = 1;
                
                clearInterval(timerInterval);
                const nextLevelScreen = document.createElement('div');
                nextLevelScreen.className = 'modal-container';
                nextLevelScreen.style.display = 'flex';
                nextLevelScreen.innerHTML = `<div class="modal-content" style="text-align: center;"><h2>Nível ${currentLevel}</h2><p>A dificuldade vai aumentar. Prepare-se!</p><button>Continuar</button></div>`;
                document.body.appendChild(nextLevelScreen);
                
                nextLevelScreen.querySelector('button').onclick = () => {
                    nextLevelScreen.remove();
                    refreshBoard(false);
                    startTimer();
                };
            }
        }
        
        let animationFrameId;
        function animateSentences() {
            const topBoundary = gameUi.offsetHeight + 10;
            const rightBoundary = gameContainer.clientWidth;
            for (const sentence of sentencesOnScreen) {
                sentence.x += sentence.vx; sentence.y += sentence.vy;
                if (sentence.x <= 0) { sentence.x = 0; sentence.vx *= -1; }
                else if (sentence.x + sentence.element.clientWidth >= rightBoundary) { sentence.x = rightBoundary - sentence.element.clientWidth; sentence.vx *= -1; }
                if (sentence.y <= topBoundary) { sentence.y = topBoundary; sentence.vy *= -1; }
                else if (sentence.y + sentence.element.clientHeight >= gameContainer.clientHeight) { sentence.y = gameContainer.clientHeight - sentence.element.clientHeight; sentence.vy *= -1; }
                sentence.element.style.left = `${sentence.x}px`;
                sentence.element.style.top = `${sentence.y}px`;
            }
            animationFrameId = requestAnimationFrame(animateSentences);
        }
        
        function endGame() {
            clearInterval(timerInterval);
            cancelAnimationFrame(animationFrameId);
            gameUi.style.display = 'none';
            gameContainer.innerHTML = '';
            sentencesOnScreen.length = 0;
            
            finalScoreEl.textContent = score;
            const mistakes = Object.entries(mistakeTracker);
            if (mistakes.length === 0) {
                mistakesListEl.innerHTML = '<li>Parabéns! Nenhuma correção necessária nesta missão!</li>';
            } else {
                mistakesListEl.innerHTML = '';
                mistakes.forEach(([text, data]) => {
                    const li = document.createElement('li');
                    let mistakeHTML = `<div class="incorrect-text">${text}<span class="mistake-count">(${data.count}x)</span></div>`;
                    const correctionEl = document.createElement('div');
                    correctionEl.className = 'correct-text';
                    correctionEl.textContent = `Explicação: ${data.correction}`;
                    li.innerHTML = mistakeHTML;
                    li.appendChild(correctionEl);
                    mistakesListEl.appendChild(li);
                });
            }
            resultsScreen.style.display = 'flex';
        }

        function initializeGame() {
            if (gameContainer.clientHeight > 0) {
                startGame();
            } else {
                setTimeout(initializeGame, 50);
            }
        }
        
        initializeGame();
    }
});
