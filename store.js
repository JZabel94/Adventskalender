const STORAGE_KEY = "adventskalender.opened";

function loadOpened() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(stored)) {
      return new Set();
    }

    return new Set(
      stored.filter(
        (day) => Number.isInteger(day) && day >= 1 && day <= 24
      )
    );
  } catch (error) {
    return new Set();
  }
}

function saveOpened(opened) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...opened]));
  } catch (error) {
    return;
  }
}

function markOpened(day) {
  const opened = loadOpened();
  opened.add(day);
  saveOpened(opened);
  return opened;
}

function resetOpened() {
  saveOpened(new Set());
}
