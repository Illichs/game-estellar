window.addEventListener('DOMContentLoaded', () => {

    // --- Bloco de código para index.html ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        
        const tutorialModal = document.getElementById('tutorialModal');
        const loginWrapper = document.querySelector('.login-wrapper');
        const startGameBtn = document.getElementById('startGameBtn');
        
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            localStorage.setItem('playerFullName', document.getElementById('fullname').value);
            localStorage.setItem('playerTeam', document.getElementById('team').value);
            loginWrapper.style.display = 'none';
            tutorialModal.style.display = 'flex';
        });

        startGameBtn.addEventListener('click', () => {
            window.location.href = 'game.html';
        });

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
        
        const leaderboardModal = document.getElementById('leaderboardModal');
        const leaderboardIcon = document.getElementById('leaderboardIcon');
        const closeLeaderboardBtn = leaderboardModal.querySelector('.close-btn');
        const highScoresList = document.getElementById('highScoresList');

        const getMedal = (index) => {
            if (index === 0) return '🥇';
            if (index === 1) return '🥈';
            if (index === 2) return '🥉';
            return '';
        };

        const updateAndShowLeaderboard = async () => {
            highScoresList.innerHTML = '<li>Carregando placar...</li>';
            leaderboardModal.style.display = 'flex'; 

            try {
                const { collection, query, orderBy, limit, getDocs } = window.firestore;
                const scoresRef = collection(window.db, "highscores");
                const q = query(scoresRef, orderBy("score", "desc"), limit(20));
                
                const querySnapshot = await getDocs(q);
                const highScores = [];
                querySnapshot.forEach((doc) => { highScores.push(doc.data()); });

                if (highScores.length > 0) {
                    highScoresList.innerHTML = highScores.map((score, index) => `<li><div class="rank-info"><span class="rank-medal">${getMedal(index)}</span><div class="player-details"><span class="player-name">${index + 1}. ${score.name}</span><span class="team-name">${score.team}</span></div></div><div class="score-info"><span class="player-score">${score.score} pts</span><span class="level-badge">Nível ${score.level}</span></div></li>`).join('');
                } else {
                    highScoresList.innerHTML = '<li>Nenhuma pontuação registrada. Seja o primeiro!</li>';
                }
            } catch (error) {
                console.error("Erro ao buscar pontuações:", error);
                highScoresList.innerHTML = '<li>Erro ao carregar o placar. Tente novamente.</li>';
            }
        };

        leaderboardIcon.addEventListener('click', updateAndShowLeaderboard);
        closeLeaderboardBtn.addEventListener('click', () => { leaderboardModal.style.display = 'none'; });

        window.onclick = function(event) {
            if (event.target == leaderboardModal) { leaderboardModal.style.display = 'none'; }
        }
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
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        const playerNameEl = document.getElementById('playerName');
        const playerTeamEl = document.getElementById('playerTeam');
        
        let score = 0, lives = 3, timeLeft = 60, timerInterval;
        const sentencesOnScreen = [];
        let mistakeTracker = {};
        let currentLevel = 1;
        let correctHitCounter = 0;
        let scoreMultiplier = 1;

        const scoresModal = document.getElementById('scoresModal');
        const showScoresBtn = document.getElementById('showScoresBtn');
        const closeScoresBtn = scoresModal.querySelector('.close-scores-btn');
        const finalHighScoresList = document.getElementById('finalHighScoresList');
        
        const getMedal = (index) => {
            if (index === 0) return '🥇';
            if (index === 1) return '🥈';
            if (index === 2) return '🥉';
            return '';
        };

        showScoresBtn.addEventListener('click', async () => {
            finalHighScoresList.innerHTML = '<li>Carregando placar...</li>';
            scoresModal.style.display = 'flex';

            try {
                const { collection, query, orderBy, limit, getDocs } = window.firestore;
                const scoresRef = collection(window.db, "highscores");
                const q = query(scoresRef, orderBy("score", "desc"), limit(20));
                
                const querySnapshot = await getDocs(q);
                const highScores = [];
                querySnapshot.forEach((doc) => { highScores.push(doc.data()); });

                if (highScores.length > 0) {
                     finalHighScoresList.innerHTML = highScores.map((score, index) => `<li><div class="rank-info"><span class="rank-medal">${getMedal(index)}</span><div class="player-details"><span class="player-name">${index + 1}. ${score.name}</span><span class="team-name">${score.team}</span></div></div><div class="score-info"><span class="player-score">${score.score} pts</span><span class="level-badge">Nível ${score.level}</span></div></li>`).join('');
                } else {
                    finalHighScoresList.innerHTML = '<li>Nenhuma pontuação registrada.</li>';
                }
            } catch (error) {
                console.error("Erro ao buscar pontuações:", error);
                finalHighScoresList.innerHTML = '<li>Erro ao carregar o placar. Tente novamente.</li>';
            }
        });

        const closeTheScoresModal = () => { scoresModal.style.display = 'none'; };
        closeScoresBtn.addEventListener('click', closeTheScoresModal);
        window.addEventListener('click', (event) => {
            if (event.target == scoresModal) { closeTheScoresModal(); }
        });
        
        const levelThresholds = { 2: 350, 3: 900, 4: Infinity };
        const config = { 1: { sentenceCount: 7, speed: 0.8 }, 2: { sentenceCount: 10, speed: 1.0 }, 3: { sentenceCount: 12, speed: 1.2 }};
        const sentencesByLevel = {
            1: [
                { text: 'Sua solicitação foi registrada com sucesso.', correct: true, correction: null },
                { text: 'Posso ajudar em mais alguma coisa?', correct: true, correction: null },
                { text: 'Agradecemos o seu contato e a sua paciência.', correct: true, correction: null },
                { text: 'O sistema está instável no momento, peço que aguarde.', correct: true, correction: null },
                { text: 'Compreendo perfeitamente a sua situação.', correct: true, correction: null },
                { text: 'Vou verificar o procedimento e já lhe dou um retorno.', correct: true, correction: null },
                { text: 'Para sua segurança, por favor, confirme seu nome completo.', correct: true, correction: null },
                { text: 'A questão foi encaminhada para a equipe responsável.', correct: true, correction: null },
                { text: 'O cliente iniciou o atendimento de mal humor.', correct: false, correction: 'Erro de ortografia. "Mal" é o oposto de "bem". "Mau" é o oposto de "bom". O correto é: "mau humor".' },
                { text: 'Eu entendo sua frustração, mais não posso alterar o sistema.', correct: false, correction: 'Erro de ortografia. "Mas" é usado para indicar oposição. "Mais" é usado para indicar quantidade.' },
                { text: 'Houveram muitas ligações sobre a instabilidade hoje.', correct: false, correction: 'Erro de concordância. O verbo "haver" no sentido de "existir" é impessoal. O correto é: "Houve muitas ligações...".' },
                { text: 'As informação do cliente não bate com nosso registro.', correct: false, correction: 'Erro de concordância. O correto é: "As informações do cliente não batem...".' },
                { text: 'Por favor, seje paciente enquanto verifico o ocorrido.', correct: false, correction: 'Erro de ortografia e conjugação. A forma correta do verbo "ser" no imperativo é "seja".' },
                { text: 'O sistema precisa de mas tempo para processar.', correct: false, correction: 'Erro de ortografia. "Mais" é usado para indicar quantidade. "Mas" é usado para indicar oposição.' },
                { text: 'Segue anexo as duas faturas que você solicitou.', correct: false, correction: 'Erro de concordância. O correto é: "Seguem anexas as duas faturas...".' },
                { text: 'Acho que o cliente está com um poblema na conexão.', correct: false, correction: 'Erro de ortografia. A grafia correta da palavra é "problema".' }
            ],
            2: [
                { text: 'A supervisora nos orientou para que tivéssemos discrição.', correct: true, correction: null },
                { text: 'O prazo para eu finalizar o relatório é amanhã.', correct: true, correction: null },
                { text: 'Por favor, ratifique os dados para prosseguirmos com o cadastro.', correct: true, correction: null },
                { text: 'Se o problema persistir, entre em contato com o suporte.', correct: true, correction: null },
                { text: 'Ele se esforçou a fim de bater a meta do mês.', correct: true, correction: null },
                { text: 'Em vez de cancelar, o cliente decidiu alterar o plano.', correct: true, correction: null },
                { text: 'Quando o cliente vier à loja, entregue este documento a ele.', correct: true, correction: null },
                { text: 'É importante que você mantenha a calma durante atendimentos difíceis.', correct: true, correction: null },
                { text: 'A gerente pediu para mim fazer a ligação para o cliente.', correct: false, correction: 'Erro de pronome. Usa-se "eu" quando o pronome é o sujeito do verbo. O correto é: "pediu para eu fazer...".' },
                { text: 'Quando você ver o novo chamado, pode assumir a tarefa.', correct: false, correction: 'Erro de conjugação verbal. O futuro do subjuntivo do verbo "ver" é "vir". O correto é: "Quando você vir...".' },
                { text: 'Peço total descrição ao manusear os dados sensíveis.', correct: false, correction: 'Erro de vocabulário. "Discrição" significa reserva, prudência. "Descrição" é o ato de descrever. O correto é: "discrição".' },
                { text: 'Estou organizando a planilha afim de otimizar o processo.', correct: false, correction: 'Erro de ortografia. "A fim de" (separado) significa "com o objetivo de". "Afim" (junto) é um adjetivo que significa "semelhante".' },
                { text: 'Se o sistema manter o erro, teremos que abrir um chamado.', correct: false, correction: 'Erro de conjugação verbal. O futuro do subjuntivo do verbo "manter" é "mantiver". O correto é: "Se o sistema mantiver...".' },
                { text: 'Não há mais tarefas para mim fazer hoje.', correct: false, correction: 'Erro de pronome. Usa-se "eu" quando o pronome é o sujeito do verbo. O correto é: "tarefas para eu fazer...".' },
                { text: 'Preciso que você retifique o recebimento deste e-mail.', correct: false, correction: 'Erro de vocabulário. "Ratificar" significa confirmar. "Retificar" significa corrigir. O correto é: "ratifique o recebimento".' },
                { text: 'Ao invés de enviar um e-mail, ele preferiu ligar.', correct: false, correction: 'A expressão "em vez de" é mais adequada para substituições em geral. "Ao invés de" se usa para opostos diretos (subir/descer).' }
            ],
            3: [
                { text: 'O motivo por que liguei é para confirmar o seu endereço.', correct: true, correction: null },
                { text: 'Ele não explicou o porquê de sua ausência na reunião.', correct: true, correction: null },
                { text: 'Aonde devemos encaminhar esta solicitação de serviço?', correct: true, correction: null },
                { text: 'Não sei onde a equipe de suporte está alocada.', correct: true, correction: null },
                { text: 'Existem várias maneiras de contornar este problema.', correct: true, correction: null },
                { text: 'Havia apenas uma pendência em seu antigo cadastro.', correct: true, correction: null },
                { text: 'A última atualização do sistema ocorreu há duas semanas.', correct: true, correction: null },
                { text: 'O técnico chegará ao local daqui a uma hora.', correct: true, correction: null },
                { text: 'Aonde está o erro que você mencionou no sistema?', correct: false, correction: 'Erro de vocabulário. "Onde" é usado para lugares fixos. "Aonde" é usado com verbos de movimento. O correto é: "Onde está...".' },
                { text: 'Eu trabalho nesta empresa a mais de cinco anos.', correct: false, correction: 'Erro de ortografia. "Há" (com H) é usado para tempo passado. "A" (sem H) é usado para tempo futuro ou distância.' },
                { text: 'Você não respondeu o e-mail. Por que?', correct: false, correction: 'Erro de ortografia. "Por quê" (separado e com acento) é usado no final de frases interrogativas.' },
                { text: 'Deve existir muitas razões para a instabilidade.', correct: false, correction: 'Erro de concordância. O verbo "existir" concorda com o sujeito. O correto é: "Devem existir muitas razões...".' },
                { text: 'O técnico não sabe onde o time de desenvolvimento foi.', correct: false, correction: 'Erro de vocabulário. Com verbos de movimento (como "ir"), usa-se "aonde". O correto é: "...aonde o time... foi".' },
                { text: 'Gostaria de entender o porque de tanta demora.', correct: false, correction: 'Erro de ortografia. Quando é um substantivo e significa "o motivo", o correto é "porquê" (junto e com acento).' },
                { text: 'Daqui há alguns minutos o sistema deve voltar.', correct: false, correction: 'Erro de ortografia. Para indicar tempo futuro, usa-se "a" (sem H). O correto é: "Daqui a alguns minutos...".' },
                { text: 'A razão porquê ele ligou não foi informada.', correct: false, correction: 'Erro de ortografia. Quando pode ser substituído por "pela qual", o correto é "por que" (separado e sem acento).' }
            ]
        };

        let currentSentences = sentencesByLevel[currentLevel];
       
        function getSentenceFromDOM(element) { return Object.values(sentencesByLevel).flat().find(s => s.text === element.textContent); }
        
        function updateProgressBar() {
            const prevThreshold = (currentLevel === 1) ? 0 : levelThresholds[currentLevel];
            const nextThreshold = levelThresholds[currentLevel + 1];
            if (!nextThreshold || nextThreshold === Infinity) { progressBarEl.style.width = '100%'; return; }
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
                if (sentenceEl.parentElement) { sentenceEl.remove(); }
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
                    if (correctHitCounter > 0 && correctHitCounter % 5 === 0) { refreshBoard(true); } else { checkBoardStateAndReplace(); }
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
        
        if(playAgainBtn) { playAgainBtn.addEventListener('click', resetGame); }
        if(mainMenuBtn) { mainMenuBtn.addEventListener('click', () => { window.location.href = 'index.html'; }); }

        function startGame() {
            if (playerNameEl && playerTeamEl) {
                playerNameEl.textContent = localStorage.getItem('playerFullName') || 'Anônimo';
                playerTeamEl.textContent = localStorage.getItem('playerTeam') || 'Sem Equipe';
            }
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
        
        async function endGame() {
            const playerName = localStorage.getItem('playerFullName') || 'Cadete Anônimo';
            const playerTeam = localStorage.getItem('playerTeam') || 'Sem Equipe';
            
            try {
                const { collection, addDoc } = window.firestore;
                await addDoc(collection(window.db, "highscores"), {
                    name: playerName,
                    team: playerTeam,
                    score: score,
                    level: currentLevel,
                    createdAt: new Date()
                });
            } catch (error) {
                console.error("Erro ao salvar pontuação: ", error);
            }
            
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

