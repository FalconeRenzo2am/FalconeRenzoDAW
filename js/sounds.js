'use strict';

// Efectos de sonido generados con la Web Audio API (tonos sinteticos), asi no
// dependemos de archivos de audio externos ni de conexion a internet.
var Sounds = {};

Sounds.audioContext = null;

// Crea (una sola vez) y devuelve el AudioContext del navegador. Si el
// navegador no soporta Web Audio API, devuelve null y los sonidos se omiten.
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

// Reproduce un tono simple (oscilador senoidal) con una frecuencia y
// duracion dadas, y lo va apagando de forma gradual para evitar un corte
// brusco. No hace nada si el usuario desactivo el sonido.
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

// Sonido corto al seleccionar una carta.
Sounds.playSelect = function () {
  Sounds.playTone(440, 120);
};

// Dos notas ascendentes cuando se encuentra un par correcto.
Sounds.playMatch = function () {
  Sounds.playTone(659, 150);
  window.setTimeout(function () {
    Sounds.playTone(880, 180);
  }, 120);
};

// Tono grave cuando el par seleccionado no coincide.
Sounds.playError = function () {
  Sounds.playTone(180, 250);
};

// Melodia corta de tres notas al ganar la partida.
Sounds.playWin = function () {
  Sounds.playTone(523, 150);
  window.setTimeout(function () {
    Sounds.playTone(659, 150);
  }, 150);
  window.setTimeout(function () {
    Sounds.playTone(784, 250);
  }, 300);
};
