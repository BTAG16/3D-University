# Campus Explorer - University 3D Mapping Platform

A complete B2B2C SaaS platform for interactive university campus mapping with 3D visualization powered by Mapbox.

![Campus Explorer](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF)
![Mapbox](https://img.shields.io/badge/Mapbox-3.16.0-000000)
![Supabase](https://img.shields.io/badge/Supabase-2.86.0-3ECF8E)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0.0-FF0055)

## 🚨 Important: GDPR Compliance Required

**⚠️ SECURITY ALERT:** API keys were previously exposed in version control. See `QUICK_START_GDPR.md` for immediate action steps.

**📋 Compliance Status:** This project requires GDPR compliance implementation before production use. See `GDPR_COMPLIANCE_REPORT.md` for detailed requirements and implementation guide.

## 🌟 Features

### For University Admins
- 🏛️ **University Registration** - Create and manage your institution's profile
- 🏢 **Building Management** - Add, edit, and delete campus buildings
- 📊 **Analytics Dashboard** - Track map usage and engagement
- 🔗 **Shareable Links** - Generate public map URLs for students
- 🎨 **Customization** - Configure building categories, facilities, and details

### For Students (Public Access)
- 🗺️ **Interactive 3D Maps** - Explore campus with immersive 3D visualization
- 🔍 **Smart Search** - Find buildings by name, category, department, or facility
- 📍 **Location Services** - Get your position and distances to buildings
- 📱 **Mobile Responsive** - Seamless experience across all devices
- 🎯 **No Login Required** - Instant access via shareable URL
- ℹ️ **Building Details** - View hours, facilities, departments, and descriptions

### New Landing Page Features ✨
- 🎭 **Modern Design** - Contemporary landing page with smooth animations
- 🖱️ **Magnetic Buttons** - Interactive button effects that follow your cursor
- 🏗️ **3D Campus Preview** - Interactive isometric map demonstration
- 📊 **Social Proof** - Testimonials, stats, and pricing sections
- 🌈 **Glass Morphism** - Modern UI with backdrop blur effects
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ or 18+
- yarn or npm
- Mapbox account (free tier available)
- Supabase account (free tier available)
- Resend account (for emails)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd university-3d
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **⚠️ CRITICAL: Secure Your Environment Variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Then update `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   RESEND_API_KEY=your_resend_api_key
   ```

   **⚠️ NEVER commit `.env` to version control!**

4. **Start development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173)

## 📋 GDPR Compliance Setup

**Before deploying to production, you MUST complete these steps:**

1. **Read the compliance report:**
   ```bash
   open GDPR_COMPLIANCE_REPORT.md
   ```

2. **Follow the quick start guide:**
   ```bash
   open QUICK_START_GDPR.md
   ```

3. **Immediate actions required:**
   - [ ] Rotate all exposed API keys
   - [ ] Create Privacy Policy page
   - [ ] Implement Cookie Consent banner
   - [ ] Set up Data Processing Agreements (DPAs)
   - [ ] Implement user data export
   - [ ] Implement account deletion

See `GDPR_COMPLIANCE_REPORT.md` for complete checklist and implementation code.

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Manual deployment:**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAPBOX_ACCESS_TOKEN`
   - `RESEND_API_KEY`

⚠️ **Important:** Before deploying, complete GDPR compliance requirements in `GDPR_COMPLIANCE_REPORT.md`

### Other Platforms

<details>
<summary>Netlify</summary>

```bash
yarn build
npx netlify-cli deploy --prod
```

Build settings:
- Build command: `yarn build`
- Publish directory: `dist`
</details>

<details>
<summary>Cloudflare Pages</summary>

Build settings:
- Build command: `yarn build`
- Output directory: `dist`
- Node version: 18
</details>

## 🏗️ Project Structure

```
university-3d/
├── public/                      # Static assets
├── src/
│   ├── components/             # Reusable React components
│   │   ├── ui/                # UI components
│   │   │   └── MagneticButton.jsx
│   │   ├── InteractiveMap.jsx # 3D map component
│   │   ├── BuildingCard.jsx
│   │   ├── BuildingForm.jsx
│   │   ├── Modal.jsx
│   │   └── SearchBox.jsx
│   ├── lib/                    # Utilities and helpers
│   ├── constants.js            # App constants (features, pricing, etc.)
│   ├── AdminAuthContext.jsx    # Authentication state
│   ├── AdminDashboard.jsx      # Admin control panel
│   ├── AdminLogin.jsx          # Login/Registration
│   ├── Landing.jsx             # Modern landing page ✨
│   ├── PublicMap.jsx           # Public map view
│   ├── App.jsx                 # Router configuration
│   └── main.jsx                # Application entry
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── GDPR_COMPLIANCE_REPORT.md   # 📋 GDPR compliance guide
├── QUICK_START_GDPR.md         # 🚀 Quick start for GDPR
├── vercel.json                 # Vercel configuration
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

### Core
- **Frontend**: React 19.2, React Router 7
- **Build Tool**: Vite 5
- **State Management**: React Context API
- **Styling**: CSS3, Custom Properties

### Libraries
- **Maps**: Mapbox GL JS 3.16
- **Animations**: Framer Motion 11.0
- **Icons**: Lucide React, Font Awesome
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend API

### Design
- **Modern UI**: Glass morphism, gradient effects
- **Animations**: Smooth scroll, magnetic interactions
- **Responsive**: Mobile-first design approach

## 📖 Usage Guide

### For University Admins

1. **Register your university:**
   - Navigate to `/admin/login`
   - Click "Register University"
   - Fill in university details and create admin account
   - Access your dashboard

2. **Add buildings:**
   - Go to "Buildings" section
   - Click "Add Building"
   - Enter building information:
     - Name, coordinates (lat/lng)
     - Category, facilities, departments
     - Operating hours, description
   - Save and publish

3. **Share with students:**
   - Copy the public map URL from "Public Link" tab
   - Share via email, website, or social media
   - Embed on university website

### For Students

1. Click the shared link (e.g., `/map?uni=uni-123456`)
2. Explore the interactive 3D campus map
3. Search for buildings, departments, or facilities
4. View building details and get directions
5. Use location services to find nearest buildings

## 🎨 Customization

### Theme Colors

The application uses a consistent color theme throughout:

```css
:root {
  --primary: #667eea;        /* Purple */
  --primary-dark: #764ba2;   /* Dark Purple */
  --accent: #32b8c6;         /* Cyan */
  --success: #10b981;        /* Green */
  --warning: #f59e0b;        /* Amber */
  --danger: #ef4444;         /* Red */
  --dark-bg: #0a0a0f;        /* Near Black */
}
```

Edit these in `src/index.css` to match your brand.

### Landing Page Content

Edit content in `src/constants.js`:

```javascript
export const FEATURES = [
  {
    id: '1',
    title: 'Your Feature',
    description: 'Description',
    icon: YourIcon,
    color: 'text-purple-400'
  },
  // ... add more
];

export const PRICING = [
  {
    name: "Your Plan",
    price: "$99",
    description: "Plan description",
    features: ["Feature 1", "Feature 2"],
    recommended: true
  }
];
```

### Building Categories

Modify categories in `src/components/BuildingForm.jsx`:

```javascript
const categories = [
  'Academic',
  'Library',
  'Dormitory',
  'Dining',
  'Athletics',
  'Administrative',
  'Your Custom Category'
];
```

## 🔒 Security & Privacy

### Current Implementation
- ✅ Environment variables excluded from version control
- ✅ Supabase RLS (Row Level Security) policies
- ✅ Admin authentication with secure sessions
- ✅ HTTPS enforced in production

### Required Before Production (GDPR)
- ⚠️ Cookie consent banner
- ⚠️ Privacy Policy page
- ⚠️ Terms of Service page
- ⚠️ Data Processing Agreements
- ⚠️ User data export functionality
- ⚠️ Account deletion functionality
- ⚠️ Data retention policies

**See `GDPR_COMPLIANCE_REPORT.md` for complete requirements.**

## 📱 Browser Support

- ✅ Chrome/Edge (last 2 versions)
- ✅ Firefox (last 2 versions)
- ✅ Safari (last 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ⚠️ IE11 not supported (uses modern ES6+ features)

## 🐛 Troubleshooting

### Common Issues

**"Module not found: framer-motion"**
```bash
yarn add framer-motion lucide-react
```

**Landing page animations not working**
- Clear browser cache
- Check console for JavaScript errors
- Verify Framer Motion is installed
- Test in incognito mode

**3D map not rendering**
- Verify Mapbox token is valid
- Check browser supports CSS 3D transforms
- Test in different browser (Chrome recommended)
- Check console for errors

**Deployment fails**
- Verify all environment variables are set
- Check build logs for specific errors
- Ensure Node version is 16+ or 18+
- Clear build cache and retry

## 📚 Documentation

- [GDPR Compliance Report](./GDPR_COMPLIANCE_REPORT.md) - Complete compliance guide
- [GDPR Quick Start](./QUICK_START_GDPR.md) - Quick implementation guide
- [Mapbox Documentation](https://docs.mapbox.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Note:** Ensure your PR includes GDPR compliance considerations if adding new data collection features.

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Users are responsible for:
- Ensuring GDPR compliance before production use
- Securing API keys and environment variables
- Implementing required privacy and data protection measures
- Obtaining necessary legal review for their jurisdiction

## 🙏 Acknowledgments

- [Mapbox](https://www.mapbox.com/) for mapping platform
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vite](https://vitejs.dev/) for blazing fast build tool
- [React](https://react.dev/) for UI framework
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

For issues or questions:
- 📖 Check documentation files (GDPR_COMPLIANCE_REPORT.md, QUICK_START_GDPR.md)
- 🐛 Review browser console for errors
- 📊 Check Supabase logs for backend issues
- 🔐 Verify environment variables are set correctly
- 💬 Open an issue on GitHub
- 📧 Contact support

---

**Built with ❤️ for universities and students worldwide**

## 🚀 What's New in v2.0

- ✨ Modern, animated landing page
- 🎨 Consistent color theme throughout
- 🖱️ Magnetic button interactions
- 🏗️ Interactive 3D campus preview
- 📱 Enhanced mobile responsiveness
- 🌈 Glass morphism UI effects
- 📋 GDPR compliance documentation
- 🔒 Security best practices guide

---

**⚠️ Remember:** Complete GDPR compliance requirements before deploying to production!

🌐 [Live Demo](#) | 📚 [Docs](./GDPR_COMPLIANCE_REPORT.md) | 💬 [Issues](https://github.com/yourusername/university-3d/issues)
