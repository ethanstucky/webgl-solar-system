 // Author: Ethan Stucky
// Title: Graphics Final Project: Solar System
 
 attribute vec3 aVertexPosition;
	attribute vec3 aVertexColor;

    uniform mat4 uWorldMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    attribute vec2 aTexcoords;
    varying vec2 vTexcoords;

    void main(void) {
        gl_Position =
            uProjectionMatrix *
            uViewMatrix *
            uWorldMatrix *
            vec4(aVertexPosition, 1.0); // treat the vertex as a point, multiply right to left

       vTexcoords = aTexcoords;
    }