import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.154.0/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let cones = [];  // Array to hold cone objects
const coneGeometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // AR Button
    document.addEventListener('click', () => {
        document.body.appendChild(ARButton.createButton(renderer));
    });

    // Controller and Selection
    controller = renderer.xr.getController(0);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize);

    // Start spawning cones
    setInterval(spawnCone, 2000); // Spawns a cone every 2 seconds
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    updateCones();
    renderer.render(scene, camera);
}

function spawnCone() {
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    const cone = new THREE.Mesh(coneGeometry, material);
    // Random position within a 10-meter range from the camera
    const radius = Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    cone.position.set(
        radius * Math.cos(angle),
        Math.random() * 2 - 1,  // Random y position between -1 and 1
        radius * Math.sin(angle)
    );
    scene.add(cone);
    cones.push(cone);
}

function updateCones() {
    const cameraPosition = camera.position.clone();
    cones.forEach(cone => {
        const directionToCamera = cameraPosition.clone().sub(cone.position).normalize();
        const distanceToCamera = cameraPosition.distanceTo(cone.position);

        // Check if the camera is within the cone's sight range
        if (distanceToCamera < 10) { // Sight range of 10 meters
            cone.lookAt(camera.position); // Make the cone point at the camera
            cone.position.add(directionToCamera.multiplyScalar(0.05)); // Move towards camera

            // Remove the cone if it is too close to the camera
            if (cone.position.distanceTo(cameraPosition) < 0.1) {
                scene.remove(cone);
                cones = cones.filter(c => c !== cone);
            }
        }
    });
}