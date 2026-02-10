# Mapa de Intensidad IDF - Ecuador

Visualizador interactivo minimalista de mapas GeoTIFF para datos de intensidad de lluvia (IDF - Intensidad-Duración-Frecuencia).

## 📡 Fuente de Datos

- **Producto:** IMERG V07 FINAL RUN (Integrated Multi-satellitE Retrievals for GPM)
- **Sistema de Coordenadas:** WGS84 EPSG:4326
- **Región:** Ecuador

## 📋 Características

- ✅ **Múltiples archivos GeoTIFF**: Visualiza diferentes periodos de retorno y duraciones
- ✅ **Selector de Periodo de Retorno**: T10, T25, T50, T100 (con probabilidad 1/T años)
- ✅ **Selector de Duración del Evento**: 30 minutos, 2 horas, 6 horas y 24 horas
- ✅ **Botones de Copiar**: Iconos para copiar información al portapapeles (posición, intensidad, coordenadas)
- ✅ **Coordenadas Geográficas WGS84**: Muestra latitud y longitud real del pixel
- ✅ **Zoom y Pan**: Navega por el mapa con rueda del mouse y arrastre
- ✅ **Zoom inicial optimizado**: El mapa se muestra completo al cargar (753% = 100%)
- ✅ **Tooltips grandes** al pasar el cursor sobre cada pixel
- ✅ **Click para fijar datos**: Haz click en un pixel para mantener la información en el panel
- ✅ Controles de zoom (+, -, Reset)
- ✅ **Diseño horizontal**: Visor y panel lateral aprovechan el ancho de pantalla
- ✅ Escala de colores para representar intensidades
- ✅ Panel de información interactivo
- ✅ **Diseño minimalista con gradiente**: Fondo degradado púrpura/azul oscuro
- ✅ Tipografía Inter minimalista
- ✅ Diseño responsive

## 🚀 Cómo usar

### Opción 1: Servidor local simple

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta un servidor HTTP local:

**Con Python 3:**
```bash
python -m http.server 8000
```

**Con Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Con Node.js (npx):**
```bash
npx http-server -p 8000
```

**Con PHP:**
```bash
php -S localhost:8000
```

3. Abre tu navegador en: `http://localhost:8000`

### Opción 2: Extensión Live Server (VS Code)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## 📊 Conceptos Fundamentales

### Periodo de Retorno (T)
El periodo de retorno es la probabilidad de que un evento extremo de lluvia ocurra.

- **T10**: Probabilidad 1/10 años (10% anual)
- **T25**: Probabilidad 1/25 años (4% anual)
- **T50**: Probabilidad 1/50 años (2% anual) - *Por defecto*
- **T100**: Probabilidad 1/100 años (1% anual)

> **Ejemplo:** Un evento T50 significa que hay una probabilidad del 2% de que ese nivel de intensidad de lluvia ocurra en cualquier año dado.

### Duración del Evento
Es el tiempo que dura el evento de precipitación:

- **30 minutos** (0.5h) - *Por defecto*
- **6 horas**

> **Nota:** A menor duración, mayor suele ser la intensidad de precipitación.

### Unidades
- **Intensidad:** mm/h (milímetros por hora)
- **Coordenadas:** WGS84 EPSG:4326 (Latitud/Longitud en grados decimales)

## 🎨 Escala de colores

El mapa utiliza una escala de colores que va desde:
- **Azul oscuro:** Intensidades bajas
- **Verde/Amarillo:** Intensidades medias
- **Naranja/Rojo:** Intensidades altas
- **Rojo oscuro:** Intensidades muy altas

## 💡 Funcionalidades interactivas

### Selectores
- **Periodo de Retorno:** Cambia entre T10, T25, T50 y T100
  - Cada opción muestra la probabilidad (ej: "T50 (1/50 años)")
- **Duración del Evento:** Selecciona entre 30 min, 2 horas, 6 horas y 24 horas

### Navegación
- **Zoom In/Out:** Usa los botones +/- o la rueda del mouse
- **Pan (Arrastre):** Haz click y arrastra para mover el mapa
- **Reset:** Botón ⟲ para volver a la vista inicial (100% = vista completa)
- **Indicador de Zoom:** Muestra el porcentaje actual (100% = mapa completo visible)

### Información
- **Tooltip grande:** Pasa el cursor sobre el mapa para ver información en tiempo real
- **Click para fijar:** Haz click en un pixel para mantener sus datos en el panel de información
  - Click en el mismo pixel nuevamente para desfijarlo
  - Click en otro pixel para cambiar la selección
- **Panel de información lateral:** Muestra:
  - **Posición Pixel:** Coordenadas del pixel (x, y)
  - **Intensidad:** Valor en mm/h
  - **Coordenadas WGS84:** Latitud y Longitud geográficas reales
- **Botones de Copiar:** Iconos en cada campo para copiar la información al portapapeles
  - Feedback visual cuando se copia exitosamente

## 🛠️ Tecnologías utilizadas

### Frontend
- HTML5
- CSS3 con diseño minimalista y glassmorphism
- JavaScript (ES6+) con controles de zoom y pan
- [GeoTIFF.js](https://geotiffjs.github.io/) - Librería para leer archivos GeoTIFF
- Google Fonts - Tipografía Inter

### Procesamiento de Datos
- **IMERG (Integrated Multi-satellitE Retrievals for GPM)** V07 FINAL RUN
  - Producto satelital de precipitación de alta resolución
  - Algoritmo unificado de la NASA GPM (Global Precipitation Measurement)
  - Resolución espacial: 0.1° × 0.1°
  - Cobertura global: 60°N-60°S

## 📁 Estructura del proyecto

```
mapa-ecuador-web/
├── index.html                      # Página principal
├── styles.css                      # Estilos CSS
├── script.js                       # Lógica JavaScript
├── IDF_T10_0.5h_intensidad.tif    # T10 - 30 min
├── IDF_T10_6h_intensidad.tif      # T10 - 6h
├── IDF_T25_0.5h_intensidad.tif    # T25 - 30 min
├── IDF_T25_6h_intensidad.tif      # T25 - 6h
├── IDF_T50_0.5h_intensidad.tif    # T50 - 30 min (por defecto)
├── IDF_T50_6h_intensidad.tif      # T50 - 6h
├── IDF_T100_0.5h_intensidad.tif   # T100 - 30 min
├── IDF_T100_6h_intensidad.tif     # T100 - 6h
└── README.md                       # Este archivo
```

## ⚠️ Nota importante

**Este proyecto requiere un servidor web para funcionar correctamente.** 

No puedes simplemente abrir el archivo `index.html` directamente en el navegador debido a las políticas de seguridad CORS que impiden cargar archivos locales mediante fetch/AJAX.

## 🔧 Personalización

Puedes modificar fácilmente:

- **Paleta de colores:** Edita el array `colorScale` en `script.js`
- **Estilos:** Modifica `styles.css` (colores, tipografía, espaciado)
- **Información mostrada:** Ajusta las funciones en `script.js`
- **Velocidad de zoom:** Modifica el factor `1.2` en las funciones `zoomIn()` y `zoomOut()`
- **Límites de zoom:** Ajusta `Math.min(scale * 1.2, 10)` y `Math.max(scale / 1.2, 0.1)`

## 🚀 Publicar en GitHub Pages

### 1. Inicializar repositorio Git (si no lo has hecho)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. NO inicialices con README, .gitignore o licencia

### 3. Conectar y subir

```bash
git remote add origin https://github.com/TU-USUARIO/mapa-ecuador-web.git
git branch -M main
git push -u origin main
```

### 4. Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona la rama `main` y carpeta `/ (root)`
5. Click en **Save**
6. Espera unos minutos

Tu sitio estará disponible en: `https://TU-USUARIO.github.io/mapa-ecuador-web/`

### 5. Actualizar cambios futuros

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Los cambios se publicarán automáticamente en GitHub Pages.

## 📝 Créditos

Made By **Hexagonal**

## 🎯 Requerimientos técnicos

### Datos y Fuente
- ✅ **Producto:** IMERG V07 FINAL RUN
- ✅ **Sistema de Coordenadas:** WGS84 EPSG:4326
- ✅ **Archivos GeoTIFF:** 8 archivos en total (4 periodos × 2 duraciones)

### Visualización
- ✅ Selector de periodo de retorno (T10, T25, T50, T100) con probabilidad mostrada
- ✅ Selector de duración del evento (30 min, 6 horas)
- ✅ Zoom inicial de 753% mostrado como 100% (mapa completo visible)
- ✅ Mapa centrado automáticamente
- ✅ Fondo del visor: gris (#c8c8c8) igual al fondo del mapa
- ✅ Coordenadas geográficas WGS84 reales calculadas desde bbox y resolución

### Navegación
- ✅ Zoom interactivo (botones + rueda del mouse)
- ✅ Pan (arrastre del mapa)
- ✅ Controles visuales de zoom (+, -, Reset)
- ✅ Indicador de nivel de zoom relativo (100% = vista completa)

### Diseño
- ✅ Layout horizontal: visor y panel lateral comparten el ancho
- ✅ Diseño minimalista con gradiente púrpura/azul oscuro
- ✅ Tipografía minimalista (Inter de Google Fonts)
- ✅ Glassmorphism (fondos con blur y transparencia)
- ✅ Información del producto en header (IMERG V07, WGS84 EPSG:4326)
- ✅ Diseño responsive

### Interactividad
- ✅ Click para fijar datos en el panel
- ✅ Tooltips grandes y legibles (20px padding, 16px font)
- ✅ Información en tiempo real
- ✅ Actualización automática al cambiar archivo
- ✅ Reset completo al cambiar de archivo (zoom, pan, datos fijados)
- ✅ Transformación de coordenadas pixel a geográficas WGS84

### Créditos
- ✅ Footer "Made By Hexagonal"
