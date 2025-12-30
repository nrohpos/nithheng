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
              <div class="step-icon">${escapeHtml(item.icon || "✨")}</div>
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
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

revealCards.forEach(card => revealObserver.observe(card));


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


// ===== LOAD GALLERY FROM JSON =====
function loadGallery(jsonPath, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      data.gallery.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-item";

        const img = document.createElement("img");
        img.src = item.src; // load immediately
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
    .catch(err => console.error("Gallery error:", err));
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

