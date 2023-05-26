"use strict";

/**
 * debt controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

Number.prototype.ArrondiA2Chiffre = function () {
  return Math.round(this * 100) / 100;
};

const diffDays = function (fin, debut) {
  fin = new Date(fin);
  debut = new Date(debut);
  return ((fin - debut) / (1000 * 60 * 60 * 24)).ArrondiA2Chiffre();
};

module.exports = createCoreController("api::debt.debt", ({ strapi }) => ({
  async create(ctx) {
    var { data } = ctx.request.body;

    if (!data.attributes?.society.data) {
      return ctx.badRequest("society must be defined.");
    }

    if (!data.attributes?.borrower?.data) {
      return ctx.badRequest("borrower must be defined.");
    }

    let borrowerExists;
    await strapi.db
      .query("api::borrower.borrower")
      .findOne({
        where: {
          $and: [
            {
              id: data.attributes?.borrower?.data.id,
            },
          ],
        },
        populate: {
          society: true,
        },
      })
      .then((value) => {
        borrowerExists = value;
      });

    if (!borrowerExists?.id) {
      return ctx.badRequest(
        "Borrower does not exist or  must be part of Society."
      );
    }

    console.log(borrowerExists);

    const societyExists = await strapi
      .service("api::society.society")
      .findOne(borrowerExists.society?.id);
    if (!societyExists?.id) {
      return ctx.badRequest("Society does not exist.");
    }

    data["attributes"]["borrower"] = borrowerExists;
    data["attributes"]["society"] = societyExists;

    const entry = await strapi.service("api::debt.debt").create({
      data: data.attributes,
      files: ctx?.request?.files?.["files.contrat"]
        ? {
            CNI: ctx.request.files["files.contrat"],
          }
        : null,
    });

    const sanitizedResults = await this.sanitizeOutput(entry, ctx);

    return this.transformResponse(sanitizedResults);
  },
  async update(ctx) {
    var { data } = ctx.request.body;

    const debt = await strapi
      .service("api::debt.debt")
      .findOne(ctx?.request?.params?.id);

    if (!debt?.id) {
      return ctx.badRequest("Debt does not exist.");
    }

    if (!data.attributes?.society.data) {
      return ctx.badRequest("society must be defined.");
    }

    if (!data.attributes?.borrower) {
      return ctx.badRequest("borrower must be defined.");
    }

    let borrowerExists;
    await strapi.db
      .query("api::borrower.borrower")
      .findOne({
        where: {
          $and: [
            {
              id: data.attributes?.borrower?.data.id,
            },
          ],
        },
        populate: {
          society: true,
        },
      })
      .then((value) => {
        borrowerExists = value;
      });

    if (!borrowerExists?.id) {
      return ctx.badRequest(
        "Borrower does not exist or  must be part of Society."
      );
    }

    const societyExists = await strapi
      .service("api::society.society")
      .findOne(borrowerExists.society?.id);
    if (!societyExists?.id) {
      return ctx.badRequest("Society does not exist.");
    }

    data["attributes"]["borrower"] = borrowerExists;
    data["attributes"]["society"] = societyExists;

    if (data?.attributes?.pointages?.data?.length) {
      data["attributes"]["pointages"] = (
        data?.attributes?.pointages?.data || []
      ).map((el) => el);
    } else {
      data["attributes"]["pointages"] = [];
    }

    console.log(data["attributes"]["pointages"]);

    const entry = await strapi.service("api::debt.debt").update(debt.id, {
      data: data.attributes,
      files: ctx?.request?.files?.["files.contrat"]
        ? {
            CNI: ctx.request.files["files.contrat"],
          }
        : null,
    });

    const sanitizedResults = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedResults);
  },
  async find(ctx) {
    const society = await strapi.db.query("api::society.society").findOne({
      where: {
        users: {
          id: {
            $eq: ctx.state.user.id,
          },
        },
      },
    });

    if (!society) {
      return ctx.badRequest("Society does not exist");
    }

    const debts = await strapi.db.query("api::debt.debt").findMany({
      where: {
        society: society,
      },
      populate: {
        pointages: true,
      },
    });
    debts.map((el) => {
      const checkRetard = Math.floor(
        diffDays(new Date(), new Date(el.dateContrat)) / 30.4375
      );
      console.log(checkRetard, el.pointages.length);
      if (checkRetard > el.pointages.length) {
        el.overdue = true;
      } else {
        el.Overdue = false;
      }
    });

    const sanitizedResults = await this.sanitizeOutput(debts, ctx);
    return this.transformResponse(sanitizedResults);
  },
  async findOne(ctx) {
    const society = await strapi.db.query("api::society.society").findOne({
      where: {
        users: {
          id: {
            $eq: ctx.state.user.id,
          },
        },
      },
    });

    if (!society) {
      return ctx.badRequest("Society does not exist");
    }

    const debt = await strapi.service("api::debt.debt")
      .findOne(ctx.request.params.id, {
        where: {
          society: society,
        },
        populate: '*',
      });

    if (!debt) {
      return ctx.badRequest("Debt does not exist");
    }

    const checkRetard = Math.floor(
      diffDays(new Date(), new Date(debt.dateContrat)) / 30.4375
    );
    console.log(debt);

    if (checkRetard > debt.pointages.length) {
      debt.overdue = true;
    } else {
      debt.Overdue = false;
    }

    const sanitizedResults = await this.sanitizeOutput(debt, ctx);
    return this.transformResponse(sanitizedResults);
  },
}));
