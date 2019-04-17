#define imgTilesPerRow 2.
#define brightnessMin .4

precision mediump float;

uniform vec3 lightDir;
uniform sampler2D texImg;
uniform vec2 texType;

varying vec3 nFrag;
varying vec3 texFrag;

void main(){
  float intensity = (dot(nFrag, -lightDir) + 1.) / 2.;
  float brightness = brightnessMin + intensity * (1. - brightnessMin);

  vec2 tex = texType + texFrag.xy / imgTilesPerRow;

  gl_FragColor = vec4(texture2D(texImg, tex).xyz * brightness, texFrag.z);
}