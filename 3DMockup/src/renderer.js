import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OUTPUT_PRESETS } from "./constants.js";
import { MOCKUP_TEMPLATES } from "./mockups.js";

function createGradientTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#f7f0e4");
  gradient.addColorStop(0.5, "#ece8e1");
  gradient.addColorStop(1, "#ddd8d2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const vignette = context.createRadialGradient(820, 180, 40, 512, 512, 760);
  vignette.addColorStop(0, "rgba(255,255,255,0.56)");
  vignette.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function averageEdgeColor(image) {
  const sampleCanvas = document.createElement("canvas");
  const sampleWidth = Math.max(4, Math.round(image.width * 0.04));
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = image.height;
  const context = sampleCanvas.getContext("2d");
  context.drawImage(image, 0, 0, sampleWidth, image.height, 0, 0, sampleWidth, image.height);
  const { data } = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);

  let red = 0;
  let green = 0;
  let blue = 0;
  let pixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      continue;
    }
    red += data[i];
    green += data[i + 1];
    blue += data[i + 2];
    pixels += 1;
  }

  if (pixels === 0) {
    return new THREE.Color("#d8d1c7");
  }

  return new THREE.Color(red / (255 * pixels), green / (255 * pixels), blue / (255 * pixels));
}

function createTextureFromImage(image) {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function fitText(context, text, maxWidth, initialSize) {
  let size = initialSize;
  while (size > 42) {
    context.font = `600 ${size}px Arial`;
    if (context.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 6;
  }

  return 42;
}

function createSpineTexture(title, author) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 2048;
  const context = canvas.getContext("2d");

  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";

  const safeTitle = (title || "Your Book Title").trim() || "Your Book Title";
  const safeAuthor = (author || "Author Name").trim() || "Author Name";
  const maxWidth = canvas.height - 220;

  const titleSize = fitText(context, safeTitle, maxWidth, 128);
  context.font = `600 ${titleSize}px Arial`;
  context.fillText(safeTitle, 0, -96, maxWidth);

  const authorSize = fitText(context, safeAuthor, maxWidth, 84);
  context.font = `500 ${authorSize}px Arial`;
  context.fillText(safeAuthor, 0, 86, maxWidth);

  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createBookMaterials(image, spineText) {
  const coverTexture = createTextureFromImage(image);
  const spineColor = averageEdgeColor(image);
  const pageColor = new THREE.Color("#f4efe6");
  const spineTexture = createSpineTexture(spineText.title, spineText.author);

  const coverMaterial = new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.72,
    metalness: 0.02
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    color: spineColor.clone().offsetHSL(0, -0.08, -0.16),
    roughness: 0.82,
    metalness: 0.01
  });

  const spineMaterial = new THREE.MeshStandardMaterial({
    map: spineTexture,
    color: "#ffffff",
    roughness: 0.8,
    metalness: 0.02
  });

  const pageMaterial = new THREE.MeshStandardMaterial({
    color: pageColor,
    roughness: 0.9,
    metalness: 0
  });

  return {
    materials: [spineMaterial, spineMaterial, pageMaterial, pageMaterial, coverMaterial, backMaterial],
    pageMaterial,
    textures: [coverTexture, spineTexture]
  };
}

export class BookMockupRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0.2, 4.8);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2.8;
    this.controls.maxDistance = 7.5;
    this.controls.enablePan = false;
    this.controls.target.set(0, -0.1, 0);

    this.gradientTexture = createGradientTexture();
    this.mockupRoot = new THREE.Group();
    this.scene.add(this.mockupRoot);

    this.setupLights();
    this.state = {
      background: "gradient",
      size: "square",
      shadowStrength: 0.75,
      spineTitle: "Your Book Title",
      spineAuthor: "Author Name",
      tilt: 0,
      template: "standing"
    };

    this.imageElement = null;
    this.materialCache = null;

    this.setBackground(this.state.background);
    this.setImage(this.createFallbackImage());
    this.setShadowStrength(this.state.shadowStrength);
    this.setTemplate(this.state.template);
    this.resizeToDisplay();
    this.renderLoop();
  }

  setupLights() {
    const ambient = new THREE.HemisphereLight("#fff8ef", "#d9d0c4", 1.25);
    this.scene.add(ambient);

    this.keyLight = new THREE.DirectionalLight("#ffffff", 1.65);
    this.keyLight.position.set(3.6, 4.2, 4.8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 18;
    this.keyLight.shadow.bias = -0.0008;
    this.scene.add(this.keyLight);

    const fillLight = new THREE.DirectionalLight("#f8e8d2", 0.6);
    fillLight.position.set(-4, 1.8, 2.4);
    this.scene.add(fillLight);
  }

  createFallbackImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1400;
    const context = canvas.getContext("2d");

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#d06e40");
    gradient.addColorStop(1, "#77341f");
    context.fillStyle = "#fdf9f2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = gradient;
    context.fillRect(72, 72, canvas.width - 144, canvas.height - 144);

    context.strokeStyle = "rgba(248, 241, 228, 0.92)";
    context.lineCap = "round";
    context.lineWidth = 18;
    context.beginPath();
    context.moveTo(220, 270);
    context.lineTo(680, 270);
    context.moveTo(220, 346);
    context.lineTo(560, 346);
    context.stroke();

    context.fillStyle = "#f7e4b8";
    context.beginPath();
    context.arc(450, 690, 184, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#b04e2b";
    context.beginPath();
    context.arc(450, 628, 96, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#6b2d1c";
    context.lineWidth = 28;
    context.beginPath();
    context.arc(512, 872, 154, Math.PI, Math.PI * 1.88);
    context.stroke();

    return canvas;
  }

  setImage(image) {
    this.imageElement = image;
    this.materialCache?.textures?.forEach((texture) => texture.dispose());
    this.materialCache = createBookMaterials(image, {
      title: this.state.spineTitle,
      author: this.state.spineAuthor
    });
    this.setTemplate(this.state.template);
  }

  setSpineText(title, author) {
    this.state.spineTitle = title;
    this.state.spineAuthor = author;
    this.setImage(this.imageElement ?? this.createFallbackImage());
  }

  setTemplate(templateId) {
    this.state.template = templateId;
    this.mockupRoot.clear();

    const template = MOCKUP_TEMPLATES.find((entry) => entry.id === templateId) ?? MOCKUP_TEMPLATES[0];
    const group = template.create(this.materialCache.materials, this.materialCache.pageMaterial);
    group.rotation.z += THREE.MathUtils.degToRad(this.state.tilt);
    this.mockupRoot.add(group);
    template.setupCamera(this.camera);
    this.controls.target.set(0, -0.1, 0);
    this.controls.update();
  }

  setBackground(backgroundId) {
    this.state.background = backgroundId;
    if (backgroundId === "transparent") {
      this.scene.background = null;
      this.renderer.setClearAlpha(0);
      return;
    }

    this.renderer.setClearAlpha(1);
    if (backgroundId === "white") {
      this.scene.background = new THREE.Color("#ffffff");
      return;
    }

    this.scene.background = this.gradientTexture;
  }

  setShadowStrength(value) {
    this.state.shadowStrength = value;
    this.keyLight.intensity = 1.2 + value * 0.6;
  }

  setTilt(value) {
    this.state.tilt = value;
    this.setTemplate(this.state.template);
  }

  setSize(sizeId) {
    this.state.size = sizeId;
    this.resizeToDisplay();
  }

  resizeToDisplay() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = rect.width / Math.max(rect.height, 1);
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height, false);
  }

  exportPng() {
    const preset = OUTPUT_PRESETS[this.state.size];
    const previousSize = new THREE.Vector2();
    this.renderer.getSize(previousSize);
    const previousAspect = this.camera.aspect;

    this.renderer.setSize(preset.width, preset.height, false);
    this.camera.aspect = preset.width / preset.height;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);

    const dataUrl = this.renderer.domElement.toDataURL("image/png");

    this.renderer.setSize(previousSize.x, previousSize.y, false);
    this.camera.aspect = previousAspect;
    this.camera.updateProjectionMatrix();
    this.render();

    return {
      dataUrl,
      filename: `book-mockup-${this.state.template}-${this.state.size}.png`
    };
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  renderLoop() {
    const tick = () => {
      this.render();
      requestAnimationFrame(tick);
    };
    tick();
  }
}
