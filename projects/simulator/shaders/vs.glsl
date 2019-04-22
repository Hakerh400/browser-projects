uniform vec3 camTrans;
uniform mat4 camRot;

uniform mat4 objRotation;
uniform mat4 projection;
uniform float scale, k;

attribute vec3 v1, v2;
attribute vec3 n1, n2;
attribute vec2 tex;

varying vec3 nFrag;
varying vec2 texFrag;

void main(){
  float k1 = 1. - k;
  vec3 v = v1 * k1 + v2 * k;
  vec3 n = n1 * k1 + n2 * k;

  nFrag = (objRotation * vec4(n, 1.)).xyz;
  texFrag = tex;

  vec4 position = projection * camRot * (objRotation * vec4(v * scale, 1.) + vec4(camTrans, 1.));

  float z = position.z;
  z = z > -10. ? -log(z + 10.) / 10. : -1.;

  gl_Position = vec4(position.xy, z, position.a);
}