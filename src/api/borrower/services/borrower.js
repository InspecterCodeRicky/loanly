'use strict';

/**
 * borrower service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::borrower.borrower');
