/* ==================================================
   STAR ACADEMY — SCRIPT
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


const categories = [

  {
    id: "funniest",
    title: "😂 Le/la plus drôle"
  },

  {
    id: "charisma",
    title: "✨ Le plus de charisme"
  },

  {
    id: "touched",
    title: "🥹 M'a le plus touché(e)"
  },

  {
    id: "liked_least",
    title: "😒 J'aime le moins"
  },

  {
    id: "furthest",
    title: "🚀 Ira le plus loin"
  },

  {
    id: "annoying",
    title: "😵 Risque de me saouler"
  },

  {
    id: "worst",
    title: "🤡 Le/la plus nul(le)"
  },

  {
    id: "could_win",
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
   ÉLÉMENTS
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
  document.getElementById(
    "addCandidateButton"
  );


const addProfileButton =
  document.getElementById(
    "addProfileButton"
  );


const ratingsContainer =
  document.getElementById(
    "ratingsContainer"
  );


const categoriesContainer =
  document.getElementById(
    "categoriesContainer"
  );


const topFiveContainer =
  document.getElementById(
    "topFiveContainer"
  );


/* ==================================================
   MENU
   ================================================== */

menuButton.addEventListener(
  "click",
  () => {

    nav.classList.toggle("open");

  }
);


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

    console.error(error);

    return;

  }


  players = data || [];

  displayPlayers();

}


function displayPlayers() {

  playersContainer.innerHTML = "";


  players.forEach(
    (player, index) => {

      const button =
        document.createElement("button");


      button.className =
        "player-card";


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
   AJOUTER PROFIL
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

    console.error(error);

    return;

  }


  students = data || [];

  displayStudents();

}


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


      candidateList.appendChild(item);

    }
  );

}


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
   PRIMES
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
          Mes avis & pronostics
        </p>

      </div>

      <button>
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
   MENUS CANDIDATS
   ================================================== */

function fillSelect(selectId) {

  const select =
    document.getElementById(selectId);


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
   OUVRIR PRIME
   ================================================== */

async function openPrime(
  prime
) {

  if (!currentPlayer) {

    alert(
      "Choisis d'abord ton profil."
    );

    document
      .getElementById("profils")
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


  currentPrime = prime;


  primeNumber.textContent =
    `PRIME ${prime}`;


  primeTitle.textContent =
    `Mes avis sur le Prime ${prime}`;


  playerName.textContent =
    currentPlayer;


  fillSelect("immunity");

  fillSelect("bestDuo");

  fillSelect("bestPerformance");

  fillSelect("favorite");

  fillSelect("eliminated");

  fillSelect("winner");


  createRatingCards();

  createCategoryCards();

  createTopFive();


  primeSpace.classList.remove(
    "hidden"
  );


  primeSpace.scrollIntoView({
    behavior: "smooth"
  });


  await loadPrediction();

  await loadRatings();

  await loadCategories();

  await loadTopFive();

}


/* ==================================================
   RETOUR
   ================================================== */

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


/* ==================================================
   PRONOSTICS
   ================================================== */

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

      console.error(searchError);

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
          .insert(prediction);

    }


    if (result.error) {

      console.error(result.error);

      saveMessage.textContent =
        "❌ Impossible d'enregistrer.";

      return;

    }


    saveMessage.textContent =
      "✓ Tes pronostics sont enregistrés !";

});


async function loadPrediction() {

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
   NOTES /10
   ================================================== */

function createRatingCards() {

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


      ratingsContainer.appendChild(card);

    }
  );

}


async function loadRatings() {

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

    console.error(error);

    return;

  }


  data.forEach(
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
        input.value = rating.score ?? "";
      }


      if (comment) {
        comment.value = rating.comment ?? "";
      }

    }
  );

}


document
  .getElementById("saveRatingsButton")
  .addEventListener(
    "click",
    saveRatings
  );


async function saveRatings() {

  const message =
    document.getElementById(
      "ratingsMessage"
    );


  message.textContent =
    "Enregistrement...";


  const rows = [];


  students.forEach(
    student => {

      const input =
        document.querySelector(
          `.rating-input[data-student="${student.id}"]`
        );


      const comment =
        document.querySelector(
          `.rating-comment[data-student="${student.id}"]`
        );


      const score =
        input.value === ""
          ? null
          : Number(input.value);


      const text =
        comment.value.trim();


      if (
        score !== null ||
        text
      ) {

        rows.push({

          player_name:
            currentPlayer,

          prime_number:
            currentPrime,

          student_id:
            student.id,

          score:
            score,

          comment:
            text

        });

      }

    }
  );


  for (const row of rows) {

    const {
      data: existing
    } =
      await supabaseClient
        .from("ratings")
        .select("id")
        .eq(
          "player_name",
          row.player_name
        )
        .eq(
          "prime_number",
          row.prime_number
        )
        .eq(
          "student_id",
          row.student_id
        )
        .maybeSingle();


    if (existing) {

      await supabaseClient
        .from("ratings")
        .update(row)
        .eq(
          "id",
          existing.id
        );

    } else {

      await supabaseClient
        .from("ratings")
        .insert(row);

    }

  }


  message.textContent =
    "✓ Tes notes sont enregistrées !";

}


/* ==================================================
   CATÉGORIES
   ================================================== */

function createCategoryCards() {

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
        card.querySelector("select");


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


      categoriesContainer.appendChild(card);

    }
  );

}


async function loadCategories() {

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

    console.error(error);

    return;

  }


  data.forEach(
    item => {

      const select =
        document.querySelector(
          `.category-select[data-category="${item.category}"]`
        );


      if (select) {

        select.value =
          item.student_name || "";

      }

    }
  );

}


document
  .getElementById("saveCategoriesButton")
  .addEventListener(
    "click",
    saveCategories
  );


async function saveCategories() {

  const message =
    document.getElementById(
      "categoriesMessage"
    );


  message.textContent =
    "Enregistrement...";


  const selects =
    document.querySelectorAll(
      ".category-select"
    );


  for (const select of selects) {

    const category =
      select.dataset.category;


    const studentName =
      select.value;


    if (!studentName) {
      continue;
    }


    const {
      data: existing
    } =
      await supabaseClient
        .from("categories")
        .select("id")
        .eq(
          "player_name",
          currentPlayer
        )
        .eq(
          "prime_number",
          currentPrime
        )
        .eq(
          "category",
          category
        )
        .maybeSingle();


    const row = {

      player_name:
        currentPlayer,

      prime_number:
        currentPrime,

      category:
        category,

      student_name:
        studentName

    };


    if (existing) {

      await supabaseClient
        .from("categories")
        .update(row)
        .eq(
          "id",
          existing.id
        );

    } else {

      await supabaseClient
        .from("categories")
        .insert(row);

    }

  }


  message.textContent =
    "✓ Tes catégories sont enregistrées !";

}


/* ==================================================
   TOP 5
   ================================================== */

function createTopFive() {

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
        data-rank="${i}"
      >

        <option value="">
          Choisir...
        </option>

      </select>

    `;


    const select =
      row.querySelector("select");


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


    topFiveContainer.appendChild(row);

  }

}


async function loadTopFive() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("top_five")
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
        "rank"
      );


  if (error) {

    console.error(error);

    return;

  }


  data.forEach(
    item => {

      const select =
        document.querySelector(
          `.top-five-select[data-rank="${item.rank}"]`
        );


      if (select) {

        select.value =
          item.student_name || "";

      }

    }
  );

}


document
  .getElementById("saveTopFiveButton")
  .addEventListener(
    "click",
    saveTopFive
  );


async function saveTopFive() {

  const message =
    document.getElementById(
      "topFiveMessage"
    );


  message.textContent =
    "Enregistrement...";


  const selects =
    document.querySelectorAll(
      ".top-five-select"
    );


  const chosen = [];


  for (const select of selects) {

    if (
      select.value &&
      chosen.includes(select.value)
    ) {

      message.textContent =
        "❌ Un candidat ne peut apparaître qu'une seule fois.";

      return;

    }


    if (select.value) {

      chosen.push(select.value);

    }

  }


  for (const select of selects) {

    const rank =
      Number(
        select.dataset.rank
      );


    const studentName =
      select.value;


    if (!studentName) {
      continue;
    }


    const {
      data: existing
    } =
      await supabaseClient
        .from("top_five")
        .select("id")
        .eq(
          "player_name",
          currentPlayer
        )
        .eq(
          "prime_number",
          currentPrime
        )
        .eq(
          "rank",
          rank
        )
        .maybeSingle();


    const row = {

      player_name:
        currentPlayer,

      prime_number:
        currentPrime,

      rank:
        rank,

      student_name:
        studentName

    };


    if (existing) {

      await supabaseClient
        .from("top_five")
        .update(row)
        .eq(
          "id",
          existing.id
        );

    } else {

      await supabaseClient
        .from("top_five")
        .insert(row);

    }

  }


  message.textContent =
    "✓ Ton Top 5 est enregistré !";

}


/* ==================================================
   HISTORIQUE
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
      );


  if (error) {

    console.error(error);

    return;

  }


  myResults.innerHTML = "";


  if (
    !data ||
    data.length === 0
  ) {

    myResults.innerHTML = `

      <p>
        Aucun Prime enregistré pour le moment.
      </p>

    `;

    return;

  }


  data.forEach(
    item => {

      const div =
        document.createElement("div");


      div.className =
        "history-item";


      div.innerHTML = `

        <h3>
          Prime ${item.prime_number}
        </h3>

        <p>
          Tes pronostics et tes avis sont enregistrés.
        </p>

      `;


      myResults.appendChild(div);

    }
  );

}


/* ==================================================
   PROTECTION
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
