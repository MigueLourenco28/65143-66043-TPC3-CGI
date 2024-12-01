import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { length, flatten, inverse, mult, normalMatrix, perspective, lookAt, vec4, vec3, vec2, subtract, add, scale, rotate, normalize } from '../../libs/MV.js';

import * as dat from '../../libs/dat.gui.module.js';

import * as COW from '../../libs/objects/cow.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';

import * as STACK from '../../libs/stack.js';

function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');
    const gl = setupWebGL(canvas);

    COW.init(gl);
    BUNNY.init(gl);
    CUBE.init(gl);
    SPHERE.init(gl);

    const gouraud_program = buildProgramFromSources(gl, shaders['shader_gouraud.vert'], shaders['shader_gouraud.frag']);
    const phong_program = buildProgramFromSources(gl, shaders['shader_phong.vert'], shaders['shader_phong.frag']);
    const light_program = buildProgramFromSources(gl, shaders['shader_light.vert'], shaders['shader_light.frag']);

    let current_program = gouraud_program;

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
        backface_culling: true,
        zBuffer: true,
        animation: false
    }

    let worldLight = {
        position: vec3(0.0, 0.0, 1.0),
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    let cameraLight = {
        position: camera.eye,
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    let objectLight = {
        position: vec3(0.0, 0.0, -1.0),
        ambient: vec3(51, 51, 51),
        diffuse: vec3(76, 76, 76),
        specular: vec3(255, 255, 255),
        directional: true,
        active: true
    }

    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "backface_culling");
    optionsGui.add(options, "zBuffer");
    optionsGui.add(options, "animation");

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
    cameraLightPositionGui.add(cameraLight.position, 0).name("x").listen().domElement.style.pointerEvents = "none";;
    cameraLightPositionGui.add(cameraLight.position, 1).name("y").listen().domElement.style.pointerEvents = "none";;
    cameraLightPositionGui.add(cameraLight.position, 2).name("z").listen().domElement.style.pointerEvents = "none";;
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
    objectGui.domElement.id = "object-gui";

    let object_data = {
        name: 'Cow',
        position: vec3(0.0, 0.0, 0.0),
        rotation: vec3(0, -90, 0),
        scale: vec3(1.0, 1.0, 1.0),
    }

    let material = {
        shader: 'gouraud',
        Ka: vec3(100.0, 100.0, 100.0),
        Kd: vec3(100.0, 100.0, 100.0),
        Ks: vec3(100.0, 100.0, 100.0),
        shininess: 100,
    }

    objectGui.add(object_data, 'name', ['Cow', 'Bunny', 'Sphere', 'Cube']).name('name');

    const transformGui = objectGui.addFolder("transform");

    const positionGui = transformGui.addFolder("position");
    positionGui.add(object_data.position, 0).name("x").min(-1.0).max(1.0).step(0.05).listen();;
    positionGui.add(object_data.position, 1).name("y").min(0.0).max(1.0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    positionGui.add(object_data.position, 2).name("z").min(-1.0).max(1.0).step(0.05).listen();;

    const rotationGui = transformGui.addFolder("rotation");
    rotationGui.add(object_data.rotation, 0).name("x").min(-1.0).domElement.style.pointerEvents = "none";;
    rotationGui.add(object_data.rotation, 1).name("y").min(-180).max(180).step(1).listen();;
    rotationGui.add(object_data.rotation, 2).name("z").min(-1.0).domElement.style.pointerEvents = "none";;

    const scaleGui = transformGui.addFolder("scale");
    scaleGui.add(object_data.scale, 0).name("x").min(0.0).max(1.0).step(0.05).listen();;
    scaleGui.add(object_data.scale, 1).name("y").min(0.0).max(1.0).step(0.05).listen();;
    scaleGui.add(object_data.scale, 2).name("z").min(0.0).max(1.0).step(0.05).listen();;

    const materialGui = objectGui.addFolder("material");

    materialGui.add(material, "shader", ['phong', 'gouraud']).name('shader').listen();
    materialGui.addColor(material, "Ka").listen();
    materialGui.addColor(material, "Kd").listen();
    materialGui.addColor(material, "Ks").listen();
    materialGui.add(material, "shininess").min(0).max(100).step(1).listen();
    


    //------------------Object Settings GUI------------------//

    // matrices
    let mView, mProjection;

    let down = false;
    let lastX, lastY;

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
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

    function surface() {
        STACK.multTranslation(vec3(0.0, -0.5, 0.0));
        STACK.multScale(vec3(3.0, 0.01, 3.0));

        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_model_view"), false, flatten(STACK.modelView()));
        CUBE.draw(gl, current_program, gl.TRIANGLES);
    }

    function object() {
        STACK.multTranslation(object_data.position);
        STACK.multRotationY(object_data.rotation[1]); 
        STACK.multScale(object_data.scale);

        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_model_view"), false, flatten(STACK.modelView()));
        if(object_data.name == 'Cow') 
            COW.draw(gl, current_program, gl.TRIANGLES);
        else if(object_data.name == 'Bunny')
            BUNNY.draw(gl, current_program, gl.TRIANGLES);
        else if(object_data.name == 'Sphere')
            SPHERE.draw(gl, current_program, gl.TRIANGLES);
        else
            CUBE.draw(gl, current_program, gl.TRIANGLES);
    }


    function normalizeColor(color) { 
        return vec3(color[0] / 255.0, 
            color[1] / 255.0, 
            color[2] / 255.0);
    }

    function lights() {

        //--------World Light--------//
        STACK.pushMatrix();
            STACK.multTranslation(worldLight.position);
            STACK.multScale(vec3(0.1, 0.1, 0.1));

            gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_model_view"), false, flatten(STACK.modelView()));
            gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_normals"), false, flatten(STACK.modelView()));
            
            gl.useProgram(light_program);

            gl.uniformMatrix4fv(gl.getUniformLocation(light_program, "u_projection"), false, flatten(mProjection));
            
            gl.uniformMatrix4fv(gl.getUniformLocation(light_program, "u_model_view"), false, flatten(STACK.modelView()));

            if(worldLight.active) 
                gl.uniform3fv(gl.getUniformLocation(light_program, "u_color"), normalizeColor(worldLight.diffuse));
            else 
                gl.uniform3fv(gl.getUniformLocation(light_program, "u_color"), vec3(0.0, 0.0, 0.0));

            SPHERE.draw(gl, light_program, gl.TRIANGLES);
            gl.useProgram(current_program);
        STACK.popMatrix();

        // Camera light: Deleted this sphere because it cannot be seen

        //---------Object light---------//
        STACK.multTranslation(objectLight.position);
        STACK.multScale(vec3(0.1, 0.1, 0.1));

        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_normals"), false, flatten(STACK.modelView()));
            
        gl.useProgram(light_program);

        gl.uniformMatrix4fv(gl.getUniformLocation(light_program, "u_projection"), false, flatten(mProjection));
            
        gl.uniformMatrix4fv(gl.getUniformLocation(light_program, "u_model_view"), false, flatten(STACK.modelView()));

        if(objectLight.active) 
            gl.uniform3fv(gl.getUniformLocation(light_program, "u_color"), normalizeColor(objectLight.diffuse));
        else 
            gl.uniform3fv(gl.getUniformLocation(light_program, "u_color"), vec3(0.0, 0.0, 0.0));

        SPHERE.draw(gl, light_program, gl.TRIANGLES);
        gl.useProgram(current_program);
    }

    let allLights = [ 
        worldLight, 
        cameraLight, 
        objectLight 
    ]; 


    function setUniforms() { 

        let lightsToSend = allLights.filter(light => light.active);

        gl.uniform3fv(gl.getUniformLocation(current_program, 'u_material.Ka'), normalizeColor(material.Ka)); 
        gl.uniform3fv(gl.getUniformLocation(current_program, 'u_material.Kd'), normalizeColor(material.Kd)); 
        gl.uniform3fv(gl.getUniformLocation(current_program, 'u_material.Ks'), normalizeColor(material.Ks)); 
        gl.uniform1f(gl.getUniformLocation(current_program, 'u_material.shininess'), material.shininess);
        gl.uniform1i(gl.getUniformLocation(current_program, 'u_numLights'), lightsToSend.length); 

        for (let i = 0; i < lightsToSend.length; i++) { 
            let light = lightsToSend[i];
                gl.uniform4fv(gl.getUniformLocation(current_program, `u_lights[${i}].pos`), vec4(light.position, light.directional ? 0.0 : 1.0));
                gl.uniform3fv(gl.getUniformLocation(current_program, `u_lights[${i}].Ia`), normalizeColor(light.ambient)); 
                gl.uniform3fv(gl.getUniformLocation(current_program, `u_lights[${i}].Id`), normalizeColor(light.diffuse));
                gl.uniform3fv(gl.getUniformLocation(current_program, `u_lights[${i}].Is`), normalizeColor(light.specular)); 
        } 
    }

    let speed = 0.005; // Speed of the animation
    let amplitude = 0.5; // Amplitude of the animation
    let baseHeight = object_data.position[1]; // Base height of the object
    function render(time) {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (material.shader === 'phong') {
            current_program = phong_program;}
        else {
            current_program = gouraud_program;
        }

        gl.useProgram(current_program);

        setUniforms(); // Ensure uniforms are set before rendering

        if (options.backface_culling) 
            gl.enable(gl.CULL_FACE);
        else 
            gl.disable(gl.CULL_FACE);

        if (options.zBuffer)
            gl.enable(gl.DEPTH_TEST);
        else
            gl.disable(gl.DEPTH_TEST);

        // Animate the object (up and down)
        if (options.animation) {
            // Update position to ensure it never goes below the base height
            object_data.position[1] = baseHeight + amplitude * (Math.sin(time * speed) + 1) / 2;

            // Update rotation
            object_data.rotation[1] = time * 50 * speed;
        }
            


        mView = lookAt(camera.eye, camera.at, camera.up);
        STACK.loadMatrix(mView);

        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_projection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_normals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_view"), false, flatten(mView));
        let u_view_normals = normalMatrix(mView);
        gl.uniformMatrix4fv(gl.getUniformLocation(current_program, "u_view_normals"), false, flatten(u_view_normals));

        STACK.pushMatrix();
            surface();
        STACK.popMatrix();
        STACK.pushMatrix();
            object();
        STACK.popMatrix();
        lights();
    }
}

const urls = ['shader_gouraud.vert', 'shader_gouraud.frag','shader_phong.vert', 'shader_phong.frag', 'shader_light.vert', 'shader_light.frag'];
loadShadersFromURLS(urls).then(shaders => setup(shaders));