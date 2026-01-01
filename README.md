# Sprout Lands Interactive Portfolio

An interactive, gamified 2D pixel-art portfolio experience built with React, Phaser.js, and Tailwind CSS. Explore a digital village, visit different buildings to view projects and social accounts, and send direct messages via a custom Telegram integration.

Live Demo: https://ozgurguler.netlify.app/

---

## Screenshots

<div align="center">
  <img src="screenshots/image%20(3).png" width="45%" alt="Hub View" />
  <img src="screenshots/image%20(4).png" width="45%" alt="Loading Screen" />
  <br />
  <img src="screenshots/image%20(5).png" width="45%" alt="Projects" />
  <img src="screenshots/image%20(6).png" width="45%" alt="Social Links" />
  <br />
  <img src="screenshots/image%20(7).png" width="45%" alt="Messaging System" />
  <img src="screenshots/image%20(8).png" width="45%" alt="Mobile Joystick" />
</div>

---

## Features

- Interactive 2D World: A vibrant map built with Phaser.js where users can explore the environment with a player character.
- Building Portals: Custom-designed buildings that serve as portals to different sections like Projects, Social, and Gallery.
- Mobile Compatibility: Smooth dynamic joystick control optimized for mobile devices.
- Telegram Messaging System: Integrated contact form that sends messages directly to the developer's Telegram account.
- Pixel Art Aesthetic: A warm, retro atmosphere created using Sprout Lands asset packs.
- AI-Driven Animals: Animated chickens wandering the map with basic obstacle avoidance and pathfinding.

---

## Technologies Used

- Frontend: React + Vite
- Game Engine: Phaser.js
- Styling: Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide React
- Deployment: Netlify

---

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ozguradmin/sprout-lands-portfolio.git
   cd sprout-lands-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a .env file (or add via Netlify dashboard):
   ```env
   VITE_TELEGRAM_BOT_TOKEN=your_bot_token
   VITE_TELEGRAM_CHAT_ID=your_chat_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## Developer

Ozgur Guler - [GitHub](https://github.com/ozguradmin) | [LinkedIn](https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/)

Developed using Sprout Lands asset packs.
