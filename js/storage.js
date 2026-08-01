'use strict';

// Todo el acceso a LocalStorage pasa por este archivo: guarda el ranking de
// partidas y las preferencias del usuario (tema claro/oscuro y sonido on/off).
var Storage = {};

Storage.RANKING_KEY = 'memotest-flags-ranking';
Storage.THEME_KEY = 'memotest-flags-theme';
Storage.SOUND_KEY = 'memotest-flags-sound';

// Devuelve el arreglo de partidas guardadas, o un arreglo vacio si todavia
// no hay nada guardado o el contenido esta corrupto.
Storage.getRanking = function () {
  var rawData = window.localStorage.getItem(Storage.RANKING_KEY);
  if (!rawData) {
    return [];
  }
  try {
    return JSON.parse(rawData);
  } catch (parseError) {
    return [];
  }
};

// Agrega una partida terminada al historial del ranking.
Storage.saveRankingEntry = function (entry) {
  var ranking = Storage.getRanking();
  ranking.push(entry);
  window.localStorage.setItem(Storage.RANKING_KEY, JSON.stringify(ranking));
};

// Borra todo el historial de partidas del ranking.
Storage.clearRanking = function () {
  window.localStorage.removeItem(Storage.RANKING_KEY);
};

// Devuelve una copia del ranking ordenada segun el criterio elegido
// (no modifica el arreglo original guardado en LocalStorage).
Storage.getSortedRanking = function (criteria) {
  var ranking = Storage.getRanking().slice();
  ranking.sort(Storage.buildRankingComparator(criteria));
  return ranking;
};

// Devuelve la funcion de comparacion adecuada segun el criterio de orden
// pedido (puntaje, fecha, duracion o nivel). Por defecto ordena por puntaje.
Storage.buildRankingComparator = function (criteria) {
  if (criteria === 'date') {
    return function (entryA, entryB) {
      return entryB.timestamp - entryA.timestamp;
    };
  }
  if (criteria === 'duration') {
    return function (entryA, entryB) {
      return entryA.durationSeconds - entryB.durationSeconds;
    };
  }
  if (criteria === 'level') {
    return function (entryA, entryB) {
      return entryA.levelLabel.localeCompare(entryB.levelLabel);
    };
  }
  return function (entryA, entryB) {
    return entryB.score - entryA.score;
  };
};

// Lee la preferencia de tema guardada ('dark', 'light' o null si no hay ninguna).
Storage.getThemePreference = function () {
  return window.localStorage.getItem(Storage.THEME_KEY);
};

// Guarda la preferencia de tema elegida por el usuario.
Storage.setThemePreference = function (themeName) {
  window.localStorage.setItem(Storage.THEME_KEY, themeName);
};

// El sonido esta activado por defecto, salvo que el usuario lo haya
// desactivado explicitamente en una partida anterior.
Storage.isSoundEnabled = function () {
  var storedValue = window.localStorage.getItem(Storage.SOUND_KEY);
  return storedValue !== 'off';
};

// Guarda la preferencia de sonido activado/desactivado.
Storage.setSoundEnabled = function (isEnabled) {
  window.localStorage.setItem(Storage.SOUND_KEY, isEnabled ? 'on' : 'off');
};
