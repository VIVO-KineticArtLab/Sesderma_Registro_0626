import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firebaseConfig, registrationsCollection } from "./firebase-config.js";

const screens = [...document.querySelectorAll("[data-screen]")];
const form = document.querySelector("#registrationForm");
const formError = document.querySelector("#formError");
const consentModal = document.querySelector("#consentModal");
const privacyConsent = document.querySelector("#privacyConsent");
const marketingConsent = document.querySelector("#marketingConsent");
const consentError = document.querySelector("#consentError");
const acceptConsent = document.querySelector("#acceptConsent");
const storageKey = "sesderma_registros";
const submitButton = form.querySelector('[type="submit"]');
const privacyNoticeVersion = "sesderma-event-2026-06-27";

let consentAccepted = false;
let consentAcceptedAt = "";

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const db = hasFirebaseConfig ? getFirestore(initializeApp(firebaseConfig)) : null;

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  window.scrollTo({ top: 0, behavior: "instant" });

  if (name === "form" && !consentAccepted) {
    openConsentModal();
  }
}

function openConsentModal() {
  consentModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeConsentModal() {
  consentModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function saveLocalRegistration(data) {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  saved.push(data);
  localStorage.setItem(storageKey, JSON.stringify(saved));
}

async function saveRegistration(data) {
  const payload = {
    ...data,
    privacyConsent: consentAccepted,
    marketingConsent: marketingConsent.checked,
    consentAcceptedAt,
    privacyNoticeVersion,
    registeredAt: new Date().toISOString(),
    source: "landing-sesderma",
  };

  saveLocalRegistration(payload);

  if (!db) {
    return { savedInFirebase: false };
  }

  await addDoc(collection(db, registrationsCollection), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return { savedInFirebase: true };
}

function getFormData(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

function setInvalidState(input, isInvalid) {
  input.classList.toggle("is-invalid", isInvalid);
  input.setAttribute("aria-invalid", String(isInvalid));
}

function validateForm() {
  let firstInvalidInput = null;
  formError.textContent = "";

  [...form.elements].forEach((element) => {
    if (!(element instanceof HTMLInputElement)) return;

    const isInvalid = !element.checkValidity();
    setInvalidState(element, isInvalid);

    if (isInvalid && !firstInvalidInput) {
      firstInvalidInput = element;
    }
  });

  if (firstInvalidInput) {
    formError.textContent = "Completa los datos para continuar.";
    firstInvalidInput.focus();
    return false;
  }

  return true;
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go]");
  if (!trigger) return;

  showScreen(trigger.dataset.go);
});

acceptConsent.addEventListener("click", () => {
  if (!privacyConsent.checked) {
    consentError.textContent = "Debes aceptar el uso de datos para continuar con el registro.";
    return;
  }

  consentAccepted = true;
  consentAcceptedAt = new Date().toISOString();
  consentError.textContent = "";
  closeConsentModal();
});

privacyConsent.addEventListener("change", () => {
  if (privacyConsent.checked) {
    consentError.textContent = "";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!consentAccepted) {
    openConsentModal();
    return;
  }

  if (!validateForm()) return;

  submitButton.disabled = true;

  try {
    await saveRegistration(getFormData(form));
    form.reset();
    showScreen("thanks");
  } catch (error) {
    console.error(error);
    formError.textContent =
      error.code === "permission-denied"
        ? "Falta actualizar permisos de registro. Intenta de nuevo mas tarde."
        : "No pudimos guardar el registro. Intenta de nuevo.";
  } finally {
    submitButton.disabled = false;
  }
});

form.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;

  setInvalidState(event.target, false);
  formError.textContent = "";
});
