// HOLBERY Marketplace — progressive enhancement only. Site works without JS.
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
  // Auto-submit filter selects (the "Terapkan" button remains for keyboard / no-JS users).
  var selects = document.querySelectorAll('select[data-autosubmit]');
  for (var i = 0; i < selects.length; i++) {
    selects[i].addEventListener('change', function (e) {
      var form = e.target.form;
      if (form) form.submit();
    });
  }
})();
