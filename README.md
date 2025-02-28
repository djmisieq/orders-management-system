# System zarządzania zamówieniami produkcyjnymi

Aplikacja do zarządzania zgłoszeniami zamówień produkcyjnych, umożliwiająca wprowadzanie, edycję i śledzenie zamówień oraz definiowanie własnych atrybutów w widoku przypominającym Excel.

## Architektura systemu

### Frontend
- React z biblioteką AG Grid do interfejsu użytkownika przypominającego arkusz kalkulacyjny
- Boczny pasek nawigacyjny inspirowany systemem ERA
- Dynamiczne definiowanie niestandardowych atrybutów

### Backend
- ASP.NET Core Web API
- Entity Framework Core do komunikacji z bazą danych
- Repository Pattern do organizacji dostępu do danych

### Baza danych
- PostgreSQL uruchamiana w kontenerze Docker

## Model danych

- **Orders** - główna tabela przechowująca zamówienia
- **OrderAttributes** - tabela do przechowywania niestandardowych atrybutów zamówień

## Instrukcje uruchomienia

### Uruchomienie lokalne

1. Uruchom bazę danych PostgreSQL za pomocą Docker Compose:
   ```
   docker-compose up -d
   ```

2. Uruchom backend (z katalogu głównego projektu):
   ```
   cd backend
   dotnet run
   ```

3. Uruchom frontend (z katalogu głównego projektu):
   ```
   cd frontend
   npm install
   npm start
   ```

### Uruchomienie w środowisku GitHub Codespaces

1. Otwórz projekt w GitHub Codespaces
2. Uruchom bazę danych PostgreSQL:
   ```
   docker-compose up -d
   ```
3. Uruchom backend i frontend jak w instrukcji dla środowiska lokalnego

## Rozwój iteracyjny

Aplikacja rozwijana jest w małych, iteracyjnych krokach:

1. Podstawowy szkielet frontendu i backendu
2. Wyświetlanie tabeli zamówień
3. Dodawanie, edycja i usuwanie zamówień
4. Definiowanie niestandardowych atrybutów
5. Filtrowanie, sortowanie i walidacja danych
6. Integracja API (CRUD)
7. Wdrożenie w chmurze po zakończeniu testów
