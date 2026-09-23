# DineMapper

DineMapper is a personal restaurant journal and local discovery tool. It gives diners one place to record where they have eaten, capture what they thought of each visit, and confidently choose where to eat next.

As a user, you can add restaurants you have tried, rate the food, service, and ambiance, and revisit a map and list of your experiences. When you are undecided, **Surprise Me** uses your location, preferred cuisine, and distance to recommend one of the better-rated places nearby.

From a business perspective, DineMapper is the foundation for a restaurant-discovery product: it turns individual dining feedback into aggregate restaurant scores, makes that information easy to browse geographically, and supports curated local restaurant data through Google Places. It could serve as the basis for a consumer dining app, a local food guide, or a customer-feedback experience.

Built with Next.js, TypeScript, Tailwind CSS, Sequelize, and PostgreSQL.

## Features

- Create an account and sign in with JWT-based authentication.
- Add restaurants with address, cuisine, price range, contact details, coordinates, and a personal rating.
- Score service, food quality, and ambiance; DineMapper calculates aggregate restaurant ratings.
- Browse restaurant cards and detailed restaurant pages.
- View saved restaurants on an interactive map.
- Use **Surprise Me** to choose a highly rated restaurant near the current location, with cuisine and distance filters.
- Seed restaurants for a city from the Google Places API.

## Product walkthrough

The main user journey is designed to move from discovery to a confident dining decision:

![DineMapper landing page](public/homepage-img.jpeg)

- **Landing page** — introduces DineMapper and the restaurant-journal workflow.
- **Restaurant list** — browse saved restaurants as cards with ratings and key details at [`/restaurants/list`](http://localhost:3000/restaurants/list).
- **Map view** — see restaurants geographically, with clickable pins and detail popovers at [`/restaurants/map`](http://localhost:3000/restaurants/map).
- **Surprise Me** — use location, cuisine, and distance preferences to get a nearby recommendation at [`/surpriseme`](http://localhost:3000/surpriseme).

These routes are available after starting the development server with `npm run dev`.

## Tech stack

- [Next.js](https://nextjs.org/) 16 and React 19
- TypeScript
- Tailwind CSS and Radix UI
- PostgreSQL and Sequelize
- Google Maps / Places API and Leaflet
- Zod, React Hook Form, and `jose`

## Prerequisites

- Node.js 20.9 or later
- npm
- A PostgreSQL database
- A Google Maps API key with Maps JavaScript, Geocoding, and Places APIs enabled (required for maps and restaurant seeding)

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd NextJS-Restaurant
   npm install
   ```

2. Create a PostgreSQL database and add a `.env` file in the project root:

   ```env
   DB_USERNAME=postgres
   DB_PASSWORD=your_database_password
   DB_DATABASE=dinemapper
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=replace_with_a_long_random_secret
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. Apply the database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000).

## Database commands

| Command | Description |
| --- | --- |
| `npm run db:migrate` | Run pending Sequelize migrations. |
| `npm run db:migrate:undo` | Revert the latest migration. |
| `npm run db:migrate:undo:all` | Revert all migrations. |
| `npm run db:seed` | Run Sequelize seeders, if present. |
| `npm run db:reset` | Recreate the schema by reverting and rerunning migrations and seeders. |

## Seed restaurants from Google Places

After configuring `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, seed up to 50 restaurants near a city:

```bash
npx tsx src/scripts/seedRestaurants.ts Montreal
```

This calls the Google Geocoding and Places APIs, so it may incur usage charges under your Google Cloud project.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run the configured lint command. |

## Project structure

```text
src/app/          App Router pages and API routes
src/components/   Reusable UI and restaurant components
src/contexts/     Location state and browser geolocation support
src/hooks/        Authentication hooks
src/lib/          Database, authentication, migrations, and shared helpers
src/models/       Sequelize models
src/scripts/      Restaurant seeding script
migrations/       Sequelize database migrations
```

## Notes

- Keep `.env` private; it is intentionally excluded from version control.
- The application uses browser geolocation for nearby suggestions. Users must allow the location permission for **Surprise Me** to work.
- The map and seed features depend on the corresponding Google APIs being enabled for the configured key.

## License

This project is private and does not currently specify a license.
