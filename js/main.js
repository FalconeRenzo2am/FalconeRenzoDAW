'use strict';

var App = {};

App.timerIntervalId = null;
App.pendingConfirmAction = null;

App.init = function () {
  UI.cacheElements();
  App.applyStoredTheme();
  App.applyStoredSound();
  App.bindEvents();
  UI.showSetupScreen();
};

App.applyStoredTheme = function () {
  var storedTheme = Storage.getThemePreference();
  UI.applyTheme(storedTheme === 'dark' ? 'dark' : 'light');
};

App.applyStoredSound = function () {
  UI.applySoundIcon(Storage.isSoundEnabled());
};

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

App.beginGame = function (playerName, levelKey) {
  var state = Game.start(playerName, levelKey);
  UI.renderBoard(state.deck, state.level.columns);
  UI.updateStats(state);
  UI.showGameScreen();
  App.stopTimer();
};

App.handleBoardClick = function (clickEvent) {
  var cardElement = clickEvent.target.closest ? clickEvent.target.closest('.card') : App.findCardAncestor(clickEvent.target);
  var cardId;
  if (!cardElement || Game.state.isFinished) {
    return;
  }
  cardId = cardElement.getAttribute('data-card-id');
  App.selectCard(cardId);
};

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

App.hideIncorrectCards = function () {
  var firstCardId = Game.state.selectedCardIds[0];
  var secondCardId = Game.state.selectedCardIds[1];
  UI.setCardIncorrect(firstCardId, false);
  UI.setCardIncorrect(secondCardId, false);
  UI.setCardRevealed(firstCardId, false, '');
  UI.setCardRevealed(secondCardId, false, '');
  Game.hideUnmatchedSelection();
};

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

App.startTimer = function () {
  App.timerIntervalId = window.setInterval(App.tickTimer, 1000);
};

App.stopTimer = function () {
  if (App.timerIntervalId) {
    window.clearInterval(App.timerIntervalId);
    App.timerIntervalId = null;
  }
};

App.tickTimer = function () {
  Game.state.elapsedSeconds += 1;
  Game.updateScore();
  UI.updateStats(Game.state);
};

App.handleRestart = function () {
  App.stopTimer();
  App.beginGame(Game.state.playerName, Game.state.level.key);
};

App.handleChangeLevel = function () {
  App.stopTimer();
  UI.hideWinModal();
  UI.showSetupScreen();
};

App.handleWinPlayAgain = function () {
  UI.hideWinModal();
  App.beginGame(Game.state.playerName, Game.state.level.key);
};

App.handleWinClose = function () {
  UI.hideWinModal();
  UI.showSetupScreen();
};

App.handleOpenRanking = function () {
  UI.renderRanking(Storage.getSortedRanking(UI.elements.rankingSortSelect.value));
  UI.showRankingModal();
};

App.handleRankingSortChange = function () {
  UI.renderRanking(Storage.getSortedRanking(UI.elements.rankingSortSelect.value));
};

App.handleClearRankingRequest = function () {
  App.pendingConfirmAction = App.clearRanking;
  UI.showConfirmModal('Se va a borrar todo el historial de partidas. Esta accion no se puede deshacer.');
};

App.clearRanking = function () {
  Storage.clearRanking();
  UI.renderRanking([]);
};

App.handleConfirmAccept = function () {
  UI.hideConfirmModal();
  if (App.pendingConfirmAction) {
    App.pendingConfirmAction();
    App.pendingConfirmAction = null;
  }
};

App.handleConfirmCancel = function () {
  UI.hideConfirmModal();
  App.pendingConfirmAction = null;
};

App.handleThemeToggle = function () {
  var isDark = document.body.classList.contains('theme-dark');
  var nextTheme = isDark ? 'light' : 'dark';
  UI.applyTheme(nextTheme);
  Storage.setThemePreference(nextTheme);
};

App.handleSoundToggle = function () {
  var isEnabled = !Storage.isSoundEnabled();
  Storage.setSoundEnabled(isEnabled);
  UI.applySoundIcon(isEnabled);
};

document.addEventListener('DOMContentLoaded', App.init);
