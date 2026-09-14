# Music Web UI

This software provides a responsive web interface for enjoying your music library, and managing user accounts, root folders and sessions for the [music-server](https://github.com/musiclib/music-server).

If you are using the music-server docker image this server is set up automatically in its docker image. You can access it at `http://<your-server-ip>:8000` and log in with the default administrator account `admin` with password `admin` or whatever you set the `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` environment variables in your environment settings to.

## Docker Image

This is the official docker image combining [music-server](https://github.com/musiclib/music-server) and [music-webui](https://github.com/musiclib/music-webui). Internally it builds the `music-server` backend and the `music-webui` frontend and uses Nginx to serve the frontend and proxy the backend off the same port.

```bash
$ docker run \
  -p 8000:8000 \
  -v /my/music:/music:ro \
  -v /my/data:/data:rw \
  -e DEFAULT_ADMIN_USERNAME=admin \
  -e DEFAULT_ADMIN_PASSWORD=admin \
  -e DISABLE_DEFAULT_USER=true \
  -e SYNOLOGY_AUDIOSTATION_ENABLED=true \
  -e QNAP_MUSICSTATION_ENABLED=true \
  streamish/music
```

| Variable                  | Default value | Description                                                         |
| ------------------------- | ------------- | ------------------------------------------------------------------- |
| `DEFAULT_ADMIN_USERNAME`  | `admin`       | The username for the default administrator account                  |
| `DEFAULT_ADMIN_PASSWORD`  | `admin`       | The password for the default administrator account                  |
| `DEFAULT_ADMIN_ROOT_PATH` |               | Comma-separated list of paths for the default administrator account |
| `DISABLE_DEFAULT_USER`    | false         | Set to `true` to disable creating the default normal user account   |
| `DEFAULT_USER_USERNAME`   | `user`        | The username for the default normal user account                    |
| `DEFAULT_USER_PASSWORD`   | `user`        | The password for the default normal user account                    |
| `DEFAULT_USER_ROOT_PATH`  |               | Comma-separated list of paths for the default normal user account   |

You can enable API compatibility:

| Variable                        | Default value | Description                                                      |
| ------------------------------- | ------------- | ---------------------------------------------------------------- |
| `SYNOLOGY_AUDIOSTATION_ENABLED` | false         | Set to `true` to enable Synology Audio Station API compatibility |
| `QNAP_MUSICSTATION_ENABLED`     | false         | Set to `true` to enable QNAP Music Station API compatibility     |

You can enable Swagger API interface for the backend APIs:

| Variable          | Default value | Description                                   |
| ----------------- | ------------- | --------------------------------------------- |
| `SWAGGER_ENABLED` | false         | Set to `true` to enable Swagger documentation |

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

## Technical details

The web interface is built with React using React Hook Forms, React-Router, Tanstack-Query, Shadcn components with Tailwind CSS and Lucide icons.

UI tests are performed using Playwright in Chrome, Firefox and WebKit using desktop and mobile specifications.

It leverages the backend's OpenAPI specification for importing API type definitions and typed-API clients using `openapi-typescript` and `openapi-fetch`.
