#define imgTilesPerRow 1.

precision mediump float;

uniform vec3 lightDir;
uniform sampler2D texImg;
uniform vec2 texType;

varying vec3 nFrag;
varying vec3 texFrag;

void main(){
  float brightness = .75 + dot(nFrag, -lightDir) * .25;

  //vec2 tex = texType + texFrag.xy / imgTilesPerRow;
  vec2 tex = vec2(.25, .25);

  gl_FragColor = vec4(texture2D(texImg, tex).xyz * brightness, texFrag.z);
}