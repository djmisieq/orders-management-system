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

## Uruchomienie w GitHub Codespaces

Aby uruchomić projekt w środowisku GitHub Codespaces:

1. Kliknij przycisk "Code" na górze repozytorium
2. Wybierz zakładkę "Codespaces"
3. Kliknij "Create codespace on main"
4. Poczekaj na utworzenie i inicjalizację środowiska

Po załadowaniu środowiska:

1. Uruchom bazę danych:
   ```
   docker-compose up -d
   ```

2. Uruchom backend:
   ```
   cd backend
   dotnet run
   ```

3. W nowym terminalu uruchom frontend:
   ```
   cd frontend
   npm start
   ```

Aplikacja będzie dostępna pod adresem:
- Frontend: https://[codespace-url]-3000.app.github.dev
- Backend: https://[codespace-url]-5000.app.github.dev
- Swagger API: https://[codespace-url]-5000.app.github.dev/swagger

## Lokalne uruchomienie

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

## Testowanie API

Przykładowe zapytania do API:

### Pobranie wszystkich zamówień
```
GET http://localhost:5000/api/orders
```

### Pobranie zamówienia po ID
```
GET http://localhost:5000/api/orders/1
```

### Utworzenie nowego zamówienia
```
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customerName": "Nowy Klient",
  "orderDate": "2023-03-15T00:00:00",
  "quantity": 15,
  "status": "New",
  "description": "Nowe zamówienie testowe"
}
```

### Aktualizacja zamówienia
```
PUT http://localhost:5000/api/orders/1
Content-Type: application/json

{
  "id": 1,
  "customerName": "ACME Corp (Zaktualizowane)",
  "orderDate": "2023-01-15T00:00:00",
  "quantity": 12,
  "status": "In Progress",
  "description": "Zaktualizowane zamówienie"
}
```

### Usunięcie zamówienia
```
DELETE http://localhost:5000/api/orders/3
```

## Rozwój iteracyjny

Aplikacja rozwijana jest w małych, iteracyjnych krokach:

1. Podstawowy szkielet frontendu i backendu
2. Wyświetlanie tabeli zamówień
3. Dodawanie, edycja i usuwanie zamówień
4. Definiowanie niestandardowych atrybutów
5. Filtrowanie, sortowanie i walidacja danych
6. Integracja API (CRUD)
7. Wdrożenie w chmurze po zakończeniu testów