
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl2');
let cameraPosition = [0, 5, -5];
let cameraOrientation = [0, 0, 0]; // Initialize with default values

let yaw = 0; // Yaw rotation angle
let pitch = 0; // Pitch rotation angle
let lastTime = 0; // For delta time
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

if (!gl) {
    console.error('WebGL 2.0 is not supported');
}

// UnityProgress class
function UnityProgress(dom) {
    this.progress = 0.0;
    this.message = "";
    this.dom = dom;

    var parent = dom.parentNode;

    this.SetProgress = function (progress) { 
        if (this.progress < progress) {
            this.progress = progress; 
        }

        if (progress == 1) {
            this.SetMessage("Preparing...");
            document.getElementById("bgBar").style.display = "none";
            document.getElementById("progressBar").style.display = "none";
        }
        this.Update();
    }

    this.SetMessage = function (message) { 
        this.message = message; 
        this.Update();
    }

    this.Clear = function() {
        document.getElementById("loadingBox").style.display = "none";
    }

    this.Update = function() {
        var length = 200 * Math.min(this.progress, 1);
        var bar = document.getElementById("progressBar");
        bar.style.width = length + "px";
        document.getElementById("loadingInfo").innerHTML = this.message;
    }

    this.Update();
}
// Initialization function
function init() {
    const progress = new UnityProgress(document.getElementById('loadingBox'));

    // Simulate loading process
    function simulateLoading() {
        let progressValue = 0;
        const interval = setInterval(() => {
            progressValue += 0.1; // Increment progress
            progress.SetProgress(progressValue);
            if (progressValue >= 1) {
                clearInterval(interval);
                progress.SetMessage("Complete");
                setTimeout(() => progress.Clear(), 500); // Hide the loading box after a short delay
                render(gl, program);
            }
        }, 500); // Adjust the speed of the progress simulation
    }
    const program = initializeShaders(gl);
    if (!program) return;
    
    setupGeometry(gl, program);

    if (!gl) {
        console.error('WebGL 2.0 is not supported');
        return;
    }
    simulateLoading();
    
}
init();


// Function to get shader source from HTML element
function getShaderSource(id) {
    const shaderScript = document.getElementById(id);
    if (!shaderScript) {
        console.error('Shader script not found:', id);
        return '';
    }
    return shaderScript.text.trim();
}

// Function to compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed with:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Function to create program
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        console.error('Shader creation failed.');
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link failed with:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Initialize shaders and program
function initializeShaders(gl) {
    const vertexShaderSource = getShaderSource('vertex-shader');
    const fragmentShaderSource = getShaderSource('fragment-shader');

    if (!vertexShaderSource || !fragmentShaderSource) {
        console.error('Failed to load shaders.');
        return null;
    }

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
        console.error('Failed to create WebGL program.');
        return null;
    }

    gl.useProgram(program);
    return program;
}

// Calculate rotation matrix from yaw and pitch
function getRotationMatrix(yaw, pitch) {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);

    return new Float32Array([
        cosYaw, 0, sinYaw,
        sinPitch * sinYaw, cosPitch, -sinPitch * cosYaw,
        -sinYaw * cosPitch, sinPitch, cosYaw * cosPitch
    ]);
}


// Resize the canvas to fit the display size
function resizeCanvasToDisplaySize() {
    const devicePixelRatio = window.devicePixelRatio || 1; // Get the device pixel ratio
    const width = canvas.clientWidth * devicePixelRatio; // Adjust width for pixel ratio
    const height = canvas.clientHeight * devicePixelRatio; // Adjust height for pixel ratio

    // Check if canvas size needs updating
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; // Set canvas width
        canvas.height = height; // Set canvas height
        gl.viewport(0, 0, canvas.width, canvas.height); // Adjust WebGL viewport
        return true; // Indicate that the canvas was resized
    }
    return false; // Indicate that the canvas size remains unchanged
}


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
function eulerToRotationMatrix(yaw, pitch, roll) {
    // Assuming yaw, pitch, roll are in radians
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);

    // Rotation matrix components
    return [
        cosYaw * cosPitch, 
        cosYaw * sinPitch * sinRoll - sinYaw * cosRoll, 
        cosYaw * sinPitch * cosRoll + sinYaw * sinRoll,
        
        sinYaw * cosPitch, 
        sinYaw * sinPitch * sinRoll + cosYaw * cosRoll, 
        sinYaw * sinPitch * cosRoll - cosYaw * sinRoll,
        
        -sinPitch, 
        cosPitch * sinRoll, 
        cosPitch * cosRoll
    ];
}

function updateCameraPosition(cameraPosition, cameraOrientation) {
    if (Object.values(keysPressed).includes(true)) {
        const moveAmount = keysPressed.Shift ? 0.2 : 0.1;
        console.log('Initial cameraPosition:', cameraPosition);
        console.log('Initial cameraOrientation:', cameraOrientation);

        let moveDirection = [0, 0, 0];
        if (keysPressed.w) moveDirection[2] += moveAmount; // Move forward
        if (keysPressed.s) moveDirection[2] -= moveAmount; // Move backward
        if (keysPressed.a) moveDirection[0] -= moveAmount; // Move left
        if (keysPressed.d) moveDirection[0] += moveAmount; // Move right
        if (keysPressed.q) moveDirection[1] -= moveAmount; // Move down
        if (keysPressed.e) moveDirection[1] += moveAmount; // Move up

        console.log('Move direction before normalization:', moveDirection);

        const length = Math.sqrt(moveDirection[0] * moveDirection[0] +
                                  moveDirection[1] * moveDirection[1] +
                                  moveDirection[2] * moveDirection[2]);

        if (length > 0) {
            const normalizationFactor = moveAmount / length;
            moveDirection[0] *= normalizationFactor;
            moveDirection[1] *= normalizationFactor;
            moveDirection[2] *= normalizationFactor;
        }

        console.log('Normalized moveDirection:', moveDirection);

        // Convert cameraOrientation from angles to rotation matrix
        const [yaw, pitch, roll] = cameraOrientation;
        const rotationMatrix = eulerToRotationMatrix(yaw, pitch, roll);

        // Apply the rotation matrix to the move direction
        const orientedMoveDirection = [
            moveDirection[0] * rotationMatrix[0] + moveDirection[1] * rotationMatrix[3] + moveDirection[2] * rotationMatrix[6],
            moveDirection[0] * rotationMatrix[1] + moveDirection[1] * rotationMatrix[4] + moveDirection[2] * rotationMatrix[7],
            moveDirection[0] * rotationMatrix[2] + moveDirection[1] * rotationMatrix[5] + moveDirection[2] * rotationMatrix[8]
        ];

        console.log('Oriented moveDirection:', orientedMoveDirection);

        // Update camera position based on orientedMoveDirection
        cameraPosition[0] += orientedMoveDirection[0];
        cameraPosition[1] += orientedMoveDirection[1];
        cameraPosition[2] += orientedMoveDirection[2];

        console.log('Updated cameraPosition:', cameraPosition);
    }
}



// Event listeners for key presses and releases
window.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
    console.log('Key down:', event.key);
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    console.log('Key up:', event.key);
});

// Event listeners for mouse movement
canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;

    const sensitivity = 0.002; // Adjust sensitivity to taste
    yaw += dx * sensitivity;
    pitch -= dy * sensitivity;

    // Constrain pitch to avoid flipping
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});
function isValidNumber(value) {
    return typeof value === 'number' && isFinite(value);
}
function checkWebGLError(gl) {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL Error:', error);
    }
}
// Update uniforms with current values
function updateUniforms(gl, program) {
    const now = performance.now() / 1000;
    const deltaTime = now - lastTime;
    lastTime = now;

    gl.useProgram(program); // Ensure program is active

    const uTimeLocation = gl.getUniformLocation(program, 'u_time');
    const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const uCameraPositionLocation = gl.getUniformLocation(program, 'u_cameraPosition');
    const uCameraOrientationLocation = gl.getUniformLocation(program, 'u_cameraOrientation');

    if (uTimeLocation !== null) {
        gl.uniform1f(uTimeLocation, now);
    } else {
        console.warn('u_time uniform location not found.');
    }

    if (uResolutionLocation !== null) {
        gl.uniform2fv(uResolutionLocation, [canvas.width, canvas.height]);
    } else {
        console.warn('u_resolution uniform location not found.');
    }

    if (uCameraPositionLocation !== null) {
        if (cameraPosition.every(isValidNumber)) {
            gl.uniform3fv(uCameraPositionLocation, cameraPosition);
        } else {
            console.error('Invalid cameraPosition:', cameraPosition);
        }
    } else {
        console.warn('u_cameraPosition uniform location not found.');
    }

    const rotationMatrix = getRotationMatrix(yaw, pitch);
    if (uCameraOrientationLocation !== null) {
        if (rotationMatrix.every(isValidNumber)) {
            gl.uniformMatrix3fv(uCameraOrientationLocation, false, rotationMatrix);
        } else {
            console.error('Invalid rotationMatrix:', rotationMatrix);
        }
    } else {
        console.warn('u_cameraOrientation uniform location not found.');
    }

    console.log('Uniforms Updated:', {
        uTime: now,
        resolution: [canvas.width, canvas.height],
        cameraPosition: cameraPosition,
        rotationMatrix: rotationMatrix
    });

    checkWebGLError(gl); // Check for WebGL errors
}

// Function to set up geometry
function setupGeometry(gl, program) {
    const vertexArray = new Float32Array([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
}

function render(gl, program) {
    resizeCanvasToDisplaySize(); // Resize canvas if necessary
    gl.viewport(0, 0, canvas.width, canvas.height); // Set viewport to match canvas dimensions
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas for the new frame

    updateCameraPosition(cameraPosition, cameraOrientation)

    updateUniforms(gl, program); // Update uniforms with current camera position and orientation

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the scene

    requestAnimationFrame(() => render(gl, program)); // Loop the render function
}



// Gyroscope setup
function handleOrientation(event) {
    const alpha = event.alpha; // Rotation around Z-axis
    const beta = event.beta;   // Rotation around X-axis
    const gamma = event.gamma; // Rotation around Y-axis

    // Convert alpha, beta, gamma to radians
    const alphaRad = alpha * Math.PI / 180;
    const betaRad = beta * Math.PI / 180;
    const gammaRad = gamma * Math.PI / 180;

    // Update yaw and pitch based on gyroscope data
    yaw = gammaRad; // Yaw (rotation around Y-axis)
    pitch = betaRad; // Pitch (rotation around X-axis)
}


// Initialize gyroscope controls
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation);
} else {
    console.warn('DeviceOrientationEvent is not supported');
}

// Initialize and start rendering
const program = initializeShaders(gl);
if (program) {
    setupGeometry(gl, program);
    requestAnimationFrame(() => render(gl, program));
}
