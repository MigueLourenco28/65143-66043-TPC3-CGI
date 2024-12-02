#version 300 es
precision mediump int;

const int MAX_LIGHTS = 8;

struct LightInfo { 
    vec4 pos; 
    vec3 Ia;            // Ambient Light Intensity
    vec3 Id;            // Diffuse Light Intensity
    vec3 Is;            // Specular Light Intensity
}; 

uniform LightInfo u_light[MAX_LIGHTS];
uniform int u_numLights;

uniform mat4 u_model_view;      // model-view transformatio
uniform mat4 u_normals;         // model-view transformation
// For normals
uniform mat4 u_view;            // TODO: view transformation
uniform mat4 u_view_normals;    // TODO: view transf. for vectors
uniform mat4 u_projection;      // projection matrix

in vec4 v_position;
in vec4 v_normal; // TODO: Vetor normal constante

out vec3 fNormal;       // normal vector in camera space  
//out vec3 fLights[3]; // Array to pass light vectors
out vec3 fViewer;       // View vector in camera space
out vec3 lightData[MAX_LIGHTS * 2]; //Packed light data - [0]: Ia, [1]: Id, [2]:Is, [3]: Light Vector


void main(){

    vec3 posC = (u_model_view * v_position).xyz;
    fViewer = -posC;

    // compute normal in camera frame 
    fNormal = (u_normals * v_normal).xyz; 

    for (int i = 0; i < u_numLights; i++) {

        lightData[i * 4 + 0] = u_light[i].Ia;
        lightData[i * 4 + 1] = u_light[i].Id;
        lightData[i * 4 + 2] = u_light[i].Is;
    
        // compute light vector in camera frame 
        if(u_light[i].pos.w == 0.0)  
            lightData[i * 4 + 3] = normalize((u_view_normals * u_light[i].pos).xyz); 
        else  
            lightData[i * 4 + 3] = normalize((u_view * u_light[i].pos).xyz - posC);
    }

    gl_Position = u_projection * u_model_view * v_position;
}
