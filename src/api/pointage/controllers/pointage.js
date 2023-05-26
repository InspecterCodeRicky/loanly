'use strict';

/**
 * pointage controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::pointage.pointage', ({ strapi }) => ({

    async create(ctx) {
        const { data } = ctx.request.body

        if (!data?.attributes?.debt.data?.id) {
            return ctx.badRequest("Debt must be defined.")
        }

        const debtExists = await strapi.service('api::debt.debt').findOne(data?.attributes?.debt.data?.id, {
            populate: {
                pointages: true
            }
        });

        if (!debtExists?.id) {
            return ctx.badRequest("Debt does not exist")
        }


        const entry = await strapi.service('api::pointage.pointage').create({
            data: {
                ...data.attributes,
                debt: {
                    id: debtExists?.id
                }
            }
        });



        debtExists["pointages"].push(entry)

        await strapi.service('api::debt.debt').update(debtExists.id, { data: debtExists });

        const sanitizedResults = await this.sanitizeOutput(entry, ctx);

        return this.transformResponse(sanitizedResults);

    },



    async update(ctx) {
        const { data } = ctx.request.body


        const pointageExists = await strapi.service('api::pointage.pointage').findOne(ctx?.request?.params?.id, {
            populate: {
                debt: true
            }
        });

        if (!pointageExists?.id) {
            return ctx.badRequest("Pointage does not exist")
        }




        if (!data?.attributes?.debt.data?.id) {
            return ctx.badRequest("Debt must be defined.")
        }


        const debtExists = await strapi.service('api::debt.debt').findOne(data?.attributes?.debt.data?.id, {
            populate: {
                pointages: true
            }
        });

        if (!debtExists?.id) {
            return ctx.badRequest("Debt does not exist")
        }

        
        if (debtExists?.id !== pointageExists.debt.id) {
            return ctx.badRequest("Pointage cannot be attributed to another Debt.")
        }
        

        const entry = await strapi.service('api::pointage.pointage').update(ctx?.request?.params?.id, {
            data: {
                ...data.attributes,
                debt: {
                    id: debtExists?.id
                }
            }
        });



        const sanitizedResults = await this.sanitizeOutput(entry, ctx);

        return this.transformResponse(sanitizedResults);

    },

}));
