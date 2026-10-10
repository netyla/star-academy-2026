
/* ==================================================
   STAR ACADEMY 2026 — SCRIPT
   Comptes utilisateurs + 13 primes + données personnelles
   ================================================== */


/* ==================================================
   1. SUPABASE
   ================================================== */

const SUPABASE_URL =
  "https://hkjcllpnblziibdjehsx.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_DoddvQYfbdAwlh-23vPK3g_ux7_3qnT";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* ==================================================
   2. CONFIGURATION
   ================================================== */

const numberOfPrimes = 13;

const categories = [
  { id: "coup_de_coeur", title: "💕 Coup de cœur" },
  { id: "plus_drole", title: "😂 Le/la plus drôle" },
  { id: "charisme", title: "✨ Le plus de charisme" },
  { id: "plus_touche", title: "🥹 M'a le plus touché(e)" },
  { id: "aime_moins", title: "😒 J'aime le moins" },
  { id: "ira_plus_loin", title: "🚀 Ira le plus loin" },
  { id: "risque_saouler", title: "😵 Risque de me saouler" },
  { id: "plus_nul", title: "🤡 Le/la plus nul(le)" },
  { id: "pourrait_gagner", title: "🏆 Pourrait gagner" }
];


/* ==================================================
   3. VARIABLES
   ================================================== */

let currentUser = null;
let currentSession = null;
let currentSessionRole = null;
let currentPlayer = null;
let currentPrime = null;
let currentLegacyPlayerId = null;

let students = [];
let players = [];


/* ==================================================
   4. ÉLÉMENTS HTML
   ================================================== */

// Authentification
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutButton = document.getElementById("logoutButton");
const authMessage = document.getElementById("authMessage");
const authForms = document.getElementById("authForms");
const loggedInArea = document.getElementById("loggedInArea");
const loggedInEmail = document.getElementById("loggedInEmail");

// ÉLÉMENTS DU GROUPE PRIVÉ
const groupPanel = document.getElementById("groupPanel");
const currentGroupInfo = document.getElementById("currentGroupInfo");
const currentGroupName = document.getElementById("currentGroupName");
const currentGroupCode = document.getElementById("currentGroupCode");
const copyGroupCodeButton = document.getElementById("copyGroupCodeButton");
const groupMembers = document.getElementById("groupMembers");
const pendingRequestsArea = document.getElementById("pendingRequestsArea");
const pendingRequests = document.getElementById("pendingRequests");
const createGroupForm = document.getElementById("createGroupForm");
const groupNameInput = document.getElementById("groupNameInput");
const joinGroupForm = document.getElementById("joinGroupForm");
const groupCodeInput = document.getElementById("groupCodeInput");
const groupMessage = document.getElementById("groupMessage");

const groupResponses = document.getElementById("groupResponses");
const groupResponsesContent = document.getElementById("groupResponsesContent");

// Anciens profils : conservés uniquement pour compatibilité
const playersContainer = document.getElementById("players");
const selectedPlayer = document.getElementById("selectedPlayer");
const addProfileButton = document.getElementById("addProfileButton");

const primeGrid = document.getElementById("primeGrid");
const primeSpace = document.getElementById("primeSpace");
const primesSection = document.getElementById("primes");

const primeNumber = document.getElementById("primeNumber");
const primeTitle = document.getElementById("primeTitle");
const playerName = document.getElementById("playerName");

const predictionForm = document.getElementById("predictionForm");
const saveMessage = document.getElementById("saveMessage");
const backToPrimes = document.getElementById("backToPrimes");
const myResults = document.getElementById("myResults");

const nav = document.getElementById("nav");
const menuButton = document.getElementById("menuButton");

const candidateList = document.getElementById("candidateList");
const candidateInput = document.getElementById("candidateInput");
const addCandidateButton = document.getElementById("addCandidateButton");

const ratingsContainer = document.getElementById("ratingsContainer");
const categoriesContainer = document.getElementById("categoriesContainer");
const topFiveContainer = document.getElementById("topFiveContainer");

const primeFinalRating = document.getElementById("primeFinalRating");
const primeFinalComment = document.getElementById("primeFinalComment");
const savePrimeRatingButton =
  document.getElementById("savePrimeRatingButton");
const primeRatingMessage = document.getElementById("primeRatingMessage");

const saveRatingsButton = document.getElementById("saveRatingsButton");
const saveCategoriesButton =
  document.getElementById("saveCategoriesButton");
const saveTopFiveButton = document.getElementById("saveTopFiveButton");


/* ==================================================
   5. OUTILS
   ================================================== */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(element, message) {
  if (element) element.textContent = message;
}

function requireLogin() {
  if (currentUser) return true;

  alert("Connecte-toi à ton compte pour continuer.");
  document.getElementById("connexion")?.scrollIntoView({
    behavior: "smooth"
  });

  return false;
}

function clearPersonalScreen() {
  currentPlayer = null;
  currentPrime = null;
  currentLegacyPlayerId = null;

  if (myResults) myResults.innerHTML = "";
  if (primeSpace) primeSpace.classList.add("hidden");

  if (selectedPlayer) selectedPlayer.textContent = "";

  primeGrid?.querySelectorAll(".prime-card").forEach(card => {
    card.classList.remove("active");
  });
}

function resetPrimeFinalRating() {
  if (primeFinalRating) primeFinalRating.value = "";
  if (primeFinalComment) primeFinalComment.value = "";

  showMessage(primeRatingMessage, "");
}


/* ==================================================
   6. MENU MOBILE
   ================================================== */

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}


/* ==================================================
   7. COMPTES : CONNEXION ET INSCRIPTION
   ================================================== */

function updateAuthDisplay() {
  const isLoggedIn = Boolean(currentUser);

  if (authForms) {
    authForms.classList.toggle("hidden", isLoggedIn);
  }

  if (loggedInArea) {
    loggedInArea.classList.toggle("hidden", !isLoggedIn);
  }

  if (loggedInEmail) {
    loggedInEmail.textContent = isLoggedIn
      ? `Connecté(e) : ${currentUser.email || currentPlayer || ""}`
      : "";
  }

  // L'ancien système de profils n'est plus utilisé pour se connecter.
  const oldProfilesSection = document.getElementById("profils");

  if (oldProfilesSection) {
    oldProfilesSection.classList.add("hidden");
  }

  if (playersContainer) playersContainer.innerHTML = "";
}

async function getDisplayName(user) {
  const metadataName =
    user.user_metadata?.display_name ||
    user.user_metadata?.name;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("name, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur lecture du profil du compte :", error);
  }

  return (
    data?.display_name ||
    data?.name ||
    metadataName ||
    user.email?.split("@")[0] ||
    "Mon compte"
  );
}

async function handleAuthenticatedUser(user) {
  if (!user) {
    currentUser = null;
    clearPersonalScreen();
    updateAuthDisplay();
    return;
  }

  // Évite de recharger tout le compte inutilement.
  if (currentUser?.id === user.id && currentPlayer) {
    updateAuthDisplay();
    return;
  }

  currentUser = user;
  currentPlayer = await getDisplayName(user);

  clearPersonalScreen();

  // clearPersonalScreen remet le nom à null : on le restaure ici.
  currentPlayer = await getDisplayName(user);

  updateAuthDisplay();

  showMessage(
    authMessage,
    "✓ Tu es connecté(e). Tes données sont associées à ton compte."
  );

  await loadStudents();
  await loadMyResults();
}

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
      showMessage(authMessage, "Renseigne ton e-mail et ton mot de passe.");
      return;
    }

    showMessage(authMessage, "Connexion en cours...");

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Erreur de connexion :", error);
      showMessage(
        authMessage,
        "❌ Connexion impossible. Vérifie ton e-mail, ton mot de passe et la confirmation de ton compte."
      );
      return;
    }

    await handleAuthenticatedUser(data.user);
    loginForm.reset();
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const password = document.getElementById("signupPassword")?.value;

    if (!name || !email || !password) {
      showMessage(authMessage, "Remplis tous les champs pour créer ton compte.");
      return;
    }

    if (password.length < 6) {
      showMessage(
        authMessage,
        "Choisis un mot de passe d'au moins 6 caractères."
      );
      return;
    }

    showMessage(authMessage, "Création du compte en cours...");

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          display_name: name
        }
      }
    });

    if (error) {
      console.error("Erreur de création de compte :", error);
      showMessage(
        authMessage,
        "❌ Impossible de créer le compte : " + error.message
      );
      return;
    }

    signupForm.reset();

    if (data.session && data.user) {
      await handleAuthenticatedUser(data.user);
      showMessage(authMessage, "✓ Ton compte est créé et tu es connecté(e).");
    } else {
      showMessage(
        authMessage,
        "✓ Compte créé ! Vérifie tes e-mails pour confirmer ton adresse, puis connecte-toi."
      );
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    showMessage(authMessage, "Déconnexion en cours...");

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erreur de déconnexion :", error);
      showMessage(authMessage, "❌ Impossible de te déconnecter.");
      return;
    }

    currentUser = null;
    clearPersonalScreen();
    updateAuthDisplay();

    showMessage(authMessage, "Tu es déconnecté(e).");
    document.getElementById("connexion")?.scrollIntoView({
      behavior: "smooth"
    });
  });
}


/* ==================================================
   8. ANCIENS PROFILS : DÉSACTIVÉS
   ================================================== */

// Les comptes sont désormais gérés par Supabase Auth.
// On ne crée plus de profils partagés avec le bouton historique.

if (addProfileButton) {
  addProfileButton.classList.add("hidden");
}


/* ==================================================
   9. CANDIDATS PARTAGÉS
   ================================================== */

async function loadStudents() {
  const { data, error } = await supabaseClient
    .from("students")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("Erreur chargement candidats :", error);
    return;
  }

  students = data || [];
  displayStudents();

  if (currentPrime) {
    createRatingCards();
    createCategoryCards();
    createTopFive();

    await loadRatings();
    await loadCategories();
    await loadTopFive();
  }
}

function displayStudents() {
  if (!candidateList) return;

  candidateList.innerHTML = "";

  if (students.length === 0) {
    candidateList.innerHTML = `
      <p class="candidate-empty">
        Aucun candidat ajouté pour le moment.
      </p>
    `;
    return;
  }

  students.forEach(student => {
    const item = document.createElement("div");
    item.className = "candidate-item";

    const name = document.createElement("span");
    name.textContent = student.name;
    item.appendChild(name);

    if (currentUser) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.setAttribute("aria-label", `Supprimer ${student.name}`);

      deleteButton.addEventListener("click", () => {
        deleteStudent(student.id);
      });

      item.appendChild(deleteButton);
    }

    candidateList.appendChild(item);
  });
}

if (addCandidateButton) {
  addCandidateButton.addEventListener("click", addStudent);
}

if (candidateInput) {
  candidateInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addStudent();
    }
  });
}

async function addStudent() {
  if (!requireLogin() || !candidateInput) return;

  const name = candidateInput.value.trim();

  if (!name) {
    alert("Écris le prénom du candidat.");
    return;
  }

  if (students.some(student => student.name.toLowerCase() === name.toLowerCase())) {
    alert("Ce candidat existe déjà.");
    return;
  }

  const { error } = await supabaseClient
    .from("students")
    .insert({ name });

  if (error) {
    console.error("Erreur ajout candidat :", error);
    alert("Impossible d'ajouter le candidat : " + error.message);
    return;
  }

  candidateInput.value = "";
  await loadStudents();
}

async function deleteStudent(id) {
  if (!requireLogin()) return;
  if (!confirm("Supprimer ce candidat ?")) return;

  const { error } = await supabaseClient
    .from("students")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur suppression candidat :", error);
    alert("Impossible de supprimer ce candidat : " + error.message);
    return;
  }

  await loadStudents();
}


/* ==================================================
   10. CRÉATION DES 13 PRIMES
   ================================================== */

function createPrimes() {
  if (!primeGrid) return;

  primeGrid.innerHTML = "";

  for (let i = 1; i <= numberOfPrimes; i++) {
    const card = document.createElement("article");
    card.className = "prime-card";

    card.innerHTML = `
      <div>
        <div class="prime-number">${String(i).padStart(2, "0")}</div>
        <h3>Prime ${i}</h3>
        <p>Mes avis &amp; pronostics</p>
      </div>
      <button type="button">Ouvrir le Prime</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      openPrime(i, card);
    });

    primeGrid.appendChild(card);
  }
}


/* ==================================================
   11. LISTES DE CANDIDATS
   ================================================== */

function fillSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">Choisir...</option>`;

  students.forEach(student => {
    const option = document.createElement("option");
    option.value = student.name;
    option.textContent = student.name;
    select.appendChild(option);
  });
}


/* ==================================================
   12. OUVRIR UN PRIME
   ================================================== */

async function openPrime(prime, card) {
  if (!requireLogin()) return;

  if (students.length === 0) {
    alert("Ajoute d'abord les candidats.");
    document.getElementById("candidats")?.scrollIntoView({
      behavior: "smooth"
    });
    return;
  }

  currentPrime = prime;

  primeGrid?.querySelectorAll(".prime-card").forEach(item => {
    item.classList.remove("active");
  });

  card?.classList.add("active");

  showMessage(primeNumber, `PRIME ${prime}`);
  showMessage(primeTitle, `Mes avis sur le Prime ${prime}`);
  showMessage(playerName, currentPlayer);

  fillSelect("immunity");
  fillSelect("bestDuo");
  fillSelect("bestPerformance");
  fillSelect("favorite");
  fillSelect("eliminated");
  fillSelect("winner");

  createRatingCards();
  createCategoryCards();
  createTopFive();
  resetPrimeFinalRating();

  primeSpace?.classList.remove("hidden");
  primeSpace?.scrollIntoView({ behavior: "smooth" });

  await loadPrediction();
  await loadRatings();
  await loadCategories();
  await loadTopFive();
  await loadPrimeFinalRating();
}

if (backToPrimes) {
  backToPrimes.addEventListener("click", () => {
    primeSpace?.classList.add("hidden");
    primesSection?.scrollIntoView({ behavior: "smooth" });
  });
}


/* ==================================================
   13. PRONOSTICS CLASSIQUES
   ================================================== */

if (predictionForm) {
  predictionForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser || !currentPrime || !currentPlayer) {
      showMessage(saveMessage, "❌ Connecte-toi et ouvre un Prime.");
      return;
    }

    const prediction = {
      user_id: currentUser.id,
      player_name: currentPlayer,
      prime_number: currentPrime,
      immunity: document.getElementById("immunity")?.value || "",
      best_duo: document.getElementById("bestDuo")?.value || "",
      best_performance:
        document.getElementById("bestPerformance")?.value || "",
      favorite: document.getElementById("favorite")?.value || "",
      eliminated: document.getElementById("eliminated")?.value || "",
      winner: document.getElementById("winner")?.value || ""
    };

    showMessage(saveMessage, "Enregistrement...");

    const { error: deleteError } = await supabaseClient
      .from("predictions")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("prime_number", currentPrime);

    if (deleteError) {
      console.error("Erreur remplacement pronostics :", deleteError);
      showMessage(saveMessage, "❌ Impossible d'enregistrer les pronostics.");
      return;
    }

    const { error } = await supabaseClient
      .from("predictions")
      .insert(prediction);

    if (error) {
      console.error("Erreur enregistrement pronostics :", error);
      showMessage(saveMessage, "❌ Impossible d'enregistrer les pronostics.");
      return;
    }

    showMessage(saveMessage, "✓ Tes pronostics sont enregistrés !");
    await loadMyResults();
  });
}

async function loadPrediction() {
  if (!predictionForm || !currentUser || !currentPrime) return;

  predictionForm.reset();

  const { data, error } = await supabaseClient
    .from("predictions")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement pronostics :", error);
    return;
  }

  if (!data) return;

  const fields = {
    immunity: data.immunity,
    bestDuo: data.best_duo,
    bestPerformance: data.best_performance,
    favorite: data.favorite,
    eliminated: data.eliminated,
    winner: data.winner
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  });
}


/* ==================================================
   14. NOTES SUR 10
   ================================================== */

function createRatingCards() {
  if (!ratingsContainer) return;

  ratingsContainer.innerHTML = "";

  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "rating-card";
    card.dataset.studentId = student.id;

    card.innerHTML = `
      <div class="rating-top">
        <span class="rating-name">${escapeHTML(student.name)}</span>
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
  });
}

async function loadRatings() {
  if (!ratingsContainer || !currentUser || !currentPrime) return;

  const { data, error } = await supabaseClient
    .from("ratings")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (error) {
    console.error("Erreur chargement notes :", error);
    return;
  }

  (data || []).forEach(rating => {
    const input = document.querySelector(
      `.rating-input[data-student="${rating.student_id}"]`
    );

    const comment = document.querySelector(
      `.rating-comment[data-student="${rating.student_id}"]`
    );

    if (input) input.value = rating.rating ?? "";
    if (comment) comment.value = rating.comment ?? "";
  });
}

if (saveRatingsButton) {
  saveRatingsButton.addEventListener("click", saveRatings);
}

async function saveRatings() {
  const message = document.getElementById("ratingsMessage");

  if (!currentUser || !currentPrime || !currentPlayer) {
    showMessage(message, "❌ Connecte-toi et ouvre un Prime.");
    return;
  }

  const rows = [];

  for (const student of students) {
    const input = document.querySelector(
      `.rating-input[data-student="${student.id}"]`
    );

    const comment = document.querySelector(
      `.rating-comment[data-student="${student.id}"]`
    );

    const value = input?.value;

    if (value === "" || value === undefined) {
      showMessage(message, "❌ Note chaque candidat sur 10 avant d'enregistrer.");
      input?.focus();
      return;
    }

    const rating = Number(value);

    if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
      showMessage(message, "❌ Les notes doivent être des nombres entiers de 0 à 10.");
      input?.focus();
      return;
    }

    rows.push({
      user_id: currentUser.id,
      player_name: currentPlayer,
      prime_number: currentPrime,
      student_id: student.id,
      rating,
      comment: comment?.value.trim() || null
    });
  }

  if (rows.length === 0) {
    showMessage(message, "❌ Aucun candidat à noter.");
    return;
  }

  showMessage(message, "Enregistrement...");

  const { error: deleteError } = await supabaseClient
    .from("ratings")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (deleteError) {
    console.error("Erreur remplacement notes :", deleteError);
    showMessage(message, "❌ Impossible d'enregistrer les notes.");
    return;
  }

  const { error } = await supabaseClient.from("ratings").insert(rows);

  if (error) {
    console.error("Erreur enregistrement notes :", error);
    showMessage(message, "❌ Impossible d'enregistrer les notes.");
    return;
  }

  showMessage(message, "✓ Tes notes et commentaires sont enregistrés !");
  await loadMyResults();
}


/* ==================================================
   15. CATÉGORIES
   ================================================== */

function createCategoryCards() {
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = "";

  categories.forEach(category => {
    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <h4>${category.title}</h4>
      <select class="category-select" data-category="${category.id}">
        <option value="">Choisir...</option>
      </select>
    `;

    const select = card.querySelector(".category-select");

    students.forEach(student => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      select.appendChild(option);
    });

    categoriesContainer.appendChild(card);
  });
}

async function loadCategories() {
  if (!categoriesContainer || !currentUser || !currentPrime) return;

  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (error) {
    console.error("Erreur chargement catégories :", error);
    return;
  }

  (data || []).forEach(item => {
    const select = document.querySelector(
      `.category-select[data-category="${item.category}"]`
    );

    if (select) select.value = String(item.student_id);
  });
}

if (saveCategoriesButton) {
  saveCategoriesButton.addEventListener("click", saveCategories);
}

async function saveCategories() {
  const message = document.getElementById("categoriesMessage");

  if (!currentUser || !currentPrime || !currentPlayer) {
    showMessage(message, "❌ Connecte-toi et ouvre un Prime.");
    return;
  }

  const rows = [];

  document.querySelectorAll(".category-select").forEach(select => {
    if (!select.value) return;

    rows.push({
      user_id: currentUser.id,
      player_name: currentPlayer,
      prime_number: currentPrime,
      category: select.dataset.category,
      student_id: Number(select.value)
    });
  });

  showMessage(message, "Enregistrement...");

  const { error: deleteError } = await supabaseClient
    .from("categories")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (deleteError) {
    console.error("Erreur suppression anciennes catégories :", deleteError);
    showMessage(message, "❌ Impossible de modifier les catégories.");
    return;
  }

  if (rows.length > 0) {
    const { error } = await supabaseClient.from("categories").insert(rows);

    if (error) {
      console.error("Erreur enregistrement catégories :", error);
      showMessage(message, "❌ Impossible d'enregistrer les catégories.");
      return;
    }
  }

  showMessage(message, "✓ Tes catégories sont enregistrées !");
  await loadMyResults();
}


/* ==================================================
   16. TOP 5
   ================================================== */

function createTopFive() {
  if (!topFiveContainer) return;

  topFiveContainer.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement("div");
    row.className = "top-five-row";

    row.innerHTML = `
      <div class="top-five-number">${i}</div>
      <select class="top-five-select" data-position="${i}">
        <option value="">Choisir...</option>
      </select>
    `;

    const select = row.querySelector(".top-five-select");

    students.forEach(student => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      select.appendChild(option);
    });

    topFiveContainer.appendChild(row);
  }
}

async function loadTopFive() {
  if (!topFiveContainer || !currentUser || !currentPrime) return;

  const { data, error } = await supabaseClient
    .from("top5")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime)
    .order("position", { ascending: true });

  if (error) {
    console.error("Erreur chargement Top 5 :", error);
    return;
  }

  (data || []).forEach(item => {
    const select = document.querySelector(
      `.top-five-select[data-position="${item.position}"]`
    );

    if (select) select.value = String(item.student_id);
  });
}

if (saveTopFiveButton) {
  saveTopFiveButton.addEventListener("click", saveTopFive);
}

async function saveTopFive() {
  const message = document.getElementById("topFiveMessage");

  if (!currentUser || !currentPrime || !currentPlayer) {
    showMessage(message, "❌ Connecte-toi et ouvre un Prime.");
    return;
  }

  const selects = Array.from(
    document.querySelectorAll(".top-five-select")
  );

  if (students.length < 5) {
    showMessage(message, "❌ Il faut au moins 5 candidats pour créer un Top 5.");
    return;
  }

  const chosen = [];

  for (const select of selects) {
    if (!select.value) {
      showMessage(message, "❌ Choisis les 5 candidats de ton Top 5.");
      return;
    }

    if (chosen.includes(select.value)) {
      showMessage(message, "❌ Un candidat ne peut apparaître qu'une seule fois.");
      return;
    }

    chosen.push(select.value);
  }

  const rows = selects.map(select => ({
    user_id: currentUser.id,
    player_name: currentPlayer,
    prime_number: currentPrime,
    position: Number(select.dataset.position),
    student_id: Number(select.value)
  }));

  const { error: deleteError } = await supabaseClient
    .from("top5")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (deleteError) {
    console.error("Erreur modification Top 5 :", deleteError);
    showMessage(message, "❌ Impossible de modifier le Top 5.");
    return;
  }

  const { error } = await supabaseClient.from("top5").insert(rows);

  if (error) {
    console.error("Erreur enregistrement Top 5 :", error);
    showMessage(message, "❌ Impossible d'enregistrer le Top 5.");
    return;
  }

  showMessage(message, "✓ Ton Top 5 est enregistré !");
  await loadMyResults();
}


/* ==================================================
   17. IDENTIFIANT TECHNIQUE POUR LA NOTE FINALE
   ================================================== */

// L'ancienne table players est encore utilisée ici car
// prime_ratings.student_id est actuellement obligatoire.
// Cet identifiant technique n'est pas l'identifiant du compte.

async function getCurrentPlayerId() {
  if (!currentPlayer) return null;

  if (currentLegacyPlayerId) return currentLegacyPlayerId;

  const { data: existing, error: searchError } = await supabaseClient
    .from("players")
    .select("id")
    .eq("name", currentPlayer)
    .limit(1)
    .maybeSingle();

  if (searchError) {
    console.error("Erreur lecture identifiant technique :", searchError);
    return null;
  }

  if (existing) {
    currentLegacyPlayerId = existing.id;
    return existing.id;
  }

  const { data: created, error: insertError } = await supabaseClient
    .from("players")
    .insert({ name: currentPlayer })
    .select("id")
    .single();

  if (insertError) {
    console.error("Erreur création identifiant technique :", insertError);
    return null;
  }

  currentLegacyPlayerId = created.id;
  return created.id;
}


/* ==================================================
   18. NOTE FINALE DU PRIME
   ================================================== */

async function loadPrimeFinalRating() {
  if (!primeFinalRating || !primeFinalComment || !currentUser || !currentPrime) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("prime_ratings")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement note finale :", error);
    return;
  }

  if (!data) return;

  primeFinalRating.value = data.rating ?? "";
  primeFinalComment.value = data.comment ?? "";
}

if (savePrimeRatingButton) {
  savePrimeRatingButton.addEventListener("click", savePrimeFinalRating);
}

async function savePrimeFinalRating() {
  if (!currentUser || !currentPrime || !currentPlayer) {
    showMessage(primeRatingMessage, "❌ Connecte-toi et ouvre un Prime.");
    return;
  }

  const value = primeFinalRating?.value;

  if (value === "" || value === undefined) {
    showMessage(primeRatingMessage, "❌ Donne une note comprise entre 0 et 10.");
    primeFinalRating?.focus();
    return;
  }

  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
    showMessage(primeRatingMessage, "❌ La note doit être un nombre entier de 0 à 10.");
    primeFinalRating?.focus();
    return;
  }

  const legacyId = await getCurrentPlayerId();

  if (legacyId === null) {
    showMessage(
      primeRatingMessage,
      "❌ Impossible de préparer l'enregistrement. Réessaie."
    );
    return;
  }

  showMessage(primeRatingMessage, "Enregistrement...");

  const row = {
    user_id: currentUser.id,
    player_name: currentPlayer,
    prime_number: currentPrime,
    student_id: legacyId,
    rating,
    comment: primeFinalComment?.value.trim() || null
  };

  const { error: deleteError } = await supabaseClient
    .from("prime_ratings")
    .delete()
    .eq("user_id", currentUser.id)
    .eq("prime_number", currentPrime);

  if (deleteError) {
    console.error("Erreur remplacement note finale :", deleteError);
    showMessage(primeRatingMessage, "❌ Impossible d'enregistrer ta note.");
    return;
  }

  const { error } = await supabaseClient
    .from("prime_ratings")
    .insert(row);

  if (error) {
    console.error("Erreur enregistrement note finale :", error);
    showMessage(primeRatingMessage, "❌ Impossible d'enregistrer ta note.");
    return;
  }

  showMessage(primeRatingMessage, "✓ Ta note du Prime est enregistrée !");
  await loadMyResults();
}


/* ==================================================
   19. HISTORIQUE PERSONNEL
   ================================================== */

async function loadMyResults() {
  if (!currentUser || !myResults) return;

  const userId = currentUser.id;

  const [
    predictionsResult,
    ratingsResult,
    primeRatingsResult
  ] = await Promise.all([
    supabaseClient
      .from("predictions")
      .select("prime_number")
      .eq("user_id", userId)
      .order("prime_number", { ascending: true }),

    supabaseClient
      .from("ratings")
      .select("prime_number,rating")
      .eq("user_id", userId)
      .order("prime_number", { ascending: true }),

    supabaseClient
      .from("prime_ratings")
      .select("prime_number,rating,comment")
      .eq("user_id", userId)
      .order("prime_number", { ascending: true })
  ]);

  if (
    predictionsResult.error ||
    ratingsResult.error ||
    primeRatingsResult.error
  ) {
    console.error(
      "Erreur chargement historique :",
      predictionsResult.error ||
      ratingsResult.error ||
      primeRatingsResult.error
    );
    return;
  }

  const primeNumbers = new Set();

  (predictionsResult.data || []).forEach(item => {
    primeNumbers.add(item.prime_number);
  });

  (ratingsResult.data || []).forEach(item => {
    primeNumbers.add(item.prime_number);
  });

  (primeRatingsResult.data || []).forEach(item => {
    primeNumbers.add(item.prime_number);
  });

  myResults.innerHTML = "";

  if (primeNumbers.size === 0) {
    myResults.innerHTML = `<p>Aucun Prime enregistré pour le moment.</p>`;
    return;
  }

  const primeRatingsByPrime = {};

  (primeRatingsResult.data || []).forEach(item => {
    primeRatingsByPrime[item.prime_number] = item;
  });

  Array.from(primeNumbers)
    .sort((a, b) => a - b)
    .forEach(prime => {
      const finalRating = primeRatingsByPrime[prime];

      const div = document.createElement("div");
      div.className = "history-item";

      const heading = document.createElement("h3");
      heading.textContent = `Prime ${prime}`;

      const ratingText = document.createElement("p");
      ratingText.textContent = finalRating
        ? `⭐ ${finalRating.rating}/10`
        : "Note finale non enregistrée";

      div.appendChild(heading);
      div.appendChild(ratingText);

      if (finalRating?.comment) {
        const comment = document.createElement("p");
        comment.textContent = `💭 ${finalRating.comment}`;
        comment.style.marginTop = "8px";
        div.appendChild(comment);
      }

      myResults.appendChild(div);
    });
}


/* ==================================================
   20. INITIALISATION
   ================================================== */

async function init() {
  createPrimes();
  updateAuthDisplay();

  // Charge la liste partagée des candidats.
  await loadStudents();

  // Restaure la session si la personne était déjà connectée.
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Erreur récupération session :", error);
    showMessage(authMessage, "Impossible de vérifier la session.");
    return;
  }

  if (data.session?.user) {
    await handleAuthenticatedUser(data.session.user);
  } else {
    currentUser = null;
    updateAuthDisplay();
  }

  // Suit les connexions et déconnexions.
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      currentUser = null;
      clearPersonalScreen();
      updateAuthDisplay();
      return;
    }

    if (event === "SIGNED_IN" && session?.user) {
      // Le traitement asynchrone est lancé hors du callback Auth.
      setTimeout(() => {
        handleAuthenticatedUser(session.user);
      }, 0);
    }
  });
}

init();


/* ==================================================
   GROUPE PRIVÉ — STAR ACADEMY
   ================================================== */

function showGroupMessage(message, isError = false) {
  if (!groupMessage) return;

  groupMessage.textContent = message;
  groupMessage.style.color = isError ? "#c0395b" : "";
}

function groupEscapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getRpcRow(data) {
  return Array.isArray(data) ? data[0] : data;
}

/* Rattacher les anciennes réponses de la personne
   à son nouveau groupe, sans supprimer aucune ligne. */

async function attachOldAnswersToSession(sessionId) {
  const tables = [
    "predictions",
    "ratings",
    "categories",
    "top5",
    "prime_ratings"
  ];

  for (const table of tables) {
    const { error } = await supabaseClient
      .from(table)
      .update({ session_id: sessionId })
      .eq("user_id", currentUser.id)
      .is("session_id", null);

    if (error) {
      console.error(
        "Erreur de rattachement dans " + table,
        error
      );
      throw new Error(
        "Le groupe est créé, mais le rattachement des anciennes réponses a échoué dans " + table + "."
      );
    }
  }
}

/* CRÉER UN GROUPE */

if (createGroupForm) {
  createGroupForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      showGroupMessage("Connecte-toi avant de créer un groupe.", true);
      return;
    }

    const name = groupNameInput.value.trim();

    if (!name || name.length > 60) {
      showGroupMessage("Choisis un nom de groupe de 1 à 60 caractères.", true);
      return;
    }

    const submitButton = createGroupForm.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = true;
    showGroupMessage("Création du groupe en cours…");

    try {
      const { data, error } = await supabaseClient.rpc(
        "create_private_session",
        { _name: name }
      );

      if (error) throw error;

      const session = getRpcRow(data);

      if (!session || !session.session_id) {
        throw new Error("Supabase n'a pas renvoyé les informations du groupe.");
      }

      currentSession = session;
      currentSessionRole = "owner";

      await attachOldAnswersToSession(session.session_id);

      await loadCurrentGroup();

      showGroupMessage(
        "Groupe créé ! Tu peux partager le code d'invitation avec tes amis."
      );
    } catch (error) {
      console.error("Création du groupe :", error);
      showGroupMessage(
        error.message || "Impossible de créer le groupe.",
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });
}

/* REJOINDRE UN GROUPE */

if (joinGroupForm) {
  joinGroupForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      showGroupMessage("Connecte-toi avant de rejoindre un groupe.", true);
      return;
    }

    const code = groupCodeInput.value.trim();

    if (!code) {
      showGroupMessage("Saisis le code d'invitation.", true);
      return;
    }

    const submitButton = joinGroupForm.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = true;
    showGroupMessage("Envoi de ta demande…");

    try {
      const { data, error } = await supabaseClient.rpc(
        "join_private_session",
        { _code: code }
      );

      if (error) throw error;

      const result = getRpcRow(data);

      if (!result || !result.session_id) {
        throw new Error("La réponse du serveur est incomplète.");
      }

      groupCodeInput.value = "";

      showGroupMessage(
        "Demande envoyée ! Tu pourras accéder au groupe après validation par son créateur."
      );
    } catch (error) {
      console.error("Demande pour rejoindre :", error);
      showGroupMessage(
        "Impossible d'envoyer la demande. Vérifie le code et réessaie.",
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });
}

/* COPIER LE CODE D'INVITATION */

if (copyGroupCodeButton) {
  copyGroupCodeButton.addEventListener("click", async () => {
    const code = currentSession?.code;

    if (!code) {
      showGroupMessage(
        "Le code n'est pas disponible ici. Il sera affiché lors de la création du groupe.",
        true
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      showGroupMessage("Code copié !");
    } catch (error) {
      showGroupMessage("Copie impossible. Sélectionne le code pour le copier.", true);
    }
  });
}

/* CHARGER LE GROUPE ACTUEL */


async function loadCurrentGroup() {
  if (!currentUser || !groupPanel) return;

  const { data: memberships, error: membershipError } =
    await supabaseClient
      .from("session_members")
      .select("session_id, role, status, created_at")
      .eq("user_id", currentUser.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1);

  if (membershipError) {
    console.error("Chargement des membres :", membershipError);
    showGroupMessage("Impossible de charger ton groupe.", true);
    return;
  }

  const membership = memberships?.[0];

  if (!membership) {
    currentSession = null;
    currentSessionRole = null;

    currentGroupInfo?.classList.add("hidden");
    createGroupForm?.classList.remove("hidden");
    joinGroupForm?.classList.remove("hidden");
    groupResponses?.classList.add("hidden");

    if (groupMembers) groupMembers.innerHTML = "";
    if (pendingRequests) pendingRequests.innerHTML = "";

    return;
  }

  const { data: session, error: sessionError } =
    await supabaseClient
      .from("sessions")
      .select("id, name, code, created_by")
      .eq("id", membership.session_id)
      .single();

  if (sessionError) {
    console.error("Chargement du groupe :", sessionError);
    showGroupMessage(
      "Impossible de récupérer les informations du groupe.",
      true
    );
    return;
  }

  currentSession = session;
  currentSessionRole = membership.role;

  if (currentGroupName) {
    currentGroupName.textContent = session.name;
  }

  if (currentGroupCode) {
    currentGroupCode.textContent =
      membership.role === "owner"
        ? session.code
        : "Réservé au créateur";
  }

  currentGroupInfo?.classList.remove("hidden");
  createGroupForm?.classList.add("hidden");
  joinGroupForm?.classList.add("hidden");

  await loadGroupMembers();

  if (typeof loadPendingRequests === "function") {
    await loadPendingRequests();
  }

  if (typeof loadGroupResponses === "function") {
    await loadGroupResponses();
  }
}


  const membership = memberships?.[0];

  if (!membership) {
    currentSession = null;
    currentSessionRole = null;

    currentGroupInfo?.classList.add("hidden");
    createGroupForm?.classList.remove("hidden");
    joinGroupForm?.classList.remove("hidden");
    groupResponses?.classList.add("hidden");
    return;
  }

  const { data: session, error: sessionError } =
    await supabaseClient
      .from("sessions")
      .select("id, name, code, created_by")
      .eq("id", membership.session_id)
      .single();

  if (sessionError) {
    console.error("Chargement du groupe :", sessionError);
    showGroupMessage("Impossible de récupérer les informations du groupe.", true);
    return;
  }

  currentSession = session;
  currentSessionRole = membership.role;

  if (currentGroupName) {
    currentGroupName.textContent = session.name;
  }

  if (currentGroupCode) {
    currentGroupCode.textContent =
      membership.role === "owner" ? session.code : "Réservé au créateur";
  }

  currentGroupInfo?.classList.remove("hidden");
  createGroupForm?.classList.add("hidden");
  joinGroupForm?.classList.add("hidden");

  await loadGroupMembers();
}

/* AFFICHER LES MEMBRES ET LES DEMANDES */

async function loadGroupMembers() {
  if (!currentSession || !groupMembers) return;

  const { data: members, error } = await supabaseClient
    .from("session_members")
    .select("user_id, role, status")
    .eq("session_id", currentSession.id)
    .eq("status", "approved");

  if (error) {
    console.error("Liste des membres :", error);
    groupMembers.textContent = "Impossible de charger les membres.";
    return;
  }

  groupMembers.innerHTML = (members || []).map(member => {
    const isMe = member.user_id === currentUser.id;
    const label = isMe
      ? "Toi"
      : "Membre " + member.user_id.slice(0, 6);

    const roleLabel = member.role === "owner"
      ? "Créateur"
      : "Membre";

    return `
      <p>
        <strong>${groupEscapeHtml(label)}</strong>
        — ${roleLabel}
      </p>
    `;
  }).join("") || "<p>Aucun membre pour le moment.</p>";

  const isOwner = currentSessionRole === "owner";

  if (!isOwner) {
    pendingRequestsArea?.classList.add("hidden");
    return;
  }

  pendingRequestsArea?.classList.remove("hidden");

  const { data: requests, error: requestsError } =
    await supabaseClient.rpc(
      "get_pending_session_requests",
      { _session_id: currentSession.id }
    );

  if (requestsError) {
    console.error("Demandes en attente :", requestsError);
    pendingRequests.textContent = "Impossible de charger les demandes.";
    return;
  }

  if (!requests || requests.length === 0) {
    pendingRequests.innerHTML = "<p>Aucune demande en attente.</p>";
    return;
  }

  pendingRequests.innerHTML = requests.map(request => `
    <div class="group-request">
      <p>
        <strong>${groupEscapeHtml(request.request_name || "Nouveau membre")}</strong>
      </p>
      <button
        type="button"
        data-group-action="approve"
        data-user-id="${groupEscapeHtml(request.request_user_id)}"
      >
        Accepter
      </button>
      <button
        type="button"
        data-group-action="reject"
        data-user-id="${groupEscapeHtml(request.request_user_id)}"
      >
        Refuser
      </button>
    </div>
  `).join("");
}

/* ACCEPTER OU REFUSER UNE DEMANDE */

if (pendingRequests) {
  pendingRequests.addEventListener("click", async event => {
    const button = event.target.closest("button[data-group-action]");

    if (!button || !currentSession || currentSessionRole !== "owner") {
      return;
    }

    const userId = button.dataset.userId;
    const action = button.dataset.groupAction;

    button.disabled = true;

    try {
      const functionName = action === "approve"
        ? "approve_session_member"
        : "reject_session_member";

      const { error } = await supabaseClient.rpc(functionName, {
        _session_id: currentSession.id,
        _user_id: userId
      });

      if (error) throw error;

      showGroupMessage(
        action === "approve"
          ? "Membre accepté !"
          : "Demande refusée."
      );

      await loadGroupMembers();
    } catch (error) {
      console.error("Gestion de la demande :", error);
      showGroupMessage(
        "Impossible de traiter cette demande. Vérifie les droits Supabase.",
        true
      );
      button.disabled = false;
    }
  });
}

/* INITIALISER LE GROUPE APRÈS CONNEXION */

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (!session?.user) {
    currentSession = null;
    currentSessionRole = null;
    return;
  }

  if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
    setTimeout(() => {
      loadCurrentGroup();
    }, 0);
  }
});

