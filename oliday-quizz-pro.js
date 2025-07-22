// oliday-quizz-pro.js

document.addEventListener("DOMContentLoaded", () => {
  let currentTheme = null;
  let currentQuestions = [];
  let currentScore = 0;
  let currentUser = "";
  let timer;
  let timeLeft = 5;
  let selectedThemes = ["Histoire", "Géographie", "Sciences", "Sport", "Cinéma", "Musique", "Littérature", "Technologie", "Nature", "Culture"];
  let themesData = {};
  let topScores = JSON.parse(localStorage.getItem("olidayTopScores") || "[]");
  let adminImages = JSON.parse(localStorage.getItem("olidayImages") || "{}");
  let enabledThemes = JSON.parse(localStorage.getItem("olidayEnabledThemes") || JSON.stringify(selectedThemes));
  let isAdmin = false;

  const app = document.getElementById("app");

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function saveScores() {
    localStorage.setItem("olidayTopScores", JSON.stringify(topScores));
  }

  function updateLeaderboard() {
    const sortedScores = topScores.sort((a, b) => b.score - a.score).slice(0, 5);
    return `
      <div class="leaderboard">
        <h2>🏆 Top 5</h2>
        <ol>
          ${sortedScores.map(s => `<li>${s.name} - ${s.score}/5</li>`).join("")}
        </ol>
        ${isAdmin ? '<button onclick="resetScores()">Réinitialiser le classement</button>' : ""}
      </div>`;
  }

  function resetScores() {
    localStorage.removeItem("olidayTopScores");
    topScores = [];
    renderMenu();
  }

  function loadQuestions() {
    selectedThemes.forEach(theme => {
      themesData[theme] = [];
      for (let i = 1; i <= 10; i++) {
        themesData[theme].push({
          question: `Question ${i} de ${theme} ?`,
          options: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
          answer: 1
        });
      }
    });
  }

  function renderMenu() {
    const themeButtons = enabledThemes.map(theme =>
      `<button class="theme-btn" onclick="startQuiz('${theme}')">${theme}</button>`
    ).join("");

    const randomButton = `<button class="theme-btn" onclick="startQuizRandom()">Thème aléatoire</button>`;

    const adminOptions = isAdmin
      ? `<div class="admin-menu">
          <button onclick="resetScores()">Réinitialiser classement</button>
          <button onclick="alert('Interface de création quiz à venir')">Créer un quiz personnalisé</button>
        </div>`
      : "";

    app.innerHTML = `
      <div class="menu" style="background-image:url('${adminImages.menu || ""}');">
        <h1>🎮 Oliday Quizz Pro</h1>
        <input id="nameInput" type="text" placeholder="Entrez votre prénom" />
        <button onclick="submitName()">Commencer</button>
        <div class="themes">${themeButtons}${randomButton}</div>
        ${updateLeaderboard()}
        ${adminOptions}
      </div>
    `;
  }

  window.submitName = () => {
    const nameInput = document.getElementById("nameInput").value.trim();
    if (!nameInput) return alert("Veuillez entrer un prénom.");
    currentUser = nameInput;
    isAdmin = currentUser.toLowerCase() === "admin";
    renderMenu();
  };

  window.startQuiz = (theme) => {
    currentTheme = theme;
    currentQuestions = shuffleArray([...themesData[theme]]).slice(0, 5);
    currentScore = 0;
    showQuestion(0);
  };

  window.startQuizRandom = () => {
    const theme = shuffleArray(enabledThemes)[0];
    startQuiz(theme);
  };

  function showQuestion(index) {
    if (index >= currentQuestions.length) return showSummary();
    const q = currentQuestions[index];
    timeLeft = 5;
    clearInterval(timer);
    timer = setInterval(() => {
      document.getElementById("timer").innerText = timeLeft + "s";
      if (--timeLeft < 0) {
        clearInterval(timer);
        showQuestion(index + 1);
      }
    }, 1000);

    app.innerHTML = `
      <div class="quiz" style="background-image:url('${adminImages[currentTheme] || ""}');">
        <h2>${currentTheme}</h2>
        <p>${q.question}</p>
        <ul>
          ${q.options.map((opt, i) =>
            `<li><button onclick="answerQuestion(${index}, ${i})">${opt}</button></li>`
          ).join("")}
        </ul>
        <div id="timer">5s</div>
      </div>
    `;
  }

  
      saveScores();
    }

    const resultList = currentQuestions.map((q, i) => {
      const correct = currentQuestions[i].answer;
      return `<li>${q.question}<br/>
        ✅ ${q.options[correct]}</li>`;
    }).join("");

    app.innerHTML = `
      <div class="summary">
        <h2>Résultat de ${currentUser}</h2>
        <p>Score : ${currentScore}/5</p>
        <ul>${resultList}</ul>
        <button onclick="renderMenu()">Retour au menu</button>
        ${updateLeaderboard()}
      </div>
    `;
  }

  loadQuestions();
  renderMenu();
});


  window.resetScores = resetScores;

  function renderAdminPanel() {
    const themesCheckboxes = selectedThemes.map(theme => `
      <label>
        <input type="checkbox" value="${theme}" ${enabledThemes.includes(theme) ? 'checked' : ''} onchange="toggleTheme(this)">
        ${theme}
      </label>
    `).join("<br/>");

    const themeImageButtons = selectedThemes.map(theme => `
      <label>
        ${theme} :
        <input type="file" accept="image/jpeg" onchange="uploadThemeImage(event, '${theme}')">
      </label>
    `).join("<br/>");

    app.innerHTML = `
      <div class="admin-panel">
        <h2>🔧 Panneau Admin</h2>
        <button onclick="renderMenu()">⬅ Retour menu</button>
        <hr/>
        <h3>Changer image d’accueil :</h3>
        <input type="file" accept="image/jpeg" onchange="uploadMenuImage(event)">
        <h3>Changer image par thème :</h3>
        ${themeImageButtons}
        <h3>Activer/désactiver des thèmes :</h3>
        ${themesCheckboxes}
        <hr/>
        <button onclick="renderCreateQuiz()">Créer un quiz personnalisé</button>
      </div>
    `;
  }

  window.uploadMenuImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      adminImages.menu = e.target.result;
      localStorage.setItem("olidayImages", JSON.stringify(adminImages));
      alert("Image d’accueil mise à jour !");
    };
    reader.readAsDataURL(file);
  };

  window.uploadThemeImage = (event, theme) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      adminImages[theme] = e.target.result;
      localStorage.setItem("olidayImages", JSON.stringify(adminImages));
      alert("Image de thème mise à jour !");
    };
    reader.readAsDataURL(file);
  };

  window.toggleTheme = (checkbox) => {
    const theme = checkbox.value;
    if (checkbox.checked) {
      if (!enabledThemes.includes(theme)) enabledThemes.push(theme);
    } else {
      enabledThemes = enabledThemes.filter(t => t !== theme);
    }
    localStorage.setItem("olidayEnabledThemes", JSON.stringify(enabledThemes));
  };

  window.renderCreateQuiz = () => {
    app.innerHTML = `
      <div class="create-quiz">
        <h2>Créer un quiz personnalisé</h2>
        <input type="text" id="customTitle" placeholder="Titre du quiz" /><br/>
        <div id="questionsContainer"></div>
        <button onclick="addCustomQuestion()">Ajouter une question</button><br/>
        <button onclick="startCustomQuiz()">Lancer le quiz</button><br/>
        <button onclick="renderAdminPanel()">⬅ Retour admin</button>
      </div>
    `;
    customQuestions = [];
    addCustomQuestion();
  };

  let customQuestions = [];

  window.addCustomQuestion = () => {
    const index = customQuestions.length;
    const container = document.getElementById("questionsContainer");
    const qHTML = `
      <div class="question-block">
        <input type="text" placeholder="Question" id="q${index}" /><br/>
        ${[0,1,2,3].map(i =>
          `<input type="text" placeholder="Réponse ${i+1}" id="q${index}opt${i}" />`
        ).join("<br/>")}
        <label>Bonne réponse (0-3) : <input type="number" min="0" max="3" id="q${index}ans" /></label>
        <hr/>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", qHTML);
    customQuestions.push(index);
  };

  window.startCustomQuiz = () => {
    const title = document.getElementById("customTitle").value.trim();
    if (!title) return alert("Veuillez entrer un titre.");
    currentTheme = title;
    currentQuestions = customQuestions.map(i => ({
      question: document.getElementById(`q${i}`).value,
      options: [0,1,2,3].map(j => document.getElementById(`q${i}opt${j}`).value),
      answer: parseInt(document.getElementById(`q${i}ans`).value)
    })).slice(0, 5);
    currentScore = 0;
    showQuestion(0);
  };

  window.renderAdminPanel = renderAdminPanel;


  window.answerQuestion = (index, choice) => {
    clearInterval(timer);
    const q = currentQuestions[index];
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn, i) => {
      if (i === q.answer) btn.style.backgroundColor = 'green';
      if (i === choice && i !== q.answer) btn.style.backgroundColor = 'red';
      btn.disabled = true;
    });
    setTimeout(() => showQuestion(index + 1), 1000);
  };
