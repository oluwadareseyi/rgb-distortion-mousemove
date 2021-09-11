uniform vec2 uOffset;

varying vec2 vUv;

void main () {
  vUv = uv;

  vec3 newPosition = position;

  vec4 projectedPosition = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  gl_Position = projectedPosition;
}