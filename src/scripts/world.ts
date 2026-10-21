import {
  WORLD,
  landmarks,
  createTerrain,
  renderWorld,
  blocked,
  type LandmarkId,
} from "../game/art";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const world = document.querySelector<HTMLElement>("#world");
const dialog = document.querySelector<HTMLDialogElement>("#portfolio-dialog");
if (canvas && world && dialog) init(canvas, world, dialog);

function init(
  canvas: HTMLCanvasElement,
  world: HTMLElement,
  dialog: HTMLDialogElement,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    document.querySelector<HTMLElement>("#loading-fallback")!.hidden = false;
    return;
  }
  const terrain = createTerrain();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const player = { x: 570, y: 403, dir: "down", moving: 0 };
  const camera = { x: 500, y: 336 };
  const visited = new Set<string>();
  const keys = new Set<string>();
  let width = 0,
    height = 0,
    zoom = 1,
    exploring = false,
    night = false,
    sound = false;
  let path: { x: number; y: number }[] = [],
    pending: LandmarkId | null = null,
    nearest: (typeof landmarks)[number] | null = null;
  let last = 0,
    lastDraw = 0,
    frame = 0,
    dirty = true,
    chestOpen = 0,
    returnFocus: HTMLElement | null = null;
  let toastTimer: ReturnType<typeof setTimeout>;
  let audio: AudioContext | null = null;
  const prompt = document.querySelector<HTMLButtonElement>("#interact")!;
  const touchInteract =
    document.querySelector<HTMLButtonElement>("#touch-interact")!;
  const title = document.querySelector<HTMLElement>("#panel-title")!;
  const panelNames: Record<string, string> = {
    projects: "Project chest",
    about: "The campsite",
    skills: "The workshop",
    achievements: "Milestones",
    contact: "The post office",
    help: "How to play",
  };
  const coord = document.querySelector<HTMLElement>("#coordinates")!;
  const mapPlayer = document.querySelector<HTMLElement>("#map-player")!;

  function resize() {
    const b = world.getBoundingClientRect();
    const mobile = b.width <= 760;
    const reframe = width === 0 || mobile !== width * 2 <= 760;
    width = Math.ceil(b.width / 2);
    height = Math.ceil(b.height / 2);
    canvas.width = width;
    canvas.height = height;
    zoom = mobile ? 0.92 : Math.max(0.85, Math.min(1.1, b.height / 790));
    ctx!.imageSmoothingEnabled = false;
    if (reframe) {
      const halfW = width / zoom / 2,
        halfH = height / zoom / 2;
      const { x, y } = cameraTarget();
      camera.x = Math.max(
        Math.min(x, WORLD.width - halfW),
        Math.min(halfW, WORLD.width / 2),
      );
      camera.y = Math.max(
        Math.min(y, WORLD.height - halfH),
        Math.min(halfH, WORLD.height / 2),
      );
    }
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(world);
  resize();

  function cameraTarget() {
    if (exploring) return { x: player.x, y: player.y - 12 };
    if (width * 2 <= 760) {
      const compact = height * 2 < 740;
      return {
        x: player.x - (compact ? 18 : 0),
        y: player.y - (compact ? 70 : 12),
      };
    }
    return { x: 500, y: 336 };
  }
  function begin() {
    if (exploring) return;
    exploring = true;
    world.classList.add("exploring");
    document.querySelector<HTMLElement>(".welcome")!.inert = true;
    dirty = true;
  }
  function toast(message: string) {
    const el = document.querySelector<HTMLElement>("#world-toast")!;
    el.textContent = message;
    el.classList.add("shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("shown"), 3200);
  }
  function chime(kind: "open" | "step" | "select" = "open") {
    if (!sound) return;
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") void audio.resume();
      const now = audio.currentTime;
      const notes =
        kind === "open"
          ? [392, 523.25, 659.25]
          : kind === "select"
            ? [523.25]
            : [130.8];
      notes.forEach((frequency, i) => {
        const o = audio!.createOscillator(),
          g = audio!.createGain();
        o.type = kind === "step" ? "triangle" : "sine";
        o.frequency.value = frequency;
        g.gain.setValueAtTime(0, now + i * 0.065);
        g.gain.linearRampToValueAtTime(
          kind === "step" ? 0.018 : 0.035,
          now + i * 0.065 + 0.008,
        );
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.065 + 0.18);
        o.connect(g);
        g.connect(audio!.destination);
        o.start(now + i * 0.065);
        o.stop(now + i * 0.065 + 0.2);
      });
    } catch {
      sound = false;
      toast("Sound isn’t available in this browser. Exploration still works.");
    }
  }
  function discover(id: LandmarkId) {
    if (visited.has(id)) return;
    visited.add(id);
    document.querySelector(`.slot-${id}`)?.classList.add("visited");
    document.querySelector("#visited-count")!.textContent =
      `${visited.size} / 5`;
    document.querySelector("#quest-title")!.textContent =
      visited.size === 5
        ? "The grove is fully explored."
        : "A little more of the story, discovered.";
    document.querySelector("#quest-copy")!.textContent =
      visited.size === 5
        ? "Thanks for stopping by. Let’s build something."
        : `${visited.size} of 5 landmarks visited. Keep following your curiosity.`;
  }
  function openPanel(id: string, teleport = true) {
    if (!(id in panelNames)) return;
    begin();
    keys.clear();
    path = [];
    pending = null;
    returnFocus = document.activeElement as HTMLElement;
    document
      .querySelectorAll<HTMLElement>("[data-panel]")
      .forEach((el) => (el.hidden = el.dataset.panel !== id));
    title.textContent = panelNames[id];
    const landmark = landmarks.find((l) => l.id === id);
    if (landmark) {
      if (teleport) {
        player.x = landmark.x;
        player.y = landmark.y + 29;
        player.dir = "up";
      }
      discover(landmark.id);
    }
    const source = document.querySelector(`.slot-${id}>svg`);
    const target = document.querySelector("#panel-icon")!;
    target.replaceChildren();
    if (source) target.append(source.cloneNode(true));
    document
      .querySelectorAll(".hotbar-slot")
      .forEach((el) =>
        el.classList.toggle("active", (el as HTMLElement).dataset.open === id),
      );
    document.querySelector("#inventory-status")!.textContent =
      id === "projects"
        ? "3 builds · Select an item to inspect"
        : "Found in the builder’s grove";
    if (!dialog.open) dialog.showModal();
    document
      .querySelector<HTMLElement>(
        id === "projects" ? ".project-slot.selected" : "#close-panel",
      )
      ?.focus();
    chime();
    dirty = true;
  }
  function closePanel() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener("close", () => {
    document
      .querySelectorAll(".hotbar-slot")
      .forEach((el) => el.classList.remove("active"));
    keys.clear();
    returnFocus?.focus({ preventScroll: true });
    dirty = true;
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        closePanel();
    }
  });
  document.querySelector("#close-panel")!.addEventListener("click", closePanel);
  document
    .querySelectorAll<HTMLButtonElement>("[data-open]")
    .forEach((button) =>
      button.addEventListener("click", () => openPanel(button.dataset.open!)),
    );
  document.querySelector("#start-exploring")!.addEventListener("click", () => {
    begin();
    canvas.focus({ preventScroll: true });
    toast("Follow the path to the golden chest. Press E to open it.");
  });

  const tabs = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-project]"),
  ];
  function selectProject(tab: HTMLButtonElement) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle("selected", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.querySelector<HTMLElement>(
        `#${t.getAttribute("aria-controls")}`,
      )!.hidden = !selected;
    });
    chime("select");
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectProject(tab));
    tab.addEventListener("keydown", (e) => {
      const horizontal = innerWidth <= 760;
      let next = index;
      if (e.key === (horizontal ? "ArrowRight" : "ArrowDown"))
        next = (index + 1) % tabs.length;
      else if (e.key === (horizontal ? "ArrowLeft" : "ArrowUp"))
        next = (index + tabs.length - 1) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      selectProject(tabs[next]);
      tabs[next].focus();
    });
  });
  function updateTabOrientation() {
    document
      .querySelector("[role=tablist]")
      ?.setAttribute(
        "aria-orientation",
        innerWidth <= 760 ? "horizontal" : "vertical",
      );
  }
  window.addEventListener("resize", updateTabOrientation);
  updateTabOrientation();
  document
    .querySelector<HTMLButtonElement>("#copy-email")!
    .addEventListener("click", async (e) => {
      const button = e.currentTarget as HTMLButtonElement;
      try {
        await navigator.clipboard.writeText(button.dataset.email!);
        button.textContent = "Address copied";
        setTimeout(() => (button.textContent = "Copy address"), 2500);
      } catch {
        button.textContent = "Use the email link above";
      }
    });
  document
    .querySelector<HTMLButtonElement>("#sound-toggle")!
    .addEventListener("click", (e) => {
      sound = !sound;
      const button = e.currentTarget as HTMLButtonElement;
      button.setAttribute("aria-pressed", String(sound));
      button.setAttribute(
        "aria-label",
        sound ? "Mute sound effects" : "Enable sound effects",
      );
      if (sound) chime("select");
    });
  document
    .querySelector<HTMLButtonElement>("#time-toggle")!
    .addEventListener("click", (e) => {
      night = !night;
      const button = e.currentTarget as HTMLButtonElement;
      button.setAttribute("aria-pressed", String(night));
      button.setAttribute(
        "aria-label",
        night ? "Switch to golden hour" : "Switch to night",
      );
      document.querySelector("#biome-label")!.textContent = night
        ? "Woodland · Moonlight"
        : "Woodland · Golden hour";
      toast(
        night ? "Night falls in the builder’s grove." : "Back to golden hour.",
      );
      dirty = true;
    });

  // Breadth-first pathfinding on a small grid keeps click-to-walk clear of trees and water.
  const cell = 8,
    cols = WORLD.width / cell,
    rows = WORLD.height / cell;
  const passable = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      passable[y * cols + x] = blocked(x * cell + 4, y * cell + 4) ? 0 : 1;
  function routeTo(x: number, y: number) {
    const sx = Math.floor(player.x / cell),
      sy = Math.floor(player.y / cell),
      start = sy * cols + sx;
    let tx = Math.max(1, Math.min(cols - 2, Math.floor(x / cell))),
      ty = Math.max(1, Math.min(rows - 2, Math.floor(y / cell)));
    if (!passable[ty * cols + tx]) {
      let best = Infinity;
      for (let dy = -6; dy <= 6; dy++)
        for (let dx = -6; dx <= 6; dx++) {
          const nx = tx + dx,
            ny = ty + dy,
            dist = dx * dx + dy * dy;
          if (
            nx > 0 &&
            ny > 0 &&
            nx < cols &&
            ny < rows &&
            passable[ny * cols + nx] &&
            dist < best
          ) {
            best = dist;
            x = nx * cell + 4;
            y = ny * cell + 4;
          }
        }
      tx = Math.floor(x / cell);
      ty = Math.floor(y / cell);
    }
    const goal = ty * cols + tx,
      queue = [start],
      previous = new Int32Array(cols * rows).fill(-1);
    previous[start] = start;
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      if (p === goal) break;
      const px = p % cols,
        py = Math.floor(p / cols);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        const nx = px + dx,
          ny = py + dy,
          n = ny * cols + nx;
        if (
          nx < 1 ||
          ny < 1 ||
          nx >= cols - 1 ||
          ny >= rows - 1 ||
          previous[n] !== -1 ||
          !passable[n]
        )
          continue;
        if (
          dx &&
          dy &&
          (!passable[py * cols + nx] || !passable[ny * cols + px])
        )
          continue;
        previous[n] = p;
        queue.push(n);
      }
    }
    if (previous[goal] === -1) {
      toast("That spot is beyond the path. Try a clearing nearby.");
      return;
    }
    const result = [];
    let p = goal;
    while (p !== start) {
      result.push({
        x: (p % cols) * cell + 4,
        y: Math.floor(p / cols) * cell + 4,
      });
      p = previous[p];
    }
    path = result.reverse();
    begin();
    canvas.focus({ preventScroll: true });
    dirty = true;
  }
  document
    .querySelectorAll<HTMLButtonElement>("[data-travel]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const l = landmarks.find((l) => l.id === button.dataset.travel)!;
        pending = null;
        routeTo(l.x, l.y + 28);
        toast(`Walking to ${l.name.toLowerCase()}…`);
      }),
    );
  canvas.addEventListener("pointerdown", (e) => {
    if (dialog.open) return;
    const r = canvas.getBoundingClientRect();
    const x = camera.x + ((e.clientX - r.left) / 2 - width / 2) / zoom,
      y = camera.y + ((e.clientY - r.top) / 2 - height / 2) / zoom;
    const l = landmarks.find((l) => Math.hypot(l.x - x, l.y - 15 - y) < 36);
    if (l) {
      if (Math.hypot(player.x - l.x, player.y - l.y) < 62)
        openPanel(l.id, false);
      else {
        pending = l.id;
        routeTo(l.x, l.y + 28);
      }
    } else {
      pending = null;
      routeTo(x, y);
    }
  });
  function interact() {
    if (nearest) openPanel(nearest.id, false);
    else
      toast("Walk closer to a landmark, or choose a section from the hotbar.");
  }
  prompt.addEventListener("click", interact);
  touchInteract.addEventListener("click", interact);
  const directions: Record<string, string> = {
    w: "up",
    ArrowUp: "up",
    a: "left",
    ArrowLeft: "left",
    s: "down",
    ArrowDown: "down",
    d: "right",
    ArrowRight: "right",
  };
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (dialog.open) return;
    const el = e.target as HTMLElement;
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
      el.isContentEditable
    )
      return;
    if (document.querySelector("#direct-portfolio")?.matches(":target")) return;
    const dir = directions[e.key] ?? directions[e.key.toLowerCase()];
    if (dir) {
      e.preventDefault();
      begin();
      keys.add(dir);
      path = [];
      pending = null;
      dirty = true;
    } else if (
      e.key.toLowerCase() === "e" ||
      (e.key === "Enter" && (el === canvas || el === document.body))
    ) {
      e.preventDefault();
      if (!e.repeat) interact();
    } else if (/^[1-5]$/.test(e.key)) {
      e.preventDefault();
      openPanel(landmarksForHotbar[Number(e.key) - 1]);
    } else if (e.key === "Escape") {
      path = [];
      pending = null;
    }
  });
  const landmarksForHotbar = [
    "about",
    "projects",
    "skills",
    "achievements",
    "contact",
  ];
  window.addEventListener("keyup", (e) => {
    const dir = directions[e.key] ?? directions[e.key.toLowerCase()];
    if (dir) keys.delete(dir);
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-dir]")
    .forEach((button) => {
      button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        begin();
        path = [];
        pending = null;
        keys.add(button.dataset.dir!);
        button.classList.add("pressed");
        dirty = true;
      });
      const release = () => {
        keys.delete(button.dataset.dir!);
        button.classList.remove("pressed");
      };
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
    });
  window.addEventListener("blur", () => {
    keys.clear();
    document
      .querySelectorAll(".pressed")
      .forEach((e) => e.classList.remove("pressed"));
  });
  document.addEventListener("visibilitychange", () => {
    keys.clear();
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      dirty = true;
      frame = requestAnimationFrame(tick);
    }
  });
  reduced.addEventListener("change", () => {
    dirty = true;
  });
  document.fonts.ready.then(() => {
    dirty = true;
  });
  let lastNear = "",
    stepTime = 0;
  function tick(time: number) {
    if (document.hidden) return;
    const dt = last ? Math.min((time - last) / 1000, 0.045) : 0;
    last = time;
    let dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0),
      dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
    if (dialog.open) {
      dx = dy = 0;
    } else if (!dx && !dy && path.length) {
      const target = path[0],
        distance = Math.hypot(target.x - player.x, target.y - player.y);
      if (distance < 2.5) path.shift();
      else {
        dx = (target.x - player.x) / distance;
        dy = (target.y - player.y) / distance;
      }
    }
    const magnitude = Math.hypot(dx, dy);
    player.moving = magnitude > 0 ? 1 : 0;
    if (magnitude) {
      dx /= magnitude;
      dy /= magnitude;
      const speed = 78 * dt;
      const nx = player.x + dx * speed,
        ny = player.y + dy * speed;
      let moved = false;
      if (!blocked(nx, player.y)) {
        player.x = nx;
        moved = true;
      }
      if (!blocked(player.x, ny)) {
        player.y = ny;
        moved = true;
      }
      if (!moved && path.length) {
        path = [];
        pending = null;
      }
      player.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";
      dirty = true;
      if (time - stepTime > 320) {
        chime("step");
        stepTime = time;
      }
    }
    nearest = landmarks.reduce<typeof nearest>((best, l) => {
      const distance = Math.hypot(player.x - l.x, player.y - l.y);
      return distance < 59 &&
        (!best || distance < Math.hypot(player.x - best.x, player.y - best.y))
        ? l
        : best;
    }, null);
    const nearId = nearest?.id ?? "";
    if (nearId !== lastNear) {
      prompt.hidden = !nearest;
      touchInteract.disabled = !nearest;
      if (nearest) {
        document.querySelector("#interact-label")!.textContent = nearest.action;
        touchInteract.setAttribute("aria-label", nearest.action);
      }
      lastNear = nearId;
      dirty = true;
    }
    if (pending && !path.length && !dialog.open) {
      const l = landmarks.find((l) => l.id === pending)!;
      if (Math.hypot(player.x - l.x, player.y - l.y) < 60) {
        const id = pending;
        pending = null;
        openPanel(id, false);
      } else pending = null;
    }
    const { x: targetX, y: targetY } = cameraTarget();
    const factor = reduced.matches ? 1 : 1 - Math.exp(-dt * 3.5);
    const minX = width / zoom / 2,
      maxX = WORLD.width - minX,
      minY = height / zoom / 2,
      maxY = WORLD.height - minY;
    const cx = Math.max(
        Math.min(targetX, maxX),
        Math.min(minX, WORLD.width / 2),
      ),
      cy = Math.max(Math.min(targetY, maxY), Math.min(minY, WORLD.height / 2));
    if (Math.abs(camera.x - cx) > 0.2 || Math.abs(camera.y - cy) > 0.2) {
      camera.x += (cx - camera.x) * factor;
      camera.y += (cy - camera.y) * factor;
      dirty = true;
    }
    const chestTarget =
      dialog.open &&
      !document.querySelector<HTMLElement>("[data-panel=projects]")!.hidden
        ? 1
        : 0;
    if (Math.abs(chestOpen - chestTarget) > 0.01) {
      chestOpen = reduced.matches
        ? chestTarget
        : chestOpen + (chestTarget - chestOpen) * Math.min(1, dt * 12);
      dirty = true;
    }
    if (time - lastDraw > 32 && (!reduced.matches || dirty)) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.fillStyle = "#2a4230";
      ctx!.fillRect(0, 0, width, height);
      ctx!.save();
      ctx!.translate(width / 2, height / 2);
      ctx!.scale(zoom, zoom);
      ctx!.translate(-Math.round(camera.x), -Math.round(camera.y));
      renderWorld(
        ctx!,
        terrain,
        reduced.matches ? 0 : time,
        player,
        chestOpen,
        reduced.matches,
        night,
        visited,
        nearest?.id ?? null,
      );
      ctx!.restore();
      if (path.length && !reduced.matches) {
        const p = path[path.length - 1];
        const x = (p.x - camera.x) * zoom + width / 2,
          y = (p.y - camera.y) * zoom + height / 2;
        ctx!.strokeStyle = "#f2d28b99";
        ctx!.lineWidth = 1;
        ctx!.strokeRect(Math.round(x) - 4, Math.round(y) - 2, 8, 4);
      }
      coord.textContent = `X ${Math.round(player.x)} / Y ${Math.round(player.y)}`;
      mapPlayer.style.left = `${((player.x - 320) / 400) * 140 + 10}px`;
      mapPlayer.style.top = `${((player.y - 180) / 360) * 96}px`;
      dirty = false;
      lastDraw = time;
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  // Handle a supported portfolio deep link without hiding the world behind navigation.
  const hash = location.hash.slice(1);
  if (hash in panelNames) openPanel(hash);
}
