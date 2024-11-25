#version 300 es

//TODO substituir const para uniform
const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

// Reflectance properties of the material
const vec3 materialAmb = vec3(1.0, 0.0, 0.0);   // Ka - Ambient reflection coefficient
const vec3 materialDif = vec3(1.0, 0.0, 0.0);   // Kd - Diffuse reflection coefficient
const vec3 materialSpe = vec3(1.0, 1.0, 1.0);   // Ks - Specular reflection coefficient
const float shininess = 6.0;

// Intensity of the light source
const vec3 lightAmb = vec3(0.2, 0.2, 0.2);  //Ia - Ambient Light Intensity
const vec3 lightDif = vec3(0.7, 0.7, 0.7);  //Id - Diffuse Light Intensity
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);  //Is - Specular Light Intensity

// Material color
vec3 ambientColor = lightAmb * materialAmb;     // Ia*Ka
vec3 diffuseColor = lightDif * materialDif;     // Id*Kd 
vec3 specularColor = lightSpe * materialSpe;    // Is*Ks

in vec4 v_position;
in vec4 v_normal;// Vetor normal constante

uniform mat4 mModelView;// model-view transformation 
uniform mat4 mNormals;  // model-view transformation  

uniform mat4 mView;         // view transformation 
uniform mat4 mViewNormals;  // view transf. for vectors 
uniform mat4 mProjection;   // projection matrix

out vec4 fColor;

//vec3 L = normalize(); // Light Source
//vec3 N = normalize(); // Normal
//vec3 R = normalie(); // Reflextion

void main() {

    // position in camera frame
    vec3 c_position = (mModelView * v_position).xyz;

    vec3 L; // Normalized vector pointing to light at vertex
    if(lightPosition.w == 0.0)
        L = normalize((mViewNormals*lightPosition).xyz);
    else
        L = normalize((mView*lightPosition).xyz - c_position);

    // normal vectors are transformed to camera frame using a  
    // a matrix derived from mModelView (see MV.js code)
    vec3 N = normalize((mNormals * v_normal).xyz);

    // Eye is at origin in camera frame (see lookAt()) 
    // thus V = -posC (for perspective projection only) 
    vec3 V = normalize(-c_position);
    // TODO: Projeção paralela com as projetantes alinhadas com o eixo Z
    // vec3 V = vec3(0,0,1); // Point towards the viewer located at (0,0,+inf)

    vec3 R = reflect(-L,N);

    vec3 H = normalize(L+V);

    //A reflexão difusa é máxima quando a luz incide perpendicularmente à superfície
    //max: Impede retro-iluminação!
    float diffuseFactor = max( dot(L,N), 0.0 ); 
    vec3 diffuse = diffuseFactor * diffuseColor; 

    float specularFactor = pow(max(dot(N,H), 0.0), shininess); //intensidade da reflexão especular
    vec3 specular = specularFactor * specularColor; //specularColor tem o valor previamente calculado de Is * Ks

    //No caso da luz estar a incidir no 
    //lado de trás da face, não há 
    //qualquer reflexão especular.
    if( dot(L,N) < 0.0 ) { 
        specular = vec3(0.0, 0.0, 0.0); 
    }

    fColor = vec4(ambientColor + diffuse + specular, 1.0); 
}