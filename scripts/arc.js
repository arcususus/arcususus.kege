async function fetchVariant(variantId) {
  const keysList = document.getElementById('keysList');
  const statsDiv = document.getElementById('stats-wrap');

  statsDiv.innerHTML = '';
  keysList.innerHTML = '<p>Загрузка...</p>';

  try {
    const response = await fetch(`https://kege-bot-arc.amvera.io/api/variant/${variantId}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Проверка структуры ответа
    if (!data.data || !data.variant_id) {
      throw new Error('Invalid response format');
    }

    const data_len = data.data.length

    statsDiv.innerHTML = `
    <div class="stats">
      <h3>Статистика варианта: ${escapeHtml(data.variant_id)}</h3>
      <p>Всего задач: ${data.data.length}</p>
    </div>
    `;

    if (data.data.length > 0) {
      keysList.innerHTML = `
      ${data.data.map((key, index) => `
        <div class="key-item">
          <span class="key-number">${index + 1})</span>
          <span class="key-desc">Задача ${escapeHtml(key.number || '')}: <p>${escapeHtml(key.text || 'Нет описания')}</p></span>
          <span class="key-value">${escapeHtml(key.key || '')}</span>
        </div>
      `).join('')}
      `;
    } else {
      keysList.innerHTML = '<p>Ключи не найдены</p>';
    }

    return data.data;

    // Функция для защиты от XSS
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

  } catch (error) {
    statsDiv.innerHTML = '';
    keysList.innerHTML = '';
    console.error('Fetch error:', error);

    // Пользовательские сообщения
    if (error.message.includes('429')) {
      alert('Слишком много запросов. Подождите немного.');
    } else if (error.message.includes('404')) {
      alert('Вариант не найден.');
    } else if (error.message.includes('network')) {
      alert('Проблемы с сетью. Проверьте подключение.');
    } else {
      alert(`Ошибка: ${error.message}`);
    }

    // Возвращаем мок-данные для разработки
    return getMockData(variantId);
  }
}