import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight,
    0.1, 1000);

camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x8a2be2 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = -1.5;
scene.add(cube);

const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.x = 1.5;
scene.add(cone);

const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
scene.add(directionalLight);

const control = new OrbitControls(camera, renderer.domElement);

function animate(){
    requestAnimationFrame(animate);
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    cone.rotation.x += 0.005;
    cone.rotation.y += 0.005;

    control.update();
    renderer.render(scene, camera);
}

animate();
