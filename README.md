# Streamish Music

Streamish is a self-hosted music server and browser interface that aims to provide compatibility with popular mobile music apps while allowing users to maintain control over their music library.

Screenshots: https://streamish.github.io

API documentation: https://streamish.github.io/api

Server: https://github.com/streamish/music-server

Web UI: https://github.com/streamish/music-webui

Docker: https://hub.docker.com/r/streamish/music

# About the Music Web UI

This React web app provides a responsive browser interface for enjoying your music library, and managing user accounts, root folders and sessions for the [music-server](https://github.com/musiclib/music-server).

The goal of this project is to provide a default web interface for managing your users and music library, and streaming your music collection to a laptop, desktop or anywhere else you prefer a browser over smartphone apps.

If you are using the [docker image](https://hub.docker.com/r/streamish/music) this server is set up automatically.

## Manual set up

This software can be set up manually by following these steps:

1.  Set your `VITE_API_BASE_URL` environment variable to point to your music-server instance. For example, if your music-server is running on `http://localhost:7000` set `VITE_API_BASE_URL=http://localhost:7000`.

2.  Set your `PORT` environment variable to the port you want the web interface to run on. For example, if you want it to run on port `http://localhost:8000` set `PORT=8000`.

3.  If you are accessing the web interface across your network configure the `HOST` address to be available on your work by setting `HOST=0.0.0.0` for all network interfaces, or `HOST=<specific ip>`.

4.  Set up the NodeJS project

```bash
$ npm install
$ npm run build
```

5.  Start the web interface

```bash
$ npm run start:prod
```

## Running tests

The frontend uses Playwright for end-to-end testing of the web interface across different browsers and device specifications. This requires the full software to be running in test mode, including the backend music server.

Backend:

```bash
$ git clone https://github.com/musiclib/music-server.git
$ cd music-server
$ npm ci
$ npm run start:test
```

Frontend:

```bash
$ npx playwright install --with-deps
$ npm run build:test
$ npm run start:test
```

When the servers have finished starting you can run the tests:

```bash
$ npm run test
```

You can test a single configuration:

```bash
$ npm run test -- --project=chromium
$ npm run test -- --project=firefox
$ npm run test -- --project=webkit
$ npm run test -- --project=mobile-chrome
$ npm run test -- --project=mobile-safari
$ npm run test -- --project=samsung
$ npm run test -- --project=ipad
$ npm run test -- --project=android-tablet
```

## Linting

The TypeScript configuration is deliberately strict, and the linting uses AirBNB's style guide as-is, complemented with import ordering and filename/folder naming conventions.

```bash
$ npm run lint
$ npm run prettier
```
