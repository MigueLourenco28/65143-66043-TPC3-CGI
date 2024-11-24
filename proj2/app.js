import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { length, flatten, inverse, mult, normalMatrix, perspective, lookAt, vec4, vec3, vec2, subtract, add, scale, rotate, normalize } from '../../libs/MV.js';

import * as dat from '../../libs/dat.gui.module.js';

import * as COW from '../../libs/objects/cow.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as CUBE from '../../libs/objects/cube.js';

import * as STACK from '../../libs/stack.js';

let currentShader = 'gouraud';

function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');
    const gl = setupWebGL(canvas);

    COW.init(gl);
    BUNNY.init(gl);
    CUBE.init(gl);

    let program;
    if(currentShader == 'gouraud')
        program = buildProgramFromSources(gl, shaders['shader_gouraud.vert'], shaders['shader_gouraud.frag']);
    else
        program = buildProgramFromSources(gl, shaders['shader_phong.vert'], shaders['shader_phong.frag']);

    //------------------Camera Settings GUI------------------//

    // Camera  
    let camera = {
        eye: vec3(0, 0, 5),
        at: vec3(0, 0, 0),
        up: vec3(0, 1, 0),
        fovy: 45,
        aspect: 1, // Updated further down
        near: 0.1,
        far: 20
    }

    let options = {
        wireframe: false,
        normals: true
    }

    let worldLight = {
        position: vec3(0.0, 0.0, 5.0),
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    let cameraLight = {
        position: vec3(0.0, 0.0, 5.0),
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    let objectLight = {
        position: vec3(0.0, 0.0, 5.0),
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "wireframe");
    optionsGui.add(options, "normals");

    const cameraGui = gui.addFolder("camera");

    cameraGui.add(camera, "fovy").min(1).max(179).step(1).listen();
    cameraGui.add(camera, "aspect").min(0).max(10).step(0.01).listen().domElement.style.pointerEvents = "none";

    cameraGui.add(camera, "near").min(0.1).max(20).step(0.01).listen().onChange(function (v) {
        camera.near = Math.min(camera.far - 0.5, v);
    });

    cameraGui.add(camera, "far").min(0.1).max(20).step(0.01).listen().onChange(function (v) {
        camera.far = Math.max(camera.near + 0.5, v);
    });

    const eye = cameraGui.addFolder("eye");
    eye.add(camera.eye, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const at = cameraGui.addFolder("at");
    at.add(camera.at, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const up = cameraGui.addFolder("up");
    up.add(camera.up, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const lightsGui = gui.addFolder("lights");

    const worldLightGui = lightsGui.addFolder("world light");
    const worldLightPositionGui = worldLightGui.addFolder("position");
    worldLightPositionGui.add(worldLight.position, 0).name("x").step(0.05).listen();
    worldLightPositionGui.add(worldLight.position, 1).name("y").step(0.05).listen();
    worldLightPositionGui.add(worldLight.position, 2).name("z").step(0.05).listen();
    worldLightGui.addColor(worldLight, "ambient").listen();
    worldLightGui.addColor(worldLight, "diffuse").listen();
    worldLightGui.addColor(worldLight, "specular").listen();
    worldLightGui.add(worldLight, "directional").listen();
    worldLightGui.add(worldLight, "active").listen();

    const cameraLightGui = lightsGui.addFolder("camera light");
    const cameraLightPositionGui = cameraLightGui.addFolder("position");
    cameraLightPositionGui.add(cameraLight.position, 0).name("x").step(0.05).listen();
    cameraLightPositionGui.add(cameraLight.position, 1).name("y").step(0.05).listen();
    cameraLightPositionGui.add(cameraLight.position, 2).name("z").step(0.05).listen();
    cameraLightGui.addColor(cameraLight, "ambient").listen();
    cameraLightGui.addColor(cameraLight, "diffuse").listen();
    cameraLightGui.addColor(cameraLight, "specular").listen();
    cameraLightGui.add(cameraLight, "directional").listen();
    cameraLightGui.add(cameraLight, "active").listen();

    const objectLightGui = lightsGui.addFolder("object light");
    const objectLightPositionGui = objectLightGui.addFolder("position");
    objectLightPositionGui.add(objectLight.position, 0).name("x").step(0.05).listen();
    objectLightPositionGui.add(objectLight.position, 1).name("y").step(0.05).listen();
    objectLightPositionGui.add(objectLight.position, 2).name("z").step(0.05).listen();
    objectLightGui.addColor(objectLight, "ambient").listen();
    objectLightGui.addColor(objectLight, "diffuse").listen();
    objectLightGui.addColor(objectLight, "specular").listen();
    objectLightGui.add(objectLight, "directional").listen();
    objectLightGui.add(objectLight, "active").listen();

    //------------------Camera Settings GUI------------------//

    //------------------Object Settings GUI------------------//
    const objectGui = new dat.GUI();
    objectGui.domElement.style.position = "absolute"; //Position GUI to the left

    let object_data = {
        name: 'Cow',
        position: vec3(0.0, 0.0, 0.0),
        rotation: vec3(0, -90, 0),
        scale: vec3(1.0, 1.0, 1.0),
    }

    let material = {
        shader: 'gouraud',
        Ka: vec3(0.2, 0.2, 0.2),
        Kd: vec3(0.8, 0.8, 0.8),
        Ks: vec3(0.0, 0.0, 0.0),
        shininess: 100,
    }

    objectGui.add(object_data, 'name', ['Cow', 'Bunny']).name('name');

    const transformGui = objectGui.addFolder("transform");

    const positionGui = transformGui.addFolder("position");
    positionGui.add(object_data.position, 0).name("x").min(-1.0).max(1.0).step(0.05).listen();;
    positionGui.add(object_data.position, 1).name("y").listen().domElement.style.pointerEvents = "none";;
    positionGui.add(object_data.position, 2).name("z").min(-1.0).max(1.0).step(0.05).listen();;

    const rotationGui = transformGui.addFolder("rotation");
    rotationGui.add(object_data.rotation, 0).name("x").min(-1.0).max(1.0).step(0.05).listen();;
    rotationGui.add(object_data.rotation, 1).name("y").listen().domElement.style.pointerEvents = "none";;
    rotationGui.add(object_data.rotation, 2).name("z").min(-1.0).max(1.0).step(0.05).listen();;

    const scaleGui = transformGui.addFolder("scale");
    scaleGui.add(object_data.scale, 0).name("x").min(-1.0).max(1.0).step(0.05).listen();;
    scaleGui.add(object_data.scale, 1).name("y").listen().domElement.style.pointerEvents = "none";;
    scaleGui.add(object_data.scale, 2).name("z").min(-1.0).max(1.0).step(0.05).listen();;

    const materialGui = objectGui.addFolder("material");

    materialGui.add(material, "shader", ['phong', 'gouraud']).name('shader').listen();
    materialGui.addColor(material, "Ka").listen();
    materialGui.addColor(material, "Kd").listen();
    materialGui.addColor(material, "Ks").listen();
    materialGui.add(material, "shininess").min(0).max(100).step(1).listen();
    currentShader = material.shader;

    //------------------Object Settings GUI------------------//

    // matrices
    let mView, mProjection;

    let down = false;
    let lastX, lastY;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resizeCanvasToFullWindow();

    window.addEventListener('resize', resizeCanvasToFullWindow);

    window.addEventListener('wheel', function (event) {


        if (!event.altKey && !event.metaKey && !event.ctrlKey) { // Change fovy
            const factor = 1 - event.deltaY / 1000;
            camera.fovy = Math.max(1, Math.min(100, camera.fovy * factor));
        }
        else if (event.metaKey || event.ctrlKey) {
            // move camera forward and backwards (shift)

            const offset = event.deltaY / 1000;

            const dir = normalize(subtract(camera.at, camera.eye));

            const ce = add(camera.eye, scale(offset, dir));
            const ca = add(camera.at, scale(offset, dir));

            // Can't replace the objects that are being listened by dat.gui, only their properties.
            camera.eye[0] = ce[0];
            camera.eye[1] = ce[1];
            camera.eye[2] = ce[2];

            if (event.ctrlKey) {
                camera.at[0] = ca[0];
                camera.at[1] = ca[1];
                camera.at[2] = ca[2];
            }
        }
    });

    function inCameraSpace(m) {
        const mInvView = inverse(mView);

        return mult(mInvView, mult(m, mView));
    }

    canvas.addEventListener('mousemove', function (event) {
        if (down) {
            const dx = event.offsetX - lastX;
            const dy = event.offsetY - lastY;

            if (dx != 0 || dy != 0) {
                // Do something here...

                const d = vec2(dx, dy);
                const axis = vec3(-dy, -dx, 0);

                const rotation = rotate(0.5 * length(d), axis);

                let eyeAt = subtract(camera.eye, camera.at);
                eyeAt = vec4(eyeAt[0], eyeAt[1], eyeAt[2], 0);
                let newUp = vec4(camera.up[0], camera.up[1], camera.up[2], 0);

                eyeAt = mult(inCameraSpace(rotation), eyeAt);
                newUp = mult(inCameraSpace(rotation), newUp);

                console.log(eyeAt, newUp);

                camera.eye[0] = camera.at[0] + eyeAt[0];
                camera.eye[1] = camera.at[1] + eyeAt[1];
                camera.eye[2] = camera.at[2] + eyeAt[2];

                camera.up[0] = newUp[0];
                camera.up[1] = newUp[1];
                camera.up[2] = newUp[2];

                lastX = event.offsetX;
                lastY = event.offsetY;
            }

        }
    });

    canvas.addEventListener('mousedown', function (event) {
        down = true;
        lastX = event.offsetX;
        lastY = event.offsetY;
    });

    canvas.addEventListener('mouseup', function (event) {
        down = false;
    });

    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    let u_color;
    function render(time) {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        u_color = gl.getUniformLocation(program, "u_color");

        mView = lookAt(camera.eye, camera.at, camera.up);
        STACK.loadMatrix(mView);

        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);


        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_normals"), false, flatten(normalMatrix(STACK.modelView())));

        gl.uniform1i(gl.getUniformLocation(program, "u_use_normals"), options.normals);

        //gl.uniform3fv(u_color, color.current_color);
        CUBE.draw(gl, program, options.wireframe ? gl.LINES : gl.TRIANGLES);
        if(object_data.name == 'Cow') 
            COW.draw(gl, program, options.wireframe ? gl.LINES : gl.TRIANGLES);
        else
            BUNNY.draw(gl, program, options.wireframe ? gl.LINES : gl.TRIANGLES);
    }
}

let urls;
if(currentShader == 'gouraud')
    urls = ['shader_gouraud.vert', 'shader_gouraud.frag'];
else
    urls = ['shader_phong.vert', 'shader_phong.frag'];

loadShadersFromURLS(urls).then(shaders => setup(shaders));