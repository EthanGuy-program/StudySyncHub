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
        }
    }, 500); // Adjust the speed of the progress simulation
}
simulateLoading();
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
    alert('Your browser does not support WebGL');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Vertex Shader
const vsSource = `
    attribute vec4 a_position;
    void main(void) {
        gl_Position = a_position;
    }
`;

// Fragment Shader (Ray Marching)
const fsSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec3 u_lightPosition;
    uniform vec3 u_cameraPosition;

    const int MAX_STEPS = 100;
    const float MAX_DISTANCE = 100.0;
    const float SURFACE_DIST = 0.01;

    float scene(vec3 p) {
        // Example scene with a sphere
        float d = length(p - vec3(0.0, 0.0, 0.0)) - 1.0;
        return d;
    }

    vec3 getNormal(vec3 p) {
        float d = scene(p);
        vec2 e = vec2(0.01, 0.0);
        return normalize(vec3(
            scene(p + e.xyy) - d,
            scene(p + e.yxy) - d,
            scene(p + e.yyx) - d
        ));
    }

    void main(void) {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec3 rayOrigin = u_cameraPosition;
        vec3 rayDir = normalize(vec3(uv - 0.5, -1.0));

        float t = 0.0;
        bool hit = false;
        for (int i = 0; i < MAX_STEPS; i++) {
            vec3 p = rayOrigin + t * rayDir;
            float d = scene(p);
            if (d < SURFACE_DIST) {
                hit = true;
                break;
            }
            t += d;
            if (t > MAX_DISTANCE) break;
        }

        if (hit) {
            vec3 normal = getNormal(rayOrigin + t * rayDir);
            vec3 lightDir = normalize(u_lightPosition - (rayOrigin + t * rayDir));
            float diffuse = max(dot(normal, lightDir), 0.0);
            gl_FragColor = vec4(diffuse, diffuse, diffuse, 1.0);
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
`;

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

// Create Shader Program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0
]);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const resolutionLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
const lightPositionLocation = gl.getUniformLocation(shaderProgram, 'u_lightPosition');
const cameraPositionLocation = gl.getUniformLocation(shaderProgram, 'u_cameraPosition');

gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
gl.uniform3f(lightPositionLocation, 5.0, 5.0, 5.0);
gl.uniform3f(cameraPositionLocation, 0.0, 0.0, 5.0);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

render();