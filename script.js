(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menuToggle = $('#menuToggle');
  const nav = $('#nav');
  const toast = $('#toast');
  let toastTimer;

  // Mobile navigation
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Optional light theme
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    showToast(document.body.classList.contains('light') ? 'Light theme enabled' : 'Dark theme enabled');
  });

  // Scroll reveal animations
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 4) * 75, 225)}ms`;
      observer.observe(el);
    });
  } else revealEls.forEach(el => el.classList.add('visible'));

  // Destination category filters and search work together
  let activeFilter = 'all';
  const cards = $$('.destination-card');
  const searchInput = $('#destinationSearch');
  function filterDestinations() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const tags = card.dataset.tags.split(' ');
      const name = card.dataset.name.toLowerCase();
      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchQuery = !query || name.includes(query);
      const show = matchFilter && matchQuery;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    $('#emptyState').hidden = visible !== 0;
  }
  $$('#filters .chip').forEach(button => button.addEventListener('click', () => {
    $$('#filters .chip').forEach(chip => chip.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    filterDestinations();
  }));
  searchInput.addEventListener('input', filterDestinations);

  // Set sensible date minimum to today
  const dateInput = $('#tripDate');
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localToday;

  // Demo trip planner: creates a useful local summary, no external booking
  $('#tripForm').addEventListener('submit', event => {
    event.preventDefault();
    const destination = $('#tripDestination').value;
    const date = dateInput.value;
    const style = $('#tripStyle').value;
    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const result = $('#formResult');
    result.innerHTML = `<strong>Your Rajasthan idea is taking shape ✦</strong><br>Destination: ${escapeHTML(destination)} · Start date: ${escapeHTML(formattedDate)} · Mood: ${escapeHTML(style)}.<br><span style="color:var(--muted);font-size:11px">Suggested next step: keep 2–3 days for one city, or 6–8 days for a multi-city route.</span>`;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('Your trip idea is ready');
  });

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  $('#year').textContent = new Date().getFullYear();
})();
