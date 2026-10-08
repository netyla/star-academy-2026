/* ==================================================
   STAR ACADEMY 2026 — SCRIPT
   ================================================== */


/* ==================================================
   SUPABASE
   ================================================== */

const SUPABASE_URL =
  "https://hkjcllpnblziibdjehsx.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_DoddvQYfbdAwlh-23vPK3g_ux7_3qnT";

const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* ==================================================
   CONFIGURATION
   ================================================== */

const numberOfPrimes = 13;


/*
   Les catégories que tu peux remplir
   pour chaque Prime.
*/

const categories = [

  {
    id: "coup_de_coeur",
    title: "💕 Coup de cœur"
  },

  {
    id: "plus_drole",
    title: "😂 Le/la plus drôle"
  },

  {
    id: "charisme",
    title: "✨ Le plus de charisme"
  },

  {
    id: "plus_touche",
    title: "🥹 M'a le plus touché(e)"
  },

  {
    id: "aime_moins",
    title: "😒 J'aime le moins"
  },

  {
    id: "ira_plus_loin",
    title: "🚀 Ira le plus loin"
  },

  {
    id: "risque_saouler",
    title: "😵 Risque de me saouler"
  },

  {
    id: "plus_nul",
    title: "🤡 Le/la plus nul(le)"
  },

  {
    id: "pourrait_gagner",
    title: "🏆 Pourrait gagner"
  }

];


/* ==================================================
   VARIABLES
   ================================================== */

let currentPlayer = null;
let currentPrime = null;

let students = [];
let players = [];


/* ==================================================
   ÉLÉMENTS HTML
   ================================================== */

const playersContainer =
  document.getElementById("players");

const selectedPlayer =
  document.getElementById("selectedPlayer");

const primeGrid =
  document.getElementById("primeGrid");

const primeSpace =
  document.getElementById("primeSpace");

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
  document.getElementById("addCandidateButton");

const addProfileButton =
  document.getElementById("addProfileButton");

const ratingsContainer =
  document.getElementById("ratingsContainer");

const categoriesContainer =
  document.getElementById("categoriesContainer");

const topFiveContainer =
  document.getElementById("topFiveContainer");


/* ==================================================
   MENU MOBILE
   ================================================== */

if (menuButton) {

  menuButton.addEventListener(
    "click",
    () => {

      nav.classList.toggle("open");

    }
  );

}


/* ==================================================
   PROFILS
   ================================================== */

async function loadPlayers() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("players")
      .select("*")
      .order("created_at");


  if (error) {

    console.error(
      "Erreur chargement profils :",
      error
    );

    return;

  }


  players = data || [];

  displayPlayers();

}


function displayPlayers() {

  if (!playersContainer) {
    return;
  }


  playersContainer.innerHTML = "";


  players.forEach(
    (player, index) => {

      const button =
        document.createElement("button");


      button.className =
        "player-card";


      if (
        currentPlayer === player.name
      ) {

        button.classList.add("active");

      }


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


function selectPlayer(
  name,
  button
) {

  document
    .querySelectorAll(".player-card")
    .forEach(card => {

      card.classList.remove("active");

    });


  button.classList.add("active");


  currentPlayer = name;


  selectedPlayer.textContent =
    `Profil sélectionné : ${name}`;


  loadMyResults();

}


/* ==================================================
   AJOUTER UN PROFIL
   ================================================== */

if (addProfileButton) {

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
        prompt("Quel est ton prénom ?");


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


      const {
        error
      } =
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

}


/* ==================================================
   CANDIDATS
   ================================================== */

async function loadStudents() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("students")
      .select("*")
      .order("created_at");


  if (error) {

    console.error(
      "Erreur chargement candidats :",
      error
    );

    return;

  }


  students = data || [];

  displayStudents();


  /*
     Si un Prime est déjà ouvert,
     on actualise les menus.
  */

  if (currentPrime) {

    createRatingCards();
    createCategoryCards();
    createTopFive();

  }

}


function displayStudents() {

  if (!candidateList) {
    return;
  }


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


      const name =
        document.createElement("span");


      name.textContent =
        student.name;


      const deleteButton =
        document.createElement("button");


      deleteButton.type =
        "button";


      deleteButton.textContent =
        "×";


      deleteButton.addEventListener(
        "click",
        () => deleteStudent(student.id)
      );


      item.appendChild(name);
      item.appendChild(deleteButton);


      candidateList.appendChild(item);

    }
  );

}


if (addCandidateButton) {

  addCandidateButton.addEventListener(
    "click",
    addStudent
  );

}


if (candidateInput) {

  candidateInput.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        addStudent();

      }

    }
  );

}


async function addStudent() {

  const name =
    candidateInput.value.trim();


  if (!name) {

    alert(
      "Écris le prénom du candidat."
    );

    return;

  }


  const exists =
    students.some(
      student =>
        student.name.toLowerCase()
        === name.toLowerCase()
    );


  if (exists) {

    alert(
      "Ce candidat existe déjà."
    );

    return;

  }


  const {
    error
  } =
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


async function deleteStudent(id) {

  if (
    !confirm(
      "Supprimer ce candidat ?"
    )
  ) {

    return;

  }


  const {
    error
  } =
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
   CRÉATION DES 13 PRIMES
   ================================================== */

function createPrimes() {

  if (!primeGrid) {
    return;
  }


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
          Mes avis & pronostics
        </p>

      </div>

      <button type="button">
        Ouvrir le Prime
      </button>

    `;


    card
      .querySelector("button")
      .addEventListener(
        "click",
        () => openPrime(i)
      );


    primeGrid.appendChild(card);

  }

}


/* ==================================================
   REMPLIR UN SELECT AVEC LES CANDIDATS
   ================================================== */

function fillSelect(selectId) {

  const select =
    document.getElementById(selectId);


  if (!select) {
    return;
  }


  select.innerHTML = `

    <option value="">
      Choisir...
    </option>

  `;


  students.forEach(
    student => {

      const option =
        document.createElement("option");


      option.value =
        student.name;


      option.textContent =
        student.name;


      select.appendChild(option);

    }
  );

}


/* ==================================================
   OUVRIR UN PRIME
   ================================================== */

async function openPrime(prime) {

  if (!currentPlayer) {

    alert(
      "Choisis d'abord ton profil."
    );

    document
      .getElementById("profils")
      ?.scrollIntoView({
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
      ?.scrollIntoView({
        behavior: "smooth"
      });

    return;

  }


  currentPrime = prime;


  primeNumber.textContent =
    `PRIME ${prime}`;


  primeTitle.textContent =
    `Mes avis sur le Prime ${prime}`;


  playerName.textContent =
    currentPlayer;


  /*
     Pronostics classiques
  */

  fillSelect("immunity");
  fillSelect("bestDuo");
  fillSelect("bestPerformance");
  fillSelect("favorite");
  fillSelect("eliminated");
  fillSelect("winner");


  /*
     Notes /10
  */

  createRatingCards();


  /*
     Catégories
  */

  createCategoryCards();


  /*
     Top 5
  */

  createTopFive();


  primeSpace.classList.remove(
    "hidden"
  );


  primeSpace.scrollIntoView({
    behavior: "smooth"
  });


  /*
     On recharge ce qui avait déjà
     été enregistré.
  */

  await loadPrediction();
  await loadRatings();
  await loadCategories();
  await loadTopFive();

}


/* ==================================================
   RETOUR AUX PRIMES
   ================================================== */

if (backToPrimes) {

  backToPrimes.addEventListener(
    "click",
    () => {

      primeSpace.classList.add(
        "hidden"
      );


      primesSection.scrollIntoView({
        behavior: "smooth"
      });

    }
  );

}


/* ==================================================
   PRONOSTICS CLASSIQUES
   ================================================== */

if (predictionForm) {

  predictionForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const prediction = {

        player_name:
          currentPlayer,

        prime_number:
          currentPrime,

        immunity:
          document.getElementById(
            "immunity"
          ).value,

        best_duo:
          document.getElementById(
            "bestDuo"
          ).value,

        best_performance:
          document.getElementById(
            "bestPerformance"
          ).value,

        favorite:
          document.getElementById(
            "favorite"
          ).value,

        eliminated:
          document.getElementById(
            "eliminated"
          ).value,

        winner:
          document.getElementById(
            "winner"
          ).value

      };


      saveMessage.textContent =
        "Enregistrement...";


      const {
        error
      } =
        await supabaseClient
          .from("predictions")
          .upsert(
            prediction,
            {
              onConflict:
                "player_name,prime_number"
            }
          );


      if (error) {

        console.error(error);

        saveMessage.textContent =
          "❌ Impossible d'enregistrer.";

        return;

      }


      saveMessage.textContent =
        "✓ Tes pronostics sont enregistrés !";

      await loadMyResults();

    }
  );

}


async function loadPrediction() {

  if (!predictionForm) {
    return;
  }


  predictionForm.reset();


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

    console.error(
      "Erreur chargement pronostics :",
      error
    );

    return;

  }


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
   NOTES SUR 10
   ================================================== */

function createRatingCards() {

  if (!ratingsContainer) {
    return;
  }


  ratingsContainer.innerHTML = "";


  students.forEach(
    student => {

      const card =
        document.createElement("div");


      card.className =
        "rating-card";


      card.dataset.studentId =
        student.id;


      card.innerHTML = `

        <div class="rating-top">

          <span class="rating-name">
            ${escapeHTML(student.name)}
          </span>

          <div class="rating-score">

            <span>⭐</span>

            <input
              type="number"
              min="0"
              max="10"
              step="1"
              class="rating-input"
              data-student="${student.id}"
              placeholder="/10"
            >

          </div>

        </div>

        <textarea
          class="rating-comment"
          data-student="${student.id}"
          maxlength="500"
          placeholder="Mon avis sur ce candidat..."
        ></textarea>

      `;


      ratingsContainer.appendChild(
        card
      );

    }
  );

}


async function loadRatings() {

  if (!ratingsContainer) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("ratings")
      .select("*")
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      );


  if (error) {

    console.error(
      "Erreur chargement notes :",
      error
    );

    return;

  }


  (data || []).forEach(
    rating => {

      const input =
        document.querySelector(
          `.rating-input[data-student="${rating.student_id}"]`
        );


      const comment =
        document.querySelector(
          `.rating-comment[data-student="${rating.student_id}"]`
        );


      if (input) {

        input.value =
          rating.rating ?? "";

      }


      if (comment) {

        comment.value =
          rating.comment ?? "";

      }

    }
  );

}


/* ==================================================
   ENREGISTRER LES NOTES
   ================================================== */

const saveRatingsButton =
  document.getElementById(
    "saveRatingsButton"
  );


if (saveRatingsButton) {

  saveRatingsButton.addEventListener(
    "click",
    saveRatings
  );

}


async function saveRatings() {

  const message =
    document.getElementById(
      "ratingsMessage"
    );


  message.textContent =
    "Enregistrement...";


  /*
     On vérifie que chaque candidat
     possède une note.
  */

  const rows = [];


  for (const student of students) {

    const input =
      document.querySelector(
        `.rating-input[data-student="${student.id}"]`
      );


    const comment =
      document.querySelector(
        `.rating-comment[data-student="${student.id}"]`
      );


    const value =
      input?.value;


    if (
      value === "" ||
      value === undefined
    ) {

      message.textContent =
        "❌ Note chaque candidat sur 10 avant d'enregistrer.";

      input?.focus();

      return;

    }


    const rating =
      Number(value);


    if (
      Number.isNaN(rating) ||
      rating < 0 ||
      rating > 10
    ) {

      message.textContent =
        "❌ Les notes doivent être comprises entre 0 et 10.";

      input?.focus();

      return;

    }


    rows.push({

      player_name:
        currentPlayer,

      prime_number:
        currentPrime,

      student_id:
        student.id,

      rating:
        rating,

      comment:
        comment?.value.trim() || null

    });

  }


  if (rows.length === 0) {

    message.textContent =
      "❌ Aucun candidat à noter.";

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("ratings")
      .upsert(
        rows,
        {
          onConflict:
            "player_name,prime_number,student_id"
        }
      );


  if (error) {

    console.error(error);

    message.textContent =
      "❌ Impossible d'enregistrer les notes.";

    return;

  }


  message.textContent =
    "✓ Tes notes et commentaires sont enregistrés !";


  await loadMyResults();

}


/* ==================================================
   CATÉGORIES
   ================================================== */

function createCategoryCards() {

  if (!categoriesContainer) {
    return;
  }


  categoriesContainer.innerHTML = "";


  categories.forEach(
    category => {

      const card =
        document.createElement("div");


      card.className =
        "category-card";


      card.innerHTML = `

        <h4>
          ${category.title}
        </h4>

        <select
          class="category-select"
          data-category="${category.id}"
        >

          <option value="">
            Choisir...
          </option>

        </select>

      `;


      const select =
        card.querySelector(
          ".category-select"
        );


      students.forEach(
        student => {

          const option =
            document.createElement("option");


          option.value =
            student.id;


          option.textContent =
            student.name;


          select.appendChild(option);

        }
      );


      categoriesContainer.appendChild(
        card
      );

    }
  );

}


async function loadCategories() {

  if (!categoriesContainer) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("categories")
      .select("*")
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      );


  if (error) {

    console.error(
      "Erreur chargement catégories :",
      error
    );

    return;

  }


  (data || []).forEach(
    item => {

      const select =
        document.querySelector(
          `.category-select[data-category="${item.category}"]`
        );


      if (select) {

        select.value =
          String(item.student_id);

      }

    }
  );

}


/* ==================================================
   ENREGISTRER LES CATÉGORIES
   ================================================== */

const saveCategoriesButton =
  document.getElementById(
    "saveCategoriesButton"
  );


if (saveCategoriesButton) {

  saveCategoriesButton.addEventListener(
    "click",
    saveCategories
  );

}


async function saveCategories() {

  const message =
    document.getElementById(
      "categoriesMessage"
    );


  message.textContent =
    "Enregistrement...";


  /*
     On supprime les anciennes réponses
     du Prime pour permettre de modifier
     librement les catégories.
  */

  const {
    error: deleteError
  } =
    await supabaseClient
      .from("categories")
      .delete()
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      );


  if (deleteError) {

    console.error(deleteError);

    message.textContent =
      "❌ Impossible de modifier les catégories.";

    return;

  }


  const rows = [];


  document
    .querySelectorAll(".category-select")
    .forEach(select => {

      if (!select.value) {
        return;
      }


      rows.push({

        player_name:
          currentPlayer,

        prime_number:
          currentPrime,

        category:
          select.dataset.category,

        student_id:
          Number(select.value)

      });

    });


  if (rows.length > 0) {

    const {
      error
    } =
      await supabaseClient
        .from("categories")
        .insert(rows);


    if (error) {

      console.error(error);

      message.textContent =
        "❌ Impossible d'enregistrer les catégories.";

      return;

    }

  }


  message.textContent =
    "✓ Tes catégories sont enregistrées !";


  await loadMyResults();

}


/* ==================================================
   TOP 5
   ================================================== */

function createTopFive() {

  if (!topFiveContainer) {
    return;
  }


  topFiveContainer.innerHTML = "";


  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    const row =
      document.createElement("div");


    row.className =
      "top-five-row";


    row.innerHTML = `

      <div class="top-five-number">
        ${i}
      </div>

      <select
        class="top-five-select"
        data-position="${i}"
      >

        <option value="">
          Choisir...
        </option>

      </select>

    `;


    const select =
      row.querySelector(
        ".top-five-select"
      );


    students.forEach(
      student => {

        const option =
          document.createElement("option");


        option.value =
          student.id;


        option.textContent =
          student.name;


        select.appendChild(option);

      }
    );


    topFiveContainer.appendChild(
      row
    );

  }

}


/* ==================================================
   CHARGER LE TOP 5
   ================================================== */

async function loadTopFive() {

  if (!topFiveContainer) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("top5")
      .select("*")
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      )
      .order(
        "position",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Erreur chargement Top 5 :",
      error
    );

    return;

  }


  (data || []).forEach(
    item => {

      const select =
        document.querySelector(
          `.top-five-select[data-position="${item.position}"]`
        );


      if (select) {

        select.value =
          String(item.student_id);

      }

    }
  );

}


/* ==================================================
   ENREGISTRER LE TOP 5
   ================================================== */

const saveTopFiveButton =
  document.getElementById(
    "saveTopFiveButton"
  );


if (saveTopFiveButton) {

  saveTopFiveButton.addEventListener(
    "click",
    saveTopFive
  );

}


async function saveTopFive() {

  const message =
    document.getElementById(
      "topFiveMessage"
    );


  message.textContent =
    "Enregistrement...";


  const selects =
    Array.from(
      document.querySelectorAll(
        ".top-five-select"
      )
    );


  /*
     Il faut 5 candidats.
  */

  if (
    students.length < 5
  ) {

    message.textContent =
      "❌ Il faut au moins 5 candidats pour créer un Top 5.";

    return;

  }


  /*
     Vérification des choix.
  */

  const chosen = [];


  for (const select of selects) {

    if (!select.value) {

      message.textContent =
        "❌ Choisis les 5 candidats de ton Top 5.";

      return;

    }


    if (
      chosen.includes(
        select.value
      )
    ) {

      message.textContent =
        "❌ Un candidat ne peut apparaître qu'une seule fois.";

      return;

    }


    chosen.push(
      select.value
    );

  }


  /*
     On supprime l'ancien Top 5.
  */

  const {
    error: deleteError
  } =
    await supabaseClient
      .from("top5")
      .delete()
      .eq(
        "player_name",
        currentPlayer
      )
      .eq(
        "prime_number",
        currentPrime
      );


  if (deleteError) {

    console.error(deleteError);

    message.textContent =
      "❌ Impossible de modifier le Top 5.";

    return;

  }


  /*
     On crée le nouveau Top 5.
  */

  const rows =
    selects.map(
      select => ({

        player_name:
          currentPlayer,

        prime_number:
          currentPrime,

        position:
          Number(
            select.dataset.position
          ),

        student_id:
          Number(select.value)

      })
    );


  const {
    error
  } =
    await supabaseClient
      .from("top5")
      .insert(rows);


  if (error) {

    console.error(error);

    message.textContent =
      "❌ Impossible d'enregistrer le Top 5.";

    return;

  }


  message.textContent =
    "✓ Ton Top 5 est enregistré !";


  await loadMyResults();

}


/* ==================================================
   HISTORIQUE
   ================================================== */

async function loadMyResults() {

  if (!currentPlayer || !myResults) {
    return;
  }


  /*
     On récupère les Primes où il y a
     des données enregistrées.
  */

  const [
    predictionsResult,
    ratingsResult
  ] =
    await Promise.all([

      supabaseClient
        .from("predictions")
        .select("prime_number")
        .eq(
          "player_name",
          currentPlayer
        )
        .order(
          "prime_number",
          {
            ascending: true
          }
        ),

      supabaseClient
        .from("ratings")
        .select(
          "prime_number,rating"
        )
        .eq(
          "player_name",
          currentPlayer
        )
        .order(
          "prime_number",
          {
            ascending: true
          }
        )

    ]);


  if (
    predictionsResult.error
    ||
    ratingsResult.error
  ) {

    console.error(
      predictionsResult.error ||
      ratingsResult.error
    );

    return;

  }


  const primeNumbers =
    new Set();


  (predictionsResult.data || [])
    .forEach(
      item =>
        primeNumbers.add(
          item.prime_number
        )
    );


  (ratingsResult.data || [])
    .forEach(
      item =>
        primeNumbers.add(
          item.prime_number
        )
    );


  myResults.innerHTML = "";


  if (primeNumbers.size === 0) {

    myResults.innerHTML = `

      <p>
        Aucun Prime enregistré pour le moment.
      </p>

    `;

    return;

  }


  const ratingsByPrime = {};


  (ratingsResult.data || [])
    .forEach(
      item => {

        if (
          !ratingsByPrime[
            item.prime_number
          ]
        ) {

          ratingsByPrime[
            item.prime_number
          ] = [];

        }


        ratingsByPrime[
          item.prime_number
        ].push(
          Number(item.rating)
        );

      }
    );


  Array.from(primeNumbers)
    .sort(
      (a, b) => a - b
    )
    .forEach(
      prime => {

        const values =
          ratingsByPrime[prime] || [];


        let averageText =
          "Pas encore noté";


        if (values.length > 0) {

          const total =
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            );


          const average =
            total / values.length;


          averageText =
            `⭐ Moyenne : ${average.toFixed(1)}/10`;

        }


        const div =
          document.createElement("div");


        div.className =
          "history-item";


        div.innerHTML = `

          <h3>
            Prime ${prime}
          </h3>

          <p>
            ${averageText}
          </p>

        `;


        myResults.appendChild(
          div
        );

      }
    );

}


/* ==================================================
   PROTECTION HTML
   ================================================== */

function escapeHTML(text) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ==================================================
   INITIALISATION
   ================================================== */

async function init() {

  createPrimes();

  await loadPlayers();

  await loadStudents();

}


init();


/* ==================================================
   ACTUALISATION
   ================================================== */

setInterval(
  async () => {

    await loadPlayers();

    await loadStudents();


    if (currentPlayer) {

      await loadMyResults();

    }

  },
  10000
);
