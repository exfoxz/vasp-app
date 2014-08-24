/**
 * Created by ExFoxZ on 07/07/2014.
 */

/** anonymous function to execute to get parser functions */
var PARSER = (function(){
    var parser = {};
    /** function to add object to a scene of THREEJS - surf */
    parser.addSurfObject = function(scene, data, color) {
        var geometry = new THREE.Geometry();
        var myCoordinates = data.coordinates;
        var myFaces = data.faces;
        var objectCount = 2;
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
            offset = findPrime(myCoordinates, data.numGeometry);
        }

        //create a new object containing geometry
        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
        mesh.position.set(-offset[0], -offset[1], -offset[2]);
        scene.add(mesh);
        return mesh;

        function addVertex(x, y, z) {
            geometry.vertices.push( new THREE.Vector3( x, y, z) );
        }

        function addFace(x, y, z) {
            geometry.faces.push( new THREE.Face3( x, y, z));
        }

        /** Find primes to position object to origin */
        function findPrime (myCoordinates, numGeometry) {
            var xPrime = 0, yPrime = 0, zPrime = 0;
            for (var i = 0; i < myCoordinates.length - 6; i+=6) {
                xPrime += myCoordinates[i];
                yPrime += myCoordinates[i+1];
                zPrime += myCoordinates[i+2];
            }
            return [xPrime/numGeometry,yPrime/numGeometry,zPrime/numGeometry];
        }
    }

//    /** function to add object to a scene of THREEJS - pdb */
//    parser.addPdbObjectX = function(scene, atoms, centroid, color) {
//        var config = {
//            radius: {
//                'C' : 1.7,
//                'N' : 1.5,
//                'S' : 1.8,
//                'O' : 1.5,
//                'H' : 1.2,
//                'OTH' : 1.9 //unrecognized atom types
//            },  //TODO: dynamic radius
//            colors: {
//                'N' : 'blue',
//                'S' : 'yellow',
//                'O' : 'red',
//                'H' : 'white',
//            },
//            defaultColor : color,
//            segments: 10, //drop to 10 - 12
//            rings: 6 //drop to 6
//        }
//
//        var sphereGeometry;
//        //material to make the final sphere
//        var sphereMaterial = new THREE.MeshLambertMaterial({color: color});
//        atoms.forEach(function(atom) {
//            if(!config.radius[atom.element]) {
//                 atom.radius = config.radius['OTH'];
//            }
//            else {
//                atom.radius = config.radius[atom.element];
//                //if the known element is not carbon
//                if(atom.element !== 'C') {
//                }
//            }
//
//            if(!sphereGeometry) {
//                console.log('initial sphere');
//                sphereGeometry =
//                    new THREE.BulkSphereGeometry([atom], config.segments, config.rings);
//                console.log(sphereGeometry);
//                console.log(sphereGeometry.faces[0].clone());
////                sphereGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(atom.x, atom.y, atom.z));
//                console.log(sphereGeometry.faces[0]);
//                console.log(sphereGeometry.applyMatrix)
//            }
////
////            else {
////                console.log('new sphere');
////                var newSphere = new THREE.BulkSphereGeometry(radius, config.segments, config.rings);
////
////                newSphere.applyMatrix(new THREE.Matrix4().makeTranslation(atom.x, atom.y, atom.z));
////                //merge newSphere to sphereGeometry
////                THREE.GeometryUtils.merge(sphereGeometry, newSphere);
////            }
//        })
//
//        //create a mesh
//        var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
//        //add sphereGeometry to scene
////        mesh.position.set(-centroid[0], -centroid[1], -centroid[2]);
//        scene.add(mesh);
//        return mesh;
//    };

    /** function to add object to a scene of THREEJS - pdb */
    parser.addPdbObject = function(scene, atoms, centroid, color) {
        var config = {
            radius: {
                'C' : 1.7,
                'N' : 1.5,
                'S' : 1.8,
                'O' : 1.5,
                'H' : 1.2,
                'OTH' : 1.9 //unrecognized atom types
            },  //TODO: dynamic radius
            colors: {
                'N' : 'blue',
                'S' : 'yellow',
                'O' : 'red',
                'H' : 'white',
            },
            defaultColor : color,
            segments: 10, //drop to 10 - 12
            rings: 6 //drop to 6
        }

        var sphereGeometry;
        //material to make the final sphere
        var sphereMaterial = new THREE.MeshLambertMaterial({color: color});

        //TODO: is loop through each atom to get radius beforehand efficient?
        atoms.forEach(function(atom) {
            if (!config.radius[atom.element]) {
                atom.radius = config.radius['OTH'];
            }
            else {
                atom.radius = config.radius[atom.element];
                //if the known element is not carbon
                if (atom.element !== 'C') {
                }
            }
        });

        sphereGeometry = new THREE.BulkSphereGeometry(atoms, config.segments, config.rings);
        //create a mesh
        var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        //add sphereGeometry to scene
        mesh.position.set(-centroid[0], -centroid[1], -centroid[2]);
        scene.add(mesh);
        return mesh;
    };

    /** Surface files parser */
    parser.surfParser = function (data) {
        var myCoordinates = [], myFaces = [], lines;
        var numGeometry, numTopology;
        var startGeometry = 0, startTopology = 0;

        //range of looking for GEOMETRY and TOPOLOGY
        var RANGE = 30;

        //split file into different lines
        lines = data.split("\n");

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

        //data to render
        var data = {
            coordinates: myCoordinates,
            faces: myFaces,
            numGeometry: numGeometry,
            numTopology: numTopology,
            startGeometry: startGeometry,
            startTopology: startTopology
        };

        return data;
    }

    //export a parser object
    return parser;
}());