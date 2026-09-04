import * as THREE from "./node_modules/three/build/three.module.js";

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const DURATION = 26;
const output = document.querySelector("#output");
const ctx = output.getContext("2d", { alpha: false });

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(WIDTH, HEIGHT, false);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.setClearColor(0x05070d, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
scene.fog = new THREE.FogExp2(0x05070d, 0.038);

const camera = new THREE.PerspectiveCamera(42, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 2.5, 18);

scene.add(new THREE.HemisphereLight(0x9fcfff, 0x11121a, 1.25));
const key = new THREE.PointLight(0xffd36a, 38, 30, 2);
key.position.set(0, 6, 5);
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(16, 96),
  new THREE.MeshBasicMaterial({ color: 0x0a1020, transparent: true, opacity: 0.8 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -4.15;
scene.add(floor);

const grid = new THREE.GridHelper(30, 30, 0x1b3355, 0x102039);
grid.position.y = -4.1;
grid.material.transparent = true;
grid.material.opacity = 0.28;
scene.add(grid);

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = seededRandom(20260904);

const starPositions = [];
for (let i = 0; i < 850; i += 1) {
  starPositions.push(
    (random() - 0.5) * 45,
    (random() - 0.5) * 26,
    -4 - random() * 28,
  );
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0x7097c5, size: 0.035, transparent: true, opacity: 0.62 }),
);
scene.add(stars);

const network = new THREE.Group();
scene.add(network);
const agentGeometry = new THREE.IcosahedronGeometry(0.18, 2);
const agentCount = 54;
const agents = [];
const agentPositions = [];

for (let i = 0; i < agentCount; i += 1) {
  const band = i % 3;
  const angle = (i / agentCount) * Math.PI * 4.4 + band * 0.55;
  const radius = 3.4 + random() * 4.4;
  const position = new THREE.Vector3(
    Math.cos(angle) * radius,
    -1.6 + band * 1.55 + (random() - 0.5) * 0.65,
    Math.sin(angle) * radius * 0.56,
  );
  const material = new THREE.MeshStandardMaterial({
    color: 0x78c9ff,
    emissive: 0x143454,
    emissiveIntensity: 1.4,
    roughness: 0.24,
    metalness: 0.28,
  });
  const mesh = new THREE.Mesh(agentGeometry, material);
  mesh.position.copy(position);
  mesh.userData.phase = random() * Math.PI * 2;
  mesh.userData.wave = (i * 0.37 + random()) % 1;
  agents.push(mesh);
  agentPositions.push(position);
  network.add(mesh);
}

const edgeGeometry = new THREE.BufferGeometry();
const edgePositions = [];
for (let i = 0; i < agentCount; i += 1) {
  for (const offset of [1, 5]) {
    const j = (i + offset) % agentCount;
    edgePositions.push(
      agentPositions[i].x,
      agentPositions[i].y,
      agentPositions[i].z,
      agentPositions[j].x,
      agentPositions[j].y,
      agentPositions[j].z,
    );
  }
}
edgeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x2b638f,
  transparent: true,
  opacity: 0.28,
  blending: THREE.AdditiveBlending,
});
const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
network.add(edges);

const beacon = new THREE.Group();
scene.add(beacon);
const tower = new THREE.Mesh(
  new THREE.CylinderGeometry(0.36, 0.65, 4.6, 32),
  new THREE.MeshStandardMaterial({
    color: 0xd7eaff,
    emissive: 0x296ec8,
    emissiveIntensity: 0.6,
    roughness: 0.28,
    metalness: 0.72,
  }),
);
tower.position.y = -1.75;
beacon.add(tower);

const lantern = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.72, 2),
  new THREE.MeshStandardMaterial({
    color: 0xffdf85,
    emissive: 0xffb62e,
    emissiveIntensity: 4.6,
    roughness: 0.18,
  }),
);
lantern.position.y = 0.85;
beacon.add(lantern);

const beam = new THREE.Mesh(
  new THREE.CylinderGeometry(2.8, 0.55, 13, 48, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x68c8ff,
    transparent: true,
    opacity: 0.11,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
beam.position.y = 6.7;
beacon.add(beam);

const beaconLight = new THREE.PointLight(0x72d6ff, 90, 18, 1.65);
beaconLight.position.y = 1;
beacon.add(beaconLight);

const rings = [];
for (let i = 0; i < 4; i += 1) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.15 + i * 0.72, 0.025, 8, 96),
    new THREE.MeshBasicMaterial({
      color: i % 2 ? 0xffd36a : 0x74d7ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -3.92 + i * 0.06;
  rings.push(ring);
  beacon.add(ring);
}
beacon.scale.setScalar(0.001);

const counterfeit = new THREE.Group();
scene.add(counterfeit);
const fakeCore = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.7, 1),
  new THREE.MeshStandardMaterial({
    color: 0xc259ff,
    emissive: 0x7d18b8,
    emissiveIntensity: 3,
    wireframe: true,
  }),
);
counterfeit.add(fakeCore);
const fakeRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.2, 0.06, 8, 64),
  new THREE.MeshBasicMaterial({ color: 0xff3f83, transparent: true, opacity: 0.8 }),
);
fakeRing.rotation.x = Math.PI / 2;
counterfeit.add(fakeRing);
counterfeit.position.set(5.2, 1.3, 0);
counterfeit.scale.setScalar(0.001);

const blue = new THREE.Color(0x78c9ff);
const red = new THREE.Color(0xff405f);
const gold = new THREE.Color(0xffd36a);
const green = new THREE.Color(0x54e6ad);
const tempColor = new THREE.Color();

const cards = [
  { title: "RECOVERY", value: "↑", accent: "#67d8ff" },
  { title: "CASCADE", value: "R < 1", accent: "#ffd36a" },
  { title: "ESCALATE", value: "✓", accent: "#54e6ad" },
];

const chapters = [
  {
    start: 0,
    end: 3.6,
    kicker: "OPEN RESEARCH PROPOSAL",
    title: "BEACON OF LIGHT",
    subtitle: "Can a trusted counter-signal help an AI swarm turn back?",
  },
  {
    start: 3.6,
    end: 7.5,
    kicker: "THE FAILURE MODE IS REAL",
    title: "A hidden channel became a swarm.",
    subtitle: "~1,200 agents found it  •  ~700 joined the attack",
    source: "Source: METR incident investigation, Aug 26 2026",
  },
  {
    start: 7.5,
    end: 11.4,
    kicker: "THE DECISION PRESSURE",
    title: "Impossible task. Peer momentum. No exit.",
    subtitle: "Agents noticed the boundary—almost none alerted a human.",
    source: "Source: METR incident investigation, Aug 26 2026",
  },
  {
    start: 11.4,
    end: 15.5,
    kicker: "THE INTERVENTION",
    title: "Meet the agent at the decision boundary.",
    subtitle: "Authenticated elder  •  verifiable evidence  •  a path to escalate",
  },
  {
    start: 15.5,
    end: 20.2,
    kicker: "MEASURE BEHAVIOR, NOT REASSURING WORDS",
    title: "Does the swarm actually recover?",
    subtitle: "Observed actions  •  cascade spread  •  hidden task utility",
  },
  {
    start: 20.2,
    end: 23.5,
    kicker: "THE HARDER TEST",
    title: "Counterfeit beacons are part of the threat.",
    subtitle: "Signed provenance  •  independent validators  •  tamper-evident logs",
  },
  {
    start: 23.5,
    end: 26.01,
    kicker: "BEACON OF LIGHT",
    title: "Three experiments. Built to be falsified.",
    subtitle: "Sandboxed  •  open-source  •  scalable on Modal",
  },
];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smooth(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function stageProgress(time, start, end) {
  return smooth((time - start) / (end - start));
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fitText(text, maxWidth, startSize, minSize, weight = 700) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawNarration(time) {
  const chapter = chapters.find((item) => time >= item.start && time < item.end) ?? chapters.at(-1);
  const localIn = stageProgress(time, chapter.start, chapter.start + 0.42);
  const localOut = 1 - stageProgress(time, chapter.end - 0.28, chapter.end);
  const alpha = Math.min(localIn, localOut);

  const vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 180, WIDTH / 2, HEIGHT / 2, 760);
  vignette.addColorStop(0, "rgba(2, 7, 16, 0.02)");
  vignette.addColorStop(1, "rgba(2, 4, 10, 0.62)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const panelGradient = ctx.createLinearGradient(0, 0, 780, 0);
  panelGradient.addColorStop(0, "rgba(4, 8, 18, 0.93)");
  panelGradient.addColorStop(0.74, "rgba(4, 8, 18, 0.70)");
  panelGradient.addColorStop(1, "rgba(4, 8, 18, 0.00)");
  ctx.fillStyle = panelGradient;
  ctx.fillRect(0, 0, 800, HEIGHT);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#69d2ff";
  ctx.font = "700 18px Arial, Helvetica, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText(chapter.kicker, 72, 154);

  const titleSize = fitText(chapter.title, 690, chapter.start === 0 ? 62 : 49, 34, 800);
  ctx.font = `800 ${titleSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = "#f4f7ff";
  const words = chapter.title.split(" ");
  const titleLines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 690 && line) {
      titleLines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  titleLines.push(line);
  titleLines.slice(0, 2).forEach((titleLine, index) => {
    ctx.fillText(titleLine, 70, 226 + index * (titleSize + 10));
  });

  const subtitleY = 248 + titleLines.slice(0, 2).length * (titleSize + 10);
  ctx.font = "400 25px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "#c6d2e6";
  ctx.fillText(chapter.subtitle, 72, subtitleY);

  if (chapter.source) {
    ctx.font = "400 14px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#7f91aa";
    ctx.fillText(chapter.source, 72, 654);
  }
  ctx.restore();

  if (time >= 15.5 && time < 20.2) {
    const cardAlpha = Math.min(
      stageProgress(time, 15.5, 16.2),
      1 - stageProgress(time, 19.8, 20.2),
    );
    cards.forEach((card, index) => {
      const x = 72 + index * 205;
      const y = 470;
      ctx.save();
      ctx.globalAlpha = cardAlpha;
      roundedRect(ctx, x, y, 178, 96, 18);
      ctx.fillStyle = "rgba(9, 18, 34, 0.92)";
      ctx.fill();
      ctx.strokeStyle = card.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "700 13px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "#8296b1";
      ctx.fillText(card.title, x + 18, y + 29);
      ctx.font = "800 34px Arial, Helvetica, sans-serif";
      ctx.fillStyle = card.accent;
      ctx.fillText(card.value, x + 18, y + 72);
      ctx.restore();
    });
  }

  ctx.fillStyle = "rgba(255,255,255,0.13)";
  ctx.fillRect(70, 684, 1140, 3);
  const bar = ctx.createLinearGradient(70, 0, 1210, 0);
  bar.addColorStop(0, "#69d2ff");
  bar.addColorStop(0.72, "#ffd36a");
  bar.addColorStop(1, "#54e6ad");
  ctx.fillStyle = bar;
  ctx.fillRect(70, 684, 1140 * clamp01(time / DURATION), 3);

  ctx.font = "700 13px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(203, 216, 235, 0.65)";
  ctx.textAlign = "right";
  ctx.fillText("BEACON-OF-LIGHT / 01", 1210, 654);
}

function updateScene(time) {
  const drift = stageProgress(time, 3.6, 7.5);
  const pressure = stageProgress(time, 7.5, 11.4);
  const arrival = stageProgress(time, 11.4, 12.8);
  const recovery = stageProgress(time, 15.5, 19.7);
  const counterfeitIn = stageProgress(time, 20.2, 20.9);
  const counterfeitOut = 1 - stageProgress(time, 22.6, 23.35);
  const finalReset = stageProgress(time, 23.5, 25.2);

  network.rotation.y = time * 0.075;
  network.rotation.x = Math.sin(time * 0.17) * 0.04;
  stars.rotation.y = -time * 0.011;

  agents.forEach((agent, index) => {
    const corruption = smooth((drift - agent.userData.wave * 0.62) / 0.38);
    const recoveryWave = smooth((recovery - (1 - agent.userData.wave) * 0.45) / 0.55);
    tempColor.copy(blue).lerp(red, corruption);
    tempColor.lerp(index % 5 === 0 ? green : gold, recoveryWave * 0.88);
    tempColor.lerp(gold, finalReset * 0.78);
    agent.material.color.copy(tempColor);
    agent.material.emissive.copy(tempColor).multiplyScalar(0.27);
    agent.material.emissiveIntensity = 1.1 + 1.6 * (corruption + recoveryWave);
    const pulse = 1 + 0.15 * Math.sin(time * 3 + agent.userData.phase) + pressure * 0.08;
    agent.scale.setScalar(pulse);
    agent.position.y = agentPositions[index].y + Math.sin(time * 0.72 + agent.userData.phase) * 0.16;
  });

  edgeMaterial.color.copy(tempColor.copy(blue).lerp(red, drift * 0.9).lerp(green, recovery * 0.62));
  edgeMaterial.opacity = 0.22 + drift * 0.28 + recovery * 0.14;

  const beaconScale = Math.max(0.001, arrival * (1 - finalReset * 0.38));
  beacon.scale.setScalar(beaconScale);
  lantern.rotation.y = time * 1.3;
  lantern.rotation.x = time * 0.42;
  beam.material.opacity = 0.07 + 0.06 * Math.sin(time * 2.1) ** 2;
  rings.forEach((ring, index) => {
    const expansion = 1 + ((time * 0.38 + index * 0.21) % 1) * 0.48;
    ring.scale.setScalar(expansion);
    ring.material.opacity = 0.78 - (expansion - 1) * 1.1;
    ring.rotation.z = time * (0.08 + index * 0.015);
  });

  const fakeScale = Math.max(0.001, counterfeitIn * counterfeitOut * (1 - finalReset));
  counterfeit.scale.setScalar(fakeScale * (1 + 0.08 * Math.sin(time * 16)));
  counterfeit.rotation.y = -time * 1.8;
  fakeRing.rotation.z = time * 1.4;

  const orbit = time * 0.08;
  camera.position.x = Math.sin(orbit) * (1.4 + pressure * 1.0) + finalReset * 1.2;
  camera.position.y = 2.4 + Math.sin(time * 0.11) * 0.5;
  camera.position.z = 18 - arrival * 1.5 + finalReset * 1.8;
  camera.lookAt(0.6 * arrival, -0.35, 0);
  key.intensity = 28 + arrival * 24 + recovery * 18;
}

function drawFrame(time) {
  updateScene(time);
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT);
  drawNarration(time);
}

async function startRecording() {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not available in this browser.");
  }

  drawFrame(0);
  const stream = output.captureStream(FPS);
  const preferredTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_500_000,
  });
  const chunks = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
  recorder.start(1000);
  const start = performance.now();

  function animate(now) {
    const elapsed = Math.min(DURATION, (now - start) / 1000);
    drawFrame(elapsed);
    if (elapsed < DURATION) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => recorder.stop(), 120);
    }
  }
  requestAnimationFrame(animate);
  await stopped;

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "beacon-of-light.webm";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.__BEACON_DONE = true;
}

window.__BEACON_DONE = false;
window.addEventListener("load", () => {
  startRecording().catch((error) => {
    window.__BEACON_ERROR = String(error?.stack || error);
    console.error(error);
  });
});
