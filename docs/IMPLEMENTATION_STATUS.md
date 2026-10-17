# Verbindlicher Fertigstellungsstand

Stand: 2026-10-16. Basis: PR #2, Branch `feature/bundled-offline-dependencies`, Startcommit `bd37598`.

**Nicht releasefähig.** ERiC/ELSTER-Übermittlung ist aus dem Auftrag ausgeschlossen. Keine amtliche Validierung nachgewiesen.

Status „implementiert und lokal getestet“ ist nur der jeweilige kleine Arbeitsschritt, keine Abnahme des gesamten Moduls. Offene Testnamen sind geplante Nachweise, keine vorhandenen erfolgreichen Tests.

## Aufgabenhierarchie

## EB-01 Amtliche Taxonomien

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| EB-01.01 – Bezugsquellen 6.9 und 6.10 verifizieren | Amtlicher Link und Gültigkeit je Version belegt | Quellenabruf | — | belegt: eSteuer und Publisher; Publisherpakete erfolgreich bezogen |
| EB-01.02 – Vollständige Pakete beschaffen | Beide Archive lokal vorhanden, Herkunft und Archivhash erfasst | Downloadintegration | EB-01.01 | beide echten Pakete beschafft, SHA-256 gepinnt; Buildbereitstellung implementiert und getestet |
| EB-01.03 – Archive sicher und atomar extrahieren | Traversal, Symlinks, ZIP-Bomben und Teilzustände abgewiesen | Python Archiv-Negativtests | EB-01.01 | implementiert und lokal getestet |
| EB-01.04 – Manifestintegrität härten | Doppelte Pfade und Symlinks abgewiesen, Hashmanipulation erkannt | offline-regressions.test.js; e-balance-taxonomy.test.js | — | implementiert und lokal getestet |
| EB-01.05 – Importabschluss und Schemaabhängigkeiten prüfen | Alle transitiven Imports offline auflösbar; fehlende Datei blockiert | Taxonomie-DTS Integrationstest | EB-01.02 | GAAP/GCD beider Versionen mit Arelle offline erfolgreich validiert; Laufzeitpaket offen |
| EB-01.06 – Jahresauswahl abschließend verifizieren | Normal-/Frühverwendung und abweichende Geschäftsjahre geprüft | Jahresgrenztests | EB-01.01 | teilweise: Ganzjahresauswahl vorhanden |
| EB-01.07 – Taxonomien in alle Buildpakete integrieren | Installer enthält beide unveränderten Pakete samt Manifest | Installationsprüfung je OS | EB-01.05 | Buildbereitstellung und Ressourcenregel implementiert; Installerabnahme offen |

## EB-02 Konten-Mapping

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| EB-02.01 – Unterstützten Kontenrahmen festlegen | Eigenen 12-Konten-Plan eindeutig benennen; keine SKR03/04 Behauptung | Konteninventar | — | offen |
| EB-02.02 – Bilanzkonten fachlich zuordnen | Jedes unterstützte Konto hat gültiges konkretes Konzept, Vorzeichen und Sonderfallregel | Mapping-Fixtures gegen echte 6.9/6.10 | EB-01.05 | offen |
| EB-02.03 – GuV-Konten fachlich zuordnen | Jedes Ertrags-/Aufwandskonto mit Dauerperiode und Vorzeichen geprüft | GuV-Fixtures | EB-02.02 | offen |
| EB-02.04 – Gegenläufige Salden behandeln | Umgliederungen für Soll-/Habensaldo nachgewiesen | Debitor/Kreditor-Negativtests | EB-02.02 | offen |
| EB-02.05 – Unverdichtete Kontennachweise erstellen | Jedes relevante Konto bleibt nachvollziehbar enthalten | Kontennachweis-Schematest | EB-02.03 | teilweise: interner Nachweis vorhanden |
| EB-02.06 – Mappingarithmetik absichern | Unsichere Summen und geerbte Mappingeinträge werden abgewiesen | offline-regressions.test.js | — | implementiert und lokal getestet |

## EB-03 Export und Validierung

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| EB-03.01 – Taxonomie-DTS mit XBRL-Prozessor laden | Echte Schemas und Linkbases offline geladen | Arelle Integrationstest | EB-01.05 | Arelle-DTS-Prüfung als Buildtest implementiert; Anwendungslaufzeitintegration offen |
| EB-03.02 – GCD-Stammdaten modellieren | Rechtsform, Steuerkennung, Berichtsarten, Perioden vollständig validiert | GCD Pflichtfeldtests | EB-03.01 | offen |
| EB-03.03 – Instant- und Duration-Kontexte erzeugen | Bilanz/GuV korrekt getrennt, schemaRef vorhanden | XBRL Prozessortest | EB-03.01 | offen |
| EB-03.04 – Steuerbilanz und Überleitung implementieren | Handels-/Steuerwerte und Abweichungen nachvollziehbar exportiert | Überleitungs-Fixtures | EB-02.03 | offen |
| EB-03.05 – Mussfelder und NIL-Regeln umsetzen | Amtliche Mussfeldregeln je Berichtsfall geprüft | Positive/negative Mussfeldfixtures | EB-03.02 | offen |
| EB-03.06 – Amtliche fachliche Regeln integrieren | Regelversion dokumentiert; gültige Fälle akzeptiert, ungültige abgewiesen | Amtliche Referenzfälle | EB-03.05 | offen |
| EB-03.07 – Export in UI integrieren | Nutzer kann unterstützten Bericht erzeugen und Fehler korrigieren | IPC/UI Integrationstest | EB-03.06 | offen |

## BK Buchhaltung

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| BK.01 – Kontenverwaltung ergänzen | Konten erstellen/ändern ohne historische Buchungen zu verfälschen | Persistenz- und Änderungstests | — | offen |
| BK.02 – Journal und Buchungskorrektur prüfen | Soll/Haben, Storno, Sperren und Historie mit Negativfällen geprüft | double-entry.test.js | — | teilweise: Kern implementiert |
| BK.03 – Hauptbuch und Kontenblätter integrieren | Zeitraumfilter, Anfangs-/Endsaldo und Belegverknüpfung stimmen | Kontenblatt-Fixtures | BK.02 | offen |
| BK.04 – Saldenlisten abgleichen | Summen stimmen mit Journal und Bilanz überein | Mehrjahres-Abgleich | BK.02 | teilweise: trialBalance vorhanden |
| BK.05 – Bilanz und GuV vervollständigen | Perioden und Vorträge vollständig korrekt | Mehrjahres-Fixtures | BK.04 | teilweise: interne Auswertung |
| BK.06 – Geschäftsjahresabschluss implementieren | Abschlussbuchungen, Folgejahr und Wiederholung geprüft | Jahresabschlussintegration | BK.05 | offen |
| BK.07 – Backup und Wiederherstellung implementieren | Belege, Stammdaten, Journal verlustfrei wiederhergestellt; defekte Backups abgewiesen | Roundtrip/Manipulationstest | BK.02 | offen |
| BK.08 – Datenexport vervollständigen | Journal, Belegindex, Konten und Abschlüsse reproduzierbar exportiert | Export-Roundtrip | BK.03 | offen |

## ST Steuern

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| ST.01 – Jahresabhängige Rechtsgrundlagen recherchieren | Offizielle Quellen und unterstützte Jahre festgehalten | Regeltabellenprüfung | — | offen |
| ST.02 – Umsatz-/Vorsteuer implementieren | 0/7/19 Prozent, Befreiung und Rundung je Fall geprüft | USt positive/negative Fixtures | ST.01 | offen |
| ST.03 – Körperschaftsteuer und Soli implementieren | Steuerbasis, gesetzliche Rundung und Jahre geprüft | KSt/Soli Referenzfälle | ST.01 | teilweise: nur Schätzung vorhanden |
| ST.04 – Verlustvorträge getrennt berechnen | KSt/GewSt-Verluste und Mindestbesteuerung getrennt nach Jahr | Grenzwerttests | ST.03 | offen |
| ST.05 – Gewerbesteuer implementieren | Hinzurechnungen, Kürzungen, Hebesatz und Rundung geprüft | GewSt Referenzfälle | ST.04 | offen |
| ST.06 – Nicht unterstützte Fälle blockieren | Keine stille Standardberechnung für unbekannte Fälle | Unsupported-case Tests | ST.02 | offen |
| ST.07 – Berechnungsnachweise und UI integrieren | Jede Rechengröße mit Herkunft und Jahr sichtbar | IPC/UI Steuertests | ST.05 | offen |

## RE Rechnungen

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| RE.01 – Rechnungen dauerhaft speichern und bearbeiten | Entwürfe roundtripfest, ausgestellte Rechnungen historisch nachvollziehbar | Invoice lifecycle Tests | — | teilweise: Register/PDF vorhanden |
| RE.02 – Kunden und Unternehmen verwalten | Stammdaten speichern, auswählen, validieren | CRUD Integration | RE.01 | teilweise: Firmendaten vorhanden |
| RE.03 – Fortlaufende Nummern vergeben | Keine Doppelnummern nach Neustart/Abbruch | Sequenztests | RE.01 | offen |
| RE.04 – Pflichtangaben und Sonderfälle prüfen | Fehlende Pflichtangaben verhindern Ausstellung | Rechnungspflichtfeldtests | ST.02 | offen |
| RE.05 – Storno, Korrektur und Gutschrift umsetzen | Referenz zum Original, richtige Beträge und Dokumenttypen | Dokumentketten-Fixtures | RE.03 | offen |
| RE.06 – PDF und Druck prüfen | Mehrseitige Rechnungen, Sonderzeichen und Summen korrekt | PDF Render/Extraktion und Druckdialogtest | RE.04 | teilweise: PDF vorhanden |
| RE.07 – XRechnung erzeugen | UBL/CII mit gültigen Kennungen und Steuerschlüsseln exportiert | KoSIT gültig/ungültig | RE.04 | offen |
| RE.08 – ZUGFeRD erzeugen | PDF/A-3 mit korrektem eingebettetem CII und Metadaten | Mustang/veraPDF Integration | RE.07 | offen |
| RE.09 – EN16931 offline validieren | Echter Validator mit versionierten Regeln gebündelt | Positive/negative amtliche Fixtures | RE.07 | offen |

## DO Dokumente und OCR

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| DO.01 – Poppler-Aufruf und Scan-Seitenpfad korrigieren | -v statt --version; Seitennummern korrekt sortiert; echte Zeilenumbrüche | offline-regressions.test.js | — | implementiert und lokal getestet; Prozessadapter simuliert |
| DO.02 – Echte OCR deutsch/englisch nachweisen | Referenzscans mit gebündelten Binaries erkannt | Native OCR Fixtures | PK.01 | implementiert, lokal nativ getestet (Linux Host); frische VM offen |
| DO.03 – Beschädigte und leere Belege behandeln | Verständliche Fehler, temporäre Dateien bereinigt | Defekt/Timeout/Leerdateitests | DO.02 | teilweise |
| DO.04 – Automatische Datenextraktion ergänzen | Lieferant, Datum, Beträge, Steuer und Unsicherheit erkannt | DE/EN Belegkorpus | DO.02 | offen |
| DO.05 – Blockierende Prozesse aus UI entfernen | OCR/Validierung abbrechbar im Worker; UI bleibt bedienbar | Worker timeout/cancel test | DO.02 | offen |

## UI Desktop

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| UI.01 – Einrichtung vervollständigen | Firma, Steuerjahr, Konten und Ablage ohne Entwicklerwissen einrichtbar | Setup end-to-end | BK.01 | offen |
| UI.02 – Alle Module integrieren | Jede implementierte Funktion über Oberfläche erreichbar | IPC/Renderer Integration | EB-03.07 | teilweise |
| UI.03 – Fehlerdialog und Diagnosen ergänzen | Kopierbare Fehler mit Kontext ohne unnötige persönliche Daten | Fehlerpfadtests | UI.02 | offen |
| UI.04 – Offline Regression nachweisen | Kernabläufe ohne Netzwerk auf frischen Systemen erfolgreich | Offline end-to-end je OS | PK.04 | offen |

## PK Pakete und Release

| Einheit | Überprüfbares Ergebnis / Akzeptanz | Automatisierter Nachweis | Abhängigkeit | Status |
|---|---|---|---|---|
| PK.01 – Linux-Laufzeitabhängigkeiten bündeln | Native Tools, rekursive Bibliotheken und Sprachdaten enthalten | Frische Linux VM OCR | — | teilweise: staging Script vorhanden |
| PK.02 – Windows-Laufzeitabhängigkeiten bündeln | OCR und Validator samt Laufzeit in Installer | Frische Windows VM | RE.09 | offen |
| PK.03 – macOS-Laufzeitabhängigkeiten bündeln | x64/arm64 Tools und Bibliotheksreferenzen korrekt | Frische macOS Systeme | RE.09 | offen |
| PK.04 – Buildkonfiguration vereinheitlichen | Eine Konfiguration kopiert alle Ressourcen je Plattform | Builder effective-config Test | PK.01 | offen |
| PK.05 – Lizenzen und Herkunft paketieren | NOTICE/Lizenz/Quellbezug und Hash je Fremdkomponente | SBOM/Manifestprüfung | PK.03 | offen |
| PK.06 – Releaseprüfungen verpflichtend machen | Fehlende Ressourcen und fehlschlagende Tests stoppen Veröffentlichung | Workflow Regression | PK.04 | offen |
| PK.07 – Drei Plattformpakete bauen und prüfen | Installer starten ohne separate Hilfsinstallationen | Installationsmatrix | PK.06 | offen |
| PK.08 – Abschlussregression durchführen | Alle Akzeptanzkriterien erfüllt, keine offenen Pflichtfehler | Gesamtsuite + native Abnahmen | PK.07 | offen |

## Nachweise und Fortsetzung

- Ausgangssuite: 47/47 Tests bestanden. Nach erster Reparatur: 51/51 bestanden (`npm test`, Node lokal).
- Neue Tests `test/offline-regressions.test.js`: Symlinks, doppelte Manifestpfade, Centüberlauf, geerbte Mappings, Werkzeugpfade, kompletter simulierter Scan-PDF-Aufruf inklusive Cleanup.
- Tatsächliche native OCR und amtliche XBRL-Validierung wurden damit nicht nachgewiesen.
- Taxonomiebeschaffung lokal: Python HTTPS und curl lieferten HTTP 502.
- CI-Lauf 38822324764, Job 116721571385: TLS CERTIFICATE_VERIFY_FAILED / unable to get local issuer certificate. Keine TLS-Abschaltung vorgesehen.
- Exakt nächste Einheit: EB-01.02 Beschaffung mit verifizierter Zertifikatskette erneut versuchen; danach transitive Schemaabhängigkeiten EB-01.05 prüfen.
- Menschliche Mitwirkung derzeit nicht als allgemeine Blockade belegt. Plattformabnahmen, optionale Codesignatur-Zertifikate und fachliche Freigabe sind separat nachzuweisen.
- Zugehöriger PR: https://github.com/deadfrogface/InvoiceForge/pull/2

## Zweiter Arbeitsschritt

- EB-01.03: Archivimport wählt exakt ein passendes XBRL-Archiv statt sämtlicher ZIPs (Vergleich/Preview/Layout). TLS bleibt verpflichtend; optional zusätzliches CA-Bundle.
- Atomare Bereitstellung, Archiv-SHA256 in provenance.json, keine Überschreibung bestehender Pakete, Größen-/Anzahlgrenzen, Schutz vor Traversal/Symlinks/mehrdeutigen Dateinamen.
- 6/6 Python-Tests erfolgreich. Tests in Buchhaltungs-CI aufgenommen.
- Erster Remote-Commit: 5156a80de3999878adaee55be5718d90b951fe88 (PR #2). Lokaler git push hatte keine Zugangsdaten; Veröffentlichung über GitHub-Connector erfolgreich.

## Native OCR-Abnahme auf dem Linux-Host

- Echte gebündelte Poppler-/Tesseract-Prozesse: Deutsch/Englisch jeweils PNG und gerastertes PDF erkannt; digitales PDF extrahiert; beschädigtes PDF abgewiesen.
- Befehl: `python3 test/native/create-ocr-fixtures.py <temp>` und `node test/native/verify-ocr.js <temp>`. Alle sechs Eingabefälle bestanden.
- Testbelege werden reproduzierbar erzeugt; Python/Pillow/ReportLab sind ausschließlich Build-Testabhängigkeiten.
- Linux-CI führt denselben nativen Nachweis nach Staging durch. Frische Maschine ohne Systembibliotheken sowie Windows/macOS noch nicht geprüft.
- Native Binaries/Sprachdaten lokal bereitgestellt, noch kein ausgeliefertes Installationspaket.
- Zweiter Remote-Commit: 26266e19713a1881ec5dd40e79b47d5b3383ea8d.

## Buildkonfiguration und Veröffentlichung

- PK.04 Konfigurationskonflikt behoben: einzige Konfiguration in electron-builder.yml (JSON-kompatibles YAML); bestehende App-ID com.invoiceforge.app beibehalten, Plattformziele, Offline-Ressourcen und Assets integriert. Effektiver Installerbau bleibt offen.
- PK.06 Releaseworkflow verlangt jetzt vor Paketierung separat erfolgreiche Tests, Taxonomien und Laufzeitkomponenten; fehlende Komponenten werden nicht mehr ungeprüft veröffentlicht.
- Neue Konfigurationstests bestanden; aktueller Stand 53/53 JavaScript-Tests und 6/6 Python-Tests. Keine Tests gelöscht oder übersprungen.
- `verify:taxonomies` fehlgeschlagen: 6.9 und 6.10 fehlen. `verify:bundle` fehlgeschlagen: einvoice-validator fehlt. `INVOICEFORGE_OCR_ONLY=1 npm run verify:bundle` bestanden.
- Remote-Commit OCR: f18a4b43b7757d3eef40b239a5a2374b3ceeeaca.
- CI für 26266e1: Buchhaltung erfolgreich; Taxonomiestaging weiterhin fehlgeschlagen. Neuere Läufe separat prüfen.
- Keine vollständige fachliche E-Bilanz, keine abgeschlossene Steuerimplementierung, keine EN16931-Abnahme, kein plattformübergreifender Release.

## Aktueller Taxonomie-Durchbruch (ersetzt den Downloadblocker oben)

- Nach Ausfall von eSteuer alternative Originalquelle beim Rechteinhaber gefunden: https://de.xbrl.org/taxonomien/e-bilanz-taxonomie-6-10/ und https://de.xbrl.org/taxonomien/e-bilanz-hgb-taxonomie-version-6-9-2/. Beide verlinken die vollstaendigen ZIPs auf www.xbrl.de (TLS-geprüft).
- Beide Originalarchive erfolgreich heruntergeladen, feste SHA-256-Werte in PUBLISHER hinterlegt; keine TLS-Abschaltung.
- 6.9: 279 unveränderte XBRL-Dateien + Original-Disclaimer + Provenienz, Manifest mit 281 Einträgen.
- 6.10: 286 unveränderte XBRL-Dateien + Original-Disclaimer + Provenienz, Manifest mit 288 Einträgen.
- `npm run verify:taxonomies` jetzt erfolgreich für beide echten Pakete. Relative XSD-Imports vorhanden. Externe XBRL-Standardschemas noch separat offline bereitzustellen.
- Große Taxonomiedateien werden reproduzierbar beim Build bereitgestellt statt als unüberprüfbare Textkopien committed; Taxonomie-CI produziert das vollständige Artefakt. Installer resource rule vorhanden; Installation noch nicht abgenommen.
- Archivprüfungen: 8/8 Python-Tests, inklusive falschem Publisherhash und komplettem xbrl-Teilbaum samt Original-Disclaimer.
- Exakt nächster Schritt: externe XBRL-Standardschemas offline auflösen, echten XBRL-Prozessor integrieren und das Kontenmapping gegen beide Generationen erstellen.

## Reproduzierbare Installer-Beschaffung

- `npm run stage:taxonomies` integriert beide versionierten Publisherpakete vor der Releaseprüfung. Gemeinsames Quellenregister `main/taxonomy-sources.json` mit festem SHA-256 pro Originalarchiv.
- Bestehende Bereitstellung wird mit Provenienz und allen Dateihashes geprüft; abweichende oder unvollständige Daten führen zum Fehler.
- Paketinhalt: alle XBRL-Dateien aller Module, Original-Disclaimer und Herkunft. Kein Download zur Endnutzerlaufzeit.
- Lokal erfolgreich: stage:taxonomies und verify:taxonomies mit beiden echten Paketen.
- Taxonomiecommit: 4c830d2744fcae54ad0fe86460a9489012eb8591; CI dazu noch prüfen.

## Technische XBRL-DTS-Validierung

- Arelle 2.46.1 als versionierte Build-Testabhängigkeit, keine zusätzliche Installation durch Endnutzer gefordert.
- `python3 scripts/validate-taxonomy-dts.py`: GAAP fiscal und GCD shell je 6.9 und 6.10 offline geladen und technisch validiert. Alle vier Prüfungen erfolgreich. Standardschemas aus dem Arelle-Ressourcencache aufgelöst, keine Internetauflösung.
- Negativkontrolle mit ungültigem XSD-Typ korrekt abgewiesen; Arelle-Exitcode allein genügt nicht, Fehler im strukturierten Protokoll werden ausgewertet.
- Dies validiert die Taxonomie-DTS, nicht eine Unternehmens-E-Bilanz oder amtliche fachliche Melderegeln. Noch kein XBRL-Validator im Desktopinstaller.
- Neuer CI-Schritt führt denselben Offline-Nachweis nach Beschaffung aus.
- Commit für reproduzierbares Release-Staging: 8e4f5b6517d288d936905c7f85f6960a9963a15b.
- Nächster konkreter Schritt: EB-02.01 eigenen 12-Konten-Rahmen verbindlich abgrenzen und EB-02.02 Bilanzkonten einschließlich Vorzeichen/Umgliederung gegen reale GAAP-Konzepte zuordnen.

## Windows-Buildfehler 2026-10-17

- Ausgangslauf 39038701656: Node 20 unter Windows expandiert `test/*.test.js` nicht. Der nachfolgende Commit 1b88c7a mit `node --test` startete zusätzlich `test/native/verify-ocr.js` ohne vorbereitete Binärdateien/Testbelege (Fehlerlauf 39061609147).
- Plattformunabhängiger Runner `scripts/run-tests.js` übergibt alle rekursiv gefundenen `.test.js` als explizite Argumente ohne Shell. Native OCR-Abnahme bleibt unverändert im separaten Workflow nach Werkzeug-/Fixture-Staging.
- Dateipfad mit Leerzeichen, verschachtelte Testdateien und Weitergabe fehlgeschlagener Tests durch echte Kindprozesse geprüft. Keine bestehenden Tests gelöscht oder übersprungen.
- Manifest-Symlinktest verwendet unter Windows eine echte Directory-Junction statt einer privilegierten Dateiverknüpfung; die Ablehnung verlinkter Taxonomiedateien wird weiterhin geprüft.
- Buchhaltungs-CI jetzt Windows und Linux. Lokal 55/55 JavaScript-Tests und 8/8 Python-Tests erfolgreich.
- Release-Abhängigkeiten bleiben verpflichtend: Windows OCR-/Validator-Staging ist weiterhin unvollständig. Dieser Fix macht keine Aussage über ein vollständig erfolgreich erzeugtes Offline-Installationspaket.

## Windows-Alpha-Releasepfad 2026-10-18

- Ursache fehlender Releases: grüne Buchhaltungstests starteten keinen Build; Workflow reagierte nur auf Versions-Tag/manuellen Start. Außerdem kein Windows-Werkzeug-Staging vor der verpflichtenden Paketprüfung.
- Releaseworkflow reagiert nun auf erfolgreich geprüfte Pushes nach main, baut exakt den geprüften Commit und veröffentlicht automatisch als deutlich markierte Alpha-Vorabversion. Tags bleiben für explizite Versionen erhalten. Kein Release bei fehlgeschlagenen Abnahmen.
- Windows-Build stellt Poppler, Tesseract 5.5 und OpenJDK 21 über eine Buildumgebung bereit und kopiert Laufzeit, DLLs, Sprachdaten, Lizenzen und Paketmetadaten in den Installer. Endnutzer installieren diese Komponenten nicht separat.
- KoSIT 1.6.3 und offizielle XRechnung-Konfiguration 3.0.2 (2026-08-31) aus Original-Releases mit festem SHA-256; direkte Integration mit gebündeltem Java, temporäre Berichte werden bereinigt.
- Lokal echte positive XRechnung akzeptiert; fehlende Rechnungs-ID, unbekanntes XML-Schema und externe DTD abgewiesen. Originalfixture mit Apache-Lizenz im Testbestand.
- Windows-Nativabnahme vor der Paketierung und gegen die tatsächlich kopierten Installer-Ressourcen verbindlich. OCR-Testbilder unter Windows mit Systemschrift erzeugt.
- Vollständige E-Bilanz und Steuerlogik bleiben offen. Alpha-Veröffentlichung ist keine fachliche Freigabe dieser Module.
