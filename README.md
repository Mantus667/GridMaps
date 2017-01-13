# GridMaps

GridMaps Grid Editor for Umbraco

GridMaps is a simple grid editor for Google Maps that allows content editors to visualize Google Maps in the grid.

__Release Downloads__ 

NuGet Package: [![NuGet release](https://img.shields.io/nuget/v/GridMaps.svg)](https://www.nuget.org/packages/GridMaps/) 
Umbraco Package: [![Our Umbraco project page](https://img.shields.io/badge/our-umbraco-orange.svg)](https://our.umbraco.org/projects/website-utilities/gridmaps) 

__Installation__

Install the package and add the Google Maps script to your master layout.

    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initializeMap" async defer></script>
    
__Settings__

Remember to update the settings in `~/config/grid.editors.config.js"`

You will need to set the `defaultApiKey` to a Google Maps API Key. [Google - Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)
