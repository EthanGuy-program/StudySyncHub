// Movement.js

// Initialize key states
const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    q: false,
    Shift: false
};

// Update camera position based on pressed keys
function updateCameraPosition(cameraPosition, cameraOrientation) {
    const moveAmount = keysPressed.Shift ? 0.2 : 0.1; // Sprinting or normal speed

    const moveDirection = [0, 0, 0];
    if (keysPressed.w) moveDirection[2] += moveAmount; // Forward
    if (keysPressed.s) moveDirection[2] -= moveAmount; // Backward
    if (keysPressed.a) moveDirection[0] -= moveAmount; // Left
    if (keysPressed.d) moveDirection[0] += moveAmount; // Right
    if (keysPressed.e) moveDirection[1] += moveAmount; // Up
    if (keysPressed.q) moveDirection[1] -= moveAmount; // Down

    cameraPosition = cameraPosition.map((pos, index) => pos + moveDirection[index]);

    // Example collision detection: prevent moving out of bounds
    if (cameraPosition[0] > -10 && cameraPosition[0] < 10 &&
        cameraPosition[1] > -10 && cameraPosition[1] < 10 &&
        cameraPosition[2] > -10 && cameraPosition[2] < 10) {
        // Update uniforms or other camera-related logic here
    }
}

// Event listeners for key presses and releases
window.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});
