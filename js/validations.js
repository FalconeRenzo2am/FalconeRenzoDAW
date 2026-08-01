'use strict';

var Validators = {};

Validators.MIN_PLAYER_NAME_LENGTH = 3;
Validators.MIN_MESSAGE_LENGTH = 5;

Validators.isValidPlayerName = function (name) {
  var trimmedName = name.replace(/^\s+|\s+$/g, '');
  return trimmedName.length >= Validators.MIN_PLAYER_NAME_LENGTH;
};

Validators.isValidContactName = function (name) {
  var trimmedName = name.replace(/^\s+|\s+$/g, '');
  var alphanumericPattern = /^[a-zA-Z0-9À-ÿ\s]+$/;
  return trimmedName.length >= Validators.MIN_PLAYER_NAME_LENGTH && alphanumericPattern.test(trimmedName);
};

Validators.isValidEmail = function (email) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

Validators.isValidMessage = function (message) {
  var trimmedMessage = message.replace(/^\s+|\s+$/g, '');
  return trimmedMessage.length > Validators.MIN_MESSAGE_LENGTH;
};
