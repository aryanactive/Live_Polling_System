# Deployment Guide for Live Polling System

## GitHub Pages Deployment

### Prerequisites
1. Push your code to a GitHub repository
2. Repository must be public (or GitHub Pro for private repos)

### Steps to Deploy on GitHub Pages:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions"

3. **Automatic Deployment**
   - The workflow will automatically trigger on pushes to main branch
   - Your app will be available at: `https://yourusername.github.io/Live_Polling_System/`

4. **Environment Variables**
   - Supabase credentials are already configured in the workflow
   - No additional setup needed

### Custom Domain (Optional)
1. In repository Settings > Pages
2. Add your custom domain
3. Enable "Enforce HTTPS"

## Alternative Hosting Platforms

### 1. Vercel (Recommended)
- **URL**: https://vercel.com
- **Steps**:
  1. Connect your GitHub repository
  2. Add environment variables:
     - `VITE_SUPABASE_URL=https://huikwuzrffgkyspfryxq.supabase.co`
     - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aWt3dXpyZmZna3lzcGZyeXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDg5NzcsImV4cCI6MjA3NDYyNDk3N30.Em-pbZfPjs52iQqxM49TKAbvwy7ewYBiPzLs8vSQwv8`
  3. Deploy automatically on commits

### 2. Netlify
- **URL**: https://netlify.com
- **Steps**:
  1. Drag and drop `dist` folder after running `npm run build`
  2. Or connect GitHub repository
  3. Build command: `npm run build`
  4. Publish directory: `dist`
  5. Add environment variables in Site Settings

### 3. Firebase Hosting
- **URL**: https://firebase.google.com
- **Steps**:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  npm run build
  firebase deploy
  ```

### 4. Surge.sh (Simple)
- **URL**: https://surge.sh
- **Steps**:
  ```bash
  npm install -g surge
  npm run build
  cd dist
  surge
  ```

### 5. Railway
- **URL**: https://railway.app
- **Steps**:
  1. Connect GitHub repository
  2. Add environment variables
  3. Automatic deployment

### 6. Render
- **URL**: https://render.com
- **Steps**:
  1. Connect GitHub repository
  2. Build command: `npm run build`
  3. Publish directory: `dist`

## Production Considerations

### Environment Variables
Ensure these are set in your hosting platform:
```
VITE_SUPABASE_URL=https://huikwuzrffgkyspfryxq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aWt3dXpyZmZna3lzcGZyeXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDg5NzcsImV4cCI6MjA3NDYyNDk3N30.Em-pbZfPjs52iQqxM49TKAbvwy7ewYBiPzLs8vSQwv8
```

### Security
- Supabase Row Level Security (RLS) is enabled
- API keys are public-safe (anon key)
- No sensitive data exposed

### Performance
- Vite builds are optimized for production
- Automatic code splitting
- Asset optimization included

## Troubleshooting

### Common Issues:
1. **404 on refresh**: Add `_redirects` file to `public` folder:
   ```
   /*    /index.html   200
   ```

2. **Environment variables not working**: Ensure they start with `VITE_`

3. **Build fails**: Check Node.js version (use 18+)

4. **Supabase connection issues**: Verify URL and anon key are correct

## Monitoring
- Check deployment logs in your chosen platform
- Monitor Supabase dashboard for database activity
- Use browser dev tools for frontend debugging