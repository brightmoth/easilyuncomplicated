# Easily Uncomplicated web brand assets

## Files

- `logo.svg` — horizontal logo for light backgrounds.
- `logo-dark.svg` — horizontal logo on a navy panel.
- `banner.svg` — wide navy banner with the logo and tagline.
- `icon.svg` — standalone EU app/site icon.
- `favicon.svg` — SVG favicon.
- `colors.css` — brand color custom properties.
- `youtube-profile.svg` / `youtube-profile.png` — square profile image with the mark inside YouTube's circular crop.
- `youtube-banner-2048x1152.svg` / `.png` — YouTube channel art at exactly 2048 × 1152 pixels.

## Use on the website

Add the favicon and palette stylesheet in the document head:

```html
<link rel="icon" href="/assets/brand/eu/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/brand/eu/colors.css">
```

Use the light logo in a header on a light background:

```html
<img src="/assets/brand/eu/logo.svg" alt="Easily Uncomplicated">
```

Use `logo-dark.svg` or `banner.svg` on dark surfaces. Keep the SVG's aspect ratio
when sizing it. The wordmark uses Outfit when available, followed by system
sans-serif fonts; load Outfit on the site if an exact type match is needed.

The SVG favicon is suitable for current browsers. If adding Apple Home Screen
support or legacy browser support, export `icon.svg` to PNG at the required
sizes and add those links to the site's document head.

## YouTube assets

The PNG files are ready to upload. The SVGs are included as scalable source
files. The banner's logo and text are grouped near the center so they remain
visible when YouTube crops the artwork for different screens.
