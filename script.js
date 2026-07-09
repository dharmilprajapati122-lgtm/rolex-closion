const frameCount = 241;
const framePath = (index) => `assets/frames/frame_${String(index).padStart(6, "0")}.webp`;

const canvas = document.querySelector("#watch-canvas");
const context = canvas.getContext("2d", { alpha: false });
const hero = document.querySelector(".hero");
const images = new Array(frameCount);

let currentFrame = 0;
let targetFrame = 0;
let loadedCount = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let rafId = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvasWidth = Math.round(rect.width * dpr);
  canvasHeight = Math.round(rect.height * dpr);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    drawFrame(Math.round(currentFrame));
  }
}

function drawCoverImage(image) {
  const imageRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let x = 0;
  let y = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageRatio;
    x = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageRatio;
    y = (canvasHeight - drawHeight) / 2;
  }

  context.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawFrame(index) {
  const image = images[index];
  if (!image || !image.complete || !canvasWidth || !canvasHeight) return;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  drawCoverImage(image);
}

function updateTargetFrame() {
  const rect = hero.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  targetFrame = progress * (frameCount - 1);
}

function tick() {
  currentFrame += (targetFrame - currentFrame) * 0.16;
  const rounded = Math.round(currentFrame);
  drawFrame(rounded);

  if (Math.abs(targetFrame - currentFrame) > 0.01) {
    rafId = requestAnimationFrame(tick);
  } else {
    currentFrame = targetFrame;
    drawFrame(Math.round(currentFrame));
    rafId = 0;
  }
}

function requestRender() {
  updateTargetFrame();
  if (!rafId) {
    rafId = requestAnimationFrame(tick);
  }
}

function preloadFrames() {
  for (let index = 0; index < frameCount; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = framePath(index);
    image.onload = () => {
      loadedCount += 1;
      if (index === 0 || loadedCount === frameCount) {
        drawFrame(Math.round(currentFrame));
      }
    };
    images[index] = image;
  }
}

resizeCanvas();
preloadFrames();
requestRender();

window.addEventListener("resize", () => {
  resizeCanvas();
  requestRender();
});

window.addEventListener(
  "scroll",
  () => {
    requestRender();
  },
  { passive: true },
);
