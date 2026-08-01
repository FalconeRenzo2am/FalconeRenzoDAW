'use strict';

var UI = {};

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

UI.showElement = function (element) {
  element.classList.remove('hidden');
};

UI.hideElement = function (element) {
  element.classList.add('hidden');
};

UI.showSetupScreen = function () {
  UI.showElement(UI.elements.setupScreen);
  UI.hideElement(UI.elements.gameScreen);
};

UI.showGameScreen = function () {
  UI.hideElement(UI.elements.setupScreen);
  UI.showElement(UI.elements.gameScreen);
};

UI.showFieldError = function (errorElement, message) {
  errorElement.textContent = message;
};

UI.clearFieldError = function (errorElement) {
  errorElement.textContent = '';
};

UI.setBoardColumnsClass = function (columns) {
  UI.elements.board.className = 'board board--cols-' + columns;
};

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

UI.getCardElement = function (cardId) {
  return UI.elements.board.querySelector('[data-card-id="' + cardId + '"]');
};

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

UI.setCardMatched = function (cardId) {
  var cardElement = UI.getCardElement(cardId);
  if (!cardElement) {
    return;
  }
  cardElement.classList.add('card--matched');
};

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

UI.formatTime = function (totalSeconds) {
  var minutes, seconds, pad;
  pad = function (value) {
    return value < 10 ? '0' + value : String(value);
  };
  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;
  return pad(minutes) + ':' + pad(seconds);
};

UI.updateStats = function (state) {
  UI.elements.statPlayerName.textContent = state.playerName;
  UI.elements.statLevel.textContent = state.level.label;
  UI.elements.statAttempts.textContent = String(state.attempts);
  UI.elements.statErrors.textContent = String(state.errors);
  UI.elements.statPairs.textContent = state.matchedPairs + ' / ' + state.level.pairs;
  UI.elements.statScore.textContent = String(state.score);
  UI.elements.statTime.textContent = UI.formatTime(state.elapsedSeconds);
};

UI.buildSummaryItem = function (label, value) {
  var listItem = document.createElement('li');
  listItem.className = 'modal__summary-item';
  listItem.textContent = label + ': ' + value;
  return listItem;
};

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

UI.showConfirmModal = function (message) {
  UI.elements.confirmModalMessage.textContent = message;
  UI.showElement(UI.elements.confirmModal);
};

UI.hideConfirmModal = function () {
  UI.hideElement(UI.elements.confirmModal);
};

UI.applyTheme = function (themeName) {
  if (themeName === 'dark') {
    document.body.classList.add('theme-dark');
    UI.elements.themeToggleButton.textContent = '☀️';
  } else {
    document.body.classList.remove('theme-dark');
    UI.elements.themeToggleButton.textContent = '🌙';
  }
};

UI.applySoundIcon = function (isEnabled) {
  UI.elements.soundToggleButton.textContent = isEnabled ? '🔊' : '🔇';
};
