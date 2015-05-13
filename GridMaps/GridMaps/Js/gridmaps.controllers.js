angular.module("umbraco").controller("GridMapsEditorController", [

    "$scope",
    "$rootScope",
    "$timeout",
    "$routeParams",
    "assetsService",
    "notificationsService",

    function ($scope, $rootScope, $timeout, $routeParams, assetsService, notificationsService) {

        $scope.title = "Click to insert item";
        $scope.icon = "icon-location-nearby";
        $scope.guid = guid();

        var map,
            marker,
            place,
            geocoder,
            mapCenter;

        $scope.setValue = function (data) {
            $scope.control.value = data;
        };

        $scope.setValue($scope.control.value || {
            latitude: $scope.control.editor.config.defaultLat,
            longitude: $scope.control.editor.config.defaultLng,
            zoom: $scope.control.editor.config.defaultZoom
        });

        $timeout(function () {
            assetsService.loadJs('http://www.google.com/jsapi')
            .then(function () {
                google.load("maps", "3", { callback: initializeMap, other_params: "sensor=false&libraries=places" });
            });
        }, 200);

        function initializeMap() {
            mapCenter = new google.maps.LatLng($scope.control.value.latitude, $scope.control.value.longitude);

            var mapElement = document.getElementById($scope.guid + '_map');
            var mapOptions = { zoom: $scope.control.value.zoom, center: mapCenter, mapTypeId: google.maps.MapTypeId.ROADMAP };

            geocoder = new google.maps.Geocoder();
            map = new google.maps.Map(mapElement, mapOptions);

            marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng($scope.control.value.latitude, $scope.control.value.longitude),
                draggable: true
            });
            marker.setMap(map);

            lookupPosition(new google.maps.LatLng($scope.control.value.latitude, $scope.control.value.longitude));
            addMarkerDragEndListener();

            var lookupInputElement = document.getElementById($scope.guid + '_lookup');
            var options = {};

            place = new google.maps.places.Autocomplete(lookupInputElement, options);

            addPlaceChangedListener();
            addZoomChangedListener();
        }

        function addMarkerDragEndListener() {

            google.maps.event.addListener(marker, "dragend", function (e) {

                lookupPosition(marker.getPosition());
            });
        }

        function addPlaceChangedListener() {

            google.maps.event.addListener(place, 'place_changed', function () {
                var geometry = place.getPlace().geometry;

                if (geometry) {
                    var newLocation = place.getPlace().geometry.location;

                    if (marker != null) {
                        marker.setMap(null);
                    }

                    marker = new google.maps.Marker({
                        map: map,
                        position: newLocation,
                        draggable: true
                    });
                    marker.setMap(map);

                    lookupPosition(newLocation);
                    addMarkerDragEndListener();

                    map.setCenter(newLocation);
                    map.panTo(newLocation);
                }
            });
        }

        function addZoomChangedListener() {
            google.maps.event.addListener(map, 'zoom_changed', function () {
                $scope.control.value.zoom = map.getZoom();
            });
        }

        function lookupPosition(latLng) {
            geocoder.geocode({ 'latLng': latLng }, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) {

                    $rootScope.$apply(function () {
                        var newLat = marker.getPosition().lat();
                        var newLng = marker.getPosition().lng();

                        $scope.control.value.latitude = newLat;
                        $scope.control.value.longitude = newLng;
                        $scope.control.value.zoom = map.getZoom();
                    });
                } else {
                    notificationsService.error('Error while geocoding location');
                }
            });
        }

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
        }

        //Loading the styles
        assetsService.loadCss("~/app_plugins/GridMaps/Css/gmaps.css");
    }
]);