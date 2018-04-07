
// an attribute will receive data from a buffer
attribute vec4 a_position;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;

// all shaders have a main function
void main() {

    v_texCoord = a_texCoord;

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
}
