// Author: Ethan Stucky
// Title: Graphics Final Project: Solar System

precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // diffuse contribution
    // todo #1 normalize the light direction and store in a separate variable
    // vec3 normalizedLightDir = normalize(uLightPosition);
    vec3 normalizedLightDir = normalize(uLightPosition - vWorldPosition);

    // todo #2 normalize the world normal and store in a separate variable
    vec3 normalizedWorldNormal = normalize(vWorldNormal);

    // todo #3 calculate the lambert term
    float lambertTerm = max(dot(normalizedWorldNormal, normalizedLightDir), 0.0); //0.0 for no negative light
    
    // specular contribution
    // todo #4 in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 eyeVector = normalize(uCameraPosition - vWorldPosition);

    // todo #5 in world space, calculate the reflection vector (normalized)
    vec3 reflectionVector = normalize(2.0 * dot(normalizedLightDir, normalizedWorldNormal) * normalizedWorldNormal - normalizedLightDir);

    // todo #6 calculate the phong term
    float specularTerm = pow(max(dot(eyeVector, reflectionVector), 0.0), 64.0); //dot product for camera view and reflection vector alignment, max/0.0 for no negative values, 64.0 for sharpness

    // combine
    // todo #7 apply light and material interaction for diffuse value by using the texture color as the material
    vec3 materialColor = texture2D(uTexture, vTexcoords).rgb; //fetching pixel color for each pixel at vTexcoords

    // todo #8 apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    vec3 specularMaterialColor = vec3(0.3, 0.3, 0.3);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);  // light color can remain constant

    vec3 ambient = materialColor * 0.1; //indirect light from the environment so unlit surfaces aren't completely dark
    vec3 diffuseColor = materialColor * lambertTerm; //surfaces facing light appear brighter
    vec3 specularColor = specularMaterialColor * specularTerm; //adds shine

    // todo #9
    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = diffuseColor; // + ambient // + specularColor;

    gl_FragColor = vec4(finalColor, 1.0); //1.0 for fully opaque
}

// EOF 00100001-10
