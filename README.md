# BB Creation Panel

Production-ready Next.js 16 application for the Based Bid creation panel.

## Requirements

- Node.js 24.18.0 (see `.nvmrc`)
- npm 11.17.0 or compatible

## Install

Use the lockfile for a reproducible install:

```bash
npm ci
```

## Development

```bash
npm run dev
```

The default development URL is `http://localhost:3000`.

## Production

```bash
npm ci
npm run lint
npm run build
npm run start
```

The production server uses port `3000` by default. Set `PORT` to override it.

## PM2

After installing dependencies and creating the production build:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## Release Contents

The production source archive intentionally excludes generated output, dependencies, logs, local environment files, previous releases, and the separate reference deck. Run `npm ci` and `npm run build` after extracting it.

## Changelogs

- [User changelog](CHANGELOG.md)
- [Developer changelog](CHANGELOG-DEVELOPERS.md)
