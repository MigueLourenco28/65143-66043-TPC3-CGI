#version 300 es

precision mediump float;
precision mediump int;


const int MAX_LIGHTS = 8;
struct MaterialInfo {
    vec3 Ka;            // Ambient reflection coefficient
    vec3 Kd;            // Diffuse reflection coefficient
    vec3 Ks;            // Specular reflection coefficient
    float shininess;
};

uniform MaterialInfo u_material;
uniform int u_numLights;

in vec3 fLight;        // Light vector
in vec3 fViewer;       // Vector to viewer
in vec3 fNormal;       // Surface normal
in vec3 fPosition;     // Vertex position
in vec3 packedLightData[MAX_LIGHTS * 3]; // Packed light data

out vec4 fColor;       // Fragment color

void main() {

  vec3 ambient = vec3(0.0); 
  vec3 diffuse = vec3(0.0); 
  vec3 specular = vec3(0.0);

  vec3 N = normalize(fNormal); 
  vec3 V = normalize(fViewer);

  for (int i = 0; i < u_numLights; i++) {

    vec3 Ia = packedLightData[i * 3 + 0]; 
    vec3 Id = packedLightData[i * 3 + 1]; 
    vec3 Is = packedLightData[i * 3 + 2];

    vec3 L = normalize(fLight); 
    vec3 H = normalize(L + V);

    ambient += Ia * u_material.Ka; 
    float diffuseFactor = max(dot(L, N), 0.0); 
    diffuse += diffuseFactor * Id * u_material.Kd; 
    float specularFactor = pow(max(dot(N, H), 0.0), u_material.shininess); 
    specular += specularFactor * Is * u_material.Ks;


    if(dot(L,N) < 0.0 ) 
      specular = vec3(0.0, 0.0, 0.0); 

  }
  
  fColor = vec4(ambient + diffuse + specular, 1.0);
}