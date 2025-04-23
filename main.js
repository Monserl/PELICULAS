// Importa recetas desde un archivo externo 
import { getPeliculas } from "./services/recipes.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");

// Referencias a elementos del DOM
const input = document.getElementById("movie-input");
const moviesContainer = document.getElementById("movies");
const sortSelect = document.getElementById("sort");
const suggestionBtn = document.getElementById("suggestion-btn");

if (!input || !moviesContainer || !sortSelect || !suggestionBtn) {
    console.error("Error: Uno o más elementos del DOM no fueron encontrados");
    return;
}

// Verificar datos recibidos sean un arreglo
const peliculas = Array.isArray(getPeliculas()) ? getPeliculas() : [];

// Variables globales para autocompletado y análisis
let currentSuggestionIndex = -1;
let currentSuggestions = [];
let historialBusquedas = [];

// =============================================
// FUNCIÓN: Mostrar películas en pantalla
// =============================================
function renderPeliculas(lista) {
    console.log("Renderizando películas", lista);
    moviesContainer.innerHTML = ""; 

    if (!lista || lista.length === 0) {
        moviesContainer.innerHTML = '<p class="no-results">No hay películas para mostrar</p>';
        return;
    }
    lista.forEach((pelicula) => {
        console.log("Procesando película:", pelicula.titulo); 
        
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${pelicula.imagen}" alt="${pelicula.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=Imagen+no+disponible'"/>
            <h3>${pelicula.titulo}</h3>
            <p><strong>Duración:</strong> ${pelicula.duracion} min</p>
            <p>${pelicula.contenido}</p>
        `;
        moviesContainer.appendChild(card);
    });
}

// =============================================
// FUNCIÓN: Filtrar películas por título
// =============================================
function filtrarPorTitulo(busqueda) {
    const lower = busqueda.toLowerCase().trim();
    return peliculas.filter((pelicula) => {
        return pelicula.titulo.toLowerCase().includes(lower)|| 
    pelicula.contenido.toLowerCase().includes(lower);
});
}



// =============================================
// FUNCIÓN: Actualizar historial de búsquedas
// =============================================
function actualizarHistorial(busqueda) {
    historialBusquedas.push(busqueda);

    
    if (historialBusquedas.length > 20) {
        historialBusquedas.shift();
    }

    
    document.getElementById("analysis").textContent =
        `Buscaste ${new Set(historialBusquedas).size} película${historialBusquedas.length > 1 ? 's' : ''} diferentes.`;


}

// =============================================
// FUNCIÓN: Mostrar sugerencias de autocompletado
// =============================================
function autocompletar(valor) {
    const autocompletarDiv = document.getElementById("autocomplete-list");
    autocompletarDiv.innerHTML = "";

    if (!valor) return;

    currentSuggestions = [...new Set(peliculas.map(p => p.titulo))]
        .filter((titulo) => titulo.toLowerCase().startsWith(valor.toLowerCase()))
        .slice(0, 5);

    currentSuggestionIndex = -1;

    currentSuggestions.forEach((sug) => {
        const item = document.createElement("div");
        item.textContent = sug;
        item.classList.add("autocomplete-item");
        item.onclick = () => {
            input.value = sug;
            input.focus();
        };
        autocompletarDiv.appendChild(item);
    });
}

// =============================================
// FUNCIÓN: Buscar películas y mostrarlas
// =============================================
function buscarYRenderizar() {
    const valor = input.value.trim();
    console.log("Buscando:", valor);
    if (!valor) {
        renderPeliculas(peliculas);
         return;
        }
    const resultados = filtrarPorTitulo(valor);
    console.log("Resultados encontrados:", resultados); 
    
    if (resultados.length === 0) {
        moviesContainer.innerHTML = `<p class="no-results">No se encontraron películas con "${valor}"</p>`;
    } else {
        actualizarHistorial(valor);
        renderPeliculas(resultados);
    }
}

// =============================================
// FUNCIÓN: Ordenar películas por título o duración
// =============================================
function ordenarPeliculas(tipo) {
    let ordenadas = [...peliculas];

    if (tipo === "time") {
        ordenadas.sort((a, b) => a.duracion - b.duracion);
    } else {
        ordenadas.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    renderPeliculas(ordenadas);
}

// =============================================
// FUNCIÓN: Resaltar sugerencia seleccionada
// =============================================
function highlightSuggestion(items) {
    items.forEach((item, index) => {
        item.classList.toggle("active", index === currentSuggestionIndex);
    });
}

// =============================================
// EVENTO: Cuando el usuario escribe en el input
// =============================================
input.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    autocompletar(value);
    buscarYRenderizar();

});

// =============================================
// EVENTO: Teclado para navegar sugerencias
// =============================================
input.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".autocomplete-item");

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentSuggestionIndex < items.length - 1) {
            currentSuggestionIndex++;
            highlightSuggestion(items);
        }
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentSuggestionIndex > 0) {
            currentSuggestionIndex--;
            highlightSuggestion(items);
        }
    } else if (e.key === "Enter") {
        if (currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
            input.value = items[currentSuggestionIndex].textContent;
            document.getElementById("autocomplete-list").innerHTML = "";
        }
        buscarYRenderizar();
    }
});

// =============================================
// EVENTO: Cambiar tipo de ordenamiento
// =============================================
sortSelect.addEventListener("change", (e) => ordenarPeliculas(e.target.value));

// =============================================
// EVENTO: Mostrar la película más corta
// =============================================
suggestionBtn.addEventListener("click", () => {
    const peliculaMasCorta = peliculas.reduce((a, b) => a.duracion < b.duracion ? a : b);
    renderPeliculas([peliculaMasCorta]);
});

// =============================================
// Render inicial de todas las películas
// =============================================
renderPeliculas(peliculas);
});