#version 300 es

const int MAX_LIGHTS = 8;

struct LightInfo { 
    vec4 pos; 
    vec3 Ia;            // Ambient Light Intensity
    vec3 Id;            // Diffuse Light Intensity
    vec3 Is;            // Specular Light Intensity
}; 

struct MaterialInfo {
    vec3 Ka;            // Ambient reflection coefficient
    vec3 Kd;            // Diffuse reflection coefficient
    vec3 Ks;            // Specular reflection coefficient
    float shininess;
};

uniform MaterialInfo u_material;
uniform LightInfo u_light;              // uniform LightInfo u_light[MAX_LIGHTS];


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
    // Material color
    vec3 ambientColor = u_light.Ia * u_material.Ka;     // Ia*Ka
    vec3 diffuseColor = u_light.Id * u_material.Kd;     // Id*Kd 
    vec3 specularColor = u_light.Is * u_material.Ks;    // Is*Ks

    gl_Position = u_projection * u_model_view * a_position;
    v_normal = (u_normals * vec4(a_normal, 0.0f)).xyz;

    //color = vec4(u_light.Ia,1.0);
    color = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}