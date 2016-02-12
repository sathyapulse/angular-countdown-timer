angular.module('timer', [])
  .directive('timer', function() {
    return {
      restrict: 'EA',
      scope: {
        duration: '=',
        autostart: '=',
        interval: '=',
        timerControl: '=',
        startAt: '=',
      },
      replace: false,
      link: function(scope) {

      },

      controller: ['$scope', '$element', function($scope, $element) {
        $scope.$on('timer-start', function() {
          $scope.start();
        });

        $scope.$on('timer-resume', function() {
          $scope.resume();
        });

        $scope.$on('timer-stop', function() {
          $scope.stop();
        });

        $scope.$on('timer-clear', function() {
          $scope.clear();
        });

        $scope.$on('timer-reset', function() {
          $scope.reset();
        });

        $scope.$on('timer-set-countdown', function(e, countdown) {
          $scope.duration = $scope.remaningTime = countdown;
        });

        $scope.start = function() {
          if (!$scope.duration) {
            return false;
          }
          $scope.remaningTime = (typeof $scope.startAt !== 'undefined' && $scope.startAt != null) ? $scope.startAt : $scope.duration;
          tick();
          $scope.isRunning = true;
        };

        $scope.resume = $element[0].resume = function() {
          if ($scope.remaningTime <= 0) {
            return;
          }
          resetTimeout();
          tick();
          $scope.isRunning = true;
        };

        $scope.stop = $scope.pause = $element[0].stop = $element[0].pause = function() {
          var timeoutId = $scope.timeoutId;
          $scope.clear();
          $scope.$emit('timer-stopped', {
            timeoutId: timeoutId,
            millis: $scope.millis,
            seconds: $scope.seconds,
            minutes: $scope.minutes,
            hours: $scope.hours,
          });
        };

        $scope.clear = $element[0].clear = function() {
          // same as stop but without the event being triggered
          resetTimeout();
          $scope.timeoutId = null;
          $scope.isRunning = false;
        };

        function resetTimeout() {
          if ($scope.timeoutId) {
            clearTimeout($scope.timeoutId);
          }
        }
        $element.bind('$destroy', function() {
          resetTimeout();
          $scope.isRunning = false;
        });

        var tick = function tick() {
		  if($scope.timerControl.onTick) {
			$scope.timerControl.onTick(calculateTimeUnits());
		  }
          $scope.$emit('timer-tick', {
            timeoutId: $scope.timeoutId,
            remaningTime: $scope.remaningTime,
            totalTime: $scope.duration
          });
          if ($scope.remaningTime <= 0) {
            $scope.stop();
            calculateTimeUnits();
            if ($scope.timerControl && $scope.timerControl.onStop) {
              $scope.timerControl.onStop();
            }
            return;
          }
          //We are not using $timeout for a reason. Please read here - https://github.com/siddii/angular-timer/pull/5
          $scope.timeoutId = setTimeout(function() {
            tick();
            $scope.$digest();
          }, $scope.interval);



          if ($scope.remaningTime > 0) {
            $scope.remaningTime--;
          }

        };

        function calculateTimeUnits() {
          $scope.millis = $scope.remaningTime * 1000;
          $scope.seconds = Math.floor(($scope.remaningTime) % 60);
          $scope.minutes = Math.floor((($scope.remaningTime / (60)) % 60));
          $scope.hours = Math.floor($scope.remaningTime / 3600);

          return {
            "millis": $scope.millis,
            "seconds": $scope.seconds,
            "minutes": $scope.minutes,
            "hours": $scope.hours
          };
        }
      }]
    };
  });
