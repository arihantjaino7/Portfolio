/** Original procedural pixel artwork. No third-party game textures or sprites. */
export const WORLD = { width: 960, height: 640 };
export type LandmarkId =
  "about" | "projects" | "skills" | "achievements" | "contact";
export const landmarks: {
  id: LandmarkId;
  x: number;
  y: number;
  name: string;
  action: string;
}[] = [
  { id: "about", x: 386, y: 385, name: "The campsite", action: "Meet Arihant" },
  {
    id: "projects",
    x: 651,
    y: 345,
    name: "Project vault",
    action: "Open project chest",
  },
  {
    id: "skills",
    x: 663,
    y: 225,
    name: "The workshop",
    action: "Discover my skills",
  },
  {
    id: "achievements",
    x: 459,
    y: 240,
    name: "The monument",
    action: "View milestones",
  },
  {
    id: "contact",
    x: 506,
    y: 494,
    name: "The post office",
    action: "Get in touch",
  },
];
export function noise(x: number, y: number, seed = 0) {
  const a = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return a - Math.floor(a);
}
const routes = [
  [386, 405, 554, 407],
  [554, 407, 651, 368],
  [651, 368, 663, 244],
  [554, 407, 506, 511],
  [554, 407, 459, 260],
  [459, 260, 663, 244],
];
function segmentDistance(x: number, y: number, s: number[]) {
  const [ax, ay, bx, by] = s;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) /
        ((bx - ax) ** 2 + (by - ay) ** 2),
    ),
  );
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
}
export function pathDistance(x: number, y: number) {
  return Math.min(...routes.map((s) => segmentDistance(x, y, s)));
}
export function riverEdge(y: number) {
  return 794 + Math.round(Math.sin(y / 85) * 31 + Math.cos(y / 36) * 8);
}
export type Tree = { x: number; y: number; size: number; kind: number };
export const trees: Tree[] = [];
for (let y = 70; y < 650; y += 43) {
  for (let x = 30; x < 940; x += 42) {
    const px = x + noise(x, y) * 29,
      py = y + noise(y, x) * 25;
    const isForest =
      px < 316 ||
      py < 165 ||
      (px > 723 && px < riverEdge(py) - 8) ||
      py > 552 ||
      (px < 398 && py > 455);
    if (
      isForest &&
      pathDistance(px, py) > 38 &&
      !(px > riverEdge(py) - 8 && px < riverEdge(py) + 72) &&
      noise(x, y, 2) > 0.12
    )
      trees.push({
        x: px,
        y: py,
        size: 0.8 + noise(x, y, 3) * 0.5,
        kind: noise(y, x, 7) > 0.74 ? 1 : 0,
      });
  }
}
export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function shadow(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h = 9,
) {
  rect(c, x - w / 2 + 5, y - 2, w, h, "#112e244a");
}
export function createTerrain() {
  const canvas = document.createElement("canvas");
  canvas.width = WORLD.width;
  canvas.height = WORLD.height;
  const c = canvas.getContext("2d")!;
  for (let y = 0; y < 640; y += 8) {
    for (let x = 0; x < 960; x += 8) {
      const n = noise(x, y);
      const pd = pathDistance(x, y);
      let col =
        n > 0.8
          ? "#50653a"
          : n > 0.5
            ? "#496038"
            : n > 0.25
              ? "#435b33"
              : "#3d552e";
      if (pd < 19) col = n > 0.7 ? "#b3a16a" : n > 0.35 ? "#a39460" : "#a99b66";
      else if (pd < 25) col = n > 0.6 ? "#93925a" : "#6d7c43";
      if (x > riverEdge(y) - 9) col = "#829271";
      if (x > riverEdge(y))
        col = n > 0.65 ? "#396b68" : n > 0.25 ? "#32635e" : "#2b5d59";
      if (x > riverEdge(y) + 64) col = "#526e40";
      rect(c, x, y, 8, 8, col);
      if (n > 0.75 && pd > 26 && x < riverEdge(y) - 12) {
        rect(c, x + 3, y + 2, 1, 3, "#87905455");
        rect(c, x + 1, y + 4, 4, 1, "#8b985955");
      }
      if (n > 0.7 && pd < 18) rect(c, x + 1, y + 2, 3, 1, "#c6b57c");
    }
  }
  // Low stone terraces frame the grove and give every landmark a place.
  const terrace = (x: number, y: number, w: number, h: number) => {
    rect(c, x, y, w, h, "#3a493a");
    rect(c, x, y, w, h - 6, "#768067");
    for (let a = x; a < x + w; a += 12) {
      rect(c, a, y + h - 5, 10, 4, "#53604c");
    }
    for (let a = x + 3; a < x + w; a += 17) rect(c, a, y + 3, 7, 2, "#a0a283");
  };
  terrace(605, 306, 93, 66);
  terrace(619, 192, 96, 58);
  terrace(428, 209, 63, 52);
  // Bridge, retaining blocks, and a small crop patch.
  for (let y = 403; y < 447; y += 7) {
    rect(c, riverEdge(y) - 17, y, 102, 6, "#977745");
    rect(c, riverEdge(y) - 17, y, 102, 1, "#c2a166");
  }
  for (const x of [riverEdge(415) - 17, riverEdge(415) + 77]) {
    rect(c, x, 397, 4, 56, "#72502e");
    rect(c, x - 2, 395, 8, 4, "#c8a56b");
  }
  rect(c, 685, 267, 34, 26, "#5f4e30");
  for (let y = 270; y < 292; y += 7)
    for (let x = 689; x < 718; x += 7) {
      rect(c, x, y, 4, 2, "#456a36");
      rect(c, x + 1, y - 4, 2, 6, "#93ad55");
      rect(c, x, y - 2, 5, 1, "#b4b95f");
    }
  // Scattered stones, wildflowers and mushrooms; deterministic across reloads.
  for (let i = 0; i < 410; i++) {
    const x = noise(i, 3) * 960,
      y = noise(i, 8) * 640;
    if (pathDistance(x, y) < 26 || x > riverEdge(y) - 10) continue;
    const n = noise(i, 10);
    if (n > 0.9) {
      rect(c, x, y, 5, 3, "#697b60");
      rect(c, x, y, 3, 1, "#94a084");
    } else if (n > 0.73) {
      rect(c, x + 1, y, 1, 4, "#456437");
      rect(c, x, y - 1, 3, 2, i % 3 ? "#d8c875" : "#e3a48c");
      rect(c, x + 1, y - 1, 1, 1, "#ede2a3");
    } else if (n > 0.68) {
      rect(c, x + 1, y, 2, 3, "#d5c49a");
      rect(c, x - 1, y - 2, 6, 3, "#b47558");
      rect(c, x, y - 2, 1, 1, "#f0dab0");
    }
  }
  // Stepped cliff at the far northern edge.
  for (let x = 0; x < 960; x += 24) {
    const y = 34 + Math.floor(noise(x, 33) * 3) * 8;
    rect(c, x, 0, 24, y + 18, "#233e30");
    rect(c, x, y, 24, 10, "#59684b");
    rect(c, x, y + 10, 24, 8, "#3e533e");
    rect(c, x + 2, y, 19, 2, "#78845b");
  }
  return canvas;
}
function drawTree(c: CanvasRenderingContext2D, t: Tree) {
  c.save();
  c.translate(Math.round(t.x), Math.round(t.y));
  c.scale(t.size, t.size);
  shadow(c, 1, 0, 40, 9);
  rect(c, -4, -25, 9, 30, "#62462e");
  rect(c, -2, -21, 3, 26, "#92704a");
  rect(c, -7, -2, 15, 3, "#4c462b");
  if (t.kind) {
    rect(c, -21, -55, 42, 28, "#213e2d");
    rect(c, -29, -49, 57, 19, "#2b5033");
    rect(c, -22, -65, 40, 30, "#365d38");
    rect(c, -13, -72, 24, 27, "#426a3d");
    rect(c, -22, -59, 15, 10, "#507647");
    rect(c, 4, -59, 16, 11, "#3b6138");
    rect(c, -10, -39, 26, 8, "#2a4d2d");
    rect(c, -18, -65, 10, 4, "#5c7d48");
  } else {
    rect(c, -25, -25, 50, 13, "#244630");
    rect(c, -20, -36, 41, 18, "#2d5034");
    rect(c, -16, -47, 33, 20, "#365c37");
    rect(c, -12, -58, 25, 22, "#3e673c");
    rect(c, -7, -68, 15, 22, "#4c7341");
    rect(c, -3, -76, 7, 19, "#537d46");
    rect(c, -25, -25, 18, 3, "#41673c");
    rect(c, -19, -36, 16, 3, "#4e7541");
    rect(c, -15, -47, 12, 3, "#60874b");
    rect(c, -11, -58, 8, 3, "#6a8b4d");
    rect(c, 6, -24, 16, 9, "#1e3c2b");
    rect(c, 5, -45, 10, 8, "#2b4b30");
  }
  c.restore();
}
function post(c: CanvasRenderingContext2D, x: number, y: number) {
  shadow(c, x, y, 12, 5);
  rect(c, x - 2, y - 28, 4, 29, "#705334");
  rect(c, x - 4, y - 32, 8, 3, "#402f21");
  rect(c, x - 4, y - 29, 8, 9, "#dca95b");
  rect(c, x - 2, y - 28, 4, 7, "#ffe3a1");
  rect(c, x - 5, y - 33, 10, 2, "#ad864b");
  rect(c, x - 4, y - 20, 8, 2, "#534329");
}
function sign(c: CanvasRenderingContext2D, x: number, y: number, text: string) {
  rect(c, x - 2, y, 4, 13, "#6f5233");
  const w = Math.max(42, text.length * 4.6 + 10);
  rect(c, x - w / 2, y - 13, w, 14, "#3b3d28");
  rect(c, x - w / 2 + 1, y - 12, w - 2, 12, "#806e43");
  rect(c, x - w / 2 + 2, y - 11, w - 4, 1, "#c0a365");
  c.font = '8px "Pixelify Sans"';
  c.textAlign = "center";
  c.fillStyle = "#f1dfab";
  c.fillText(text, Math.round(x), Math.round(y - 3));
}
function chest(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  open: number,
) {
  shadow(c, x, y, 45, 7);
  rect(c, x - 22, y - 23, 44, 25, "#573f28");
  rect(c, x - 20, y - 20, 40, 20, "#b77b35");
  rect(c, x - 18, y - 16, 36, 14, "#c58c40");
  for (let i = -15; i < 20; i += 9) rect(c, x + i, y - 15, 1, 14, "#9e6b31");
  rect(c, x - 19, y - 21, 4, 22, "#edbd64");
  rect(c, x + 15, y - 21, 4, 22, "#e7ad4c");
  rect(c, x - 22, y - 7, 44, 3, "#8a5927");
  if (open > 0.1) {
    rect(c, x - 22, y - 25 - 17 * open, 44, 20 * open, "#835b2f");
    rect(c, x - 19, y - 23 - 17 * open, 38, 14 * open, "#352d22");
    rect(c, x - 22, y - 26 - 17 * open, 44, 3, "#efc36d");
    rect(c, x - 20, y - 23, 40, 7, "#302a1e");
    rect(c, x - 10, y - 22, 22, 2, "#edc778");
  } else {
    rect(c, x - 23, y - 30, 46, 14, "#d39b48");
    rect(c, x - 21, y - 32, 42, 4, "#edc16a");
    rect(c, x - 23, y - 19, 46, 4, "#85572b");
    rect(c, x - 17, y - 31, 4, 15, "#f3ce7d");
    rect(c, x + 13, y - 31, 4, 15, "#edc16a");
  }
  rect(c, x - 3, y - 19, 7, 11, "#513b26");
  rect(c, x - 2, y - 18, 5, 8, "#ffe3a0");
  rect(c, x, y - 16, 1, 4, "#966833");
}
function workshop(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  reduce: boolean,
) {
  shadow(c, x, y, 96, 13);
  rect(c, x - 40, y - 65, 80, 65, "#725338");
  for (let yy = -62; yy < 0; yy += 8) {
    rect(c, x - 39, y + yy, 78, 2, "#97704a");
    rect(c, x - 39, y + yy + 2, 2, 5, "#bf9460");
  }
  rect(c, x - 43, y - 75, 86, 17, "#405846");
  rect(c, x - 36, y - 87, 72, 16, "#4d6850");
  rect(c, x - 26, y - 98, 52, 16, "#617b55");
  rect(c, x - 16, y - 107, 32, 14, "#6e865a");
  rect(c, x - 8, y - 113, 16, 10, "#87956a");
  for (let i = 0; i < 5; i++) {
    rect(c, x - 40 + i * 18, y - 70, 16, 2, "#8c9c6a");
  }
  rect(c, x + 23, y - 108, 12, 40, "#697265");
  rect(c, x + 20, y - 110, 18, 5, "#929a83");
  rect(c, x - 13, y - 42, 26, 42, "#372d22");
  rect(c, x - 10, y - 40, 20, 39, "#ad8951");
  rect(c, x - 8, y - 36, 7, 31, "#896239");
  rect(c, x + 6, y - 22, 2, 2, "#e7c97a");
  for (const xx of [-29, 20]) {
    rect(c, x + xx - 2, y - 47, 16, 21, "#402e21");
    rect(c, x + xx, y - 45, 12, 16, "#f0bb67");
    rect(c, x + xx + 5, y - 45, 2, 16, "#87623a");
    rect(c, x + xx, y - 38, 12, 2, "#87623a");
    rect(c, x + xx - 3, y - 27, 18, 3, "#b48b50");
  }
  rect(c, x - 18, y, 36, 5, "#9c926d");
  rect(c, x - 22, y + 5, 44, 4, "#6b7559");
  // Workbench and anvil.
  rect(c, x + 48, y + 4, 25, 13, "#7b582f");
  rect(c, x + 45, y - 2, 31, 9, "#b38b50");
  rect(c, x + 48, y + 14, 4, 8, "#503d28");
  rect(c, x + 67, y + 14, 4, 8, "#503d28");
  rect(c, x + 49, y - 9, 21, 6, "#788a82");
  rect(c, x + 53, y - 4, 12, 5, "#4b5c56");
  rect(c, x + 50, y - 11, 25, 3, "#b0b5a0");
  if (!reduce)
    for (let i = 0; i < 4; i++) {
      const a = (t * 0.012 + i * 9) % 38;
      c.globalAlpha = (1 - a / 38) * 0.18;
      rect(
        c,
        x + 26 + Math.sin(a / 6) * 6,
        y - 115 - a,
        9 + a / 5,
        6 + a / 5,
        "#eee7c2",
      );
    }
  c.globalAlpha = 1;
}
function camp(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  reduce: boolean,
) {
  shadow(c, x - 22, y - 4, 78, 10);
  rect(c, x - 57, y - 29, 68, 36, "#4e5031");
  rect(c, x - 49, y - 43, 53, 39, "#af8251");
  rect(c, x - 40, y - 57, 35, 46, "#cea16a");
  rect(c, x - 31, y - 67, 16, 39, "#e3bd84");
  rect(c, x - 25, y - 59, 6, 64, "#9b754a");
  rect(c, x - 30, y - 44, 16, 49, "#5d5134");
  rect(c, x - 35, y - 18, 26, 23, "#423e2c");
  rect(c, x - 59, y + 4, 73, 3, "#c7ae78");
  rect(c, x + 18, y - 8, 29, 5, "#5b3c25");
  rect(c, x + 21, y - 4, 23, 4, "#93603a");
  rect(c, x + 20, y - 14, 26, 5, "#61462a");
  rect(c, x + 27, y - 19, 12, 9, "#bd793c");
  const bob = reduce ? 0 : Math.floor(Math.sin(t / 150) * 2);
  rect(c, x + 24, y - 25 + bob, 19, 13, "#de9c4f");
  rect(c, x + 29, y - 34 + bob, 10, 21, "#efc574");
  rect(c, x + 33, y - 38 - bob, 4, 20, "#ffe4a5");
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    rect(
      c,
      x + 32 + Math.cos(a) * 22,
      y + Math.sin(a) * 9 - 2,
      6,
      4,
      "#878b6a",
    );
  }
  rect(c, x - 55, y + 26, 30, 8, "#705536");
  rect(c, x - 53, y + 23, 28, 5, "#a0804d");
  rect(c, x - 51, y + 32, 4, 6, "#473b28");
  rect(c, x - 31, y + 32, 4, 6, "#473b28");
}
function monument(c: CanvasRenderingContext2D, x: number, y: number) {
  shadow(c, x, y, 37);
  rect(c, x - 19, y - 4, 38, 7, "#66785f");
  rect(c, x - 14, y - 11, 28, 7, "#9ca68b");
  rect(c, x - 10, y - 30, 20, 20, "#697e6c");
  rect(c, x - 8, y - 29, 16, 18, "#a1af94");
  rect(c, x - 5, y - 45, 10, 14, "#f0c56d");
  rect(c, x - 11, y - 58, 22, 16, "#dfab50");
  rect(c, x - 15, y - 58, 5, 12, "#e4b75e");
  rect(c, x + 10, y - 58, 5, 12, "#bd8e3e");
  rect(c, x - 4, y - 60, 11, 15, "#ffe195");
  rect(c, x - 8, y - 31, 16, 4, "#c49545");
  rect(c, x - 4, y - 24, 8, 6, "#3d5d4a");
}
function mailbox(c: CanvasRenderingContext2D, x: number, y: number) {
  shadow(c, x, y, 28);
  rect(c, x - 3, y - 20, 6, 23, "#a17c4e");
  rect(c, x - 6, y + 1, 12, 3, "#705438");
  rect(c, x - 15, y - 41, 30, 22, "#3f615a");
  rect(c, x - 11, y - 45, 23, 5, "#91a38b");
  rect(c, x - 15, y - 40, 29, 3, "#779386");
  rect(c, x - 12, y - 36, 19, 14, "#62847b");
  rect(c, x - 7, y - 33, 12, 1, "#b9c8a3");
  rect(c, x - 5, y - 31, 8, 1, "#b9c8a3");
  rect(c, x + 14, y - 46, 2, 19, "#d9b569");
  rect(c, x + 16, y - 46, 8, 6, "#e4b967");
}
function sheep(c: CanvasRenderingContext2D, x: number, y: number) {
  shadow(c, x, y, 22, 4);
  rect(c, x - 9, y - 8, 18, 10, "#d7d4ad");
  rect(c, x - 7, y - 12, 14, 13, "#e9e0ba");
  rect(c, x - 11, y - 7, 5, 5, "#bcb99a");
  rect(c, x + 7, y - 7, 7, 7, "#78715b");
  rect(c, x + 11, y - 6, 1, 1, "#27382b");
  rect(c, x - 6, y + 2, 3, 4, "#645741");
  rect(c, x + 4, y + 2, 3, 4, "#645741");
}
export const lamps = [
  [607, 372],
  [697, 370],
  [620, 244],
  [705, 238],
  [480, 272],
  [357, 405],
  [530, 512],
  [746, 412],
];
export function drawPlayer(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: string,
  walk: number,
  t: number,
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(1.25, 1.25);
  shadow(c, 0, 0, 15, 4);
  const step = walk ? Math.sin(t / 85) * 2 : 0;
  const bob = walk ? Math.abs(Math.sin(t / 85)) : 0;
  c.translate(0, -Math.floor(bob));
  rect(c, -5, -7, 4, 8 + step, "#263c3d");
  rect(c, 1, -7, 4, 8 - step, "#31464a");
  rect(c, -6, 1 + step, 5, 3, "#222f2b");
  rect(c, 1, 1 - step, 5, 3, "#222f2b");
  rect(c, -6, -18, 12, 12, "#548f7c");
  rect(c, -3, -16, 6, 7, "#68ab90");
  rect(c, -9, -17, 3, 8 - step, "#427463");
  rect(c, 6, -17, 3, 8 + step, "#3b6d5f");
  rect(c, -9, -10 - step, 3, 4, "#c39466");
  rect(c, 6, -10 + step, 3, 4, "#d1a572");
  rect(c, -6, -29, 12, 12, "#d2a474");
  rect(c, -7, -31, 14, 7, "#352f24");
  rect(c, -6, -25, 3, 6, "#493829");
  rect(c, 4, -26, 3, 6, "#3e3226");
  rect(c, -5, -33, 10, 3, "#40372b");
  rect(c, -7, -30, 3, 6, "#302c23");
  if (dir !== "up") {
    rect(
      c,
      -3 + (dir === "right" ? 3 : dir === "left" ? -2 : 0),
      -23,
      2,
      2,
      "#273731",
    );
    rect(
      c,
      2 + (dir === "right" ? 2 : dir === "left" ? -3 : 0),
      -23,
      2,
      2,
      "#273731",
    );
    rect(c, -1, -19, 3, 1, "#91674b");
  } else {
    rect(c, -5, -24, 10, 6, "#3a3025");
  }
  c.restore();
}
export function renderWorld(
  c: CanvasRenderingContext2D,
  terrain: HTMLCanvasElement,
  t: number,
  player: { x: number; y: number; dir: string; moving: number },
  chestOpen: number,
  reduced: boolean,
  night: boolean,
  visited: Set<string>,
  near: string | null,
) {
  c.drawImage(terrain, 0, 0);
  // River current and shallow stepping reflections.
  for (let i = 0; i < 90; i++) {
    const y = (noise(i, 43) * 640 + (reduced ? 0 : t * 0.003)) % 640,
      x = riverEdge(y) + 8 + noise(i, 78) * 45;
    rect(c, x, y, 5 + noise(i, 98) * 10, 1, i % 4 ? "#8bb6a535" : "#c2d3ae66");
  }
  // Ground details, supplies, and fences.
  for (const [x, y] of [
    [566, 301],
    [578, 307],
    [584, 300],
  ]) {
    rect(c, x, y - 9, 10, 11, "#7b5c36");
    rect(c, x - 1, y - 11, 12, 3, "#ab8850");
    rect(c, x + 3, y - 7, 2, 8, "#ccae6d");
  }
  for (let x = 344; x < 420; x += 14) {
    rect(c, x, 436, 3, 19, "#7f623b");
    rect(c, x - 1, 434, 5, 3, "#b2985c");
    if (x < 407) rect(c, x, 441, 16, 3, "#a08651");
  }
  for (let x = 607; x < 716; x += 14) {
    rect(c, x, 281, 3, 15, "#735c39");
    rect(c, x, 283, 17, 3, "#a18954");
  }
  sheep(c, 703 + (reduced ? 0 : Math.sin(t / 4000) * 5), 466);
  sheep(c, 688, 481);
  // All tall objects share one depth order, including the player.
  const objects: { y: number; draw: () => void }[] = trees.map((tree) => ({
    y: tree.y,
    draw: () => drawTree(c, tree),
  }));
  objects.push(
    { y: 385, draw: () => camp(c, 386, 385, t, reduced) },
    { y: 225, draw: () => workshop(c, 663, 225, t, reduced) },
    { y: 240, draw: () => monument(c, 459, 240) },
    { y: 345, draw: () => chest(c, 651, 345, chestOpen) },
    { y: 494, draw: () => mailbox(c, 506, 494) },
  );
  lamps.forEach(([x, y]) => objects.push({ y, draw: () => post(c, x, y) }));
  objects.push({
    y: player.y,
    draw: () => drawPlayer(c, player.x, player.y, player.dir, player.moving, t),
  });
  objects.sort((a, b) => a.y - b.y).forEach((o) => o.draw());
  sign(c, 653, 392, "PROJECTS");
  sign(c, 392, 426, "ABOUT");
  sign(c, 666, 265, "SKILLS");
  sign(c, 462, 282, "MILESTONES");
  sign(c, 509, 535, "CONTACT");
  // Warm light is spatial: little pools under real lanterns, never a UI glow.
  const lighting = night ? 0.15 : 0.035;
  rect(c, 0, 0, 960, 640, `rgba(5,24,26,${lighting})`);
  for (const [x, y] of [...lamps, [418, 379]]) {
    const radius = night ? 52 : 30;
    const g = c.createRadialGradient(x, y - 20, 1, x, y - 20, radius);
    g.addColorStop(0, night ? "#ffcb7440" : "#ffd67a19");
    g.addColorStop(1, "#ffc27300");
    c.fillStyle = g;
    c.fillRect(x - radius, y - 20 - radius, radius * 2, radius * 2);
  }
  if (!reduced) {
    for (let i = 0; i < 35; i++) {
      const x = 340 + noise(i, 91) * 430 + Math.sin(t / 2200 + i) * 4,
        y = 190 + noise(i, 27) * 330 + Math.cos(t / 2400 + i) * 7;
      const alpha = 0.2 + 0.4 * Math.max(0, Math.sin(t / 900 + i));
      rect(c, x, y, 1, 1, `rgba(248,224,142,${alpha})`);
    }
  }
  for (const l of landmarks) {
    if (visited.has(l.id)) {
      rect(c, l.x + 22, l.y - 38, 5, 5, "#bcd88b");
      rect(c, l.x + 23, l.y - 37, 3, 3, "#4f6d3b");
    }
    if (near === l.id) {
      const b = reduced ? 0 : Math.floor(Math.sin(t / 300) * 2);
      rect(c, l.x - 2, l.y - 67 + b, 5, 3, "#ffdf98");
      rect(c, l.x - 4, l.y - 70 + b, 9, 2, "#ffdf98");
    }
  }
}
export function blocked(x: number, y: number) {
  if (x < 30 || y < 130 || y > 589 || x > riverEdge(y) - 7) return true;
  if (x > 621 && x < 704 && y > 176 && y < 229) return true;
  if (x > 626 && x < 677 && y > 321 && y < 350) return true;
  if (x > 428 && x < 487 && y > 215 && y < 245) return true;
  if (x > 327 && x < 398 && y > 340 && y < 391) return true;
  return trees.some((t) => Math.hypot(t.x - x, t.y - y) < 10 * t.size);
}
