// Author: Ethan Stucky
// Title: Graphics Final Project: Solar System

precision mediump float;

    varying vec3 vColor;
    uniform sampler2D uTexture;
    varying vec2 vTexcoords;

    void main(void) {

        vec3 materialColor = texture2D(uTexture, vTexcoords).rgb;
        gl_FragColor = vec4(materialColor, 1.0);
    }