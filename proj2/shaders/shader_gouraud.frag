#version 300 es

precision mediump float;

uniform bool u_use_normals;
in vec3 v_normal;
uniform vec3 u_color;

in vec4 color;

out vec4 fColor;

void main() {

    fColor = color;

    /*
    vec3 c = u_color * (1.0f / 255.0f);

    if(u_use_normals)
        c = 0.5f * (v_normal + vec3(1.0f, 1.0f, 1.0f));

    fColor = vec4(c, 1.0f);
    */
}
