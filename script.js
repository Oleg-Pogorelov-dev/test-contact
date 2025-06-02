"use strict";
const STORAGE_KEY = 'contactsList';
function loadContacts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}
function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}
function validateContact({ name, vacancy, phone }) {
    const nameValid = /^[А-ЯA-Z][а-яa-z]{1,}/.test((name || '').trim());
    const vacancyValid = /^[А-ЯA-Z][а-яa-z]{1,}/.test((vacancy || '').trim());
    const phoneValid = /^\+\d \d{3} \d{3} \d{2} \d{2}$/.test((phone || '').trim());
    if (!name || !vacancy || !phone)
        return 'Все поля обязательны!';
    if (!nameValid)
        return 'Имя должно начинаться с буквы и быть не короче 2 символов';
    if (!vacancyValid)
        return 'Должность должна начинаться с буквы и быть не короче 2 символов';
    if (!phoneValid)
        return 'Телефон должен быть в формате +X XXX XXX XX XX';
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
    if (!lettersDiv)
        return;
    const groups = {};
    contacts.forEach(c => {
        const letter = c.name[0].toUpperCase();
        if (!groups[letter])
            groups[letter] = [];
        groups[letter].push(c);
    });
    const allLetters = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    lettersDiv.innerHTML = '';
    allLetters.forEach(letter => {
        var _a;
        const count = ((_a = groups[letter]) === null || _a === void 0 ? void 0 : _a.length) || 0;
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
    if (!contactsDiv)
        return;
    contactsDiv.innerHTML = '';
    if (!currentLetter)
        return;
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
        <button title="Изменить" data-edit="${contact.id}">✏️</button>
        <button title="Удалить" data-delete="${contact.id}">🗑️</button>
      </div>
    `;
        contactsDiv.appendChild(card);
    });
}
if (addBtn && nameInput && vacancyInput && phoneInput) {
    addBtn.onclick = () => {
        const name = typeof nameInput.value === 'string' ? nameInput.value.trim() : '';
        const vacancy = typeof vacancyInput.value === 'string' ? vacancyInput.value.trim() : '';
        const phone = typeof phoneInput.value === 'string' ? phoneInput.value.trim() : '';
        const error = validateContact({ name, vacancy, phone });
        if (error) {
            showModal(`<div>${error}</div><button onclick=\"closeModal()\">OK</button>`);
            return;
        }
        contacts.push({ id: uuid(), name, vacancy, phone });
        saveContacts(contacts);
        nameInput.value = vacancyInput.value = phoneInput.value = '';
        renderLetters();
        if (currentLetter === name[0].toUpperCase())
            renderContacts();
    };
}
if (contactsDiv) {
    contactsDiv.onclick = (e) => {
        const target = e.target;
        if (target.dataset.edit) {
            editContact(target.dataset.edit);
        }
        else if (target.dataset.delete) {
            deleteContact(target.dataset.delete);
        }
    };
}
function deleteContact(id) {
    contacts = contacts.filter(c => c.id !== id);
    saveContacts(contacts);
    renderLetters();
    renderContacts();
}
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact)
        return;
    showModal(`
    <div class="modal-content">
      <h3>Изменить контакт</h3>
      <input id="editName" value="${contact.name}" placeholder="Имя"><br><br>
      <input id="editVacancy" value="${contact.vacancy}" placeholder="Должность"><br><br>
      <input id="editPhone" value="${contact.phone}" placeholder="Телефон"><br><br>
      <button id="saveEditBtn">Сохранить</button>
      <button onclick="closeModal()">Отмена</button>
    </div>
  `);
    setTimeout(() => {
        const saveBtn = document.getElementById('saveEditBtn');
        if (saveBtn)
            saveBtn.onclick = () => saveEdit(id);
    }, 0);
}
function saveEdit(id) {
    const nameEl = document.getElementById('editName');
    const vacancyEl = document.getElementById('editVacancy');
    const phoneEl = document.getElementById('editPhone');
    const name = nameEl && 'value' in nameEl ? nameEl.value.trim() : '';
    const vacancy = vacancyEl && 'value' in vacancyEl ? vacancyEl.value.trim() : '';
    const phone = phoneEl && 'value' in phoneEl ? phoneEl.value.trim() : '';
    const error = validateContact({ name, vacancy, phone });
    if (error) {
        showModal(`<div>${error}</div><button onclick=\"closeModal()\">OK</button>`);
        return;
    }
    contacts = contacts.map(c => c.id === id ? Object.assign(Object.assign({}, c), { name, vacancy, phone }) : c);
    saveContacts(contacts);
    closeModal();
    renderLetters();
    renderContacts();
}
if (clearBtn && contactsDiv) {
    clearBtn.onclick = () => {
        if (confirm('Удалить все контакты?')) {
            contacts = [];
            saveContacts(contacts);
            renderLetters();
            contactsDiv.innerHTML = '';
            currentLetter = null;
        }
    };
}
if (searchBtn) {
    searchBtn.onclick = () => {
        showModal(`
      <div class="modal-content">
        <h3>Поиск контактов</h3>
        <input id="searchInput" placeholder="Введите имя, должность или телефон">
        <div id="searchResults"></div>
        <button onclick="closeModal()">Закрыть</button>
      </div>
    `);
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput)
                searchInput.oninput = searchContacts;
        }, 0);
    };
}
function searchContacts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput && 'value' in searchInput ? searchInput.value.trim().toLowerCase() : '';
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv)
        return;
    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }
    const found = contacts.filter(c => c.name.toLowerCase().includes(query) ||
        c.vacancy.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query));
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
        <button title="Изменить" data-edit="${c.id}">✏️</button>
        <button title="Удалить" data-delete="${c.id}">🗑️</button>
      </div>
    </div>
  `).join('');
}
function showModal(html) {
    if (!modal)
        return;
    modal.innerHTML = `<div class="modal-content">${html}</div>`;
    modal.classList.remove('hidden');
}
function closeModal() {
    if (!modal)
        return;
    modal.classList.add('hidden');
    modal.innerHTML = '';
}
// Инициализация
renderLetters();
