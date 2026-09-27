# SFLCM — Creative Homepage Prototype

A creative, animated homepage concept for the **South Florida Conservatory of Music** (Hollywood, FL).
It is a **prototype only**: it is not deployed anywhere, it carries `noindex`, and every link points
out to the live [sflcm.com](https://sflcm.com) pages. Nothing here touches the production site.

---

## How to open it

No build step, no dependencies, no network needed (fonts are self-hosted).

**Option A: open the file directly**

Double-click `index.html`, or:

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

**Option B: serve it locally (recommended for phones on the same Wi-Fi)**

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

`npx serve .` works too.

---

## What's in the box

```
index.html                     The whole page (semantic HTML + inline SVG illustrations)
assets/css/styles.css          Layout, palette, typography, motion, responsive rules
assets/js/main.js              Scroll/reveal motion, logo choreography, countdown, .ics, open-now, nav
assets/js/synth.js             Tiny WebAudio "instrument sketches" for the keyboard section
assets/svg/sflcm-mark.svg      Vector rebuild of the real SFLCM mark (used as favicon too)
assets/img/sflcm-logo-*.png    The original raster logo from sflcm.com (footer + icons)
assets/img/concert-hall-*.*    Real photo of the SFLCM Concert Hall doors (cropped from the live event artwork)
assets/fonts/                  Instrument Serif, Inter, Space Grotesk (SIL OFL 1.1), latin subsets
```

---

## The concept: the homepage as a concert program

The live site's tagline is **"Where Music Comes to Life."** The prototype reads like a printed
concert program: each section is a numbered movement (I–IX) with an overture, an intermission
feature (the Grand Opening), and a finale.

| # | Section | What it does |
|---|---------|--------------|
| I | **Overture (hero)** | Headline, trial + pricing CTAs, Google rating, call/text. Art Deco arch window with an Atlantic sunrise. |
| — | Credentials strip | Juilliard · Berklee · Manhattan School of Music · UM Frost (from the live copy). |
| II | **Grand Opening** | Sat, Oct 10, 2026: Open House 3–5 PM (no RSVP) + Teachers' Concert 5–6:30 PM (free RSVP). Scroll-opened red doors, live countdown, Eventbrite RSVP, add-to-calendar. |
| III | **Instruments ("One octave")** | The seven instruments laid out as the seven white keys of an octave (C–B). Press a key to hear it. |
| IV | **Approach** | The four live-site pillars hang from notes on a staff, rising like a phrase. Count-up stats. |
| V | **Faculty** | The real roster from sflcm.com/team, typeset as a recital program; each name links to the bio. |
| VI | **Programs & events** | Youth Band (featured), "coming soon" ensembles, Step Up For Students, upcoming calendar. |
| VII | **Voices** | Four Google reviews featured on the live homepage. |
| VIII | **Trial ("Admit one")** | The trial offer as a ticket with a perforated price stub ($40 / $60 / $72). |
| IX | **Visit** | Address, hours, live "open now" status, parking tip, schematic map of Downtown Hollywood. |
| — | **Finale (footer)** | The mark assembles one last time over "Where Music Comes to Life." |

A red ribbon above the header counts down to the Grand Opening. A booking dock appears on phones
once the hero is out of view.

---

## Creative choices

### Brand: the real mark, rebuilt as vector
- The SFLCM mark (four figures with raised arms joining into a star) was traced from
  `sflcm.com/images/sflcm-logo.webp`: one figure = two Bézier "arms" + a head, rotated four times.
  It overlaps the original at **~97% pixel IoU** (the original's heads are hand-placed ~0.4% off-centre;
  the rebuild centres them).
- Colors are sampled directly: logo blue `#237aa1`, logo red `#b01a1a`, site primary teal `#006184`,
  secondary red `#b7201e`, coral `#ff554a` (the site's `secondary-container`, also the stripe on its OG card).
- The original PNG logo is still used in the footer and as the touch icon.

### Logo motion: choreographed, never looping
- **Assembly on a 4/4 conducting pattern.** Each figure raises its arms and its head drops in on a beat, in
  the order a conductor beats 4/4: *down, left, right, up*. The hero runs at roughly ♩=158 (380 ms per beat);
  the header version is quick.
- **Scroll bloom.** As the hero scrolls away, the mark rotates up to 45° and the figures drift outward, like a
  flower opening as the sun climbs. It is tied to scroll position and reverses when you scroll back.
- **Half-turn on hover.** Hovering the header logo or the finale turns the mark 180°. Because the mark is
  point-symmetric, it lands in exactly the brand orientation.
- There are no infinite animations anywhere on the page. Every animation either plays once or follows the
  user's scroll, pointer, or click.

### Custom SVG illustration (all inline, hand-built)
- **Atlantic sunrise in an Art Deco arch.** Hollywood is on the east coast, so the sun *rises* over the ocean
  here. The ocean's horizon lines are a five-line musical staff. The scene has Art Deco sunburst rays, drooping
  coconut palms (generated leaflet by leaflet), and a gold double frame with a keystone, a nod to South Florida's
  1920s architecture.
- **Concert Hall.** Modeled on the real hall: a teal wall with the gold "South Florida Conservatory of Music"
  sign, **red double doors** that swing open in 3D as you scroll, a red pleated curtain, track lights, a grand
  piano, and two blocks of chairs with a centre aisle. A spotlight follows your pointer. The real photo of the
  doors sits below it as a pinned print.
- **Seven instrument line drawings** (piano, violin, viola, cello, guitar, microphone, snare). They draw
  themselves in and "resonate" when played.
- **Staff and phrase mark** for the approach pillars (whole notes ascending E–A–D–G, with a slur fitted to
  the real note positions).
- **Ensemble waves** for the Youth Band: four voices in teal, sky, coral, and red that blend.
- **Schematic map** of Downtown Hollywood (Hollywood Blvd, Harrison St, S 20th Ave, Van Buren St, the Van Buren
  Garage, Anniversary Park), with the SFLCM mark in the pin.
- **Small touches:** the testimonial quote marks are beamed eighth notes, the trial offer is a ticket stub with
  real mask cut-outs, and there is a coral ribbon bookmark on the faculty program.

### The octave keyboard + sound
- Seven instruments map neatly onto seven white keys. Black keys sit between C–D, D–E, F–G, G–A, and A–B, just
  as on a piano. On phones the keyboard turns on its side.
- **"Hear it"** plays a short sound synthesized in the browser with WebAudio (no audio files): a C-major piano
  roll, a bowed violin D, viola E, cello F + C, a Karplus-Strong G-major guitar strum, a formant "ah" on A, and a
  kick/snare/hat groove. Nothing plays until you press a key.
- Keyboard easter egg: while the section is on screen, keys **A S D F G H J** play C through B, like a DAW.

### Type
- **Instrument Serif** for display (a high-contrast serif that suits a printed program; the name is a happy
  accident). **Inter** for body text and **Space Grotesk** for labels, both of which the live site already uses.

### Motion system
- Entrance motion uses IntersectionObserver plus CSS transitions (staggered fades, masked title lines, stroke
  draw-ins).
- Scroll-linked effects (hero bloom, sunrise, doors) run on a single rAF-throttled scroll handler that writes one
  CSS variable per scene, so layout is never thrashed.
- `prefers-reduced-motion` is fully honored: everything appears in its final state and the doors start open.

---

## Content sources (no invented facts)

Everything factual comes from the live **sflcm.com** (homepage, /group-classes, /events, /team, /contact,
structured data), read on **September 27, 2026**:

- Hero, pillars, stats (700+ families, 50,000+ lessons), Google rating (5.0, 93 reviews), instruments and taglines.
- Grand Opening details (date, times, RSVP rules, "both parts of the afternoon are free", Eventbrite link).
- Trial prices ($40/30 min, $60/45 min, $72/60 min; "special trial price from $40") and memberships
  ($229/$349/$419 per month).
- The faculty roster (13 names, instruments, and bio slugs) exactly as listed on /team.
- Testimonials: the Google reviews shown on the live homepage (first name + initial, as displayed there).
- Programs: Youth Band (ages 9–14, current students, weekly rehearsals); Chamber Ensemble, Group Piano, and
  Vocal Ensemble marked "coming soon"; Step Up For Students.
- Events: Hollywood Art Walk live music (Oct 17) and the Halloween Students Recital (Oct 31, time TBA).
- Address, phone, SMS body, email, hours, holiday closures, and the parking tip.

**Creative copy written for the prototype** (headlines only, easy to swap): "Seven instruments. One octave.",
"Our new Concert Hall opens its doors.", "Admit one: your first lesson.", "Find us in Downtown Hollywood.", and
the three trial steps (based on the live "hand-matched instructor" copy).

**No placeholders were needed.** Before going live, please double-check anything time-sensitive: the Art Walk
time, the recital time (still TBA on the live site), prices, and the roster.

Photos: the live site's generic hero images look like stock renders (one shows a different organization's
signage), so they were deliberately left out. The only photo used is the real Concert Hall entrance, cropped from
the live Grand Opening artwork to remove its baked-in headline.

---

## Built-in smarts

- The countdown switches itself to "Happening now" during the event. Afterwards it shows a thank-you and the
  top ribbon disappears.
- Past calendar items hide automatically.
- "Open now / Closed now" is computed in **America/New_York** time from the real hours and holiday closures.
- **Add to calendar** generates an `.ics` file on the spot (this works from `file://` too).
- The instructor count is taken from the rendered roster, so the two can't drift apart.

## Accessibility & compatibility

- Semantic landmarks, a skip link, labelled SVGs (`role="img"` + `<title>`), visible focus rings, a
  keyboard-operable menu (Esc closes it), and `aria-live` on the countdown status.
- Text contrast: coral buttons use dark ink text (about 5.4:1); on light backgrounds a deeper coral
  (`#d4402f`) is used for display italics.
- Classic `defer` scripts (no ES modules), so the page works from `file://`.
- Tested in headless Chrome at 1440×900 and 390×844 (iPhone-class), over `file://` and a static server:
  no console errors and no horizontal overflow. It should work in any evergreen browser (Chrome, Edge, Safari,
  Firefox).

## Deliberately out of scope

- Production deployment. This stays a prototype for review.
- A CMS or data layer. The content is static HTML so it's easy to review and edit.
