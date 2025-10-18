# jspsych-pwa-test

Offline jsPsych experiment using CDN imports (no build step required).

## Features

- ✅ No build step - just edit and deploy
- ✅ CDN imports for jsPsych and plugins
- ✅ Works offline after first visit (PWA)
- ✅ Local IndexedDB storage

## Development

Start local development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Note**: For PWA features (offline capability), you'll need HTTPS. Use a hosting service for full PWA functionality.

## Project Structure

- \`experiment.js\` - Main experiment file
- \`index.html\` - Main page
- \`manifest.json\` - PWA configuration
- \`admin/\` - Data manager interface (accessible at \`/admin\`)
  - \`index.html\` - Data manager page
  - \`admin.js\` - Data manager logic
 - \`sw.js\` - Service worker (at project root)

## Deployment

### GitHub Pages (Recommended - Automatic)

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push.

**Setup (one-time)**:

1. Create a GitHub repository and push your code:

   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create {{name}} --public --source=. --push
   \`\`\`

   Or push to an existing repo:

   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/{{name}}.git
   git branch -M main
   git push -u origin main
   \`\`\`

2. Enable GitHub Pages:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: **GitHub Actions**

3. Done! Your experiment is now live at:
   \`https://YOUR_USERNAME.github.io/{{name}}/\`

**Future updates**: Just push to main and it automatically redeploys!

\`\`\`bash
git add .
git commit -m "Update experiment"
git push
\`\`\`

### Option 2: Netlify

1. Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository for automatic deployments

### Option 3: Any Static Host

Simply upload all files to any static hosting service that supports HTTPS:

- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Your university web server

## Data Management

Access the data manager at \`/admin\` to:

- View collected sessions
- Export data (CSV, JSON, ZIP)
- Delete old sessions
- Monitor storage usage

## Installing on Tablets

1. Visit your deployed URL on the tablet (requires internet connection first time)
2. In browser menu, select "Add to Home Screen" (iOS Safari) or "Install app" (Android Chrome)
3. The PWA will cache all files including CDN dependencies
4. After installation, works completely offline

## Modifying the Experiment

Edit \`experiment.js\` to modify your experiment. Changes are immediately reflected - just refresh the browser.

### Adding jsPsych Plugins

Add CDN imports at the top of \`experiment.js\`:

\`\`\`javascript
import imageKeyboardResponse from "https://unpkg.com/@jspsych/plugin-image-keyboard-response@2";
\`\`\`

**Important**: After adding new CDN imports, update \`sw.js\` at the project root to include the new URLs in the \`cdnUrlsToCache\` array for offline caching.

## Learn More

- [jsPsych Documentation](https://www.jspsych.org/)
- [Offline Storage Documentation](https://github.com/jspsych/offline-pwa)
