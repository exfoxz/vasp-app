/**
 * Created by ExFoxZ on 1/20/14.
 */

//create global vars
    var scene, camera, light, renderer, controls, container, guiController, object, geometry;
    scene = new THREE.Scene();

    //range of looking for GEOMETRY and TOPOLOGY
    var RANGE = 30;
    var objectCount = 2;

//wait for window to load to actually start
    //addEventListener('click',)
    $(document).ready(function() {

        $("form").on('submit', function(e) {
            objectCount++;
            e.preventDefault();
            try {
                var name = $('.inName').val();
                var color = $('.inColor').val();
                var object = adder(name, color);
                var input = '<li id="' + objectCount + '">Object: <em>' + name + '</em>, color: ' + color +
                                  ', visible: <input type="checkbox" checked onclick="response(event)"></li>';
                $('.list').append(input);
                console.log($('.inColor').val());
                this.reset();
            }
            catch(e){
                console.log(e);
            }

        });
    });


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
        var WIDTH = document.getElementById("scene").offsetWidth - 20;
            HEIGHT = 800    ;
        var VIEW_ANGLE = 45,
            ASPECT = WIDTH/HEIGHT,
            NEAR = 0.1,
            FAR = 1000,
            CAM_POS_Z = 35;

        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor( 0xffffff, 1 );
        document.getElementById('scene').appendChild(renderer.domElement);

        camera =
            new THREE.PerspectiveCamera(
                VIEW_ANGLE, ASPECT, NEAR, FAR
            );
        camera.position.set(0, 0, CAM_POS_Z);

        //add the camera to scene

        scene.add(camera)

        light = new THREE.PointLight(0xFFFFFF, 1);
        light.position.set(0,40,40);
        scene.add(light);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        console.log(controls);
        console.log(camera);
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

/** GET server's triangles data file and store it and add it to scene*/
    function adder(fileName, color) {
    var myCoordinates = [], myFaces = [], lines;
    var numGeometry = 0, numTopology = 0;
    var startGeometry = 0, startTopology = 0;
    $.ajax({
        type:    "GET",
        url:     "data/" + fileName,
        success: function(text) {
            console.log('DONE CALLING');
            //split file into different lines
            lines = text.split("\n");

            //get the GEOMETRY position
            for(var i = 0; i < RANGE; i++) {
                if(lines[i].charAt(0) == "G") {
                    startGeometry = i;
                    break;
                }
            }
            //get number of geometries
            numGeometry = parseInt(lines[startGeometry].replace("GEOMETRY: ", ""))

            //split each line into different words separated by a space " "
            //words will be contained in an object - words
            //loop through lines[] to break down lines into words[]
            var words = [];
            for (i = 0; i < numGeometry; i++) {
                words[i] = lines[i+startGeometry + 1].split(" ");
            }

            //a counter to loop through words[]
            var counter = 0;

            //loop through words[] to add parsed-Floats to myCoordinates[]
            for (var j = 0; j < words.length; j++) {
                for(var k = 0; k < words[0].length; k++) {
                    myCoordinates[counter] = parseFloat(words[j][k]);
                    counter++;
                }
            }
            ////START LOOKING FOR FACES - TOPOLOGY

            //get the TOPOLOGY position
            var startTopology = 0;
            for(j = numGeometry - 1 + startGeometry; j < numGeometry - 1 + startGeometry + RANGE; j++) {
                if(lines[j].charAt(0) == "T") {
                    startTopology = j;
                    break;
                }
            }

            //get number of topologies
            numTopology = parseInt(lines[startTopology].replace("TOPOLOGY: ", ""));
            words = [];
            for (i = 0; i < numTopology; i++) {
                words[i] = lines[i+ startTopology + 1].split(" ");
            }

            //reset counter
            counter = 0;

            //loop through words[] to add parsed-Floats to myCoordinates[]
            for (j = 0; j < words.length; j++) {
                for(k = 0; k < words[0].length; k++) {
                    myFaces[counter] = parseFloat(words[j][k]);
                    counter++;
                }
            }

            //start rendering after getting the information

            var dataObject = {
                coordinates: myCoordinates,
                faces: myFaces,
                numGeometry: numGeometry,
                numTopology: numTopology,
                startGeometry: startGeometry,
                startTopology: startTopology
            }
            //add object to scene;
            var object = addObject(dataObject, color);
            return object;
        },
        error:   function(e) {
            // An error occurred
            console.log(e);
        }
    });
}

        var offset;

        /** Add new object to the scene */
        function addObject(dataObject, color) {
            geometry = new THREE.Geometry();
            var myCoordinates = dataObject.coordinates;
            var myFaces = dataObject.faces;
            //loop to add vertices
            for (var i = 0; i< myCoordinates.length; i+=6) {
                addVertex(myCoordinates[i], myCoordinates[i+1], myCoordinates[i+2])
            }

            for (var j = 0; j< myFaces.length; j+=3) {
                addFace(myFaces[j], myFaces[j+1], myFaces[j+2]);
            }

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            //findPrime function to find xP, yP and zP
            if(objectCount == 2) {
                offset = findPrime(myCoordinates, dataObject.numGeometry);
            }

            //create a new object containing geometry
            object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
            object.position.set(-offset[0], -offset[1], -offset[2]);
            scene.add(object);
            return object;
            function addVertex(x, y, z) {
                geometry.vertices.push( new THREE.Vector3( x, y, z) );
            }

            function addFace(x, y, z) {
                geometry.faces.push( new THREE.Face3( x, y, z));
            }

        }

    /** setup simple gui */

    function setupGui () {
        console.log("SETUP GUI");
        guiController = {
            viewAngle: 45
        }
        var gui = new DAT.GUI({autoPlace: false});
        var element = gui.add( guiController, "viewAngle", 10, 90);
        element.name("View Angle");
        element.onFinishChange(function(){
            camera.fov = guiController.viewAngle;
            camera.updateProjectionMatrix();
            console.log("Change");
        })
        //renderer.domElement.appendChild(gui.domElement);
    }

    /** find primes to position object to origin */
    function findPrime (myCoordinates, numGeometry) {
        var xPrime = 0, yPrime = 0, zPrime = 0;
        for (var i = 0; i < myCoordinates.length - 6; i+=6) {
            xPrime += myCoordinates[i];
            yPrime += myCoordinates[i+1];
            zPrime += myCoordinates[i+2];
        }
        return [xPrime/numGeometry,yPrime/numGeometry,zPrime/numGeometry];
    }