# Architektur

## Übersicht

Der Adventskalender ist eine statische Web-App ohne Build-Schritt und ohne externe Abhängigkeiten. Es gibt zwei HTML-Seiten: den Kalender mit 24 Türchen und eine Detailseite, die pro Türchen geöffnet wird. Alle Texte der Oberfläche sind auf Deutsch.

Die ungeraden Tage (1., 3., …, 23.) enthalten selbst erstellte Inhalte (Text, Bild oder Sprachnachricht). Die geraden Tage (2., 4., …, 24.) tragen die Nachrichten „Heute bist du dran!“ und „Ich bekomme heute eine Überraschung.“ Auf dem Kalender sehen alle Türchen identisch aus; der Unterschied zeigt sich erst auf der Detailseite.

Ein Türchen ist erst ab dem jeweiligen Dezembertag zugänglich und bleibt danach dauerhaft offen. Vor dem 1.12. sind alle Türen gesperrt, ab dem 25.12. alle frei. Zum Testen lässt sich der Tag mit `?vorschau=N` (1–24) überschreiben; der Parameter bleibt über alle Links erhalten.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Kalenderseite: Kopfzeile mit Girlande, Fortschrittsanzeige, 24 Türchen, Reset-Button. |
| `script.js` | Erzeugt die 24 Türchen als Links zur Detailseite, verwaltet Fortschritt und Reset. |
| `tuer.html` | Detailseite mit „Zurück zum Kalender“, Inhaltsbereich und Vor-/Zurück-Navigation. |
| `tuer.js` | Liest den Tagesparameter, rendert den Inhalt je Typ, markiert das Türchen als geöffnet. |
| `content.js` | Zentrale Inhaltsdatei mit 24 Einträgen und den Typen `text`, `image`, `audio`, `notice`. |
| `date.js` | Datumssperre, Testparameter `vorschau` und Link-Builder, die den Testparameter erhalten. |
| `store.js` | Geteilte localStorage-Funktionen `loadOpened`, `saveOpened`, `markOpened`, `resetOpened`. |
| `styles.css` | Weihnachtliches Farbschema, responsives Raster, 3D-Türeffekt und Styles der Detailseite. |
| `ARCHITECTURE.md` | Dieses Dokument. |

## Aufbau

### `index.html` / `script.js`

Die Kalenderseite enthält nur leere Container (`#calendar`, `#progress`, `#reset`). `script.js` erzeugt 24 Links über `detailUrl(day)` in einem `DocumentFragment`. Jedes Türchen besteht aus einer Vorder- und Rückseite (`.door-front`, `.door-back`), die über `.is-open` um 180 Grad gedreht wird. Beide Seiten tragen die Tageszahl, sodass sie auch nach dem Öffnen sichtbar bleibt; die Rückseite zeigt zusätzlich „Geöffnet“. Bereits besuchte Türchen werden beim Rendern als geöffnet markiert; der aktuelle Dezembertag erhält zusätzlich `.is-today`.

Noch nicht freigegebene Türchen erhalten `.is-locked`: kein `href`, `aria-disabled="true"`, `tabindex="-1"`, ein CSS-Schloss und der Hinweis „Noch nicht verfügbar“. Die Zahl bleibt dabei sichtbar. Bereits gespeicherte, geöffnete Türchen bleiben auch vor ihrem Datum aufrufbar. Der Reset-Button leert den gespeicherten Zustand und rendert neu.

### `tuer.html` / `tuer.js`

Die Detailseite wird über `tuer.html?tag=N` aufgerufen. `getDay()` liest den Parameter per `URLSearchParams`, prüft den Bereich 1–24 und liefert bei ungültigen Werten `null`, woraufhin eine deutsche Fehlermeldung mit dem dauerhaft sichtbaren Zurück-Link angezeigt wird. Das gleiche gilt für eine gesperrte Tür: Statt des Inhalts erscheint „Dieses Türchen ist noch nicht verfügbar. Es öffnet sich ab dem N. Dezember.“; `markOpened` wird nicht aufgerufen. Direkte URL-Eingaben können die Sperre also nicht umgehen.

Der Inhalt kommt aus `ADVENT_CONTENT[tag]` und wird je nach `type` gerendert:

- **`text`** – Fließtext in `.detail-text`.
- **`notice`** – „Heute bist du dran!“ und „Ich bekomme heute eine Überraschung.“ für die geraden Tage.
- **`image`** – Eingebettetes SVG-Motiv aus der `MOTIFS`-Map in `tuer.js` (`baum`, `stern`, `geschenk`, `schneemann`) plus Bildunterschrift. Es werden keine externen Bilddateien benötigt.
- **`audio`** – `<audio controls>` mit `src` aus `content.js`. Fehlt die Datei, erscheint ein deutscher Hinweis; der Transkript-Text bleibt immer sichtbar.

Alle Inhaltsstrings werden mit `textContent` gesetzt. Nur die fest in `tuer.js` definierten SVG-Zeichenfolgen werden als `innerHTML` eingefügt. Nach dem Rendern ruft die Seite `markOpened(tag)` auf. Die Vor-/Zurück-Navigation verweist über `detailUrl()` auf `tag - 1` bzw. `tag + 1`; gesperrte Ziele werden als nicht klickbarer Hinweis „(gesperrt)" dargestellt. Der Zurück-Link nutzt `calendarUrl()`.

### `content.js`

Ein Objekt mit den Schlüsseln 1–24. Jeder Eintrag hat `type`, `title` und je Typ weitere Felder:

```js
1:  { type: "text",   title: "Türchen 1", text: "…" }
2:  { type: "notice", title: "Türchen 2", text: "Heute bist du dran!",
      note: "Ich bekomme heute eine Überraschung." }
3:  { type: "audio",  title: "Türchen 3", src: "assets/audio/tag-03.mp3",
      transcript: "…" }
5:  { type: "image",  title: "Türchen 5", motif: "baum", caption: "…" }
```

Die 12 ungeraden Einträge sind derzeit Platzhalter mit gemischten Typen, damit alle drei Darstellungen sichtbar sind. Die 12 geraden Einträge sind bereits fertige `notice`-Einträge und können später durch eigene Inhalte ersetzt werden.

### `date.js` / Freischaltung

`currentAdventDay()` liefert den aktuellen Kalendertag: 0 vor Dezember, 1–24 im Dezember und 25 nach dem 24.12. `isLocked(day)` ist wahr, wenn `day` größer als dieser Wert ist. `PREVIEW_DAY` liest optional `?vorschau=N` (1–24) aus der URL und überschreibt das echte Datum. `detailUrl(day)` und `calendarUrl()` hängen den Testparameter an alle internen Links, damit er beim Navigieren erhalten bleibt.

### `store.js` / Zustand

`localStorage` speichert unter `adventskalender.opened` ein Array der geöffneten Tagesnummern. `loadOpened()` gibt ein `Set` zurück und verwirft ungültige Werte; `saveOpened()` schreibt es zurück. Ist der Speicher nicht verfügbar, funktioniert die App ohne Persistenz weiter.

### `styles.css`

- **Farben:** CSS-Variablen in `:root` (Tannengrün, Rot, Gold, Schneeweiß).
- **Kalender:** CSS-Grid mit sechs Spalten, unter 640 px vier Spalten; Türchen behalten ihr Seitenverhältnis via `aspect-ratio`.
- **3D-Effekt:** `.door-inner` mit `transform-style: preserve-3d`, beide Seiten mit `backface-visibility: hidden`.
- **Gesperrte Türen:** `.is-locked` dimmt die Vorderseite, zeigt ein CSS-Schloss und „Noch nicht verfügbar"; Hover-Effekt und Zeiger-Hand entfallen.
- **Weihnachtliches Detail:** Girlande aus CSS-Gradients, Serifenschrift, goldene Ränder, Schnee-Hintergrund.
- **Zugänglichkeit:** `:focus-visible`-Rahmen, `aria-live`, `aria-expanded`, `prefers-reduced-motion` ohne Animation.

## Datenfluss

```text
Kalender
  createDoor(N) -> isLocked(N)?
    ja:  kein href, aria-disabled, Schloss, Hinweis
    nein: href = detailUrl(N)

Detailseite
  tag lesen und validieren
  -> isLocked(N) und nicht bereits geöffnet?
       ja:  Meldung "noch nicht verfügbar", kein markOpened
       nein: Inhalt aus ADVENT_CONTENT[N] rendern
             -> markOpened(N) -> localStorage
  -> Zurück-Link / Browser-Zurück -> calendarUrl()

Kalender nach Rückkehr
  loadOpened() -> Türchen N geöffnet, Fortschritt aktualisiert
  Reset -> resetOpened() -> alle Türchen geschlossen
```

## Starten

`index.html` direkt im Browser öffnen. Es ist kein Server und kein Build nötig; alternativ kann ein statischer Webserver verwendet werden. Da Türchen erst ab ihrem Datum zugänglich sind, ist zum Testen `index.html?vorschau=5` (5.12.) hilfreich; der Parameter bleibt auf der Detailseite und beim Zurück erhalten. Audiodateien gehören nach `assets/audio/tag-NN.mp3` (z. B. `tag-03.mp3`) und werden von `content.js` referenziert.

## Erweitern

- **Eigene Inhalte:** Einträge in `content.js` ersetzen; `type` bestimmt die Darstellung.
- **Eigene Bilder:** In `tuer.js` die `MOTIFS`-Map ergänzen oder `createImageContent()` auf eine Datei aus `assets/images/` umstellen.
- **Audio:** MP3-Dateien ablegen und `src` in `content.js` anpassen; der Hinweis erscheint automatisch, solange die Datei fehlt.
- **Andere Nachricht für gerade Tage:** `text`/`note` der `notice`-Einträge ändern.
- **Mehr/soweniger Türchen:** `content.js`, die Grenzen in `getDay()`/`render()`, die 24er-Grenze in `date.js` und die Schleife in `script.js` anpassen.
- **Anderes Datum dauerhaft simulieren:** `PREVIEW_DAY` in `date.js` auf einen festen Wert setzen.
