uniform vec3 camTrans;
uniform mat4 camRot;

uniform mat4 objRotation;
uniform mat4 projection;
uniform float scale;

attribute vec3 v;
attribute vec3 n;
attribute vec3 tex;

varying vec3 nFrag;
varying vec3 texFrag;

void main(){
  nFrag = n;
  texFrag = tex;

  vec4 position = projection * camRot * (objRotation * vec4((v - .5) * scale, 1.) + vec4(camTrans + .5, 1.));

  float z = -log(position.z + 10.) / log(1e3);
  gl_Position = vec4(position.xy, z, position.a);
}