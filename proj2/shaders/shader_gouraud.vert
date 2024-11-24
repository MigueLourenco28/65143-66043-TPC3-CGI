#version 300 es

//TODO substituir const para uniform
const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

const vec3 materialAmb = vec3(1.0, 0.0, 0.0);   // Ka - Ambient reflection coefficient
const vec3 materialDif = vec3(1.0, 0.0, 0.0);   // Kd - Diffuse reflection coefficient
const vec3 materialSpe = vec3(1.0, 1.0, 1.0);   // Ks - Specular reflection coefficient
const float shininess = 6.0;

const vec3 lightAmb = vec3(0.2, 0.2, 0.2);  //Ia - Ambient Light Intensity
const vec3 lightDif = vec3(0.7, 0.7, 0.7);  //Id - Diffuse Light Intensity
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);  //Is - Specular Light Intensity

// Material color
vec3 ambientColor = lightAmb * materialAmb;     // Ia*Ka
vec3 diffuseColor = lightDif * materialDif;     // Id*Kd 
vec3 specularColor = lightSpe * materialSpe;    // Is*Ks

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_model_view;
uniform mat4 u_normals;
uniform mat4 u_projection;

out vec4 color;

out vec3 v_normal; // Vetor normal constante

//vec3 L = normalize(); // Light Source
//vec3 N = normalize(); // Normal
//vec3 R = normalie(); // Reflextion

void main() {
    //color =
    gl_Position = u_projection * u_model_view * a_position;
    v_normal = (u_normals * vec4(a_normal, 0.0f)).xyz;
}