'use strict';

/**
 * pointage service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pointage.pointage');
