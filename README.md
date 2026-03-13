<div align="center">

![Static Badge](https://img.shields.io/badge/node.js-grey?logo=nodedotjs) ![GitHub stars](https://img.shields.io/github/stars/kacalayar/aniapi?logo=github)
![GitHub forks](https://img.shields.io/github/forks/kacalayar/aniapi?logo=github)
![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)

</div>

## <span>Disclaimer</span>

1.  This `api` does not store any files , it only link to the media which is hosted on 3rd party services.

2.  This `api` is explicitly made for educational purposes only and not for commercial usage. This repo will not be responsible for any misuse of it.

<p align="center">
      <img
        src="./public/anya.gif"
        width="200"
        height="200"
      />
    </p>

# <p align="center">Anime API</p>

>

<p align="center">RestFul API made with Node.js <br/>(Checkout this anime streaming website  <a href="https://zenime.site" target="_blank">Zenime</a> powered by this API)</p>

> <h2> Table of Contents </h2>

- [Installation](#installation)
  - [Local installation](#local-installation)
- [Deployment](#deployment)
  - [Vercel](#Vercel)
  - [Render](#Render)
- [API Documentation](#api-documentation)
- [API Endpoints Overview](#api-endpoints-overview)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)
- [Support](#support)

> # Installation

## Local installation

Make sure you have node installed on your device

1. Run the following code to clone the repository and install all required dependencies

```bash
$ git clone https://github.com/kacalayar/aniapi.git
$ cd aniapi
$ npm install
```

2. Refer the [.env.example](https://github.com/kacalayar/aniapi/blob/main/.env.example) file to setup `.env` file

```bash
# Origins you want to allow

ALLOWED_ORIGIN=<https://site1.com>,<https://site2.com>,...
```

3. Start the server

```bash
$ npm start #or npm run dev
```

> # Deployment

### Vercel

Host your own instance of anime-api on vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kacalayar/aniapi)

### Render

Host your own instance of anime-api on Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/kacalayar/aniapi)

> # API Documentation

Full interactive API documentation is available at:

```
<your-deployment-url>/docs.html
```

The documentation is powered by [Swagger UI](https://swagger.io/tools/swagger-ui/) with an [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3) specification. You can:

- Browse all available endpoints grouped by category
- View request parameters and response schemas
- Try out API calls directly from the browser
- Download the OpenAPI spec at `/openapi.json` for use with Postman, Insomnia, or code generators

> # API Endpoints Overview

| Endpoint | Description |
| :--- | :--- |
| `GET /api` | Homepage data (spotlights, trending, schedules, etc.) |
| `GET /api/top-ten` | Top 10 anime (today, week, month) |
| `GET /api/top-search` | Currently most searched anime |
| `GET /api/info?id={slug}` | Full anime details |
| `GET /api/random` | Random anime with full details |
| `GET /api/random/id` | Random anime slug |
| `GET /api/qtip/{id}` | Quick-tip popup data |
| `GET /api/{category}?page={n}` | Browse by category, genre, or A-Z list |
| `GET /api/producer/{slug}?page={n}` | Anime by producer/studio |
| `GET /api/search?keyword={text}` | Search anime |
| `GET /api/filter` | Advanced filter with multiple criteria |
| `GET /api/search/suggest?keyword={text}` | Search autocomplete suggestions |
| `GET /api/episodes/{slug}` | Episode list for an anime |
| `GET /api/servers/{slug}?ep={id}` | Available streaming servers |
| `GET /api/stream?id={slug}?ep={id}&server={name}&type={sub\|dub}` | Stream sources |
| `GET /api/stream/fallback?id={slug}?ep={id}&server={name}&type={sub\|dub}` | Fallback stream sources |
| `GET /api/schedule?date={YYYY-MM-DD}` | Airing schedule for a date |
| `GET /api/schedule/{slug}` | Next episode schedule |
| `GET /api/character/list/{slug}?page={n}` | Characters & voice actors for an anime |
| `GET /api/character/{slug}` | Character details |
| `GET /api/actors/{slug}` | Voice actor details |
| `GET /api/watchlist/{userId}/{page}` | User watchlist |

**Available servers for streaming:** `vidstreaming`, `vidcloud`, `douvideo` (legacy: `hd-1`, `hd-2`)

> ### Pull Requests

- Pull requests are welcomed that address bug fixes, improvements, or new features.
- Fork the repository and create a new branch for your changes.
- Ensure your code follows our coding standards.
- Include tests if applicable.
- Describe your changes clearly in the pull request, explaining the problem and solution.

> ### Reporting Issues

If you discover any issues or have suggestions for improvement, please open an issue. Provide a clear and concise description of the problem, steps to reproduce it, and any relevant information about your environment.

> ### Support
>
> If you like the project feel free to drop a star. Your appreciation means a lot.

<p align="center" style="text-decoration: none;">Made by <a href="https://github.com/kacalayar" target="_blank">kacalayar
</a></p>
