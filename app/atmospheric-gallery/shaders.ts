export const backgroundVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const backgroundFragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform vec3 uBackgroundColor;
  uniform vec3 uBlob1Color;
  uniform vec3 uBlob2Color;
  uniform float uNoiseStrength;
  uniform float uBlobRadius;
  uniform float uBlobRadiusSecondary;
  uniform float uBlobStrength;
  uniform float uTime;
  uniform float uVelocityIntensity;

  float random(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 color = uBackgroundColor;
    float animTime = uTime * 0.00028;

    vec2 blob1Center = vec2(
      0.30 + sin(animTime * 0.73) * 0.07,
      0.66 + cos(animTime * 0.51) * 0.06
    );
    vec2 blob2Center = vec2(
      0.74 + cos(animTime * 0.61) * 0.08,
      0.33 + sin(animTime * 0.79) * 0.06
    );

    float blob1 = smoothstep(uBlobRadius, 0.0, distance(vUv, blob1Center));
    float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(vUv, blob2Center));
    vec3 blob1SoftColor = mix(uBlob1Color, uBackgroundColor, 0.35);
    vec3 blob2SoftColor = mix(uBlob2Color, uBackgroundColor, 0.35);

    color = mix(color, blob1SoftColor, blob1 * uBlobStrength);
    color = mix(color, blob2SoftColor, blob2 * uBlobStrength * 0.92);
    color += uVelocityIntensity * 0.10;

    float grain = (random(vUv + mod(uTime, 1000.0)) - 0.5) * uNoiseStrength;
    color += grain;
    gl_FragColor = vec4(color, 1.0);
  }
`;
