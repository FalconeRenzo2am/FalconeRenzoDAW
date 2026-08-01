'use strict';

// Toda la manipulacion del DOM vive aca: crear el tablero, mostrar/ocultar
// pantallas y modales, y actualizar los textos en pantalla. No conoce las
// reglas del juego, solo recibe datos ya calculados por game.js.
var UI = {};

// Referencias a los elementos del DOM, cacheadas una sola vez al iniciar
// para no llamar a getElementById en cada actualizacion.
UI.elements = {};

UI.cacheElements = function () {
  UI.elements.setupScreen = document.getElementById('setupScreen');
  UI.elements.gameScreen = document.getElementById('gameScreen');
  UI.elements.setupForm = document.getElementById('setupForm');
  UI.elements.playerNameInput = document.getElementById('playerNameInput');
  UI.elements.playerNameError = document.getElementById('playerNameError');
  UI.elements.board = document.getElementById('board');
  UI.elements.statPlayerName = document.getElementById('statPlayerName');
  UI.elements.statLevel = document.getElementById('statLevel');
  UI.elements.statAttempts = document.getElementById('statAttempts');
  UI.elements.statErrors = document.getElementById('statErrors');
  UI.elements.statPairs = document.getElementById('statPairs');
  UI.elements.statScore = document.getElementById('statScore');
  UI.elements.statTime = document.getElementById('statTime');
  UI.elements.winModal = document.getElementById('winModal');
  UI.elements.winSummaryList = document.getElementById('winSummaryList');
  UI.elements.rankingModal = document.getElementById('rankingModal');
  UI.elements.rankingTableBody = document.getElementById('rankingTableBody');
  UI.elements.rankingTable = document.getElementById('rankingTable');
  UI.elements.rankingEmptyMessage = document.getElementById('rankingEmptyMessage');
  UI.elements.rankingSortSelect = document.getElementById('rankingSortSelect');
  UI.elements.confirmModal = document.getElementById('confirmModal');
  UI.elements.confirmModalMessage = document.getElementById('confirmModalMessage');
  UI.elements.themeToggleButton = document.getElementById('themeToggleButton');
  UI.elements.soundToggleButton = document.getElementById('soundToggleButton');
};

// Helpers genericos para mostrar/ocultar cualquier elemento agregando o
// quitando la clase "hidden" (display: none definido en styles.css).
UI.showElement = function (element) {
  element.classList.remove('hidden');
};

UI.hideElement = function (element) {
  element.classList.add('hidden');
};

// Cambia entre la pantalla de inicio (nombre + nivel) y la pantalla de juego.
UI.showSetupScreen = function () {
  UI.showElement(UI.elements.setupScreen);
  UI.hideElement(UI.elements.gameScreen);
};

UI.showGameScreen = function () {
  UI.hideElement(UI.elements.setupScreen);
  UI.showElement(UI.elements.gameScreen);
};

// Muestra u oculta el texto de error debajo de un campo de formulario.
UI.showFieldError = function (errorElement, message) {
  errorElement.textContent = message;
};

UI.clearFieldError = function (errorElement) {
  errorElement.textContent = '';
};

// Aplica la clase que define, via CSS (Flexbox), cuantas columnas tiene el
// tablero segun el nivel elegido (board--cols-4/5/6).
UI.setBoardColumnsClass = function (columns) {
  UI.elements.board.className = 'board board--cols-' + columns;
};

// Crea el elemento HTML de una carta: un boton con dos caras (frente con el
// signo de pregunta, dorso con el SVG de la bandera) que se da vuelta con
// una animacion CSS al agregar la clase card--revealed.
UI.buildCardElement = function (card) {
  var cardButton, cardInner, cardFront, cardBack;
  cardButton = document.createElement('button');
  cardButton.type = 'button';
  cardButton.className = 'card';
  cardButton.setAttribute('data-card-id', card.id);
  cardButton.setAttribute('aria-label', 'Carta oculta');
  cardInner = document.createElement('span');
  cardInner.className = 'card__inner';
  cardFront = document.createElement('span');
  cardFront.className = 'card__face card__face--front';
  cardFront.textContent = '?';
  cardBack = document.createElement('span');
  cardBack.className = 'card__face card__face--back';
  cardBack.innerHTML = card.svg;
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardButton.appendChild(cardInner);
  return cardButton;
};

// Genera el tablero completo a partir del mazo armado por Game.buildDeck.
// Usa un DocumentFragment para insertar todas las cartas en un solo golpe
// al DOM en vez de una por una.
UI.renderBoard = function (deck, columns) {
  var fragment, index;
  UI.setBoardColumnsClass(columns);
  UI.elements.board.textContent = '';
  fragment = document.createDocumentFragment();
  for (index = 0; index < deck.length; index += 1) {
    fragment.appendChild(UI.buildCardElement(deck[index]));
  }
  UI.elements.board.appendChild(fragment);
};

// Busca en el tablero el elemento HTML de una carta por su id.
UI.getCardElement = function (cardId) {
  return UI.elements.board.querySelector('[data-card-id="' + cardId + '"]');
};

// Marca visualmente una carta como revelada u oculta, y actualiza el
// aria-label para que un lector de pantalla anuncie el pais al revelarla.
UI.setCardRevealed = function (cardId, isRevealed, cardName) {
  var cardElement = UI.getCardElement(cardId);
  if (!cardElement) {
    return;
  }
  if (isRevealed) {
    cardElement.classList.add('card--revealed');
    cardElement.setAttribute('aria-label', cardName);
  } else {
    cardElement.classList.remove('card--revealed');
    cardElement.setAttribute('aria-label', 'Carta oculta');
  }
};

// Deja una carta marcada permanentemente como emparejada (borde verde).
UI.setCardMatched = function (cardId) {
  var cardElement = UI.getCardElement(cardId);
  if (!cardElement) {
    return;
  }
  cardElement.classList.add('card--matched');
};

// Activa o desactiva el estado visual de error (borde rojo) de una carta.
UI.setCardIncorrect = function (cardId, isIncorrect) {
  var cardElement = UI.getCardElement(cardId);
  if (!cardElement) {
    return;
  }
  if (isIncorrect) {
    cardElement.classList.add('card--incorrect');
  } else {
    cardElement.classList.remove('card--incorrect');
  }
};

// Convierte una cantidad de segundos al formato mm:ss para el temporizador.
UI.formatTime = function (totalSeconds) {
  var minutes, seconds, pad;
  pad = function (value) {
    return value < 10 ? '0' + value : String(value);
  };
  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;
  return pad(minutes) + ':' + pad(seconds);
};

// Actualiza todos los contadores visibles durante la partida (jugador,
// nivel, intentos, errores, pares, puntaje y tiempo).
UI.updateStats = function (state) {
  UI.elements.statPlayerName.textContent = state.playerName;
  UI.elements.statLevel.textContent = state.level.label;
  UI.elements.statAttempts.textContent = String(state.attempts);
  UI.elements.statErrors.textContent = String(state.errors);
  UI.elements.statPairs.textContent = state.matchedPairs + ' / ' + state.level.pairs;
  UI.elements.statScore.textContent = String(state.score);
  UI.elements.statTime.textContent = UI.formatTime(state.elapsedSeconds);
};

// Crea un renglon de texto para el resumen del modal de victoria.
UI.buildSummaryItem = function (label, value) {
  var listItem = document.createElement('li');
  listItem.className = 'modal__summary-item';
  listItem.textContent = label + ': ' + value;
  return listItem;
};

// Arma y muestra el modal final con los datos pedidos por la consigna:
// jugador, nivel, intentos, errores, tiempo total y puntaje final.
UI.showWinModal = function (state) {
  UI.elements.winSummaryList.textContent = '';
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Jugador', state.playerName));
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Nivel', state.level.label));
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Intentos', state.attempts));
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Errores', state.errors));
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Tiempo total', UI.formatTime(state.elapsedSeconds)));
  UI.elements.winSummaryList.appendChild(UI.buildSummaryItem('Puntaje final', state.score));
  UI.showElement(UI.elements.winModal);
};

UI.hideWinModal = function () {
  UI.hideElement(UI.elements.winModal);
};

// Crea una fila de la tabla del ranking con los datos de una partida guardada.
UI.buildRankingRow = function (entry) {
  var row = document.createElement('tr');
  row.appendChild(UI.buildTableCell(entry.playerName));
  row.appendChild(UI.buildTableCell(String(entry.score)));
  row.appendChild(UI.buildTableCell(entry.levelLabel));
  row.appendChild(UI.buildTableCell(String(entry.attempts)));
  row.appendChild(UI.buildTableCell(String(entry.errors)));
  row.appendChild(UI.buildTableCell(UI.formatTime(entry.durationSeconds)));
  row.appendChild(UI.buildTableCell(entry.dateLabel));
  return row;
};

UI.buildTableCell = function (textContent) {
  var cell = document.createElement('td');
  cell.textContent = textContent;
  return cell;
};

// Dibuja la tabla del ranking, o el mensaje de "no hay partidas" si esta vacio.
UI.renderRanking = function (rankingEntries) {
  var fragment, index;
  UI.elements.rankingTableBody.textContent = '';
  if (rankingEntries.length === 0) {
    UI.hideElement(UI.elements.rankingTable);
    UI.showElement(UI.elements.rankingEmptyMessage);
    return;
  }
  UI.showElement(UI.elements.rankingTable);
  UI.hideElement(UI.elements.rankingEmptyMessage);
  fragment = document.createDocumentFragment();
  for (index = 0; index < rankingEntries.length; index += 1) {
    fragment.appendChild(UI.buildRankingRow(rankingEntries[index]));
  }
  UI.elements.rankingTableBody.appendChild(fragment);
};

UI.showRankingModal = function () {
  UI.showElement(UI.elements.rankingModal);
};

UI.hideRankingModal = function () {
  UI.hideElement(UI.elements.rankingModal);
};

// Modal de confirmacion generico (reemplaza a window.confirm), usado por
// ejemplo para confirmar el borrado del ranking.
UI.showConfirmModal = function (message) {
  UI.elements.confirmModalMessage.textContent = message;
  UI.showElement(UI.elements.confirmModal);
};

UI.hideConfirmModal = function () {
  UI.hideElement(UI.elements.confirmModal);
};

// Aplica el tema claro u oscuro agregando/quitando una clase en el body
// (los colores estan definidos como variables CSS en styles.css) y cambia
// el icono del boton de tema.
UI.applyTheme = function (themeName) {
  if (themeName === 'dark') {
    document.body.classList.add('theme-dark');
    UI.elements.themeToggleButton.textContent = '☀️';
  } else {
    document.body.classList.remove('theme-dark');
    UI.elements.themeToggleButton.textContent = '🌙';
  }
};

// Cambia el icono del boton de sonido segun si esta activado o no.
UI.applySoundIcon = function (isEnabled) {
  UI.elements.soundToggleButton.textContent = isEnabled ? '🔊' : '🔇';
};
