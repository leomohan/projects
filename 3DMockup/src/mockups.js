import * as THREE from "three";

const BASE_BOOK_SIZE = {
  width: 1.4,
  height: 2.1,
  depth: 0.28
};

function createBook(materials) {
  const geometry = new THREE.BoxGeometry(
    BASE_BOOK_SIZE.width,
    BASE_BOOK_SIZE.height,
    BASE_BOOK_SIZE.depth
  );
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createDesk(width = 4.5, depth = 3.3) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({
    color: "#dfd4c6",
    roughness: 0.95,
    metalness: 0.02
  });
  const desk = new THREE.Mesh(geometry, material);
  desk.rotation.x = -Math.PI / 2;
  desk.position.y = -1.2;
  desk.receiveShadow = true;
  return desk;
}

export const MOCKUP_TEMPLATES = [
  {
    id: "standing",
    label: "Standing Book",
    description: "Front-facing upright mockup for clean promotional stills.",
    create(materials) {
      const group = new THREE.Group();
      const book = createBook(materials);
      book.rotation.y = -0.35;
      book.rotation.x = 0.05;
      group.add(book);
      return group;
    },
    setupCamera(camera) {
      camera.position.set(0, 0.3, 4.9);
    }
  },
  {
    id: "angled",
    label: "Angled Perspective",
    description: "More dynamic three-quarter composition for feeds and ads.",
    create(materials) {
      const group = new THREE.Group();
      const book = createBook(materials);
      book.rotation.set(-0.16, -0.7, 0.08);
      book.position.set(0.15, -0.04, 0);
      group.add(book);
      return group;
    },
    setupCamera(camera) {
      camera.position.set(0, 0.15, 4.3);
    }
  },
  {
    id: "stack",
    label: "Stack of Books",
    description: "Three stacked copies with the uploaded cover on the top book.",
    create(materials, pageMaterial) {
      const group = new THREE.Group();

      for (let i = 0; i < 3; i += 1) {
        const stackMaterials = i === 2
          ? materials
          : [pageMaterial, pageMaterial, pageMaterial, pageMaterial, pageMaterial, pageMaterial];
        const book = createBook(stackMaterials);
        book.rotation.set(Math.PI / 2, 0, i === 2 ? 0.06 : 0);
        book.position.set(i * 0.05 - 0.05, -0.8 + i * 0.18, i * 0.04);
        group.add(book);
      }

      group.rotation.z = -0.1;
      return group;
    },
    setupCamera(camera) {
      camera.position.set(0.15, 0.3, 4.7);
    }
  },
  {
    id: "desk",
    label: "Book on Desk",
    description: "Minimal desk surface scene with a hero book and soft editorial lighting.",
    create(materials) {
      const group = new THREE.Group();
      const desk = createDesk();
      const book = createBook(materials);

      book.rotation.set(-0.95, -0.48, 0.58);
      book.position.set(0.25, -0.88, 0.05);

      group.add(desk);
      group.add(book);
      return group;
    },
    setupCamera(camera) {
      camera.position.set(0, 0.35, 5);
    }
  }
];
