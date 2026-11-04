(function () {
  'use strict';

  const data = window.BOOKS_DATA;
  const timeline = document.getElementById('timeline');
  const filters = document.getElementById('filters');
  const stats = document.getElementById('stats');
  const generated = document.getElementById('generated');

  if (!data || !Array.isArray(data.days) || data.days.length === 0) {
    timeline.innerHTML = '<p class="empty">还没有任何笔记。</p>';
    return;
  }

  const totalEntries = data.days.reduce((sum, day) => sum + day.entries.length, 0);
  stats.textContent = `${data.books.length} 本书 · ${data.days.length} 天 · ${totalEntries} 篇`;

  const bookMap = new Map(data.books.map((book) => [book.id, book]));

  function makeChip(label, value, active) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip' + (active ? ' active' : '');
    button.dataset.filter = value;
    button.textContent = label;
    return button;
  }

  filters.appendChild(makeChip('全部', 'all', true));
  data.days.forEach((day) => {
    filters.appendChild(makeChip(day.label, day.date, false));
  });

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;

    const value = button.dataset.filter;
    filters.querySelectorAll('button').forEach((item) => {
      item.classList.toggle('active', item === button);
    });
    timeline.querySelectorAll('.day').forEach((section) => {
      section.hidden = value !== 'all' && section.dataset.date !== value;
    });
  });

  data.days.forEach((day, dayIndex) => {
    const section = document.createElement('section');
    section.className = 'day';
    section.dataset.date = day.date;

    const title = document.createElement('h2');
    title.className = 'day-title';
    title.textContent = day.label;
    section.appendChild(title);

    day.entries.forEach((entry) => {
      const book = bookMap.get(entry.bookId) || { color: 'var(--border)' };
      const details = document.createElement('details');
      details.className = 'entry';
      // 最新一天默认展开，其余日期折叠
      if (dayIndex === 0) details.open = true;

      const summary = document.createElement('summary');
      summary.style.setProperty('--book-color', book.color);

      const name = document.createElement('span');
      name.className = 'book-name';
      name.textContent = entry.bookName;
      summary.appendChild(name);

      if (entry.headings.length > 0) {
        const hint = document.createElement('span');
        hint.className = 'entry-hint';
        hint.textContent = entry.headings.join(' · ');
        summary.appendChild(hint);
      }

      const content = document.createElement('div');
      content.className = 'entry-content';
      // 内容来自自己的笔记，构建时已用 markdown-it 转成 HTML
      content.innerHTML = entry.html;

      details.appendChild(summary);
      details.appendChild(content);
      section.appendChild(details);
    });

    timeline.appendChild(section);
  });

  if (data.generatedAt) {
    generated.textContent = `最后构建：${new Date(data.generatedAt).toLocaleString('zh-CN')}`;
  }
})();
