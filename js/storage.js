'use strict';

var Storage = {};

Storage.RANKING_KEY = 'memotest-flags-ranking';
Storage.THEME_KEY = 'memotest-flags-theme';
Storage.SOUND_KEY = 'memotest-flags-sound';

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

Storage.saveRankingEntry = function (entry) {
  var ranking = Storage.getRanking();
  ranking.push(entry);
  window.localStorage.setItem(Storage.RANKING_KEY, JSON.stringify(ranking));
};

Storage.clearRanking = function () {
  window.localStorage.removeItem(Storage.RANKING_KEY);
};

Storage.getSortedRanking = function (criteria) {
  var ranking = Storage.getRanking().slice();
  ranking.sort(Storage.buildRankingComparator(criteria));
  return ranking;
};

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

Storage.getThemePreference = function () {
  return window.localStorage.getItem(Storage.THEME_KEY);
};

Storage.setThemePreference = function (themeName) {
  window.localStorage.setItem(Storage.THEME_KEY, themeName);
};

Storage.isSoundEnabled = function () {
  var storedValue = window.localStorage.getItem(Storage.SOUND_KEY);
  return storedValue !== 'off';
};

Storage.setSoundEnabled = function (isEnabled) {
  window.localStorage.setItem(Storage.SOUND_KEY, isEnabled ? 'on' : 'off');
};
