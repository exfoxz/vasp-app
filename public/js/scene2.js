/** anonymous function to execute to scene up and running */
var SCENE = (function(){

    window.onload = function () {
        start();
    };

    var myScene = {};

    var defaults = {};
    // Rotation check
    var isRotating = false;
    console.log("SCENE IS RUNNING...");

    var canvas_id = 'canvas';


    /** start function */
    function start() {
        init(myScene);
        initScene(myScene);
        render(myScene);
//        animate();
    }

    /** Initialize variables and scenes */
    function init(m) {
        // canvas element
        m.container = $('#' + canvas_id);
        m.WIDTH = m.container.width(), m.HEIGHT = m.container.height();
        m.ASPECT = m.WIDTH / m.HEIGHT;
        m.NEAR = 1, FAR = 800;
        m.CAMERA_Z = -150;
        m.webglFailed = true;
        m.scene = null;

        m.renderer = new THREE.WebGLRenderer({antialias:true});
//    m.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true }); // Transparent bg
        m.renderer.sortObjects = false; // hopefully improve performance
        m.renderer.domElement.style.width = "100%";
        m.renderer.domElement.style.height = "100%";
        m.container.append(m.renderer.domElement);
        m.renderer.setSize(m.WIDTH, m.HEIGHT);

        try {
            if (force2d) throw "WebGL disabled";
            m.renderer = new THREE.WebGLRenderer({antialias: true});
            m.renderer.sortObjects = false; // hopefully improve performance
            // 'antialias: true' now works in Firefox too!
            // setting m.aaScale = 2 will enable antialias in older Firefox but GPU load increases.
            m.renderer.domElement.style.width = "100%";
            m.renderer.domElement.style.height = "100%";
            m.container.append(m.renderer.domElement);
            m.renderer.setSize(m.WIDTH, m.HEIGHT);
            m.webglFailed = false;
        } catch (e) {
            m.canvas2d = $('<canvas></canvas');
            m.container.append(m.canvas2d);
            m.canvas2d[0].height = m.HEIGHT;
            m.canvas2d[0].width = m.WIDTH;
        }

        m.camera = new THREE.PerspectiveCamera(20, m.ASPECT, 1, 800); // will be updated anyway
        m.camera.position = new TV3(0, 0, m.CAMERA_Z);
        m.camera.lookAt(new TV3(0, 0, 0));
        m.perspectiveCamera = m.camera;
        m.orthoscopicCamera = new THREE.OrthographicCamera();
        m.orthoscopicCamera.position.z = myScene.CAMERA_Z;
        m.orthoscopicCamera.lookAt(new TV3(0, 0, 0));

        var self = m;
        $(window).resize(function () { // only window can capture resize event
            self.WIDTH = self.container.width() * self.aaScale;
            self.HEIGHT = self.container.height() * self.aaScale;
            if (!self.webglFailed) {
                self.ASPECT = self.WIDTH / self.HEIGHT;
                self.renderer.setSize(self.WIDTH, self.HEIGHT);
                self.camera.aspect = self.ASPECT;
                self.camera.updateProjectionMatrix();
            } else {
                self.canvas2d[0].height = self.HEIGHT;
                self.canvas2d[0].width = self.WIDTH;
            }
            self.show();
        });
        console.log(m.renderer);
        m.controls = new THREE.OrbitControls(m.camera, m.renderer.domElement);

        m.setupLights = function (scene) {
            scene.directionalLight = new THREE.DirectionalLight(0xFFFFFF);
            scene.directionalLight.position = new TV3(0.2, 0.2, -1).normalize();
            scene.directionalLight.intensity = 1.2;
            scene.add(scene.directionalLight);
            scene.ambientLight = new THREE.AmbientLight(0x202020);
            scene.add(scene.ambientLight);
        };

        m.setSlabAndFog = function() {
            var center = this.rotationGroup.position.z - this.camera.position.z;
            if (center < 1) center = 1;
            this.camera.near = center + this.slabNear;
            if (this.camera.near < 1) this.camera.near = 1;
            this.camera.far = center + this.slabFar;
            if (this.camera.near + 1 > this.camera.far) this.camera.far = this.camera.near + 1;
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.fov = this.fov;
            } else {
                this.camera.right = center * Math.tan(Math.PI / 180 * this.fov);
                this.camera.left = - this.camera.right;
                this.camera.top = this.camera.right / this.ASPECT;
                this.camera.bottom = - this.camera.top;
            }
            this.camera.updateProjectionMatrix();
            this.scene.fog.near = this.camera.near + this.fogStart * (this.camera.far - this.camera.near);
//   if (this.scene.fog.near > center) this.scene.fog.near = center;
            this.scene.fog.far = this.camera.far;
        };

        m.show = function() {
            if (!m.scene) return;
            var time = new Date();
//            m.setSlabAndFog();
            if (!m.webglFailed) m.renderer.render(m.scene, m.camera);
//            else m.render2d();
            console.log("rendered in " + (+new Date() - time) + "ms");
        };
    };

    function initScene (m) {
        m.scene = new THREE.Scene();
        m.scene.fog = new THREE.Fog(m.bgColor, 100, 200);

//        m.modelGroup = new THREE.Object3D();
//        m.rotationGroup = new THREE.Object3D();
//        m.rotationGroup.useQuaternion = true;
//        m.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
//        m.rotationGroup.add(m.modelGroup);

//        m.m.add(m.rotationGroup);
        m.setupLights(m.scene);
    };
    /** render from geometry information */
    function render(m) {
        console.log(m.camera);
        m.scene.directionalLight.position.copy (m.camera.position );
        m.renderer.render(m.scene, m.camera);
    }

    /** animate by looping with requestAnimationFrame */
    function animate() {
        window.requestAnimationFrame(animate, renderer.domElement);
        if(isRotating){
            controls.update();
        };
        render();
    }

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