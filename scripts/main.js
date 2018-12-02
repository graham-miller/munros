var defaultZoom = 7;
var defaultMinZoom = 6;
var defaultMaxZoom = 18;
var defaultCentreLatitude = 57.3;
var defaultCentreLongitude = -4.4;
var maxBoundsOffset = 5;
var mapboxAccessToken = 'pk.eyJ1IjoiZ3JhaGFtbSIsImEiOiJjaXlycWtsMngwMDEwMzJwZG1uMXo2MDYzIn0.J3GVX8t4ofuxKz4hLpggYw';
var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';

function bootstrap() {
    var map = L.map('map', {
        attributionControl: false,
        center: [defaultCentreLatitude, defaultCentreLongitude],
        zoom: defaultZoom,
        minZoom: defaultMinZoom,
        maxZoom: defaultMaxZoom
    });

    addBaseLayersAndOverlaysTo(map);
    addMapboxLogoTo(map);
    addCustomAttributionTo(map);
}

function addBaseLayersAndOverlaysTo(map) {

    var mapBoxTileLayers = getMapBoxTileLayers();
    map.addLayer(mapBoxTileLayers.outdoors);

    var regionLayerGroups = getRegionLayerGroups();
    regionLayerGroups.forEach(x => { x.addTo(map); });

    var baseLayers = {
        'Outdoors': mapBoxTileLayers.outdoors,
        'Run/bike/hike': mapBoxTileLayers.runBikeHike,
        'Aerial': mapBoxTileLayers.satellite,
        'Aerial with streets': mapBoxTileLayers.streetsSatellite,
        'Streets': mapBoxTileLayers.streets,
    };
    
    var munrosOverlays = { "Munros" : {} };
    regionLayerGroups.forEach(x => { munrosOverlays.Munros[x.title] = x; });

    var layerControlOptions = { groupCheckboxes: true };
    L.control.groupedLayers(baseLayers, munrosOverlays, layerControlOptions).addTo(map);

   L.osGraticule({}).addTo(map);
}

function getMapBoxTileLayers() {
    return {
        outdoors: L.tileLayer(mapboxUrl, {id: 'mapbox.outdoors', accessToken: mapboxAccessToken}),
        runBikeHike: L.tileLayer(mapboxUrl, {id: 'mapbox.run-bike-hike', accessToken: mapboxAccessToken}),
        satellite: L.tileLayer(mapboxUrl, {id: 'mapbox.satellite', accessToken: mapboxAccessToken}),
        streetsSatellite: L.tileLayer(mapboxUrl, {id: 'mapbox.streets-satellite', accessToken: mapboxAccessToken}),
        streets: L.tileLayer(mapboxUrl, {id: 'mapbox.streets', accessToken: mapboxAccessToken}),
        // mapbox.light, mapbox.dark, mapbox.wheatpaste, mapbox.streets-basic, mapbox.comic, mapbox.pencil, mapbox.pirates, mapbox.emerald, mapbox.high-contrast
   };
}

function getRegionLayerGroups() {

    var regionLayerGroups = []

    regions.forEach ((region) => {

        var regionTitle = region.number + " - " + region.name;
        var layerGroup = L.layerGroup();
        layerGroup.title = regionTitle;
        regionLayerGroups.push(layerGroup);

        region.munros.forEach(munro => {

            var munroIcon = L.divIcon({className: 'munro-icon'});
            var munroClimbedIcon = L.divIcon({className: 'munro-icon climbed'});
            var marker = L.marker([munro.latitude, munro.longitude], {icon: munro.climbed ? munroClimbedIcon : munroIcon});
            var popUpText =
                "<span class=\"popup-title\">" + munro.rank + ". " + munro.name + " (" + munro.height.toLocaleString('en-GB') + "m)</span><br />" + 
                "<span class=\"popup-region\">Region: " + regionTitle + "</span><br />" +
                "<span class=\"popup-meaning\">Meaning: " + munro.meaning + "</span>";

            marker.bindPopup(popUpText)
            marker.addTo(layerGroup)
        });

    });

    return regionLayerGroups;
}

function addMapboxLogoTo(map) {

    L.Control.MapboxLogo = L.Control.extend({
        onAdd: function() {
            var link = L.DomUtil.create('a', 'mapbox-wordmark');
            link.href = '../../docs/images/logo.png';
            link.target = '_blank';
            link.innerText = "Mapbox";
            return link;
        },
    
        onRemove: function() { }
    });
    
    L.control.mapboxLogo = function(opts) {
        return new L.Control.MapboxLogo(opts);
    }
    
    L.control.mapboxLogo({ position: 'bottomleft' }).addTo(map);
}

function addCustomAttributionTo(map) {

    L.Control.OsmAttribution = L.Control.extend({
        onAdd: function() {
            
            var wrapper = L.DomUtil.create('div', 'mapbox-attribution leaflet-control-layers');

            var link1 = L.DomUtil.create('a', '', wrapper);
            link1.href = 'https://www.mapbox.com/about/maps/';
            link1.target = '_blank';
            link1.innerText = '© Mapbox';

            var spacer1 = L.DomUtil.create('span', '', wrapper);
            spacer1.innerText = ' · ';

            var link2 = L.DomUtil.create('a', '', wrapper);
            link2.href = 'http://www.openstreetmap.org/copyright';
            link2.target = '_blank';
            link2.innerText = '© OpenStreetMap';

           var spacer2 = L.DomUtil.create('span', '', wrapper);
            spacer2.innerText = ' · ';

            var link3 = L.DomUtil.create('a', '', wrapper);
            link3.href = 'https://www.mapbox.com/map-feedback/';
            link3.target = '_blank';
            link3.innerText = 'Improve this map';

            return wrapper;
        },
    
        onRemove: function() { }
    });
    
    L.control.osmAttribution = function(opts) {
        return new L.Control.OsmAttribution(opts);
    }
    
    L.control.osmAttribution({ position: 'bottomright' }).addTo(map);
}
