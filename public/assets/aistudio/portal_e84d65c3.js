
const $ = (selector) => document.querySelector(selector);

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function showMessage(element, message, type = "error") {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function switchAuth(section) {
  const login = $("#loginSection");
  const signup = $("#signupSection");
  const forgot = $("#forgotSection");

  if (login) login.hidden = section !== "login";
  if (signup) signup.hidden = section !== "signup";
  if (forgot) forgot.hidden = section !== "forgot";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved") return "approved";
  if (value === "completed") return "completed";
  if (value === "rejected") return "rejected";
  if (value === "processing") return "processing";
  if (value.includes("waiting")) return "waiting";
  return "";
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

/* LOGIN AND SIGN-UP PAGE */

async function initAuthPage() {
  if (!$("#loginForm")) return;

  $("#showSignup")?.addEventListener("click", () => switchAuth("signup"));
  $("#showLogin")?.addEventListener("click", () => switchAuth("login"));
  $("#forgotPasswordBtn")?.addEventListener("click", () => switchAuth("forgot"));
  $("#backToLogin")?.addEventListener("click", () => switchAuth("login"));

  try {
    const data = await api("/api/me");
    if (data.user) {
      window.location.replace("/dashboard.html");
      return;
    }
  } catch (_) {}

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#loginMessage");
    showMessage(message, "Signing in...", "success");

    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: $("#loginIdentifier").value.trim(),
          password: $("#loginPassword").value
        })
      });

      window.location.href = "/dashboard.html";
    } catch (error) {
      showMessage(message, error.message);
    }
  });

  $("#signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = $("#signupPassword").value;
    const confirmPassword = $("#confirmPassword").value;
    const message = $("#signupMessage");

    if (password !== confirmPassword) {
      showMessage(message, "Passwords do not match.");
      return;
    }

    showMessage(message, "Creating your account...", "success");

    try {
      await api("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username: $("#signupUsername").value.trim(),
          email: $("#signupEmail").value.trim(),
          password
        })
      });

      window.location.href = "/dashboard.html";
    } catch (error) {
      showMessage(message, error.message);
    }
  });
}

/* DASHBOARD */

let currentUser = null;
let cachedRequests = [];
let cachedAnnouncements = [];

async function initDashboard() {
  if (!$("#dashboardRoot")) return;

  try {
    const data = await api("/api/me");
    if (!data.user) {
      window.location.replace("/");
      return;
    }

    currentUser = data.user;
    $("#currentUsername").textContent = currentUser.username;
    $("#currentRole").textContent = currentUser.role;

    const isAdmin = currentUser.role === "Admin";
    $("#residentView").hidden = isAdmin;
    $("#adminView").hidden = !isAdmin;
    $("#adminRequestPanel").hidden = !isAdmin;
    $("#adminAnnouncementPanel").hidden = !isAdmin;
    $("#residentRequestPanel").hidden = isAdmin;

    $("#welcomeTitle").textContent = isAdmin
      ? "Admin Dashboard"
      : "Resident Dashboard";

    $("#welcomeSubtitle").textContent = isAdmin
      ? "Manage resident requests and barangay announcements."
      : "Request barangay services and check your request status.";

    await refreshDashboard();

    $("#logoutBtn").addEventListener("click", async () => {
      try {
        await api("/api/logout", { method: "POST" });
      } finally {
        window.location.replace("/");
      }
    });

    $("#requestForm")?.addEventListener("submit", submitRequest);
    $("#announcementForm")?.addEventListener("submit", createAnnouncement);
  } catch (error) {
    alert(error.message);
    window.location.replace("/");
  }
}

async function refreshDashboard() {
  const [requestData, announcementData] = await Promise.all([
    api("/api/requests"),
    api("/api/announcements")
  ]);

  cachedRequests = requestData.requests || [];
  cachedAnnouncements = announcementData.announcements || [];

  renderRequests();
  renderAnnouncements();
  renderStats();
}

function renderStats() {
  const requests = cachedRequests;
  const pending = requests.filter((item) =>
    ["Pending", "Processing", "Waiting for Captain signature"].includes(item.status)
  ).length;
  const approved = requests.filter((item) => item.status === "Approved").length;
  const completed = requests.filter((item) => item.status === "Completed").length;

  $("#statTotal").textContent = requests.length;
  $("#statPending").textContent = pending;
  $("#statApproved").textContent = approved;
  $("#statAnnouncements").textContent = cachedAnnouncements.length;

  if ($("#statCompleted")) $("#statCompleted").textContent = completed;
}

function renderRequests() {
  const residentList = $("#residentRequestList");
  const adminList = $("#adminRequestList");

  if (residentList) {
    if (!cachedRequests.length) {
      residentList.innerHTML = '<p class="empty-state">You have not submitted any requests yet.</p>';
    } else {
      residentList.innerHTML = cachedRequests.map((item) => `
        <article class="request-item">
          <div class="panel-heading">
            <h3>${escapeHTML(item.service_type)}</h3>
            <span class="status ${statusClass(item.status)}">${escapeHTML(item.status)}</span>
          </div>
          <p><strong>Request #:</strong> ${item.id}</p>
          <p><strong>Purpose:</strong> ${escapeHTML(item.purpose)}</p>
          <p><strong>Details:</strong> ${escapeHTML(item.details || "None provided")}</p>
          <p><strong>Submitted:</strong> ${escapeHTML(formatDate(item.created_at))}</p>
          ${item.admin_note ? `<p><strong>Admin note:</strong> ${escapeHTML(item.admin_note)}</p>` : ""}
        </article>
      `).join("");
    }
  }

  if (adminList) {
    if (!cachedRequests.length) {
      adminList.innerHTML = '<p class="empty-state">No resident requests yet.</p>';
    } else {
      adminList.innerHTML = cachedRequests.map((item) => `
        <article class="request-item">
          <div class="panel-heading">
            <h3>${escapeHTML(item.service_type)} · #${item.id}</h3>
            <span class="status ${statusClass(item.status)}">${escapeHTML(item.status)}</span>
          </div>
          <p><strong>Resident:</strong> ${escapeHTML(item.username)} (${escapeHTML(item.email)})</p>
          <p><strong>Purpose:</strong> ${escapeHTML(item.purpose)}</p>
          <p><strong>Details:</strong> ${escapeHTML(item.details || "None provided")}</p>
          <p><strong>Submitted:</strong> ${escapeHTML(formatDate(item.created_at))}</p>
          <label for="status-${item.id}">Update status</label>
          <div class="admin-tools">
            <select id="status-${item.id}">
              ${[
                "Pending",
                "Processing",
                "Waiting for Captain signature",
                "Approved",
                "Rejected",
                "Completed"
              ].map((status) => `
                <option value="${escapeHTML(status)}" ${status === item.status ? "selected" : ""}>
                  ${escapeHTML(status)}
                </option>
              `).join("")}
            </select>
            <button class="primary-button" type="button"
              data-update-request="${item.id}">Save</button>
          </div>
          <label for="note-${item.id}">Admin note (optional)</label>
          <textarea id="note-${item.id}" rows="2">${escapeHTML(item.admin_note || "")}</textarea>
        </article>
      `).join("");

      adminList.querySelectorAll("[data-update-request]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.dataset.updateRequest;
          const status = $(`#status-${id}`).value;
          const adminNote = $(`#note-${id}`).value;

          try {
            await api(`/api/requests/${id}/status`, {
              method: "PATCH",
              body: JSON.stringify({ status, adminNote })
            });
            await refreshDashboard();
            alert("Request status updated.");
          } catch (error) {
            alert(error.message);
          }
        });
      });
    }
  }
}

function renderAnnouncements() {
  const list = $("#announcementList");
  if (!list) return;

  if (!cachedAnnouncements.length) {
    list.innerHTML = '<p class="empty-state">No announcements posted yet.</p>';
    return;
  }

  list.innerHTML = cachedAnnouncements.map((item) => `
    <article class="announcement-item">
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.body)}</p>
      <p>Posted by ${escapeHTML(item.author || "Barangay Admin")} ·
        ${escapeHTML(formatDate(item.created_at))}</p>
      ${currentUser?.role === "Admin" ? `
        <div class="admin-tools">
          <button type="button" class="secondary-button"
            data-edit-announcement="${item.id}">Edit</button>
          <button type="button" class="danger-button"
            data-delete-announcement="${item.id}">Delete</button>
        </div>
      ` : ""}
    </article>
  `).join("");

  list.querySelectorAll("[data-edit-announcement]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = cachedAnnouncements.find(
        (announcement) => announcement.id === Number(button.dataset.editAnnouncement)
      );
      if (!item) return;

      const title = prompt("Edit announcement title:", item.title);
      if (title === null) return;
      const body = prompt("Edit announcement details:", item.body);
      if (body === null) return;

      try {
        await api(`/api/announcements/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title, body })
        });
        await refreshDashboard();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  list.querySelectorAll("[data-delete-announcement]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this announcement?")) return;

      try {
        await api(`/api/announcements/${button.dataset.deleteAnnouncement}`, {
          method: "DELETE"
        });
        await refreshDashboard();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function submitRequest(event) {
  event.preventDefault();

  try {
    await api("/api/requests", {
      method: "POST",
      body: JSON.stringify({
        serviceType: $("#serviceType").value,
        purpose: $("#requestPurpose").value.trim(),
        details: $("#requestDetails").value.trim()
      })
    });

    $("#requestForm").reset();
    await refreshDashboard();
    alert("Your request has been submitted.");
  } catch (error) {
    alert(error.message);
  }
}

async function createAnnouncement(event) {
  event.preventDefault();

  try {
    await api("/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        title: $("#announcementTitle").value.trim(),
        body: $("#announcementBody").value.trim()
      })
    });

    $("#announcementForm").reset();
    await refreshDashboard();
    alert("Announcement published.");
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initAuthPage();
  await initDashboard();
});
