'use strict';

/**
 * debt service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::debt.debt');
