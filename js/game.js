'use strict';

var Game = {};

Game.LEVELS = {
  facil: { key: 'facil', label: 'Facil', columns: 4, pairs: 8, errorPenalty: 10 },
  medio: { key: 'medio', label: 'Medio', columns: 5, pairs: 10, errorPenalty: 20 },
  dificil: { key: 'dificil', label: 'Dificil', columns: 6, pairs: 18, errorPenalty: 30 }
};

Game.FLAG_SVG_OPEN = '<svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
Game.FLAG_SVG_CLOSE = '</svg>';

Game.FLAGS = [
  { code: 'ar', name: 'Argentina', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><rect width="3" height="0.6667" fill="#75aadb"/><rect y="1.3333" width="3" height="0.6667" fill="#75aadb"/><circle cx="1.5" cy="1" r="0.22" fill="#f6b40e"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'br', name: 'Brasil', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#009c3b"/><polygon points="1.5,0.25 2.75,1 1.5,1.75 0.25,1" fill="#ffdf00"/><circle cx="1.5" cy="1" r="0.42" fill="#002776"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'es', name: 'Espana', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#aa151b"/><rect y="0.5" width="3" height="1" fill="#f1bf00"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'fr', name: 'Francia', svg: Game.FLAG_SVG_OPEN + '<rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'de', name: 'Alemania', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="0.6667" fill="#000"/><rect y="0.6667" width="3" height="0.6667" fill="#dd0000"/><rect y="1.3333" width="3" height="0.6667" fill="#ffce00"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'it', name: 'Italia', svg: Game.FLAG_SVG_OPEN + '<rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'jp', name: 'Japon', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><circle cx="1.5" cy="1" r="0.6" fill="#bc002d"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'mx', name: 'Mexico', svg: Game.FLAG_SVG_OPEN + '<rect width="1" height="2" fill="#006847"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce1126"/><circle cx="1.5" cy="1" r="0.28" fill="#8b5a2b"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'ca', name: 'Canada', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><rect width="0.75" height="2" fill="#ff0000"/><rect x="2.25" width="0.75" height="2" fill="#ff0000"/><polygon points="1.5,0.55 1.62,0.85 1.95,0.85 1.7,1.05 1.8,1.4 1.5,1.18 1.2,1.4 1.3,1.05 1.05,0.85 1.38,0.85" fill="#ff0000"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'us', name: 'Estados Unidos', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><rect width="3" height="0.1538" fill="#b22234"/><rect y="0.3077" width="3" height="0.1538" fill="#b22234"/><rect y="0.6154" width="3" height="0.1538" fill="#b22234"/><rect y="0.9231" width="3" height="0.1538" fill="#b22234"/><rect y="1.2308" width="3" height="0.1538" fill="#b22234"/><rect y="1.5385" width="3" height="0.1538" fill="#b22234"/><rect y="1.8462" width="3" height="0.1538" fill="#b22234"/><rect width="1.2" height="1.077" fill="#3c3b6e"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'pt', name: 'Portugal', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#ff0000"/><rect width="1.2" height="2" fill="#046a38"/><circle cx="1.2" cy="1" r="0.38" fill="#ffcc00"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'gb', name: 'Inglaterra', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#00247d"/><polygon points="0,0 0.4,0 3,1.7 3,2 2.6,2 0,0.3" fill="#fff"/><polygon points="3,0 2.6,0 0,1.7 0,2 0.4,2 3,0.3" fill="#fff"/><rect x="1.3" width="0.4" height="2" fill="#fff"/><rect y="0.8" width="3" height="0.4" fill="#fff"/><rect x="1.4" width="0.2" height="2" fill="#cf142b"/><rect y="0.9" width="3" height="0.2" fill="#cf142b"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'nl', name: 'Paises Bajos', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="0.6667" fill="#ae1c28"/><rect y="0.6667" width="3" height="0.6667" fill="#fff"/><rect y="1.3333" width="3" height="0.6667" fill="#21468b"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'kr', name: 'Corea del Sur', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><circle cx="1.5" cy="1" r="0.45" fill="#cd2e3a"/><path d="M1.5,0.55 A0.45,0.45 0 0,0 1.5,1.45 A0.225,0.225 0 0,0 1.5,1 A0.225,0.225 0 0,1 1.5,0.55 Z" fill="#0047a0"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'uy', name: 'Uruguay', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="2" fill="#fff"/><rect width="3" height="0.2222" fill="#0038a8"/><rect y="0.4444" width="3" height="0.2222" fill="#0038a8"/><rect y="0.8889" width="3" height="0.2222" fill="#0038a8"/><rect y="1.3333" width="3" height="0.2222" fill="#0038a8"/><rect y="1.7778" width="3" height="0.2222" fill="#0038a8"/><rect width="1.1" height="0.8889" fill="#fff"/><circle cx="0.55" cy="0.44" r="0.22" fill="#fcd116"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'co', name: 'Colombia', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="1" fill="#fcd116"/><rect y="1" width="3" height="0.5" fill="#003893"/><rect y="1.5" width="3" height="0.5" fill="#ce1126"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'cl', name: 'Chile', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="1" fill="#fff"/><rect y="1" width="3" height="1" fill="#d52b1e"/><rect width="1" height="1" fill="#0039a6"/><polygon points="0.5,0.2 0.61,0.53 0.96,0.53 0.68,0.74 0.79,1.07 0.5,0.86 0.21,1.07 0.32,0.74 0.04,0.53 0.39,0.53" fill="#fff"/>' + Game.FLAG_SVG_CLOSE },
  { code: 'hr', name: 'Croacia', svg: Game.FLAG_SVG_OPEN + '<rect width="3" height="0.6667" fill="#ff0000"/><rect y="0.6667" width="3" height="0.6667" fill="#fff"/><rect y="1.3333" width="3" height="0.6667" fill="#171796"/>' + Game.FLAG_SVG_CLOSE }
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
    deck.push({ id: flag.code + '-a', pairCode: flag.code, name: flag.name, svg: flag.svg, isRevealed: false, isMatched: false });
    deck.push({ id: flag.code + '-b', pairCode: flag.code, name: flag.name, svg: flag.svg, isRevealed: false, isMatched: false });
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
