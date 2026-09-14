# Direction contract: The Stack

**THESIS.** Each page is one card in an analyst's stack: one step of the argument, one dominant exhibit, and a button to the next step. It refuses the KPI-tile dashboard grid.

**OWN-WORLD.** One-bit ink on paper (#0E0E0C on #F4F4F0). Stipple dither marks anything modeled. 5×7 bitmap lettering is drawn in SVG; Verdana carries the body. Cards have 3px ink rules and hard one-bit shadows, stacked on a dithered desk. Rounded painted buttons invert when pressed. Deere green appears only on management guidance; Deere yellow only on the button that advances the argument and on the selected valuation point.

**STORY.** An executive reads PULSE's one finding, follows the yellow button to VALUATION, sees that $675.74 already prices a return to record EPS, and turns the P/E and scenario keys to test it.

**FIRST VIEWPORT.** A 3:2 card (1500×1000) on a dithered desk, with the stack index as mini cards at left. Bitmap "PULSE" at top left and the as-of line at top right. The finding sentence, then the segment-growth divergence exhibit running to the card edge, with the Q3 ledger at right. Painted buttons at bottom right; the yellow one leads to VALUATION.

**FORM.** Bolder-round challenger "HyperCard stack", fused with the product. Seed key ea862203.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

---

## Build notes

- **Medium grammar, not OS costume.** Cards, painted buttons, stack trail, dither and bitmap lettering are HyperCard's own medium. No fake Mac title bar, close box, menu bar or window chrome (Hallmark gate 47).
- **Lettering.** Power BI Service cannot load custom fonts. Display lettering is authored as SVG pixel glyphs from a 5×7 bitmap set, so it renders identically everywhere. Verdana (a screen face drawn on the pixel grid, installed on Windows and macOS) carries body text.
- **Provenance in one bit.** ACTUAL is solid ink, GUIDANCE is Deere green, MODEL is stipple dither plus a label. It never relies on color alone.
- **Non-destructive.** New cards are new pages. The old PULSE and VALUATION pages are hidden, not deleted, until the author approves.
- **Quality bar.** The catalog board and hero could not be opened (the browsing policy blocked impeccable.style). The build follows HyperCard's documented grammar instead; the finish review is told so.
