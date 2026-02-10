// Variables globales
let rasterData = null;
let geoTransform = null;
let width = 0;
let height = 0;
let minValue = Infinity;
let maxValue = -Infinity;
let bbox = null; // Bounding box para coordenadas geográficas
let pixelSizeX = 0;
let pixelSizeY = 0;

// Elementos del DOM
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const loading = document.getElementById('loading');
const mapContainer = document.getElementById('mapContainer');

// Variables para zoom y pan
let scale = 7.53; // Zoom inicial para ver el mapa completo
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

// Variable para datos fijados con click
let pinnedData = null;

// Variable para el archivo actual
let currentFile = 'IDF_T50_0.5h_intensidad.tif';

// Paleta de colores mejorada para intensidad de lluvia
const colorScale = [
    { value: 0.0, color: [49, 54, 149] },      // Azul oscuro
    { value: 0.1, color: [69, 117, 180] },     // Azul
    { value: 0.2, color: [116, 173, 209] },    // Azul claro
    { value: 0.3, color: [171, 217, 233] },    // Cyan claro
    { value: 0.4, color: [224, 243, 248] },    // Cyan muy claro
    { value: 0.5, color: [255, 255, 191] },    // Amarillo claro
    { value: 0.6, color: [254, 224, 144] },    // Amarillo
    { value: 0.7, color: [253, 174, 97] },     // Naranja
    { value: 0.8, color: [244, 109, 67] },     // Naranja oscuro
    { value: 0.9, color: [215, 48, 39] },      // Rojo
    { value: 1.0, color: [165, 0, 38] }        // Rojo oscuro
];

// Función para obtener color según el valor
function getColor(value, min, max) {
    if (value === null || value === undefined || isNaN(value)) {
        return [200, 200, 200, 100]; // Gris transparente para valores nulos
    }

    // Normalizar el valor entre 0 y 1
    const normalized = (value - min) / (max - min);

    // Encontrar los dos colores más cercanos en la escala
    let lowerColor = colorScale[0];
    let upperColor = colorScale[colorScale.length - 1];

    for (let i = 0; i < colorScale.length - 1; i++) {
        if (normalized >= colorScale[i].value && normalized <= colorScale[i + 1].value) {
            lowerColor = colorScale[i];
            upperColor = colorScale[i + 1];
            break;
        }
    }

    // Interpolación lineal entre los dos colores
    const range = upperColor.value - lowerColor.value;
    const rangeNormalized = range === 0 ? 0 : (normalized - lowerColor.value) / range;

    const r = Math.round(lowerColor.color[0] + (upperColor.color[0] - lowerColor.color[0]) * rangeNormalized);
    const g = Math.round(lowerColor.color[1] + (upperColor.color[1] - lowerColor.color[1]) * rangeNormalized);
    const b = Math.round(lowerColor.color[2] + (upperColor.color[2] - lowerColor.color[2]) * rangeNormalized);

    return [r, g, b, 255];
}

// Cargar y procesar el archivo GeoTIFF
async function loadGeoTIFF(filename = currentFile) {
    try {
        console.log('Cargando archivo GeoTIFF:', filename);
        loading.classList.remove('hidden');

        const response = await fetch(filename);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        // Obtener información del GeoTIFF
        width = image.getWidth();
        height = image.getHeight();
        geoTransform = image.getGeoKeys();

        // Obtener bbox y resolución
        bbox = image.getBoundingBox();
        const origin = image.getOrigin();
        const resolution = image.getResolution();

        pixelSizeX = resolution[0];
        pixelSizeY = resolution[1];

        console.log(`Dimensiones: ${width} x ${height}`);
        console.log(`BBox:`, bbox);
        console.log(`Resolución:`, resolution);

        // Leer los datos raster
        const rasters = await image.readRasters();
        rasterData = rasters[0]; // Primera banda

        // Calcular valores mínimo y máximo
        for (let i = 0; i < rasterData.length; i++) {
            const value = rasterData[i];
            if (value !== null && value !== undefined && !isNaN(value) && isFinite(value)) {
                if (value < minValue) minValue = value;
                if (value > maxValue) maxValue = value;
            }
        }

        console.log(`Rango de valores: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}`);

        // Actualizar leyenda
        document.getElementById('minValue').textContent = minValue.toFixed(2);
        document.getElementById('maxValue').textContent = maxValue.toFixed(2);

        // Renderizar el mapa
        renderMap();

        // Ocultar loading
        loading.classList.add('hidden');

    } catch (error) {
        console.error('Error al cargar el GeoTIFF:', error);
        loading.innerHTML = `
            <p style="color: red; font-weight: bold;">Error al cargar el archivo</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
        `;
    }
}

// Renderizar el mapa en el canvas
function renderMap() {
    // Ajustar tamaño del canvas
    canvas.width = width;
    canvas.height = height;

    // Crear ImageData
    const imageData = ctx.createImageData(width, height);

    // Llenar los datos del pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const value = rasterData[index];
            const color = getColor(value, minValue, maxValue);

            const pixelIndex = (y * width + x) * 4;
            imageData.data[pixelIndex] = color[0];     // R
            imageData.data[pixelIndex + 1] = color[1]; // G
            imageData.data[pixelIndex + 2] = color[2]; // B
            imageData.data[pixelIndex + 3] = color[3]; // A
        }
    }

    // Dibujar en el canvas
    ctx.putImageData(imageData, 0, 0);

    // Posicionar el canvas inicialmente centrado
    positionCanvas();

    console.log('Mapa renderizado correctamente');
}

// Posicionar el canvas con zoom y pan
function positionCanvas() {
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;

    // Actualizar indicador de zoom
    const zoomPercentage = Math.round((scale / 7.53) * 100);
    document.getElementById('zoomLevel').textContent = zoomPercentage + '%';
}

// Funciones de zoom
function zoomIn() {
    scale = Math.min(scale * 1.2, 10);
    positionCanvas();
}

function zoomOut() {
    scale = Math.max(scale / 1.2, 7.53); // Límite mínimo = vista completa (100%)
    positionCanvas();
}

function resetView() {
    scale = 7.53;
    offsetX = 0;
    offsetY = 0;
    positionCanvas();
}

// Construir nombre de archivo según selectores
function getFileName() {
    const periodo = document.getElementById('periodoSelector').value;
    const duracion = document.getElementById('duracionSelector').value;

    return `IDF_T${periodo}_${duracion}h_intensidad.tif`;
}

// Cambiar archivo según selectores
function changeFile() {
    currentFile = getFileName();

    // Reset de variables
    scale = 7.53;
    offsetX = 0;
    offsetY = 0;
    pinnedData = null;
    minValue = Infinity;
    maxValue = -Infinity;

    // Recargar archivo
    loadGeoTIFF(currentFile);
}

// Obtener valor del pixel en las coordenadas del mouse
function getPixelValue(mouseX, mouseY) {
    const rect = canvas.getBoundingClientRect();

    // Convertir coordenadas del mouse a coordenadas del canvas
    const canvasX = (mouseX - rect.left) / scale;
    const canvasY = (mouseY - rect.top) / scale;

    const x = Math.floor(canvasX);
    const y = Math.floor(canvasY);

    if (x >= 0 && x < width && y >= 0 && y < height) {
        const index = y * width + x;
        const value = rasterData[index];
        return { x, y, value };
    }

    return null;
}

// Actualizar panel de información
function updateInfoPanel(pixelInfo, isPinned = false) {
    if (pixelInfo && pixelInfo.value !== null && pixelInfo.value !== undefined && !isNaN(pixelInfo.value)) {
        document.getElementById('position').textContent = `(${pixelInfo.x}, ${pixelInfo.y})`;
        document.getElementById('intensity').textContent = `${pixelInfo.value.toFixed(2)} mm/h`;
        document.getElementById('coordinates').textContent = formatCoordinates(pixelInfo.x, pixelInfo.y);

        if (isPinned) {
            document.getElementById('infoPanel').style.borderLeft = '3px solid #ffffff';
        }
    } else if (!isPinned) {
        document.getElementById('position').textContent = 'Click en el mapa';
        document.getElementById('intensity').textContent = '—';
        document.getElementById('coordinates').textContent = '—';
        document.getElementById('infoPanel').style.borderLeft = 'none';
    }
}

// Formatear coordenadas geográficas WGS84
function formatCoordinates(x, y) {
    if (!bbox) {
        return `Pixel (${x}, ${y})`;
    }

    // Calcular coordenadas geográficas WGS84
    // bbox = [minX, minY, maxX, maxY]
    const lon = bbox[0] + (x * pixelSizeX);
    const lat = bbox[3] - (y * Math.abs(pixelSizeY)); // bbox[3] es maxY

    // Formatear con precisión de 4 decimales
    const lonFormatted = lon.toFixed(4);
    const latFormatted = lat.toFixed(4);

    // Formatear con direcciones (N/S, E/W)
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';

    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

// Copiar al portapapeles
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);

        // Feedback visual
        button.classList.add('copied');
        setTimeout(() => {
            button.classList.remove('copied');
        }, 1000);

        console.log('Copiado:', text);
    } catch (error) {
        console.error('Error al copiar:', error);
    }
}

// Event listeners para pan (arrastre)
mapContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Click izquierdo
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        mapContainer.style.cursor = 'grabbing';
    }
});

mapContainer.addEventListener('mousemove', (e) => {
    if (isPanning) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        positionCanvas();
    } else if (!isPanning && rasterData) {
        // Mostrar tooltip solo si no estamos arrastrando
        const pixelInfo = getPixelValue(e.clientX, e.clientY);

        if (pixelInfo && pixelInfo.value !== null && pixelInfo.value !== undefined && !isNaN(pixelInfo.value)) {
            tooltip.classList.add('visible');
            tooltip.style.left = `${e.clientX + 20}px`;
            tooltip.style.top = `${e.clientY - 60}px`;
            tooltip.innerHTML = `
                <strong>Intensidad:</strong> ${pixelInfo.value.toFixed(2)} mm/h<br>
                <strong>Coordenadas:</strong> ${formatCoordinates(pixelInfo.x, pixelInfo.y)}
            `;

            // Solo actualizar panel si no hay datos fijados
            if (!pinnedData) {
                updateInfoPanel(pixelInfo, false);
            }
        } else {
            tooltip.classList.remove('visible');
        }
    }
});

mapContainer.addEventListener('mouseup', () => {
    isPanning = false;
    mapContainer.style.cursor = 'grab';
});

mapContainer.addEventListener('mouseleave', () => {
    isPanning = false;
    mapContainer.style.cursor = 'grab';
    tooltip.classList.remove('visible');
});

// Click para fijar datos
mapContainer.addEventListener('click', (e) => {
    if (!isPanning) {
        const pixelInfo = getPixelValue(e.clientX, e.clientY);

        if (pixelInfo && pixelInfo.value !== null && pixelInfo.value !== undefined && !isNaN(pixelInfo.value)) {
            // Si hacemos click en el mismo pixel, desfijarlo
            if (pinnedData && pinnedData.x === pixelInfo.x && pinnedData.y === pixelInfo.y) {
                pinnedData = null;
                document.getElementById('infoPanel').style.borderLeft = 'none';
            } else {
                // Fijar nuevo pixel
                pinnedData = pixelInfo;
                updateInfoPanel(pixelInfo, true);
            }
        }
    }
});

// Zoom con rueda del mouse
mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (e.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
});

// Botones de control
document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);
document.getElementById('resetView').addEventListener('click', () => {
    resetView();
    pinnedData = null;
    updateInfoPanel(null, false);
});

// Event listeners para selectores
document.getElementById('periodoSelector').addEventListener('change', changeFile);
document.getElementById('duracionSelector').addEventListener('change', changeFile);

// Event listeners para botones de copiar
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const field = btn.getAttribute('data-copy');
        const element = document.getElementById(field);
        if (element && element.textContent !== '—' && element.textContent !== 'Click en el mapa') {
            copyToClipboard(element.textContent, btn);
        }
    });
});

// Cargar el mapa cuando la página esté lista
window.addEventListener('load', () => {
    currentFile = getFileName();
    loadGeoTIFF(currentFile);
});
