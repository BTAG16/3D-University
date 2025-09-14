# UNIVERSITY-3D

![Vite](https://img.shields.io/badge/Vite-FF2D20?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=flat&logo=mapbox&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**UNIVERSITY-3D** is a Vite-powered React project featuring an interactive 3D campus map with Mapbox integration. Users can explore university buildings visually and interact with custom markers and popups.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Git and Repository](#git-and-repository)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This project provides a detailed, interactive 3D visualization of the university campus. It uses **React** for UI components and **Mapbox GL JS** for map interaction.

Users can explore each building, view detailed information through popups, and interact dynamically with map elements.

---

## Features

- Interactive 3D campus map
- Custom markers for each building
- Popups and modal components for building details
- Responsive design for desktop and mobile
- Environment variable support for API keys (e.g., Mapbox)
- Ready for deployment via Netlify, Vercel, or GitHub Pages

---

## Tech Stack

- **Frontend:** React, Vite
- **Map Integration:** Mapbox GL JS
- **Styling:** Tailwind CSS, CSS modules
- **Package Management:** npm or yarn

---

## Project Structure

```
UNIVERSITY-3D/
├── node_modules/
├── public/
│   └── img/
│       ├── A-Building.jpeg
│       ├── F-Building.png
│       ├── H-Building.jpeg
│       ├── I-Building.avif
│       ├── L-Building.jpg
│       ├── M-Building.jpg
│       ├── P-Building.png
│       └── mapbox-logo-black.png
├── src/
│   ├── data/
│   ├── img/
│   ├── Map/
│   │   ├── App.jsx
│   │   ├── Card.jsx
│   │   ├── layout.jsx
│   │   ├── main.jsx
│   │   ├── MapboxTooltip.jsx
│   │   ├── Marker.jsx
│   │   ├── Modal.jsx
│   │   ├── StaticMap.jsx
│   │   ├── index.jsx
│   │   ├── Js util.js
│   │   └── styles.css
│   └── .env
├── index.html
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
└── vite.config.js
```

---

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/UNIVERSITY-3D.git
   cd UNIVERSITY-3D
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the project root
   - Add your Mapbox token:
     ```
     VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## Environment Variables

- `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox API access token

> Ensure `.env` is included in `.gitignore` to avoid exposing sensitive information.

---

## Git and Repository

To push the project to a remote repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/UNIVERSITY-3D.git
git push -u origin main
```

> Consider using Git LFS for large image files.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add some feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
