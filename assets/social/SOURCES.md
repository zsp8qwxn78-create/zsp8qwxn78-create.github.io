# Social icon assets: provenance and usage rules

Research, not legal advice. Full matrix: `docs/product/audit-2026-10-08/social-icons-legal.md`.
Rule for this folder: only files downloaded unchanged from the platform's own brand site. No tracing, recolouring, re-drawing or animation.

| File | Origin URL (fetched 2026-10-09) | SHA-256 | Usage rule applied |
|---|---|---|---|
| `x-logo-black.png` (768x785, 26,994 bytes) | https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.768.png (X Corp CDN rendition of `.../x/brand-toolkit/logo-black.png`, 2400x2453) | `1ef3fc5462634fbf83fadfef02d2cf0c7c90c6a2c7fb725aa01070d7d3d7a613` | X logo on light backgrounds (page headers, jade footer). Shown at 24 px (header) and 28 px (footer), 44 px tap target, >= 10 px clear space, never recoloured (ink #14212b is NOT used on the logo; black only). |
| `x-logo-white.png` (768x785, 28,100 bytes) | https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-white.png.twimg.768.png (rendition of `.../x/brand-toolkit/logo-white.png`) | `23bafe4a570af277747b8f5b141326d01593967c38f7e54d270e7722830e94f7` | X logo over the dark hero video in the homepage header only. |

Why PNG and not `x.svg`: X publishes these logo files publicly on its own domain as PNG only (no SVG at a public URL was found on 2026-10-09; the brand toolkit page at https://about.x.com/en/who-we-are/brand-toolkit currently serves the legacy Twitter kit with 2021 bird-logo zips). Converting the PNG to a hand-traced SVG would be an altered mark, so the official PNG is used as-is via `<img width height>`.

Terms on the X toolkit page (quoted 2026-10-09): "By using the Twitter trademarks and resources on this site, you agree to follow the Twitter Trademark Guidelines in our Brand Guidelines - as well as our Terms of Service and all other Twitter rules and policies." Download is a plain link, no click-through acceptance. Trademark questions: trademarks@x.com (per https://docs.x.com/developer-terms/display-requirements).

## Not stored here (and why)

- **Facebook "f" logo**: Meta's download (https://www.meta.com/brand/resources/facebook/logo/) is gated by the checkbox "I have read and accept the applicable guidelines and other terms for use." Accepting terms is Aaron's call, so no file was downloaded. The site uses the plain word "Facebook" until Aaron downloads `Facebook-Brand-Asset-Pack.zip` himself and drops the unaltered `f` logo here as `facebook.svg`/`.png` (blue or white versions only; Meta describes no black version; min 16 px; clear space 1/4 of the logo width).
- **Instagram glyph**: same click-through on https://www.meta.com/brand/resources/instagram/instagram-brand/ ; also no Busifier Instagram profile exists yet.
- **TikTok**: "You may not use TikTok logos, icons, symbols, or designs, without our prior written permission." (https://developers.tiktok.com/doc/getting-started-design-guidelines). No profile yet either.
- **YouTube**: standalone logo needs YouTube approval (brand.youtube, Brand Use Request Form; see marketing.md section 2). No profile yet.

## 2026-10-13 follow bar

`site/src/assets/social/facebook.png` and `instagram.png` and matching site-kit assets are proportional 96px reductions of the official PNGs in Meta's currently linked brand packs. Shapes/colors are unchanged. Sources: https://www.meta.com/brand/resources/facebook/logo/ (`Facebook-Brand-Asset-Pack.zip`, Primary Logo) and https://www.meta.com/brand/resources/instagram/instagram-brand/ (`IG_brand_asset_pack_2023.zip`, Gradient Glyph). These pages permit ordinary website follow use subject to the brand guidelines. 24px marks, 44px targets and clear space; no implied endorsement. The user explicitly requested this follow-bar use on October 13. X assets retain the existing official provenance above.

TikTok, YouTube, LinkedIn and other supported confirmed links currently retain readable name links in the customer kit until usable brand assets and applicable permissions are verified. Their absence never produces fake platform-home destinations.

Customer kit also packages LinkedIn's official blue `LI-In-Bug.png` from the `in-logo.zip` linked at https://brand.linkedin.com/downloads . The [in] guidelines explicitly permit hyperlink/profile/social-row use: https://brand.linkedin.com/in-logo . The icon is proportionally reduced, not recolored or reshaped.

Customer kit packages YouTube's official red digital icon from https://brand.youtube/youtube-icon (`https://www.gstatic.com/marketing-cms/78/29/3e68a1414bb28d0b7e47b44c3c91/youtube-icon.zip`). The current API branding guidance explicitly permits the YouTube icon in a social-icons panel linking to channel/content: https://developers.google.com/youtube/terms/branding-guidelines . Keep the full mark visible on a solid neutral background; do not crop the mark into a circle.

TikTok remains a text link: the current official developer guide explicitly requires prior written permission for its marks (https://developers.tiktok.com/docs/en/getting-started-design-guidelines, August 4, 2026). No permission was invented. The approved customer profile link itself still renders.
