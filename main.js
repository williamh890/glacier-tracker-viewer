
let gl;

function main() {
    const canvas = document.querySelector("#canvas");

    gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    let [vert, frag] = ["", ""];
    let [vDone, fDone] = [false, false];

    fetch('vertex.glsl')
        .then(data => data.text())
        .then(v => vert = v)
        .then(() => {
            fetch('fragment.glsl')
                .then(data => data.text())
                .then(f => frag = f)
                .then(() => {
                    let image = new Image();
                    image.src = "raw-tiff.png"

                    image.onload = () => make(image, vert, frag)
                })
        });
}


function make(image, vert, frag) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vert);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, frag);

    const program = createProgram(gl, vertShader, fragShader);

    var texCoordBuffer = makeImage(program, image);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var maxVelocityLocation = gl.getUniformLocation(program, "max_velocity");
    var deltaLocation = gl.getUniformLocation(program, "delta");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    let maxVelSlider = document.getElementById("maxVelocity");
    let deltaSlider = document.getElementById("delta");
    gl.uniform1f(maxVelocityLocation, maxVelSlider.value);
    gl.uniform1f(deltaLocation, delta.value);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset)

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    maxVelSlider.addEventListener("mouseup", e => {
        console.log(maxVelSlider.value);
        gl.uniform1f(maxVelocityLocation, maxVelSlider.value);

        gl.drawArrays(primitiveType, offset, count);
    });

    deltaSlider.addEventListener("mouseup", e => {
        console.log(deltaSlider.value);
        gl.uniform1f(deltaLocation, deltaSlider.value);

        gl.drawArrays(primitiveType, offset, count);
    });

}

function makeImage(program, image) {
    // look up where the texture coordinates need to go.
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    return texCoordBuffer;
}


function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

