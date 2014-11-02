/**
 *
 * Created by sam on 31/08/2014.
 */

'use strict';
angular.module('app.controllers', [])
    .controller('mainCtrl', function ($scope, $http, $timeout, $q, Rainbow, $location, promiseWrapper, Surface) {
        var ctrl = this;
        $scope.nope = true;
        $scope.test2 = function () {
            console.log('Test');
            $scope.nope = !$scope.nope;
        }

        $scope.floatingClass = 'floating-blur';
        $scope.mouseFloating = function () {
            if(this.mouseover) {
                console.log(this);
                $scope.floatingClass = 'floating-blur';
                this.mouseover = false;
            } else {
                console.log(this);
                $scope.floatingClass = 'floating-show';
                this.mouseover = true;
            }
        };
        // Init scene
        $scope.glmol = new GLmol('glmolX', true, 'canvas');
        $scope.glmol.init();

        // Url for server to fetch information
//        var serverUrl = 'http://localhost:8000/';
        var serverUrl = 'http://54.64.25.255:8000/';
        function init(scope) {
            //dummy object for input
            scope.input = {};
            //list of pdbs
            scope.pdbList = [];
            //list of pdbs meshes
            scope.pdbs = {};
            //list of surfaces
            scope.surfaces = [];
            //list of surf meshes
            scope.surfs = {};
        };

        init($scope);

        // Save current workspace info to server
        $scope.save = function () {
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
            $scope.pdbList.forEach(function (data) {
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
        $scope.toggleRotation = function () {
            console.log('toggle');
            SCENE.methods.toggleRotation();
        };

        /** reset $scope.input */
        $scope.input.reset = function () {
            $scope.input.name = '';
        };
        // Object for progress feedback
        $scope.progress = $scope.progress = {started: false, value: 100, class: 'progress-init'};
        $scope.progress.init = function () {
            this.started = true;
            this.class = 'progress-init';
        };
        $scope.progress.fadeout = function () {
            this.class = 'fade-out';
            $timeout(function () {
                $scope.progress.started = false;
            }, 1000);
        };

        //welcome message
        $scope.welcomeMessage = "<- Enter a protein's name and click Go! to get started!";

        //an array of colors for proteins
        $scope.colors = ['red', 'blue', 'green', 'yellow', 'black'];
        //color index for pdb
        $scope.colorIndex = 0;
        //color index for surf
        $scope.surfColorIndex = 0;

        //set color for protein
        $scope.setColor = function (index) {
            var hue = 60 * index;
            $scope.currentColor = 'hsl(' + hue + ', 100%, 50%)';

            $scope.proteinStyle = {'background-color': $scope.currentColor};
        }

        // Check for empty color, default to red
        if (!$scope.input.color) {
            console.log('No color, default to red');
            $scope.setColor($scope.colorIndex++);
        }

        /** Get atoms from server and add it to scene */
        $scope.fetch = $scope.fetch = function (id) {
//            check for undefined or empty input
            if ($scope.input.name == undefined || $scope.input.name == '') {
                console.log('NO NAME');
                }
            else {
                console.log('HERE');
                $scope.fetchPdbAsync(id)
                    .success(function (data) {
                        console.log('Fetching', id, 'done.')
                        // Hide progress bar
                        $scope.progress.fadeout();
                        // Add to list of structures
                        var currentPDB = {id: id, style: {'border-top-color': $scope.currentColor}, chains: []};
                        $scope.pdbList.push(currentPDB);
                        // =====================================================
                        //  ==========
                        // =====================================================
                        console.log('PROMISE');
                        promiseWrapper(function (deferred) {
                            $scope.glmol.addPDB(id, data, deferred);
                        }, function (status) {
                            console.log(status);
                            currentPDB.fetched = true;
                        }, function (err) {
                            console.log(err)
                        });
                        $scope.pdbList.push()
                        $scope.setColor($scope.colorIndex++);
                    })
                    .error(function (err) {
                        //hide progress bar
                        $scope.progress.started = false;
                        console.log(err);
                        reject(err);
                    })
            }
        };

        /** Get pdb with id and add to scene  */
        $scope.fetchPdbAsync = function (id) {
            console.log($scope.toggleCover);
            // Show progress bar
            $scope.progress.init();
            //remove welcome message
            if (angular.element('#welcome'))
                angular.element('#welcome').remove();
            //reset input
            $scope.input.reset();

            console.log('fetching... ' + id);
            return $http.get(serverUrl + 'pdbs2/' + id);
        };

        /** callback after surf file has been read */
        $scope.readerCallback = function (file, data) {
            //remove welcome message
            if (angular.element('#welcome'))
                angular.element('#welcome').remove();
            var id = file.name.split('.')[0];
            //parse surf data
            var object = $scope.glmol.surfParser(data);
            console.log('OBJECt:');
            console.log(object);
            var color = 0xff0000;
            //add to scene
            console.log('add surf to scene');
            var surfMesh = $scope.glmol.addSurf(object, color);
            //add to a list of surf meshes
            $scope.surfs[id] = surfMesh; //TODO: potential overwrite of data with same id
            console.log($scope.surfs);
            //add to an array of surf
            $scope.surfaces.push({id: id, style: {'border-top-color': color}});
            console.log($scope.surfaces)
        };
        $scope.csgTest = function () {
            console.log('csgTest');
            var meshes = [];
            for(var i in $scope.surfs) {
                meshes.push($scope.surfs[i])
            };
//            var cube_mesh1 = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshLambertMaterial({color: new THREE.Color(0xff0000)}));
//            var cube_mesh2 = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), new THREE.MeshLambertMaterial({color: new THREE.Color(0xff0000)}));

            var bsp1 = new ThreeBSP(meshes[0]);
            var bsp2 = new ThreeBSP(meshes[1]);
            console.log(bsp1);
            console.log(bsp2);

            var subtract_bsp = bsp1.union(bsp2);
            var result = subtract_bsp.toMesh(new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0xff0000}));
//
            $scope.glmol.modelGroup.add(result);
            $scope.glmol.show();
        }

        /* TEST Method */
        $scope.test = function () {
            Surface.getSurf('4TLM')
                .success(function (data) {
                    var raw = Surface.parser(data);
                    $scope.glmol.addSurf(raw, 0xff0000);
//                    var mesh = Surface.makeMesh(raw, 'red');
//                    console.log(mesh);
                })
        };

        /** Surface file reader */
        $scope.fileReader = function (event) {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                console.log('File reader is supported!');
                console.log(event);
            }
            else
                console.log('File reader API is not supported!');
        }

        /** ng-file-upload init */
        $scope.myModelObj;
        $scope.className = "dragover";
        $scope.onFileSelect = function ($files) {
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
                        $scope.$apply($scope.readerCallback(file, e.target.result));
                    }
                })(file);

                reader.readAsText(file);
            }
        };

        //toggle pdb object visibility
        $scope.vToggle = function (id) {
            console.log(id);
            $scope.glmol.vToggle(id);
//            console.log('toggle', id);
//            console.log(parentList);
//            var parent = $scope.pdbs[id];
//            parent.visible = !parent.visible;
//            // Traverse object
//            parent.traverse(function (child) {
//                // If child is parent, return
//                if(!(child instanceof THREE.Mesh))
//                    return;
//                // Else, it's a child
//                child.visible = parent.visible;
//            });
//
//            parentList.chains.forEach(function (chain) {
//                if(parent.visible === false) { // turned off
//                    console.log('OFF');
//                     $scope.chainUtil.bgOff(chain)
//                }
//                else { // turned on
//                    console.log('ON');
//                    $scope.chainUtil.bgOn(chain, parentList);
//                }
//            })
        }

        //toggle surf object visibility
        $scope.surfToggle = function (id) {
            console.log('toggle', id);
            $scope.surfs[id].visible = !$scope.surfs[id].visible;
        }

        $scope.chainUtil = {};
        // Toggle a pdb's chain visibility
        $scope.chainUtil.vToggle = function (pdbId, chain) {
            // Toggle visible
            var currentChain = _.where($scope.pdbs[pdbId].children, {'chainId': chain.id})[0];
            currentChain.visible = !currentChain.visible;
        }
        $scope.chainUtil.bgOff = function (chain) {
            chain.style['background-color'] = '#777';
        };
        $scope.chainUtil.bgOn = function (chain, parent) {
            chain.style['background-color'] = parent.style['border-top-color'];
        };
        // Change background-color
        $scope.chainUtil.bgToggle = function (chain, parent) {
            if (chain.style['background-color'] !== '#777') {
                chain.style['background-color'] = '#777';
            }
            else {
                chain.style['background-color'] = parent.style['border-top-color'];
            }
        }
        $scope.chainUtil.toggle = function (pdbId, chain, parent) {
            this.bgToggle(chain, parent);
            this.vToggle(pdbId, chain);
        }

        // =====================================================
        //  ==========
        // =====================================================
        console.log('Fetching 103M..');
        $scope.input.name = '103M';
        $scope.fetch('103M');
        // =====================================================
        //  ==========
        // =====================================================

    })
    .controller('canvasCtrl', function ($scope, clog) {
        clog('CANVAS CTRL INIT', 'info');
        $scope.nope = true;
        $scope.test = function () {
            console.log('Toggle...');
            $scope.nope = !$scope.nope;
        }
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