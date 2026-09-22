export const ballVertexShaderSource = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vObjPosition;
out vec3 vWorldPosition;
out vec3 vNormal;
out vec3 vViewDir;

void main() {
  vObjPosition = aPosition;
  vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  vec4 viewPos = uViewMatrix * worldPos;
  vViewDir = normalize(-viewPos.xyz);
  gl_Position = uProjectionMatrix * viewPos;
}
`

const ballFragmentInputs = `
in vec3 vObjPosition;
in vec3 vWorldPosition;
in vec3 vNormal;
in vec3 vViewDir;
out vec4 fragColor;
`

const ballMaterialUniforms = `
uniform float uNoiseScale;
uniform float uNoiseDetail;
uniform float uFuzzStrength;
uniform float uBumpCount;
uniform float uFiberCurl;
uniform float uCavityDepth;
uniform float uSeed;
uniform float uLineWidth;
uniform float uContrast;
uniform float uSmoothing;
uniform vec3 uSeamPoints[48];
uniform vec3 uBaseColor;
uniform vec3 uRimColor;
uniform vec3 uSeamColor;
uniform float uRoughness;
uniform float uSpecularIntensity;
uniform float uNormalIntensity;
uniform float uFuzzWrap;
uniform float uSheenIntensity;
uniform vec3 uLightDir;
uniform float uLightIntensity;
uniform vec3 uRimLightDir;
uniform float uRimIntensity;
uniform float uRimSpread;
uniform float uAmbientIntensity;
`

const proceduralMaterial = `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m *= m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float evaluateFeltFibers(vec3 pNorm, float octaves, float curl) {
  vec3 warp = vec3(
    snoise(pNorm * 2.2 + vec3(uSeed * 3.1)),
    snoise(pNorm * 2.2 + vec3(43.12 + uSeed)),
    snoise(pNorm * 2.2 + vec3(117.5 - uSeed))
  );
  vec3 fiberCoords = pNorm * (uNoiseScale * 26.0 * uBumpCount) + warp * (curl * 1.8) + vec3(uSeed * 5.17);
  float strandNoise = snoise(fiberCoords);
  float microGrain = snoise(fiberCoords * 2.4 + vec3(19.3));
  float macroClump = snoise(pNorm * (uNoiseScale * 6.5) + vec3(uSeed * 1.7));
  float fineTips = 0.0;
  if (octaves >= 3.0) fineTips = snoise(fiberCoords * 5.2 + vec3(81.2)) * 0.25;
  return strandNoise * 0.48 + microGrain * 0.32 + macroClump * 0.20 + fineTips;
}

float getSeamDistance(vec3 p) {
  float minDSq = 999.0;
  for (int i = 0; i < 48; i++) {
    int next = (i + 1 == 48) ? 0 : i + 1;
    vec3 a = uSeamPoints[i];
    vec3 b = uSeamPoints[next];
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec3 d = pa - ba * h;
    minDSq = min(minDSq, dot(d, d));
  }
  return sqrt(minDSq);
}
`

const ballLighting = `
float evaluateHeight(float feltFibers, float seamDist) {
  float trenchWidth = uLineWidth * 1.45;
  float groove = 0.0;
  if (seamDist < trenchWidth) {
    float t = seamDist / trenchWidth;
    groove = -sin((1.0 - t) * 3.14159265 * 0.5) * 0.055;
  }
  return groove + feltFibers * (uFuzzStrength * 0.024);
}

void main() {
  vec3 pObj = normalize(vObjPosition);
  vec2 material = sampleMaterial(pObj);
  float seamDist = material.x;
  float feltFibers = material.y;
#ifdef BAKED_MATERIAL
  // Screen-space height derivatives amplify quantized texels and triangle
  // boundaries at reduced resolution. Keep smooth sphere normals; the baked
  // felt, seam colour and trench shading still supply surface detail.
  vec3 perturbedNormal = normalize(vNormal);
#else
  float h = evaluateHeight(feltFibers, seamDist);
  vec3 dPdx = dFdx(vWorldPosition);
  vec3 dPdy = dFdy(vWorldPosition);
  vec3 perturbedNormal = normalize(vNormal - (dPdx * dFdx(h) + dPdy * dFdy(h)) * (uNormalIntensity * 85.0));
#endif
  float halfWidth = uLineWidth * 0.5;
  float smoothEdge = max(0.003, uSmoothing);
  float seamMask = smoothstep(halfWidth + smoothEdge, halfWidth - smoothEdge, seamDist);
  float trenchMask = smoothstep(uLineWidth * 1.35 + smoothEdge, halfWidth, seamDist);
  float cavityAO = clamp(1.0 - (0.45 - feltFibers * 0.5) * uCavityDepth * 0.65, 0.25, 1.0);
  float fiberTip = clamp((feltFibers + 0.2) * 1.4, 0.0, 1.0);
  vec3 feltColor = mix(uBaseColor * 0.88, uBaseColor * 1.14, fiberTip);
  feltColor *= 1.0 + feltFibers * uFuzzStrength * 0.25;
  feltColor = mix(feltColor, feltColor * 0.55, trenchMask * (1.0 - seamMask) * uContrast);
  float seamRel = clamp(seamDist / halfWidth, 0.0, 1.0);
  vec3 rubberColor = uSeamColor + vec3(sin(seamRel * 3.14159) * 0.14);
  vec3 albedo = mix(feltColor, rubberColor, seamMask);
  float matRoughness = mix(uRoughness, 0.35, seamMask);
  float matSpecular = mix(uSpecularIntensity * 0.22, uSpecularIntensity * 1.35, seamMask);
  vec3 N = normalize(perturbedNormal);
  vec3 V = normalize(vViewDir);
  vec3 L = normalize(uLightDir);
  vec3 rimDirection = normalize(uRimLightDir);
  float NdotV = max(dot(N, V), 0.0);
  float wrap = mix(uFuzzWrap * 0.45, 0.0, seamMask);
  float wrappedDiffuse = clamp((dot(N, L) + wrap) / (1.0 + wrap), 0.0, 1.0);
  vec3 diffuse = albedo * wrappedDiffuse * uLightIntensity;
  vec3 H = normalize(L + V);
  float shininess = mix(14.0, 110.0, 1.0 - matRoughness);
  float specTerm = pow(max(dot(N, H), 0.0), shininess) * matSpecular * max(dot(N, L), 0.0);
  float sheenFresnel = pow(1.0 - NdotV, 3.2);
  vec3 sheen = mix(uBaseColor, vec3(1.0), 0.25) * sheenFresnel * (wrappedDiffuse * 0.75 + 0.25) * uSheenIntensity * (1.0 - seamMask) * uFuzzStrength;
  float rimNdotL = max(dot(N, rimDirection), 0.0);
  float forwardScatter = pow(clamp(dot(V, -rimDirection), 0.0, 1.0), 2.5);
  float rimEdge = pow(1.0 - NdotV, uRimSpread);
  vec3 rimLight = uRimColor * rimEdge * (rimNdotL * 0.8 + forwardScatter * 0.5 + 0.12) * uRimIntensity * (1.0 - seamMask * 0.5);
  vec3 ambient = albedo * uAmbientIntensity * cavityAO;
  vec3 bounce = albedo * max(-N.y * 0.5 + 0.5, 0.0) * 0.16 * vec3(0.9, 0.95, 0.8);
  vec3 finalColor = ambient + diffuse + vec3(specTerm) + sheen + rimLight + bounce;
  finalColor = clamp((finalColor * (2.51 * finalColor + 0.03)) / (finalColor * (2.43 * finalColor + 0.59) + 0.14), 0.0, 1.0);
  fragColor = vec4(finalColor, 1.0);
}
`

export const ballFragmentShaderSource = `#version 300 es
precision highp float;
${ballFragmentInputs}
${ballMaterialUniforms}
${proceduralMaterial}
vec2 sampleMaterial(vec3 p) {
  return vec2(getSeamDistance(p), evaluateFeltFibers(p, uNoiseDetail, uFiberCurl));
}
${ballLighting}
`

// The compact flight shader contains no procedural noise or seam loop. Bake
// those object-space values once; lighting and rotation still run every frame.
export const compactBallFragmentShaderSource = `#version 300 es
#define BAKED_MATERIAL
precision highp float;
${ballFragmentInputs}
${ballMaterialUniforms}
uniform sampler2D uMaterial;
vec2 sampleMaterial(vec3 p) {
  vec2 uv = vec2(atan(p.z, p.x) / 6.28318530718 + 0.5, asin(clamp(p.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
  vec2 material = texture(uMaterial, uv).rg;
  return vec2(material.r * 0.25, material.g * 2.5 - 1.25);
}
${ballLighting}
`

export const materialVertexShaderSource = `#version 300 es
out vec2 vUV;
void main() {
  vUV = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(vUV * 2.0 - 1.0, 0.0, 1.0);
}
`

export const materialFragmentShaderSource = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 fragColor;
${ballMaterialUniforms}
${proceduralMaterial}
void main() {
  float phi = (vUV.x - 0.5) * 6.28318530718;
  float latitude = (vUV.y - 0.5) * 3.14159265359;
  vec3 p = vec3(cos(latitude) * cos(phi), sin(latitude), cos(latitude) * sin(phi));
  float seam = getSeamDistance(p);
  float felt = evaluateFeltFibers(p, uNoiseDetail, uFiberCurl);
  fragColor = vec4(clamp(seam / 0.25, 0.0, 1.0), clamp((felt + 1.25) / 2.5, 0.0, 1.0), 0.0, 1.0);
}
`

export const trailVertexShaderSource = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in float aAlpha;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uPointSize;
out float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec4 viewPos = uViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewPos;
  gl_PointSize = max(1.0, uPointSize * (20.0 / -viewPos.z));
}
`

export const trailFragmentShaderSource = `#version 300 es
precision highp float;
in float vAlpha;
out vec4 fragColor;
uniform vec3 uTrailColor;
uniform float uTrailIntensity;
void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float radius = length(coord) * 2.0;
  if (radius > 1.0) discard;
  float alpha = clamp(exp(-radius * radius * 2.2) * vAlpha * uTrailIntensity, 0.0, 1.0);
  fragColor = vec4(uTrailColor * 1.15, alpha);
}
`
