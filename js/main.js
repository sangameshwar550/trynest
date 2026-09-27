/**
 * trynest — Site Interactions
 * Mobile nav, active-link highlighting, gallery lightbox,
 * and enquiry form validation + sending enquiries to WhatsApp.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavHighlight();
  initLightbox();
  initForms();
  prefillServiceFromQuery();
});

/* ---------------- Prefill "Service Interested In" from ?service=... ---------------- */
function prefillServiceFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get("service");
  if (!service) return;
  document.querySelectorAll("select[name='service']").forEach((select) => {
    const match = Array.from(select.options).find((opt) => opt.value === service);
    if (match) select.value = service;
  });
}

/* ---------------- Mobile Nav ---------------- */
function initMobileNav() {
  const toggle = document.querySelector(".hamburger");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- Active nav highlight on scroll ---------------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll("main [id]");
  const navLinks = document.querySelectorAll(".main-nav a[href*='#']");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href").endsWith(`#${id}`));
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------- Gallery Lightbox ---------------- */
function initLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const overlay = document.getElementById("lightbox-overlay");
  if (!items.length || !overlay) return;

  const imgEl = overlay.querySelector(".lightbox-img");
  const captionEl = overlay.querySelector(".lightbox-caption");
  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const fullSrc = item.getAttribute("data-full") || item.querySelector("img").src;
    const caption = item.getAttribute("data-caption") || "";
    imgEl.src = fullSrc;
    imgEl.alt = caption;
    captionEl.textContent = caption;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => openAt(index));
  });

  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  overlay.querySelector(".lightbox-prev").addEventListener("click", () => openAt(currentIndex - 1));
  overlay.querySelector(".lightbox-next").addEventListener("click", () => openAt(currentIndex + 1));

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") openAt(currentIndex + 1);
    if (e.key === "ArrowLeft") openAt(currentIndex - 1);
  });
}

/* ---------------- Forms (enquiry) ---------------- */
function initForms() {
  document.querySelectorAll("form[data-enquiry-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        submitForm(form);
      }
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => clearFieldError(field));
      field.addEventListener("change", () => clearFieldError(field));
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    const wrapper = field.closest(".form-field");
    let fieldValid = true;

    if (field.type === "checkbox") {
      fieldValid = field.checked;
    } else {
      fieldValid = field.value.trim().length > 0;
    }

    if (fieldValid && field.type === "email") {
      fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }

    if (fieldValid && field.type === "tel") {
      fieldValid = /^[0-9+\-\s()]{7,20}$/.test(field.value.trim());
    }

    if (!fieldValid) {
      isValid = false;
      showFieldError(wrapper, field.type === "email"
        ? "Please enter a valid email address."
        : field.type === "tel"
        ? "Please enter a valid phone number."
        : "This field is required.");
    } else {
      clearFieldError(field);
    }
  });

  return isValid;
}

function showFieldError(wrapper, message) {
  if (!wrapper) return;
  wrapper.classList.add("invalid");
  const errorEl = wrapper.querySelector(".error-msg");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.remove("invalid");
  const errorEl = wrapper.querySelector(".error-msg");
  if (errorEl) errorEl.textContent = "";
}

/* Sends the enquiry to trynest's WhatsApp: opens a chat with the
   enquiry pre-typed, and the parent taps Send to deliver it. */
function submitForm(form) {
  const lines = ["Hi trynest! New enquiry from the website:", ""];

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    let value = field.value.trim();
    if (!value) return;
    if (field.type === "date") {
      value = new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    }
    const label = form.querySelector(`label[for="${field.id}"]`);
    const name = label ? label.textContent.trim() : field.name;
    lines.push(`*${name}:* ${value}`);
  });

  const waUrl = `${TRYNEST_CONFIG.contact.whatsappHref}?text=${encodeURIComponent(lines.join("\n"))}`;
  const opened = window.open(waUrl, "_blank", "noopener");

  const successEl = form.parentElement.querySelector(".form-success");
  form.reset();
  form.style.display = "none";
  if (successEl) {
    successEl.innerHTML =
      `Almost done! WhatsApp has opened with your enquiry — just tap <strong>Send</strong> to reach us.<br>` +
      `WhatsApp didn't open? <a href="${waUrl}" target="_blank" rel="noopener">Tap here to send your enquiry</a>.`;
    successEl.classList.add("show");
    successEl.setAttribute("tabindex", "-1");
    successEl.focus();
  }

  // Popup blocked (common on some mobile browsers): go to WhatsApp directly.
  if (!opened) window.location.href = waUrl;
}
