angular.module("umbraco").controller("GridMapsEditorController", [

    "$scope",
    "$rootScope",
    "$timeout",
    "$routeParams",
    "assetsService",
    "notificationsService",
    "GridMapsDialogService",

function ($scope, $rootScope, $timeout, $routeParams, assetsService, notificationsService, GridMapsDialogService) {

        $scope.title = "Click to insert item";
        $scope.icon = "icon-location-nearby";
        $scope.guid = guid();

        var map,
            marker,
            place,
            geocoder,
            mapCenter,
            mapElement,
            panorama;

        $scope.openSettings = function () {
            GridMapsDialogService.open({
                dialogData: { zoom: $scope.control.value.zoom, mapType: $scope.control.value.mapType, height: $scope.control.value.height, streetView: $scope.control.value.streetView },
                callback: function (data) {
                    $scope.control.value.zoom = parseInt(data.zoom);
                    $scope.control.value.mapType = data.mapType;
                    $scope.control.value.height = parseInt(data.height);
                    $scope.control.value.streetView = data.streetView;

                    UpdateMap();                    
                }
            });
        };

        $scope.setValue = function (data) {
            $scope.control.value = data;
        };

        $scope.setValue($scope.control.value || {
            latitude: $scope.control.editor.config.defaultLat,
            longitude: $scope.control.editor.config.defaultLng,
            zoom: $scope.control.editor.config.defaultZoom,
            mapType: $scope.control.editor.config.defaultMapType,
            height: $scope.control.editor.config.defaultHeight,
            streetView: $scope.control.editor.config.showAsStreetView
        });

        $timeout(function () {
            assetsService.loadJs('http://www.google.com/jsapi')
            .then(function () {
                google.load("maps", "3", { callback: initializeMap, other_params: "sensor=false&libraries=places" });
            });
        }, 200);

        function initializeMap() {
            mapCenter = new google.maps.LatLng($scope.control.value.latitude, $scope.control.value.longitude);

            mapElement = document.getElementById($scope.guid + '_map');

            var mapOptions = {
                streetViewControl: false,
                mapTypeControl: false,
                zoom: $scope.control.value.zoom,
                center: mapCenter,
                mapTypeId: google.maps.MapTypeId[$scope.control.value.mapType]
            };
            var panoramaOptions = { position: mapCenter };

            geocoder = new google.maps.Geocoder();
            map = new google.maps.Map(mapElement, mapOptions);

            marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng($scope.control.value.latitude, $scope.control.value.longitude),
                draggable: true
            });
            marker.setMap(map);            
            
            panorama = new google.maps.StreetViewPanorama(mapElement, panoramaOptions);
            map.setStreetView(panorama);          

            lookupPosition(mapCenter);
            addMarkerDragEndListener();

            var lookupInputElement = document.getElementById($scope.guid + '_lookup');
            var options = {};

            place = new google.maps.places.Autocomplete(lookupInputElement, options);

            addPlaceChangedListener();
            addZoomChangedListener();

            UpdateMap();
        }

        function UpdateMap() {
            map.setMapTypeId(google.maps.MapTypeId[$scope.control.value.mapType]);
            map.setZoom($scope.control.value.zoom);
            $(mapElement).css('height', $scope.control.value.height);            

            panorama.setVisible(false);
            if ($scope.control.value.streetView) {
                panorama.setVisible(true);
            }
            map.setZoom($scope.control.value.zoom);
            google.maps.event.trigger(map, 'resize')
            map.setCenter(mapCenter);
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

angular.module("umbraco").controller("GridMapsEditorDialogController", [
    "$scope",
    "$rootScope",
    "$timeout",
    "$routeParams",

    function ($scope, $rootScope, $timeout, $routeParams) {

        $scope.save = function () {

            // Make sure form is valid
            if (!$scope.gmgeForm.$valid)
                return;

            $scope.submit($scope.dialogData);
        };
    }
]);