module.exports = plugin => {

  plugin.controllers.user.getUserBooks = async (ctx) => {
    return "jsfkjf"
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

    const team = await strapi.entityService.find('plugin::users-permissions.user', {
      where: {
        society: user.society
      }
    })

    const res = sanitizeOutput(team);
    return this.transformResponse(res);
  };

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/users/team',
    handler: 'users.team',
    // config: {
    //     "policies": [],
    //     "prefix": "",
    //     "description": "description",
    //     "tag": {
    //       "plugin": "users-permissions",
    //       "name": "User",
    //       "actionType": "find"
    //     }
    //   }
  });

  return plugin;
};