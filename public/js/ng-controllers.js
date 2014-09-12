/**
 * Created by sam on 31/08/2014.
 */

angular.module('app.controllers', [])
    .controller('objCtrl', function ($scope, $http, $timeout, Rainbow, Socket, $location, timed) {
        var ctrl = this;

        //url for server to fetch information
//        var serverUrl = 'http://localhost:8000/';
      var serverUrl = 'http://54.64.25.255:8000/';

         // Save current workspace info to server
        ctrl.save = function () {
            // =====================================================
            // Check save conditions ===============================
            // =====================================================
            console.log($location.path());

            // =====================================================
            // Save camera position to a database ==================
            // =====================================================
            console.log('saving workspace');
            var lastPosition = SCENE.methods.savePosition();
            // Get ids for all the current pdbs
            var pdbs = [];
            ctrl.structures.forEach(function (data) {
                pdbs.push(data.id);
            });
            // TODO: Surf files data?
            console.log('POST to workspace/save');
            // Do a POST request to server API
            $http({method: 'POST', url: serverUrl + 'workspace/save', data: {pdbs: pdbs, cameraPosition: lastPosition}})
                .success(function (data, status) {
                    console.log('done POST save workspace');
                    console.log(data);
                   // Check status
                   if(status === 200)
                        // Change url without reloading
                       $location.path(data.id);
                })
                .error(function (data, status) {
                    // TODO: resolve POST error
                    console.log('error');
                });

            // =====================================================
            // END =================================================
            // =====================================================
        };

        // Toggle camera rotation
        ctrl.toggleRotation = function () {
            console.log('toggle');
            SCENE.methods.toggleRotation();
        }
        //dummy object for input
        ctrl.input = {};

        //list of pdbs
        ctrl.pdbList = [];
        //list of pdbs meshes
        ctrl.pdbs = {};

        //list of surfaces
        ctrl.surfaces = [];
        //list of surf meshes
        ctrl.surfs = {};

        //object for progress feedback
        ctrl.progress = $scope.progress = {started: false, value: 0, delay: 1000, inc: 20};
        ctrl.progress.increment = function () {
            var value = this.value;
            var inc = this.inc;
            $timeout(function () {
                value += inc;
            }, this.delay);
        }

        /* reset ctrl.input */
        ctrl.input.reset = function () {
            ctrl.input.name = '';
        }
        //welcome message
        ctrl.welcomeMessage = "<- Enter a protein's name and click Go! to get started!";

        //objects recevied from Bark
        ctrl.barkObjects = [];

        //current objects
        ctrl.objects = {
            names: [],
            counter: 0
        };

        //an array of colors for proteins
        ctrl.colors = ['red', 'blue', 'green', 'yellow', 'black'];
        //color index for pdb
        ctrl.colorIndex = 0;
        //color index for surf
        ctrl.surfColorIndex = 0;

        //set color for protein
        ctrl.setColor = function (index) {
            ctrl.input.color = ctrl.colors[index];
            ctrl.proteinStyle = {'background-color': ctrl.input.color};
        }
        //offset in children array to get to objects
        ctrl.offset = 2;

        //check for empty color, default to red
        if (!ctrl.input.color) {
            console.log('No color, default to red');
            ctrl.setColor(ctrl.colorIndex++);
        }

        /* Get pdb with id and add to scene  */
        $scope.fetchPdb = function (id) {
            console.log($scope.toggleCover)
            //show progress bar
            ctrl.progress.increment();
            ctrl.progress.started = true;
            ctrl.progress.value = 20;
            //remove welcome message
            if (angular.element('#welcome'))
                angular.element('#welcome').remove();

            //reset input
            ctrl.input.reset();

            console.log('fetching... ' + id);
            $http.get(serverUrl + 'pdbs/' + id)
                .success(function (data) {
                    console.log(data);
                    ctrl.progress.increment();
//                    //add protein to scene and to list of proteins
//                    var protein = PARSER.addPdbObject(SCENE.scene, data.atoms, data.centroid, ctrl.input.color);
                    // =====================================================
                    //  ==========
                    // =====================================================
                    var qMesh = PARSER.getPdbMeshAsync(SCENE.scene, data.atoms, data.centroid, ctrl.input.color);
                    qMesh.then(function (pdbMesh) {
                        console.log('Mesh');
                        console.log(pdbMesh);
                        SCENE.scene.add(pdbMesh);
//                        ctrl.pdbs[id] = pdbMesh;
                    }, function (error) {
                        console.log(error);
                    });
//
                    ctrl.progress.increment()
//
                    //hide progress bar
//                    ctrl.progress.started = false;

                    //add to list of structures
                    ctrl.pdbList.push({id: id, style: {'border-top-color': ctrl.input.color}})
                    ctrl.setColor(ctrl.colorIndex++);

                    //rotate through colors
                })
                .error(function (err) {
                    //hide progress bar
                    ctrl.progress.started = false;
                    console.log(err);
                })
        }

        /** Get atoms from server and add it to scene */
        ctrl.fetch = $scope.fetch = function (id) {
            //check for undefined or empty input
            if (ctrl.input.name == undefined || ctrl.input.name == '') {
                console.log('NO NAME');
            }
            else
                $scope.fetchPdb(id);
        };


        /** callback after surf file has been read */
        ctrl.readerCallback = function (file, data) {
            //remove welcome message
            if (angular.element('#welcome'))
                angular.element('#welcome').remove();
            var id = file.name.split('.')[0];
            //parse surf data
            var object = PARSER.surfParser(data);
            var color = ctrl.colors[ctrl.surfColorIndex++];
            //add to scene
            console.log('add surf to scene');
            var surfMesh = PARSER.addSurfObject(SCENE.scene, object, color);
            //add to a list of surf meshes
            ctrl.surfs[id] = surfMesh; //TODO: potential overwrite of data with same id
            console.log(ctrl.surfs);
            //add to an array of surf
            ctrl.surfaces.push({id: id, style: {'border-top-color': color}});
            console.log(ctrl.surfaces)
        };

        /** Surface file reader */
        ctrl.fileReader = function (event) {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                console.log('File reader is supported!');
                console.log(event);
            }
            else
                console.log('File reader API is not supported!');
        }

        /** ng-file-upload init */
        ctrl.myModelObj;
        ctrl.className = "dragover";
        ctrl.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                console.log(file.name);
                //only process surf files
                if (file.name.split('.')[1].toLowerCase() !== 'surf') {
                    alert(file.name + " isn't a surf file.");
                    continue;
                }
                //create new reader to read file's content
                var reader = new FileReader();
                reader.onload = (function (file) { //closure to keep file name
                    return function (e) {
//                       console.log(e.target.result);
                        //callback to paint surf object to scene
                        $scope.$apply(ctrl.readerCallback(file, e.target.result));
                    }
                })(file);

                reader.readAsText(file);
            }
        };

        //toggle pdb object visibility
        ctrl.vToggle = function (id) {
            console.log('toggle', id)
            ctrl.pdbs[id].visible = !ctrl.pdb[id].visible;
        }

        //toggle surf object visibility
        ctrl.surfToggle = function (id) {
            console.log('toggle', id)
            ctrl.surfs[id].visible = !ctrl.surfs[id].visible;
        }
    })
    .controller('canvasCtrl', function ($scope, clog, Socket) {
        clog('CANVAS CTRL INIT', 'info');
        var s = $scope;
        s.showCover = false;
        s.toggleCover = function () {
            s.showCover = !s.showCover;
        }
        s.restoreWorkspace = function (data) {
            console.log(data);
            var pdbs = data.pdbs;
            console.log('RESTORING WORKSPACE...');
            pdbs.forEach(function (pdb) {
//                s.fetchPdb(pdb);
                Socket.getPdbGeometry(pdb);
            })

            // Done restoring, hide cover
            console.log('DONE RESTORTING');
//            s.toggleCover();
        }
    })
    .controller('modalCtrl', function ($scope, clog, workspace) {
        clog('MODAL CTRL INIT', 'info');
        $scope.toggleCover();
        $scope.restoreWorkspace(workspace.data);
    })