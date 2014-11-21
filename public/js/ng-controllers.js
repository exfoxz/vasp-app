/**
 *
 * Created by sam on 31/08/2014.
 */

'use strict';
angular.module('app.controllers', [])
    .controller('mainCtrl', function ($scope, $http, $timeout, $q, Rainbow, $location, promiseWrapper, Surface) {
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
        var serverUrl = 'http://vaspapp.com:8000/';

        function init(scope) {
            //dummy object for input
            scope.input = {};
            scope.show = {
                dropzone: true,
                surfaces: false,
                structures: false
            };
            //list of pdbs
            scope.pdbList = [];
            //list of pdbs meshes
            scope.pdbs = {};
            //list of surfaces
            scope.surfaces = [];
            //list of surf meshes
            scope.surfs = {};

            scope.progress = {};
        };

        init($scope);

        /** reset $scope.input */
        $scope.input.reset = function () {
            $scope.input.name = '';
        };
        //welcome message
        $scope.welcomeMessage = "<- Enter a protein's name and click Go! to get started!";

        //an array of colors for proteins
        $scope.colors = ['red', 'blue', 'green', 'yellow', 'black'];
        //color index for pdb
        $scope.colorIndex = 0;
        //color index for surf
        $scope.surfColorIndex = 0;

        /** Get atoms from server and add it to scene */
        $scope.fetch = function (id) {
//            check for undefined or empty input
            if ($scope.input.name == undefined || $scope.input.name == '') {
                console.log('NO NAME');
                }
            else {
                $scope.fetchPdbAsync(id)
                    .success(function (data) {
                        console.log('Fetching', id, 'done.')
                        var currentPDB = {id: id, style: {'border-top-color': $scope.currentColor}, chains: []};
                        $scope.pdbList.push(currentPDB);
                        $scope.show.structures = true;
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
//                        $scope.setColor($scope.colorIndex++);
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
            //reset input
            $scope.input.reset();
            console.log('fetching... ' + id);
            return $http.get(serverUrl + 'pdbs2/' + id);
        };

        /** Get pdb with id and add to scene  */
        $scope.fetchPdbAsync = function (id) {
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
            $scope.glmol.vToggle(id);
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