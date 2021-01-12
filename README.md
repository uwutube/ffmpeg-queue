<div align="center">
  <p align="center">
    <img src="https://raw.githubusercontent.com/uwutube-bot/uwutube-bot/main/logo-banner.svg" alt="uwutube banner">
    <b>a FIFO queue system for FFmpeg jobs for uwutube next.</b>
    <a href="https://github.com/uwutube/ffmpeg-queue/wiki">Documentation</a> |
    <a href="https://github.com/uwutube/ffmpeg-queue/issues">Issues</a> |
    <a href="https://github.com/uwutube/ffmpeg-queue/pulls">Pull Requests</a>
  </p>
  <p align="center">
      <img src="https://img.shields.io/github/repo-size/uwutube/ffmpeg-queue?style=flat-square" alt="Repo Size">
      <img src="https://img.shields.io/github/contributors/uwutube/ffmpeg-queue?style=flat-square" alt="Contributors">
      <img src="https://img.shields.io/github/stars/uwutube/ffmpeg-queue?style=flat-square" alt="Stars"> 
      <img src="https://img.shields.io/github/forks/uwutube/ffmpeg-queue?style=flat-square" alt="Forks">
      <img src="https://img.shields.io/github/license/uwutube/ffmpeg-queue?style=flat-square" alt="License">
      <img src="https://img.shields.io/github/issues/uwutube/ffmpeg-queue?style=flat-square" alt="Issues">
  </p>
</div>

## Running Locally

These instructions allow you to run ffmpeg-queue locally for development; please don't use these for production - instead, see the
"Deploying" section below.

### Using Docker

ffmpeg-queue has been configured for full use with Docker Compose. In order to use this, simply enter the main project directory
and run `docker compose up`.

### Manually

This manual method of running ffmpeg-queue is not recommended and does not include all components required to run the website. It
is highly recommended that you run ffmpeg-queue using Docker.

#### Backend

The backend is designed to pool multiple different connections (Firebase, database, etc.) into one easy-to-use,
straightforward API that can be used by both the frontend and any third-party applications that wish to use ffmpeg-queue's
public data.

To prepare the backend, enter the directory and install dependencies thru `yarn install`.
To run the backend, enter the directory and run `yarn start`.

#### Frontend

The frontend is where all the magic happens - this is where the user interacts with ffmpeg-queue, and is used as a base for both
the desktop web app and the mobile PWA.

To prepare the frontend, enter the directory and install dependencies thru `yarn install`.
To run the backend, enter the directory and run `yarn start`.

#### Proxy

The reverse proxy allows for only one port to be exposed publicly, with requests on the `/api` endpoint being redirected to
the Express-based backend / API and all other requests being redirected to the Nuxt-based frontend.

To prepare the proxy, enter the directory and install dependencies thru `yarn install`.
To run the proxy, enter the directory and run `yarn start`.

## Deploying

Before deploying, please:

- Run `git pull` to ensure that you have the lastest version of the code, ensuring that all security fixes and patches are 
applied;
- Ensure that all config files are filled with correct information;
- Run `yarn audit` to ensure that there are no packages with security vulnerabilities.

**Please be aware that none of the contributors to this project can be held responsible for data loss, pwnage / leaks, 
compromised accounts, etc.**

### Using Docker

TODO

### Manually

#### Backend

TODO

#### Frontend

To deploy the frontend:

```bash
# Install dependencies
yarn install

# Build for production
yarn build

# Launch server
yarn start
```

#### Proxy

TODO

## License

Unless otherwise stated, files in this repository are provided under the `GNU AGPLv3`:

```
ffmpeg-queue - a simple FIFO queue system for FFmpeg jobs

Copyright (C) 2021 Alex Guthrie

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

In addition to these terms, as per `Section 7` of the license, the following additional terms are in effect:

```
Trademark use

This license does not grant any rights to use any trademarks 
associated with this program, including the trademark "uwutube", any 
logos associated with "uwutube" (such as the "uwutube" logo), or any 
other "uwutube" trademarks. This license also does not grant 
authorization to use the "uwutube" name or the names of any 
contributor for any purpose without written permission.
```

A copy of the `GNU AGPLv3` is available within `LICENSE.md`, or at [gnu.org](https://www.gnu.org/licenses/#AGPL).
