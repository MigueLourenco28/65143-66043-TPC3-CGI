#version 300 es

precision mediump float;

in  vec4 fColor;
out vec4 fragColor;

in vec3 fPosition; 
in vec3 fNormal;

const vec3 materialAmb = vec3(1.0, 0.0, 0.0); 
const vec3 materialDif = vec3(1.0, 0.0, 0.0); 
const vec3 materialSpe = vec3(1.0, 1.0, 1.0); 
const float shininess = 6.0; 

const vec3 lightAmb = vec3(0.2, 0.2, 0.2); 
const vec3 lightDif = vec3(0.7, 0.7, 0.7); 
const vec3 lightSpe = vec3(1.0, 1.0, 1.0); 

vec3 ambientColor = lightAmb * materialAmb; 
vec3 diffuseColor = lightDif * materialDif; 
vec3 specularColor = lightSpe * materialSpe;

in vec3 fLight; 
in vec3 fViewer;

void main() {
    vec3 L = normalize(fLight); 
    vec3 V = normalize(fViewer); 
    vec3 N = normalize(fNormal); 
    vec3 H = normalize(L+V); 

    float diffuseFactor = max( dot(L,N), 0.0 ); 
    vec3 diffuse = diffuseFactor * diffuseColor; 

    float specularFactor = pow(max(dot(N,H), 0.0), shininess); 
    vec3 specular = specularFactor * specularColor; 

    if( dot(L,N) < 0.0 ) { 
        specular = vec3(0.0, 0.0, 0.0); 
    }

    fragColor = vec4(ambientColor + diffuse + specular, 1.0);
}
