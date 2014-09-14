/**
 *
 * Created by sam on 31/08/2014.
 */
'use strict';
angular.module('app.controllers', [])
    .controller('objCtrl', function ($scope, $http, $timeout, $q, Rainbow, Socket, $location) {
        var ctrl = this;

        // Url for server to fetch information
        var serverUrl = 'http://localhost:8000/';
//        var serverUrl = 'http://54.64.25.255:8000/';
1
        function init(ctrl) {
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
        };

        init(ctrl);

        // Save current workspace info to server
        ctrl.save = function () {
            // =====================================================
            // Check SAVE conditions ===============================
            // =====================================================
            console.log($location.path());

            // =====================================================
            // Save camera position to a database ==================
            // =====================================================
            console.log('saving workspace');
            var lastPosition = SCENE.methods.savePosition();
            // Get ids for all the current pdbs
            var pdbs = [];
            ctrl.pdbList.forEach(function (data) {
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
        };

        /** reset ctrl.input */
        ctrl.input.reset = function () {
            ctrl.input.name = '';
        };
        // Object for progress feedback
        ctrl.progress = $scope.progress = {started: false, value: 100, class: 'progress-init'};
        ctrl.progress.init = function () {
            this.started = true;
            this.class = 'progress-init';
        };
        ctrl.progress.fadeout = function () {
            this.class = 'fade-out';
            $timeout(function () {
                ctrl.progress.started = false;
            }, 1000);
        };

        //welcome message
        ctrl.welcomeMessage = "<- Enter a protein's name and click Go! to get started!";

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

        // Check for empty color, default to red
        if (!ctrl.input.color) {
            console.log('No color, default to red');
            ctrl.setColor(ctrl.colorIndex++);
        }
        /** Get atoms from server and add it to scene */
        ctrl.fetch = $scope.fetch = function (id) {
            //check for undefined or empty input
            if (ctrl.input.name == undefined || ctrl.input.name == '') {
                console.log('NO NAME');
            }
            else
                $scope.fetchPdbAsync(id).then(function (data) {
                   console.log('Fetching', id, 'done')
                }, function (error) {
                    console.log(error);
                });
        };

        /** Get pdb with id and add to scene  */
        $scope.fetchPdbAsync = function (id) {
            console.log($scope.toggleCover)
            // Show progress bar
            ctrl.progress.init();
            //remove welcome message
            if (angular.element('#welcome'))
                angular.element('#welcome').remove();

            //reset input
            ctrl.input.reset();

            console.log('fetching... ' + id);
            return new Promise(function (resolve, reject) {
                $http.get(serverUrl + 'pdbs/' + id)
                    .success(function (data) {
                        console.log(data);
                        // Hide progress bar
                        ctrl.progress.fadeout();

                        // Add to list of structures
                        ctrl.pdbList.push({id: id, style: {'border-top-color': ctrl.input.color}, chains: []})

                        var group = new THREE.Object3D();
                        group.color = ctrl.input.color
                        var qMeshes = [];
                        for(var key in data.chains) {
                            var chain = data.chains[key];
                            qMeshes.push(PARSER.getPdbMeshAsync(chain.atoms, chain.centroid, group.color, chain.id).then(function (pdbMesh) {
                                // Add a chain mesh to group
                                group.add(pdbMesh);
                                // Add a chain to pdb list
                                _.where(ctrl.pdbList, {id: id})[0].chains.push({id: pdbMesh.chainId, style: {'background-color' : pdbMesh.color}});
                                console.log('CHAIN: ');
                                console.log(ctrl.pdbList);
                                console.log(pdbMesh);
                                return true;
                            }, function (error) {
                                console.error(error);
                            }));
                        };
                        console.log(qMeshes);
                        $q.all(qMeshes).then(function (data) {
                            console.log('ALL DONE');
                            console.log(data);
                            console.log(group);
                            ctrl.pdbs[id] = group;
                            console.log(ctrl.pdbs);
                            // Add group to scene
                            SCENE.scene.add(group);
                            // Stop spin-loader
                            _.where(ctrl.pdbList, {id: id})[0].fetched = true;
                        })

                        // Rotate through colors
                        ctrl.setColor(ctrl.colorIndex++);
                    })
                    .error(function (err) {
                        //hide progress bar
                        ctrl.progress.started = false;
                        console.log(err);
                        reject(err);
                    })
            })
        }

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
        ctrl.vToggle = function (id, parentList) {
            console.log('toggle', id);
            console.log(parentList);
            var parent = ctrl.pdbs[id];
            parent.visible = !parent.visible;
            // Traverse object
            parent.traverse(function (child) {
                // If child is parent, return
                if(!(child instanceof THREE.Mesh))
                    return;
                // Else, it's a child
                child.visible = parent.visible;
            });

            parentList.chains.forEach(function (chain) {
                if(parent.visible === false) { // turned off
                    console.log('OFF');
                     ctrl.chainUtil.bgOff(chain)
                }
                else { // turned on
                    console.log('ON');
                    ctrl.chainUtil.bgOn(chain, parentList);
                }
            })
        }

        //toggle surf object visibility
        ctrl.surfToggle = function (id) {
            console.log('toggle', id);
            ctrl.surfs[id].visible = !ctrl.surfs[id].visible;
        }

        ctrl.chainUtil = {};
        // Toggle a pdb's chain visibility
        ctrl.chainUtil.vToggle = function (pdbId, chain) {
            // Toggle visible
            var currentChain = _.where(ctrl.pdbs[pdbId].children, {'chainId': chain.id})[0];
            currentChain.visible = !currentChain.visible;
        }
        ctrl.chainUtil.bgOff = function (chain) {
            chain.style['background-color'] = '#777';
        };
        ctrl.chainUtil.bgOn = function (chain, parent) {
            chain.style['background-color'] = parent.style['border-top-color'];
        };
        // Change background-color
        ctrl.chainUtil.bgToggle = function (chain, parent) {
            if (chain.style['background-color'] !== '#777') {
                chain.style['background-color'] = '#777';
            }
            else {
                chain.style['background-color'] = parent.style['border-top-color'];
            }
        }
        ctrl.chainUtil.toggle = function (pdbId, chain, parent) {
            this.bgToggle(chain, parent);
            this.vToggle(pdbId, chain);
        }
    })

    .controller('canvasCtrl', function ($scope, clog, Socket) {
        clog('CANVAS CTRL INIT', 'info');
        var s = $scope;
        s.showCover = false;
        s.toggleCover = function () {
            s.showCover = !s.showCover;
        };
        s.hideCover = function () {
            s.showCover = false;
        }
        s.restoreWorkspace = function (data) {
            console.log(data);
            var pdbs = data.pdbs;
            console.log('RESTORING WORKSPACE...');
            pdbs.forEach(function (pdb, index, array) {
                if(index === array.length - 1) { // Last element
                    console.log('LAST ELEMENT');
                    s.fetchPdbAsync(pdb).then(function (done) {
                        console.log('FETCHING ASYNC!!!!');
                        // Restore camera rotation
                        SCENE.methods.restorePosition(data.cameraPosition);

                        // Done restoring, hide cover
                        console.log('(GONNA) DONE RESTORTING');
//                        s.hideCover();
                    }, function (error) {
                        console.log(error);
                    });
                }
                else {
                    console.log('NOT LAST');
                    s.fetchPdbAsync(pdb).then(function (data) {
                    }, function (error) {
                        console.log(error);
                    });
                }

            })
        }
    })
    .controller('modalCtrl', function ($scope, clog, workspace) {
        clog('MODAL CTRL INIT', 'info');
//        $scope.toggleCover();
        $scope.restoreWorkspace(workspace.data);
    })