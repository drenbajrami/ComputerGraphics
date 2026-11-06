import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

const aspect = window.innerWidth / window.innerHeight;

const perspective = new THREE.PerspectiveCamera(
  75,
  aspect,
  0.1,
  100
);
perspective.position.set(2, 2, 10);
perspective.lookAt(0, 0, 0);

const size = 8;
const orthographic = new THREE.OrthographicCamera(
  -size * aspect,
  size * aspect,
  size,
  -size,
  0.1,
  100
);
orthographic.position.set(0, 0, 10);
orthographic.lookAt(0, 0, 0);

const cameras = [perspective, orthographic];
let current = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(cameras[current], renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const directional = new THREE.DirectionalLight(0xffffff, 3.5);
directional.position.set(5, 8, 4);
scene.add(ambient, directional);

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space") return;

  event.preventDefault();
  if (event.repeat) return;

  current = (current + 1) % cameras.length;
  controls.object = cameras[current];
  controls.update();
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  perspective.aspect = aspect;
  perspective.updateProjectionMatrix();
  orthographic.left = -size * aspect;
  orthographic.right = size * aspect;
  orthographic.updateProjectionMatrix();
  renderer.setSize(width, height);
});

const depths = [0, -3, -8];
const colors = [0x0077be, 0x00ff00, 0xff0000];

new PLYLoader().load(
  new URL("./3dModel.ply", import.meta.url).href,
  (geometry) => {
    geometry.center();

    if (!geometry.hasAttribute("normal")) {
      geometry.computeVertexNormals();
    }

    for (let i = 0; i < depths.length; i++) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.4,
        })
      );

      mesh.scale.setScalar(0.02);
      mesh.rotation.x = Math.PI;
      mesh.position.x = (i - 1) * 2;
      mesh.position.z = depths[i];
      scene.add(mesh);
    }
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, cameras[current]);
}

animate();
