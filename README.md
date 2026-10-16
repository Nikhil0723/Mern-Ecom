# UrbanNest — MERN E-Commerce

UrbanNest is a MERN e-commerce project built around a simple idea: make it easy to browse home and lifestyle products, while giving the store owner a place to manage the catalog.

> This is a portfolio project. Some features may still be in development, so check the current app before treating every item below as finished.

## Live Demo

- **Frontend:** https://mern-ecom-a5uh.vercel.app
- **Backend API:** https://mern-ecom-wky8.onrender.com
- **Health check:** https://mern-ecom-wky8.onrender.com/api/health

The health endpoint confirms that the Express server responds; it does not necessarily prove that MongoDB is connected or every API route is working.

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- shadcn/ui
- Axios
- Vite
- Hugeicons (where used)

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- REST API

## Features

### Storefront
- Browse products and product categories.
- Product listings with prices, discounts, stock, descriptions, brands, and images (depending on the product schema).
- Category links generated dynamically from the API.
- Navbar displays up to three categories. Categories marked `showInNavbar` can be prioritized using `navbarOrder`; if none are enabled, the frontend can fall back to the first three categories.
- Footer loads and displays the first three categories dynamically.
- Product search, sorting, filtering, cart, wishlist, account, and order pages are part of the project UI where implemented. Verify each feature against the current backend before relying on it.

### Admin and store content
- Category management, including name, description, navbar visibility, and navbar order.
- Product management, if enabled in the current admin interface.
- Coupon and banner data support, depending on the models and routes implemented.
- API Inspector for inspecting requests made through the configured Axios client. It is intended as a development/debugging aid; avoid exposing sensitive request headers, tokens, or personal data.

### UX and UI
- Responsive layouts using Tailwind CSS and shadcn/ui.
- Hover transitions and card layouts.
- Shared page container and reusable components.
- UrbanNest branding and favicon configuration.

## Repository Structure

The repository has separate frontend and backend directories:

```text
.
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets (e.g. favicon and product images)
│   └── src/
│       ├── components/
│       ├── services/
│       └── ...
└── backend/                 # Express API
    ├── server.js
    └── ...
```

Your exact folders may differ as the project develops.

## Local Development

### Requirements
- Node.js 18 or newer recommended
- npm
- MongoDB Atlas database or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GIT_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` and fill in your own values:

```dotenv
PORT=5000
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_LONG_RANDOM_SECRET>
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Only keep variables that your backend actually reads. If your project uses different names, use those names instead. Never commit `.env`.

Start the backend using the command appropriate to your `package.json`. For example, if there is no start script:

```bash
node server.js
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create `client/.env` (or the environment file format supported by your setup):

```dotenv
VITE_API_URL=http://localhost:5000
```

The variable name must match the one used by your Axios/API service. If the project uses a different variable name or an API base URL with `/api`, follow the implementation in `client/src/services/api.js`.

Start Vite:

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `PORT` | Backend | Port for the Express server |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend, if JWT authentication is used | Secret used to sign/verify tokens |
| `FRONTEND_URL` | Backend | Allowed frontend origin for CORS |
| `NODE_ENV` | Backend | Runtime environment |
| `VITE_API_URL` | Frontend, if used by the API service | Backend API base URL |

**Security:** Use Vercel Environment Variables for frontend configuration and Render Environment Variables for backend configuration. Frontend variables prefixed with `VITE_` are bundled into browser code, so never put secrets in them. Keep MongoDB credentials and JWT secrets only on the backend.

## Deployment

### Frontend — Vercel
- Deployed URL: https://mern-ecom-a5uh.vercel.app
- Set the Vercel project root directory to `client` if the repository is a monorepo.
- Configure the frontend API base URL using the variable expected by `client/src/services/api.js`.
- Redeploy after changing environment variables or frontend code.

### Backend — Render
- Deployed URL: https://mern-ecom-wky8.onrender.com
- Root directory: `backend`
- Start command used: `node server.js`
- Configure `MONGODB_URI`, `FRONTEND_URL`, and any authentication secrets in Render's environment settings.
- Set `FRONTEND_URL` to the exact deployed frontend origin, without a trailing slash:
  `https://mern-ecom-a5uh.vercel.app`
- Redeploy after changing environment variables or backend code.

### CORS and connectivity checks
- Open the health endpoint: https://mern-ecom-wky8.onrender.com/api/health
- Check the browser DevTools Network tab for failed API requests.
- Use the API Inspector for request/response debugging if it is enabled.
- If CORS fails, confirm the deployed frontend origin exactly matches the backend's allowed origin.
- A successful health check alone does not validate MongoDB connectivity, authentication, or individual endpoints.

## Category Navbar Configuration

The category schema supports these fields:

```js
showInNavbar: {
  type: Boolean,
  default: false,
},
navbarOrder: {
  type: Number,
  default: 0,
},
```

Example category:

```json
{
  "name": "Furniture",
  "description": "Furniture for modern homes.",
  "showInNavbar": true,
  "navbarOrder": 1
}
```

Set `showInNavbar` to `true` to include a category in the prioritized navbar list. Smaller `navbarOrder` values appear first. The current frontend behavior described during development falls back to the first three categories alphabetically when no categories are enabled for the navbar. Confirm the same behavior is present in both desktop and mobile navigation.

## API Overview

The backend uses an Express REST API. The exact endpoints depend on the routes implemented in `backend`; inspect the route files for the authoritative list.

Known endpoint:
- `GET /api/health` — basic server health check.

Category functionality discussed in this project includes:
- Fetching categories
- Creating a category
- Updating a category
- Filtering categories by navbar visibility, where supported

Do not assume endpoint methods, authentication requirements, or request bodies without checking the current route/controller definitions.

## Demo Login Accounts

For testing the app, there are two demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@urbannest.demo` | `UrbanNest@Admin123` |
| Customer | `user@urbannest.demo` | `UrbanNest@User123` |

The admin account should have `isAdmin: true`, while the customer account should have `isAdmin: false`.

These credentials will work only if the matching passwords have been set for these users in the database. Passwords are stored as bcrypt hashes, so if login fails, reset the passwords through your backend's password-hashing logic rather than pasting plaintext passwords into the database.

These are demo credentials for a portfolio project only. If you publish this repository, remember that anyone who can read the README can see them. Do not use these passwords for real accounts, and change them if the app contains data you need to protect.

## Sample Store Data

The sample UrbanNest data prepared during development includes:
- 8 categories: Furniture, Lighting, Home Decor, Kitchen & Dining, Bedding, Storage & Organization, Bath, and Outdoor.
- 30 sample products.
- 8 sample coupons.
- 5 sample homepage banners.

These are illustrative seed records, not guaranteed to match every model field. Before importing, verify the `Product`, `Coupon`, and `Banner` schemas, especially category ObjectId references, image field names, coupon enum values, and banner position fields. Sample image URLs may be reused or unavailable.

## Favicon and Static Images

Vite serves files placed in `client/public` from the site root. For example:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

Place the file at `client/public/favicon.png`. Product images can be stored under `client/public/products/` and referenced like `/products/nordic-lounge-chair.jpg`.

## Testing Checklist

Before publishing changes, check:

- [ ] Frontend loads on the deployed Vercel URL.
- [ ] Backend health endpoint responds.
- [ ] MongoDB connection is healthy.
- [ ] CORS allows the deployed frontend origin.
- [ ] Categories load from the API.
- [ ] Navbar and mobile navigation display the intended categories.
- [ ] Footer category links open the expected Shop filters.
- [ ] Product images load and product category filters work.
- [ ] Cart, authentication, checkout, orders, and wishlist work if implemented.
- [ ] Coupon validation and banner visibility work if implemented.
- [ ] No secrets or private credentials are committed to Git.

## Troubleshooting

**API requests fail**
- Check `client/src/services/api.js` for the expected base URL environment variable.
- Confirm the Render service is running and inspect Render logs.
- Check the Network tab for the actual response status and URL.

**CORS errors**
- Ensure `FRONTEND_URL` exactly matches the deployed frontend origin.
- Avoid a trailing slash in the configured origin if the backend compares it literally.

**Categories do not appear**
- Confirm categories exist in MongoDB.
- Check the category API response shape against `getCategories()`.
- Verify `showInNavbar` and `navbarOrder` values.
- Confirm the frontend category URL format matches the Shop page's filtering logic.

**Favicon does not update**
- Confirm `client/public/favicon.png` exists and the HTML link points to `/favicon.png`.
- Hard-refresh the browser; favicons are often cached.

## Git Workflow

```bash
git status
git add .
git commit -m "Describe your changes"
git push origin main
```

Use your actual branch name if it is not `main`. Do not commit `.env` files, access tokens, database credentials, or other secrets.

## License

Add a license before distributing this project publicly. If this is a portfolio project, specify whether it is for demonstration only or open source.
