#version 300 es

precision mediump float;

const int MAX_LIGHTS = 8;
struct MaterialInfo {
    vec3 Ka;            // Ambient reflection coefficient
    vec3 Kd;            // Diffuse reflection coefficient
    vec3 Ks;            // Specular reflection coefficient
    float shininess;
};

uniform MaterialInfo u_material;

in vec3 Ia;         // Light ambient intensity
in vec3 Id;         // Light diffuse intensity
in vec3 Is;         // Light specular intensity

in vec3 fLight;        // Light vector
in vec3 fViewer;       // Vector to viewer
in vec3 fNormal;       // Surface normal
in vec3 fPosition;     // Vertex position

out vec4 fColor;       // Fragment color

void main() {
  // Material color
  vec3 ambientColor = Ia * u_material.Ka;     // Ia*Ka
  vec3 diffuseColor = Id * u_material.Kd;     // Id*Kd 
  vec3 specularColor = Is * u_material.Ks;    // Is*Ks

  vec3 L = normalize(fLight); 
  vec3 V = normalize(fViewer); 
  vec3 N = normalize(fNormal); 
  vec3 H = normalize(L+V);

  float diffuseFactor = max( dot(L,N), 0.0 ); 
  vec3 diffuse = diffuseFactor * diffuseColor;

  float specularFactor = pow(max(dot(N,H), 0.0), u_material.shininess); 
  vec3 specular = specularFactor * specularColor;

  if(dot(L,N) < 0.0 ) 
    specular = vec3(0.0, 0.0, 0.0); 

  fColor = vec4(ambientColor + diffuse + specular, 1.0);
}