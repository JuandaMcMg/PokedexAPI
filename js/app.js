// Elementos
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const pokemonCard = document.getElementById("pokemonCard");
const pokemonName = document.getElementById("pokemonName");
const pokemonId = document.getElementById("pokemonId");
const pokemonImage = document.getElementById("pokemonImage");
const pokemonType = document.getElementById("pokemonType");

// Obtener Pokémon por nombre o ID
async function fetchPokemon(query) {
  try {
    const q = String(query).trim().toLowerCase();
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
    if (!response.ok) {
      showNotFoundMessage("¡Ups! No encontramos ese Pokémon 😢");
      return;
    } else {
      hideNotFoundMessage();
    }


    const data = await response.json();
    renderPokemon(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Diccionario de traducción de tipos
const typeTranslations = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada"
};

function renderPokemon(pokemon) {
  currentPokemonId = pokemon.id;

  pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  pokemonId.textContent = `#${pokemon.id}`;
  pokemonImage.src = pokemon.sprites.other["official-artwork"].front_default;

  const translatedTypes = pokemon.types.map(t => typeTranslations[t.type.name] || t.type.name);
  pokemonType.textContent = translatedTypes.join(", ");

  const stats = pokemon.stats;
  setStat("hp", stats[0].base_stat);
  setStat("attack", stats[1].base_stat);
  setStat("defense", stats[2].base_stat);
  setStat("spattack", stats[3].base_stat);
  setStat("spdefense", stats[4].base_stat);
  setStat("speed", stats[5].base_stat);

  renderMoves(pokemon);
  pokemonCard.classList.remove("hidden");

  // --- Reiniciar animación ---
  pokemonCard.classList.remove("animate");
  void pokemonCard.offsetWidth; // fuerza reflow
  pokemonCard.classList.add("animate");
}


async function renderMoves(pokemon) {
  const pokemonMovesContainer = document.getElementById("pokemonMoves");
  pokemonMovesContainer.innerHTML = "";


  for (const m of pokemon.moves) {
    try {
      const res = await fetch(m.move.url);  // consultamos info del movimiento
      const moveData = await res.json();

      // Tipo traducido
      const moveType = typeTranslations[moveData.type.name] || moveData.type.name;

      // Creamos un div para mostrarlo
      const moveEl = document.createElement("div");
      moveEl.classList.add("move-card");
      moveEl.innerHTML = `
        <div class="move-name">${m.move.name.charAt(0).toUpperCase() + m.move.name.slice(1)}</div>
        <div class="move-info">
          Tipo: ${moveType} | Potencia: ${moveData.power || "—"} | Precisión: ${moveData.accuracy || "—"}%
        </div>
      `;
      

      pokemonMovesContainer.appendChild(moveEl);
    } catch (err) {
      console.error("Error cargando movimiento:", err);
    }
  }
}

// Función auxiliar para llenar barras
function setStat(statName, value) {
  const bar = document.getElementById(`${statName}-bar`);
  const text = document.getElementById(`${statName}-value`);
  text.textContent = value;

  // Normalizamos valor (máximo 255 en Pokémon base stats)
  const percentage = Math.min((value / 255) * 100, 100);
  bar.style.width = `${percentage}%`;
}

// Evento buscar
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchPokemon(query);
});

// Evento Enter
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchPokemon(query);
  }
});

// Evento aleatorio
randomBtn.addEventListener("click", () => {
  const maxPokemon = 1025;
  const randomId = Math.floor(Math.random() * maxPokemon) + 1;
  searchInput.value = "";
  fetchPokemon(randomId);
});

// Mostrar por defecto un Pokémon inicial (ej: Pikachu)
fetchPokemon("pikachu");

let currentPokemonId = 1; // inicializa con el primero o el que quieras mostrar al cargar

// Función para mostrar un Pokémon y actualizar el ID actual
function loadPokemon(id) {
  if (id < 1) id = 1;  // evita ir por debajo de 1
  if (id > 1025) id = 1025; // ajusta si usas otro máximo
  currentPokemonId = id;
  fetchPokemon(id); // tu función ya existente para mostrarlo
}

// Botones siguiente y anterior
document.getElementById('nextBtn').addEventListener('click', () => {
  loadPokemon(currentPokemonId + 1);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  loadPokemon(currentPokemonId - 1);
});

function showNotFoundMessage(text) {
  const msg = document.getElementById("notFoundMessage");
  msg.textContent = text;
  msg.classList.remove("hidden");
  // Reinicia la animación
  msg.style.animation = "none";
  void msg.offsetWidth; // fuerza reflow
  msg.style.animation = null;
}

function hideNotFoundMessage() {
  const msg = document.getElementById("notFoundMessage");
  msg.classList.add("hidden");
}


