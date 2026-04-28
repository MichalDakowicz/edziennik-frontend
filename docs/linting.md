# Linting (ESLint + Prettier)

Ten dokument opisuje jak szybko włączyć i uruchomić linting oraz pre-commit hooks w tym repozytorium.

## Szybkie kroki

1. Zainstaluj zależności deweloperskie:

```zsh
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier prettier husky lint-staged eslint-plugin-import eslint-import-resolver-typescript
```

2. Włącz Husky (utworzy folder `.husky/` z hookami po uruchomieniu):

```zsh
npm run prepare
```

3. Ręcznie uruchamianie sprawdzania i naprawy:

```zsh
npm run lint
npm run lint:fix
npm run format
```

## Co zostało dodane do repo

- `./.eslintrc.cjs` — konfiguracja ESLint dla TypeScript + React
- `./.prettierrc` — konfiguracja Prettier
- `./.eslintignore` — pliki/diry ignorowane przez ESLint
- `package.json` — nowe skrypty: `lint`, `lint:fix`, `format`, `prepare` oraz `lint-staged` konfiguracja

## Pre-commit hooks

Po uruchomieniu `npm run prepare` (Husky) oraz przy commitowaniu, `lint-staged` uruchomi `eslint --fix` i `prettier --write` dla zmienionych plików (`src/**/*.{ts,tsx,js,jsx}`). Jeśli chcesz, możesz dodatkowo dodać lub dopasować reguły w `.eslintrc.cjs`.

## Rekomendacje

- Przed pierwszym pushem uruchom `npm run lint:fix` i popraw pozostałe ostrzeżenia/rule, aby uniknąć dużych zmian w pojedynczych PR.
- W CI warto uruchomić `npm run lint` jako krok walidacyjny.
