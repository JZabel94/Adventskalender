const calendar = document.getElementById("calendar");
const progress = document.getElementById("progress");
const resetButton = document.getElementById("reset");

let opened = loadOpened();

function currentAdventDay() {
  const now = new Date();
  return now.getMonth() === 11 && now.getDate() <= 24 ? now.getDate() : null;
}

function updateProgress() {
  progress.textContent = `${opened.size} von 24 Türchen geöffnet`;
}

function setDoorOpen(door) {
  door.classList.add("is-open");
  door.setAttribute("aria-expanded", "true");
  door.setAttribute("aria-label", `Türchen ${door.dataset.day} erneut öffnen`);
}

function createDoor(day) {
  const door = document.createElement("a");
  door.className = "door";
  door.href = `tuer.html?tag=${day}`;
  door.dataset.day = String(day);
  door.setAttribute("aria-label", `Türchen ${day} öffnen`);

  const inner = document.createElement("div");
  inner.className = "door-inner";

  const front = document.createElement("div");
  front.className = "door-face door-front";

  const number = document.createElement("span");
  number.className = "number";
  number.textContent = String(day);

  const knob = document.createElement("span");
  knob.className = "knob";
  knob.setAttribute("aria-hidden", "true");

  front.append(number, knob);

  const back = document.createElement("div");
  back.className = "door-face door-back";

  const label = document.createElement("span");
  label.className = "back-label";
  label.textContent = "Geöffnet";

  back.append(label);
  inner.append(front, back);
  door.append(inner);

  if (opened.has(day)) {
    setDoorOpen(door);
  }

  if (day === currentAdventDay()) {
    door.classList.add("is-today");
  }

  return door;
}

function render() {
  const fragment = document.createDocumentFragment();

  for (let day = 1; day <= 24; day += 1) {
    fragment.append(createDoor(day));
  }

  calendar.replaceChildren(fragment);
  updateProgress();
}

resetButton.addEventListener("click", () => {
  resetOpened();
  opened = new Set();
  render();
});

render();
