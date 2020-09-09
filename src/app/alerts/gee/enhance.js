/**
 * 
 */
exports.linear2perc = function (image) {

    var min = image.reduceRegion({
        reducer: ee.Reducer.percentile([2]),
        geometry: image.geometry(),
        maxPixels: 1e13,
        scale: 30
    });

    var max = image.reduceRegion({
        reducer: ee.Reducer.percentile([98]),
        geometry: image.geometry(),
        maxPixels: 1e13,
        scale: 30
    });

    var r = image.select('r').unitScale(min.get('r'), max.get('r')).multiply(255).round().byte();
    var g = image.select('g').unitScale(min.get('g'), max.get('g')).multiply(255).round().byte();
    var b = image.select('b').unitScale(min.get('b'), max.get('b')).multiply(255).round().byte();

    var imageEnhanced = ee.Image.cat(r, g, b)
        .visualize()
        .rename(['r', 'g', 'b']);

    return ee.Image(imageEnhanced.copyProperties(image));
};

/**
 * 
 */
exports.linear2percByRegion = function (image, region) {

    var min = image.reduceRegion({
        reducer: ee.Reducer.percentile([2]),
        geometry: region,
        maxPixels: 1e13,
        scale: 30
    });

    var max = image.reduceRegion({
        reducer: ee.Reducer.percentile([98]),
        geometry: region,
        maxPixels: 1e13,
        scale: 30
    });

    var r = image.select('r').unitScale(min.get('r'), max.get('r')).multiply(255).round().byte();
    var g = image.select('g').unitScale(min.get('g'), max.get('g')).multiply(255).round().byte();
    var b = image.select('b').unitScale(min.get('b'), max.get('b')).multiply(255).round().byte();

    var imageEnhanced = ee.Image.cat(r, g, b)
        .visualize()
        .rename(['r', 'g', 'b']);

    return ee.Image(imageEnhanced.copyProperties(image));
};