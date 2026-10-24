(function () {
  'use strict';
  const data = window.COURSE_DATA;
  const core = window.ReviewCore;
  const KEY = 'strategic-design.reviews.v1';
  const $ = id => document.getElementById(id);
  let states = {};
  let canSave = true;
  function warn(message) {
    const element = $('storage-warning');
    element.textContent = message;
    element.hidden = false;
  }
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) states = core.sanitize(JSON.parse(saved), data.cards);
    // Reading can work even when writes are blocked (for example, storage quota).
    localStorage.setItem(KEY, JSON.stringify(states));
  } catch (error) {
    canSave = false;
    warn('Review history could not be loaded or saved. You can practice in this tab, but changes may not persist.');
  }
  function save() {
    if (!canSave) return;
    try { localStorage.setItem(KEY, JSON.stringify(states)); }
    catch (error) {
      canSave = false;
      warn('Review dates are only in memory for this tab: browser storage is unavailable or full.');
    }
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function dashboard() {
    $('lesson-count').textContent = data.lessons.length;
    const current = data.lessons.at(-1);
    $('current-module').textContent = `Latest lesson · Module ${current.module}`;
    $('current-title').textContent = current.title;
    $('current-description').textContent = current.description;
    $('current-meta').textContent = `About ${current.minutes} minutes · ${current.status}`;
    $('current-link').href = current.href;
    $('current-link').textContent = `Open lesson ${Number(current.id)} →`;
    function refreshCount() {
      $('due-count').textContent = core.dueCards(data.cards, states, Date.now()).length;
    }
    refreshCount();
    setInterval(refreshCount, 30000);
    const library = [
      ...data.lessons.map(item => ({ ...item, kind: 'Lesson', meta: `${item.minutes} minutes · ${item.status}` })),
      ...data.references.map(item => ({ ...item, kind: 'Reference', meta: 'Printable desk reference' }))
    ];
    function renderLibrary() {
      const query = $('library-search').value.trim().toLowerCase();
      const matches = library.filter(item => `${item.title} ${item.description} ${item.kind}`.toLowerCase().includes(query));
      $('library').replaceChildren();
      for (const item of matches) {
        const panel = element('article', undefined, 'panel');
        panel.append(element('span', item.kind, 'badge'));
        const heading = element('h3');
        const link = element('a', item.title);
        link.href = item.href;
        heading.append(link);
        panel.append(heading, element('p', item.description), element('p', item.meta, 'meta'));
        $('library').append(panel);
      }
      $('library-count').textContent = matches.length ? `${matches.length} resources available` : 'No matches. Try a broader term.';
    }
    $('library-search').addEventListener('input', renderLibrary);
    renderLibrary();
    data.modules.forEach(([part, title, description], index) => {
      const panel = element('li', undefined, 'panel');
      const available = data.lessons.filter(lesson => lesson.module === index + 1);
      const status = available.length ? `${available.length} lesson${available.length === 1 ? '' : 's'} available · practice with feedback` : 'Planned · lessons not yet authored';
      panel.append(element('span', `${part} · M${index + 1}`, 'badge'), element('h3', title),
        element('p', description), element('p', status, 'meta'));
      for (const lesson of available) {
        const paragraph = element('p');
        const link = element('a', `Lesson ${Number(lesson.id)}: ${lesson.title} →`);
        link.href = lesson.href;
        paragraph.append(link);
        panel.append(paragraph);
      }
      $('module-list').append(panel);
    });
  }
  function flashcards() {
    let queue = [];
    let index = 0;
    let revealed = false;
    for (const topic of [...new Set(data.cards.map(card => card.topic))].sort()) {
      const option = element('option', topic);
      option.value = topic;
      $('topic').append(option);
    }
    function filtered() {
      return data.cards.filter(card => $('topic').value === 'all' || card.topic === $('topic').value);
    }
    function rebuild() {
      const cards = filtered();
      queue = $('review-mode').value === 'due' ? core.dueCards(cards, states, Date.now()) : [...cards];
      index = 0;
    }
    function dateLabel(timestamp) {
      return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }
    function render(focus = false, message = '') {
      const card = queue[index];
      revealed = false;
      $('answer').hidden = true;
      $('reveal').hidden = false;
      $('reveal').setAttribute('aria-expanded', 'false');
      $('flashcard').hidden = !card;
      $('empty-deck').hidden = Boolean(card);
      $('previous').disabled = !card || index === 0;
      $('next').disabled = !card || index >= queue.length - 1;
      const due = core.dueCards(filtered(), states, Date.now()).length;
      $('deck-status').textContent = `${message ? message + ' ' : ''}${queue.length ? `Card ${index + 1} of ${queue.length}.` : 'No cards in this view.'} ${due} new or due in this topic.`;
      if (!card) {
        const future = filtered().map(item => states[item.id]?.due).filter(value => value > Date.now());
        $('empty-message').textContent = future.length ? `Next review: ${dateLabel(Math.min(...future))}. Choose “All cards” to practice sooner, or return later.` : 'Choose another topic or switch to “All cards”.';
        return;
      }
      $('card-meta').textContent = `${card.topic} · ${states[card.id] ? 'Previously reviewed' : 'New card'}`;
      $('question').textContent = card.question;
      $('answer-text').textContent = card.answer;
      $('card-source').href = card.source;
      const nextState = core.rate(states[card.id], 'remembered', Date.now());
      $('next-interval').textContent = `If remembered: next review ${dateLabel(nextState.due)}. Self-rating is not demonstrated mastery.`;
      if (focus) $('question').focus();
    }
    function reveal() {
      if (!queue[index] || revealed) return;
      revealed = true;
      $('answer').hidden = false;
      $('reveal').setAttribute('aria-expanded', 'true');
      // Keep the reveal control in place to preserve keyboard focus.
      $('reveal').textContent = 'Answer revealed';
    }
    function renderCard(focus = false, message = '') {
      $('reveal').textContent = 'Reveal answer';
      render(focus, message);
    }
    function rate(rating) {
      const card = queue[index];
      if (!card || !revealed) return;
      states[card.id] = core.rate(states[card.id], rating, Date.now());
      save();
      if ($('review-mode').value === 'due') {
        queue.splice(index, 1);
        index = Math.max(0, Math.min(index, queue.length - 1));
      } else index = (index + 1) % queue.length;
      renderCard(true, `${rating === 'again' ? 'Retry scheduled' : 'Review scheduled'} for ${dateLabel(states[card.id].due)}.`);
    }
    function move(offset) {
      const next = index + offset;
      if (next < 0 || next >= queue.length) return;
      index = next;
      renderCard(true);
    }
    $('reveal').addEventListener('click', reveal);
    $('again').addEventListener('click', () => rate('again'));
    $('remembered').addEventListener('click', () => rate('remembered'));
    $('previous').addEventListener('click', () => move(-1));
    $('next').addEventListener('click', () => move(1));
    for (const id of ['review-mode', 'topic']) $(id).addEventListener('change', () => { rebuild(); renderCard(); });
    $('shuffle').addEventListener('click', () => {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
      index = 0;
      renderCard(true);
    });
    $('reset-reviews').addEventListener('click', () => {
      if (!window.confirm('Reset review dates for all cards? This does not change your lessons or learning records.')) return;
      states = {};
      save();
      rebuild();
      renderCard(false, 'All review dates reset.');
    });
    document.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat ||
        event.target.closest('input, select, textarea, [contenteditable]')) return;
      if (event.key === ' ' && event.target.closest('button, a, summary')) return;
      if (event.key === ' ') { event.preventDefault(); reveal(); }
      if (event.key === '1') rate('again');
      if (event.key === '2') rate('remembered');
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    // Bring newly due cards into a waiting empty queue, without disturbing an active card.
    setInterval(() => {
      if (!queue.length && $('review-mode').value === 'due') { rebuild(); renderCard(); }
    }, 30000);
    rebuild();
    renderCard();
  }
  if (document.body.dataset.page === 'dashboard') dashboard();
  if (document.body.dataset.page === 'flashcards') flashcards();
})();
