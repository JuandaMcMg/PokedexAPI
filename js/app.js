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
      alert("Pokémon no encontrado 😢");
      return;
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

// Renderizar datos en la card
function renderPokemon(pokemon) {
  pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  pokemonId.textContent = `#${pokemon.id}`;
  pokemonImage.src = pokemon.sprites.other["official-artwork"].front_default;

  // Convertir tipos a español
  const translatedTypes = pokemon.types.map(t => typeTranslations[t.type.name] || t.type.name);
  pokemonType.textContent = translatedTypes.join(", ");

  pokemonCard.classList.remove("hidden");
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