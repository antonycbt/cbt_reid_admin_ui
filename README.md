# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
Tech Stack
------------------------------------------------------------------------------

| Layer      | Choice                        | Why                            |
| ---------- | ----------------------------- | ------------------------------ |
| Framework  | **React + TypeScript**        | Type safety, scalable          |
| Build Tool | **Vite**                      | Fast dev & build               |
| UI         | **MUI (Material UI)**         | Clean, professional admin look |
| State      | **Redux Toolkit + RTK Query** | API caching, scalable          |
| Routing    | **React Router v6**           | Standard                       |
| Charts     | **Recharts**                  | Real-time analytics            |
| Tables     | **MUI DataGrid**              | Sorting, pagination            |
| Auth       | **JWT + Role-based Guards**   | Admin / Operator               |
| Theme      | **Dark + Light mode**         | CV dashboards prefer dark      |




src/
├── app/
│   ├── store.ts
│   └── api.ts
│
├── components/
│   ├── common/
│   │   ├── AppDialog.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   └── ConfirmDelete.tsx
│   └── form/
│       ├── FormInput.tsx
│       └── FormSelect.tsx
│
├── features/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── authSlice.ts
│   ├── persons/
│   │   ├── personApi.ts
│   │   ├── PersonList.tsx
│   │   └── PersonForm.tsx
│   └── cameras/
│       ├── cameraApi.ts
│       ├── CameraList.tsx
│       └── CameraForm.tsx
│
├── layout/
│   └── DashboardLayout.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
├── main.tsx
└── App.tsx
