'use strict';

var ContactPage = {};

ContactPage.elements = {};

ContactPage.init = function () {
  ContactPage.cacheElements();
  ContactPage.applyStoredTheme();
  ContactPage.bindEvents();
};

ContactPage.cacheElements = function () {
  ContactPage.elements.form = document.getElementById('contactForm');
  ContactPage.elements.nameInput = document.getElementById('contactNameInput');
  ContactPage.elements.nameError = document.getElementById('contactNameError');
  ContactPage.elements.emailInput = document.getElementById('contactEmailInput');
  ContactPage.elements.emailError = document.getElementById('contactEmailError');
  ContactPage.elements.messageInput = document.getElementById('contactMessageInput');
  ContactPage.elements.messageError = document.getElementById('contactMessageError');
  ContactPage.elements.feedbackMessage = document.getElementById('contactFeedbackMessage');
  ContactPage.elements.themeToggleButton = document.getElementById('themeToggleButton');
};

ContactPage.applyStoredTheme = function () {
  var storedTheme = Storage.getThemePreference();
  if (storedTheme === 'dark') {
    document.body.classList.add('theme-dark');
    ContactPage.elements.themeToggleButton.textContent = '☀️';
  } else {
    ContactPage.elements.themeToggleButton.textContent = '🌙';
  }
};

ContactPage.bindEvents = function () {
  ContactPage.elements.form.addEventListener('submit', ContactPage.handleSubmit);
  ContactPage.elements.themeToggleButton.addEventListener('click', ContactPage.handleThemeToggle);
};

ContactPage.handleThemeToggle = function () {
  var isDark = document.body.classList.contains('theme-dark');
  var nextTheme = isDark ? 'light' : 'dark';
  if (nextTheme === 'dark') {
    document.body.classList.add('theme-dark');
    ContactPage.elements.themeToggleButton.textContent = '☀️';
  } else {
    document.body.classList.remove('theme-dark');
    ContactPage.elements.themeToggleButton.textContent = '🌙';
  }
  Storage.setThemePreference(nextTheme);
};

ContactPage.handleSubmit = function (submitEvent) {
  var name, email, message, isFormValid;
  submitEvent.preventDefault();
  name = ContactPage.elements.nameInput.value.replace(/^\s+|\s+$/g, '');
  email = ContactPage.elements.emailInput.value.replace(/^\s+|\s+$/g, '');
  message = ContactPage.elements.messageInput.value.replace(/^\s+|\s+$/g, '');
  isFormValid = true;
  ContactPage.elements.feedbackMessage.textContent = '';
  if (Validators.isValidContactName(name)) {
    ContactPage.elements.nameError.textContent = '';
  } else {
    ContactPage.elements.nameError.textContent = 'Ingresa un nombre alfanumerico de al menos 3 caracteres.';
    isFormValid = false;
  }
  if (Validators.isValidEmail(email)) {
    ContactPage.elements.emailError.textContent = '';
  } else {
    ContactPage.elements.emailError.textContent = 'Ingresa un mail con formato valido.';
    isFormValid = false;
  }
  if (Validators.isValidMessage(message)) {
    ContactPage.elements.messageError.textContent = '';
  } else {
    ContactPage.elements.messageError.textContent = 'El mensaje debe tener mas de 5 caracteres.';
    isFormValid = false;
  }
  if (!isFormValid) {
    return;
  }
  ContactPage.sendEmail(name, email, message);
};

ContactPage.sendEmail = function (name, email, message) {
  var subject, body, mailtoUrl;
  subject = 'Contacto desde Memotest Banderas del Mundo - ' + name;
  body = 'Nombre: ' + name + '\nMail: ' + email + '\n\nMensaje:\n' + message;
  mailtoUrl = 'mailto:contacto@memotest-banderas.com?subject=' + window.encodeURIComponent(subject) + '&body=' + window.encodeURIComponent(body);
  window.location.href = mailtoUrl;
  ContactPage.elements.feedbackMessage.textContent = 'Se abrio tu cliente de mail para enviar el mensaje.';
  ContactPage.elements.form.reset();
};

document.addEventListener('DOMContentLoaded', ContactPage.init);
