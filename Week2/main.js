import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';


const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(3, 3, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AxesHelper(3));
renderer.render(scene, camera);


const control = new OrbitControls(camera, renderer.domElement);

const origin = new THREE.Vector3(0, 0, 0);
const a = new THREE.Vector3( 2,1, 0);
const b = new THREE.Vector3(1, 2, 0);

const arrA = new THREE.ArrowHelper(
    a.clone().normalize(), origin, a.length(), 0xE8431C, 0.35, 0.2
);

const arrB = new THREE.ArrowHelper(
    b.clone().normalize(), origin, b.length(), 0x1E40FF, 0.35, 0.2
);

scene.add(arrA, arrB);

const sum = new THREE.Vector3().addVectors(a, b);
const dot = a.dot(b);
const arrSum = new THREE.ArrowHelper(
    sum.clone().normalize(), origin, sum.length(), 0x1CFF3E, 0.35, 0.2
);

scene.add(arrSum);

console.log(`a+b =`, sum, `A dot B =`, dot);

const gui = new GUI();

const params = {
    aX: a.x, aY: a.y, aZ: a.z,
    bX: b.x, bY: b.y, bZ: b.z,
    sum: '',
    dot: '',
    cross: '',
    crossLength: '',
    angle: '' 

}
// folder for vector a
const folderA = gui.addFolder('A');
folderA.add(params, 'aX', -5, 5, 0.1).onChange((value) => { a.x = value; updateVector(); });
folderA.add(params, 'aY', -5, 5, 0.1).onChange((value) => { a.y = value; updateVector(); });
folderA.add(params, 'aZ', -5, 5, 0.1).onChange((value) => { a.z = value; updateVector(); });

// folder for vector b
const folderB = gui.addFolder('B');
folderB.add(params, 'bX', -5, 5, 0.1).onChange((value) => { b.x = value; updateVector(); });
folderB.add(params, 'bY', -5, 5, 0.1).onChange((value) => { b.y = value; updateVector(); });
folderB.add(params, 'bZ', -5, 5, 0.1).onChange((value) => { b.z = value; updateVector(); });

const results = gui.addFolder('Results');
results.add(params, 'sum').name('A + B').listen();
results.add(params, 'dot').name('A dot B').listen();
results.add(params, 'cross').name('A cross B').listen();
results.add(params, 'crossLength').name('|A cross B|').listen();
results.add(params, 'angle').name('Angle (deg)').listen();

function updateVector() {
    // update the arrow helpers
    arrA.setDirection(a.clone().normalize());
    arrA.setLength(a.length(), 0.35, 0.3);
    arrB.setDirection(b.clone().normalize());
    arrB.setLength(b.length(), 0.35, 0.3);

    // update the sum vector
    sum.addVectors(a, b);
    arrSum.setDirection(sum.clone().normalize());
    arrSum.setLength(sum.length(), 0.35, 0.3);

    //dot 
    const dot = a.dot(b);

    const cross = new THREE.Vector3().crossVectors(a, b);
    const crossLength = cross.length();
    const cos = THREE.MathUtils.clamp(dot / (a.length() * b.length()), -1, 1);
    const angle = THREE.MathUtils.radToDeg(Math.acos(cos));

    params.sum = `(${sum.x} ${sum.y} ${sum.z})`;
    params.dot = dot;
    params.cross = `(${cross.x} ${cross.y} ${cross.z})`;
    params.crossLength = crossLength;
    params.angle = angle;
    

    results.controllersRecursive().forEach(controller => { 
        controller.updateDisplay(); 
    });
}

function animate() {
    requestAnimationFrame(animate);
    control.update();
    renderer.render(scene, camera);
}

updateVector();
animate();