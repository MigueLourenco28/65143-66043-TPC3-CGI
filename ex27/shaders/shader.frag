#version 300 es

precision mediump float;

uniform bool u_use_normals;
in vec3 v_normal;
uniform vec3 u_color;

out vec4 color;

void main() {
    vec3 c = u_color * (1.0f / 255.0f);

    if(u_use_normals)
        c = 0.5f * (v_normal + vec3(1.0f, 1.0f, 1.0f));

    color = vec4(c, 1.0f);
}
