# Hinweise für Claude

## Kosten-Regeln (Claude-Nutzung und GitHub-Minuten)

Ziel: gleicher Output, weniger Verbrauch. Gilt für jede Sitzung in diesem Repo.

- **Gesammelt pushen:** erst lokal fertig machen und testen, dann ein Push mit allen Änderungen. Keine Einzel-Pushes für jeden kleinen Fix.
- **Zuerst lokal testen** (Linux-Container). GitHub nur für das, was lokal nicht geht (Windows, macOS, Android/iOS).
- **CI-Aufteilung:** Push und PR laufen nur auf Linux. Windows (2x Minuten) und macOS (10x) laufen nur manuell über „Run workflow“ oder beim Release-Tag `v*`. Reine Doku-Änderungen starten keine CI.
- **Nicht auf CI warten oder pollen.** PR-Abo nur, wenn ausdrücklich gewünscht.
- **Keine Agenten-Schwärme**, Screenshots nur auf Wunsch, Antworten kurz (Deutsch).
- **Release-Fokus:** nur Muss-Punkte bis zum Release; Ideen als Notiz, nicht sofort umsetzen.

## DFF Studios Status (Pflicht am Ende jeder Sitzung)

Dieses Repo erscheint in **DFF Studios** als Projekt-Steckbrief. Die App liest `.dff/status.json` aus dem Standard-Branch.
Bevor du eine Sitzung beendest oder pushst, aktualisiere `.dff/status.json` und committe sie mit dem übrigen Stand (kein eigener Commit):
- `now`: ein Satz, woran gerade gearbeitet wird (das sieht der Nutzer zuerst).
- `log`: neuen Eintrag **oben** einfügen (`date` = YYYY-MM-DD, `summary` = ein Satz, was erledigt wurde, `by` = "Claude Code"); höchstens 20 Einträge behalten.
- `next`: die nächsten 1–5 Schritte. `blockers`: was ohne den Nutzer nicht weitergeht (leer lassen, wenn nichts).
- `stage` nur ändern, wenn sich der Entwicklungsstand wirklich geändert hat; `version` bei Releases anpassen.
- `updated`: jetzt (ISO-Zeit).

Gültige Werte für `stage`: Idee, Prototyp, In Arbeit, Alpha, Beta, Release-reif, Veröffentlicht, Wartung, Pausiert, Archiv.
Pflichtfelder: `project`, `stage`, `updated`, `now`, `log`. Optional: `version`, `next`, `blockers`,
`tagline` (ein Satz, was das Projekt ist), `color` (#hex, **kein Blau**), `icon` (Pfad zu PNG/JPG im Repo oder `lucide:name`),
`covers` (Pfade zu Bildern im Repo), `music` (Liste: `{ "title", "path" }` für Audiodateien im Repo oder `{ "title", "url", "prompt" }` für Suno-Links).
Offene Aufgaben gehören als GitHub-Issues ins Repo (Labels: bug, feature, release-blocker, design, idee) – DFF Studios zeigt sie an.
