# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Getting started

Install the project dependencies before running any of the npm scripts:

```bash
cd auto-battler-react
npm install
```

This installs `@eslint/js` and the other development dependencies required for linting. After the packages are installed you can run the development server or lint the project:

```bash
npm run dev   # start the Vite dev server
npm run lint  # run ESLint
```

## Viewing Battle Replays

Run the Vite dev server and open `/replay?id=<battleId>` in the browser to see an animated replay.
The viewer fetches data from `/api/replay.php` and steps through each turn using the
components under `src/components/replay/`.
