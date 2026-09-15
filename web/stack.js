// DEERE // CYCLEBOOK on the web: draws the Power BI report's exported cards on the desk and runs their
// controls (card buttons, the stack index, and the synced scenario, sales, margin and P/E strips).
(() => {
  const root = document.documentElement;
  const stage = document.querySelector("[data-stage]");
  const canvas = document.querySelector("[data-canvas]");
  const message = document.querySelector("[data-message]");
  const live = document.querySelector("[data-live]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const PX_PER_PT = 4 / 3;
  const CARD_LEFT = 216; // the card's left edge on the canvas; the stack index sits on the desk left of it

  // The canvas scales to the desk width, and on wider screens to the window height too, so a whole card fits.
  function fit() {
    const narrow = innerWidth < 760;
    const gutter = narrow ? 16 : 24;
    const width = root.clientWidth - 2 * gutter;
    const scale = narrow ? width / 1920 : Math.min(width / 1920, (innerHeight - 2 * gutter) / 1080, 1.5);
    root.style.setProperty("--s", scale.toFixed(4));
  }
  fit();
  addEventListener("resize", fit);

  let manifest = null;
  let pageIndex = -1;
  let layer = null;
  let queue = Promise.resolve();
  const state = {};
  const bundles = new Map();
  const drawn = new Map();

  const el = (tag, className, attrs = {}) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };
  const place = (node, [x, y, w, h]) => Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  const reading = (a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0];

  function fail(error) {
    console.error(error);
    stage.removeAttribute("aria-busy");
    message.hidden = false;
    message.firstElementChild.textContent = location.protocol === "file:"
      ? "The report data didn't load: browsers block data files on pages opened from disk. Serve the folder instead with node tools/web/serve.js."
      : "The report data didn't load. Refresh the page to try again.";
  }

  function load(name) {
    if (!bundles.has(name)) {
      bundles.set(name, fetch(`data/${manifest.measures[name].file}`).then((r) => {
        if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
        return r.json();
      }));
    }
    return bundles.get(name);
  }

  // A render is a list of SVG element ids into the measure's dictionary, one list per control state.
  async function svgFor(name) {
    const bundle = await load(name);
    const state_ = bundle.controls.map((c) => state[c]).join(".");
    const key = `${name}|${state_}`;
    if (!drawn.has(key)) {
      const parts = bundle.seqs[bundle.states[state_]];
      if (!parts) throw new Error(`${name}: no export for state ${state_}`);
      drawn.set(key, parts.map((i) => bundle.dict[i]).join(""));
    }
    return { svg: drawn.get(key), key };
  }

  // Headers and findings are sentences drawn as SVG, so their alt text is the sentences themselves.
  const decoder = document.createElement("textarea");
  const spoken = (svg, joiner) => [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
    .map((m) => { decoder.innerHTML = m[1].replace(/<[^>]+>/g, "").replace(/%23/g, "#").replace(/%25/g, "%"); return decoder.value.trim(); })
    .filter(Boolean)
    .join(joiner);

  async function paint(img, page) {
    const { svg, key } = await svgFor(img.dataset.measure);
    if (img.dataset.key === key) return;
    img.dataset.key = key;
    img.src = svg;
    if (/ Header /.test(img.dataset.measure)) img.alt = `${page.name}. ${spoken(svg, ". ")}`;
    else if (/ Finding$/.test(img.dataset.measure)) img.alt = spoken(svg, " ");
  }

  function button(v, page) {
    const node = el("button", "v btn", { type: "button", "data-box": v.box.join(",") });
    place(node, v.box);
    const { rest, hover, press } = v.states;
    const vars = {
      "--fill": rest.fill || "transparent",
      "--fill-hover": hover.fill || "transparent",
      "--fill-press": press.fill || "transparent",
      "--fg": rest.color,
      "--fg-hover": hover.color,
      "--fg-press": press.color,
      "--ol": `${rest.outline}px`,
      "--ol-hover": `${hover.outline}px`,
      "--ul-hover": hover.underline ? "underline" : "none",
      "--lift": v.lift ? `${v.lift}px ${v.lift}px 0 0 var(--ink)` : "0 0 0 0 transparent",
      "--fs": `${(v.fontPt * PX_PER_PT).toFixed(2)}px`,
    };
    for (const [k, value] of Object.entries(vars)) node.style.setProperty(k, value);
    const label = el("span");
    label.textContent = v.label;
    node.append(label);
    const target = manifest.pages.findIndex((p) => p.id === v.target);
    if (manifest.pages[target] === page) node.setAttribute("aria-current", "page");
    node.addEventListener("click", () => go(target));
    return node;
  }

  function slicer(v) {
    const control = manifest.controls.find((c) => c.key === v.control);
    const group = el("div", "v slicer", { role: "group", "aria-label": control.name });
    place(group, v.box);
    group.style.gridTemplateColumns = `repeat(${control.values.length}, 1fr)`;
    control.values.forEach((value, i) => {
      const cell = el("button", "cell", {
        type: "button", "aria-label": control.labels[i], "aria-pressed": String(state[control.key] === i),
        "data-control": control.key, "data-i": String(i),
      });
      cell.addEventListener("click", () => choose(control.key, i));
      group.append(cell);
    });
    return group;
  }

  async function build(page) {
    const next = el("div", "card-layer");
    for (const v of page.visuals) {
      if (v.type === "image") {
        const img = el("img", "v", { alt: v.alt, draggable: "false" });
        place(img, v.box);
        if (v.measure) img.dataset.measure = v.measure;
        else img.src = v.src;
        next.append(img);
      } else if (v.type === "text") {
        const box = el("div", "v text");
        place(box, v.box);
        for (const p of v.paragraphs) {
          const para = el("p");
          para.style.textAlign = p.align;
          for (const run of p.runs) {
            const span = el("span");
            span.textContent = run.text;
            Object.assign(span.style, { fontSize: run.style.fontSize || "", fontWeight: run.style.fontWeight || "", color: run.style.color || "" });
            para.append(span);
          }
          box.append(para);
        }
        next.append(box);
      }
    }
    // Controls sit above every painted surface, in reading order: the stack index, the strips, then the card buttons.
    const buttons = page.visuals.filter((v) => v.type === "button");
    for (const v of buttons.filter((b) => b.box[0] < CARD_LEFT).sort(reading)) next.append(button(v, page));
    for (const v of page.visuals.filter((x) => x.type === "slicer").sort(reading)) next.append(slicer(v));
    for (const v of buttons.filter((b) => b.box[0] >= CARD_LEFT).sort(reading)) next.append(button(v, page));
    await Promise.all([...next.querySelectorAll("img[data-measure]")].map((img) => paint(img, page)));
    await Promise.all([...next.querySelectorAll("img")].map((img) => (img.decode ? img.decode().catch(() => {}) : null)));
    return next;
  }

  const syncCells = () => layer?.querySelectorAll(".cell").forEach((cell) => {
    cell.setAttribute("aria-pressed", String(state[cell.dataset.control] === +cell.dataset.i));
  });
  const repaint = () => Promise.all([...layer.querySelectorAll("img[data-measure]")].map((img) => paint(img, manifest.pages[pageIndex])));

  function choose(key, i) {
    if (state[key] === i) return;
    state[key] = i;
    syncCells();
    writeHash(false);
    queue = queue.then(repaint).catch(fail);
  }

  function go(i, options) {
    queue = queue.then(() => show(i, options)).catch(fail);
    return queue;
  }

  // Changing cards wipes the new card in from the side it comes from, in eight hard steps, as HyperCard did.
  async function show(i, { push = true, animate = true } = {}) {
    const target = Math.max(0, Math.min(manifest.pages.length - 1, i));
    if (target === pageIndex) return;
    const page = manifest.pages[target];
    const old = layer;
    const focused = old?.contains(document.activeElement) ? document.activeElement : null;
    const next = await build(page);
    const forward = target > pageIndex;
    pageIndex = target;
    canvas.append(next);
    layer = next;
    stage.removeAttribute("aria-busy");
    message.hidden = true;
    document.title = `${page.name} · DEERE // CYCLEBOOK`;
    live.textContent = `${page.name} card`;
    writeHash(push);
    if (focused) (next.querySelector(`.btn[data-box="${focused.dataset.box}"]`) || next.querySelector('.btn[aria-current="page"]'))?.focus({ preventScroll: true });
    if (!old) return;
    if (animate && !reducedMotion.matches && document.visibilityState === "visible") {
      const wipe = next.animate(
        [{ clipPath: forward ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 240, easing: "steps(8, end)" },
      );
      // A tab that stops drawing mid-wipe never finishes the animation; don't let that hold up the next click.
      await Promise.race([wipe.finished, new Promise((resolve) => setTimeout(resolve, 400))]);
      wipe.cancel();
    }
    old.remove();
  }

  function writeHash(push) {
    const page = manifest.pages[pageIndex];
    const params = manifest.controls
      .filter((c) => state[c.key] !== c.values.indexOf(c.start))
      .map((c) => `${c.param}=${encodeURIComponent(c.values[state[c.key]])}`);
    const hash = `#${[page.slug, ...params].join("&")}`;
    if (location.hash !== hash) history[push ? "pushState" : "replaceState"](null, "", hash);
  }

  function readHash() {
    const [slug = "", ...params] = location.hash.slice(1).split("&");
    for (const c of manifest.controls) state[c.key] = c.values.indexOf(c.start);
    for (const param of params) {
      const [name, value = ""] = param.split("=");
      const control = manifest.controls.find((c) => c.param === name);
      const at = control ? control.values.indexOf(decodeURIComponent(value)) : -1;
      if (at >= 0) state[control.key] = at;
    }
    return Math.max(0, manifest.pages.findIndex((p) => p.slug === decodeURIComponent(slug)));
  }

  addEventListener("popstate", () => {
    if (!manifest) return;
    const target = readHash();
    syncCells();
    if (target === pageIndex) queue = queue.then(repaint).catch(fail);
    else go(target, { push: false });
  });

  addEventListener("keydown", (event) => {
    if (!manifest || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowRight") go(pageIndex + 1);
    else if (event.key === "ArrowLeft") go(pageIndex - 1);
  });

  fetch("data/manifest.json")
    .then((r) => {
      if (!r.ok) throw new Error(`manifest: HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      manifest = data;
      return go(readHash(), { push: false, animate: false });
    })
    .catch(fail);
})();
