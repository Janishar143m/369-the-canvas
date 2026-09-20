const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(opened));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const cards = [...document.querySelectorAll(".art-card")];
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");
    const category = button.dataset.filter;
    cards.forEach(card => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImg = lightbox.querySelector("img");
const caption = lightbox.querySelector("figcaption");
let currentIndex = 0;
function visibleCards() { return cards.filter(card => !card.hidden); }
function showCard(index) {
  const list = visibleCards();
  currentIndex = (index + list.length) % list.length;
  const card = list[currentIndex];
  lightboxImg.src = card.querySelector("img").src;
  lightboxImg.alt = card.querySelector("img").alt;
  caption.textContent = `${card.dataset.title} — ${card.dataset.caption}`;
}
function openLightbox(card) {
  const list = visibleCards();
  showCard(list.indexOf(card));
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lightbox-close").focus();
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
cards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showCard(currentIndex - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => showCard(currentIndex + 1));
lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showCard(currentIndex - 1);
  if (event.key === "ArrowRight") showCard(currentIndex + 1);
});
document.querySelector("#year").textContent = new Date().getFullYear();
