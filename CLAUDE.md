# Hinweise für Claude

## Kosten-Regeln (Claude-Nutzung und GitHub-Minuten)

Ziel: gleicher Output, weniger Verbrauch. Gilt für jede Sitzung in diesem Repo.

- **Gesammelt pushen:** erst lokal fertig machen und testen, dann ein Push mit allen Änderungen. Keine Einzel-Pushes für jeden kleinen Fix.
- **Zuerst lokal testen** (Linux-Container). GitHub nur für das, was lokal nicht geht (Windows, macOS, Android/iOS).
- **CI-Aufteilung:** Push und PR laufen nur auf Linux. Windows (2x Minuten) und macOS (10x) laufen nur manuell über „Run workflow“ oder beim Release-Tag `v*`. Reine Doku-Änderungen starten keine CI.
- **Nicht auf CI warten oder pollen.** PR-Abo nur, wenn ausdrücklich gewünscht.
- **Keine Agenten-Schwärme**, Screenshots nur auf Wunsch, Antworten kurz (Deutsch).
- **Release-Fokus:** nur Muss-Punkte bis zum Release; Ideen als Notiz, nicht sofort umsetzen.
