const MOTIFS = {
  baum: '<svg class="motif" viewBox="0 0 120 120" aria-hidden="true"><polygon class="accent" points="60,8 84,48 36,48"/><polygon class="accent" points="60,32 92,76 28,76"/><rect class="trunk" x="52" y="76" width="16" height="32" rx="3"/></svg>',
  stern: '<svg class="motif" viewBox="0 0 120 120" aria-hidden="true"><polygon class="accent" points="60,8 72,46 112,46 80,70 92,108 60,84 28,108 40,70 8,46 48,46"/></svg>',
  geschenk: '<svg class="motif" viewBox="0 0 120 120" aria-hidden="true"><rect class="accent" x="20" y="44" width="80" height="60" rx="6"/><rect class="ribbon" x="54" y="44" width="12" height="60"/><path class="ribbon" d="M60 44C44 44 32 34 38 26c6-8 18 2 22 18 4-16 16-26 22-18 6 8-6 18-22 18Z"/></svg>',
  schneemann: '<svg class="motif" viewBox="0 0 120 120" aria-hidden="true"><circle class="snow" cx="60" cy="80" r="28"/><circle class="snow" cx="60" cy="40" r="20"/><circle class="eye" cx="53" cy="36" r="2.5"/><circle class="eye" cx="67" cy="36" r="2.5"/><polygon class="accent" points="60,41 80,45 60,50"/><path class="accent" d="M60 56v22"/></svg>'
};

const detail = document.getElementById("detail");
const doorNav = document.getElementById("door-nav");

function getDay() {
  const value = new URLSearchParams(window.location.search).get("tag");
  if (value === null || !/^\d+$/.test(value)) {
    return null;
  }

  const day = Number(value);
  return day >= 1 && day <= 24 ? day : null;
}

function createTextContent(entry) {
  const paragraph = document.createElement("p");
  paragraph.className = "detail-text";
  paragraph.textContent = entry.text;
  return paragraph;
}

function createNoticeContent(entry) {
  const wrapper = document.createElement("div");
  wrapper.className = "notice";

  const heading = document.createElement("h2");
  heading.textContent = entry.text;

  const note = document.createElement("p");
  note.className = "notice-note";
  note.textContent = entry.note;

  wrapper.append(heading, note);
  return wrapper;
}

function createImageContent(entry) {
  const figure = document.createElement("figure");
  figure.className = "image-figure";

  const image = document.createElement("div");
  image.className = "image-frame";
  image.innerHTML = MOTIFS[entry.motif] || MOTIFS.stern;

  const caption = document.createElement("figcaption");
  caption.textContent = entry.caption;

  figure.append(image, caption);
  return figure;
}

function createAudioContent(entry) {
  const wrapper = document.createElement("div");
  wrapper.className = "audio-block";

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";

  const source = document.createElement("source");
  source.src = entry.src;
  source.type = "audio/mpeg";
  audio.append(source);

  const hint = document.createElement("p");
  hint.className = "audio-hint";
  hint.hidden = true;
  hint.textContent = "Die Audiodatei ist noch nicht vorhanden. Der Text der Nachricht steht unten.";

  const showHint = () => {
    hint.hidden = false;
  };

  audio.addEventListener("error", showHint);
  source.addEventListener("error", showHint);

  const transcript = document.createElement("p");
  transcript.className = "audio-transcript";
  transcript.textContent = entry.transcript;

  wrapper.append(audio, hint, transcript);
  return wrapper;
}

function createContent(entry) {
  switch (entry.type) {
    case "text":
      return createTextContent(entry);
    case "notice":
      return createNoticeContent(entry);
    case "image":
      return createImageContent(entry);
    case "audio":
      return createAudioContent(entry);
    default:
      return createTextContent({
        text: "Für dieses Türchen ist noch kein Inhalt hinterlegt."
      });
  }
}

function renderNavigation(day) {
  const fragment = document.createDocumentFragment();

  if (day > 1) {
    const previous = document.createElement("a");
    previous.className = "nav-link";
    previous.href = `tuer.html?tag=${day - 1}`;
    previous.textContent = "Vorheriges Türchen";
    fragment.append(previous);
  }

  if (day < 24) {
    const next = document.createElement("a");
    next.className = "nav-link";
    next.href = `tuer.html?tag=${day + 1}`;
    next.textContent = "Nächstes Türchen";
    fragment.append(next);
  }

  doorNav.replaceChildren(fragment);
}

function renderError() {
  document.title = "Türchen nicht gefunden – Adventskalender";

  const heading = document.createElement("h1");
  heading.textContent = "Türchen nicht gefunden";

  const text = document.createElement("p");
  text.className = "detail-text";
  text.textContent = "Dieses Türchen gibt es nicht. Kehre bitte zum Kalender zurück.";

  detail.replaceChildren(heading, text);
}

function render() {
  const day = getDay();

  if (day === null || !ADVENT_CONTENT[day]) {
    renderError();
    return;
  }

  const entry = ADVENT_CONTENT[day];
  document.title = `${entry.title} – Adventskalender`;

  const number = document.createElement("p");
  number.className = "detail-day";
  number.textContent = String(day).padStart(2, "0");

  const heading = document.createElement("h1");
  heading.textContent = entry.title;

  const body = createContent(entry);
  detail.replaceChildren(number, heading, body);
  renderNavigation(day);
  markOpened(day);
}

render();
