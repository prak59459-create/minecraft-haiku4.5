# Deployment Guide

## Building for Production

### Build Command

```bash
npm run build
```

This creates optimized production files in `dist/`:
- `index.html` - Minified HTML
- `assets/` - Bundled and optimized JavaScript

### Build Optimization

The build includes:
- Code minification
- Tree shaking (unused code removal)
- Asset optimization
- Source map generation

## Deployment Options

### 1. GitHub Pages

Push to `gh-pages` branch:

```bash
npm run build
git add dist/
git commit -m "Production build"
git push origin main
```

Enable GitHub Pages in repository settings to serve from `dist/` folder.

### 2. Netlify

```bash
npm run build
# Deploy the dist/ folder to Netlify
```

Or connect GitHub repository to Netlify for automatic deployments.

### 3. Vercel

```bash
npm run build
# Deploy with Vercel CLI
vercel
```

### 4. Self-Hosted Server

```bash
npm run build
# Copy dist/ contents to web server
# Configure server to serve index.html for SPA routing
```

## Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t minecraft-haiku .
docker run -p 80:80 minecraft-haiku
```

## Performance Considerations

### File Size

- **Unminified**: ~500KB (main application)
- **Minified**: ~150KB
- **Gzipped**: ~40KB

### Load Time

- Average initial load: 1-3 seconds
- Chunk generation: <100ms per chunk
- First frame: <2 seconds

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with WebGL support

## SEO & Analytics

### Meta Tags

```html
<meta name="description" content="3D Minecraft Clone - Interactive voxel world">
<meta name="keywords" content="minecraft, game, webgl, three.js">
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Analytics

Add Google Analytics:

```html
<!-- Add to head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## Performance Monitoring

### Lighthouse

Run Chrome Lighthouse audit:
1. Open DevTools
2. Lighthouse tab
3. Generate report

Target scores:
- Performance: >80
- Accessibility: >90
- Best Practices: >90

### Core Web Vitals

Monitor:
- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1

## Scaling Considerations

### Server Requirements

For serving static files:
- CPU: Minimal (CDN recommended)
- Memory: <100MB
- Bandwidth: Depends on player count

### Client Requirements

Recommended:
- RAM: 4GB+
- GPU: WebGL 2.0 capable
- Network: 1Mbps+ connection

### Optimization Tips

1. **Enable GZIP Compression**: Reduces file size by 70%
2. **Use CDN**: Distribute assets globally
3. **Cache Busting**: Use hashes in filenames
4. **Lazy Loading**: Load chunks on demand
5. **Progressive Enhancement**: Degrade gracefully

## SSL/HTTPS

Use Let's Encrypt for free SSL:

```bash
# Using Certbot
certbot certonly --standalone -d yourdomain.com
```

## Monitoring & Logging

### Client-Side Monitoring

Use Logger utility:

```javascript
logger.info('Game started');
logger.error('Critical error', errorData);
```

### Server-Side Monitoring

If hosting save data:
- Monitor disk usage
- Track API response times
- Log errors to external service

## Backup Strategy

### Version Control

Always keep Git history:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Backup Locations

- GitHub repository
- Backup branch
- External storage (Google Drive, S3)

## Update Strategy

### Semantic Versioning

- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Example: v1.2.3

### Deployment Process

1. Update version in `package.json`
2. Test thoroughly
3. Build for production
4. Deploy to staging
5. Verify on staging
6. Deploy to production
7. Monitor for issues
8. Create Git tag

## Rollback Procedure

If issues occur:

```bash
# Revert to previous version
git revert HEAD
npm run build
# Redeploy
```

## Monitoring URLs

For production deployment, monitor:
- **Homepage**: `/`
- **API Endpoints**: `/api/*` (if added)
- **Assets**: `/assets/*`

## Security Considerations

1. **HTTPS Only**: Redirect HTTP to HTTPS
2. **Content Security Policy**: Add CSP headers
3. **No Sensitive Data**: Don't expose API keys
4. **Input Validation**: Validate user input
5. **Rate Limiting**: Limit API requests (if applicable)

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### High Memory Usage

- Check for memory leaks
- Monitor chunk generation
- Use ChunkCache effectively
- Reduce particle count

### Slow Load Times

- Enable GZIP compression
- Use CDN for assets
- Optimize images
- Check network tab in DevTools

## Support & Maintenance

- Monitor error logs
- Update dependencies regularly
- Test in multiple browsers
- Gather user feedback
- Plan regular updates

## Cost Estimation

### Hosting Costs

- GitHub Pages: Free
- Netlify: Free tier available
- Vercel: Free tier available
- Self-hosted: Varies ($5-50/month)
- CDN: $0.085/GB (CloudFlare, AWS, etc.)

### Development Tools

- GitHub: Free
- Vite: Free
- VS Code: Free
- Three.js: Free

## Future Enhancements

1. Multiplayer server
2. Persistent world storage
3. User accounts and saves
4. Mobile app versions
5. Advanced analytics
6. A/B testing capabilities
