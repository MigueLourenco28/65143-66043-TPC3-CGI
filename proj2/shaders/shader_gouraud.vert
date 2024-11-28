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
uniform LightInfo u_light; // uniform LightInfo u_light[MAX_LIGHTS];


in vec4 v_position;
in vec4 v_normal; // TODO: Vetor normal constante

uniform mat4 u_model_view;      // model-view transformatio
uniform mat4 u_normals;         // model-view transformation
// For normals
uniform mat4 u_view;            // TODO: view transformation
uniform mat4 u_view_normals;    // TODO: view transf. for vectors
uniform mat4 u_projection;      // projection matrix

out vec4 color;

void main() {
    // Material color
    vec3 ambientColor = u_light.Ia * u_material.Ka;     // Ia*Ka
    vec3 diffuseColor = u_light.Id * u_material.Kd;     // Id*Kd 
    vec3 specularColor = u_light.Is * u_material.Ks;    // Is*Ks

    vec3 posC = (u_model_view * v_position).xyz; // Camera position

    vec3 L;

    if(u_light.pos.w == 0.0)  
       L = normalize((u_view_normals*u_light.pos).xyz); 
    else  
       L = normalize((u_view*u_light.pos).xyz - posC);

    // Eye is at origin in camera frame (see lookAt()) 
    // thus V = -posC (for perspective projection only)
    vec3 V = normalize(-posC);
    vec3 H = normalize(L+V);
    vec3 N = normalize((u_normals*v_normal).xyz);

    float diffuseFactor = max(dot(L,N), 0.0); // Prevent retro-ilumination
    vec3 diffuse = diffuseFactor * diffuseColor;

    float specularFactor = pow(max(dot(N,H), 0.0), u_material.shininess); // Intensity of the specular reflexion
    vec3 specular = specularFactor * specularColor; 

    // If the light is pointing to the back of the surfice
    if(dot(L,N) < 0.0)
        specular = vec3(0.0, 0.0, 0.0);

    gl_Position = u_projection * u_model_view * v_position;

    //color = vec4(u_material.Ka,1.0);
    color = vec4(ambientColor + diffuse + specular, 1.0);
}