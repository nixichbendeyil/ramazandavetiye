# Fastenmonat-Kalender App PRD

## Original Problem Statement
Ramadan/Fastenmonat-Kalender App für die Verwaltung von Einladungen und Besuchen während des Ramadan. Zweisprachig (Deutsch/Türkisch). Ohne arabische Schriftzeichen.

## User Persona
- Muslimische Familien in Deutschland und der Türkei
- Organisieren Iftar-Einladungen und Besuche während des Ramadan
- Benötigen Gebetszeiten für ihre Stadt

## User Choices
1. Gebetszeiten-API: Aladhan (kostenlos)
2. Authentifizierung: Keine
3. Datenspeicherung: Nur localStorage (lokal)
4. Design: Design Agent Entscheidung (Emerald/Gold Palette)
5. Standardsprache: Deutsch

## Core Requirements (Static)
- Zweisprachiges Interface (Deutsch/Türkisch)
- Dashboard mit Iftar-Countdown und Gebetszeiten
- Kalender mit Monats-/Wochenansicht
- Farbmarkierung: Grün für "Gastgeber", Gold für "Eingeladen"
- Einkaufsliste mit Kategorien
- Rezept-Favoriten mit Bildern
- Stadtauswahl für Deutschland und Türkei
- Keine arabische Schrift

## Architecture
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **State Management**: React Context + localStorage
- **API**: Aladhan Prayer Times API
- **i18n**: react-i18next (DE/TR)
- **PWA**: Service Worker + Web App Manifest (installierbar)
- **No Backend Authentication** - alle Daten lokal

## What's Been Implemented (February 2026)

### Dashboard
- ✅ Hero-Bild mit Moschee-Silhouette
- ✅ Iftar-Countdown mit Live-Timer
- ✅ Gebetszeiten von Aladhan API
- ✅ Heutige Termine anzeigen
- ✅ Stadtanzeige

### Kalender
- ✅ Monatsansicht mit react-day-picker
- ✅ Wochenansicht
- ✅ Umschaltung Monat/Woche
- ✅ Termine hinzufügen (Besuch/Einladung)
- ✅ Termine bearbeiten und löschen
- ✅ Farbmarkierung (Grün/Gold)
- ✅ Namen direkt im Kalender anzeigen

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
- ✅ Länderauswahl (Deutschland/Türkei)
- ✅ Stadtauswahl (15 Städte pro Land)
- ✅ App-Info

## P0 Features (Completed)
- [x] Dashboard mit Countdown
- [x] Gebetszeiten-Integration
- [x] Kalender mit Events
- [x] Einkaufsliste
- [x] Rezepte-Favoriten
- [x] Zweisprachigkeit
- [x] Stadtauswahl
- [x] PWA-Unterstützung (installierbar auf Handy)

## P1 Features (Backlog)
- [ ] Menüplaner direkt mit Terminen verknüpfen
- [ ] Einkaufsliste aus Rezepten generieren
- [ ] Export/Import von Daten
- [ ] Push-Benachrichtigungen für Iftar

## P2 Features (Future)
- [ ] Ramadan-Fortschrittsanzeige (Tag X von 30)
- [ ] Sahur-Wecker
- [ ] Teilen von Einladungen per Link
- [ ] Cloud-Synchronisation (optional)

## PWA Installation (Februar 2026)
Die App ist jetzt als Progressive Web App (PWA) verfügbar:
- **Android**: Chrome öffnen → "Zum Startbildschirm hinzufügen"
- **iOS**: Safari öffnen → Teilen-Button → "Zum Home-Bildschirm"
- **Desktop**: Browser-Adressleiste → Installieren-Symbol

### PWA-Features:
- Eigenes App-Icon (Mondsichel + Kalender)
- Standalone-Modus (ohne Browser-Leiste)
- Offline-Unterstützung (Cache)
- Schnellstart vom Homescreen

## Next Action Items
1. Menüplaner mit Kalender-Events verknüpfen
2. Automatische Einkaufslisten-Generierung aus Rezepten
3. Wochenansicht verbessern mit mehr Details
