// ============================
// Referencias a elementos del DOM
// ============================
const searchInput = document.getElementById("searchInput");   // Input de búsqueda
const searchBtn = document.getElementById("searchBtn");       // Botón de buscar
const randomBtn = document.getElementById("randomBtn");       // Botón de Pokémon aleatorio
const pokemonCard = document.getElementById("pokemonCard");   // Card que muestra los datos
const pokemonName = document.getElementById("pokemonName");   // Nombre del Pokémon
const pokemonId = document.getElementById("pokemonId");       // Número de la Pokédex
const pokemonImage = document.getElementById("pokemonImage"); // Imagen oficial del Pokémon
const pokemonType = document.getElementById("pokemonType");   // Tipos (Ej: Agua, Fuego, etc.)

// ============================
// Función: Obtener Pokémon por nombre o ID
// ============================
async function fetchPokemon(query) {
  try {
    const q = String(query).trim().toLowerCase(); // Normaliza el input del usuario
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`); // Consulta a la API

    // Si no se encuentra el Pokémon
    if (!response.ok) {
      showNotFoundMessage("¡Ups! No encontramos ese Pokémon 😢");
      return;
    } else {
      hideNotFoundMessage(); // Limpia mensaje de error si hay éxito
    }

    // Convierte la respuesta a JSON
    const data = await response.json();

    // Renderiza los datos en la interfaz
    renderPokemon(data);

  } catch (error) {
    console.error("Error:", error);
  }
}

// ============================
// Diccionario de traducción de tipos
// (De inglés a español)
// ============================
const typeTranslations = {
  all:"todos",
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

// ============================
// Función: Renderizar datos del Pokémon
// ============================
function renderPokemon(pokemon) {
  // Guardamos el ID actual (útil para navegación siguiente/anterior)
  currentPokemonId = pokemon.id;

  // --- Datos principales ---
  pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1); // Capitaliza nombre
  pokemonId.textContent = `#${pokemon.id}`;                                               // Muestra número
  pokemonImage.src = pokemon.sprites.other["official-artwork"].front_default;             // Imagen oficial

  // --- Tipos ---
  const translatedTypes = pokemon.types.map(t => typeTranslations[t.type.name] || t.type.name);
  pokemonType.textContent = translatedTypes.join(", "); // Admite Pokémon con más de un tipo

  // --- Estadísticas base ---
  const stats = pokemon.stats;
  setStat("hp", stats[0].base_stat);        // Vida
  setStat("attack", stats[1].base_stat);    // Ataque
  setStat("defense", stats[2].base_stat);   // Defensa
  setStat("spattack", stats[3].base_stat);  // Ataque Especial
  setStat("spdefense", stats[4].base_stat); // Defensa Especial
  setStat("speed", stats[5].base_stat);     // Velocidad

  // --- Movimientos ---
  renderMoves(pokemon);

  // Mostrar card (ya no oculta)
  pokemonCard.classList.remove("hidden");

  // --- Reiniciar animación ---
  pokemonCard.classList.remove("animate");
  void pokemonCard.offsetWidth; // Fuerza reflow para reiniciar animación
  pokemonCard.classList.add("animate");
}


// ============================
// Función: Renderizar Movimientos del Pokémon
// ============================
// Recorre todos los movimientos disponibles en la API de Pokémon,
// obtiene información detallada de cada movimiento (tipo, poder, precisión)
// y los agrega dinámicamente a la sección de "Movimientos".
// ============================

async function renderMoves(pokemon) {
  // Contenedor en el que se mostrarán los movimientos
  const pokemonMovesContainer = document.getElementById("pokemonMoves");

  // Limpiamos cualquier movimiento anterior antes de renderizar los nuevos
  pokemonMovesContainer.innerHTML = "";

  let moves = pokemon.moves;

  if (!moves || moves.length === 0) {
    const baseName = pokemon.name.split("-")[0];
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}`);
      const baseData = await res.json();
      moves = baseData.moves;
    } catch (err) {
      console.error("Error obteniendo movimientos base:", err);
      return;
    }
  }
  // Recorremos la lista de movimientos que devuelve la API de Pokémon
  for (const m of moves) {
    try {
      // Consultamos la URL del movimiento para obtener más datos (tipo, poder, precisión)
      const res = await fetch(m.move.url);
      const moveData = await res.json();

      // Traducimos el tipo (usando el diccionario en español)
      const moveType = typeTranslations[moveData.type.name] || moveData.type.name;

      // Creamos un elemento div que contendrá la información del movimiento
      const moveEl = document.createElement("div");
      moveEl.classList.add("move-card");

      // Insertamos contenido HTML dentro del div del movimiento
      moveEl.innerHTML = `
        <div class="move-name">
          ${m.move.name.charAt(0).toUpperCase() + m.move.name.slice(1)}
        </div>
        <div class="move-info">
          Tipo: ${moveType} | 
          Potencia: ${moveData.power || "—"} | 
          Precisión: ${moveData.accuracy || "—"}%
        </div>
      `;

      // Finalmente agregamos el movimiento al contenedor
      pokemonMovesContainer.appendChild(moveEl);

    } catch (err) {
      console.error("Error cargando movimiento:", err);
    }
  }
}


// ============================
// Función auxiliar: setStat
// ============================
// Actualiza la barra de progreso y el valor numérico
// para una estadística específica de un Pokémon.
function setStat(statName, value) {
  const bar = document.getElementById(`${statName}-bar`);   // Barra gráfica
  const text = document.getElementById(`${statName}-value`); // Valor numérico
  text.textContent = value;

  // Normalización: las estadísticas base de Pokémon van de 1 a 255.
  // Convertimos a porcentaje para ajustar la barra (máximo 100%).
  const percentage = Math.min((value / 255) * 100, 100);
  bar.style.width = `${percentage}%`;
}

// ============================
// Eventos de búsqueda
// ============================

// Evento: click en botón "Buscar"
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchPokemon(query); // Solo ejecuta si hay texto
});

// Evento: tecla Enter en el input
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchPokemon(query);
  }
});

// ============================
// Evento de búsqueda aleatoria
// ============================
// Selecciona un Pokémon aleatorio entre los 1025 disponibles.
// Limpia el input y ejecuta la búsqueda con el ID generado.
randomBtn.addEventListener("click", () => {
  const maxPokemon = 1025; // Total de Pokémon soportados actualmente en la API
  const randomId = Math.floor(Math.random() * maxPokemon) + 1; // ID aleatorio válido
  searchInput.value = ""; // Limpia la caja de búsqueda
  fetchPokemon(randomId);
});

// ============================
// Pokémon inicial por defecto
// ============================
// Al cargar la página, se mostrará "Pikachu".
fetchPokemon("pikachu");

// ============================
// Control del Pokémon actual
// ============================
let currentPokemonId = 1; // ID inicial (puede modificarse si quieres otro Pokémon por defecto)

// Función: cargar un Pokémon por ID y actualizar el "currentPokemonId"
function loadPokemon(id) {
  if (id < 1) id = 1;          // Evita IDs menores a 1
  if (id > 1025) id = 1025;    // Límite superior (según la API actual)
  currentPokemonId = id;       // Actualiza el Pokémon actual
  fetchPokemon(id);            // Llama a la función que obtiene y renderiza
}

// ============================
// Navegación entre Pokémon
// ============================
// Botón "Siguiente"
document.getElementById('nextBtn').addEventListener('click', () => {
  loadPokemon(currentPokemonId + 1);
});

// Botón "Anterior"
document.getElementById('prevBtn').addEventListener('click', () => {
  loadPokemon(currentPokemonId - 1);
});

// ============================
// Mensajes de "No encontrado"
// ============================

// Muestra un mensaje cuando no se encuentra el Pokémon
function showNotFoundMessage(text) {
  const msg = document.getElementById("notFoundMessage");
  msg.textContent = text;
  msg.classList.remove("hidden");

  // Reinicia la animación CSS (truco con reflow)
  msg.style.animation = "none";
  void msg.offsetWidth; // Fuerza reflow para reiniciar animación
  msg.style.animation = null;
}

// Oculta el mensaje de "No encontrado"
function hideNotFoundMessage() {
  const msg = document.getElementById("notFoundMessage");
  msg.classList.add("hidden");
}

// Se crea un diccionario invertido para poder traducir del español al inglés
// (esto permite que el usuario seleccione "Fuego" pero la API reciba "fire")
const typeTranslationsInverted = Object.fromEntries(
  Object.entries(typeTranslations).map(([en, es]) => [es.toLowerCase(), en])
);

// Función que busca un Pokémon aleatorio según el tipo seleccionado
// muestra uno distinto cada vez, dentro del grupo correspondiente
async function fetchRandomByType(typeEs) {
  const apiType = typeTranslationsInverted[typeEs.toLowerCase()];

  if (!apiType) {
    showNotFoundMessage("Tipo desconocido: " + typeEs);
    return;
  }
  // Caso especial cuando el usuario elige “Todos”
  // muestra cualquier Pokémon de la Pokédex sin importar el tipo
  if (apiType === "all") {
    const maxPokemon = 1025;
    const randomId = Math.floor(Math.random() * maxPokemon) + 1;
    searchInput.value = "";
    fetchPokemon(randomId);
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${apiType}`);
    if (!response.ok) {
      showNotFoundMessage("No pudimos cargar Pokémon de tipo " + typeEs);
      return;
    }

    hideNotFoundMessage();
    const data = await response.json();
    const pokemons = data.pokemon;

    if (!pokemons || pokemons.length === 0) {
      showNotFoundMessage("No hay Pokémon de tipo " + typeEs);
      return;
    }

    const randomIndex = Math.floor(Math.random() * pokemons.length);
    const randomPokemon = pokemons[randomIndex].pokemon.name;

    fetchPokemon(randomPokemon); // usa tu función principal

  } catch (err) {
    console.error(err);
    showNotFoundMessage("Error al conectar con la API.");
  }
}

// Se conecta la lógica a los botones de la interfaz
// Esto sirve para que cada botón ejecute la búsqueda del tipo correspondiente
document.querySelectorAll(".type-filters .chip").forEach(btn => {
  btn.addEventListener("click", () => {
    const typeName = btn.textContent.trim();
    fetchRandomByType(typeName);
  });
});


