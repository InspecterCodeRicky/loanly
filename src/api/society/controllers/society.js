'use strict';

/**
 * society controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::society.society', ({ strapi }) => ({

    async team(ctx) {
        if (!ctx.state.user) {
            return ctx.unauthorized();
        }
        const user = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            ctx.state.user.id,
            { populate: ['society'] }
        );

        if (!user) {
            return ctx.unauthorized();
        }

        const team = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: {
                society: user.society
            },
            fields: ['username', 'email', 'createdAt'],
            populate: ['avatar'],
        })
        return team

        // const res = this.sanitizeOutput(team, ctx);
        return this.transformResponse(team);
    },

}));
