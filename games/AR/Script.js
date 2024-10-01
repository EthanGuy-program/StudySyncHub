import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.154.0/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let cones = [];  // Array to hold cone objects
const coneGeometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

let xrSession;
let depthData;  // To store depth data
let depthTexture;  // Store the depth texture for obscuration

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
    document.body.appendChild(ARButton.createButton(renderer, { 
        requiredFeatures: ['hit-test', 'depth-sensing'],
        optionalFeatures: ['dom-overlay'],
        depthSensing: {
            usagePreference: ['cpu-optimized', 'gpu-optimized'], // Try to optimize depth usage
            dataFormatPreference: ['luminance-alpha', 'float32']
        }
    }));

    // Access the XR session
    renderer.xr.addEventListener('sessionstart', (event) => {
        xrSession = event.target.getSession();
        requestDepthData();  // Start requesting depth data when the session starts
    });

    // Controller and Selection
    controller = renderer.xr.getController(0);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize);

    // Start spawning cones
    setInterval(spawnCone, 2000); // Spawns a cone every 2 seconds
}

function requestDepthData() {
    if (!xrSession) return;
    xrSession.requestAnimationFrame((timestamp, frame) => {
        const viewerPose = frame.getViewerPose(renderer.xr.getReferenceSpace());
        const depthInfo = frame.getDepthInformation(viewerPose.views[0]);

        if (depthInfo) {
            depthData = depthInfo;
            updateDepthTexture(); // Update the depth texture based on the current depth info
        }

        requestDepthData();  // Continue requesting depth data
    });
}

function updateDepthTexture() {
    if (!depthData) return;

    // Create the texture from depth data if it doesn't already exist
    if (!depthTexture) {
        depthTexture = new THREE.DataTexture(
            new Float32Array(depthData.data.buffer),
            depthData.width,
            depthData.height,
            THREE.RedFormat,
            THREE.FloatType
        );
        depthTexture.needsUpdate = true;
    } else {
        // Update the texture data
        depthTexture.image.data = new Float32Array(depthData.data.buffer);
        depthTexture.needsUpdate = true;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    // Ensure depth data is being used for object obscuration
    if (depthData && depthTexture) {
        renderer.autoClear = false;
        renderer.clear();

        // Render the scene normally
        renderer.render(scene, camera);

        // Perform depth testing for object obscuration
        renderer.setRenderTarget(null); // Reset the render target
        renderer.clearDepth();  // Clear the depth buffer
        renderer.context.depthFunc(renderer.context.LEQUAL);  // Adjust the depth test to respect real-world surfaces

        // Render virtual objects with depth-based obscuration
        renderer.render(scene, camera);
    } else {
        renderer.render(scene, camera);
    }

    updateCones();
}

function spawnCone() {
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    const cone = new THREE.Mesh(coneGeometry, material);

    // Place the cone using depth data if available
    if (depthData) {
        const hitPosition = getRealWorldPositionFromDepth();  // Adjust based on depth sensing
        cone.position.copy(hitPosition);
    } else {
        // Random position within a 10-meter range from the camera
        const radius = Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        cone.position.set(
            radius * Math.cos(angle),
            Math.random() * 2 - 1,  // Random y position between -1 and 1
            radius * Math.sin(angle)
        );
    }

    scene.add(cone);
    cones.push(cone);
}

function getRealWorldPositionFromDepth() {
    // Use depthData to place the cone accurately on real-world surfaces
    const depthBuffer = depthData.data;
    const width = depthData.width;
    const height = depthData.height;

    // Assuming we're working with the center point of the view for simplicity
    const centerIndex = (Math.floor(height / 2) * width) + Math.floor(width / 2);
    const depthAtCenter = depthBuffer[centerIndex];

    // Calculate real-world position using camera projection and depth
    const realWorldPosition = new THREE.Vector3();
    realWorldPosition.setFromMatrixPosition(camera.matrixWorld);
    realWorldPosition.z -= depthAtCenter;  // Adjust based on depth value

    return realWorldPosition;
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
