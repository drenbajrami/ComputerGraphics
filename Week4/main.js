import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x233641);

const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.1, 60);
camera.position.set(5, 5, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.8, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffeedb, 3);
light.position.set(-4, 7, 6);
scene.add(light, new THREE.HemisphereLight(0xcbe9ff, 0x34424a, 1.5));
scene.add(new THREE.GridHelper(16, 16, 0x56757d, 0x344b56));

const frame = new THREE.MeshStandardMaterial({ color: 0x51b2aa, roughness: 0.55 });
const joints = new THREE.MeshStandardMaterial({ color: 0x293b46, roughness: 0.45 });
const pads = new THREE.MeshStandardMaterial({ color: 0xd8a46c, roughness: 0.65 });

function attach(parent, geometry, material, height = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height;
  parent.add(mesh);
  return mesh;
}

function joint(parent, x, y, radius) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, 0);
  parent.add(pivot);
  attach(pivot, new THREE.SphereGeometry(radius, 16, 12), joints);
  return pivot;
}

const base = attach(scene, new THREE.CylinderGeometry(0.85, 1.05, 0.34, 32), joints, 0.17);
const shoulder = joint(base, 0, 0.32, 0.31);
attach(shoulder, new THREE.BoxGeometry(0.43, 1.7, 0.47), frame, 0.85);

const elbow = joint(shoulder, 0, 1.7, 0.26);
attach(elbow, new THREE.BoxGeometry(0.39, 1.5, 0.41), frame, 0.75);

const wrist = joint(elbow, 0, 1.5, 0.2);
const palm = attach(wrist, new THREE.BoxGeometry(1.42, 0.98, 0.4), frame, 0.59);

shoulder.rotation.z = -0.24;
elbow.rotation.z = 0.46;
wrist.rotation.z = -0.22;

function makeDigit(x, y, lengths, width) {
  const root = joint(palm, x, y, width * 0.52);
  const hinges = [];
  let segment = root;

  for (const [index, length] of lengths.entries()) {
    const material = index === lengths.length - 1 ? pads : frame;
    attach(segment, new THREE.BoxGeometry(width, length, width), material, length / 2);

    if (index < lengths.length - 1) {
      segment = joint(segment, 0, length, width * 0.48);
      hinges.push(segment);
    }
  }

  return { root, hinges };
}

const fingers = [
  makeDigit(-0.49, 0.49, [0.39, 0.28, 0.21], 0.22),
  makeDigit(-0.16, 0.49, [0.46, 0.32, 0.24], 0.23),
  makeDigit(0.17, 0.49, [0.42, 0.29, 0.22], 0.22),
  makeDigit(0.49, 0.49, [0.32, 0.23, 0.17], 0.18),
];
const thumb = makeDigit(-0.72, -0.2, [0.39, 0.28], 0.26);

const grip = document.querySelector("#grip");

function updateGrip() {
  const curl = grip.valueAsNumber;
  for (const { root, hinges } of fingers) {
    root.rotation.x = curl * 1.15;
    for (const hinge of hinges) hinge.rotation.x = curl * 1.2;
  }
  thumb.root.rotation.z = 0.82 - curl * 1.04;
  thumb.root.rotation.x = curl * 0.85;
  thumb.hinges[0].rotation.x = curl * 0.7;
}

grip.addEventListener("input", updateGrip);
updateGrip();

const jointKeys = {
  q: [shoulder, 1], a: [shoulder, -1],
  w: [elbow, 1], s: [elbow, -1],
  e: [wrist, 1], d: [wrist, -1],
};

window.addEventListener("keydown", (event) => {
  const move = jointKeys[event.key.toLowerCase()];
  if (!move) return;
  const [pivot, direction] = move;
  pivot.rotation.z = THREE.MathUtils.clamp(pivot.rotation.z + direction * 0.08, -1.5, 1.5);
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

renderer.setAnimationLoop(() => renderer.render(scene, camera));
