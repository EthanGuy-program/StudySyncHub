let frag1 = `
      #version 300 es
      precision highp float;

      uniform vec2 u_resolution;
      uniform float u_time;
`;
let frag2 = `
      uniform vec3 u_cameraPosition;
      uniform mat3 u_cameraOrientation;

      out vec4 fragColor;

`;
let frag3 = `
      float boxSDF(vec3 p, vec3 b) {
          vec3 d = abs(p) - b;
          return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
      }

`;
let frag4 = `
      float map(vec3 p) {
          vec3 q = mod(p, 2.0) - 1.0;
          return boxSDF(q, vec3(0.5));
      }

`;
let frag5 = `
      vec3 getNormal(vec3 p) {
          const float eps = 0.001;
          vec2 e = vec2(1.0, -1.0) * eps;
          return normalize(e.xyy * map(p + e.xyy) +
                           e.yyx * map(p + e.yyx) +
`;
let frag6 = `
                           e.yxy * map(p + e.yxy) +
                           e.xxx * map(p + e.xxx));
      }

      vec3 raymarch(vec3 ro, vec3 rd) {
`;
let frag7 = `
          float totalDist = 0.0;
          const int maxSteps = 100;
          const float maxDist = 100.0;
          const float surfaceDist = 0.001;

`;
let frag8 = `
          for (int i = 0; i < maxSteps; i++) {
              vec3 p = ro + totalDist * rd;
              float dist = map(p);
              totalDist += dist;
              if (dist < surfaceDist || totalDist > maxDist) break;
`;
let frag9 = `
          }

          vec3 p = ro + totalDist * rd;
          vec3 normal = getNormal(p);
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
`;
let frag10 = `
          float diffuse = max(dot(normal, lightDir), 0.0);

          return vec3(diffuse);
      }

`;
let frag11 = `
      void main() {
          vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
          vec3 ro = u_cameraPosition;
          vec3 rd = normalize(u_cameraOrientation * vec3(uv, 1.0));

`;
let frag12 = `
          vec3 color = raymarch(ro, rd);

          // Apply time-based effects
          color *= (u_time / max(u_time, 2.0));

`;
let frag13 = `
          fragColor = vec4(color, 1.0);
      }
`;
