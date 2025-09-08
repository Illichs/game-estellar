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
            // SUAS CONFIGURAÇÕES DE ORIENTAÇÃO FORAM MANTIDAS
            const astronautData = [
                { file: 'Astro Alien Fog.png', orientation: 'none' },
                { file: 'Astro Baloon.png', orientation: 'right' },
                { file: 'Astro Band.png', orientation: 'none' },
                { file: 'Astro Carr Lua.png', orientation: 'none' },
                { file: 'Astro Estrela.png', orientation: 'none' },
                { file: 'Astro Foguete 2.png', orientation: 'right' },
                { file: 'Astro Foguete 3.png', orientation: 'right' },
                { file: 'Astro Lua.png', orientation: 'none' },
                { file: 'Astro Peso.png', orientation: 'none' },
                { file: 'Astro Pux Lua.png', orientation: 'right' },
                { file: 'Astro Super.png', orientation: 'right' },
                { file: 'Astro Voa Alie.png', orientation: 'left' },
                { file: 'Astro Voo.png', orientation: 'right' },
                { file: 'Astro Zen.png', orientation: 'none' },
                { file: 'Astro Foguete.png', orientation: 'left' }
            ];

            function createRandomAstronaut() {
                const astroImg = document.createElement('img');
                const randomAstronaut = astronautData[Math.floor(Math.random() * astronautData.length)];
                astroImg.src = `Imagens/${randomAstronaut.file}`;
                astroImg.className = 'astro-dynamic';
                const startX = Math.random() * window.innerWidth;
                const startY = window.innerHeight + 150;
                const endY = -200;
                const movementDirectionX = Math.random() < 0.5 ? -1 : 1;
                const horizontalMovementRange = window.innerWidth * 0.7;
                const endX = startX + (movementDirectionX * (Math.random() * horizontalMovementRange + window.innerWidth * 0.1));
                let scaleX = 1;
                if (randomAstronaut.orientation === 'right') {
                    if (movementDirectionX === -1) { scaleX = -1; }
                } else if (randomAstronaut.orientation === 'left') {
                    if (movementDirectionX === 1) { scaleX = -1; }
                } else {
                    scaleX = movementDirectionX;
                }
                astroImg.style.transform = `scaleX(${scaleX})`;
                astroImg.style.left = `${startX}px`;
                astroImg.style.top = `${startY}px`;
                const duration = Math.random() * 8 + 12;
                const delay = Math.random() * 7;
                astroImg.style.transition = `transform ${duration}s linear ${delay}s`;
                astroContainer.appendChild(astroImg);
                astroImg.offsetHeight;
                setTimeout(() => { astroImg.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scaleX(${scaleX})`; }, 100);
                setTimeout(() => { astroImg.remove(); }, (duration + delay) * 1000 + 1000);
            }

            function spawnAstronauts() {
                createRandomAstronaut();
                const randomInterval = Math.random() * 3000 + 2000;
                setTimeout(spawnAstronauts, randomInterval);
            }
            spawnAstronauts();
        }
        
        const leaderboardModal = document.getElementById('leaderboardModal');
        const leaderboardIcon = document.getElementById('leaderboardIcon');
        const closeLeaderboardBtn = leaderboardModal.querySelector('.close-btn');
        const highScoresList = document.getElementById('highScoresList');

        const getMedal = (index) => {
            if (index === 0) return '🥇'; if (index === 1) return '🥈'; if (index === 2) return '🥉'; return '';
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
        window.onclick = function(event) { if (event.target == leaderboardModal) { leaderboardModal.style.display = 'none'; } }
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
            if (index === 0) return '🥇'; if (index === 1) return '🥈'; if (index === 2) return '🥉'; return '';
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
        window.addEventListener('click', (event) => { if (event.target == scoresModal) { closeTheScoresModal(); } });
        
        const levelThresholds = { 2: 350, 3: 900, 4: Infinity };
        const config = { 1: { sentenceCount: 7, speed: 0.8 }, 2: { sentenceCount: 10, speed: 1.2 }, 3: { sentenceCount: 12, speed: 1.6 }};
       const sentencesByLevel = {
            1: [
                // NÍVEL 1: Fundamentos do Dia a Dia
                // Corretas
                { text: 'Aguarde um momento, por favor.', correct: true, correction: null },
                { text: 'O protocolo foi enviado ao seu e-mail.', correct: true, correction: null },
                { text: 'Não há mais pendências em seu cadastro.', correct: true, correction: null },
                { text: 'Obrigado por confirmar seus dados.', correct: true, correction: null },
                { text: 'Vou transferir sua ligação para o setor responsável.', correct: true, correction: null },
                { text: 'Nosso sistema está passando por uma atualização.', correct: true, correction: null },
                { text: 'Sua opinião é muito importante para nós.', correct: true, correction: null },
                { text: 'O boleto atualizado já está disponível.', correct: true, correction: null },
                // Incorretas
                { text: 'O sinal da internet está mau.', correct: false, correction: 'Mau é o contrário de Bom. O correto seria "sinal ruim" ou, se a frase fosse sobre o estado, "O sinal está mal".' },
                { text: 'Queria ajudar, mais o sistema não permite.', correct: false, correction: 'Mas é usado para oposição (sinônimo de "porém"). Mais indica quantidade.' },
                { text: 'Faltaram duas informações no seu cadastro.', correct: false, correction: 'Erro de concordância verbal. O correto é: "Faltaram duas informações...".' },
                { text: 'Vou analizar o seu caso com atenção.', correct: false, correction: 'Erro de ortografia. O correto é "analisar", com S.' },
                { text: 'O cliente ficou meio descontente com a solução.', correct: false, correction: 'A palavra "meio", quando adjetivo, é invariável. Correto: "meio descontente".' },
                { text: 'Houveram problemas na sua última fatura.', correct: false, correction: 'O verbo Haver, no sentido de existir, é impessoal. Correto: "Houve problemas...".' },
                { text: 'Estamos resolvendo o poblema o mais rápido possível.', correct: false, correction: 'Erro de ortografia. O correto é "problema".' },
                { text: 'Obrigado pela compreenção.', correct: false, correction: 'Erro de ortografia. O correto é "compreensão".' }
            ],
            2: [
                // NÍVEL 2: Comunicação Profissional
                // Corretas
                { text: 'Aguarde até que eu verifique o sistema.', correct: true, correction: null },
                { text: 'A descrição do problema foi muito clara, obrigado.', correct: true, correction: null },
                { text: 'Quando o senhor vier à agência, procure por mim.', correct: true, correction: null },
                { text: 'O gerente de tráfego de rede está analisando.', correct: true, correction: null },
                { text: 'Aja com discrição ao lidar com dados de clientes.', correct: true, correction: null },
                { text: 'A equipe interveio para resolver o problema.', correct: true, correction: null },
                { text: 'Estou aqui a fim de ajudar a resolver sua questão.', correct: true, correction: null },
                { text: 'O diretor ratificou a decisão do comitê.', correct: true, correction: null },
                // Incorretas
                { text: 'Pediram para mim resolver isso com urgência.', correct: false, correction: 'Mim não conjuga verbo. O correto é "para eu resolver".' },
                { text: 'Se você rever o histórico, encontrará o erro.', correct: false, correction: 'O futuro do subjuntivo do verbo "ver" é "vir". Correto: "Se você vir...".' },
                { text: 'O cliente agiu com muita descrição.', correct: false, correction: 'Descrição é o ato de descrever. Discrição é ser discreto. O correto é "discrição".' },
                { text: 'Se ele manter a palavra, o acordo será fechado.', correct: false, correction: 'O futuro do subjuntivo do verbo "manter" é "mantiver".' },
                { text: 'Onde você pretende ir com essa reclamação?', correct: false, correction: 'Verbos de movimento exigem "aonde". Correto: "Aonde você pretende ir...".' },
                { text: 'O gerente de tráfico de rede vai analisar.', correct: false, correction: 'Tráfico se refere a atividades ilegais. Tráfego se refere a fluxo. O correto é "tráfego".' },
                { text: 'Vou retificar a informação que você me passou.', correct: false, correction: 'Retificar é corrigir. Ratificar é confirmar. O correto é "ratificar a informação".' },
                { text: 'O erro passou despercebido por todos.', correct: false, correction: '"Despercebido" é não ser notado. "Desapercebido" é estar desprovido de algo. O correto é "despercebido".' }
            ],
            3: [
                // NÍVEL 3: Estruturas e Conectivos
                // Corretas
                { text: 'Não sei aonde o técnico foi.', correct: true, correction: null },
                { text: 'O sistema foi atualizado há duas semanas.', correct: true, correction: null },
                { text: 'Existem outras opções disponíveis.', correct: true, correction: null },
                { text: 'O cliente ligou para saber por que a fatura não chegou.', correct: true, correction: null },
                { text: 'Ele não compareceu à reunião, e não sabemos o porquê.', correct: true, correction: null },
                { text: 'A equipe a que me refiro está em outro andar.', correct: true, correction: null },
                { text: 'O usuário cujo problema resolvemos agradeceu.', correct: true, correction: null },
                { text: 'Chegamos ao escritório no horário combinado.', correct: true, correction: null },
                // Incorretas
                { text: 'Não entendi o porque de tanta confusão.', correct: false, correction: 'Como substantivo (sinônimo de "motivo"), o correto é "o porquê".' },
                { text: 'Onde você enviou o documento?', correct: false, correction: 'O verbo "enviar" indica movimento, portanto, o correto é "Aonde".' },
                { text: 'Devem haver outras soluções para este caso.', correct: false, correction: 'O verbo Haver, no sentido de existir, é impessoal. Correto: "Deve haver...".' },
                { text: 'Estarei disponível daqui há 15 minutos.', correct: false, correction: 'Para indicar tempo futuro, usa-se "a". Correto: "daqui a 15 minutos".' },
                { text: 'A reunião foi cancelada por que o diretor viajou.', correct: false, correction: 'Em respostas e explicações, usa-se "porque" (junto). ' },
                { text: 'O sistema parou de funcionar e não sei porquê.', correct: false, correction: 'No final de uma frase, antes de um ponto, usa-se "por quê" (separado e com acento).' },
                { text: 'Prefiro esta opção do que a outra.', correct: false, correction: 'A regência do verbo "preferir" é "preferir algo A algo". Correto: "...esta opção à outra."' },
                { text: 'Assisti o filme que você recomendou.', correct: false, correction: 'O verbo "assistir" no sentido de "ver" exige a preposição "a". Correto: "...assisti ao filme..."' }
            ]
        };

        let currentSentences = sentencesByLevel[currentLevel];
       
        function pickNewSentence() {
            const existingTexts = sentencesOnScreen.map(s => s.data.text);
            const availablePool = sentencesByLevel[currentLevel].filter(s => !existingTexts.includes(s.text));
            if (availablePool.length === 0) {
                return sentencesByLevel[currentLevel][Math.floor(Math.random() * sentencesByLevel[currentLevel].length)];
            }
            const randIndex = Math.floor(Math.random() * availablePool.length);
            return availablePool[randIndex];
        }

        function addSingleSentence() {
            const newSentenceData = pickNewSentence();
            createSentence(newSentenceData);
        }

        function createSentence(sentenceData) {
            if (!sentenceData) return;
            const sentenceEl = document.createElement('div');
            sentenceEl.classList.add('sentence');
            sentenceEl.textContent = sentenceData.text;
            const topBoundary = gameUi.offsetHeight + 10;
            const x = Math.random() * (gameContainer.clientWidth - 250);
            const y = Math.random() * (gameContainer.clientHeight - topBoundary - 100) + topBoundary;
            const angle = Math.random() * 2 * Math.PI;
            const speed = config[currentLevel].speed * (Math.random() * 0.5 + 0.75);
            sentenceEl.style.left = `${x}px`;
            sentenceEl.style.top = `${y}px`;
            const sentenceObj = { element: sentenceEl, data: sentenceData, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
            sentencesOnScreen.push(sentenceObj);
            gameContainer.appendChild(sentenceEl);
            sentenceEl.addEventListener('click', handleSentenceClick);
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

            const minCorrect = 2;
            const totalSentences = config[currentLevel].sentenceCount;
            let correctPool = [...sentencesByLevel[currentLevel].filter(s => s.correct)];
            let incorrectPool = [...sentencesByLevel[currentLevel].filter(s => !s.correct)];

            for (let i = 0; i < minCorrect; i++) {
                if (correctPool.length === 0) break;
                const randIndex = Math.floor(Math.random() * correctPool.length);
                const sentence = correctPool.splice(randIndex, 1)[0];
                createSentence(sentence);
            }

            const remainingCount = totalSentences - sentencesOnScreen.length;
            let combinedPool = [...correctPool, ...incorrectPool];
            for (let i = 0; i < remainingCount; i++) {
                if (combinedPool.length === 0) break;
                const randIndex = Math.floor(Math.random() * combinedPool.length);
                const sentence = combinedPool.splice(randIndex, 1)[0];
                createSentence(sentence);
            }
        }
        
        function handleSentenceClick(event) {
            const clickedEl = event.target;
            const sentenceObj = sentencesOnScreen.find(s => s.element === clickedEl);
            if (!sentenceObj || clickedEl.classList.contains('clicked')) return;
            
            const sentenceData = sentenceObj.data;
            clickedEl.classList.add('clicked');

            if (sentenceData.correct) {
                correctHitCounter++;
                if (correctHitCounter >= 5) { scoreMultiplier = 2; }
                score += (5 + timeLeft) * scoreMultiplier;
                
                clickedEl.classList.add('correct-flash');
                setTimeout(() => {
                    const index = sentencesOnScreen.findIndex(s => s.element === clickedEl);
                    if (index > -1) sentencesOnScreen.splice(index, 1);
                    clickedEl.remove();

                    if (correctHitCounter > 0 && correctHitCounter % 5 === 0) {
                        refreshBoard(true);
                    } else {
                        addSingleSentence();
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
                    const index = sentencesOnScreen.findIndex(s => s.element === clickedEl);
                    if (index > -1) sentencesOnScreen.splice(index, 1);
                    clickedEl.remove();
                    
                    addSingleSentence();
                    
                    updateUI();
                    if (lives <= 0) { endGame(); }
                }, 500);
            }
            updateUI();
        }
        
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
        
        function resetGame() {
            score = 0; lives = 3; timeLeft = 60; currentLevel = 1;
            correctHitCounter = 0; scoreMultiplier = 1; mistakeTracker = {};
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
