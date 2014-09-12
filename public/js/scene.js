/** anonymous function to execute to scene up and running */
var SCENE = (function(){
    var myScene = {};
    var defaults = {};
    // Rotation check
    var isRotating = false;
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

        canvasEl.appendChild(renderer.domElement);

        camera =
            new THREE.PerspectiveCamera(
                VIEW_ANGLE, ASPECT, NEAR, FAR
            );
        camera.position.set(0, 0, CAM_POS_Z);

        defaults.defaultPosition = _.cloneDeep(camera.position);
        defaults.defaultRotation = _.cloneDeep(camera.rotation);

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
        window.requestAnimationFrame(animate, renderer.domElement);
        if(isRotating){
            console.log('is rotating');
            controls.update();
        };
        render();
    }

    //TEST: add drag event to window
//    window.addEventListener('dragenter', function(e){
//        console.log('drag enter');
//        console.log(e);
//    })

    //bind scene to myScene
    myScene.scene = scene;

    // methods
    myScene.methods = {
        savePosition : function () {
            return myScene.lastPosition = _.clone(camera.position);
        },
        toggleRotation : function () {
            controls.autoRotate = !controls.autoRotate;
            return isRotating = !isRotating;
        },
        increaseRotationSpeed: function (tick) {
            return controls.autoRotateSpeed+= tick;
        },
        restorePosition: function (lastPosition) {
            var target = controls.target;
            camera.position.copy(target).add(lastPosition);
            return camera.lookAt(target);
        }
    };
    //export myScene object
    return myScene;
}());