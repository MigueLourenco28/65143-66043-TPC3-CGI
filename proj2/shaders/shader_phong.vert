#version 300 es
precision mediump int;

const int MAX_LIGHTS = 8;

struct LightInfo { 
    vec4 pos; 
    vec3 Ia;            // Ambient Light Intensity
    vec3 Id;            // Diffuse Light Intensity
    vec3 Is;            // Specular Light Intensity
}; 

uniform LightInfo u_lights[MAX_LIGHTS]; // uniform LightInfo u_light[MAX_LIGHTS];
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
out vec3 fLight;        // Light vector in camera space 
out vec3 fViewer;       // View vector in camera space
out vec3 packedLightData[MAX_LIGHTS * 3]; //Packed light data - [0]: Ia, [1]: Id, [2]:Is
/* Used packedLightData to avoid 
"Could not initialise shaders: Statically used varyings do not fit within packing limits. 
(see GLSL ES Specification 1.0.17, p111)"
*/


void main(){

    vec3 posC = (u_model_view * v_position).xyz;
    fViewer = -posC;

    // compute normal in camera frame 
    fNormal = (u_normals * v_normal).xyz; 

    for (int i = 0; i < u_numLights; i++) {

        packedLightData[i * 3 + 0] = u_lights[i].Ia;
        packedLightData[i * 3 + 1] = u_lights[i].Id;
        packedLightData[i * 3 + 2] = u_lights[i].Is;
    
        // compute light vector in camera frame 
        if(u_lights[i].pos.w == 0.0)  
            fLight = normalize((u_view_normals * u_lights[i].pos).xyz); 
        else  
            fLight = normalize((u_view*u_lights[i].pos).xyz - posC);
    }

    gl_Position = u_projection * u_model_view * v_position;
}
