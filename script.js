const STORAGE_KEY = 'contactsList';

function loadContacts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function validateContact({ name, vacancy, phone }) {
  const nameValid = /^[А-ЯA-Z][а-яa-z]{1,}/.test(name.trim());
  const vacancyValid = /^[А-ЯA-Z][а-яa-z]{1,}/.test(vacancy.trim());
  const phoneValid = /^\+\d \d{3} \d{3} \d{2} \d{2}$/.test(phone.trim());
  if (!name || !vacancy || !phone) return 'Все поля обязательны!';
  if (!nameValid) return 'Имя должно начинаться с буквы и быть не короче 2 символов';
  if (!vacancyValid) return 'Должность должна начинаться с буквы и быть не короче 2 символов';
  if (!phoneValid) return 'Телефон должен быть в формате +X XXX XXX XX XX';
  return '';
}

function uuid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

const nameInput = document.getElementById('name');
const vacancyInput = document.getElementById('vacancy');
const phoneInput = document.getElementById('phone');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const searchBtn = document.getElementById('searchBtn');
const lettersDiv = document.getElementById('letters');
const contactsDiv = document.getElementById('contacts');
const modal = document.getElementById('modal');

let contacts = loadContacts();
let currentLetter = null;

function renderLetters() {
  const groups = {};
  contacts.forEach(c => {
    const letter = c.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });
  const allLetters = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  lettersDiv.innerHTML = '';
  allLetters.forEach(letter => {
    const count = groups[letter]?.length || 0;
    const el = document.createElement('div');
    el.className = 'letter-group';
    el.textContent = count ? `${letter} (${count})` : letter;
    el.style.opacity = count ? '1' : '0.4';
    el.onclick = () => {
      currentLetter = letter;
      renderContacts();
    };
    lettersDiv.appendChild(el);
  });
}

function renderContacts() {
  contactsDiv.innerHTML = '';
  if (!currentLetter) return;
  const filtered = contacts.filter(c => c.name[0].toUpperCase() === currentLetter);
  if (!filtered.length) {
    contactsDiv.innerHTML = '<div>Нет контактов для этой буквы</div>';
    return;
  }
  filtered.forEach(contact => {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <div class="contact-info">
        <div><b>${contact.name}</b></div>
        <div>${contact.vacancy}</div>
        <div>${contact.phone}</div>
      </div>
      <div class="contact-actions">
        <button title="Изменить" onclick="editContact('${contact.id}')">✏️</button>
        <button title="Удалить" onclick="deleteContact('${contact.id}')">🗑️</button>
      </div>
    `;
    contactsDiv.appendChild(card);
  });
}

addBtn.onclick = () => {
  const name = nameInput.value.trim();
  const vacancy = vacancyInput.value.trim();
  const phone = phoneInput.value.trim();
  const error = validateContact({ name, vacancy, phone });
  if (error) {
    showModal(`<div>${error}</div><button onclick="closeModal()">OK</button>`);
    return;
  }
  contacts.push({ id: uuid(), name, vacancy, phone });
  saveContacts(contacts);
  nameInput.value = vacancyInput.value = phoneInput.value = '';
  renderLetters();
  if (currentLetter === name[0].toUpperCase()) renderContacts();
};

window.deleteContact = function(id) {
  contacts = contacts.filter(c => c.id !== id);
  saveContacts(contacts);
  renderLetters();
  renderContacts();
};

window.editContact = function(id) {
  const contact = contacts.find(c => c.id === id);
  showModal(`
    <div class="modal-content">
      <h3>Изменить контакт</h3>
      <input id="editName" value="${contact.name}" placeholder="Имя"><br><br>
      <input id="editVacancy" value="${contact.vacancy}" placeholder="Должность"><br><br>
      <input id="editPhone" value="${contact.phone}" placeholder="Телефон"><br><br>
      <button onclick="saveEdit('${id}')">Сохранить</button>
      <button onclick="closeModal()">Отмена</button>
    </div>
  `);
};

window.saveEdit = function(id) {
  const name = document.getElementById('editName').value.trim();
  const vacancy = document.getElementById('editVacancy').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const error = validateContact({ name, vacancy, phone });
  if (error) {
    showModal(`<div>${error}</div><button onclick=\"closeModal()\">OK</button>`);
    return;
  }
  contacts = contacts.map(c => c.id === id ? { ...c, name, vacancy, phone } : c);
  saveContacts(contacts);
  closeModal();
  renderLetters();
  renderContacts();
};

clearBtn.onclick = () => {
  if (confirm('Удалить все контакты?')) {
    contacts = [];
    saveContacts(contacts);
    renderLetters();
    contactsDiv.innerHTML = '';
    currentLetter = null;
  }
};

searchBtn.onclick = () => {
  showModal(`
    <div class="modal-content">
      <h3>Поиск контактов</h3>
      <input id="searchInput" placeholder="Введите имя, должность или телефон" oninput="searchContacts()">
      <div id="searchResults"></div>
      <button onclick="closeModal()">Закрыть</button>
    </div>
  `);
};

window.searchContacts = function() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  if (!query) {
    resultsDiv.innerHTML = '';
    return;
  }
  const found = contacts.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.vacancy.toLowerCase().includes(query) ||
    c.phone.toLowerCase().includes(query)
  );
  if (!found.length) {
    resultsDiv.innerHTML = '<div>Ничего не найдено</div>';
    return;
  }
  resultsDiv.innerHTML = found.map(c => `
    <div class="contact-card" style="margin: 10px auto;">
      <div class="contact-info">
        <div><b>${c.name}</b></div>
        <div>${c.vacancy}</div>
        <div>${c.phone}</div>
      </div>
      <div class="contact-actions">
        <button title="Изменить" onclick="editContact('${c.id}')">✏️</button>
        <button title="Удалить" onclick="deleteContact('${c.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
};

function showModal(html) {
  modal.innerHTML = `<div class="modal-content">${html}</div>`;
  modal.classList.remove('hidden');
}

window.closeModal = function() {
  modal.classList.add('hidden');
  modal.innerHTML = '';
  renderLetters();
  renderContacts();
};

renderLetters(); 