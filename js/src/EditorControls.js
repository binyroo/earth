/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.EditorControls = function ( object, domElement ) {

  domElement = ( domElement !== undefined ) ? domElement : document;

  // API

  this.enabled = true;

  // internals

  var scope = this;
  var vector = new THREE.Vector3();

  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
  var state = STATE.NONE;

  var center = new THREE.Vector3();
  var normalMatrix = new THREE.Matrix3();
  var pointer = new THREE.Vector2();
  var pointerOld = new THREE.Vector2();

  // events

  var changeEvent = { type: 'change' };

  this.focus = function ( target ) {

    center.getPositionFromMatrix( target.matrixWorld );
    object.lookAt( center );

    scope.dispatchEvent( changeEvent );

  };

  this.pan = function ( distance ) {

    normalMatrix.getNormalMatrix( object.matrix );

    distance.applyMatrix3( normalMatrix );
    distance.multiplyScalar( vector.copy( center ).sub( object.position ).length() * 0.001 );

    object.position.add( distance );
    center.add( distance );

    scope.dispatchEvent( changeEvent );

  };

  this.zoom = function ( distance ) {

    normalMatrix.getNormalMatrix( object.matrix );

    distance.applyMatrix3( normalMatrix );
    distance.multiplyScalar( vector.copy( center ).sub( object.position ).length() * 0.001 );

    object.position.add( distance );

    scope.dispatchEvent( changeEvent );

  };

  this.rotate = function ( delta ) {

    vector.copy( object.position ).sub( center );

    var theta = Math.atan2( vector.x, vector.z );
    var phi = Math.atan2( Math.sqrt( vector.x * vector.x + vector.z * vector.z ), vector.y );

    theta += delta.x;
    phi += delta.y;

    var EPS = 0.000001;

    phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

    var radius = vector.length();

    vector.x = radius * Math.sin( phi ) * Math.sin( theta );
    vector.y = radius * Math.cos( phi );
    vector.z = radius * Math.sin( phi ) * Math.cos( theta );

    object.position.copy( center ).add( vector );

    object.lookAt( center );

    scope.dispatchEvent( changeEvent );

  };

  // mouse

  function onMouseDown( event ) {

    if ( scope.enabled === false ) return;

    event.preventDefault();

    if (event.shiftKey) {
      state = STATE.PAN;
    } else {
      state = STATE.ROTATE;
    }
/*
    if ( event.button === 0 ) {

      state = STATE.ROTATE;

    } else if ( event.button === 1 ) {

      state = STATE.ZOOM;

    } else if ( event.button === 2 ) {

      state = STATE.PAN;

    }
*/
    pointerOld.set( event.clientX, event.clientY );

    domElement.addEventListener( 'mousemove', onMouseMove, false );
    domElement.addEventListener( 'mouseup', onMouseUp, false );
    domElement.addEventListener( 'mouseout', onMouseUp, false );

  }

  function onMouseMove( event ) {

    if ( scope.enabled === false ) return;

    event.preventDefault();

    pointer.set( event.clientX, event.clientY );

    var movementX = pointer.x - pointerOld.x;
    var movementY = pointer.y - pointerOld.y;

    if ( state === STATE.ROTATE ) {

      scope.rotate( new THREE.Vector3( - movementX * 0.005, - movementY * 0.005, 0 ) );

    } else if ( state === STATE.ZOOM ) {

      scope.zoom( new THREE.Vector3( 0, 0, movementY ) );

    } else if ( state === STATE.PAN ) {

      scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

    }

    pointerOld.set( event.clientX, event.clientY );

  }

  function onMouseUp( event ) {

    if ( scope.enabled === false ) return;

    domElement.removeEventListener( 'mousemove', onMouseMove, false );
    domElement.removeEventListener( 'mouseup', onMouseUp, false );
    domElement.removeEventListener( 'mouseout', onMouseUp, false );

    state = STATE.NONE;

  }

  function onMouseWheel( event ) {

    // if ( scope.enabled === false ) return;

    var delta = 0;

    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

      delta = - event.wheelDelta;

    } else if ( event.detail ) { // Firefox

      delta = event.detail * 10;

    }

    scope.zoom( new THREE.Vector3( 0, 0, delta ) );

  }

  domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
  domElement.addEventListener( 'mousedown', onMouseDown, false );
  domElement.addEventListener( 'mousewheel', onMouseWheel, false );
  domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

};

THREE.EditorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
