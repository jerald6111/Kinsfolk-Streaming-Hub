# StreamHub - Unified Streaming Experience

An Apple TV-style streaming hub that unifies content from Netflix, YouTube, Prime Video, Disney+, and HBO Max on a single scrollable page with local file playback support.

## 🚀 Features

- **Unified Content Display** - All streaming platforms in one interface
- **Local File Playback** - Support for MP4, MKV, AVI files with resume functionality
- **Global Search** - Search across all platforms simultaneously
- **Apple TV-Style UI** - Dark theme with glossy animations and hover effects
- **Continue Watching** - Resume where you left off
- **PWA Support** - Install as a desktop app
- **Statistics Dashboard** - Track your viewing habits

## 🛠️ Quick Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Create a GitHub Repository:**
   - Go to [GitHub.com](https://github.com) and create a new repository
   - Name it `streaming-hub` or any name you prefer
   - Make it public or private (your choice)

2. **Upload Your Code:**
   - Clone or download your repository locally
   - Copy all the files from this project into your repository folder
   - Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial StreamHub deployment"
   git push origin main
   ```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your `streaming-hub` repository
   - Vercel will auto-detect it's a Next.js project
   - Click "Deploy" - that's it!

### Option 2: Direct Upload

1. **Prepare Your Files:**
   - Create a folder called `streaming-hub`
   - Add all the files shown in this guide to the folder

2. **Deploy via Vercel CLI:**
   ```bash
   npm i -g vercel
   cd streaming-hub
   npm install
   vercel --prod
   ```

3. **Or use Vercel Dashboard:**
   - Zip your project folder
   - Go to vercel.com → New Project → Upload zip

## 📁 Required File Structure

Make sure your project has this exact structure:

```
streaming-hub/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── public/
│   ├── manifest.json
│   ├── favicon.ico
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## 🔧 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## 📱 PWA Installation Guide

### For Users (After Deployment):

**Chrome/Edge (Windows 10/11):**
1. Visit your deployed Vercel URL
2. Look for the install button (⊕) in the address bar
3. Click "Install StreamHub"
4. The app will appear in your Start Menu

**Mobile (Android/iOS):**
1. Open the URL in Chrome (Android) or Safari (iOS)
2. Tap "Add to Home Screen"
3. The app will behave like a native app

## 🎯 Post-Deployment Customization

After successful deployment, you can:

1. **Add Real API Integration:**
   - TMDB API for movie/TV metadata
   - YouTube Data API for real content
   - Streaming platform RSS feeds

2. **Custom Domain:**
   - In Vercel dashboard → Settings → Domains
   - Add your custom domain

3. **Environment Variables:**
   - Add API keys in Vercel → Settings → Environment Variables

## 🔗 Key Features Working Out of the Box

- ✅ **Mock Content Display** - Sample content from all platforms
- ✅ **Search Functionality** - Filter content across platforms
- ✅ **Local File Playback** - Upload and play your videos
- ✅ **PWA Installation** - Install as desktop/mobile app
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Continue Watching** - Resume functionality
- ✅ **Statistics Tracking** - Basic viewing stats

## 📊 Performance Optimizations

The app includes:
- Static export for fast loading
- Image optimization disabled for compatibility
- Lazy loading for better performance
- Local storage for offline functionality

## 🛠️ Troubleshooting

**Build Fails?**
- Make sure all files are in correct locations
- Check that package.json has correct dependencies
- Ensure Next.js version compatibility

**PWA Not Installing?**
- Verify manifest.json is in public folder
- Check that icons exist (you can use placeholder images initially)
- Test in Chrome/Edge (best PWA support)

**Local Files Not Working?**
- File System Access API only works in Chrome/Edge
- Must be served over HTTPS (Vercel provides this)
- User must explicitly grant folder access

## 🎨 Customization Ideas

- Change platform colors in `platformColors` object
- Add more mock content in `mockContent`
- Modify the dark theme colors
- Add new sections (Recently Added, Favorites, etc.)
- Integrate with real streaming APIs

## 📝 License

MIT License - feel free to modify and distribute!

---

**Ready to deploy?** Follow the steps above and you'll have your StreamHub live on Vercel in under 5 minutes! 🚀"# Kinsfolk-Streaming-Hub" 
"# Kinsfolk-Streaming-Hub" 
"# Kinsfolk-Streaming-Hub" 
"# Kinsfolk-Streaming-Hub" 
