'use strict';

// Funciones de validacion reutilizadas por el formulario de inicio del juego
// (index.html) y por el formulario de la pagina de contacto (contact.html).
var Validators = {};

Validators.MIN_PLAYER_NAME_LENGTH = 3;
Validators.MIN_MESSAGE_LENGTH = 5;

// Valida el nombre del jugador antes de empezar una partida: minimo 3 caracteres
// una vez quitados los espacios de los extremos.
Validators.isValidPlayerName = function (name) {
  var trimmedName = name.replace(/^\s+|\s+$/g, '');
  return trimmedName.length >= Validators.MIN_PLAYER_NAME_LENGTH;
};

// Valida el nombre del formulario de contacto: debe ser alfanumerico
// (letras, numeros y espacios) y tener al menos 3 caracteres.
Validators.isValidContactName = function (name) {
  var trimmedName = name.replace(/^\s+|\s+$/g, '');
  var alphanumericPattern = /^[a-zA-Z0-9À-ÿ\s]+$/;
  return trimmedName.length >= Validators.MIN_PLAYER_NAME_LENGTH && alphanumericPattern.test(trimmedName);
};

// Valida que el mail tenga un formato basico: algo@algo.algo
Validators.isValidEmail = function (email) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Valida que el mensaje de contacto tenga mas de 5 caracteres.
Validators.isValidMessage = function (message) {
  var trimmedMessage = message.replace(/^\s+|\s+$/g, '');
  return trimmedMessage.length > Validators.MIN_MESSAGE_LENGTH;
};
