import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const toggle = document.getElementById('toggleDark');

toggle?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    document.body.classList.remove('bg-white');
    document.body.classList.add('bg-gray-900', 'text-gray-100');
  } else {
    document.body.classList.remove('bg-gray-900', 'text-gray-100');
    document.body.classList.add('bg-white');
  }
});
// -------------------------------


async function loadAllTags() {
  const container = document.querySelector("#tag-container"); // div tempat menampilkan box
  const querySnapshot = await getDocs(collection(db, "card"));

  const allTags = new Set();

  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (Array.isArray(data["card-tag"])) {
      data["card-tag"].forEach(tag => allTags.add(tag));
    }
  });

  allTags.forEach(tag => {
    const div = document.createElement("div");
    div.className = "px-3 py-1 bg-gray-800 text-gray-100 rounded-md text-sm m-1 inline-block hover:bg-gray-700 transition";
    div.textContent = tag;
    container.appendChild(div);
  });

  console.log("Tag berhasil dimuat:", [...allTags]);
}

loadAllTags();

// --------------------------------

async function tampilkanCard() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "card"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    let tagsHTML = "";
    if (Array.isArray(data["card-tag"])) {
      tagsHTML = data["card-tag"]
        .map(
          (tag) => `
          <span class="px-2 py-1 text-xs bg-gray-800 text-gray-200 rounded-md border border-gray-600">
            ${tag}
          </span>`
        )
        .join(" ");
    }

    const cardHTML = `
      <article class="p-4 rounded-2xl glass border border-gray-700 shadow-sm hover:shadow-md transition">
        <div
          class="h-58 rounded-md bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden"
        >
          <img src="${data["card-img"]}" alt="${data["card-name"]}" class="object-cover h-full w-full" />
        </div>
        <h3 class="mt-3 font-medium text-lg">${data["card-name"]}</h3>
        <div class="flex flex-wrap gap-2 mt-2">
          ${tagsHTML}
        </div>
      </article>
    `;

    cardContainer.innerHTML += cardHTML;
  });
}

tampilkanCard();

const cardContainer = document.getElementById("cardContainer");
const tagContainer = document.getElementById("tag-container");

let allCards = [];
let activeTags = new Set(); 

async function loadCards() {
  const snapshot = await getDocs(collection(db, "card"));
  allCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTags();
  renderCards(allCards);
}

function renderTags() {
  const allTags = new Set();
  allCards.forEach(card => {
    (card["card-tag"] || []).forEach(tag => allTags.add(tag));
  });

  tagContainer.innerHTML = "";
  allTags.forEach(tag => {
    const tagBtn = document.createElement("button");
    tagBtn.textContent = tag;
    tagBtn.className = "px-3 py-1 rounded-full border border-gray-700 text-sm hover:bg-gray-800 transition";
    tagBtn.addEventListener("click", () => toggleTag(tagBtn, tag));
    tagContainer.appendChild(tagBtn);
  });
}

function toggleTag(button, tag) {
  if (activeTags.has(tag)) {
    activeTags.delete(tag);
    button.classList.remove("bg-blue-800");
    button.classList.add("border-gray-700");
  } else {
    activeTags.add(tag);
    button.classList.add("bg-blue-800");
    button.classList.remove("border-gray-700");
  }
  filterCards();
}

function filterCards() {
  if (activeTags.size === 0) {
    renderCards(allCards);
    return;
  }

  const filtered = allCards.filter(card =>
    (card["card-tag"] || []).some(tag => activeTags.has(tag))
  );
  renderCards(filtered);
}

function renderCards(cards) {
  cardContainer.innerHTML = "";
  if (cards.length === 0) {
    cardContainer.innerHTML = `<p class='col-span-full text-center text-gray-400'>Tidak ada kartu yang cocok.</p>`;
    return;
  }

  cards.forEach(card => {
    const tags = (card["card-tag"] || []).map(t => `<span class="text-xs bg-gray-800 px-2 py-1 rounded">${t}</span>`).join(" ");
    const rarity = card["card-rarity"] || "-";

    const cardDiv = document.createElement("div");
    cardDiv.className = "glass border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition p-3";
    cardDiv.innerHTML = `
      <img src="${card["card-img"]}" alt="${card["card-name"]}" class="w-full h-40 object-cover rounded-md mb-3 border border-gray-700">
      <h3 class="font-semibold text-base mb-1">${card["card-name"]}</h3>
      <p class="text-xs text-gray-400 mb-2 italic">${rarity}</p>
      <div class="flex flex-wrap gap-1">${tags}</div>
    `;
    cardContainer.appendChild(cardDiv);
  });
}

loadCards();







