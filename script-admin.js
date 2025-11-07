import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("cardForm");
const statusMsg = document.getElementById("statusMsg");
const cardList = document.getElementById("cardList");
const submitBtn = document.getElementById("submitBtn");
const docIdInput = document.getElementById("docId");

async function loadCards() {
  cardList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "card"));

  const cards = [];
  querySnapshot.forEach((docSnap) => {
    cards.push({ id: docSnap.id, ...docSnap.data() });
  });

  cards.sort((a, b) => {
    const idA = a["card-id"] || "";
    const idB = b["card-id"] || "";

    const [, prefixA, numA] = idA.match(/^([A-Za-z]+)?(\d+)?$/) || [
      "",
      "",
      "0",
    ];
    const [, prefixB, numB] = idB.match(/^([A-Za-z]+)?(\d+)?$/) || [
      "",
      "",
      "0",
    ];

    if (prefixA < prefixB) return -1;
    if (prefixA > prefixB) return 1;
    return parseInt(numA) - parseInt(numB);
  });

  cards.forEach((dataObj) => {
    const tags = (dataObj["card-tag"] || []).join(", ");
    const rarity = dataObj["card-rarity"] || "-";

    const cardDiv = document.createElement("div");
    cardDiv.className =
      "glass border border-gray-700 rounded-xl p-3 hover:border-gray-500 transition";
    cardDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${dataObj["card-img"]}" alt="${dataObj["card-name"]}" class="w-16 h-16 rounded-md object-cover border border-gray-700">
        <div class="flex-1">
          <h3 class="font-semibold text-base">${dataObj["card-name"]}</h3>
          <p class="text-sm text-gray-400">${tags}</p>
          <p class="text-xs text-gray-500 italic">${rarity}</p>
        </div>
      </div>
      <div class="flex justify-between items-center mt-3">
        <span class="text-xs text-gray-400">${dataObj["card-id"]}</span>
        <div class="flex gap-2">
          <button class="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs" data-id="${dataObj.id}" data-action="edit">Edit</button>
          <button class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs" data-id="${dataObj.id}" data-action="delete">Delete</button>
        </div>
      </div>
    `;
    cardList.appendChild(cardDiv);
  });
}

async function saveCard(e) {
  e.preventDefault();

  const id = document.getElementById("cardId").value.trim();
  const name = document.getElementById("cardName").value.trim();
  const img = document.getElementById("cardImg").value.trim();
  const tagInput = document.getElementById("cardTag").value.trim();
  const rarity = document.getElementById("cardRarity").value.trim();
  const expansion = document.getElementById("cardExp").value.trim();
  const tags = tagInput
    ? tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const scrollPos = window.scrollY;

  try {
    if (docIdInput.value) {
      const docRef = doc(db, "card", docIdInput.value);
      await updateDoc(docRef, {
        "card-id": id,
        "card-name": name,
        "card-img": img,
        "card-tag": tags,
        "card-rarity": rarity,
        "card-exp": expansion,
      });
      statusMsg.textContent = "Data is Updated";
      statusMsg.className = "text-green-400 mt-2";
    } else {
      await addDoc(collection(db, "card"), {
        "card-id": id,
        "card-name": name,
        "card-img": img,
        "card-tag": tags,
        "card-rarity": rarity,
        "card-exp": expansion,
      });
      statusMsg.textContent = "Data is Saved";
      statusMsg.className = "text-green-400 mt-2";
    }

    form.reset();
    docIdInput.value = "";
    submitBtn.textContent = "Saved to Firestore";

    await loadCards();

    window.scrollTo(0, scrollPos);
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Error: " + err.message;
    statusMsg.className = "text-red-400 mt-2";
  }
}

form.addEventListener("submit", saveCard);

cardList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  const action = e.target.dataset.action;
  if (!id || !action) return;

  if (action === "edit") {
    const querySnapshot = await getDocs(collection(db, "card"));
    querySnapshot.forEach((d) => {
      if (d.id === id) {
        const data = d.data();
        document.getElementById("cardId").value = data["card-id"] || "";
        document.getElementById("cardName").value = data["card-name"] || "";
        document.getElementById("cardImg").value = data["card-img"] || "";
        document.getElementById("cardTag").value = (
          data["card-tag"] || []
        ).join(", ");
        document.getElementById("cardExp").value = data["card-exp"] || "";
        document.getElementById("cardRarity").value =
          data["card-rarity"] || "Art Rare";
        docIdInput.value = id;
        submitBtn.textContent = "Update Data";
        statusMsg.textContent = "Editing Data...";
        statusMsg.className = "text-yellow-400 mt-2";
      }
    });
  } else if (action === "delete") {
    if (confirm("Are you sure to delete this data?")) {
      await deleteDoc(doc(db, "card", id));
      loadCards();
    }
  }
});

loadCards();
