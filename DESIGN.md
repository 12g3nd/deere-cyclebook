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
  title-panel:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  value-row:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  value-chart:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  label-row:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  body-table:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label-button:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  label-cell:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "17px"
    fontWeight: 700
  label-index:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  body-chart:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label-point:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "12px"
    fontWeight: 700
  body-note:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  label-tag:
    fontFamily: "Verdana, Geneva, sans-serif"
    fontSize: "10px"
    fontWeight: 700
rounded:
  none: "0px"
  button: "12px"
spacing:
  band-gap: "8px"
  gutter: "20px"
  index-gap: "26px"
  card-inset: "40px"
  lift: "4px"
  registry-row: "50px"
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
    typography: "{typography.label-cell}"
    rounded: "{rounded.button}"
    width: "109px"
    height: "53px"
  scenario-key-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
  strip-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-cell}"
    rounded: "{rounded.none}"
    width: "86px"
    height: "77px"
  strip-cell-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  registry-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-row}"
    rounded: "{rounded.none}"
    height: "{spacing.registry-row}"
---

# Design System: DEERE // CYCLEBOOK

## Overview

**Creative North Star: "The Stack"**

Each report page is one card in an analyst's HyperCard stack: a 3:2 card of paper resting on a dithered desk, carrying one step of the argument, one dominant exhibit, a ledger of the figures behind it, and a painted button to the next step. The world is one-bit. Ink sits on paper, and the only other marks are patterns (dither, stipple) and two sparingly used Deere colors that each carry exactly one meaning. It rejects the KPI-tile dashboard grid.

The medium is Power BI, with no HTML or CSS of its own. Every visible surface is a DAX-generated SVG with `shape-rendering='crispEdges'`, drawn onto native visuals whose containers are fully bare (no background, border, title, header, shadow or padding). Interaction is added by laying native visuals over the painting: an action button over a painted button body, a transparent slicer over painted keys and strips. Display lettering is a 5x7 bitmap drawn as SVG rects because the Power BI Service cannot load custom fonts. Verdana, a screen face built on the pixel grid that renders on Windows and macOS, carries everything else.

The medium grammar is HyperCard's own: cards, painted buttons, the stack trail, dither and bitmap lettering. There is no imitation OS: no Mac title bar, close box, menu bar or window chrome.

**Scope.** The system is carried by all seven Stack cards, generated by `tools/stack`: PULSE (`stack_pulse`), FINANCIALS (`stack_financials`), SEGMENTS (`stack_segments`), THE CYCLE (`stack_cycle`), MODEL LAB (`stack_modellab`), VALUATION (`stack_valuation`) and SOURCES (`stack_sources`). Nothing is pending rollout. The seven pre-Stack pages were deleted on 14 Sep 2026; the report holds only these seven cards. The Filters pane is hidden for readers because every control lives on the cards.

**Key Characteristics:**
- One-bit ink (#0E0E0C) on paper (#F4F4F0), crisp-edged, no anti-aliased decoration.
- Provenance is drawn, not colored: solid ink ACTUAL, green GUIDANCE, stipple-marked MODEL.
- Bitmap lettering in exactly two slots; Verdana everywhere else.
- One hard, blurless 4px ink lift for everything pressable, and 3px ink rules.
- Rounded painted buttons and keys that invert when pressed; square cards, cells and tags.
- A fixed 1920x1080 canvas with one 1500x1000 card on a dithered desk.

## Colors

A one-bit palette: ink and paper do all the work, and each of the two Deere colors has one job.

### Primary
- **Stack Ink** (ink): every line, rule, glyph, figure, bar, marker and label. It is also the pressed and selected fill (inverted state), the fill of the ACTUAL tag, and the fill of reported bars (FINANCIALS net income, the MODEL LAB FY2025 bar, THE CYCLE farm income).

### Secondary
- **Guidance Green** (guidance-green): management guidance and nothing else. It is used for the GUIDANCE tag, guidance values in the ledger, the guidance bracket and its labels on the valuation ladder, and the guidance band, its label and its legend swatch on the FINANCIALS exhibit. This is Deere green used as an analyst's annotation, not as livery.

### Tertiary
- **Advance Yellow** (advance-yellow): exactly two uses. One is the fill of the single painted button that advances the argument on each card ("Who earns the profit", "What drives demand", "Run the 2026 numbers", "What the price assumes", "Change the assumptions"). SOURCES, the last card, has none. The other is the 18px selected-multiple marker on the valuation ladder.

### Neutral
- **Card Paper** (paper): the card, the page background, button bodies, tag knockouts, the halo behind model numerals, the knockout behind a MODEL lead figure, and the backing behind chart labels.
- **Outspace Table** (outspace): only the area outside the 1920x1080 page, the table the desk sits on. It never appears on the card.

### Named Rules
**The One-Bit Rule.** Surfaces are ink or paper. Mid-tones are patterns of ink on paper (dither, stipple), never tints, greys or transparency.

**The Stipple Means Model Rule.** Stipple marks the author's model and only the model: MODEL tag swatches, MODEL value panels and lead-figure mats, the bear-to-bull scenario band, the model steps and model total on the MODEL LAB bridge, and the outcome swatches on every test strip. The 50% checker dither is the desk and appears nowhere on the card.

**The Green Is Guidance Rule.** Guidance Green appears only on management guidance. Every green element also carries the GUIDANCE word or a "Guidance" label, so the meaning never depends on color alone.

**The Yellow Moves the Argument Rule.** Each card has at most one yellow button, and it leads to the next step. The only other yellow is the selected valuation point.

## Typography

**Display Font:** Stack Bitmap 5x7. These are pixel glyphs defined in `stack_lib.js` and stored in the `Glyphs` calculated table (Code, 35-bit Bits), then drawn as SVG rects.
**Body Font:** Verdana (with Geneva, sans-serif)

**Character:** Blocky bitmap display lettering belongs to the medium and names the card. Verdana is wide and legible at small sizes, so it keeps dense financial rows readable. Both sit on the pixel grid.

### Hierarchy
- **Display, card title** (5x7 bitmap, 10px pixel, 70px cap height, 6-pixel advance): the card name, top left of the header, in ink.
- **Display, lead figure** (5x7 bitmap, 5px pixel, 35px cap height, right-aligned): the first figure in each ledger, filled in the row's provenance color.
- **Headline, finding claim** (Verdana 700, 24px, baseline 30): line one of every card's finding.
- **Body, finding evidence** (Verdana 400, 22px, baseline 70): line two of every card's finding, the figures behind the claim.
- **Title, exhibit and header** (Verdana 700, 16px): the exhibit title, the right-aligned "Deere & Company · NYSE: DE" line, and painted button labels. The as-of line under it is 15px regular.
- **Title, panel** (Verdana 700, 15px large panel, 14px small panel): small-multiple panel titles on THE CYCLE.
- **Ledger** (Verdana 700 15px for the lead label, 700 14px for row labels, 400 13px lead note and 12px row notes, 700 22px for row values).
- **Chart values** (Verdana 700, 15px): bar tops, bridge steps, series end labels and read-outs (14px on THE CYCLE panels and the valuation axis read-outs).
- **Exhibit table** (Verdana 700 14px row labels and column heads; 400 14px cells).
- **Chart text** (Verdana 400, 13px; 12px ticks on THE CYCLE panels): axes, legends and callouts.
- **Axis value row** (Verdana 700 12px row header, 400 12px values): series values set in rows under the x-axis on SEGMENTS.
- **Control label** (Verdana 700, 13px, sentence case): "Scenario", "P/E multiple" and the strip captions above their controls. Index card labels are 700 13px uppercase page names.
- **Cell** (Verdana 700 17px setting, 15px for basis-point settings, over 400 14px outcome): test strip cells and scenario keys.
- **Note** (Verdana 400, 12px): the sources line at the card foot, and registry types and notes.
- **Tag** (Verdana 700, 10px, uppercase): the ACTUAL, GUIDANCE and MODEL provenance words. This is the smallest type in the system; nothing goes below it.

### Named Rules
**The Claim Then Evidence Rule.** Every finding is two lines in one 1420x84 band: the claim in 24px bold, then its evidence in 22px regular. No card sets both lines bold or adds a third line. When a claim depends on live data, the authored sentence shows only while its data condition holds; otherwise line one is computed as a judgement from the same data (THE CYCLE: "Three of four demand signals went Deere's way this year. Housing starts didn't."). The card never falls back to a topic label.

**The Two Bitmap Slots Rule.** Bitmap lettering is used only for the card title and each ledger's lead figure. Findings, labels, values and buttons are set in Verdana.

**The No Loaded Fonts Rule.** No font is ever loaded. Anything that must look drawn is drawn as SVG rects from the Glyphs table; everything else is Verdana.

## Layout

The layout is a fixed 1920x1080 canvas (display option FitToPage), scaled to fit the viewer's window. There are no breakpoints.

- **Desk:** paper covered edge to edge with a 4px 50% checker dither.
- **Card stack:** the top card is 1500x1000 at (216, 36) with a 4px ink outline. Two paper sheets sit behind it, offset 10px and 20px down-right with 3px outlines, and a solid ink sheet at a 26px offset grounds the stack.
- **Content box:** a 40px inset inside the card gives content from x 256 to 1676 (1420px wide), starting at y 64.
- **Vertical order:** header band (96px at y 64, closed by a 4px ink rule), 8px gap, finding band (84px at y 172), 8px gap, then the exhibit at left and the ledger at right from y 264, separated by a 20px gutter.
- **Two card shapes.**
  - *Reading cards* (PULSE, FINANCIALS, SEGMENTS, THE CYCLE, SOURCES): exhibit 960x620, ledger 440 wide. The card foot sits at y 912: the sources note at left, painted buttons right-aligned.
  - *Control cards* (MODEL LAB, VALUATION): exhibit 1000x540, ledger 400 wide. A controls row follows: 13px captions at y 818, scenario keys at y 844, strips at y 848. The foot drops to y 946 with the note at y 968.
- **Exhibit share:** the exhibit always takes the larger share of the width.
- **Painted buttons:** 56px tall, 20px apart, right-aligned to x 1676; the yellow button is always rightmost.
- **Stack index:** seven square mini cards (160x107) in a column at x 28, starting at y 84 with a 133px pitch (26px gap). They sit on the desk, outside the card.
- **Ledger rhythm:** a 112px lead row, then 76px rows. The provenance tag sits 34px into each row (38px in the lead).
- **Small multiples (THE CYCLE):** two large panels (510x200 plot) stacked at left and two small panels (130x140 plot) at x 680, all on one shared 2020-to-latest month axis so the four drivers line up in time.

## Elevation & Depth

Depth is one-bit. There are no blurs, gradients or tonal layers. Anything you press is lifted by a solid ink copy of its own shape offset 4px right and 4px down, and the card sits above the desk by stacking sheets. A pressed or selected control drops that lift, either by inverting to ink or by moving into its shadow.

### Shadow Vocabulary
- **Lift** (ink shape offset 4px right and 4px down, same 3px stroke, same radius, no blur): painted buttons (SVG shadow rect at 5.5 against the body at 1.5), scenario keys (SVG), and index mini cards (native actionButton, shadow distance 4, blur 0).
- **Card stack** (paper sheets at 10px and 20px offsets with 3px ink outlines, over a solid ink sheet at 26px): the card on the desk.

Test strip cells, tags, ledgers and exhibits have no lift; they are printed on the card, not pressed.

### Named Rules
**The One Lift Rule.** Every lift is solid ink, zero blur, 4px down-right. Soft, ambient, colored or differently sized shadows do not exist in this world.

**The Pressed Goes Flat Rule.** A pressed or selected control loses its lift. Painted buttons fill with ink and letter in paper. A selected scenario key moves into its shadow position and fills with ink. A selected strip cell inverts and drops its stipple swatch.

## Shapes

- **Radius:** controls you press are rounded, and cards are square. Painted buttons and scenario keys use a 12px radius. Cards, index mini cards, strip cells, tags, ledger panels, callout boxes, bars and chart markers are square.
- **Rules:** the card outline is 4px (3px on the sheets behind). The header closes with a 4px rule. Ledgers, exhibit tables and the source registry share one rule set: a 3px opening rule, 1px row dividers, and (for ledgers and tables) a 2px closing rule. Control outlines are 3px, callout boxes 2px, and the MODEL tag outline 1.5px.
- **Chart marks:** zero lines and axes are 3px ink bars, and gridlines are 1px ink with a 2/5 dash. Series are told apart by weight and dash, never by color: 5px solid, 3px with a 14/7 dash, 3px with a 4/6 dash. Connectors and drop lines are dotted (1px 3/3 on the bridge, 2px 3/4 on the ladder). Data points are square: 8px on series, 10px for the close, 14px for reference points (solid ink for the record, paper with a 3px outline for the model scenario), and 18px yellow for the selected multiple.
- **Brackets:** a span is marked by a 3px ink rule with 3x12 end ticks and a 14px bold label (the SEGMENTS fiscal-year bracket); guidance is bracketed the same way in green on the ladder.
- **Patterns:** desk dither is a 4px tile with two 2px ink squares on the diagonal. Stipple comes in two densities, both meaning model: a 6px tile with one 2px ink square (tag swatch, scenario band, strip swatches, bridge fills) and an 8px tile with two 2px ink squares (ledger MODEL panels and the MODEL lead mat).

## Components

### Buttons
Tactile and literal: a painted HyperCard button you can press.
- **Construction:** two layers. The body is a static SVG image: a 12px-radius ink shadow rect with a 3px ink stroke offset 4px down-right, under the 12px-radius paper (or yellow) body with the same 3px stroke. On top, a native actionButton is inset 3px onto the inner edge of the stroke. It owns the Verdana Bold 16px label and the click, with its ink fill fully transparent at rest. The body is SVG because actionButton cannot draw rounded corners.
- **Plain:** paper body, ink label, 220px wide, 56px tall.
- **Go:** Advance Yellow body, ink label, 360px wide. One per card, rightmost.
- **Hover:** the label underlines. The body does not change.
- **Pressed:** the inset button fills solid ink (transparency 0) and the label turns paper. The square ink fill merges with the rounded ink stroke.

### Stack Index (navigation)
- **Style:** seven square native actionButtons (160x107) in page order: PULSE, FINANCIALS, SEGMENTS, THE CYCLE, MODEL LAB, VALUATION, SOURCES. Each has a paper fill, a 3px ink outline, the 4px lift and a 13px bold uppercase label.
- **Current:** ink fill, paper label.
- **Hover:** the outline thickens to 4px.
- They are square because they are cards, not buttons.

### Provenance Tags (chips)
- **ACTUAL:** a solid ink 54x16 block with a paper word.
- **GUIDANCE:** a solid green 72x16 block with a paper word.
- **MODEL:** a 60x16 paper block with a 1.5px ink outline, an 8px stipple swatch at left and an ink word.
- Every ledger row and every registry row carries exactly one tag. Tags use 10px bold uppercase Verdana and are square.

### Card Header
- A 1420x96 band. The bitmap card title sits at left. Two right-aligned Verdana lines sit at right: the company line in 16px bold, and the close, date and reporting period in 15px regular. The band closes with a 4px full-width ink rule.

### Finding
- A 1420x84 SVG band on every card: the claim in 24px bold on the first baseline, the evidence in 22px regular on the second. Live cards (MODEL LAB, VALUATION) rebuild both lines from the current settings; the standard does not change.
- Data-conditioned claims (SEGMENTS, THE CYCLE) show the authored sentence while the data supports it. Otherwise line one is recomputed as a judgement: THE CYCLE counts how many of the four demand drivers moved in Deere's favour (crop prices up, rates down, housing starts up) and names the ones that did not. It never degrades to a topic label.

### Ledger (signature component)
- **Structure:** a 3px top rule, a lead row (15px bold label, tag, 13px note, bitmap figure right-aligned), then 76px rows (14px bold label, tag with a 12px note beside it, 22px bold value right-aligned), each divided by a 1px rule, and a 2px closing rule.
- **Value color:** ink for ACTUAL and MODEL, green for GUIDANCE.
- **MODEL rows:** the value sits on a 150px-wide 8px stipple panel inset 10px top and bottom. The numerals carry a 7px paper halo so they stay legible over the pattern.
- **MODEL lead:** when the lead row is MODEL, the bitmap figure sits on an 8px stipple mat 50px tall that runs 34px past the figure's left edge, with a paper knockout (6px margin) directly behind the glyphs, and the figure pulled 12px in from the edge.

### Exhibit Table
- Rows of the figures behind a chart, aligned under its columns: FINANCIALS Sales and EPS under each fiscal year, MODEL LAB Sales and Margin under each bridge column.
- A 3px rule opens the table, a 1px rule divides the rows, a 2px rule closes it. Row labels are 14px bold at left; cells are 14px regular, centred on their column. Year-to-date cells say so ("to Q3").

### MODEL LAB Bridge (waterfall)
- FY2025 reported operating profit is a solid ink bar. Each segment step (PPA, SAT, C&F) is a 110px 6px-stipple block with a 2px ink outline spanning from the running total to the next. The FY2026 model total is a stipple bar with a 3px ink outline.
- Steps are joined by 1px dotted (3/3) connectors at the running total.
- Step and total labels are 15px bold, signed for steps (+$0.91B), on a 116x22 paper backing above the bar. The legend pairs a solid swatch ("Reported") with an outlined stipple swatch ("CYCLEBOOK model").

### Still to Earn (FINANCIALS)
- The current year's year-to-date bar is solid ink, labelled in paper inside the bar. Between its top and the bottom of the green guidance band, a 2px ink outline with a 6/4 dash marks the Q4 amount still to earn. The legend repeats it as a dashed square. The guidance label sits above the band on a paper backing: "Guidance" line in green, the Q4 requirement in ink.

### Small-Multiple Panels (THE CYCLE)
- Each panel has its own 14-15px bold title, 1px dotted gridlines with 12px tick labels, a 3px zero bar and year ticks (every year on large panels, every other year on small ones), all on one 2020-to-latest axis.
- Series end in a 14px bold value label. Annual data is drawn as solid ink bars at mid-year; where a series stops early, an 11px note says "no data after" the last year.

### Chart Labels
- Labels that cross marks sit on a paper backing: the MODEL LAB bridge step and total labels (15px bold) and the VALUATION axis read-outs (14px bold).
- Values that would cover series lines are not placed on the chart. They move to rows under the x-axis: on SEGMENTS, the FY2026 SAT and PPA operating profit sit in two rows (y 592 and 610) with 12px bold row headers ("SAT, $M", "PPA, $M") right-aligned left of the first FY2026 quarter and 12px regular values centred under each quarter.
- A fiscal-year span is marked by the bracket in Shapes, labelled at its right end in 14px bold, drawn only while the claim it supports is true. Fiscal-year names sit under the quarter labels in 14px bold, with dotted 1px dividers between years.

### Scenario Keys (input)
- A painted SVG of three 109x53 keys (Bear, Base, Bull) with 12px radius, 3px ink outline, 4px lift and a 17px bold label.
- **Selected:** the key moves into its shadow position, fills ink and letters in paper.
- A native button slicer with transparent tiles sits exactly on top. Its tiles show a 2px ink outline only on hover.

### Test Strips (input)
One pattern for three controls: the P/E strip (VALUATION) and the sales and margin adjustment strips (MODEL LAB).
- A row of square cells with a 3px ink outline, about 77px tall (86px wide on P/E, 88px on sales, 92px on margin). Each cell shows its setting (17px bold; 15px for basis points) over the outcome at that step (14px regular: implied value per share on P/E, FY2026 EPS on sales and margin) and a 12px-tall stipple swatch, because the outcome is model.
- **Selected:** the cell inverts to ink with paper numerals and drops its swatch.
- A transparent native button slicer sits on top, the same way as the scenario keys.

### Synced Controls
- Scenario, sales and margin choices are slicer sync groups (cbScenario, cbSales, cbMargin), so a setting made on MODEL LAB carries to VALUATION and back. VALUATION holds hidden synced copies of the two adjustment slicers, so it prices the same model without showing the strips. Sales and margin changes reach scenario net income after tax at the FY2026 year-to-date effective rate, and the MODEL LAB ledger shows that rate as a MODEL row.
- A card that carries settings over says so in its foot note ("carry over to VALUATION").

### Source Registry Row (SOURCES)
- One 50px row per source under a 3px rule, sorted ACTUAL, then GUIDANCE, then MODEL. The tag sits at left; at x 92 the source name in 14px bold is followed by its type in 12px regular after a middle dot; the line below carries notes and location in 12px regular (scheme and "www." stripped). A 1px rule closes each row.
- Text is reader wording: author-facing registry text ("Bundled…", "live refresh") is rewritten inside the SOURCES measure.

## Do's and Don'ts

### Do:
- **Do** draw every visible surface as crisp-edged SVG and keep native containers bare (no background, border, title, header, drop shadow or padding).
- **Do** tag every figure ACTUAL, GUIDANCE or MODEL, and put MODEL values on a stipple panel or mat.
- **Do** write every finding as a 24px bold claim over a 22px regular evidence line.
- **Do** separate chart series by line weight and dash pattern (5px solid; 3px 14/7; 3px 4/6), and use square point markers.
- **Do** build rounded controls as a painted SVG body with a native actionButton inset 3px or a transparent slicer laid on top.
- **Do** lift every pressable thing by exactly 4px, and invert pressed and selected states to ink fill with paper lettering while dropping the lift.
- **Do** set chart labels that cross marks on a paper backing, and move values that would cover series lines into rows under the axis.
- **Do** put the figures behind a chart in a ruled table under it (3px, 1px, 2px).
- **Do** keep content inside the card's 40px inset and put the yellow button rightmost in the card foot.

### Don't:
- **Don't** use soft, blurred or colored shadows, gradients, tints or visible transparency. Mid-tones are ink patterns.
- **Don't** use dither on the card. The 50% checker belongs to the desk; stipple belongs to the model.
- **Don't** use Guidance Green for anything but management guidance, or Advance Yellow for anything but the one advancing button and the selected valuation point.
- **Don't** use bitmap lettering outside the card title and the ledger lead figure, and don't load or reference any font other than Verdana.
- **Don't** add OS costume: Mac title bars, close boxes, menu bars or window chrome.
- **Don't** round cards, index mini cards, tags or strip cells. Only pressable painted buttons and keys are rounded (12px).
- **Don't** set type below 10px, or put Outspace grey on the card.
