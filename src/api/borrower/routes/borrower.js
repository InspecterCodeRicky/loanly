'use strict';

/**
 * borrower router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::borrower.borrower',{
    prefix: '',
    only: ['find', 'findOne', 'create', 'update', 'delete'],
    // except: [],
    // config: {
    //     find: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    //     findOne: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    //     create: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    //     update: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    //     delete: {
    //         auth: false,
    //         policies: [],
    //         middlewares: [],
    //     },
    // },
});
