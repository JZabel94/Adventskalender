const PREVIEW_DAY = (() => {
  const value = new URLSearchParams(window.location.search).get("vorschau");
  if (value === null || !/^\d+$/.test(value)) {
    return null;
  }

  const day = Number(value);
  return day >= 1 && day <= 24 ? day : null;
})();

function currentAdventDay() {
  if (PREVIEW_DAY !== null) {
    return PREVIEW_DAY;
  }

  const now = new Date();
  if (now.getMonth() !== 11) {
    return 0;
  }

  return now.getDate() <= 24 ? now.getDate() : 25;
}

function isLocked(day) {
  return day > currentAdventDay();
}

function withPreview(url) {
  if (PREVIEW_DAY === null) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}vorschau=${PREVIEW_DAY}`;
}

function detailUrl(day) {
  return withPreview(`tuer.html?tag=${day}`);
}

function calendarUrl() {
  return withPreview("index.html");
}
