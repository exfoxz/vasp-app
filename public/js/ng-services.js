/**
 * Created by sam on 31/08/2014.
 */

// Angular services and factories
angular.module('app.services', [])

    .factory('parserworker', function () {
        return function () {
            console.log('CREATING NEW PARSER WORKER');
    //        var worker = new Worker('js/parserWorker.js');
            worker.onmessage = function (e) {
            };

            return worker;
        }
    })
    // TODO: MODIFY SOCKET SERVICE
    .factory('Socket', function () {
        console.log('Initializing socket...');
        var Socket = {};

        // //Initialize socket
        var urlSocket = 'http://54.64.25.255:8000/';
        var socket = io.connect(urlSocket);

        // Get initial message from socket server
        // Receiving data from socket server
        socket.on('message', function(data) {
            console.log(data);
        });
        var getPdbGeometry = function (id) {
            console.log('Socket: getPdbGeometry');
            socket.emit('fetchPdb', {id: id});
        };
        var savePdbGeometry = function (id, geometry) {
            socket.emit('savePdb', {id: id, geometry: geometry});
        }
        return {
            getPdbGeometry: getPdbGeometry,
            savePdbGeometry: savePdbGeometry
        };
    })
    // Get unique color in steps
    .factory('Rainbow', function () {
        var rainbow = function (numOfSteps, step) {
            var r, g, b;
            var h = step / numOfSteps;
            var i = ~~(h * 6);
            var f = h * 6 - i;
            var q = 1 - f;
            switch (i % 6) {
                case 0:
                    r = 1, g = f, b = 0;
                    break;
                case 1:
                    r = q, g = 1, b = 0;
                    break;
                case 2:
                    r = 0, g = 1, b = f;
                    break;
                case 3:
                    r = 0, g = q, b = 1;
                    break;
                case 4:
                    r = f, g = 0, b = 1;
                    break;
                case 5:
                    r = 1, g = 0, b = q;
                    break;
            }
            var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
            return (c);
        }
        return rainbow;
    })
    .factory('workspace', function ($http) {
        return {
            getData: function (id) {
                console.log('GETING DATA FOR WORKSPACE');
                return $http({method: 'GET', url: 'http://54.64.25.255:8000/workspace/' + id});
//                    .success(function (data, status) {
//                        if(true) {
//                            return data;
//                        }
//                        else
//                            TODO: NO SUCH ID
//                            return 'No such id';
//                    })
//                    .error(function (data, status) {
//                        console.log(data);
//                        console.log(status);
//                    })
            }
        }
    })
    .service('timed', function () {
       return function (particles, positions, fn, context, callback){
            var i = 0;
            var tick = function() {
                var start = new Date().getTime();
                for (; i < positions.length && (new Date().getTime()) - start < 50; i++) {
                    fn.call(context, particles[i], positions[i]);
                }
                if (i < positions.length) {
                    // Yield execution to rendering logic
                    setTimeout(tick, 25);
                } else {
                    callback(positions, particles);
                }
            };
            setTimeout(tick, 25);
        }
    })
    .factory('clog', function () {
        function log(msg, color){
            color = color || "black";
            bgc = "White";
            switch (color) {
                case "success":  color = "Green";      bgc = "LimeGreen";       break;
                case "info":     color = "DodgerBlue"; bgc = "Turquoise";       break;
                case "error":    color = "Red";        bgc = "Black";           break;
                case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
                case "warning":  color = "Tomato";     bgc = "Black";           break;
                case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
                default: color = color;
            }
            if (typeof msg == "object"){
                console.log(msg);
            } else if (typeof color == "object"){
                console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
                console.log(color);
            } else {
                console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
            }
        }
        return log;
    })
    .factory('Surface', function ($http) {
        var Surface = {};
        var getSurfUrl = 'http://localhost:8000/pdbs/surfgen/';

        var getSurf = function (id) {
            console.time('getSurf');
            return $http.get(getSurfUrl + id);
        }
        /** Surface files parser */
        Surface.parser = function (data) {
            var myCoordinates = [], myFaces = [], lines;
            var numGeometry, numTopology;
            var startGeometry = 0, startTopology = 0;

            //range of looking for GEOMETRY and TOPOLOGY
            var RANGE = 30;

            //split file into different lines
            lines = data.split("\n");

            //get the GEOMETRY position
            for (var i = 0; i < RANGE; i++) {
                if (lines[i].charAt(0) == "G") {
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
                words[i] = lines[i + startGeometry + 1].split(" ");
            }

            //a counter to loop through words[]
            var counter = 0;

            //loop through words[] to add parsed-Floats to myCoordinates[]
            for (var j = 0; j < words.length; j++) {
                for (var k = 0; k < words[0].length; k++) {
                    myCoordinates[counter] = parseFloat(words[j][k]);
                    counter++;
                }
            }
            ////START LOOKING FOR FACES - TOPOLOGY

            //get the TOPOLOGY position
            for (j = numGeometry - 1 + startGeometry; j < numGeometry - 1 + startGeometry + RANGE; j++) {
                if (lines[j].charAt(0) == "T") {
                    startTopology = j;
                    break;
                }
            }

            //get number of topologies
            numTopology = parseInt(lines[startTopology].replace("TOPOLOGY: ", ""));
            words = [];
            for (i = 0; i < numTopology; i++) {
                words[i] = lines[i + startTopology + 1].split(" ");
            }

            //reset counter
            counter = 0;

            //loop through words[] to add parsed-Floats to myCoordinates[]
            for (j = 0; j < words.length; j++) {
                for (k = 0; k < words[0].length; k++) {
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

        /** function to make mesh to add to scene */
        Surface.makeMesh = function (data, color) {
            var geometry = new THREE.Geometry();
            var myCoordinates = data.coordinates;
            var myFaces = data.faces;
            var objectCount = 2;
            //loop to add vertices
            for (var i = 0; i < myCoordinates.length; i += 6) {
                addVertex(myCoordinates[i], myCoordinates[i + 1], myCoordinates[i + 2])
            }

            for (var j = 0; j < myFaces.length; j += 3) {
                addFace(myFaces[j], myFaces[j + 1], myFaces[j + 2]);
            }

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            //findPrime function to find xP, yP and zP
            if (objectCount == 2) {
                offset = findPrime(myCoordinates, data.numGeometry);
            }

            //create a new object containing geometry
            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
            mesh.position.set(-offset[0], -offset[1], -offset[2]);
            return mesh;

            function addVertex(x, y, z) {
                geometry.vertices.push(new THREE.Vector3(x, y, z));
            }

            function addFace(x, y, z) {
                geometry.faces.push(new THREE.Face3(x, y, z));
            }
        }

        /** Find primes to position object to origin */
        function findPrime(myCoordinates, numGeometry) {
            var xPrime = 0, yPrime = 0, zPrime = 0;
            for (var i = 0; i < myCoordinates.length - 6; i += 6) {
                xPrime += myCoordinates[i];
                yPrime += myCoordinates[i + 1];
                zPrime += myCoordinates[i + 2];
            }
            return [xPrime / numGeometry, yPrime / numGeometry, zPrime / numGeometry];
        }
        Surface.getSurf = getSurf;
        return Surface;
    });