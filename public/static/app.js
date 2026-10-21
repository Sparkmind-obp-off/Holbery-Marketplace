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

// ---------- Duitku POP checkout (UX only; payment truth is server-verified) ----------
(function () {
  'use strict';
  function popAvailable() { return typeof window.checkout !== 'undefined' && typeof window.checkout.process === 'function'; }

  function openPop(reference, orderUrl) {
    if (!popAvailable()) { if (orderUrl) window.location.assign(orderUrl); return; }
    // Browser events below are customer-experience signals only. They never mark an order paid.
    var go = function () { if (orderUrl) window.location.assign(orderUrl); else window.location.reload(); };
    window.checkout.process(reference, {
      defaultLanguage: 'id',
      successEvent: go,
      pendingEvent: go,
      errorEvent: go,
      closeEvent: go
    });
  }

  var form = document.getElementById('checkout-form');
  if (form) {
    var err = document.getElementById('checkout-error');
    var btn = document.getElementById('checkout-submit');
    var showError = function (msg) { err.textContent = msg; err.hidden = false; };
    var MESSAGES = {
      INVALID_NAME: 'Nama wajib diisi (2–60 karakter).',
      INVALID_EMAIL: 'Alamat email tidak valid.',
      TERMS_NOT_ACCEPTED: 'Anda perlu menyetujui syarat dan kebijakan.',
      RATE_LIMITED: 'Terlalu banyak percobaan. Coba lagi dalam satu menit.',
      CHECKOUT_CLOSED: 'Checkout sedang ditutup. Tidak ada pembayaran yang dibuat.',
      NOT_PURCHASABLE: 'Produk ini sedang tidak dapat dibeli.',
      PROVIDER_UNAVAILABLE: 'Layanan pembayaran sedang tidak tersedia. Tidak ada tagihan yang dibuat. Coba lagi nanti.'
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      if (name.length < 2) return showError(MESSAGES.INVALID_NAME);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(MESSAGES.INVALID_EMAIL);
      if (!form.elements.acceptTerms.checked) return showError(MESSAGES.TERMS_NOT_ACCEPTED);
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Menyiapkan pembayaran…';
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ slug: form.getAttribute('data-slug'), name: name, email: email, acceptTerms: true })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.body && res.body.error) || 'ERROR');
          // Persist the private order link locally so the buyer can return to it.
          try { localStorage.setItem('holbery:lastOrder', res.body.orderUrl); } catch (_) {}
          openPop(res.body.reference, res.body.orderUrl);
        })
        .catch(function (ex) {
          showError(MESSAGES[ex.message] || 'Terjadi kesalahan. Tidak ada pembayaran yang dibuat.');
        })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  var resume = document.getElementById('resume-pay-button');
  if (resume) {
    resume.addEventListener('click', function () { openPop(resume.getAttribute('data-reference'), null); });
  }

  var rec = document.getElementById('reconcile-button');
  if (rec) {
    rec.addEventListener('click', function () {
      rec.disabled = true;
      rec.textContent = 'Memeriksa…';
      var url = '/api/orders/' + encodeURIComponent(rec.getAttribute('data-order')) + '/reconcile?t=' + encodeURIComponent(rec.getAttribute('data-token'));
      fetch(url, { method: 'POST', credentials: 'same-origin' })
        .then(function () { window.location.reload(); })
        .catch(function () { rec.disabled = false; rec.textContent = 'Periksa status pembayaran'; });
    });
    // Gentle auto-refresh while pending (server-side status only).
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (tries > 12) { clearInterval(timer); return; }
      fetch('/api/orders/' + encodeURIComponent(rec.getAttribute('data-order')) + '/reconcile?t=' + encodeURIComponent(rec.getAttribute('data-token')), { method: 'POST', credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.status && j.status !== 'PENDING_PAYMENT') window.location.reload(); })
        .catch(function () {});
    }, 15000);
  }
})();
