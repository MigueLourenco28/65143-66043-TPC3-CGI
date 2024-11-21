#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_model_view;
uniform mat4 u_normals;

uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient

// Material color
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 lightPos; // Light position

out vec4 color; //color
out vec3 v_normal; // Vetor normal constante

//vec3 L = normalize(); // Light Source
//vec3 N = normalize(); // Normal
//vec3 R = normalie(); // Reflextion

void main() {
    gl_Position = u_projection * u_model_view * a_position;
    v_normal = (u_normals * vec4(a_normal, 0.0f)).xyz;
}
