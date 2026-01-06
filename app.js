// Author: Ethan Stucky
// Title: Graphics Final Project: Solar System

'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var lightSphereShaderProgram;

 // this will be created after loading from a file
var skyBoxPosXGeometry = null;
var skyBoxNegXGeometry = null;
var skyBoxPosYGeometry = null;
var skyBoxNegYGeometry = null;
var skyBoxPosZGeometry = null;
var skyBoxNegZGeometry = null;
var sunGeometry = null;
var mercuryGeometry = null;
var venusGeometry = null;
var earthGeometry = null;
var moonGeometry = null;
var marsGeometry = null;
var jupiterGeometry = null;
var saturnGeometry = null;
var saturnRingsGeometry = null;
var uranusGeometry = null;
var neptuneGeometry = null;
var plutoGeometry = null;

var projectionMatrix = new Matrix4();
var uLightPosition = new Vector4(0, 0, 0, 1.0);

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    lightSphereVS: null, lightSphereFS: null,
    sphereJSON: null,
    skyBoxPosX: null,
    skyBoxNegX: null,
    skyBoxPosY: null,
    skyBoxNegY: null,
    skyBoxPosZ: null,
    skyBoxNegZ: null,
    sunImage: null,
    mercuryImage: null,
    venusImage: null,
    dayEarthImage: null,
    moonImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    saturnRingsImage: null,
    uranusImage: null,
    neptuneImage: null,
    plutoImage: null,
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('/shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('/shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('/data/Skybox_Faces/GalaxyTex_PositiveX.png'),
        loadImage('/data/Skybox_Faces/GalaxyTex_NegativeX.png'),
        loadImage('/data/Skybox_Faces/GalaxyTex_PositiveY.png'),
        loadImage('/data/Skybox_Faces/GalaxyTex_NegativeY.png'),
        loadImage('/data/Skybox_Faces/GalaxyTex_PositiveZ.png'),
        loadImage('/data/Skybox_Faces/GalaxyTex_NegativeZ.png'),
        loadImage('/data/sun.jpg'),
        loadImage('/data/Additional_Planets/mercury.jpg'),
        loadImage('/data/Additional_Planets/venus.jpg'),
        loadImage('./data/Earth Day-Night-Clouds/2k_earth_daymap.jpg'),
        loadImage('/data/moon.png'),
        loadImage('/data/Additional_Planets/mars.jpg'),
        loadImage('/data/Additional_Planets/jupiter.jpg'),
        loadImage('/data/Additional_Planets/saturn.jpg'),
        loadImage('/data/Additional_Planets/saturnRings.jpg'),
        loadImage('/data/Additional_Planets/uranus.jpg'),
        loadImage('/data/Additional_Planets/neptune.jpg'),
        loadImage('/data/Additional_Planets/pluto.jpg'),

    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.lightSphereFS = values[2];
        loadedAssets.lightSphereVS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.skyBoxPosX = values[5];
        loadedAssets.skyBoxNegX = values[6];
        loadedAssets.skyBoxPosY = values[7];
        loadedAssets.skyBoxNegY = values[8];
        loadedAssets.skyBoxPosZ = values[9];
        loadedAssets.skyBoxNegZ = values[10];
        loadedAssets.sunImage = values[11];
        loadedAssets.mercuryImage = values[12];
        loadedAssets.venusImage = values[13];
        loadedAssets.dayEarthImage = values[14];
        loadedAssets.moonImage = values[15];
        loadedAssets.marsImage = values[16];
        loadedAssets.jupiterImage = values[17];
        loadedAssets.saturnImage = values[18];
        loadedAssets.saturnRingsImage = values[19];
        loadedAssets.uranusImage = values[20];
        loadedAssets.neptuneImage = values[21];
        loadedAssets.plutoImage = values[22];

    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    lightSphereShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.lightSphereVS, loadedAssets.lightSphereFS);

    lightSphereShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(lightSphereShaderProgram, "aVertexPosition"),
        vertexColorAttribute: gl.getAttribLocation(lightSphereShaderProgram, "aVertexColor"),
        vertexTexcoordsAttribute: gl.getAttribLocation(lightSphereShaderProgram, "aTexcoords"),
    }

    lightSphereShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(lightSphereShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(lightSphereShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(lightSphereShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(lightSphereShaderProgram, "uTexture"),
    }
    
}

// -------------------------------------------------------------------------
function createScene() {

    // -------------------------------------------------------------------- SkyBox PosX creation
    skyBoxPosXGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxPosXGeometry.create(loadedAssets.skyBoxPosX);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationY(90);
    var translation = new Matrix4().makeTranslation(250,0,0,1);

    skyBoxPosXGeometry.worldMatrix.makeIdentity();
    skyBoxPosXGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    // -------------------------------------------------------------------- SkyBox Negx creation
    skyBoxNegXGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxNegXGeometry.create(loadedAssets.skyBoxNegX);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationY(90);
    var translation = new Matrix4().makeTranslation(-250,0,0,1);

    skyBoxNegXGeometry.worldMatrix.makeIdentity();
    skyBoxNegXGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    // -------------------------------------------------------------------- SkyBox PosY creation
    skyBoxPosYGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxPosYGeometry.create(loadedAssets.loadedAssets.saturnRingsImage);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationX(90);
    var translation = new Matrix4().makeTranslation(0,250,0,1);

    skyBoxPosYGeometry.worldMatrix.makeIdentity();
    skyBoxPosYGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    // -------------------------------------------------------------------- SkyBox NegY creation
    skyBoxNegYGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxNegYGeometry.create(loadedAssets.skyBoxNegY);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationX(90);
    var translation = new Matrix4().makeTranslation(0,-250,0,1);

    skyBoxNegYGeometry.worldMatrix.makeIdentity();
    skyBoxNegYGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
    // -------------------------------------------------------------------- SkyBox PosZ creation
    skyBoxPosZGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxPosZGeometry.create(loadedAssets.skyBoxPosZ);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationX(0);
    var translation = new Matrix4().makeTranslation(0,0,250,1);

    skyBoxPosZGeometry.worldMatrix.makeIdentity();
    skyBoxPosZGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
    // -------------------------------------------------------------------- SkyBox NegZ creation
    skyBoxNegZGeometry = new WebGLGeometryQuad(gl, lightSphereShaderProgram);
    skyBoxNegZGeometry.create(loadedAssets.skyBoxNegZ);

    var scale = new Matrix4().makeScale(250.0, 250.0, 250.0);
    var rotation = new Matrix4().makeRotationX(0);
    var translation = new Matrix4().makeTranslation(0,0,-250,1);

    skyBoxNegZGeometry.worldMatrix.makeIdentity();
    skyBoxNegZGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
    // -------------------------------------------------------------------- Sun creation
    sunGeometry = new WebGLGeometryJSON(gl, lightSphereShaderProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    var sunScale = new Matrix4().makeScale(0.1, 0.1, 0.1);
    var sunTranslation = new Matrix4().makeTranslation(0, 0, 0, 1);

    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(sunTranslation).multiply(sunScale);
    // -------------------------------------------------------------------- Mercury creation
    mercuryGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    mercuryGeometry.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);

    var scale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var translation = new Matrix4().makeTranslation(10, 0, 0, 1);

    mercuryGeometry.worldMatrix.makeIdentity();
    mercuryGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- venus creation
    venusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    venusGeometry.create(loadedAssets.sphereJSON, loadedAssets.venusImage);

    var scale = new Matrix4().makeScale(0.027, 0.027, 0.027);
    var translation = new Matrix4().makeTranslation(20, 0, 0, 1);

    venusGeometry.worldMatrix.makeIdentity();
    venusGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- Earth creation
    earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.dayEarthImage);

    var scale = new Matrix4().makeScale(0.03, 0.03, 0.03);
    var translation = new Matrix4().makeTranslation(30, 0, 0, 1);
    var offAxis = new Matrix4().makeRotationZ(24);

    earthGeometry.worldMatrix.makeIdentity();
    earthGeometry.worldMatrix.multiply(translation).multiply(offAxis).multiply(scale);
    // -------------------------------------------------------------------- Moon creation 
    moonGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);

    var scale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var translation = new Matrix4().makeTranslation(5, 0, 0, 1);

    moonGeometry.worldMatrix.makeIdentity();
    moonGeometry.worldMatrix.multiply(translation).multiply(earthGeometry.worldMatrix).multiply(scale);
    // -------------------------------------------------------------------- mars creation
    marsGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    marsGeometry.create(loadedAssets.sphereJSON, loadedAssets.marsImage);

    var scale = new Matrix4().makeScale(0.015, 0.015, 0.015);
    var translation = new Matrix4().makeTranslation(45, 0, 0, 1);

    marsGeometry.worldMatrix.makeIdentity();
    marsGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- Jupiter creation
    jupiterGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    jupiterGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    var scale = new Matrix4().makeScale(0.08, 0.08, 0.08);
    var translation = new Matrix4().makeTranslation(75, 0, 0, 1);

    jupiterGeometry.worldMatrix.makeIdentity();
    jupiterGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- Saturn creation
    saturnGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    saturnGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);

    var scale = new Matrix4().makeScale(0.065, 0.045, 0.065);
    var translation = new Matrix4().makeTranslation(90, 0, 0, 1);

    saturnGeometry.worldMatrix.makeIdentity();
    saturnGeometry.worldMatrix.multiply(translation).multiply(scale);
     // -------------------------------------------------------------------- Saturns Rings creation
     saturnRingsGeometry = new WebGLGeometryJSON(gl, lightSphereShaderProgram);
     saturnRingsGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnRingsImage);
 
     var scale = new Matrix4().makeScale(0.4, 0.001, 0.4);
     var rotation = new Matrix4().makeRotationX(90);
     var translation = new Matrix4().makeTranslation(90, 0, 0, 1);
 
     saturnRingsGeometry.worldMatrix.makeIdentity();
     saturnRingsGeometry.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);
    // -------------------------------------------------------------------- Uranus creation
    uranusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    uranusGeometry.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);

    var scale = new Matrix4().makeScale(0.05, 0.05, 0.05);
    var translation = new Matrix4().makeTranslation(100, 0, 0, 1);

    uranusGeometry.worldMatrix.makeIdentity();
    uranusGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- Neptune creation
    neptuneGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    neptuneGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);

    var scale = new Matrix4().makeScale(0.05, 0.05, 0.05);
    var translation = new Matrix4().makeTranslation(110, 0, 0, 1);

    neptuneGeometry.worldMatrix.makeIdentity();
    neptuneGeometry.worldMatrix.multiply(translation).multiply(scale);
    // -------------------------------------------------------------------- Pluto creation
    plutoGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    plutoGeometry.create(loadedAssets.sphereJSON, loadedAssets.plutoImage);

    var scale = new Matrix4().makeScale(0.0065, 0.0065, 0.0065);
    var translation = new Matrix4().makeTranslation(115, 0, 0, 1);

    plutoGeometry.worldMatrix.makeIdentity();
    plutoGeometry.worldMatrix.multiply(translation).multiply(scale);

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    time.update();
    camera.update(time.deltaTime); 

    // let lightRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 45);
    // let lightSphereTranslation = new Matrix4().makeTranslation(4, 1.5, 0);
    // let lightSphereScale = new Matrix4().makeScale(0.01, 0.01, 0.01);

    // let newLightMatrix = lightRotation.clone().multiply(lightSphereTranslation).multiply(lightSphereScale);

    // sunGeometry.worldMatrix.copy(newLightMatrix);


    // uLightPosition.copy(newLightMatrix.multiplyVector(uLightPosition));

    let sunRotation = new Matrix4().makeRotationY(0.05);
    sunGeometry.worldMatrix.multiply(sunRotation);

    let mercuryTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 80) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(10,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 15)) // Local rotation
    .multiply(new Matrix4().makeScale(.015, .015, .015));
    mercuryGeometry.worldMatrix.copy(mercuryTransform);

    let venusTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 50) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(20,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 5)) // Local rotation
    .multiply(new Matrix4().makeScale(.027, .027, .027));
    venusGeometry.worldMatrix.copy(venusTransform);

    let earthTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 30) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(35,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 100)) // Local rotation
    .multiply(new Matrix4().makeRotationZ(24)) // EXTRA CREDIT: Earth off axis
    .multiply(new Matrix4().makeScale(.03, .03, .03));
    earthGeometry.worldMatrix.copy(earthTransform);

    let moonScale = new Matrix4().makeScale(0.01,0.01,0.01);
    let moonTranslate = new Matrix4().makeTranslation(5,0,0,1)
    let moonRotation = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 105); // Local orbit rotation
    let unScaledEarthTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 30) // Earth orbit rotation
    .multiply(new Matrix4().makeTranslation(35,0,0,1))

    let moonTransform = unScaledEarthTransform
    .multiply(moonRotation)
    .multiply(moonTranslate)
    .multiply(moonScale);
    moonGeometry.worldMatrix.copy(moonTransform);

    let marsTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 15) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(45,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 100)) // Local rotation
    .multiply(new Matrix4().makeScale(.015, .015, .015));
    marsGeometry.worldMatrix.copy(marsTransform);

    let jupiterTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 9) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(75,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 200)) // Local rotation
    .multiply(new Matrix4().makeScale(0.08, 0.08, 0.08));
    jupiterGeometry.worldMatrix.copy(jupiterTransform);

    let saturnTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 7) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(90,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 180)) // Local rotation
    .multiply(new Matrix4().makeScale(0.065, 0.045, 0.065));
    saturnGeometry.worldMatrix.copy(saturnTransform);

    // let saturnRingsTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 7) // solar orbit rotation
    // .multiply(new Matrix4().makeTranslation(90,0,0,1))
    //.multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 180)) // Local rotation
    // .multiply(new Matrix4().makeScale(0.2, 0.001, 0.2));
    // saturnRingsGeometry.worldMatrix.copy(saturnRingsTransform);

    let uranusTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 2) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(100,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * -140)) // Local rotation
    .multiply(new Matrix4().makeScale(0.05, 0.05, 0.05));
    uranusGeometry.worldMatrix.copy(uranusTransform);

    let neptuneTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 1.5) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(110,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 140)) // Local rotation
    .multiply(new Matrix4().makeScale(0.05, 0.05, 0.05));
    neptuneGeometry.worldMatrix.copy(neptuneTransform);

    let plutoTransform = new Matrix4().makeRotationY(time.secondsElapsedSinceStart) // solar orbit rotation
    .multiply(new Matrix4().makeTranslation(115,0,0,1))
    .multiply(new Matrix4().makeRotationY(time.secondsElapsedSinceStart * 5)) // Local rotation
    .multiply(new Matrix4().makeScale(0.0065, 0.0065, 0.0065));
    plutoGeometry.worldMatrix.copy(plutoTransform);

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;

    // camera.lookAt();

    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, uLightPosition.x, uLightPosition.y, uLightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;
    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);

    // skyBoxPosXGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    // skyBoxNegXGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
     skyBoxPosYGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    // skyBoxNegYGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    // skyBoxPosZGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    // skyBoxNegZGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    // mercuryGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // venusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // moonGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // marsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // jupiterGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // saturnGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // uranusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // neptuneGeometry.render(camera, projectionMatrix, phongShaderProgram);
    // plutoGeometry.render(camera, projectionMatrix, phongShaderProgram);

    gl.useProgram(lightSphereShaderProgram);
    sunGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);
    saturnRingsGeometry.render(camera, projectionMatrix, lightSphereShaderProgram);

    
}

// EOF 00100001-10