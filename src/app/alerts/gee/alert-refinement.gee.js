
var Enhance = require('./enhance.js');

/**
 * Alert Refinament Class
 * 
 * @class EvidencesService
 */
var GeeAlertRefinement = function () {

	var visParams = {
		bands: ['r', 'g', 'b'],
		gamma: 1.4,
		format: 'png'
	};

	var visParamsAlert = {
		format: 'png'
	};

	var styleAlert = {
		color: 'ff0000',
		fillColor: '00000000',
		width: 2
	};

	/**
	 * 
	 * @param {Object} obj - A JSON object
	 */
	var loadFeatureCollection = function (obj) {

		var featureCollection = ee.FeatureCollection(
			obj.features.map(
				function (feature) {
					return ee.Feature(feature);
				}
			)
		);

		return featureCollection;
	};

	/**
	 * Loads the before and after images
	 * 
	 * @param {ee.Image} imagesBefore 
	 * @param {ee.Image} imagesAfter
	 */
	var loadImages = function (imagesBefore, imagesAfter) {

		var before = ee.ImageCollection.fromImages(
			imagesBefore.map(
				function (imageName) {
					return ee.Image(imageName);
				}
			)
		);

		var after = ee.ImageCollection.fromImages(
			imagesAfter.map(
				function (imageName) {
					return ee.Image(imageName);
				}
			)
		);

		return {
			before: before.mosaic(),
			after: after.mosaic(),
		}

	};

	var loadImagesV2 = function (imagesBefore, imagesAfter) {

		var _imagesBefore = imagesBefore.map(function (imagePath) {
			return {
				imageId: imagePath.split('/').reverse()[0],
				collection: imagePath.replace('/' + imagePath.split('/').reverse()[0], '')
			}
		});

		var _imagesAfter = imagesAfter.map(function (imagePath) {
			return {
				imageId: imagePath.split('/').reverse()[0],
				collection: imagePath.replace('/' + imagePath.split('/').reverse()[0], '')
			}
		});

		var before = ee.ImageCollection.fromImages(
			_imagesBefore.map(
				function (image) {
					return ee.ImageCollection(image.collection)
						.filterMetadata('system:index', 'contains', image.imageId)
						.sort('system:index', false)
						.first();
				}
			)
		);

		var after = ee.ImageCollection.fromImages(
			_imagesAfter.map(
				function (image) {

					var _img = ee.ImageCollection(image.collection)
					.filterMetadata('system:index', 'contains', image.imageId)
					.sort('system:index', false);					
					
					return ee.ImageCollection(image.collection)
						.filterMetadata('system:index', 'contains', image.imageId)
						.sort('system:index', false)
						.first();
				}
			)
		);

		return {
			before: before.mosaic(),
			after: after.mosaic(),
		}

	};

	/**
	 * Enhances an image applying a 2% streching
	 * 
	 * @param {ee.Image} image
	 * @param {ee.Geometry} geometry
	 * @returns {ee.Image} imageEnhanced
	 */
	var enhance = function (image, geometry) {

		var imageEnhanced = Enhance.linear2percByRegion(
			image.select(['R', 'G', 'B'], ['r', 'g', 'b']),
			geometry
		);

		return imageEnhanced;
	};

	/**
	 * Compute the NDVI index
	 * @param {*} image 
	 */
	var getNDVI = function (image) {

		var ndvi = image.expression('float(nir - red)/(nir + red)', {
			'nir': image.select(['N']),
			'red': image.select(['R'])
		});

		// reescale to min = 0 and max = 100
		ndvi = ndvi.add(1).multiply(100).toUint8();

		return image.addBands(ndvi.rename(['NDVI']));
	};

	/**
	 * Apply a spatial filter in order to remove noised pixels
	 * 
	 * @param {*} classification 
	 * @param {*} deforestationSize 
	 * @param {*} notDeforestationSize 
	 */
	var spatialFilterApply = function (classification, deforestationSize, notDeforestationSize) {

		var noiseDeforestation = classification.mask(classification.eq(1))
			.connectedComponents(ee.Kernel.circle(3), deforestationSize)
			.select('labels');

		var noiseNotDeforestation = classification.mask(classification.eq(2))
			.connectedComponents(ee.Kernel.circle(3), notDeforestationSize)
			.select('labels');

		classification = classification.where(noiseDeforestation.neq(0), 2);
		classification = classification.where(noiseNotDeforestation.neq(0), 1);

		return classification;
	};

	/**
	 * Convert an image classification to vector
	 * 
	 * @param {ee.Image} raster 
	 * @param {Integer} classe 
	 * @param {ee.Geometry} geometry 
	 * @param {Float} scale 
	 */
	var raster2vector = function (raster, classe, geometry, scale) {

		var vector = raster
			.reduceToVectorsStreaming({
				geometry: geometry,
				scale: scale,
				geometryType: 'polygon',
				bestEffort: true,
				maxPixels: 1e13,
				tileScale: 4
			});

		var alert = ee.FeatureCollection(vector.filter(ee.Filter.eq('label', classe)));

		alert = ee.FeatureCollection(ee.Feature(alert.geometry()));

		return alert;
	};

	/**
	 * Get a sample points collection
	 * 
	 * @param {ee.Image} image 
	 * @param {ee.FeatureCollection} samplesPolygons 
	 * @param {Float} scale 
	 * @param {Integer} nPoints 
	 * @param {List} classValues 
	 * @param {List} classPoints 
	 * @param {Float} seed 
	 */
	var samplingPoints = function (image, samplesPolygons, scale, nPoints, classValues, classPoints, seed) {

		var samplesRaster = ee.Image()
			.int16()
			.paint({
				featureCollection: samplesPolygons,
				color: 'classe'
			})
			.rename(['classe']);

		var samples = samplesRaster
			.addBands(image)
			.stratifiedSample({
				'numPoints': nPoints,
				'classBand': 'classe',
				'region': samplesPolygons.geometry(),
				'scale': scale,
				'seed': seed,
				'classValues': classValues,
				'classPoints': classPoints,
				'dropNulls': true,
			});

		return samples;

	};

	/**
	 * Classify deforestation using a couple of images
	 * 
	 * @param {ee.Image} imageBefore 
	 * @param {ee.Image} imageAfter
	 * @param {ee.FeatureCollection} samplesPolygons 
	 * @param {Object} params 
	 */
	var classify = function (imageBefore, imageAfter, samplesPolygons, params) {

		var before = getNDVI(imageBefore);
		var after = getNDVI(imageAfter);

		var imageChange = before.addBands(after);

		var samples = samplingPoints(imageChange, samplesPolygons,
			params.scale,
			params.nPoints,
			params.classValues,
			params.classPoints,
			params.seed);

		var classifier = ee.Classifier.randomForest(params.nTrees, 1)
			.train(samples, 'classe', [
				'B',
				'G',
				'R',
				'NDVI',
				'B_1',
				'G_1',
				'R_1',
				'NDVI_1'
			]);

		var classified = imageChange.classify(classifier);

		classified = spatialFilterApply(classified,
			params.deforestationSize,
			params.notDeforestationSize);

		return classified;

	};

	/**
	 * Enhance the images used in classification (just for visualization)
	 * 
	 * @param {Object} params
	 * @param {Function} callback
	 */
	this.getEnhancedImages = function (params, callback) {

		var images = loadImages(params.imagesBefore, params.imagesAfter);

		var geometry = loadFeatureCollection(params.bounderyObj)
			.geometry()
			.buffer(500);

		var enhancedBefore = enhance(images.before, geometry);
		var enhancedAfter = enhance(images.after, geometry);

		enhancedBefore.getMap(visParams, function (mapid) {

			var result = {
				image: enhancedBefore,
				mapid: mapid
			};

			callback(result, 'before');

		});

		enhancedAfter.getMap(visParams, function (mapid) {

			var result = {
				image: enhancedAfter,
				mapid: mapid
			};

			callback(result, 'after');

		});

	};

	/**
	 * Refines a alert
	 *
	 * @param {Object}  params 
	 * @param {List} params.imagesBefore
	 * @param {List} params.imagesAfter
	 * @param {Object} params.deforestationObj
	 * @param {Object} params.notDeforestationObj
	 * @param {Object} params.bounderyObj
	 * @param {String} params.satellite
	 * @param {Function} callback
	 */
	this.refineAlert = function (params, classificationParams, callback) {

		var deforestaionClasse = 1;
		var notDeforestaionClasse = 2;
		var scale = classificationParams.scale;

		var images = loadImages(params.imagesBefore, params.imagesAfter);

		var boundery = loadFeatureCollection(params.bounderyObj);

		var samplesDeforestation = loadFeatureCollection(params.deforestationObj)
			.map(function (feature) {
				return feature.set('classe', deforestaionClasse)
			});

		var samplesNotDeforestation = loadFeatureCollection(params.notDeforestationObj)
			.map(function (feature) {
				return feature.set('classe', notDeforestaionClasse)
			});

		var samples = samplesDeforestation.merge(samplesNotDeforestation);

		var classification = classify(images.before, images.after, samples, classificationParams);

		var alert = raster2vector(classification, deforestaionClasse, boundery.geometry(), scale);

		var alertStyled = alert.style(styleAlert);

		alertStyled.getMap(visParamsAlert, function (mapid) {

			var result = {
				alertRefined: alert,
				image: alertStyled,
				mapid: mapid
			};

			callback(result, 'alert');

		});
	};
};

exports.GeeAlertRefinement = GeeAlertRefinement;

