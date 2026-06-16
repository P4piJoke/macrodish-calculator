# 🥗 MacroDish Calculator

> Precise macronutrient tracking for cooked recipes — accounting for moisture loss that standard nutrition apps ignore.

---

## What is MacroDish?

Standard nutrition apps calculate macros from raw ingredients. They ignore the fact that food loses or absorbs water during cooking — a chicken breast at 100g raw becomes ~70g cooked, with a completely different macro density per gram.

MacroDish solves this by asking for the **final cooked weight** of your dish. It then redistributes all raw ingredient macros across that cooked weight, giving you a nutritionally accurate picture of exactly what you're eating.

---

## Features

| Feature | Description |
|---|---|
| **Recipe Builder** | Add raw ingredients, set cooked weight, get live macro calculations |
| **Yield Correction** | Macros are scaled to cooked weight — moisture loss handled automatically |
| **Custom Serving** | Scale macros to any portion size (e.g. an 85g slice) |
| **Product Dictionary** | Global community product database — anyone can contribute |
| **Brand Accounts** | Brands (e.g. Silpo, Fora) can publish official verified products |
| **Public Recipes** | Share recipes with the community or keep them private |
| **Copy & Edit** | Fork any public recipe into your own account |
| **Excel Export** | Download a structured `.xlsx` file — no server required |

---

## User Roles

### Regular User
- Build and save personal recipes (public or private)
- Browse and copy public recipes
- Add community products to the dictionary
- Edit or delete products they created

### Brand User
- Everything a regular user can do
- Publish products under their brand name
- Manage their brand's product catalog (edit, delete)
- Products appear with the brand name badge across the app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (email/password) |
| Hosting | Firebase Hosting (recommended) |
| Excel export | SheetJS (client-side, zero server cost) |

---

## Project Structure

```
src/
├── firebase/        # SDK init — config, db, auth instances
├── types/           # TypeScript interfaces (User, Brand, Product, Recipe)
├── utils/           # Pure logic — macro calculator, Excel exporter, validators
├── services/        # All Firestore + Auth calls (auth, product, recipe, brand)
├── context/         # AuthContext (global user state), RecipeDraftContext
├── hooks/           # useAuth, useProducts, useRecipe
├── components/      # Reusable UI — layout, product cards, recipe components
├── pages/           # One file per route
└── router/          # AppRouter + ProtectedRoute + BrandRoute guards
```

---

## Getting Started (Developer)

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Email/Password Auth enabled

### 1. Clone and install

```bash
git clone https://github.com/your-username/macrodish.git
cd macrodish
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

You can find all values in the Firebase console under **Project Settings → Your apps → SDK setup**.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
```

Output goes to `/dist` — deploy to Firebase Hosting, Vercel, or Netlify.

---

## Firestore Setup

### Collections

| Collection | Purpose |
|---|---|
| `/users/{uid}` | User profile — role, displayName, brandId, brandName |
| `/brands/{brandId}` | Brand registry — name, ownerId |
| `/products/{productId}` | Product dictionary — macros per 100g, optional brandId |
| `/recipes/{recipeId}` | Saved recipes — ingredients snapshot, cooked weight, visibility |

### Required Indexes

Firestore requires composite indexes for queries that combine `where` + `orderBy`. Create them via the links that appear in the browser console on first run, or manually in the Firebase console:

| Collection | Fields |
|---|---|
| `recipes` | `authorId` ASC + `createdAt` DESC |
| `recipes` | `isPublic` ASC + `createdAt` DESC |

### Security Rules

Replace the default test-mode rules in the Firebase console under **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    match /brands/{brandId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /products/{productId} {
      allow read:   if true;
      allow create: if true;
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.createdBy ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.brandId
          == resource.data.brandId
      );
    }

    match /recipes/{recipeId} {
      allow read: if resource.data.isPublic == true ||
                     request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

  }
}
```

---

## Macro Calculation Formula

```
1. For each ingredient:
   rawMacro = (product.macroPer100g / 100) × rawWeightGrams

2. Sum all ingredients:
   totalRawMacro = Σ rawMacro

3. Normalise to cooked weight:
   macroPer100gCooked = (totalRawMacro / cookedWeightGrams) × 100

4. Scale to custom serving:
   macroForServing = (macroPer100gCooked / 100) × servingGrams
```

The cooked weight input is what makes MacroDish accurate — it absorbs all moisture change automatically.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## License

MIT