var nameApp = angular.module('ionicApp', ['ionic', 'ui.router']);

nameApp.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tabs.camera', {
      url: '/camera',
      views: {
        'camera-tab': {
          controller: 'CameraTabCtrl',
          templateUrl: 'templates/camera.html'
        }
      }
    })

    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',

    })
    .state('tabs.home', {
      url: '/home',

      views: {
        'home-tab': {
          templateUrl: 'templates/home.html',
          controller: 'HomeTabCtrl'
        }
      }

    })
    .state('tabs.setting', {
      url: '/setting',
      views: {
        'setting-tab': {
          templateUrl: 'templates/setting.html'
        }
      }
    })

  $urlRouterProvider.otherwise('/tab/home');

})

  nameApp.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading) {

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

  });

nameApp.controller('CameraTabCtrl', function($scope, $state, $timeout, $ionicLoading) {
  console.log('CameraTabCtrl');
  $scope.changePage = function () {
    startWebcam();
    startSnapshot();
    // Setup the loader
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    // Set a timeout to clear loader
    $timeout(function () {
      $ionicLoading.hide();
    }, 2500);

    $timeout(function () {
      $scope.myVar = true;
    }, 2500);
  }




  $scope.stopSnapshot = function () {
    stopSnapshot();
    $scope.myVar = false;

  }

  $scope.clearCanvas = function () {
    var canvas = document.getElementById("resultCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  }

  var canvas = document.getElementById("resultCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");

});




    nameApp.controller('HomeTabCtrl', function($scope, $state, $ionicLoading, $timeout) {
      console.log('HomeTabCtrl');
      $scope.changePage = function () {
        startWebcam();
        startSnapshot();
        // Setup the loader
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });

        // Set a timeout to clear loader
        $timeout(function () {
          $ionicLoading.hide();
        }, 2500);

        $timeout(function () {
          $scope.myVar = true;
        }, 2500);
      }

      $scope.stopSnapshot = function () {
        stopSnapshot();
        $scope.myVar = false;

      }

    });




var video;
var webcamStream;
var MediaStream;
var paused;


function startWebcam() {
  // Prefer camera resolution nearest to 1280x720.
  // Require rear camera on mobile devices.

  var constraints = { audio: false, video: {
    facingMode: { exact: "environment" },
  } };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia (constraints)
    // successCallback
      .then(function(localMediaStream) {
          video = document.querySelector('video');
          video.src = window.URL.createObjectURL(localMediaStream);
          MediaStream = localMediaStream.getTracks()[0]; // create the stream tracker
          webcamStream = localMediaStream;

        },

        // errorCallback
        function(err) {
          console.log("The following error occured: " + err);
        }
      );
  } else {
    console.log("getUserMedia not supported");
  }
}

function stopWebcam() {
  MediaStream.stop();
}
//---------------------
// TAKE A SNAPSHOT CODE
//---------------------
var canvas, ctx;

function init() {
  // Get the canvas and obtain a context for
  // drawing in it
  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');
  canvas.style.display="none";
}

function stopSnapshot(){
  paused = true;
}

function startSnapshot(){
  paused = false;
}

function showAlert(data) {
  var canvas = document.getElementById("resultCanvas");
  var ctx = canvas.getContext("2d");
  var maxWidth = 400;
  var lineHeight = 60;
  var x = 20; // (canvas.width - maxWidth) / 2;
  var y = 58;
  ctx.font = "15px Comic Sans MS";
  ctx.fillStyle = "red";
  wrapText(ctx, data, x, y, maxWidth, lineHeight);
  // Set canvas dimensions
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var cars = text.split("\n");

  for (var ii = 0; ii < cars.length; ii++) {

    var line = "";
    var words = cars[ii].split(" ");

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;

      if (testWidth > maxWidth) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }

    context.fillText(line, x, y);
    y += lineHeight;
  }
}

namespace = '/test';
// Connect to the Socket.IO server.
// The connection URL has the following format:
//     http[s]://<domain>:<port>[/<namespace>]
var socket = io.connect('http://192.168.0.234:8080');
timer = setInterval(
  function snapshot() {
    if(paused) return;
    // Draws current image from the video element into the canvas
    ctx.drawImage(video, 0,0, canvas.width, canvas.height);
    var frame = canvas.toDataURL("image/png");
    console.log(frame.substring(0, 50));
    socket.emit('frame', frame);
    var date = new Date();
    var time = date.getHours();
    socket.emit('time', time);
    var day = date.getDay();
    socket.emit('day', day);
  }, 2000);

// Event handler for new connections.
// The callback function is invoked when a connection with the
// server is established.
socket.on('failure', function(data) {
  stopSnapshot();
  showAlert(data);
  stopWebcam();
  //modal.show();
});

socket.on('result', function(data) {
  stopSnapshot();
  stopWebcam();
  showAlert(data);
  //modal.show();
});

socket.on('frame', function(data) {
  socket.emit('frame', frame);
});

socket.on('connect', function() {
  socket.send('User has connected!');
});


socket.on('message', function(msg) {
  $("#messages").append('<li>'+msg+'</li>');
});

$('#sendbutton').on('click', function() {
  socket.send($('#myMessage').val());
  $('#myMessage').val('');
});






