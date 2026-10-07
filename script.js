/* ==================================================
   STAR ACADEMY — SCRIPT
   ================================================== */


/* ==================================================
   SUPABASE
   ================================================== */

const SUPABASE_URL =
  "TON_URL_SUPABASE";


const SUPABASE_ANON_KEY =
  "TA_CLE_ANON_SUPABASE";


const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* ==================================================
   CONFIGURATION
   ================================================== */

const numberOfPrimes = 13;


/* ==================================================
   VARIABLES
   ================================================== */

let currentPlayer = null;

let currentPrime = null;

let students = [];

let players = [];


/* ==================================================
   ÉLÉMENTS
   ================================================== */

const playersContainer =
  document.getElementById("players");


const selectedPlayer =
  document.getElementById("selectedPlayer");


const primeGrid =
  document.getElementById("primeGrid");


const predictionSection =
  document.getElementById("pronostics");


const primesSection =
  document.getElementById("primes");


const primeNumber =
  document.getElementById("primeNumber");


const primeTitle =
  document.getElementById("primeTitle");


const playerName =
  document.getElementById("playerName");


const predictionForm =
  document.getElementById("predictionForm");


const saveMessage =
  document.getElementById("saveMessage");


const backToPrimes =
  document.getElementById("backToPrimes");


const ranking =
  document.getElementById("ranking");


const myResults =
  document.getElementById("myResults");


const nav =
  document.getElementById("nav");


const menuButton =
  document.getElementById("menuButton");


const candidateList =
  document.getElementById("candidateList");


const candidateInput =
  document.getElementById("candidateInput");


const addCandidateButton =
  document.getElementById(
    "addCandidateButton"
  );


const addProfileButton =
  document.getElementById(
    "addProfileButton"
  );


/* ==================================================
   MENU MOBILE
   ================================================== */

menuButton.addEventListener(
  "click",
  () => {

    nav.classList.toggle("open");

  }
);


/* ==================================================
   CHARGER LES PARTICIPANTES
   ================================================== */

async function loadPlayers() {

  const { data, error } =
    await supabaseClient
      .from("players")
      .select("*")
      .order("created_at");


  if (error) {

    console.error(error);

    return;

  }


  players = data || [];


  displayPlayers();

}


/* ==================================================
   AFFICHER LES PARTICIPANTES
   ================================================== */

function displayPlayers() {

  playersContainer.innerHTML = "";


  players.forEach(
    (player, index) => {

      const button =
        document.createElement("button");


      button.className =
        "player-card";


      button.dataset.player =
        player.name;


      button.innerHTML = `

        <span class="player-number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span>
          ${escapeHTML(player.name)}
        </span>

      `;


      button.addEventListener(
        "click",
        () => {

          selectPlayer(
            player.name,
            button
          );

        }
      );


      playersContainer.appendChild(
        button
      );

    }
  );

}


/* ==================================================
   SÉLECTIONNER UNE PARTICIPANTE
   ================================================== */

function selectPlayer(
  name,
  button
) {

  document
    .querySelectorAll(".player-card")
    .forEach(card => {

      card.classList.remove(
        "active"
      );

    });


  button.classList.add(
    "active"
  );


  currentPlayer = name;


  selectedPlayer.textContent =
    `Profil sélectionné : ${name}`;


  loadMyResults();

}


/* ==================================================
   AJOUTER UN PROFIL
   ================================================== */

addProfileButton.addEventListener(
  "click",
  async () => {

    if (players.length >= 4) {

      alert(
        "Les 4 profils sont déjà créés."
      );

      return;

    }


    const name =
      prompt(
        "Quel est ton prénom ?"
      );


    if (!name) {
      return;
    }


    const cleanName =
      name.trim();


    if (!cleanName) {
      return;
    }


    const alreadyExists =
      players.some(
        player =>
          player.name.toLowerCase()
          === cleanName.toLowerCase()
      );


    if (alreadyExists) {

      alert(
        "Ce prénom existe déjà."
      );

      return;

    }


    const { error } =
      await supabaseClient
        .from("players")
        .insert({
          name: cleanName
        });


    if (error) {

      console.error(error);

      alert(
        "Impossible d'ajouter ce profil."
      );

      return;

    }


    await loadPlayers();

  }
);


/* ==================================================
   CHARGER LES CANDIDATS
   ================================================== */

async function loadStudents() {

  const { data, error } =
    await supabaseClient
      .from("students")
      .select("*")
      .order("created_at");


  if (error) {

    console.error(error);

    return;

  }


  students = data || [];


  displayStudents();

}


/* ==================================================
   AFFICHER LES CANDIDATS
   ================================================== */

function displayStudents() {

  candidateList.innerHTML = "";


  if (students.length === 0) {

    candidateList.innerHTML = `
      <p class="candidate-empty">
        Aucun candidat ajouté pour le moment.
      </p>
    `;

    return;

  }


  students.forEach(
    student => {

      const item =
        document.createElement("div");


      item.className =
        "candidate-item";


      item.innerHTML = `

        <span>
          ${escapeHTML(student.name)}
        </span>

        <button
          onclick="deleteStudent(${student.id})"
        >
          ×
        </button>

      `;


      candidateList.appendChild(
        item
      );

    }
  );

}


/* ==================================================
   AJOUTER UN CANDIDAT
   ================================================== */

addCandidateButton.addEventListener(
  "click",
  addStudent
);


candidateInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();

      addStudent();

    }

  }
);


async function addStudent() {

  const name =
    candidateInput.value.trim();


  if (!name) {

    alert(
      "Écris le prénom du candidat."
    );

    return;

  }


  const alreadyExists =
    students.some(
      student =>
        student.name.toLowerCase()
        === name.toLowerCase()
    );


  if (alreadyExists) {

    alert(
      "Ce candidat existe déjà."
    );

    return;

  }


  const { error } =
    await supabaseClient
      .from("students")
      .insert({
        name: name
      });


  if (error) {

    console.error(error);

    alert(
      "Impossible d'ajouter le candidat."
    );

    return;

  }


  candidateInput.value = "";


  await loadStudents();

}


/* ==================================================
   SUPPRIMER UN CANDIDAT
   ================================================== */

async function deleteStudent(id) {

  const confirmed =
    confirm(
      "Supprimer ce candidat ?"
    );


  if (!confirmed) {
    return;
  }


  const { error } =
    await supabaseClient
      .from("students")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    alert(
      "Impossible de supprimer ce candidat."
    );

    return;

  }


  await loadStudents();

}


/* ==================================================
   CRÉER LES PRIMES
   ================================================== */

function createPrimes() {

  primeGrid.innerHTML = "";


  for (
    let i = 1;
    i <= numberOfPrimes;
    i++
  ) {

    const card =
      document.createElement("article");


    card.className =
      "prime-card";


    card.innerHTML = `

      <div>

        <div class="prime-number">
          ${String(i).padStart(2, "0")}
        </div>

        <h3>
          Prime ${i}
        </h3>

        <p>
          Tes pronostics
        </p>

      </div>

      <button>
        Faire mes pronostics
      </button>

    `;


    card
      .querySelector("button")
      .addEventListener(
        "click",
        () => openPrime(i)
      );


    primeGrid.appendChild(
      card
    );

  }

}


/* ==================================================
   REMPLIR LES MENUS
   ================================================== */

function fillSelect(selectId) {

  const select =
    document.getElementById(
      selectId
    );


  select.innerHTML = `
    <option value="">
      Choisir...
    </option>
  `;


  students.forEach(
    student => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        student.name;


      option.textContent =
        student.name;


      select.appendChild(
        option
      );

    }
  );

}


/* ==================================================
   OUVRIR UN PRIME
   ================================================== */

async function openPrime(
  primeNumberValue
) {

  if (!currentPlayer) {

    alert(
      "Choisis d'abord ton profil."
    );


    document
      .getElementById("players")
      .scrollIntoView({
        behavior: "smooth"
      });


    return;

  }


  if (students.length === 0) {

    alert(
      "Ajoute d'abord les candidats."
    );


    document
      .getElementById("candidats")
      .scrollIntoView({
        behavior: "smooth"
      });


    return;

  }


  currentPrime =
    primeNumberValue;


  primeNumber.textContent =
    `PRIME ${primeNumberValue}`;


  primeTitle.textContent =
    `Tes pronostics du Prime ${primeNumberValue}`;


  playerName.textContent =
    currentPlayer;


  fillSelect("immunity");

  fillSelect("bestDuo");

  fillSelect("bestPerformance");

  fillSelect("favorite");

  fillSelect("eliminated");

  fillSelect("winner");


  predictionSection
    .classList
    .remove("hidden");


  predictionSection.scrollIntoView({
    behavior: "smooth"
  });


  await loadPrediction();

}


/* ==================================================
   RETOUR AUX PRIMES
   ================================================== */

backToPrimes.addEventListener(
  "click",
  () => {

    predictionSection
      .classList
      .add("hidden");


    primesSection.scrollIntoView({
      behavior: "smooth"
    });

  }
);


/* ==================================================
   ENREGISTRER LES PRONOSTICS
   ================================================== */

predictionForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (
      !currentPlayer ||
      !currentPrime
    ) {

      return;

    }


    const prediction = {

      player_name:
        currentPlayer,

      prime_number:
        currentPrime,

      immunity:
        document
          .getElementById("immunity")
          .value,

      best_duo:
        document
          .getElementById("bestDuo")
          .value,

      best_performance:
        document
          .getElementById(
            "bestPerformance"
          )
          .value,

      favorite:
        document
          .getElementById("favorite")
          .value,

      eliminated:
        document
          .getElementById("eliminated")
          .value,

      winner:
        document
          .getElementById("winner")
          .value

    };


    saveMessage.textContent =
      "Enregistrement...";


    const {
      data: existing,
      error: searchError
    } =
      await supabaseClient
        .from("predictions")
        .select("id")
        .eq(
          "player_name",
          currentPlayer
        )
        .eq(
          "prime_number",
          currentPrime
        )
        .maybeSingle();


    if (searchError) {

      console.error(
        searchError
      );

      saveMessage.textContent =
        "❌ Une erreur est survenue.";

      return;

    }


    let result;


    if (existing) {

      result =
        await supabaseClient
          .from("predictions")
          .update(prediction)
          .eq(
            "id",
            existing.id
          );

    } else {

      result =
        await supabaseClient
          .from("predictions")
          .insert(
            prediction
          );

    }


    if (result.error) {

      console.error(
        result.error
      );


      saveMessage.textContent =
        "❌ Impossible d'enregistrer.";

      return;

    }


    saveMessage.textContent =
      "✓ Tes pronostics sont enregistrés !";


    setTimeout(
      () => {

        saveMessage.textContent =
          "";

      },
      3000
    );


    loadMyResults();

  }
);


/* ==================================================
   CHARGER UN PRONOSTIC
   ================================================== */

async function loadPrediction() {

  if (
    !currentPlayer ||
    !currentPrime
  ) {

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("predictions")
      .select("*")
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      )
      .maybeSingle();


  if (error) {

    console.error(error);

    return;

  }


  predictionForm.reset();


  if (!data) {
    return;
  }


  document.getElementById(
    "immunity"
  ).value =
    data.immunity || "";


  document.getElementById(
    "bestDuo"
  ).value =
    data.best_duo || "";


  document.getElementById(
    "bestPerformance"
  ).value =
    data.best_performance || "";


  document.getElementById(
    "favorite"
  ).value =
    data.favorite || "";


  document.getElementById(
    "eliminated"
  ).value =
    data.eliminated || "";


  document.getElementById(
    "winner"
  ).value =
    data.winner || "";

}


/* ==================================================
   MES RÉSULTATS
   ================================================== */

async function loadMyResults() {

  if (!currentPlayer) {

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("predictions")
      .select("*")
      .eq(
        "player_name",
        currentPlayer
      )
      .order(
        "prime_number",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(error);

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    myResults.innerHTML = `
      <p>
        Aucun pronostic enregistré pour le moment.
      </p>
    `;

    return;

  }


  myResults.innerHTML = "";


  data.forEach(
    item => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "result-item";


      div.innerHTML = `

        <span>
          Prime ${item.prime_number}
        </span>

        <span>
          ${item.points || 0} point(s)
        </span>

      `;


      myResults.appendChild(
        div
      );

    }
  );

}


/* ==================================================
   CLASSEMENT
   ================================================== */

async function loadRanking() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("predictions")
      .select(
        "player_name, points"
      );


  if (error) {

    console.error(error);

    return;

  }


  const scores = {};


  players.forEach(
    player => {

      scores[player.name] =
        0;

    }
  );


  data.forEach(
    prediction => {

      if (
        scores[
          prediction.player_name
        ] !== undefined
      ) {

        scores[
          prediction.player_name
        ] += Number(
          prediction.points || 0
        );

      }

    }
  );


  const sortedPlayers =
    Object.entries(scores)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  ranking.innerHTML = "";


  sortedPlayers.forEach(
    (player, index) => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "ranking-item";


      div.innerHTML = `

        <div class="ranking-position">
          ${index + 1}
        </div>

        <div class="ranking-name">
          ${escapeHTML(player[0])}
        </div>

        <div class="ranking-points">
          ${player[1]} pts
        </div>

      `;


      ranking.appendChild(
        div
      );

    }
  );

}


/* ==================================================
   PROTECTION TEXTE HTML
   ================================================== */

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ==================================================
   INITIALISATION
   ================================================== */

async function init() {

  createPrimes();

  await loadPlayers();

  await loadStudents();

  await loadRanking();

}


init();


/* ==================================================
   ACTUALISATION
   ================================================== */

setInterval(
  async () => {

    await loadPlayers();

    await loadStudents();

    await loadRanking();


    if (currentPlayer) {

      await loadMyResults();

    }

  },
  10000
);