// PBIR JSON builders for The Stack pages.
const crypto = require("crypto");
const { C } = require("./stack_lib");

const VC_SCHEMA = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json";
const PAGE_SCHEMA = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json";
const FONT = "'Verdana'";

const newId = () => crypto.randomBytes(10).toString("hex");
const lit = (v) => ({ expr: { Literal: { Value: v } } });
const str = (s) => lit(`'${String(s).replace(/'/g, "''")}'`);
const num = (n) => lit(`${n}D`);
const int = (n) => lit(`${n}L`);
const bool = (b) => lit(b ? "true" : "false");
const color = (hex) => ({ solid: { color: str(hex) } });
const measure = (name) => ({ expr: { Measure: { Expression: { SourceRef: { Entity: "_Measures" } }, Property: name } } });
const props = (p, selector) => (selector ? { properties: p, selector: { id: selector } } : { properties: p });

// Every Stack visual draws its own frame; the container stays invisible.
const bareContainer = (extra = {}) => ({
  background: [props({ show: bool(false) })],
  border: [props({ show: bool(false) })],
  title: [props({ show: bool(false) })],
  visualHeader: [props({ show: bool(false) })],
  dropShadow: [props({ show: bool(false) })],
  padding: [props({ top: num(0), bottom: num(0), left: num(0), right: num(0) })],
  ...extra,
});

const container = (pos, visual) => ({
  $schema: VC_SCHEMA,
  name: newId(),
  position: { x: pos.x, y: pos.y, z: pos.z, height: pos.h, width: pos.w, tabOrder: pos.z },
  visual,
});

function image(pos, measureName, alt) {
  return container(pos, {
    visualType: "image",
    objects: {
      image: [props({ sourceType: str("imageUrl"), sourceUrl: measure(measureName) })],
      imageScaling: [props({ imageScalingType: str("Fit") })],
    },
    visualContainerObjects: bareContainer({ general: [props({ altText: str(alt) })] }),
    drillFilterOtherVisuals: true,
  });
}

function textbox(pos, runs, alt) {
  return container(pos, {
    visualType: "textbox",
    objects: {
      general: [props({
        paragraphs: [{
          textRuns: runs.map((r) => ({
            value: r.text,
            textStyle: { fontFamily: "Verdana", fontSize: `${r.size}px`, color: r.color || C.inkHex, ...(r.bold ? { fontWeight: "bold" } : {}) },
          })),
          horizontalAlignment: "left",
        }],
      })],
    },
    visualContainerObjects: bareContainer(alt ? { general: [props({ altText: str(alt) })] } : {}),
  });
}

// Painted HyperCard button: 3px ink outline, rounded corners, hard one-bit shadow, inverts when pressed.
function button(pos, label, link, variant = "plain") {
  const current = variant === "current" || variant === "currentIndex";
  const small = variant === "index" || variant === "currentIndex";
  const base = variant === "go" ? C.yellowHex : current ? C.inkHex : C.paperHex;
  const baseText = current ? C.paperHex : C.inkHex;
  const states = { default: [base, baseText], hover: [current ? C.inkHex : C.paperHex, current ? C.paperHex : C.inkHex], selected: [C.inkHex, C.paperHex] };
  // actionButton needs a static base entry plus the id-selector entries, or overrides are silently dropped.
  const perState = (fn) => {
    const entries = Object.entries(states).map(([id, [bg, fg]]) => props(fn(bg, fg, id), id));
    return [{ properties: entries[0].properties }, ...entries];
  };
  const dual = (p) => [props(p), props(p, "default")];
  const visualLink = link.type === "Back"
    ? [props({ show: bool(true), type: str("Back") })]
    : [props({ show: bool(true), type: str("PageNavigation"), navigationSection: str(link.page) })];
  return container(pos, {
    visualType: "actionButton",
    objects: {
      icon: dual({ shapeType: str("blank") }),
      text: perState((bg, fg) => ({
        show: bool(true), text: str(label), fontColor: color(fg), fontFamily: lit(FONT), fontSize: num(small ? 13 : 16),
        bold: bool(true), horizontalAlignment: str("center"), verticalAlignment: str("middle"),
      })),
      fill: perState((bg) => ({ show: bool(true), fillColor: color(bg), transparency: num(0) })),
      outline: perState((bg, fg, id) => ({ show: bool(true), lineColor: color(C.inkHex), transparency: num(0), weight: num(id === "hover" ? 4 : 3) })),
      // Painted buttons are rounded; the index mini cards stay square because they are cards.
      shape: small
        ? dual({ tileShape: str("rectangle") })
        : dual({ tileShape: str("rectangleRounded"), roundEdge: int(12), rectangleRoundedCurve: int(12) }),
      shadow: dual({ show: bool(true), color: color(C.inkHex), transparency: num(0), shadowBlur: num(0), shadowPositionPreset: str("bottomRight"), shadowDistance: num(4) }),
    },
    visualContainerObjects: bareContainer({ visualLink }),
    drillFilterOtherVisuals: true,
  });
}

// Painted button drawn as a static SVG (true rounded corners, hard one-bit shadow), with an invisible
// action button on top that owns the click and darkens slightly on hover and press.
function paintedButton(pos, label, link, variant = "plain") {
  const w = pos.w, h = pos.h;
  const fill = variant === "go" ? C.yellow : C.paper;
  const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' font-family='Verdana,Geneva,sans-serif'>` +
    `<rect x='4.5' y='4.5' width='${w - 6}' height='${h - 6}' rx='12' fill='${C.ink}'/>` +
    `<rect x='1.5' y='1.5' width='${w - 6}' height='${h - 6}' rx='12' fill='${fill}' stroke='${C.ink}' stroke-width='3'/>` +
    `<text x='${(w - 6) / 2 + 1.5}' y='${(h - 6) / 2 + 8}' text-anchor='middle' font-size='17' font-weight='bold' fill='${C.ink}'>${label}</text></svg>`;
  const img = container({ ...pos, z: pos.z }, {
    visualType: "image",
    objects: {
      image: [props({ sourceType: str("imageUrl"), sourceUrl: str(svg) })],
      imageScaling: [props({ imageScalingType: str("Fit") })],
    },
    visualContainerObjects: bareContainer({ general: [props({ altText: str(label) })] }),
  });
  const states = { default: 100, hover: 88, selected: 70 };
  const perState = (fn) => {
    const entries = Object.entries(states).map(([id, t]) => props(fn(t, id), id));
    return [{ properties: entries[0].properties }, ...entries];
  };
  const dual = (p) => [props(p), props(p, "default")];
  const visualLink = link.type === "Back"
    ? [props({ show: bool(true), type: str("Back") })]
    : [props({ show: bool(true), type: str("PageNavigation"), navigationSection: str(link.page) })];
  const hit = container({ ...pos, z: pos.z + 1 }, {
    visualType: "actionButton",
    objects: {
      icon: dual({ shapeType: str("blank") }),
      text: perState(() => ({ show: bool(false) })),
      fill: perState((t) => ({ show: bool(true), fillColor: color(C.inkHex), transparency: num(t) })),
      outline: perState(() => ({ show: bool(false) })),
      shadow: dual({ show: bool(false) }),
      shape: [props({ tileShape: str("rectangle") })],
    },
    visualContainerObjects: bareContainer({ visualLink, general: [props({ altText: str(label) })] }),
    drillFilterOtherVisuals: true,
  });
  return [img, hit];
}

// Measure text in a card with no label: used for the live VALUATION finding.
function textCard(pos, measureName, size) {
  return container(pos, {
    visualType: "cardVisual",
    query: { queryState: { Data: { projections: [{ field: measure(measureName).expr, queryRef: `_Measures.${measureName}`, nativeQueryRef: measureName }] } } },
    objects: {
      value: [props({ fontFamily: lit(FONT), fontSize: num(size), bold: bool(true), fontColor: color(C.inkHex), horizontalAlignment: str("left"), textWrap: bool(true) }, "default")],
      label: [props({ show: bool(false) }, "default")],
      outline: [props({ show: bool(false) }, "default")],
      accentBar: [props({ show: bool(false) }, "default")],
      fillCustom: [props({ show: bool(false) }, "default")],
      layout: [props({ topOuterMargin: int(0), bottomOuterMargin: int(0), leftOuterMargin: int(0), rightOuterMargin: int(0), paddingUniform: int(0) }, "default")],
      cardCalloutArea: [props({ paddingUniform: int(0) })],
    },
    visualContainerObjects: bareContainer(),
  });
}

// Button slicer. "keys" = visible one-bit keycaps; "overlay" = invisible tiles laid over an SVG strip.
function buttonSlicer(pos, entity, column, columns, variant) {
  const overlay = variant === "overlay";
  const tile = (id, bg, fg) => props({ show: bool(!overlay), fillColor: color(bg), transparency: num(overlay ? 100 : 0) }, id);
  return container(pos, {
    visualType: "advancedSlicerVisual",
    query: { queryState: { Values: { projections: [{ field: { Column: { Expression: { SourceRef: { Entity: entity } }, Property: column } }, queryRef: `${entity}.${column}`, nativeQueryRef: column, active: true }] } } },
    objects: {
      layout: [props({ style: str("Cards"), rowCount: int(1), columnCount: int(columns), autoGrid: bool(false), cellPadding: int(overlay ? 6 : 12), leftOuterMargin: int(0), rightOuterMargin: int(0), topOuterMargin: int(0), bottomOuterMargin: int(0), backgroundShow: bool(false) })],
      selection: [props({ singleSelect: bool(true), strictSingleSelect: bool(false), selectAllCheckboxEnabled: bool(false) })],
      value: [props({ show: bool(false) })],
      label: overlay
        ? [props({ show: bool(false) }, "default")]
        : ["default", "hover", "press", "selected"].map((id) => props({
            show: bool(true), fontFamily: lit(FONT), fontSize: num(16), bold: bool(true),
            fontColor: color(id === "selected" || id === "press" ? C.paperHex : C.inkHex), horizontalAlignment: str("center"),
          }, id)),
      fillCustom: overlay
        ? [props({ show: bool(false), transparency: num(100) })]
        : [props({ show: bool(true), fillColor: color(C.paperHex), transparency: num(0) })],
      outline: overlay
        ? ["default", "hover", "press", "selected"].map((id) => props({ show: bool(id === "hover"), lineColor: color(C.inkHex), weight: num(2), transparency: num(0) }, id))
        : ["default", "hover", "press", "selected"].map((id) => props({ show: bool(true), lineColor: color(C.inkHex), weight: num(id === "hover" ? 4 : 3), transparency: num(0) }, id)),
      shapeCustomRectangle: [props({ tileShape: str("rectangleRounded"), rectangleRoundedCurve: int(overlay ? 0 : 12) })],
    },
    visualContainerObjects: bareContainer(),
    drillFilterOtherVisuals: true,
  });
}

const page = (id, displayName) => ({
  $schema: PAGE_SCHEMA,
  name: id,
  displayName,
  displayOption: "FitToPage",
  height: 1080,
  width: 1920,
  objects: {
    background: [props({ color: color(C.paperHex), transparency: num(0) })],
    outspace: [props({ color: color("#5E5E5A"), transparency: num(0) })],
  },
});

module.exports = { newId, image, textbox, button, paintedButton, textCard, buttonSlicer, page, props, str, num, bool, color };
