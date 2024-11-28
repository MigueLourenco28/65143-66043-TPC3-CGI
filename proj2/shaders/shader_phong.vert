#version 300 es

const int MAX_LIGHTS = 8;

struct LightInfo { 
    vec4 pos; 
    vec3 Ia;            // Ambient Light Intensity
    vec3 Id;            // Diffuse Light Intensity
    vec3 Is;            // Specular Light Intensity
}; 

uniform LightInfo u_light; // uniform LightInfo u_light[MAX_LIGHTS];

uniform mat4 u_model_view;      // model-view transformatio
uniform mat4 u_normals;         // model-view transformation
// For normals
uniform mat4 u_view;            // TODO: view transformation
uniform mat4 u_view_normals;    // TODO: view transf. for vectors
uniform mat4 u_projection;      // projection matrix

in vec4 v_position;
in vec4 v_normal; // TODO: Vetor normal constante

out vec3 Ia;
out vec3 Id;
out vec3 Is;

out vec3 fNormal;       // normal vector in camera space  
out vec3 fLight;        // Light vector in camera space 
out vec3 fViewer;       // View vector in camera space

void main(){
  
  Ia = u_light.Ia;
  Id = u_light.Id;
  Is = u_light.Is;

  vec3 posC = (u_model_view * v_position).xyz;

  // compute normal in camera frame 
  fNormal = (u_normals * v_normal).xyz; 

  // compute light vector in camera frame 
  if(u_light.pos.w == 0.0)  
      fLight = normalize((u_view_normals * u_light.pos).xyz); 
  else  
      fLight = normalize((u_view*u_light.pos).xyz - posC);

  fViewer = -posC;

  gl_Position = u_projection * u_model_view * v_position;
}
