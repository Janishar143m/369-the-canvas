// ========================================
// 369 THE CANVAS - MAIN SCRIPT
// ========================================

// ---------- Mobile Menu ----------
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(opened));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}


// ---------- Gallery ----------
const gallery = document.querySelector("#gallery");
const cards = gallery
  ? Array.from(gallery.querySelectorAll(".art-card"))
  : [];


// ---------- Category Filter ----------
const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {

    // Active button
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const category = button.dataset.filter;

    // Show / hide artwork cards
    cards.forEach(card => {
      const cardCategory = card.dataset.category;

      if (category === "all" || cardCategory === category) {
        card.hidden = false;
      } else {
        card.hidden = true;
      }
    });

    // IMPORTANT:
    // Reset carousel to the first image of the selected category
    if (gallery) {
      gallery.scrollTo({
        left: 0,
        behavior: "smooth"
      });
    }
  });
});


// ---------- Carousel ----------
const previousButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");

function getVisibleCards() {
  return cards.filter(card => !card.hidden);
}

function goToCard(direction) {

  if (!gallery) return;

  const visible = getVisibleCards();

  if (visible.length === 0) return;

  // Find the card currently closest to the center
  const galleryCenter =
    gallery.scrollLeft + gallery.clientWidth / 2;

  let currentIndex = 0;
  let closestDistance = Infinity;

  visible.forEach((card, index) => {

    const cardCenter =
      card.offsetLeft + card.offsetWidth / 2;

    const distance =
      Math.abs(cardCenter - galleryCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      currentIndex = index;
    }
  });

  let targetIndex = currentIndex + direction;

  // Keep within category
  if (targetIndex < 0) {
    targetIndex = 0;
  }

  if (targetIndex >= visible.length) {
    targetIndex = visible.length - 1;
  }

  const target = visible[targetIndex];

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
}


// Previous
if (previousButton) {
  previousButton.addEventListener("click", () => {
    goToCard(-1);
  });
}


// Next
if (nextButton) {
  nextButton.addEventListener("click", () => {
    goToCard(1);
  });
}


// ---------- Mouse Wheel Scrolling ----------
if (gallery) {

  gallery.addEventListener(
    "wheel",
    event => {

      // Convert vertical mouse wheel movement
      // into horizontal gallery scrolling
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {

        event.preventDefault();

        gallery.scrollBy({
          left: event.deltaY,
          behavior: "auto"
        });
      }

    },
    { passive: false }
  );
}


// ---------- Lightbox ----------
const lightbox = document.querySelector("#lightbox");

if (lightbox) {

  const lightboxImg = lightbox.querySelector("img");
  const caption = lightbox.querySelector("figcaption");

  let lightboxIndex = 0;

  function getLightboxCards() {
    return getVisibleCards();
  }

  function showLightboxCard(index) {

    const visible = getLightboxCards();

    if (!visible.length) return;

    lightboxIndex =
      (index + visible.length) % visible.length;

    const card = visible[lightboxIndex];

    const image = card.querySelector("img");

    if (image) {
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
    }

    if (caption) {
      caption.textContent =
        `${card.dataset.title || ""} — ${card.dataset.caption || ""}`;
    }
  }

  function openLightbox(card) {

    const visible = getLightboxCards();

    const index = visible.indexOf(card);

    showLightboxCard(index);

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const closeButton =
      lightbox.querySelector(".lightbox-close");

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeLightbox() {

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
  }


  // Open artwork
  cards.forEach(card => {

    card.addEventListener("click", () => {
      openLightbox(card);
    });

  });


  // Close
  const closeButton =
    lightbox.querySelector(".lightbox-close");

  if (closeButton) {
    closeButton.addEventListener("click", closeLightbox);
  }


  // Lightbox previous
  const lightboxPrevious =
    lightbox.querySelector(".lightbox-prev");

  if (lightboxPrevious) {
    lightboxPrevious.addEventListener("click", () => {
      showLightboxCard(lightboxIndex - 1);
    });
  }


  // Lightbox next
  const lightboxNext =
    lightbox.querySelector(".lightbox-next");

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
      showLightboxCard(lightboxIndex + 1);
    });
  }


  // Click outside image
  lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
      closeLightbox();
    }

  });


  // Keyboard controls
  document.addEventListener("keydown", event => {

    if (!lightbox.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showLightboxCard(lightboxIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showLightboxCard(lightboxIndex + 1);
    }

  });

}


// ---------- Footer Year ----------
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}