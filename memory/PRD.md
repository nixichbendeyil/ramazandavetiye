# Fastenmonat-Kalender App PRD

## Original Problem Statement
Ramadan/Fastenmonat-Kalender App für die Verwaltung von Einladungen und Besuchen während des Ramadan. Zweisprachig (Deutsch/Türkisch). Ohne arabische Schriftzeichen.

## User Persona
- Muslimische Familien in Deutschland und der Türkei
- Organisieren Iftar-Einladungen und Besuche während des Ramadan

## User Choices
1. Authentifizierung: Keine (rein lokal)
2. Datenspeicherung: Nur localStorage (lokal)
3. Design: Emerald/Gold Palette
4. Standardsprache: Deutsch
5. PWA-fähig: Ja (installierbar auf Handy)

## Core Requirements (Static)
- Zweisprachiges Interface (Deutsch/Türkisch)
- Dashboard mit Besuchs-/Einladungsübersicht
- Kalender mit Monats-/Wochenansicht
- Farbmarkierung: Grün für "Gastgeber", Gold für "Eingeladen"
- Einkaufsliste mit Kategorien
- Rezept-Favoriten mit Bildern
- Keine arabische Schrift

## Architecture
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **State Management**: React Context + localStorage
- **i18n**: react-i18next (DE/TR)
- **PWA**: Service Worker + Web App Manifest (installierbar)
- **No Backend Authentication** - alle Daten lokal

## What's Been Implemented (Februar 2026)

### Dashboard
- ✅ Hero-Bild mit Moschee-Silhouette
- ✅ Statistik-Karten (Besuche/Einladungen Anzahl)
- ✅ Heutige Termine anzeigen
- ✅ Kommende Termine (nächste 7 Tage)
- ✅ Benutzername-Anzeige (von Einstellungen)

### Kalender
- ✅ Monatsansicht mit Farbpunkten
- ✅ Wochenansicht
- ✅ Umschaltung Monat/Woche
- ✅ Termine hinzufügen (Besuch/Einladung)
- ✅ Termine bearbeiten und löschen
- ✅ Farbmarkierung (Grün/Gold)
- ✅ Uhrzeit und Adresse für Events
- ✅ **Teilen-Funktion** (Web Share API für Mobile, Clipboard für Desktop)
- ✅ **Gästeliste** pro Event mit Zu-/Absagen-Status (pending/accepted/declined)
- ✅ **Begleiter** für "Eingeladen" Events

### Einkaufsliste
- ✅ Artikel hinzufügen mit Kategorie
- ✅ 7 Kategorien (Obst, Fleisch, Milch, etc.)
- ✅ Als erledigt markieren
- ✅ Erledigte löschen
- ✅ Kategoriebasierte Ansicht

### Rezepte
- ✅ Rezept hinzufügen mit Zutaten
- ✅ Zweisprachige Namen (DE/TR)
- ✅ Favoriten-System
- ✅ Kategoriefilter
- ✅ Bildanzeige und Zubereitungszeit

### Einstellungen
- ✅ Sprachumschaltung DE/TR
- ✅ **Mein Name** - Benutzername eingeben (zeigt auf Dashboard)
- ✅ **Erstellt von: Karasu AK58**
- ✅ App-Info und Version 1.1.0

## P0 Features (Completed)
- [x] Dashboard mit Übersicht
- [x] Kalender mit Events
- [x] Einkaufsliste
- [x] Rezepte-Favoriten
- [x] Zweisprachigkeit
- [x] PWA-Unterstützung (installierbar auf Handy)
- [x] Teilen-Funktion für Einladungen (WhatsApp, SMS, etc.)
- [x] Gästeliste mit Zu-/Absagen-Verwaltung
- [x] Benutzername-Funktion

## P1 Features (Backlog)
- [ ] Gebetszeiten-Integration (Aladhan API mit Diyanet)
- [ ] Iftar-Countdown auf Dashboard
- [ ] Stadtauswahl für Gebetszeiten
- [ ] Menüplaner direkt mit Terminen verknüpfen
- [ ] Einkaufsliste aus Rezepten generieren
- [ ] Export/Import von Daten
- [ ] Push-Benachrichtigungen für Iftar

## P2 Features (Future)
- [ ] Ramadan-Fortschrittsanzeige (Tag X von 30)
- [ ] Sahur-Wecker
- [ ] Teilen von Einladungen per Link
- [ ] Cloud-Synchronisation (optional)

## PWA Installation
Die App ist als Progressive Web App (PWA) verfügbar:
- **Android**: Chrome öffnen → "Zum Startbildschirm hinzufügen"
- **iOS**: Safari öffnen → Teilen-Button → "Zum Home-Bildschirm"
- **Desktop**: Browser-Adressleiste → Installieren-Symbol

## GitHub Repository
https://github.com/nixichbendeyil/ramazandavetiye.git

## Deployment
- Vercel (Continuous Deployment via GitHub)

## Next Action Items
1. Bei Bedarf: Gebetszeiten-Integration hinzufügen
2. Bei Bedarf: Karasu Stadt zur Liste hinzufügen
