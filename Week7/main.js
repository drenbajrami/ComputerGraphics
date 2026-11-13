import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
const canvas = renderer.domElement;
document.body.appendChild(canvas);

const controls = new OrbitControls(camera, canvas);
const ambient = new THREE.AmbientLight(0xffffff, 0.75);
const directional = new THREE.DirectionalLight(0xffffff, 2.5);
directional.position.set(4, 6, 5);
scene.add(ambient, directional);

const gridSize = 20;
scene.add(new THREE.GridHelper(gridSize, gridSize));


const geometries = [


  new THREE.BoxGeometry(1, 1, 1),
  new THREE.ConeGeometry(0.6, 1.4, 32),
  new THREE.CylinderGeometry(0.5, 0.5, 1.1, 32),
  new THREE.TorusGeometry(0.5, 0.2, 16, 32),
];
const colors = [0xff5733, 0x2ecc71, 0x3498db, 0x9b59b6];
const pickables = [];

for (let i = 0; i < geometries.length; i++) {
  const geometry = geometries[i];
  geometry.computeBoundingBox();
  const material = new THREE.MeshStandardMaterial({ color: colors[i] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-4.5 + i * 3, -geometry.boundingBox.min.y, 0);
  scene.add(mesh);
  pickables.push(mesh);
}

const initialPositions = pickables.map(object => object.position.clone());
const initialScales = pickables.map(object => object.scale.clone());

const pointer = new THREE.Vector2();

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();
let selected = null;
let dragPointer = null;

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = 2 * (event.clientX - rect.left) / rect.width - 1;
  pointer.y = 1 - 2 * (event.clientY - rect.top) / rect.height;
  return pointer;
}

function select(object) {
  if (selected) selected.material.emissive.setHex(0x000000);
  selected = object;
  if (selected) selected.material.emissive.setHex(0x882200);
}


canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !event.isPrimary || dragPointer !== null) return;

  raycaster.setFromCamera(updatePointer(event), camera);
  const [hit] = raycaster.intersectObjects(pickables);
  select(hit ? hit.object : null);

  if (!selected) return;

  controls.enabled = false;
  dragPointer = event.pointerId;
  canvas.setPointerCapture(dragPointer);
}, true);

canvas.addEventListener('pointermove', (event) => {
  if (event.pointerId !== dragPointer) return;

  raycaster.setFromCamera(updatePointer(event), camera);
  if (!raycaster.ray.intersectPlane(plane, intersection)) return;

  const bounds = selected.geometry.boundingBox;
  const half = gridSize / 2;
  selected.position.x = THREE.MathUtils.clamp(
    intersection.x,
    -half - bounds.min.x,
    half - bounds.max.x
  );
  selected.position.z = THREE.MathUtils.clamp(
    intersection.z,
    -half - bounds.min.z,
    half - bounds.max.z
  );
});

function finishPointer(event) {
  if (event.pointerId !== dragPointer) return;

  dragPointer = null;
  controls.enabled = true;
}

canvas.addEventListener('pointerup', finishPointer);
canvas.addEventListener('pointercancel', finishPointer);
canvas.addEventListener('lostpointercapture', finishPointer);

const gui = new GUI();
gui.add({
  reset() {
    for (let i = 0; i < pickables.length; i++) {
      pickables[i].position.copy(initialPositions[i]);
      pickables[i].scale.copy(initialScales[i]);
    }
  },
}, 'reset').name('Reset positions and scales');

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
