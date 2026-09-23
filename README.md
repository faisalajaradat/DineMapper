# DineMapper

### Remember where you ate. Decide where to eat next.

DineMapper is a restaurant journal and local discovery product for diners who want to revisit past experiences and spend less time choosing their next meal. It brings restaurant browsing, geographic context, dining feedback, and nearby recommendations into one experience.

**Product vision:** turn personal dining history into a useful decision-making tool, helping users move from an overwhelming list of options to a confident restaurant choice.

[Product walkthrough](#product-walkthrough) · [Product decisions](#product-decisions) · [Technical overview](#technical-overview) · [Run locally](#run-locally)

## The user problem

A diner has two related needs: “What did I think of the places I've tried?” and “Where should I go tonight?” A saved name alone does not capture the experience, and a long list of restaurants does not necessarily make the next decision easier.

DineMapper is designed for repeat local diners and people exploring a city. Its intended value is a shorter path from discovery to a decision, with food, service, and ambiance feedback that makes past visits easier to remember.

From a business perspective, DineMapper creates repeat value around a recurring decision. City-level imports establish useful restaurant coverage, while diner contributions make the catalog richer and more relevant over time.

## Product walkthrough

**Discover → compare → choose → record an experience → return.**

These are actual captures of DineMapper using imported Montreal listings and a dedicated demo account. The personal dashboard includes two clearly labeled sample restaurants to demonstrate ratings and journal history.

### 1. Discover: landing page

The landing page introduces the journal, summarizes the catalog, and provides entry points into browsing and contributing. Top-rated and recently added sections make restaurants accessible from the first screen.

![DineMapper landing page showing the product introduction and restaurant statistics](docs/screenshots/landing.jpg)

### 2. Compare: restaurant list and map

Cards offer a scannable view of names, addresses, cuisines, and aggregate ratings. The map provides geographic context, with clickable pins that link to restaurant details.

![Montreal restaurant cards with addresses, cuisines, and rating indicators](docs/screenshots/restaurants.jpg)

![Montreal map with restaurant pins and an open Five Guys address popup](docs/screenshots/map.jpg)

### 3. Choose: Surprise Me

Choose a cuisine and a distance from 1–50 km, then request a suggestion. The app filters restaurants by straight-line distance and cuisine, sorts matches by aggregate rating, and randomly selects one of the top five (or all matches if fewer than five exist). The result provides the address, distance, and a link to restaurant details.

The recommendation logic is transparent and focused: DineMapper filters by cuisine and straight-line distance, ranks matching restaurants by aggregate rating, and adds variety by choosing from the top five results.

### 4. Record and revisit: dashboard and rating form

After sign-in, the personal dashboard lists restaurants associated with the user's ratings and supports search by name, address, or cuisine. Its **+** control opens a form for restaurant details, cuisine, meal, food quality, service, ambiance, and notes.

The populated dashboard demonstrates how users can build a personal restaurant history, while the contribution form captures the context behind each visit.

| Personal dashboard | Add restaurant and ratings |
| --- | --- |
| ![Demo dashboard populated with two sample restaurants, aggregate star ratings, search, and an add control](docs/screenshots/dashboard.jpg) | ![Restaurant form with cuisine, meal, three rating categories, and notes](docs/screenshots/add-rating.jpg) |
| Revisit rated restaurants: Demo Bistro and Maple Table are fictional examples. | Capture multiple aspects of a dining experience. |

### Supporting pages

| Restaurant details | Profile |
| --- | --- |
| ![Rated Demo Bistro sample restaurant details with cuisine, sample contact information, and price range](docs/screenshots/details.jpg) | ![Demo account profile with an email update field](docs/screenshots/profile.jpg) |
| Inspect a rated sample's cuisine, location, price range, and contact information. | View account information and manage the profile email. |

| Sign up | Sign in |
| --- | --- |
| ![Sign-up form with email, password, and confirmation](docs/screenshots/signup.jpg) | ![Sign-in form with email and password](docs/screenshots/signin.jpg) |
| Create an account for the personal journal. | Return to the personal dashboard. |

<details>
<summary>Catalog operations: admin restaurant import</summary>

The admin page accepts a city and restaurant limit for Google Places import, establishing catalog coverage before users contribute. This capture shows the controls; no paid import was submitted for it.

![Admin import page with Montreal entered and a restaurant limit of 50](docs/screenshots/admin.jpg)

</details>

### Page directory

The page directory shows how the core experience is organized across the application.

| Page | Route | Current role |
| --- | --- | --- |
| Landing | `/` | Product introduction and catalog discovery |
| Restaurant list | `/restaurants/list` | Browse restaurant cards |
| Interactive map | `/restaurants/map` | Explore pins and open details |
| Restaurant details | `/restaurants/[id]` | Inspect one restaurant |
| Surprise Me | `/surpriseme` | Request a nearby recommendation |
| Personal dashboard | `/home` | Search rated restaurants; open the add/rating dialog |
| Add restaurant | `/home` | Open the contribution form with the dashboard's **+** control |
| Sign up | `/signup` | Account registration |
| Sign in | `/signin` | Account authentication |
| Profile | `/profile` | Account information and email update control |
| Admin import | `/admin` | City-based catalog import controls |

## Product decisions

| Decision | User value | Product rationale |
| --- | --- | --- |
| List and map browsing | Support quick comparison and geographic exploration | Users can switch between information density and spatial context |
| Food, service, and ambiance ratings | Capture more context than a single overall score | Structured feedback makes past experiences easier to recall and compare |
| One suggestion from the top five matches | Reduce choice overload while preserving variety | A bounded candidate set balances quality and discovery |
| Cuisine and distance filters | Offer simple, understandable controls | Users can shape recommendations without a complex onboarding flow |
| City catalog imports | Establish useful local coverage quickly | A populated catalog creates value from the first browsing session |

## Technical overview

Next.js 16, React 19, TypeScript, Tailwind CSS, and Radix UI provide the application interface. PostgreSQL and Sequelize store users, restaurants, ratings, and aggregates. Authentication uses signed tokens in an HTTP-only cookie.

**Map display:** Leaflet / React Leaflet with OpenStreetMap tiles; no Google key is needed for map display. **Import and address autocomplete:** Google Places and Geocoding services.

## Run locally

Prerequisites: Node.js 20.9 or later, npm, and PostgreSQL. Google-backed import and autocomplete also require a configured Google Maps API key.

```bash
git clone https://github.com/janabjaradat/DineMapper.git
cd DineMapper
npm install
```

Create a PostgreSQL role and database, then create a private `.env` matching them:

```env
DB_USERNAME=your_postgres_role
DB_PASSWORD=your_database_password
DB_DATABASE=dinemapper
DB_HOST=127.0.0.1
DB_PORT=5432
JWT_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

```bash
npm run db:migrate
npm run dev
```

Open [localhost:3000](http://localhost:3000), or the port printed by the server. Keep `.env` out of version control.

### Optional city import

Enable the corresponding Google Places, Geocoding, and Maps JavaScript services for import and autocomplete. Import can incur Google API charges.

```bash
npx tsx src/scripts/seedRestaurants.ts Montreal
```

The CLI imports up to 50 restaurants for the selected city.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:undo` | Revert latest migration |
| `npm run db:seed` | Run configured Sequelize seeders |

### Project structure

```text
src/app/          Pages and API routes
src/components/   Restaurant interfaces and reusable UI
src/contexts/     Browser location state
src/hooks/        Authentication state
src/lib/          Database and authentication helpers
src/models/       Sequelize models
src/scripts/      City import script
migrations/       Database migrations
docs/screenshots/ Actual product screenshots
```
