'use strict';

// Orquestador de la aplicacion: conecta los eventos del usuario con la
// logica de Game, el renderizado de UI, el almacenamiento de Storage y los
// efectos de Sounds. Ademas maneja el temporizador de la partida.
var App = {};

App.timerIntervalId = null;
// Guarda la accion a ejecutar si el usuario confirma el modal de confirmacion
// generico (por ejemplo, borrar el ranking).
App.pendingConfirmAction = null;

// Punto de entrada: se ejecuta una sola vez cuando el DOM ya esta cargado.
App.init = function () {
  UI.cacheElements();
  App.applyStoredTheme();
  App.applyStoredSound();
  App.bindEvents();
  UI.showSetupScreen();
};

// Aplica el tema guardado en LocalStorage (o claro por defecto) al cargar la pagina.
App.applyStoredTheme = function () {
  var storedTheme = Storage.getThemePreference();
  UI.applyTheme(storedTheme === 'dark' ? 'dark' : 'light');
};

// Deja el icono de sonido acorde a la preferencia guardada.
App.applyStoredSound = function () {
  UI.applySoundIcon(Storage.isSoundEnabled());
};

// Registra todos los listeners de la pantalla de juego. Se usa
// addEventListener en todos los casos, nunca atributos onclick en el HTML.
App.bindEvents = function () {
  UI.elements.setupForm.addEventListener('submit', App.handleSetupSubmit);
  UI.elements.board.addEventListener('click', App.handleBoardClick);
  document.getElementById('restartButton').addEventListener('click', App.handleRestart);
  document.getElementById('changeLevelButton').addEventListener('click', App.handleChangeLevel);
  document.getElementById('winPlayAgainButton').addEventListener('click', App.handleWinPlayAgain);
  document.getElementById('winCloseButton').addEventListener('click', App.handleWinClose);
  document.getElementById('openRankingButton').addEventListener('click', App.handleOpenRanking);
  document.getElementById('closeRankingButton').addEventListener('click', UI.hideRankingModal);
  document.getElementById('clearRankingButton').addEventListener('click', App.handleClearRankingRequest);
  UI.elements.rankingSortSelect.addEventListener('change', App.handleRankingSortChange);
  document.getElementById('confirmAcceptButton').addEventListener('click', App.handleConfirmAccept);
  document.getElementById('confirmCancelButton').addEventListener('click', App.handleConfirmCancel);
  UI.elements.themeToggleButton.addEventListener('click', App.handleThemeToggle);
  UI.elements.soundToggleButton.addEventListener('click', App.handleSoundToggle);
};

// Devuelve el value del radio button de nivel que este marcado.
App.getSelectedLevel = function () {
  var levelInputs = document.getElementsByName('level');
  var index;
  for (index = 0; index < levelInputs.length; index += 1) {
    if (levelInputs[index].checked) {
      return levelInputs[index].value;
    }
  }
  return 'facil';
};

// Handler del submit del formulario de inicio: valida el nombre con JS
// (el form tiene novalidate, asi que HTML5 no interviene) y si es valido
// arranca la partida.
App.handleSetupSubmit = function (submitEvent) {
  var playerName, levelKey;
  submitEvent.preventDefault();
  playerName = UI.elements.playerNameInput.value.replace(/^\s+|\s+$/g, '');
  if (!Validators.isValidPlayerName(playerName)) {
    UI.showFieldError(UI.elements.playerNameError, 'El nombre debe tener al menos 3 caracteres.');
    return;
  }
  UI.clearFieldError(UI.elements.playerNameError);
  levelKey = App.getSelectedLevel();
  App.beginGame(playerName, levelKey);
};

// Arranca (o reinicia) una partida: crea el estado en Game, dibuja el
// tablero y las estadisticas, muestra la pantalla de juego y detiene
// cualquier temporizador que hubiera quedado corriendo de una partida anterior.
App.beginGame = function (playerName, levelKey) {
  var state = Game.start(playerName, levelKey);
  UI.renderBoard(state.deck, state.level.columns);
  UI.updateStats(state);
  UI.showGameScreen();
  App.stopTimer();
};

// Delegacion de eventos: un solo listener en el tablero detecta el click en
// cualquier carta (aunque se hayan generado dinamicamente) y busca el boton
// .card mas cercano al elemento clickeado.
App.handleBoardClick = function (clickEvent) {
  var cardElement = clickEvent.target.closest ? clickEvent.target.closest('.card') : App.findCardAncestor(clickEvent.target);
  var cardId;
  if (!cardElement || Game.state.isFinished) {
    return;
  }
  cardId = cardElement.getAttribute('data-card-id');
  App.selectCard(cardId);
};

// Alternativa manual a Element.closest para navegadores muy viejos que no
// lo soporten: sube por los padres hasta encontrar la carta o el tablero.
App.findCardAncestor = function (targetElement) {
  var currentElement = targetElement;
  while (currentElement && currentElement !== UI.elements.board) {
    if (currentElement.classList && currentElement.classList.contains('card')) {
      return currentElement;
    }
    currentElement = currentElement.parentNode;
  }
  return null;
};

// Revela la carta clickeada (si Game lo permite), reproduce el sonido de
// seleccion, arranca el temporizador si es la primera carta de la partida,
// y si ya hay dos cartas elegidas programa la resolucion del turno.
App.selectCard = function (cardId) {
  var card = Game.revealCard(cardId);
  if (!card) {
    return;
  }
  UI.setCardRevealed(cardId, true, card.name);
  Sounds.playSelect();
  if (!App.timerIntervalId) {
    App.startTimer();
  }
  if (Game.state.selectedCardIds.length === 2) {
    window.setTimeout(App.resolveTurn, 500);
  }
};

// Resuelve el turno una vez elegidas las dos cartas: si coinciden las deja
// marcadas como emparejadas y revisa si la partida termino; si no
// coinciden, las marca en rojo y programa que se vuelvan a ocultar.
App.resolveTurn = function () {
  var result = Game.resolveSelection();
  UI.updateStats(Game.state);
  if (result.isMatch) {
    UI.setCardMatched(result.firstCard.id);
    UI.setCardMatched(result.secondCard.id);
    Sounds.playMatch();
    Game.clearMatchedSelection();
    App.checkForWin();
  } else {
    UI.setCardIncorrect(result.firstCard.id, true);
    UI.setCardIncorrect(result.secondCard.id, true);
    Sounds.playError();
    window.setTimeout(App.hideIncorrectCards, Game.CARD_HIDE_DELAY_MS);
  }
};

// Vuelve a ocultar (dar vuelta) las dos cartas del turno que no formaron
// un par, y libera el tablero para el siguiente intento.
App.hideIncorrectCards = function () {
  var firstCardId = Game.state.selectedCardIds[0];
  var secondCardId = Game.state.selectedCardIds[1];
  UI.setCardIncorrect(firstCardId, false);
  UI.setCardIncorrect(secondCardId, false);
  UI.setCardRevealed(firstCardId, false, '');
  UI.setCardRevealed(secondCardId, false, '');
  Game.hideUnmatchedSelection();
};

// Si ya se encontraron todos los pares, termina la partida: detiene el
// temporizador, suena la melodia de victoria, guarda el resultado en el
// ranking y muestra el modal final.
App.checkForWin = function () {
  if (!Game.isGameComplete()) {
    return;
  }
  Game.finish();
  App.stopTimer();
  UI.updateStats(Game.state);
  Sounds.playWin();
  App.saveRankingEntry();
  UI.showWinModal(Game.state);
};

// Arma el registro de la partida terminada y lo guarda en LocalStorage
// para el ranking (deseado del PDF).
App.saveRankingEntry = function () {
  var now = new Date();
  Storage.saveRankingEntry({
    playerName: Game.state.playerName,
    score: Game.state.score,
    levelLabel: Game.state.level.label,
    attempts: Game.state.attempts,
    errors: Game.state.errors,
    durationSeconds: Game.state.elapsedSeconds,
    timestamp: now.getTime(),
    dateLabel: now.toLocaleString()
  });
};

// Arranca el intervalo que suma un segundo por vez al cronometro visible.
App.startTimer = function () {
  App.timerIntervalId = window.setInterval(App.tickTimer, 1000);
};

// Detiene el cronometro (se llama al ganar y antes de arrancar una partida nueva).
App.stopTimer = function () {
  if (App.timerIntervalId) {
    window.clearInterval(App.timerIntervalId);
    App.timerIntervalId = null;
  }
};

// Cada segundo: suma un segundo al contador, recalcula el puntaje (la
// formula resta puntos por tiempo transcurrido) y actualiza la pantalla.
App.tickTimer = function () {
  Game.state.elapsedSeconds += 1;
  Game.updateScore();
  UI.updateStats(Game.state);
};

// Reinicia la partida actual sin recargar la pagina, conservando el mismo
// jugador y nivel.
App.handleRestart = function () {
  App.stopTimer();
  App.beginGame(Game.state.playerName, Game.state.level.key);
};

// Vuelve a la pantalla de inicio para elegir otro nombre o nivel.
App.handleChangeLevel = function () {
  App.stopTimer();
  UI.hideWinModal();
  UI.showSetupScreen();
};

// Desde el modal de victoria, arranca una partida nueva con el mismo jugador y nivel.
App.handleWinPlayAgain = function () {
  UI.hideWinModal();
  App.beginGame(Game.state.playerName, Game.state.level.key);
};

// Desde el modal de victoria, vuelve a la pantalla de inicio.
App.handleWinClose = function () {
  UI.hideWinModal();
  UI.showSetupScreen();
};

// Abre el modal de ranking ya ordenado segun el criterio seleccionado.
App.handleOpenRanking = function () {
  UI.renderRanking(Storage.getSortedRanking(UI.elements.rankingSortSelect.value));
  UI.showRankingModal();
};

// Vuelve a dibujar el ranking cuando el usuario cambia el criterio de orden.
App.handleRankingSortChange = function () {
  UI.renderRanking(Storage.getSortedRanking(UI.elements.rankingSortSelect.value));
};

// Pide confirmacion (con el modal propio, no window.confirm) antes de
// borrar el historial del ranking.
App.handleClearRankingRequest = function () {
  App.pendingConfirmAction = App.clearRanking;
  UI.showConfirmModal('Se va a borrar todo el historial de partidas. Esta accion no se puede deshacer.');
};

// Borra el ranking en LocalStorage y actualiza la tabla en pantalla.
App.clearRanking = function () {
  Storage.clearRanking();
  UI.renderRanking([]);
};

// El usuario confirmo la accion pendiente del modal de confirmacion: se
// ejecuta y se limpia la referencia.
App.handleConfirmAccept = function () {
  UI.hideConfirmModal();
  if (App.pendingConfirmAction) {
    App.pendingConfirmAction();
    App.pendingConfirmAction = null;
  }
};

// El usuario cancelo el modal de confirmacion: no se ejecuta nada.
App.handleConfirmCancel = function () {
  UI.hideConfirmModal();
  App.pendingConfirmAction = null;
};

// Alterna entre modo claro y oscuro, y guarda la preferencia elegida.
App.handleThemeToggle = function () {
  var isDark = document.body.classList.contains('theme-dark');
  var nextTheme = isDark ? 'light' : 'dark';
  UI.applyTheme(nextTheme);
  Storage.setThemePreference(nextTheme);
};

// Activa o desactiva el sonido, y guarda la preferencia elegida.
App.handleSoundToggle = function () {
  var isEnabled = !Storage.isSoundEnabled();
  Storage.setSoundEnabled(isEnabled);
  UI.applySoundIcon(isEnabled);
};

// Arranca todo recien cuando el DOM termino de cargar.
document.addEventListener('DOMContentLoaded', App.init);
