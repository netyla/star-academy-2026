/* ==================================================
   STAR ACADEMY — SCRIPT
   ================================================== */


/* ==================================================
   SUPABASE
   ================================================== */

/*
   ⚠️ REMPLACE CES DEUX VALEURS PAR CELLES
   DE TON PROJET SUPABASE.
*/

const SUPABASE_URL = "TON_URL_SUPABASE";

const SUPABASE_ANON_KEY = "TA_CLE_ANON_SUPABASE";


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* ==================================================
   CONFIGURATION
   ================================================== */


/*
   Les 4 participantes.
*/

const players = [
  "Joueuse 1",
  "Joueuse 2",
  "Joueuse 3",
  "Joueuse 4"
];


/*
   Les élèves.

   Tu pourras remplacer ces noms par les vrais
   candidats de la saison.
*/

const students = [
  "Élève 1",
  "Élève 2",
  "Élève 3",
  "Élève 4",
  "Élève 5",
  "Élève 6",
  "Élève 7",
  "Élève 8",
  "Élève 9",
  "Élève 10",
  "Élève 11",
  "Élève 12",
  "Élève 13",
  "Élève 14"
];


/*
   Nombre de Primes.

   Tu peux modifier 13 si la saison comporte
   un nombre différent de Primes.
*/

const numberOfPrimes = 13;


/* ==================================================
   VARIABLES
   ================================================== */

let currentPlayer = null;

let currentPrime = null;


/* ==================================================
   ÉLÉMENTS HTML
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


/* ==================================================
   MENU MOBILE
   ================================================== */

menuButton.addEventListener("click", () => {

  nav.classList.toggle("open");

});


/* ==================================================
   CRÉER LES PRIMES
   ================================================== */

function createPrimes() {

  primeGrid.innerHTML = "";


  for (let i = 1; i <= numberOfPrimes; i++) {

    const card = document.createElement("article");

    card.className = "prime-card";


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

      <button onclick="openPrime(${i})">
        Faire mes pronostics
      </button>

    `;


    primeGrid.appendChild(card);

  }

}


/* ==================================================
   CHOIX DE LA JOUEUSE
   ================================================== */

document.querySelectorAll(".player-card").forEach(card => {

  card.addEventListener("click", () => {

    document.querySelectorAll(".player-card")
      .forEach(item => item.classList.remove("active"));


    card.classList.add("active");


    currentPlayer =
      card.dataset.player;


    selectedPlayer.textContent =
      `Profil sélectionné : ${currentPlayer}`;


    loadMyResults();

  });

});


/* ==================================================
   REMPLIR LES SELECTS
   ================================================== */

function fillSelect(selectId) {

  const select =
    document.getElementById(selectId);


  select.innerHTML =
    `<option value="">Choisir...</option>`;


  students.forEach(student => {

    const option =
      document.createElement("option");


    option.value = student;

    option.textContent = student;


    select.appendChild(option);

  });

}


/* ==================================================
   OUVRIR UN PRIME
   ================================================== */

async function openPrime(primeNumberValue) {

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


  predictionSection.classList.remove("hidden");


  predictionSection.scrollIntoView({
    behavior: "smooth"
  });


  await loadPrediction();

}


/* ==================================================
   RETOUR AUX PRIMES
   ================================================== */

backToPrimes.addEventListener("click", () => {

  predictionSection.classList.add("hidden");


  primesSection.scrollIntoView({
    behavior: "smooth"
  });

});


/* ==================================================
   ENREGISTRER LES PRONOSTICS
   ================================================== */

predictionForm.addEventListener("submit", async (event) => {

  event.preventDefault();


  if (!currentPlayer || !currentPrime) {

    return;

  }


  const prediction = {

    player_name: currentPlayer,

    prime_number: currentPrime,

    immunity:
      document.getElementById("immunity").value,

    best_duo:
      document.getElementById("bestDuo").value,

    best_performance:
      document.getElementById("bestPerformance").value,

    favorite:
      document.getElementById("favorite").value,

    eliminated:
      document.getElementById("eliminated").value,

    winner:
      document.getElementById("winner").value

  };


  saveMessage.textContent =
    "Enregistrement en cours...";


  /*
     On cherche d'abord si un pronostic existe déjà
     pour cette joueuse et ce Prime.
  */

  const { data: existing } =
    await supabaseClient
      .from("predictions")
      .select("id")
      .eq("player_name", currentPlayer)
      .eq("prime_number", currentPrime)
      .maybeSingle();


  let result;


  if (existing) {

    result =
      await supabaseClient
        .from("predictions")
        .update(prediction)
        .eq("id", existing.id);

  } else {

    result =
      await supabaseClient
        .from("predictions")
        .insert(prediction);

  }


  if (result.error) {

    console.error(result.error);


    saveMessage.textContent =
      "❌ Une erreur est survenue.";

    return;

  }


  saveMessage.textContent =
    "✓ Tes pronostics sont enregistrés !";


  setTimeout(() => {

    saveMessage.textContent = "";

  }, 3000);


  loadMyResults();

});


/* ==================================================
   CHARGER UN PRONOSTIC EXISTANT
   ================================================== */

async function loadPrediction() {

  if (!currentPlayer || !currentPrime) {
    return;
  }


  const { data, error } =
    await supabaseClient
      .from("predictions")
      .select("*")
      .eq("player_name", currentPlayer)
      .eq("prime_number", currentPrime)
      .maybeSingle();


  if (error) {

    console.error(error);

    return;

  }


  if (!data) {

    predictionForm.reset();

    return;

  }


  document.getElementById("immunity").value =
    data.immunity || "";


  document.getElementById("bestDuo").value =
    data.best_duo || "";


  document.getElementById("bestPerformance").value =
    data.best_performance || "";


  document.getElementById("favorite").value =
    data.favorite || "";


  document.getElementById("eliminated").value =
    data.eliminated || "";


  document.getElementById("winner").value =
    data.winner || "";

}


/* ==================================================
   CHARGER MES RÉSULTATS
   ================================================== */

async function loadMyResults() {

  if (!currentPlayer) {

    myResults.innerHTML =
      "<p>Sélectionne ton profil.</p>";

    return;

  }


  const { data, error } =
    await supabaseClient
      .from("predictions")
      .select("*")
      .eq("player_name", currentPlayer)
      .order("prime_number", {
        ascending: true
      });


  if (error) {

    console.error(error);

    return;

  }


  if (!data || data.length === 0) {

    myResults.innerHTML =
      "<p>Aucun pronostic enregistré pour le moment.</p>";

    return;

  }


  myResults.innerHTML = "";


  data.forEach(item => {

    const div =
      document.createElement("div");


    div.className =
      "result-item";


    div.innerHTML = `

      <span>
        Prime ${item.prime_number}
      </span>

      <span>
        ${item.points ?? 0} point(s)
      </span>

    `;


    myResults.appendChild(div);

  });

}


/* ==================================================
   CALCUL DU CLASSEMENT
   ================================================== */

async function loadRanking() {

  const { data, error } =
    await supabaseClient
      .from("predictions")
      .select("player_name, points");


  if (error) {

    console.error(error);

    return;

  }


  const scores = {};


  players.forEach(player => {

    scores[player] = 0;

  });


  data.forEach(prediction => {

    if (scores[prediction.player_name] !== undefined) {

      scores[prediction.player_name] +=
        Number(prediction.points || 0);

    }

  });


  const sortedPlayers =
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);


  ranking.innerHTML = "";


  sortedPlayers.forEach((player, index) => {

    const div =
      document.createElement("div");


    div.className =
      "ranking-item";


    div.innerHTML = `

      <div class="ranking-position">
        ${index + 1}
      </div>

      <div class="ranking-name">
        ${player[0]}
      </div>

      <div class="ranking-points">
        ${player[1]} pts
      </div>

    `;


    ranking.appendChild(div);

  });

}


/* ==================================================
   INITIALISATION
   ================================================== */

createPrimes();

loadRanking();


/*
   On recharge régulièrement le classement.

   Cela permet aux téléphones de voir les
   nouveaux scores lorsqu'ils sont ajoutés.
*/

setInterval(() => {

  loadRanking();

  if (currentPlayer) {
    loadMyResults();
  }

}, 10000);