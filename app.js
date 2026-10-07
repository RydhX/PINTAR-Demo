/* =========================================================
   PINTAR v2
   Alur: Area 77 -> pilih gedung -> pilih lantai -> pilih ruang
   Aturan: klik hanya mengubah state, lalu render() menggambar ulang.
========================================================= */

/* ---------- STATE ---------- */
const state = {
  view: "area", // "area" | "floors" | "plan"
  buildingId: null,
  floorId: null,
  roomId: null,
};

/* ---------- ELEMEN HTML ---------- */
const mapEl = document.getElementById("map");
const titleEl = document.getElementById("title");
const backBtn = document.getElementById("backBtn");
const detailEl = document.getElementById("detail");
const sidebarEl = document.getElementById("sidebar");
const unitListEl = document.getElementById("unitList");
const legendEl = document.getElementById("legend");

/* ---------- STATUS (warna ditentukan di satu tempat) ---------- */
const STATUS = {
  vacant: { label: "Kosong", color: "#3b82f6" },
  occupied: { label: "Terisi", color: "#22c55e" },
  overdue: { label: "Tunggakan", color: "#ef4444" },
};

function statusOf(room) {
  if (room.status === "vacant") return "vacant";
  if (room.payment === "Belum bayar") return "overdue";
  return "occupied";
}

/* ---------- BANTUAN ---------- */
const getBuilding = () => DATA.buildings.find((b) => b.id === state.buildingId);
const getFloor = () => getBuilding().floors.find((f) => f.id === state.floorId);

function findById(id) {
  return mapEl.querySelector("#" + CSS.escape(id));
}

// Beri warna ke elemen. Jika id ada pada grup (<g>), warnai semua bentuk di dalamnya.
function paint(el, color, opacity) {
  const shapes = el.matches("path, polygon, rect")
    ? [el]
    : el.querySelectorAll("path, polygon, rect");
  shapes.forEach((s) => {
    s.style.fill = color;
    s.style.fillOpacity = opacity;
  });
}

async function loadSVG(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error("SVG tidak ditemukan: " + file);
  mapEl.innerHTML = await res.text();
}

/* ---------- RENDER (satu pintu) ---------- */
async function render() {
  detailEl.hidden = true;
  backBtn.hidden = state.view === "area";
  sidebarEl.hidden = state.view !== "plan"; // <- pindah ke sini

  try {
    if (state.view === "area") await showArea();
    else if (state.view === "floors") showFloors();
    else await showFloorPlan();
  } catch (err) {
    console.error(err);
    mapEl.innerHTML = `<p class="error">Gagal memuat: ${err.message}</p>`;
  }
}

/* ---------- TAHAP 1: AREA 77 ---------- */
async function showArea() {
  titleEl.textContent = "Area 77 - PT INTI";
  await loadSVG(AREA_SVG);

  DATA.buildings.forEach((b) => {
    const el = findById(b.polygonId);
    if (!el) {
      console.warn("Polygon gedung tidak ditemukan:", b.polygonId);
      return;
    }
    el.classList.add("clickable", "building");
    if (!b.active) el.classList.add("inactive");

    el.addEventListener("click", () => {
      console.log("Gedung diklik:", b.id);
      if (!b.active) {
        alert(b.name + " belum tersedia.");
        return;
      }
      state.buildingId = b.id;
      state.view = "floors";
      render();
    });
  });
}

/* ---------- TAHAP 2: PILIH LANTAI ---------- */
function showFloors() {
  const b = getBuilding();
  titleEl.textContent = b.name;

  mapEl.innerHTML = `
    <div class="floor-selection">
      <h2>${b.name}</h2>
      <p>Pilih lantai yang ingin dibuka.</p>
      <div class="floor-buttons"></div>
    </div>`;

  const box = mapEl.querySelector(".floor-buttons");
  b.floors.forEach((f) => {
    const btn = document.createElement("button");
    btn.textContent = f.name;
    btn.addEventListener("click", () => {
      console.log("Lantai dipilih:", f.id);
      state.floorId = f.id;
      state.view = "plan";
      render();
    });
    box.appendChild(btn);
  });
}

/* ---------- TAHAP 3: DENAH LANTAI ---------- */
async function showFloorPlan() {
  const b = getBuilding();
  const f = getFloor();
  titleEl.textContent = `${b.name} - ${f.name}`;
  await loadSVG(f.svg);

  Object.entries(f.rooms).forEach(([roomId, room]) => {
    const el = findById(roomId);
    if (!el) {
      console.warn("Ruang tidak ada di SVG:", roomId);
      return;
    }
    el.classList.add("clickable", "room");
    el.style.setProperty("--room-color", STATUS[statusOf(room)].color);
    el.addEventListener("click", () => selectRoom(roomId));
  });

  addLabels(f.rooms);
  buildUnitList(f.rooms);
}

/* ---------- LEGENDA & DAFTAR UNIT ---------- */
function buildLegend() {
  legendEl.innerHTML = Object.values(STATUS)
    .map(
      (s) => `<div class="legend-item">
                <span class="swatch" style="background:${s.color}"></span>${s.label}
              </div>`,
    )
    .join("");
}

function buildUnitList(rooms) {
  unitListEl.innerHTML = "";
  Object.entries(rooms).forEach(([roomId, room]) => {
    const st = STATUS[statusOf(room)];
    const item = document.createElement("div");
    item.className = "unit-item";
    item.dataset.id = roomId;
    item.innerHTML = `<b>${roomId}</b>
                      <span>${room.tenant}</span>
                      <small style="color:${st.color}">${st.label}</small>`;
    item.addEventListener("click", () => selectRoom(roomId));
    unitListEl.appendChild(item);
  });
}

/* ---------- LABEL RUANG ---------- */
function addLabels(rooms) {
  const svg = mapEl.querySelector("svg");
  const FONT = 26; // satuan SVG, sesuaikan jika terlalu besar/kecil

  Object.entries(rooms).forEach(([roomId, room]) => {
    const el = findById(roomId);
    if (!el) return;

    const box = el.getBBox();
    const text = room.status === "vacant" ? "KOSONG" : room.tenant;

    // Pecah teks menjadi beberapa baris sesuai lebar ruang
    const maxChars = Math.max(6, Math.floor(box.width / (FONT * 0.6)));
    const lines = [];
    let line = "";
    text.split(" ").forEach((word) => {
      if ((line + " " + word).trim().length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    });
    lines.push(line);

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("class", "room-label");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("pointer-events", "none");

    const cx = box.x + box.width / 2;
    const startY =
      box.y + box.height / 2 - ((lines.length - 1) * FONT * 1.1) / 2;

    lines.forEach((l, i) => {
      const span = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan",
      );
      span.setAttribute("x", cx);
      span.setAttribute("y", startY + i * FONT * 1.1);
      span.setAttribute("dominant-baseline", "middle");
      span.textContent = l;
      t.appendChild(span);
    });

    svg.appendChild(t);
  });
}

/* ---------- TAHAP 4: DETAIL RUANG ---------- */
function selectRoom(roomId) {
  console.log("Ruang dipilih:", roomId);
  state.roomId = roomId;

  mapEl
    .querySelectorAll(".room.selected")
    .forEach((e) => e.classList.remove("selected"));
  findById(roomId).classList.add("selected");

  document
    .querySelectorAll(".unit-item")
    .forEach((i) => i.classList.toggle("active", i.dataset.id === roomId));

  showDetail(roomId);
}

/* ---------- TAHAP 5: KEMBALI ---------- */
function goBack() {
  state.roomId = null;
  if (state.view === "plan") state.view = "floors";
  else if (state.view === "floors") {
    state.view = "area";
    state.buildingId = null;
  }
  render();
}

backBtn.addEventListener("click", goBack);

/* ---------- MULAI ---------- */
buildLegend();
render();
