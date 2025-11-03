# Gdańsk Live Transport Map / Gdańsk Transport na Żywo

This project is an interactive map that displays the live positions of public transport vehicles (buses and trams) in Gdańsk, Poland. The data is fetched in real-time from the Gdańsk Open Data portal, providing an up-to-the-minute overview of the city's public transport network.

---

## English Version 🇬🇧

![Print screen](https://github.com/SQ2MTG/GdanskTransportAPI/blob/main/Przechwytywanie2.PNG)

### ✨ Key Features

- **Live Vehicle Tracking**: Displays the real-time location of all active buses and trams on an interactive map.
- **Real-time Data**: Vehicle positions are automatically refreshed every 5 seconds.
- **Detailed Vehicle Information**: Click on any vehicle to see a popup with details such as:
  - Line number and destination
  - Vehicle code
  - Current speed
  - Delay status (on-time, delayed, or ahead of schedule).
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
- **Dark Mode**: A fully-featured dark mode for comfortable viewing in low-light conditions. The theme toggle affects all UI elements, including the map tiles.
- **Responsive Design**: The interface is optimized for both desktop and mobile devices.
- **Persistent Settings**: Your preferences for colors, icons, and theme are automatically saved in your browser's local storage.
- **Smart Error Handling**: Displays user-friendly notifications in case of API connection issues or data loading failures.

### 🛠️ Technology Stack

- **Frontend**: React, TypeScript
- **Mapping**: Leaflet & React-Leaflet
- **Styling**: Tailwind CSS
- **Data Source**: [Gdańsk Open Data API](https://ckan.multimediagdansk.pl/)
- **CORS Proxy**: The app uses `api.allorigins.win` to bypass browser CORS limitations when fetching data from the public API.

---

## Wersja Polska 🇵🇱

![Print screen](https://github.com/SQ2MTG/GdanskTransportAPI/blob/main/Przechwytywanie2.PNG)

### ✨ Kluczowe Funkcjonalności

- **Śledzenie Pojazdów na Żywo**: Wyświetla w czasie rzeczywistym pozycje wszystkich aktywnych autobusów i tramwajów na interaktywnej mapie.
- **Dane w Czasie Rzeczywistym**: Pozycje pojazdów są automatycznie odświeżane co 5 sekund.
- **Szczegółowe Informacje o Pojazdach**: Kliknij na dowolny pojazd, aby zobaczyć dymek z informacjami, takimi jak:
  - Numer linii i kierunek
  - Numer taborowy pojazdu
  - Aktualna prędkość
  - Status punktualności (punktualnie, opóźniony lub przyspieszony).
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
- **Tryb Ciemny**: W pełni funkcjonalny tryb ciemny dla komfortowego użytkowania przy słabym oświetleniu. Przełącznik motywu wpływa na wszystkie elementy interfejsu, łącznie z kafelkami mapy.
- **Responsywny Design**: Interfejs został zoptymalizowany do działania na komputerach i urządzeniach mobilnych.
- **Zapamiętywanie Ustawień**: Twoje preferencje dotyczące kolorów, ikon i motywu są automatycznie zapisywane w pamięci lokalnej przeglądarki.
- **Inteligentna Obsługa Błędów**: Aplikacja wyświetla przyjazne dla użytkownika powiadomienia w przypadku problemów z połączeniem API lub błędów ładowania danych.

### 🛠️ Stos Technologiczny

- **Frontend**: React, TypeScript
- **Mapa**: Leaflet & React-Leaflet
- **Style**: Tailwind CSS
- **Źródło Danych**: [Otwarty Gdańsk API](https://ckan.multimediagdansk.pl/)
- **Proxy CORS**: Aplikacja wykorzystuje `api.allorigins.win` do ominięcia ograniczeń CORS w przeglądarkach podczas pobierania danych z publicznego API.
