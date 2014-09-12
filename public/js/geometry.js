/**
 * Created by sam on 26/07/2014.
 */

// Copyright 2009 Nicholas C. Zakas. All rights reserved.
// MIT Licensed
THREE.timedChunk = function timedChunk(items, process, context, callback){
    var todo = items.concat();   //create a clone of the original

    setTimeout(function(){
        var start = +new Date();
        do {
            process.call(context, todo.shift());
        } while (todo.length > 0 && (+new Date() - start < 50));
//        console.log('Yeild to UI')
        if (todo.length > 0){
//            console.log('Create another timer')
            setTimeout(arguments.callee, 0);
        } else {
            callback(items, context);
        }
    }, 25);
};

// Sam Nguyen
THREE.BulkSphereGeometry = function (atoms, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) {
    console.time('Bulking Sphere Geometry');
    var that = this;
    THREE.Geometry.call( this );
    this.parameters = {
//        radius: radius,
        widthSegments: widthSegments,
        heightSegments: heightSegments,
        phiStart: phiStart,
        phiLength: phiLength,
        thetaStart: thetaStart,
        thetaLength: thetaLength
    };
    widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
    heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

    phiStart = phiStart !== undefined ? phiStart : 0;
    phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

    function process(atom) { //center with x, y, z
        var scope = this;
        var x, y, vertices = [], uvs = [];
        var startIndex = scope.vertices.length;
        var radius = atom.radius || 50;
        for (y = 0; y <= heightSegments; y++) {

            var verticesRow = [];
            var uvsRow = [];

            for (x = 0; x <= widthSegments; x++) {

                var u = x / widthSegments;
                var v = y / heightSegments;

                var vertex = new THREE.Vector3();
                vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
                vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

                scope.vertices.push(vertex);
                verticesRow.push(scope.vertices.length - 1);
                uvsRow.push(new THREE.Vector2(u, 1 - v));

            }

            vertices.push(verticesRow);
            uvs.push(uvsRow);

        }

        for (y = 0; y < heightSegments; y++) {

            for (x = 0; x < widthSegments; x++) {

                var v1 = vertices[ y ][ x + 1 ];
                var v2 = vertices[ y ][ x ];
                var v3 = vertices[ y + 1 ][ x ];
                var v4 = vertices[ y + 1 ][ x + 1 ];

                var n1 = scope.vertices[ v1 ].clone().normalize();
                var n2 = scope.vertices[ v2 ].clone().normalize();
                var n3 = scope.vertices[ v3 ].clone().normalize();
                var n4 = scope.vertices[ v4 ].clone().normalize();

                var uv1 = uvs[ y ][ x + 1 ].clone();
                var uv2 = uvs[ y ][ x ].clone();
                var uv3 = uvs[ y + 1 ][ x ].clone();
                var uv4 = uvs[ y + 1 ][ x + 1 ].clone();

                if (Math.abs(scope.vertices[ v1 ].y) === radius) {

                    uv1.x = ( uv1.x + uv2.x ) / 2;
                    scope.faces.push(new THREE.Face3(v1, v3, v4, [ n1, n3, n4 ]));
                    scope.faceVertexUvs[ 0 ].push([ uv1, uv3, uv4 ]);

                } else if (Math.abs(scope.vertices[ v3 ].y) === radius) {

                    uv3.x = ( uv3.x + uv4.x ) / 2;
                    scope.faces.push(new THREE.Face3(v1, v2, v3, [ n1, n2, n3 ]));
                    scope.faceVertexUvs[ 0 ].push([ uv1, uv2, uv3 ]);

                } else {

                    scope.faces.push(new THREE.Face3(v1, v2, v4, [ n1, n2, n4 ]));
                    scope.faceVertexUvs[ 0 ].push([ uv1, uv2, uv4 ]);

                    scope.faces.push(new THREE.Face3(v2, v3, v4, [ n2.clone(), n3, n4.clone() ]));
                    scope.faceVertexUvs[ 0 ].push([ uv2.clone(), uv3, uv4.clone() ]);
                }

            }

        }

        //TODO: make apply translation a seperate function
        //apply translation
        for ( var i = startIndex, il = scope.vertices.length; i < il; i ++ ) {
            var vertex = scope.vertices[ i ];
            vertex.applyMatrix4(new THREE.Matrix4().makeTranslation(atom.x, atom.y, atom.z));
        }
    }
    this.init = function () {
        return new Promise(function (resolve, reject) {
            THREE.timedChunk(atoms, process, that, function (items, context) {
                console.log('DONE');
                console.log(context);
                context.computeFaceNormals();
//              TODO: calculate boundingSphere
                // context.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );
                console.timeEnd('Bulking Sphere Geometry');
                resolve(context);
            })
        })
    }
};

THREE.BulkSphereGeometry.prototype = Object.create( THREE.Geometry.prototype );