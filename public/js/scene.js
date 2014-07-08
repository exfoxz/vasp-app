/**
 * Created by ExFoxZ on 1/20/14.
 */

/** anonymous function to execute */
var SCENE = (function(){
    var myScene = {};
    console.log("SCENE IS RUNNING...");
    //create local vars
    var scene = new THREE.Scene();
    var camera, light, renderer, controls;

    //canvasId to grab with document.getElementById
    var canvas_id = 'canvas';

    window.onload = function () {
        start();
    }

    /** start function */
    function start() {
        init();
        render();
        animate();
    }

    /** Initialize variables and scenes */
    function init() {
        //canvas element
        var canvasEl = document.getElementById(canvas_id);
        var WIDTH = canvasEl.offsetWidth;
        var HEIGHT = canvasEl.offsetHeight;
        var VIEW_ANGLE = 45,
            ASPECT = WIDTH/HEIGHT,
            NEAR = 0.1,
            FAR = 1000,
            CAM_POS_Z = 100;

        renderer = new THREE.WebGLRenderer({antialias:true, alpha: true });
        renderer.setSize(WIDTH, HEIGHT);
        //set background color to white
//        renderer.setClearColor( 0xffffff, 1);

        canvasEl.appendChild(renderer.domElement);

        camera =
            new THREE.PerspectiveCamera(
                VIEW_ANGLE, ASPECT, NEAR, FAR
            );
        camera.position.set(0, 0, CAM_POS_Z);

        //add the camera to scene

        scene.add(camera)

        light = new THREE.PointLight(0xFFFFFF, 1);
        light.position.set(0,50,50);
        scene.add(light);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    /** render from geometry information */
    function render() {
        light.position.copy ( camera.position );
        renderer.render(scene, camera);
    }

    /** animate by looping with requestAnimationFrame */
    function animate() {
        controls.update();
        render();
        //console.log(camera.matrix.elements[0]);
        //console.log(camera.matrix.elements[1]);
        window.requestAnimationFrame(animate, renderer.domElement);
    }
    //bind scene to myScene
    myScene.scene = scene;

    //export myScene object
    return myScene;
}());