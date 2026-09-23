// Sitex Horizon – Main Logic

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const el = document.getElementById('clock');
  if (el) el.textContent = time;
}

function renderArrivals() {
  const list = document.getElementById('arrivalsList');
  if (!list) return;

  list.innerHTML = routes.map(r => `
    <div class="arrival-card">
      <div>
        <div class="arrival-route">🚌 ${r.name}</div>
        <div class="arrival-via">via ${r.via}</div>
      </div>
      <div class="arrival-eta">
        ${r.eta} <span>min</span>
        <span class="badge ${r.status === 'on-time' ? 'badge-on-time' : 'badge-delayed'}" style="margin-top:4px;display:inline-block;">
          ${r.status === 'on-time' ? 'ON TIME' : 'DELAYED'}
        </span>
      </div>
    </div>
  `).join('');
}

function applyAnnouncement(type) {
  const panel = document.getElementById('announcement');
  if (!panel) return;

  if (type === 'none' || !announcements[type]) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden', 'critical', 'caution', 'info');
  panel.classList.add(type);

  const data = announcements[type];
  document.getElementById('annTitle').textContent = data.title;
  document.getElementById('annBody').textContent = data.body;
  
  const safety = panel.querySelector('.announcement-safety');
  if (safety) safety.textContent = data.safety;

  const hotlines = panel.querySelector('.announcement-hotlines');
  if (hotlines) {
    hotlines.style.display = data.hotlines ? 'block' : 'none';
  }

  const meta = document.getElementById('annMeta');
  if (meta) meta.textContent = `Last updated: just now • Stay safe everyone`;
}

// Simulate live ETA updates
function simulateLive() {
  routes.forEach(r => {
    if (Math.random() > 0.7) {
      r.eta = Math.max(1, r.eta + (Math.random() > 0.5 ? -1 : 1));
    }
  });
  renderArrivals();
}

setInterval(simulateLive, 8000);

// Load saved announcement if any
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('sitex_announcement');
  if (saved) {
    currentAnnouncement = saved;
    applyAnnouncement(saved);
  } else {
    applyAnnouncement(currentAnnouncement);
  }
});
