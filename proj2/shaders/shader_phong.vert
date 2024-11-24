#version 300 es

in vec3 position;
in vec3 normal;
uniform mat4 projection, modelview, normalMat;
out vec3 normalInterp;
out vec3 vertPos;

void main(){
  vec4 vertPos4 = modelview * vec4(position, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;
  normalInterp = vec3(normalMat * vec4(normal, 0.0));
  gl_Position = projection * vertPos4;
}
