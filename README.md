# Memotest Banderas del Mundo

Proyecto Final de la materia Desarrollo y Arquitecturas Web - Ingeniería en Sistemas Informáticos 2026.

Juego de memoria (memotest) desarrollado en HTML5, CSS3 y JavaScript ES5 puro, sin frameworks ni librerías externas.

## Demo

- Repositorio: https://github.com/FalconeRenzo2am/FalconeRenzoDAW
- Publicado en GitHub Pages: https://falconerenzo2am.github.io/FalconeRenzoDAW/

## Descripción del juego

El jugador debe encontrar todos los pares de cartas iguales en un tablero de cartas boca abajo. En cada turno se seleccionan dos cartas: si coinciden, quedan descubiertas; si no coinciden, vuelven a ocultarse luego de un breve instante. La partida termina cuando se encuentran todos los pares del tablero.

## Temática elegida

Banderas del mundo. Cada carta oculta una bandera dibujada en SVG propio (sin depender de fuentes del sistema ni de imágenes externas) junto con el nombre del país (accesible mediante `aria-label`), manteniendo una estética, paleta de colores y textos coherentes en toda la aplicación.

## Reglas del juego

- El tablero se genera dinámicamente y las cartas se mezclan aleatoriamente al iniciar cada partida.
- El jugador selecciona una primera carta y luego una segunda carta por turno.
- Mientras un par no coincidente está visible esperando ocultarse, no se pueden seleccionar nuevas cartas.
- No se puede seleccionar una carta ya emparejada, ni la misma carta dos veces en el mismo turno.
- El temporizador inicia al revelar la primera carta y se detiene al finalizar la partida.
- La partida puede reiniciarse en cualquier momento sin recargar la página.

## Niveles de dificultad

| Nivel   | Tablero | Cartas | Pares | Penalización por error |
|---------|---------|--------|-------|-------------------------|
| Fácil   | 4x4     | 16     | 8     | -10 puntos              |
| Medio   | 5x4     | 20     | 10    | -20 puntos              |
| Difícil | 6x6     | 36     | 18    | -30 puntos              |

## Sistema de puntaje

El puntaje se calcula en tiempo real con la siguiente fórmula:

```
puntaje = (pares encontrados x 100)
        - (errores x penalización del nivel)
        - (segundos transcurridos x 1)
        + (300 si la partida fue completada)
```

El puntaje nunca puede ser menor a 0. Al finalizar la partida se suma un bonus fijo de 300 puntos.

## Funcionalidades implementadas

### Obligatorias

- Validación del nombre del jugador (mínimo 3 caracteres) y del nivel de dificultad antes de empezar, con mensajes de error visuales (sin `alert`).
- Generación dinámica del tablero según el nivel elegido, con mezcla aleatoria de cartas en cada partida.
- Mecánica completa de selección, comparación, bloqueo del tablero durante la resolución del turno y detección automática de victoria.
- Contadores de intentos, errores y pares encontrados, actualizados en tiempo real.
- Temporizador visible que inicia con la primera carta revelada y se detiene al ganar.
- Reinicio de partida sin recargar la página, reseteando tablero, contadores, puntaje y temporizador.
- Modal de victoria con nombre del jugador, nivel, intentos, errores, tiempo total y puntaje final.
- Página de contacto con validación de nombre, mail y mensaje en JavaScript, que abre el cliente de mail predeterminado mediante un enlace `mailto:`.
- Navegación entre la página del juego y la página de contacto, con enlaces al repositorio de GitHub (nueva pestaña) y a la versión publicada en GitHub Pages.
- Diseño responsive con Flexbox para desktop, tablet y mobile.
- Reemplazo de `alert`/`confirm` por modales propios para mensajes y confirmaciones (por ejemplo, al borrar el ranking).

### Deseadas

- **Ranking con LocalStorage**: cada partida completada guarda jugador, puntaje, nivel, intentos, errores, fecha y duración. El ranking se muestra en un modal, se puede ordenar por puntaje, fecha, duración o nivel, y borrarse con confirmación mediante un modal propio.
- **Modo oscuro / claro**: toggle disponible en el encabezado, con la preferencia guardada en LocalStorage.
- **Sonidos**: efectos de selección, acierto, error y victoria generados con la Web Audio API (sin depender de archivos de audio externos), con opción de activar o desactivar el sonido.
- Estados visuales diferenciados para cartas seleccionadas, correctas e incorrectas, sin depender únicamente del color (bordes, animación de giro y contraste).

## Estructura del proyecto

```
/assets
  /images
  /sounds
/css
  reset.css
  styles.css
/js
  validations.js
  storage.js
  sounds.js
  game.js
  ui.js
  main.js
  contact.js
/pages
  contact.html
index.html
README.md
.gitignore
```

- `validations.js`: validación del nombre del jugador y del formulario de contacto.
- `storage.js`: lectura y escritura de ranking y preferencias (tema y sonido) en LocalStorage.
- `sounds.js`: generación de efectos de sonido con Web Audio API.
- `game.js`: estado y lógica pura del juego (mazo, mezcla, comparación de cartas, puntaje).
- `ui.js`: renderizado del tablero, estadísticas y modales en el DOM.
- `main.js`: inicialización, manejo de eventos y orquestación entre `Game`, `UI`, `Storage` y `Sounds`.
- `contact.js`: lógica específica de la página de contacto.

## Buenas prácticas aplicadas

- JavaScript ES5 estricto (`'use strict'`), sin `let`, `const`, arrow functions ni template literals.
- Manejo de eventos exclusivamente con `addEventListener`, sin atributos `onclick` en el HTML.
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`) y sin estilos ni scripts en línea.
- Maquetado con Flexbox, sin Grid ni Float, y colores expresados siempre en formato HSL.
- Nomenclatura consistente en Kebab Case para archivos y carpetas, y Camel Case para variables y funciones de JavaScript.

## Cómo ejecutar el proyecto

El proyecto no requiere instalación ni dependencias. Alcanza con abrir `index.html` en un navegador o servirlo con cualquier servidor estático (por ejemplo, la extensión Live Server de VS Code) para poder navegar correctamente entre `index.html` y `pages/contact.html`.

## Integrantes

- Renzo Falcone
