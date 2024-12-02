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
uniform LightInfo u_lights[MAX_LIGHTS]; // uniform LightInfo u_light[MAX_LIGHTS];
uniform int u_numLights;


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

    vec3 posC = (u_model_view * v_position).xyz; // Camera position

    vec3 N = normalize((u_normals * v_normal).xyz);
    vec3 V = normalize(-posC);

    vec3 totalAmbient = vec3(0.0);
    vec3 totalDiffuse = vec3(0.0);
    vec3 totalSpecular = vec3(0.0);
    
    for (int i = 0; i < u_numLights; ++i) {

        vec3 L;

        if(u_lights[i].pos.w == 0.0)  
            L = normalize((u_view_normals * u_lights[i].pos).xyz); 
        else  
            L = normalize((u_view * u_lights[i].pos).xyz - posC);

        vec3 H = normalize(L + V);

        float diffuseFactor = max(dot(L,N), 0.0); // Prevent retro-ilumination
        float specularFactor = pow(max(dot(N,H), 0.0), u_material.shininess); // Intensity of the specular reflexion

        vec3 diffuse = diffuseFactor * u_lights[i].Id * u_material.Kd;
        vec3 specular = specularFactor * u_lights[i].Is * u_material.Ks;


        // If the light is pointing to the back of the surface
        if(dot(L,N) < 0.0)
            specular = vec3(0.0, 0.0, 0.0);

        totalAmbient += u_lights[i].Ia * u_material.Ka;
        totalDiffuse += diffuse;
        totalSpecular += specular;
    }

    gl_Position = u_projection * u_model_view * v_position;

    color = vec4(totalAmbient + totalDiffuse + totalSpecular, 1.0);
}