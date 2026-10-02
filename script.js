document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  const track = document.querySelector("#gallery");
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");

  const filters = [...document.querySelectorAll(".filter")];
  const cards = [...document.querySelectorAll("#gallery .art-card")];

  let currentIndex = 0;

  /* =========================
     MOBILE NAVIGATION
  ========================= */

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================
     GALLERY HELPERS
  ========================= */

  function getVisibleCards() {
    return cards.filter(
      (card) => !card.classList.contains("category-hidden")
    );
  }

  function scrollToCard(card, behavior = "smooth") {
    if (!track || !card) return;

    track.scrollTo({
      left: card.offsetLeft,
      behavior: behavior
    });
  }

  function setCurrentIndex(index, behavior = "smooth") {
    const visible = getVisibleCards();

    if (!visible.length) {
      currentIndex = 0;
      return;
    }

    currentIndex = Math.max(
      0,
      Math.min(index, visible.length - 1)
    );

    scrollToCard(visible[currentIndex], behavior);
  }

  function updateArrowState() {
    const visible = getVisibleCards();
    const disabled = visible.length <= 1;

    if (prevButton) {
      prevButton.disabled = disabled;
      prevButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );
    }

    if (nextButton) {
      nextButton.disabled = disabled;
      nextButton.setAttribute(
        "aria-disabled",
        String(disabled)
      );
    }
  }

  /* =========================
     CATEGORY FILTER
  ========================= */

  function applyFilter(category) {
    filters.forEach((button) => {
      const active =
        button.dataset.filter === category;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    cards.forEach((card) => {
      const show =
        category === "all" ||
        card.dataset.category === category;

      card.classList.toggle(
        "category-hidden",
        !show
      );

      card.classList.toggle(
        "category-visible",
        show
      );

      card.setAttribute(
        "aria-hidden",
        String(!show)
      );
    });

    currentIndex = 0;

    const visible = getVisibleCards();

    if (visible.length) {
      requestAnimationFrame(() => {
        scrollToCard(
          visible[0],
          "auto"
        );

        updateArrowState();
      });
    } else {
      updateArrowState();
    }
  }

  /* =========================
     FILTER BUTTONS
  ========================= */

  filters.forEach((button) => {
    button.type = "button";

    button.setAttribute(
      "aria-pressed",
      button.classList.contains("active")
        ? "true"
        : "false"
    );

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        applyFilter(
          button.dataset.filter || "all"
        );
      }
    );
  });

  /* =========================
     PREVIOUS / NEXT
  ========================= */

  function moveGallery(direction) {
    const visible = getVisibleCards();

    if (
      !track ||
      visible.length <= 1
    ) {
      return;
    }

    let nextIndex =
      currentIndex + direction;

    if (nextIndex < 0) {
      nextIndex =
        visible.length - 1;
    }

    if (
      nextIndex >= visible.length
    ) {
      nextIndex = 0;
    }

    setCurrentIndex(nextIndex);
  }

  if (prevButton) {
    prevButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        moveGallery(-1);
      }
    );
  }

  if (nextButton) {
    nextButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        moveGallery(1);
      }
    );
  }

  /* =========================
     SWIPE / SCROLL
  ========================= */

  if (track) {
    let scrollTimer;

    track.addEventListener(
      "scroll",
      () => {
        window.clearTimeout(scrollTimer);

        scrollTimer = window.setTimeout(() => {
          const visible =
            getVisibleCards();

          if (!visible.length) return;

          const currentLeft =
            track.scrollLeft;

          let closestIndex = 0;
          let closestDistance =
            Infinity;

          visible.forEach(
            (card, index) => {
              const distance =
                Math.abs(
                  card.offsetLeft -
                  currentLeft
                );

              if (
                distance <
                closestDistance
              ) {
                closestDistance =
                  distance;

                closestIndex =
                  index;
              }
            }
          );

          currentIndex =
            closestIndex;
        }, 80);
      },
      {
        passive: true
      }
    );

    track.addEventListener(
      "wheel",
      (event) => {
        if (
          Math.abs(event.deltaY) >
          Math.abs(event.deltaX)
        ) {
          event.preventDefault();

          track.scrollLeft +=
            event.deltaY;
        }
      },
      {
        passive: false
      }
    );
  }

  /* =========================
     LIGHTBOX
  ========================= */

  const lightbox =
    document.querySelector("#lightbox");

  if (lightbox) {
    const lightboxImg =
      lightbox.querySelector("img");

    const caption =
      lightbox.querySelector(
        "figcaption"
      );

    const closeButton =
      lightbox.querySelector(
        ".lightbox-close"
      );

    const lightboxPrev =
      lightbox.querySelector(
        ".lightbox-prev"
      );

    const lightboxNext =
      lightbox.querySelector(
        ".lightbox-next"
      );

    let lightboxIndex = 0;

    function showLightboxImage(index) {
      const visible =
        getVisibleCards();

      if (
        !visible.length ||
        !lightboxImg
      ) {
        return;
      }

      lightboxIndex =
        (index + visible.length) %
        visible.length;

      const card =
        visible[lightboxIndex];

      const image =
        card.querySelector("img");

      if (!image) return;

      lightboxImg.src =
        image.currentSrc ||
        image.src;

      lightboxImg.alt =
        image.alt || "";

      if (caption) {
        const title =
          card.dataset.title || "";

        const description =
          card.dataset.caption || "";

        caption.textContent =
          description
            ? `${title} — ${description}`
            : title;
      }
    }

    function openLightbox(card) {
      const visible =
        getVisibleCards();

      const index =
        visible.indexOf(card);

      if (index === -1) return;

      showLightboxImage(index);

      lightbox.classList.add(
        "open"
      );

      lightbox.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove(
        "open"
      );

      lightbox.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.style.overflow =
        "";
    }

    cards.forEach((card) => {
      card.type = "button";

      card.addEventListener(
        "click",
        () => {
          if (
            !card.classList.contains(
              "category-hidden"
            )
          ) {
            openLightbox(card);
          }
        }
      );
    });

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeLightbox
      );
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          showLightboxImage(
            lightboxIndex - 1
          );
        }
      );
    }

    if (lightboxNext) {
      lightboxNext.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          showLightboxImage(
            lightboxIndex + 1
          );
        }
      );
    }

    lightbox.addEventListener(
      "click",
      (event) => {
        if (
          event.target === lightbox
        ) {
          closeLightbox();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          !lightbox.classList.contains(
            "open"
          )
        ) {
          return;
        }

        if (
          event.key === "Escape"
        ) {
          closeLightbox();
        }

        if (
          event.key === "ArrowLeft"
        ) {
          showLightboxImage(
            lightboxIndex - 1
          );
        }

        if (
          event.key === "ArrowRight"
        ) {
          showLightboxImage(
            lightboxIndex + 1
          );
        }
      }
    );
  }

  /* =========================
     FOOTER YEAR
  ========================= */

  const year =
    document.querySelector("#year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  /* =========================
     INITIAL GALLERY STATE
  ========================= */

  applyFilter("all");
});