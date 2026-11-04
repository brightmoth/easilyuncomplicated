# Easily Uncomplicated: Brand

**Name:** Easily Uncomplicated
**Tagline:** Simple on purpose.
**Feel:** Clear, confident, modern, and approachable. A deep navy foundation, warm amber accent, and soft ivory neutrals.

## Status

| Decision | Status |
|---|---|
| Name | Chosen: Easily Uncomplicated |
| Core palette | Chosen: navy, amber, and ivory |
| Logo | EU monogram with a wordmark; use the monogram alone for app icons and other small spaces |

---

## 1. Core colours

| Name | Hex | Use |
|---|---|---|
| Navy | `#202D50` | Primary brand colour: wordmark on light surfaces, dark panels, headings, links, and primary buttons |
| Amber | `#F3B544` | Accent: monogram tile, small highlights, and secondary buttons with navy text |
| Ivory | `#F7F5EF` | Light logo details, text on navy, and light surfaces |

### Supporting neutrals

| Name | Hex | Use |
|---|---|---|
| Paper | `#F5F2EC` | Warm page and document background |
| Ink | `#202327` | Body text on light backgrounds |
| Muted ink | `#62676C` | Secondary text on light backgrounds |

Use the three core colours consistently. Supporting neutrals provide readable text and calm backgrounds without introducing competing brand colours.

---

## 2. Contrast

Measured with the standard WCAG contrast formula. Text needs 4.5:1 or more; large text and meaningful graphics need 3:1 or more.

| Pair | Ratio | Verdict |
|---|---:|---|
| Navy on Ivory | 12.4:1 | Pass (text) |
| Ivory on Navy | 12.4:1 | Pass (text) |
| Navy on Amber | 7.4:1 | Pass (text) |
| Amber on Navy | 7.4:1 | Pass (text) |
| Navy on Paper | 12.1:1 | Pass (text) |
| Ink on Paper | 14.1:1 | Pass (text) |
| Muted ink on Paper | 5.1:1 | Pass (text) |
| Amber on Ivory | 1.7:1 | Fails; do not rely on this pairing for text or important graphics |

Amber and ivory are both light colours, so keep navy between them where contrast is needed. Amber is an accent, not a text colour on light backgrounds.

---

## 3. Using the colours

- **Pages:** Paper or Ivory backgrounds, Ink body text, and Navy headings and links.
- **Primary buttons:** Navy with Ivory text.
- **Accent buttons:** Amber with Navy text.
- **Dark panels:** Navy with Ivory text; use Amber as a small highlight.
- **Cards:** Ivory or Paper surfaces with Navy headings and Ink body text.
- **Quiet text:** Muted ink on light backgrounds.
- **Amber:** Use sparingly for emphasis, not for long text or fine details on light surfaces.

---

## 4. Logo

The logo is a bold **EU monogram** paired with the name. The letters overlap to form a compact, recognizable mark.

### Versions

| Version | Use | How it looks |
|---|---|---|
| Wordmark lockup | Site header, banners, documents | Monogram beside “Easily Uncomplicated” |
| App icon | Favicon, app icon, social avatar | EU monogram centered in a rounded square |
| Monogram | Small spaces and compact layouts | EU letters without the full wordmark |

### Colour use

| Version | Background | Monogram | Wordmark / detail |
|---|---|---|---|
| Primary lockup | Navy | Amber tile, Navy E, Ivory U | Ivory words; Amber underline or small highlight |
| Light lockup | Ivory or Paper | Navy E and U on an Amber tile | Navy words; Amber detail |
| App icon | Navy | Amber E, Ivory U | No words |
| Monogram on light | Ivory or Paper | Navy letters on Amber tile | No words |

### Rules

- Keep the EU letter shapes, overlap, and proportions intact.
- Use Navy, Amber, and Ivory only in the logo; do not reintroduce the retired Pine/Olive/Slate palette or Lime accent.
- Do not place Amber text or details directly on Ivory; the contrast is too low.
- Keep clear space around the logo at least equal to the monogram tile's corner radius.
- Do not stretch, rotate, or add effects to the logo.
- Use the monogram alone at small sizes, and test that it remains legible at 16 px.

---

## 5. Type

- **Font:** Outfit, then Helvetica Neue and Arial as fallbacks.
- **Wordmark:** “Easily Uncomplicated” in title case, using a clear, modern sans-serif. Keep “Easily” heavier than “Uncomplicated” when using the two-line lockup.
- Keep body copy simple and readable; use weight and size before adding decorative effects.

---

## 6. CSS variables

```css
:root {
  --navy: #202D50;
  --amber: #F3B544;
  --ivory: #F7F5EF;
  --paper: #F5F2EC;
  --ink: #202327;
  --muted-ink: #62676C;
}
```

---

## 7. Still to do

1. Refine the EU monogram and create production SVGs for the wordmark lockup, app icon, and favicon. Outline text in final logo files so they do not depend on a locally installed font.
2. Update the site colours and logo when the pages are redesigned.
