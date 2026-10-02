document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const track = document.querySelector("#gallery");
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");
  const filters = Array.from(document.querySelectorAll(".filter"));
  const cards = Array.from(document.querySelectorAll("#gallery .art-card"));

  /* =========================
     MOBILE NAVIGATION
  ========================= */

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(opened)
      );
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }


  /* =========================
     GET VISIBLE ARTWORK
  ========================= */

  function visibleCards() {
    return cards.filter(card => !card.hidden);
  }


  /* =========================
     CATEGORY FILTER
  ========================= */

  function applyFilter(category) {

    filters.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.filter === category
      );
    });

    cards.forEach(card => {

      const show =
        category === "all" ||
        card.dataset.category === category;

      card.hidden = !show;

      card.setAttribute(
        "aria-hidden",
        String(!show)
      );
    });

    // Start selected category from first image
    if (track) {
      track.scrollTo({
        left: 0,
        behavior: "smooth"
      });
    }
  }


  filters.forEach(button => {

    button.addEventListener("click", event => {

      event.preventDefault();

      const category =
        button.dataset.filter || "all";

      applyFilter(category);
    });

  });


  /* =========================
     PREVIOUS / NEXT
  ========================= */

  function moveGallery(direction) {

    if (!track) return;

    const items = visibleCards();

    if (!items.length) return;

    const currentLeft =
      track.scrollLeft;

    let currentIndex = 0;
    let smallestDistance = Infinity;


    items.forEach((card, index) => {

      const distance =
        Math.abs(card.offsetLeft - currentLeft);

      if (distance < smallestDistance) {

        smallestDistance = distance;
        currentIndex = index;

      }

    });


    let targetIndex =
      currentIndex + direction;


    // Loop to last image
    if (targetIndex < 0) {
      targetIndex = items.length - 1;
    }


    // Loop to first image
    if (targetIndex >= items.length) {
      targetIndex = 0;
    }


    track.scrollTo({

      left: items[targetIndex].offsetLeft,

      behavior: "smooth"

    });

  }


  if (prevButton) {

    prevButton.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        moveGallery(-1);

      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        moveGallery(1);

      }
    );

  }


  /* =========================
     MOUSE WHEEL SCROLL
  ========================= */

  if (track) {

    track.addEventListener(
      "wheel",
      event => {

        if (
          Math.abs(event.deltaY) >
          Math.abs(event.deltaX)
        ) {

          event.preventDefault();

          track.scrollLeft += event.deltaY;

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
      lightbox.querySelector("figcaption");

    const closeButton =
      lightbox.querySelector(".lightbox-close");

    const lightboxPrev =
      lightbox.querySelector(".lightbox-prev");

    const lightboxNext =
      lightbox.querySelector(".lightbox-next");


    let currentLightboxIndex = 0;


    function showLightboxImage(index) {

      const items = visibleCards();

      if (
        !items.length ||
        !lightboxImg
      ) {
        return;
      }


      currentLightboxIndex =
        (index + items.length) %
        items.length;


      const card =
        items[currentLightboxIndex];


      const image =
        card.querySelector("img");


      if (!image) return;


      lightboxImg.src =
        image.src;


      lightboxImg.alt =
        image.alt || "";


      if (caption) {

        caption.textContent =
          (card.dataset.title || "") +
          (
            card.dataset.caption
              ? " — " + card.dataset.caption
              : ""
          );

      }

    }


    function openLightbox(card) {

      const items =
        visibleCards();


      const index =
        items.indexOf(card);


      if (index === -1) {
        return;
      }


      showLightboxImage(index);


      lightbox.classList.add("open");


      lightbox.setAttribute(
        "aria-hidden",
        "false"
      );


      document.body.style.overflow =
        "hidden";

    }


    function closeLightbox() {

      lightbox.classList.remove("open");


      lightbox.setAttribute(
        "aria-hidden",
        "true"
      );


      document.body.style.overflow =
        "";

    }


    cards.forEach(card => {

      card.addEventListener(
        "click",
        () => {

          if (!card.hidden) {
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
        () => {

          showLightboxImage(
            currentLightboxIndex - 1
          );

        }
      );

    }


    if (lightboxNext) {

      lightboxNext.addEventListener(
        "click",
        () => {

          showLightboxImage(
            currentLightboxIndex + 1
          );

        }
      );

    }


    lightbox.addEventListener(
      "click",
      event => {

        if (
          event.target === lightbox
        ) {

          closeLightbox();

        }

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          !lightbox.classList.contains("open")
        ) {
          return;
        }


        if (event.key === "Escape") {

          closeLightbox();

        }


        if (event.key === "ArrowLeft") {

          showLightboxImage(
            currentLightboxIndex - 1
          );

        }


        if (event.key === "ArrowRight") {

          showLightboxImage(
            currentLightboxIndex + 1
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
     INITIAL FILTER
  ========================= */

  applyFilter("all");

});