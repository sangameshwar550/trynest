/**
 * trynest — Site Configuration
 * ------------------------------------------------------
 * Edit the values below to update business info across
 * BOTH pages (index.html and contact.html) automatically.
 * No need to touch the HTML files for these fields.
 * ------------------------------------------------------
 */
const TRYNEST_CONFIG = {
  brand: {
    name: "trynest",
    tagline: "Play. Learn. Grow.",
  },

  contact: {
    phoneDisplay: "+91 89774 49868",
    phoneHref: "tel:+918977449868",
    email: "trynest.3@gmail.com",
    emailHref: "mailto:trynest.3@gmail.com",
    address: "201, Gokul Trade Center, Gokul Plots, Kukatpally Housing Board Colony, Vasanth Nagar, Hyderabad, Telangana 500085",
    mapLink: "https://maps.app.goo.gl/3u1g2an4Ty1UfMNg9",
    hours: "Open all days: 8:30 AM – 9:00 PM",
    whatsappHref: "https://wa.me/918977449868",
    mapEmbedSrc: "https://www.google.com/maps?q=Try+Nest+playzone&ll=17.4852524,78.3813532&z=17&output=embed",
  },

  social: {
    instagram: "#",
    facebook: "#",
    whatsapp: "https://wa.me/918977449868",
  },
};

/**
 * Auto-populate every element tagged with data-config="path.to.value"
 * and every link tagged with data-config-href="path.to.value".
 * This keeps contact details in sync across the whole site.
 */
function applyTryNestConfig() {
  const get = (path) =>
    path.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), TRYNEST_CONFIG);

  document.querySelectorAll("[data-config]").forEach((el) => {
    const value = get(el.getAttribute("data-config"));
    if (value !== undefined) el.textContent = value;
  });

  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const value = get(el.getAttribute("data-config-href"));
    if (value !== undefined) el.setAttribute("href", value);
  });

  const mapFrame = document.getElementById("map-embed");
  const mapPlaceholder = document.getElementById("map-placeholder");
  if (mapFrame && TRYNEST_CONFIG.contact.mapEmbedSrc) {
    mapFrame.setAttribute("src", TRYNEST_CONFIG.contact.mapEmbedSrc);
    mapFrame.style.display = "block";
    if (mapPlaceholder) mapPlaceholder.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", applyTryNestConfig);
