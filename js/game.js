'use strict';

var Game = {};

Game.LEVELS = {
  facil: { key: 'facil', label: 'Facil', columns: 4, pairs: 8, errorPenalty: 10 },
  medio: { key: 'medio', label: 'Medio', columns: 5, pairs: 10, errorPenalty: 20 },
  dificil: { key: 'dificil', label: 'Dificil', columns: 6, pairs: 18, errorPenalty: 30 }
};

Game.FLAGS = [
  { code: 'ar', name: 'Argentina', emoji: '🇦🇷' },
  { code: 'br', name: 'Brasil', emoji: '🇧🇷' },
  { code: 'es', name: 'Espana', emoji: '🇪🇸' },
  { code: 'fr', name: 'Francia', emoji: '🇫🇷' },
  { code: 'de', name: 'Alemania', emoji: '🇩🇪' },
  { code: 'it', name: 'Italia', emoji: '🇮🇹' },
  { code: 'jp', name: 'Japon', emoji: '🇯🇵' },
  { code: 'mx', name: 'Mexico', emoji: '🇲🇽' },
  { code: 'ca', name: 'Canada', emoji: '🇨🇦' },
  { code: 'us', name: 'Estados Unidos', emoji: '🇺🇸' },
  { code: 'pt', name: 'Portugal', emoji: '🇵🇹' },
  { code: 'gb', name: 'Inglaterra', emoji: '🇬🇧' },
  { code: 'nl', name: 'Paises Bajos', emoji: '🇳🇱' },
  { code: 'kr', name: 'Corea del Sur', emoji: '🇰🇷' },
  { code: 'uy', name: 'Uruguay', emoji: '🇺🇾' },
  { code: 'co', name: 'Colombia', emoji: '🇨🇴' },
  { code: 'cl', name: 'Chile', emoji: '🇨🇱' },
  { code: 'hr', name: 'Croacia', emoji: '🇭🇷' }
];

Game.SCORE_PER_MATCH = 100;
Game.SCORE_FINISH_BONUS = 300;
Game.SCORE_PENALTY_PER_SECOND = 1;
Game.CARD_HIDE_DELAY_MS = 900;

Game.state = null;

Game.shuffleArray = function (originalArray) {
  var shuffledArray, currentIndex, randomIndex, temporaryValue;
  shuffledArray = originalArray.slice();
  currentIndex = shuffledArray.length;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = shuffledArray[currentIndex];
    shuffledArray[currentIndex] = shuffledArray[randomIndex];
    shuffledArray[randomIndex] = temporaryValue;
  }
  return shuffledArray;
};

Game.buildDeck = function (levelConfig) {
  var chosenFlags, deck, index, flag;
  chosenFlags = Game.shuffleArray(Game.FLAGS).slice(0, levelConfig.pairs);
  deck = [];
  for (index = 0; index < chosenFlags.length; index += 1) {
    flag = chosenFlags[index];
    deck.push({ id: flag.code + '-a', pairCode: flag.code, name: flag.name, emoji: flag.emoji, isRevealed: false, isMatched: false });
    deck.push({ id: flag.code + '-b', pairCode: flag.code, name: flag.name, emoji: flag.emoji, isRevealed: false, isMatched: false });
  }
  return Game.shuffleArray(deck);
};

Game.start = function (playerName, levelKey) {
  var levelConfig = Game.LEVELS[levelKey];
  Game.state = {
    playerName: playerName,
    level: levelConfig,
    deck: Game.buildDeck(levelConfig),
    selectedCardIds: [],
    isBoardLocked: false,
    attempts: 0,
    errors: 0,
    matchedPairs: 0,
    score: 0,
    elapsedSeconds: 0,
    timerIntervalId: null,
    hasTimerStarted: false,
    isFinished: false
  };
  return Game.state;
};

Game.findCardById = function (cardId) {
  var index;
  for (index = 0; index < Game.state.deck.length; index += 1) {
    if (Game.state.deck[index].id === cardId) {
      return Game.state.deck[index];
    }
  }
  return null;
};

Game.isCardSelectable = function (card) {
  if (!card) {
    return false;
  }
  if (Game.state.isBoardLocked) {
    return false;
  }
  if (card.isMatched || card.isRevealed) {
    return false;
  }
  if (Game.state.selectedCardIds.length >= 2) {
    return false;
  }
  return true;
};

Game.revealCard = function (cardId) {
  var card = Game.findCardById(cardId);
  if (!Game.isCardSelectable(card)) {
    return null;
  }
  card.isRevealed = true;
  Game.state.selectedCardIds.push(cardId);
  if (!Game.state.hasTimerStarted) {
    Game.state.hasTimerStarted = true;
  }
  if (Game.state.selectedCardIds.length === 2) {
    Game.state.attempts += 1;
    Game.state.isBoardLocked = true;
  }
  return card;
};

Game.resolveSelection = function () {
  var firstCard, secondCard, isMatch;
  firstCard = Game.findCardById(Game.state.selectedCardIds[0]);
  secondCard = Game.findCardById(Game.state.selectedCardIds[1]);
  isMatch = firstCard.pairCode === secondCard.pairCode;
  if (isMatch) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    Game.state.matchedPairs += 1;
  } else {
    Game.state.errors += 1;
  }
  Game.updateScore();
  return { isMatch: isMatch, firstCard: firstCard, secondCard: secondCard };
};

Game.hideUnmatchedSelection = function () {
  var firstCard, secondCard;
  firstCard = Game.findCardById(Game.state.selectedCardIds[0]);
  secondCard = Game.findCardById(Game.state.selectedCardIds[1]);
  if (!firstCard.isMatched) {
    firstCard.isRevealed = false;
  }
  if (!secondCard.isMatched) {
    secondCard.isRevealed = false;
  }
  Game.state.selectedCardIds = [];
  Game.state.isBoardLocked = false;
};

Game.clearMatchedSelection = function () {
  Game.state.selectedCardIds = [];
  Game.state.isBoardLocked = false;
};

Game.isGameComplete = function () {
  return Game.state.matchedPairs === Game.state.level.pairs;
};

Game.updateScore = function () {
  var baseScore, errorsPenalty, timePenalty, finishBonus, totalScore;
  baseScore = Game.state.matchedPairs * Game.SCORE_PER_MATCH;
  errorsPenalty = Game.state.errors * Game.state.level.errorPenalty;
  timePenalty = Game.state.elapsedSeconds * Game.SCORE_PENALTY_PER_SECOND;
  finishBonus = Game.state.isFinished ? Game.SCORE_FINISH_BONUS : 0;
  totalScore = baseScore - errorsPenalty - timePenalty + finishBonus;
  if (totalScore < 0) {
    totalScore = 0;
  }
  Game.state.score = totalScore;
  return Game.state.score;
};

Game.finish = function () {
  Game.state.isFinished = true;
  Game.updateScore();
};
