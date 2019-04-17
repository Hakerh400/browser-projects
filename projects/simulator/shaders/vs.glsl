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

  vec4 position = projection * camRot * (objRotation * vec4(v * scale, 1.) + vec4(camTrans, 1.));

  float z = position.z;
  z = -log(z + 10.) / 10.;

  gl_Position = vec4(position.xy, z, position.a);
}