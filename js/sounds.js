'use strict';

var Sounds = {};

Sounds.audioContext = null;

Sounds.getAudioContext = function () {
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  if (!Sounds.audioContext) {
    Sounds.audioContext = new AudioContextClass();
  }
  return Sounds.audioContext;
};

Sounds.playTone = function (frequency, durationMs) {
  var context, oscillator, gainNode;
  if (!Storage.isSoundEnabled()) {
    return;
  }
  context = Sounds.getAudioContext();
  if (!context) {
    return;
  }
  oscillator = context.createOscillator();
  gainNode = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.15;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + durationMs / 1000);
  oscillator.stop(context.currentTime + durationMs / 1000);
};

Sounds.playSelect = function () {
  Sounds.playTone(440, 120);
};

Sounds.playMatch = function () {
  Sounds.playTone(659, 150);
  window.setTimeout(function () {
    Sounds.playTone(880, 180);
  }, 120);
};

Sounds.playError = function () {
  Sounds.playTone(180, 250);
};

Sounds.playWin = function () {
  Sounds.playTone(523, 150);
  window.setTimeout(function () {
    Sounds.playTone(659, 150);
  }, 150);
  window.setTimeout(function () {
    Sounds.playTone(784, 250);
  }, 300);
};
