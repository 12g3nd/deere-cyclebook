---
name: DEERE // CYCLEBOOK
description: An equity-research card stack on Deere & Company, drawn in one-bit ink on paper.
colors:
  ink: "#0E0E0C"
  paper: "#F4F4F0"
  guidance-green: "#367C2B"
  advance-yellow: "#FFDE00"
  outspace: "#5E5E5A"
typography:
  display-title:
    fontFamily: "Stack Bitmap 5x7 (SVG pixel glyphs from the Glyphs table)"
    fontSize: "70px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "10px"
  display-figure:
    fontFamily: "Stack Bitmap 5x7 (SVG pixel glyphs from the Glyphs table)"
    fontSize: "35px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "5px"
  headline-finding:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.67
  body-finding:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.8
  title-exhibit:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  value-row:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  label-row:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  label-button:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  label-index:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  body-chart:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label-tag:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "10px"
    fontWeight: 700
  body-note:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  none: "0px"
  button: "12px"
spacing:
  band-gap: "8px"
  gutter: "20px"
  index-gap: "26px"
  card-inset: "40px"
  ledger-row: "76px"
  ledger-lead: "112px"
components:
  button-painted:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-button}"
    rounded: "{rounded.button}"
    height: "56px"
    width: "220px"
  button-painted-go:
    backgroundColor: "{colors.advance-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label-button}"
    rounded: "{rounded.button}"
    height: "56px"
    width: "360px"
  button-painted-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
  index-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-index}"
    rounded: "{rounded.none}"
    width: "160px"
    height: "107px"
  index-card-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-index}"
    rounded: "{rounded.none}"
  tag-actual:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-tag}"
    rounded: "{rounded.none}"
    height: "16px"
    width: "54px"
  tag-guidance:
    backgroundColor: "{colors.guidance-green}"
    textColor: "{colors.paper}"
    typography: "{typography.label-tag}"
    rounded: "{rounded.none}"
    height: "16px"
    width: "72px"
  tag-model:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-tag}"
    rounded: "{rounded.none}"
    height: "16px"
    width: "60px"
  scenario-key:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    width: "109px"
    height: "53px"
  scenario-key-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
  pe-step:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "86px"
    height: "77px"
  pe-step-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
---

# Design System: DEERE // CYCLEBOOK

## Overview

**Creative North Star: "The Stack"**

Each report page is one card in an analyst's HyperCard stack: a 3:2 card of paper resting on a dithered desk, carrying one step of the argument, one dominant exhibit, a ledger of the figures behind it, and a painted button to the next step. The world is one-bit. Ink sits on paper, and the only other marks are patterns (dither, stipple) and two sparingly used Deere colors that each carry exactly one meaning. It rejects the KPI-tile dashboard grid.

The medium is Power BI, with no HTML or CSS of its own. Every visible surface is a DAX-generated SVG with `shape-rendering='crispEdges'`, drawn onto native visuals whose containers are fully bare (no background, border, title, header, shadow or padding). Interaction is added by laying native visuals over the painting: an action button over a painted button body, a transparent slicer over painted keys and strips. Display lettering is a 5x7 bitmap drawn as SVG rects because the Power BI Service cannot load custom fonts. Verdana, a screen face built on the pixel grid that renders on Windows and macOS, carries everything else.

The medium grammar is HyperCard's own: cards, painted buttons, the stack trail, dither and bitmap lettering. There is no imitation OS: no Mac title bar, close box, menu bar or window chrome.

**Scope.** The system is carried by the two Stack cards, PULSE (`stack_pulse`) and VALUATION (`stack_valuation`), generated by `tools/stack`. FINANCIALS, SEGMENTS, THE CYCLE, MODEL LAB and SOURCES still carry the pre-redesign look. They are **pending rollout**, and nothing on them is system guidance. The two hidden "(v1)" pages are retired.

**Key Characteristics:**
- One-bit ink (#0E0E0C) on paper (#F4F4F0), crisp-edged, no anti-aliased decoration.
- Provenance is drawn, not colored: solid ink ACTUAL, green GUIDANCE, stipple-marked MODEL.
- Bitmap lettering in exactly two slots; Verdana everywhere else.
- Hard, blurless one-bit shadows and 3px ink rules.
- Rounded painted buttons that invert when pressed; square cards.
- A fixed 1920x1080 canvas with one 1500x1000 card on a dithered desk.

## Colors

A one-bit palette: ink and paper do all the work, and each of the two Deere colors has one job.

### Primary
- **Stack Ink** (ink): every line, rule, glyph, figure, marker and label. It is also the pressed and selected fill (inverted state) and the fill of the ACTUAL tag.

### Secondary
- **Guidance Green** (guidance-green): management guidance and nothing else. It is used for the GUIDANCE tag, guidance values in the ledger, and the guidance bracket and its labels on the valuation ladder. This is Deere green used as an analyst's annotation, not as livery.

### Tertiary
- **Advance Yellow** (advance-yellow): exactly two uses. One is the fill of the single painted button that advances the argument on each card ("What the price assumes", "Change the assumptions"). The other is the 18px selected-multiple marker on the valuation ladder.

### Neutral
- **Card Paper** (paper): the card, the page background, button bodies, tag knockouts, and the halo behind model numerals.
- **Outspace Table** (outspace): only the area outside the 1920x1080 page, the table the desk sits on. It never appears on the card.

### Named Rules
**The One-Bit Rule.** Surfaces are ink or paper. Mid-tones are patterns of ink on paper (dither, stipple), never tints, greys or transparency.

**The Stipple Means Model Rule.** Stipple marks the author's model and only the model: MODEL tag swatches, MODEL value panels, the bear-to-bull scenario band, and the implied-value swatches on the P/E strip. The 50% checker dither is the desk and appears nowhere on the card.

**The Green Is Guidance Rule.** Guidance Green appears only on management guidance. Every green element also carries the GUIDANCE word or a "Guidance" label, so the meaning never depends on color alone.

**The Yellow Moves the Argument Rule.** Each card has at most one yellow button, and it leads to the next step. The only other yellow is the selected valuation point.

## Typography

**Display Font:** Stack Bitmap 5x7. These are pixel glyphs defined in `stack_lib.js` and stored in the `Glyphs` calculated table (Code, 35-bit Bits), then drawn as SVG rects.
**Body Font:** Verdana (with Geneva, sans-serif)

**Character:** Blocky bitmap display lettering belongs to the medium and names the card. Verdana is wide and legible at small sizes, so it keeps dense financial rows readable. Both sit on the pixel grid.

### Hierarchy
- **Display, card title** (5x7 bitmap, 10px pixel, 70px cap height, 6-pixel advance): the card name, top left of the header, in ink.
- **Display, lead figure** (5x7 bitmap, 5px pixel, 35px cap height, right-aligned): the first figure in each ledger, filled in the row's provenance color.
- **Headline, finding** (Verdana 700, 24px, two baselines 40px apart): the card's one finding sentence, directly under the header.
- **Body, finding support** (Verdana 400, 22px): the evidence line under the finding on PULSE.
- **Title, exhibit and header** (Verdana 700, 16px): the exhibit title, the right-aligned "Deere & Company · NYSE: DE" line, and painted button labels. The as-of line under it is 15px regular.
- **Ledger** (Verdana 700 15px for the lead label, 700 14px for row labels, 400 12-13px for notes, 700 22px for row values): rows of label, provenance tag, note and a right-aligned value.
- **Chart text** (Verdana 400, 13px; 700 13-15px for end labels and read-outs): axes, legends, series end labels and callouts.
- **Control label** (Verdana 700, 13px, sentence case): "Scenario" and "P/E multiple" above their controls. Index card labels are 700 13px uppercase page names.
- **Tag** (Verdana 700, 10px, uppercase): the ACTUAL, GUIDANCE and MODEL provenance words. This is the smallest type in the system; nothing goes below it.
- **Note** (Verdana 400, 12px): the sources line at the card foot.

### Named Rules
**The Two Bitmap Slots Rule.** Bitmap lettering is used only for the card title and each ledger's lead figure. Findings, labels, values and buttons are set in Verdana.

**The No Loaded Fonts Rule.** No font is ever loaded. Anything that must look drawn is drawn as SVG rects from the Glyphs table; everything else is Verdana.

## Layout

The layout is a fixed 1920x1080 canvas (display option FitToPage), scaled to fit the viewer's window. There are no breakpoints.

- **Desk:** paper covered edge to edge with a 4px 50% checker dither.
- **Card stack:** the top card is 1500x1000 at (216, 36) with a 4px ink outline. Two paper sheets sit behind it, offset 10px and 20px down-right with 3px outlines, and a solid ink sheet at a 26px offset grounds the stack.
- **Content box:** a 40px inset inside the card gives content from x 256 to 1676 (1420px wide), starting at y 64.
- **Vertical order:** header band (96px, closed by a 4px ink rule), 8px gap, finding band (84px), 8px gap, then the exhibit at left and the ledger at right, separated by a 20px gutter. Below that come controls (VALUATION only), then the card foot: sources note at left, painted buttons right-aligned to the content edge.
- **Exhibit and ledger split:** PULSE uses 960 + 20 + 440. VALUATION uses 1000 + 20 + 400. The exhibit always takes the larger share.
- **Painted buttons:** 56px tall, 20px apart, and the yellow button is always rightmost.
- **Stack index:** seven square mini cards (160x107) in a column at x 28, starting at y 84 with a 133px pitch (26px gap). They sit on the desk, outside the card.
- **Ledger rhythm:** a 112px lead row, then 76px rows. The provenance tag sits 34px into each row.

## Elevation & Depth

Depth is one-bit. There are no blurs, gradients or tonal layers. Things are lifted by a solid ink offset of the same shape directly behind them, and a card sits above the desk by stacking sheets. A pressed or selected control drops that lift, either by inverting to ink or by moving into its shadow.

### Shadow Vocabulary
- **Painted button lift** (ink shape offset 3px right and 3px down, no blur, same 12px radius): painted navigation buttons.
- **Key and index lift** (ink offset 4px right and 4px down, no blur): scenario keys (SVG) and index mini cards (native actionButton, shadow distance 4, blur 0).
- **Card stack** (paper sheets at 10px and 20px offsets with 3px ink outlines, over a solid ink sheet at 26px): the card on the desk.

### Named Rules
**The Hard Shadow Rule.** Every shadow is solid ink with zero blur and a small down-right offset of 3-4px. Soft, ambient or colored shadows do not exist in this world.

**The Pressed Goes Flat Rule.** A pressed or selected control loses its lift. Painted buttons fill with ink and letter in paper. A selected scenario key moves into its shadow position and fills with ink. A selected P/E step inverts.

## Shapes

- **Radius:** controls you press are rounded, and cards are square. Painted buttons and scenario keys use a 12px radius. Cards, index mini cards, P/E steps, tags, ledger panels, callout boxes and chart markers are square.
- **Rules:** the card outline is 4px (3px on the sheets behind). The header closes with a 4px rule, the ledger opens with a 3px rule and closes with a 2px rule, and ledger rows divide with 1px rules. Control outlines are 3px, callout boxes 2px, and the MODEL tag outline 1.5px.
- **Chart marks:** zero lines and axes are 3px ink bars, and gridlines are 1px ink with a 2/5 dash. Series are told apart by weight and dash, never by color: 5px solid, 3px with a 14/7 dash, 3px with a 4/6 dash. Data points are square: 8px on series, 10px for the close, 14px for reference points (solid ink for the record, paper with a 3px outline for the model scenario), and 18px yellow for the selected multiple.
- **Patterns:** desk dither is a 4px tile with two 2px ink squares on the diagonal. Stipple comes in two densities, both meaning model: a 6px tile with one 2px ink square (tag swatch, scenario band, P/E swatches) and an 8px tile with two 2px ink squares (ledger MODEL panels).

## Components

### Buttons
Tactile and literal: a painted HyperCard button you can press.
- **Construction:** two layers. The body is a static SVG image with a 12px-radius paper (or yellow) rect, a 3px ink stroke and a 3px hard ink shadow. On top, a native actionButton is inset 3px onto the inner edge of the stroke. It owns the Verdana Bold 16px label and the click, with its fill fully transparent at rest. The body is SVG because actionButton cannot draw rounded corners.
- **Plain:** paper body, ink label, 220px wide, 56px tall.
- **Go:** Advance Yellow body, ink label, 360px wide. One per card, rightmost.
- **Hover:** the label underlines. The body does not change.
- **Pressed:** the inset button fills solid ink (transparency 0) and the label turns paper. The square ink fill merges with the rounded ink stroke.

### Stack Index (navigation)
- **Style:** seven square native actionButtons (160x107) in page order: PULSE, FINANCIALS, SEGMENTS, THE CYCLE, MODEL LAB, VALUATION, SOURCES. Each has a paper fill, a 3px ink outline, a 4px hard ink shadow and a 13px bold uppercase label.
- **Current:** ink fill, paper label.
- **Hover:** the outline thickens to 4px.
- They are square because they are cards, not buttons.

### Provenance Tags (chips)
- **ACTUAL:** a solid ink 54x16 block with a paper word.
- **GUIDANCE:** a solid green 72x16 block with a paper word.
- **MODEL:** a 60x16 paper block with a 1.5px ink outline, an 8px stipple swatch at left and an ink word.
- Every ledger row carries exactly one tag. Tags use 10px bold uppercase Verdana and are square.

### Ledger (signature component)
- **Structure:** a 3px top rule, a lead row (15px bold label, tag, note, bitmap figure right-aligned), then 76px rows (14px bold label, tag with a 12px note beside it, 22px bold value right-aligned), each divided by a 1px rule, and a 2px closing rule.
- **Value color:** ink for ACTUAL and MODEL, green for GUIDANCE.
- **MODEL rows:** the value sits on a 150px-wide stipple panel inset 10px top and bottom, pulled 10px in from the edge. The numerals carry a 7px paper halo so they stay legible over the pattern.

### Card Header
- A 1420x96 band. The bitmap card title sits at left. Two right-aligned Verdana lines sit at right: the company line in 16px bold, and the close, date and reporting period in 15px regular. The band closes with a 4px full-width ink rule.

### Finding
- The card's one sentence in 24px bold Verdana on the first baseline. The second baseline carries the supporting evidence (22px regular on PULSE) or the second clause of a live, model-driven sentence (24px bold on VALUATION).

### Scenario Keys (input)
- A painted SVG of three 109x53 keys (Bear, Base, Bull) with 12px radius, 3px ink outline, 4px hard shadow and a 17px bold label.
- **Selected:** the key moves into its shadow position, fills ink and letters in paper.
- A native button slicer with transparent tiles sits exactly on top. Its tiles show a 2px ink outline only on hover.

### P/E Test Strip (input)
- A row of square cells (about 86x77, 3px ink outline). Each shows the multiple (17px bold) over the implied value (14px) and a 72x12 stipple swatch, because the implied value is model.
- **Selected:** the cell inverts to ink with paper numerals and drops its swatch.
- A transparent native slicer sits on top, the same way as the scenario keys.

## Do's and Don'ts

### Do:
- **Do** draw every visible surface as crisp-edged SVG and keep native containers bare (no background, border, title, header, drop shadow or padding).
- **Do** tag every figure ACTUAL, GUIDANCE or MODEL, and put MODEL values on a stipple panel.
- **Do** separate chart series by line weight and dash pattern (5px solid; 3px 14/7; 3px 4/6), and use square point markers.
- **Do** build rounded controls as a painted SVG body with a native actionButton inset 3px or a transparent slicer laid on top.
- **Do** invert pressed and selected states to ink fill with paper lettering, and drop the lift.
- **Do** keep content inside the card's 40px inset and put the yellow button rightmost in the card foot.

### Don't:
- **Don't** use soft, blurred or colored shadows, gradients, tints or visible transparency. Mid-tones are ink patterns.
- **Don't** use dither on the card. The 50% checker belongs to the desk; stipple belongs to the model.
- **Don't** use Guidance Green for anything but management guidance, or Advance Yellow for anything but the one advancing button and the selected valuation point.
- **Don't** use bitmap lettering outside the card title and the ledger lead figure, and don't load or reference any font other than Verdana.
- **Don't** add OS costume: Mac title bars, close boxes, menu bars or window chrome.
- **Don't** round cards, index mini cards, tags or P/E steps. Only pressable painted buttons and keys are rounded (12px).
- **Don't** set type below 10px, or put Outspace grey on the card.
- **Don't** take guidance from FINANCIALS, SEGMENTS, THE CYCLE, MODEL LAB or SOURCES until they are rolled onto the Stack.
