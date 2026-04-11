# Gdańsk Live Transport Map / Gdańsk Transport na Żywo

This project is an interactive map that displays the live positions of public transport vehicles (buses and trams) in Gdańsk, Poland. The data is fetched in real-time from the Gdańsk Open Data portal, providing an up-to-the-minute overview of the city's public transport network.

---

## English Version 🇬🇧

### 🚀 Live Demo

**https://gdansk.tojest.dev**

### ✨ Key Features

- **Live Vehicle Tracking**: Displays the real-time location of all active buses and trams on an interactive map.
- **Real-time Data**: Vehicle positions are automatically refreshed every 5 seconds.
- **Modern Detail Panel**: Click on any vehicle to see a **sleek detail panel** in the bottom-left corner with:
  - Line number and destination
  - Vehicle code
  - Current speed
  - Delay status (on-time, delayed, or ahead of schedule).
- **Route Tracing**: When a vehicle is selected, its path history for the current session is drawn on the map as a trace line.
- **Smart "Ghost" Filtering**: Vehicles that have been stationary for more than 20 minutes (e.g., end of shift, GPS errors) are automatically hidden until they move at least 100 meters, keeping the map clean.
- **Advanced Filtering**: A powerful filter panel allows you to:
  - **Filter by Line**: Show only specific line numbers (e.g., `115, 9, N1`).
  - **Filter by Vehicle Type**: View all vehicles, only buses, or only trams.
  - **Filter by Status**: See all vehicles, only those that are on time, or only delayed ones.
- **Full Customization**: A settings panel lets you personalize the map's appearance:
  - **Custom Colors**: Choose custom colors for bus and tram icons.
  - **Multiple Icon Styles**: Select from different icon shapes:
    - `Dot`: A clean circle with the line number inside (great for readability).
    - `Vehicle`: A shape representing a bus or a tram.
    - `Pin`: A classic map pin.
  - **Icon Scaling**: Adjust the size of vehicle icons from 50% to 200% using a convenient slider.
- **Dark Mode**: A fully-featured dark mode for comfortable viewing in low-light conditions. The theme toggle affects all UI elements, including the map tiles.
- **Responsive Design**: The interface is optimized for both desktop and mobile devices.
- **Persistent Settings**: Your preferences for colors, icons, scale, and theme are automatically saved in your browser's local storage.
- **Smart Error Handling**: Displays user-friendly notifications in case of API connection issues or data loading failures.
- **Optimized Performance**: Vehicle types (bus vs. tram) are determined instantly using smart line number detection, eliminating the need to download heavy route databases and ensuring lightning-fast initial load times.

### 🛠️ Technology Stack

- **Frontend**: React, TypeScript
- **Mapping**: Leaflet & React-Leaflet
- **Styling**: Tailwind CSS
- **Data Source**: [Gdańsk Open Data API](https://ckan.multimediagdansk.pl/)
- **CORS Proxy**: The app uses `api.allorigins.win` and `corsproxy.io` to bypass browser CORS limitations when fetching data from the public API.

---

## Wersja Polska 🇵🇱

### 🚀 Demo na Żywo

**https://gdansk.tojest.dev**

### ✨ Kluczowe Funkcjonalności

- **Śledzenie Pojazdów na Żywo**: Wyświetla w czasie rzeczywistym pozycje wszystkich aktywnych autobusów i tramwajów na interaktywnej mapie.
- **Dane w Czasie Rzeczywistym**: Pozycje pojazdów są automatycznie odświeżane co 5 sekund.
- **Nowoczesny Panel Szczegółów**: Kliknij na dowolny pojazd, aby zobaczyć **elegancki panel** w lewym dolnym rogu ekranu z informacjami takimi jak:
  - Numer linii i kierunek
  - Numer taborowy pojazdu
  - Aktualna prędkość
  - Status punktualności (punktualnie, opóźniony lub przyspieszony).
- **Ślad Trasy**: Po wybraniu pojazdu, na mapie rysowana jest linia pokazująca jego przebytą trasę w trakcie bieżącej sesji.
- **Inteligentne Filtrowanie "Duchów"**: Pojazdy, które stoją w miejscu dłużej niż 20 minut (np. koniec zmiany, błąd GPS), są automatycznie ukrywane, dopóki nie ruszą w dalszą trasę (przesunięcie o min. 100m).
- **Zaawansowane Filtrowanie**: Rozbudowany panel filtrowania pozwala na:
  - **Filtrowanie po Linii**: Wyświetlaj tylko wybrane numery linii (np. `115, 9, N1`).
  - **Filtrowanie po Typie Pojazdu**: Zobacz wszystkie pojazdy, tylko autobusy lub tylko tramwaje.
  - **Filtrowanie po Statusie**: Wyświetlaj wszystkie pojazdy, tylko te punktualne lub tylko opóźnione.
- **Pełna Personalizacja**: Panel ustawień pozwala dostosować wygląd mapy:
  - **Własne Kolory**: Wybierz dowolne kolory dla ikon autobusów i tramwajów.
  - **Różne Style Ikon**: Wybieraj spośród różnych kształtów ikon:
    - `Kropka`: Czytelne kółko z numerem linii w środku.
    - `Pojazd`: Kształt przypominający autobus lub tramwaj.
    - `Pinezka`: Klasyczna pinezka mapowa.
  - **Skalowanie Ikon**: Dostosuj rozmiar ikon pojazdów w zakresie od 50% do 200% za pomocą wygodnego suwaka.
- **Tryb Ciemny**: W pełni funkcjonalny tryb ciemny dla komfortowego użytkowania przy słabym oświetleniu. Przełącznik motywu wpływa na wszystkie elementy interfejsu, łącznie z kafelkami mapy.
- **Responsywny Design**: Interfejs został zoptymalizowany do działania na komputerach i urządzeniach mobilnych.
- **Zapamiętywanie Ustawień**: Twoje preferencje dotyczące kolorów, ikon, skali i motywu są automatycznie zapisywane w pamięci lokalnej przeglądarki.
- **Inteligentna Obsługa Błędów**: Aplikacja wyświetla przyjazne dla użytkownika powiadomienia w przypadku problemów z połączeniem API lub błędów ładowania danych.
- **Zoptymalizowana Wydajność**: Typy pojazdów (autobus vs tramwaj) są określane natychmiastowo za pomocą inteligentnego wykrywania numerów linii, eliminując potrzebę pobierania ciężkich baz danych tras i zapewniając błyskawiczne ładowanie początkowe mapy.

### 🛠️ Stos Technologiczny

- **Frontend**: React, TypeScript
- **Mapa**: Leaflet & React-Leaflet
- **Style**: Tailwind CSS
- **Źródło Danych**: [Otwarty Gdańsk API](https://ckan.multimediagdansk.pl/)
- **Proxy CORS**: Aplikacja wykorzystuje `api.allorigins.win` oraz `corsproxy.io` do ominięcia ograniczeń CORS w przeglądarkach podczas pobierania danych z publicznego API.
