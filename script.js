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


/* =========================================================
   SUPABASE REVIEWS
   ========================================================= */

(() => {
  const SUPABASE_URL = "https://keetiwqtraalaxtdpnvq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YxbJDO6diEB4wzFcvwxA9w_VC3fcvlj";

  if (!window.supabase || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const reviewList = document.querySelector("#review-list");
  const reviewForm = document.querySelector("#review-form");
  const reviewMessage = document.querySelector("#review-form-message");
  const averageElement = document.querySelector("#reviews-average");
  const starsElement = document.querySelector("#reviews-stars");
  const countElement = document.querySelector("#reviews-count");

  if (!reviewList || !reviewForm) return;

  function renderStars(rating) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function createReviewCard(review) {
    const article = document.createElement("article");
    article.className = "review-card";

    const stars = document.createElement("div");
    stars.className = "review-card-stars";
    stars.textContent = renderStars(review.rating);
    stars.setAttribute(
      "aria-label",
      `${review.rating} out of 5 stars`
    );

    const comment = document.createElement("p");
    comment.className = "review-card-comment";
    comment.textContent = review.comment;

    const footer = document.createElement("div");
    footer.className = "review-card-footer";

    const person = document.createElement("div");

    const name = document.createElement("span");
    name.className = "review-card-name";
    name.textContent = review.name;

    const role = document.createElement("span");
    role.className = "review-card-role";
    role.textContent = review.role || "Parent";

    person.append(name, role);

    const date = document.createElement("span");
    date.className = "review-card-date";
    date.textContent = formatDate(review.created_at);

    footer.append(person, date);
    article.append(stars, comment, footer);

    return article;
  }

  async function loadReviews() {
    reviewList.replaceChildren();

    const loading = document.createElement("p");
    loading.className = "review-loading";
    loading.textContent = "Loading reviews…";
    reviewList.appendChild(loading);

    const { data, error } = await supabaseClient
      .from("reviews")
      .select("name, role, rating, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load reviews:", error);

      reviewList.replaceChildren();

      const errorMessage = document.createElement("p");
      errorMessage.className = "review-empty";
      errorMessage.textContent = "Reviews will appear here soon.";
      reviewList.appendChild(errorMessage);

      if (averageElement) averageElement.textContent = "—";
      if (starsElement) starsElement.textContent = "";
      if (countElement) countElement.textContent = "No reviews yet";

      return;
    }

    reviewList.replaceChildren();

    if (!data || data.length === 0) {
      const empty = document.createElement("p");
      empty.className = "review-empty";
      empty.textContent = "Be the first to share your experience.";
      reviewList.appendChild(empty);

      if (averageElement) averageElement.textContent = "—";
      if (starsElement) starsElement.textContent = "";
      if (countElement) countElement.textContent = "No reviews yet";

      return;
    }

    data.forEach((review) => {
      reviewList.appendChild(createReviewCard(review));
    });

    const average =
      data.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      ) / data.length;

    if (averageElement) {
      averageElement.textContent = average.toFixed(1);
    }

    if (starsElement) {
      starsElement.textContent = renderStars(Math.round(average));
      starsElement.setAttribute(
        "aria-label",
        `${average.toFixed(1)} out of 5 average rating`
      );
    }

    if (countElement) {
      countElement.textContent =
        `${data.length} ${data.length === 1 ? "review" : "reviews"}`;
    }
  }

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton =
      reviewForm.querySelector("button[type='submit']");

    const formData = new FormData(reviewForm);

    const name =
      String(formData.get("name") || "").trim();

    const role =
      String(formData.get("role") || "Parent");

    const rating =
      Number(formData.get("rating"));

    const comment =
      String(formData.get("comment") || "").trim();

    if (
      !name ||
      !comment ||
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      reviewMessage.textContent =
        "Please complete your name, rating and review.";

      reviewMessage.classList.add("error");
      return;
    }

    submitButton.disabled = true;

    reviewMessage.classList.remove("error");
    reviewMessage.textContent =
      "Submitting your review…";

    const { error } = await supabaseClient
      .from("reviews")
      .insert({
        name,
        role,
        rating,
        comment,
        status: "pending"
      });

    submitButton.disabled = false;

    if (error) {
      console.error(
        "Unable to submit review:",
        error
      );

      reviewMessage.textContent =
        "Sorry, we couldn't submit your review. Please try again.";

      reviewMessage.classList.add("error");
      return;
    }

    reviewForm.reset();

    reviewMessage.classList.remove("error");

    reviewMessage.textContent =
      "Thank you for sharing your experience! Your review will be published after approval.";
  });

  loadReviews();
})();
