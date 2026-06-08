const mistCanvas = document.querySelector("#mistCanvas");
const mistCtx = mistCanvas.getContext("2d");
const portraitCanvas = document.querySelector("#portraitCanvas");
const portraitCtx = portraitCanvas.getContext("2d", { willReadFrequently: true });
const photoInput = document.querySelector("#photoInput");
const pullRange = document.querySelector("#pullRange");
const mistRange = document.querySelector("#mistRange");

const state = {
  image: null,
  particles: [],
  backgroundMist: [],
  tick: 0,
  pull: Number(pullRange.value) / 100,
  mist: Number(mistRange.value) / 100
};

function resizeMistCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  mistCanvas.width = Math.floor(window.innerWidth * dpr);
  mistCanvas.height = Math.floor(window.innerHeight * dpr);
  mistCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedBackgroundMist();
}

function seedBackgroundMist() {
  const count = Math.floor((window.innerWidth * window.innerHeight) / 16500);
  state.backgroundMist = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 20 + Math.random() * 110,
    vx: -0.08 + Math.random() * 0.18,
    vy: -0.05 + Math.random() * 0.1,
    alpha: 0.02 + Math.random() * 0.075
  }));
}

function drawBackgroundMist() {
  mistCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  mistCtx.globalCompositeOperation = "lighter";

  for (const puff of state.backgroundMist) {
    puff.x += puff.vx;
    puff.y += puff.vy;

    if (puff.x < -puff.r) puff.x = window.innerWidth + puff.r;
    if (puff.x > window.innerWidth + puff.r) puff.x = -puff.r;
    if (puff.y < -puff.r) puff.y = window.innerHeight + puff.r;
    if (puff.y > window.innerHeight + puff.r) puff.y = -puff.r;

    const gradient = mistCtx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.r);
    gradient.addColorStop(0, `rgba(160, 179, 168, ${puff.alpha})`);
    gradient.addColorStop(0.62, `rgba(77, 92, 82, ${puff.alpha * 0.36})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    mistCtx.fillStyle = gradient;
    mistCtx.beginPath();
    mistCtx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
    mistCtx.fill();
  }

  mistCtx.globalCompositeOperation = "source-over";
}

function drawDefaultPortrait() {
  const w = portraitCanvas.width;
  const h = portraitCanvas.height;
  const g = portraitCtx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1a201c");
  g.addColorStop(1, "#050605");
  portraitCtx.fillStyle = g;
  portraitCtx.fillRect(0, 0, w, h);

  portraitCtx.save();
  portraitCtx.translate(w / 2, h * 0.52);
  portraitCtx.fillStyle = "#050605";
  portraitCtx.beginPath();
  portraitCtx.ellipse(0, 64, 178, 248, 0, 0, Math.PI * 2);
  portraitCtx.fill();
  portraitCtx.beginPath();
  portraitCtx.ellipse(0, -156, 112, 132, 0, 0, Math.PI * 2);
  portraitCtx.fill();

  portraitCtx.strokeStyle = "rgba(229, 169, 60, 0.56)";
  portraitCtx.lineWidth = 7;
  portraitCtx.beginPath();
  portraitCtx.moveTo(-132, -176);
  portraitCtx.lineTo(132, -176);
  portraitCtx.moveTo(-92, -74);
  portraitCtx.lineTo(92, -74);
  portraitCtx.stroke();
  portraitCtx.restore();

  spawnFromCanvas(true);
}

function coverImage(img, ctx, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
}

function renderSourcePortrait() {
  const w = portraitCanvas.width;
  const h = portraitCanvas.height;
  portraitCtx.clearRect(0, 0, w, h);

  if (state.image) {
    coverImage(state.image, portraitCtx, w, h);
    const imgData = portraitCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = data[i] * 0.26 + data[i + 1] * 0.46 + data[i + 2] * 0.28;
      data[i] = avg * 0.36;
      data[i + 1] = avg * 0.48;
      data[i + 2] = avg * 0.42;
    }
    portraitCtx.putImageData(imgData, 0, 0);
    portraitCtx.globalCompositeOperation = "multiply";
    portraitCtx.fillStyle = "rgba(2, 4, 3, 0.44)";
    portraitCtx.fillRect(0, 0, w, h);
    portraitCtx.globalCompositeOperation = "screen";
    portraitCtx.fillStyle = "rgba(184, 39, 53, 0.16)";
    portraitCtx.fillRect(0, 0, w, h);
    portraitCtx.globalCompositeOperation = "source-over";
  } else {
    drawDefaultPortrait();
  }
}

function spawnFromCanvas(force = false) {
  if (!force && state.tick % 2 !== 0) return;

  const w = portraitCanvas.width;
  const h = portraitCanvas.height;
  const data = portraitCtx.getImageData(0, 0, w, h).data;
  const amount = Math.floor(16 + state.mist * 46);

  for (let i = 0; i < amount; i++) {
    const x = Math.floor(w * (0.16 + Math.random() * 0.68));
    const y = Math.floor(h * (0.08 + Math.random() * 0.82));
    const index = (y * w + x) * 4;
    const light = data[index] + data[index + 1] + data[index + 2];

    if (light < 42 && Math.random() > 0.16) continue;

    state.particles.push({
      x,
      y,
      ox: x,
      oy: y,
      tx: w * (0.48 + (Math.random() - 0.5) * 0.06),
      ty: h * (0.48 + (Math.random() - 0.5) * 0.12),
      vx: (Math.random() - 0.5) * 2.4,
      vy: (Math.random() - 0.5) * 1.6,
      life: 0,
      max: 80 + Math.random() * 100,
      size: 0.8 + Math.random() * 3.2,
      hue: Math.random() > 0.78 ? "ember" : "fog"
    });
  }

  if (state.particles.length > 2400) {
    state.particles.splice(0, state.particles.length - 2400);
  }
}

function drawPortraitEffects() {
  renderSourcePortrait();
  spawnFromCanvas();

  portraitCtx.save();
  portraitCtx.globalCompositeOperation = "lighter";

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    const pull = 0.004 + state.pull * 0.034;
    const drift = Math.sin((state.tick + p.oy) * 0.025) * 0.26;

    p.vx += (p.tx - p.x) * pull + drift * 0.04;
    p.vy += (p.ty - p.y) * pull - 0.018;
    p.vx *= 0.965;
    p.vy *= 0.965;
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    const fade = Math.max(0, 1 - p.life / p.max);
    const distance = Math.hypot(p.tx - p.x, p.ty - p.y);
    const alpha = Math.min(0.72, fade * (distance / 260));

    portraitCtx.fillStyle = p.hue === "ember"
      ? `rgba(229, 169, 60, ${alpha})`
      : `rgba(165, 183, 171, ${alpha * 0.78})`;
    portraitCtx.beginPath();
    portraitCtx.arc(p.x, p.y, p.size * (1 + state.mist * 0.8), 0, Math.PI * 2);
    portraitCtx.fill();

    if (p.life > p.max || distance < 14) {
      state.particles.splice(i, 1);
    }
  }

  const maw = portraitCtx.createRadialGradient(
    portraitCanvas.width * 0.49,
    portraitCanvas.height * 0.5,
    12,
    portraitCanvas.width * 0.49,
    portraitCanvas.height * 0.5,
    portraitCanvas.width * 0.28
  );
  maw.addColorStop(0, "rgba(0, 0, 0, 0.86)");
  maw.addColorStop(0.34, "rgba(184, 39, 53, 0.20)");
  maw.addColorStop(1, "rgba(0, 0, 0, 0)");
  portraitCtx.fillStyle = maw;
  portraitCtx.fillRect(0, 0, portraitCanvas.width, portraitCanvas.height);

  portraitCtx.restore();
}

function animate() {
  state.tick++;
  drawBackgroundMist();
  drawPortraitEffects();
  requestAnimationFrame(animate);
}

photoInput.addEventListener("change", event => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.particles = [];
      renderSourcePortrait();
      spawnFromCanvas(true);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

pullRange.addEventListener("input", () => {
  state.pull = Number(pullRange.value) / 100;
});

mistRange.addEventListener("input", () => {
  state.mist = Number(mistRange.value) / 100;
});

window.addEventListener("resize", resizeMistCanvas);

resizeMistCanvas();
drawDefaultPortrait();
animate();
