This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## data mocking, transformation to csv, to firebase. 

## Data mocking to firestore
## Firestore Mock Data Script Overview

### What the Script Does:
1. **Initial Setup**: Connects to Firebase Firestore and prepares the environment for generating mock data.
2. **Generate Users**: Creates 10 users with randomized names, emails, and zip codes. Each user has an empty `dogList` to store references to their dogs.
3. **Generate Dogs**: For each user, 1–3 dogs are created with randomized attributes like name, age, breed, and weight. Dogs have empty arrays for event references (e.g., `behaviorEventIds`).
4. **Generate Events**: Each dog gets 30 events (e.g., behavior, diet, exercise, health) with randomized details. Event references are stored in the dog's corresponding event ID arrays.
5. **Track Data**: All created Firestore documents are logged in `created_items.json` with their collection name and ID. The file is overwritten each time the script runs.
6. **Relationships**: Users reference their dogs via `dogList`, and dogs reference their events via arrays like `behaviorEventIds`.

This script simplifies the creation of consistent and relational mock data for testing Firestore databases.


## Firestore to csv

## Csv 