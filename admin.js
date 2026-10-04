(() => {
  "use strict";

  const SUPABASE_URL = "https://keetiwqtraalaxtdpnvq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YxbJDO6diEB4wzFcvwxA9w_VC3fcvlj";

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const loginView = document.querySelector("#login-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const loginForm = document.querySelector("#login-form");
  const loginMessage = document.querySelector("#login-message");
  const logoutButton = document.querySelector("#logout-button");
  const list = document.querySelector("#review-admin-list");
  const adminMessage = document.querySelector("#admin-message");

  const counts = {
    pending: document.querySelector("#pending-count"),
    approved: document.querySelector("#approved-count"),
    rejected: document.querySelector("#rejected-count")
  };

  let currentStatus = "pending";

  function setMessage(element, message, isError = false) {
    element.textContent = message || "";
    element.classList.toggle("error", isError);
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
  }

  function showLogin() {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }

  async function verifyAdmin() {
    const { data: userData } = await client.auth.getUser();

    if (!userData.user) {
      return false;
    }

    const { data, error } = await client.rpc("is_admin");

    if (error || data !== true) {
      await client.auth.signOut();
      return false;
    }

    return true;
  }

  async function loadCounts() {
    for (const status of ["pending", "approved", "rejected"]) {
      const { count, error } = await client
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("status", status);

      if (!error && counts[status]) {
        counts[status].textContent = count ?? 0;
      }
    }
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function makeReviewCard(review) {
    const card = document.createElement("article");
    card.className = "admin-review";

    const heading = document.createElement("div");
    heading.className = "review-heading";

    const person = document.createElement("div");

    const name = document.createElement("h2");
    name.textContent = review.name;

    const role = document.createElement("span");
    role.textContent = review.role || "Parent";

    person.append(name, role);

    const rating = document.createElement("strong");
    rating.className = "admin-stars";
    rating.textContent =
      "★".repeat(Number(review.rating)) +
      "☆".repeat(5 - Number(review.rating));

    heading.append(person, rating);

    const comment = document.createElement("p");
    comment.className = "admin-comment";
    comment.textContent = review.comment;

    const meta = document.createElement("small");
    meta.textContent =
      `${review.status.toUpperCase()} · ${formatDate(review.created_at)}`;

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    if (review.status !== "approved") {
      const approve = document.createElement("button");
      approve.textContent = "Approve";
      approve.addEventListener("click", () =>
        updateStatus(review.id, "approved")
      );
      actions.appendChild(approve);
    }

    if (review.status !== "rejected") {
      const reject = document.createElement("button");
      reject.className = "danger";
      reject.textContent = "Reject";
      reject.addEventListener("click", () =>
        updateStatus(review.id, "rejected")
      );
      actions.appendChild(reject);
    }

    if (review.status !== "pending") {
      const pending = document.createElement("button");
      pending.className = "secondary";
      pending.textContent = "Move to pending";
      pending.addEventListener("click", () =>
        updateStatus(review.id, "pending")
      );
      actions.appendChild(pending);
    }

    card.append(heading, comment, meta, actions);
    return card;
  }

  async function loadReviews() {
    list.replaceChildren();
    setMessage(adminMessage, "Loading…");

    let query = client
      .from("reviews")
      .select("id, name, role, rating, comment, status, created_at")
      .order("created_at", { ascending: false });

    if (currentStatus !== "all") {
      query = query.eq("status", currentStatus);
    }

    const { data, error } = await query;

    if (error) {
      setMessage(adminMessage, error.message, true);
      return;
    }

    setMessage(adminMessage, "");

    if (!data || data.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = `No ${currentStatus === "all" ? "" : currentStatus + " "}reviews.`;
      list.appendChild(empty);
      return;
    }

    data.forEach((review) => {
      list.appendChild(makeReviewCard(review));
    });
  }

  async function updateStatus(id, status) {
    setMessage(adminMessage, "Updating…");

    const { error } = await client
      .from("reviews")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(adminMessage, error.message, true);
      return;
    }

    await loadCounts();
    await loadReviews();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;

    setMessage(loginMessage, "Signing in…");

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(loginMessage, error.message, true);
      return;
    }

    const admin = await verifyAdmin();

    if (!admin) {
      setMessage(
        loginMessage,
        "This account is not authorized as the website owner.",
        true
      );
      return;
    }

    setMessage(loginMessage, "");
    showDashboard();
    await loadCounts();
    await loadReviews();
  });

  logoutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      document.querySelectorAll(".tab").forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");
      currentStatus = tab.dataset.status;
      await loadReviews();
    });
  });

  (async () => {
    const admin = await verifyAdmin();

    if (admin) {
      showDashboard();
      await loadCounts();
      await loadReviews();
    } else {
      showLogin();
    }
  })();
})();
