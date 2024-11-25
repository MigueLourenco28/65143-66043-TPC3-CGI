#version 300 es

precision mediump float;

in vec3 v_normal;

out vec4 color;

uniform vec4 u_color;

void main() {
    color = u_color;
}
