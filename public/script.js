// ===== COUNTDOWN WITH MARRIED STATE =====
const weddingDate = new Date("2026-01-24T16:00:00+07:00");

// Countdown elements
const countdownEl = document.querySelector(".countdown");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

// Married message
const marriedMessage = document.getElementById("marriedMessage");

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  // 💍 AFTER WEDDING
  if (diff <= 0) {
    if (countdownEl) countdownEl.style.display = "none";
    if (marriedMessage) marriedMessage.style.display = "block";
    return;
  }

  // ⏳ BEFORE WEDDING
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// =====LOAD AGENDA =====
async function loadAgenda() {
  const roadmapEl = document.getElementById("roadmap");
  if (!roadmapEl) return;

  try {
    const res = await fetch("assets/json/agenda.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load agenda.json");
    const data = await res.json();

    roadmapEl.innerHTML = (data.agendas || [])
      .map((item) => {
        return `
          <div class="roadmap-item ${item.loadFrom}">
            <div class="milestone">
              <div class="step-icon">
              <img src="assets/images/${escapeHtml(
                item.icon || ""
              )}" class="step-icon-img"/>
              </div>
              <div class="card">
                <span class="time">${escapeHtml(item.time || "")}</span>
                <p>${escapeHtml(item.title || "")}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    initRoadmapAnimation();
  } catch (err) {
    console.error(err);
    roadmapEl.innerHTML = "<p>Failed to load agenda.</p>";
  }
}

function initRoadmapAnimation() {
  const items = document.querySelectorAll(".roadmap-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((item) => observer.observe(item));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadAgenda();

// ===== MEET THE COUPLE ANIMATION =====
const revealCards = document.querySelectorAll(".person-card.reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

revealCards.forEach((card) => revealObserver.observe(card));

// ===== ROADMAP SLIDE-IN ANIMATION =====
const roadmapItems = document.querySelectorAll(".roadmap-item");

const roadmapObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        roadmapObserver.unobserve(entry.target); // animate once
      }
    });
  },
  {
    threshold: 0.25,
  }
);

roadmapItems.forEach((item) => roadmapObserver.observe(item));

// ===== BACKGROUND MUSIC CONTROL =====
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicToggle");

let isPlaying = false;

// Try autoplay on page load (desktop works, mobile may block)
window.addEventListener("load", () => {
  bgMusic.volume = 0.6;

  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        updateMusicUI();
      })
      .catch(() => {
        // Autoplay blocked (mobile)
        isPlaying = false;
        updateMusicUI();
      });
  }
});

// Toggle play / pause
musicBtn.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.play();
    isPlaying = true;
  } else {
    bgMusic.pause();
    isPlaying = false;
  }
  updateMusicUI();
});

// Update button UI
function updateMusicUI() {
  if (isPlaying) {
    musicBtn.textContent = "🔊";
    musicBtn.classList.add("playing");
  } else {
    musicBtn.textContent = "🔇";
    musicBtn.classList.remove("playing");
  }
}

function shuffleArray(array) {
  const arr = [...array]; // copy to avoid mutating original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== LOAD GALLERY FROM JSON =====
function loadGallery(jsonPath, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      let gallary = shuffleArray(data.gallery);
      gallary.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-item";

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt || "Gallery image";
        img.className = "gallery-img";

        img.addEventListener("click", () => {
          openLightbox(item.src, item.alt);
        });

        wrapper.appendChild(img);
        grid.appendChild(wrapper);

        observer.observe(wrapper);
      });
    })
    .catch((err) => console.error("Gallery error:", err));
}

// ===================== LIGHTBOX FUNCTIONS =====================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, alt = "") {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add("show");
}
lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("show");
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.remove("show");
});

//  ===================== CONTENT LOADED =====================
document.addEventListener("DOMContentLoaded", () => {
  loadGallery("assets/json/gallary.json", "galleryGrid");
});

function escapeMd(s) {
  return s.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

// ===== Wish Modal + Submit =====
const wishBtn = document.getElementById("wishBtn");
const wishModal = document.getElementById("wishModal");
const wishClose = document.getElementById("wishClose");
const wishForm = document.getElementById("wishForm");
const wishName = document.getElementById("wishName");
const wishMessage = document.getElementById("wishMessage");
const wishStatus = document.getElementById("wishStatus");
const wishSubmit = document.getElementById("wishSubmit");
const honeypot = document.getElementById("website");

function openWishModal() {
  wishModal.classList.add("show");
  wishModal.setAttribute("aria-hidden", "false");
  setTimeout(() => wishMessage.focus(), 50);
}
function closeWishModal() {
  wishModal.classList.remove("show");
  wishModal.setAttribute("aria-hidden", "true");
  wishStatus.textContent = "";
}

wishBtn.addEventListener("click", openWishModal);
wishClose.addEventListener("click", closeWishModal);

// close when clicking outside dialog
wishModal.addEventListener("click", (e) => {
  if (e.target === wishModal) closeWishModal();
});

// close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && wishModal.classList.contains("show"))
    closeWishModal();
});

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // basic spam block
  if (honeypot.value.trim() !== "") return;

  const name = (wishName.value || "").trim();
  const message = (wishMessage.value || "").trim();

  const cleanName = String(name).trim().slice(0, 100);
  const cleanMsg = String(message).trim().slice(0, 500);

  const text =
    `💌 *New Wedding Wish*\n` +
    (cleanName ? `From: *${escapeMd(cleanName)}*\n` : "") +
    `📝 ${escapeMd(cleanMsg)}`;

  if (!message) {
    wishStatus.textContent = "Please write a message 💛";
    return;
  }

  wishSubmit.disabled = true;
  wishStatus.textContent = "Sending...";

  try {
    const telegramBotToken = "8509113750:AAEvjiZWQ17v_7RVJh9wdWcJFKtBycl1bko";
    const groupID = "-1003695654922";
    const messageThreadId = undefined; // optional

    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: groupID,
        message_thread_id: messageThreadId || undefined,
        text: text,
      }),
    }).finally(() => {
      wishStatus.textContent = "Sent! Thank you for your wishes 💛";
      wishForm.reset();
      setTimeout(() => closeWishModal(), 900);
    });
  } catch (err) {
    wishStatus.textContent = "Sorry, failed to send. Please try again.";
    console.error(err);
  } finally {
    wishSubmit.disabled = false;
  }
});

let savedScrollY = 0;

function lockScroll() {
  savedScrollY = window.scrollY || 0;
  document.documentElement.classList.add("is-locked");
  document.body.classList.add("is-locked");
  document.body.style.top = `-${savedScrollY}px`;
}

function unlockScroll() {
  document.documentElement.classList.remove("is-locked");
  document.body.classList.remove("is-locked");
  document.body.style.top = "";
  window.scrollTo(0, savedScrollY);
}

function getInviteName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("invite");
  return raw ? decodeURIComponent(raw) : null;
}

function formatName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const inviteRaw = getInviteName();
const inviteName = inviteRaw ? formatName(inviteRaw) : null;

// Fill name in the COVER
const coverNameEl = document.getElementById("inviteNameCover");
if (coverNameEl) {
  coverNameEl.textContent = inviteName || "Our Beloved Guest";

  const hasInviteName =
    typeof inviteName === "string" && inviteName.trim().length > 0;

  if (hasInviteName) {
    lockScroll();
  } else {
    unlockScroll();
  }
}

// Cover behavior
const coverEl = document.getElementById("inviteCover");
const enterBtn = document.getElementById("enterBtn");
if (!inviteName && coverEl) {
  coverEl.classList.add("is-hidden");
}

async function startInvitation() {
  // Start music (must be triggered by user click)
  if (bgMusic) {
    try {
      await bgMusic.play();
      // update your music button if you have one
      const musicToggle = document.getElementById("musicToggle");
      if (musicToggle) musicToggle.textContent = "🔊";
    } catch (e) {
      // autoplay blocked / failed — user can toggle manually
      console.warn("Music play failed:", e);
    }
  }

  // Hide cover
  if (coverEl) coverEl.classList.add("is-hidden");
  unlockScroll();
  // Optionally force top
  window.scrollTo({ top: 0, behavior: "instant" });
}

if (enterBtn) {
  enterBtn.addEventListener("click", startInvitation);
}
