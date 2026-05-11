# Protokol (Beast Mode)

Protokol is a brutally clean, editorial-style habit and routine tracker designed for mobile. Built with a focus on deep work and intense focus, the app utilizes a highly visual, zero-friction Bento Grid interface to track your daily "protocol" without distractions.

## 🚀 Features

- **Editorial Bento Grid UI**: A dense, masonry-style dashboard displaying daily habits with bold typography and zero negative space.
- **100-Day Journey Matrix**: A custom heatmap visualization tracking your consistency over a 100-day cycle, visually representing partial and complete days.
- **Deep Work Integration**: Tracks specific deep work blocks, weight lifting routines, and end-of-day journaling.
- **Full Offline Native Build**: Wrapped in **Capacitor**, allowing the web app to be deployed directly as an Android/iOS native application.
- **Real-time DB Sync**: Powered by Serverless Postgres for blazing fast data fetching and syncing.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom CSS variable theming
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid, haptic-feeling micro-interactions
- **Database**: [Neon Serverless Postgres](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Native Wrapper**: [Capacitor](https://capacitorjs.com/) for Android packaging

## 📱 Running Locally (Web)

1. Clone the repository:
   ```bash
   git clone https://github.com/Yashank-d/Protokol.git
   cd beast-mode-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (Create a `.env` file):
   ```env
   DATABASE_URL=postgresql://your-neon-database-url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤖 Running on Android (Capacitor)

If you want to run the app natively on your Android device:

1. Build the production web app:
   ```bash
   npm run build
   ```

2. Sync the web assets to the Android folder:
   ```bash
   cd ../BeastModeApp
   npx cap sync
   ```

3. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
   From Android Studio, you can build the APK or run it directly on a connected device via USB Debugging.

## ☁️ Deployment (Vercel)

To run the Capacitor app flawlessly anywhere in the world, the Next.js backend must be hosted:
1. Connect this repository to [Vercel](https://vercel.com/).
2. Add your `DATABASE_URL` to Vercel's Environment Variables.
3. Deploy.
4. Update `capacitor.config.json` with the new Vercel live URL before syncing your Android build.
