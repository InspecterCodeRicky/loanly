"use strict";

/**
 * borrower controller
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

module.exports = createCoreController(
  "api::borrower.borrower",
  ({ strapi }) => ({
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

      if(!society) {
        return ctx.badRequest("Society does not exist");
      }

      var borrowers = await strapi.db.query("api::borrower.borrower").findMany({
        where: {
          society: society,
        },
        populate: {
          avatar: true,
        },
      });

      borrowers = await Promise.all(
        borrowers.map(async (el) => {
          var debts = await strapi.db.query("api::debt.debt").findMany({
            where: {
              borrower: el,
            },
            populate: {
              pointages: true,
            },
          });
          debts.map((debt)=> {
            const checkRetard =  Math.floor(diffDays(new Date(), new Date(debt.dateContrat)) / 30.4375)
            console.log(checkRetard,  debt.pointages.length);
            if(checkRetard > debt.pointages.length) {
              debt.overdue = true
            }else {
              debt.overdue = false
            }
          })
          return {
            ...el,
            nbrDebts: debts.length,
            overdue : debts.filter((debt) => debt.overdue).length ? true : false
          };
        })
      );

      const sanitizedResults = await this.sanitizeOutput(borrowers, ctx);

      return this.transformResponse(sanitizedResults);
    },
    async create(ctx) {
      var { data } = ctx.request.body;

      if (typeof data == "string") {
        data = JSON.parse(data);
      }

      if (!data.attributes?.society.data) {
        return ctx.badRequest("society must be defined.");
      }

      const societyExists = await strapi
        .service("api::society.society")
        .findOne(data.attributes?.society?.data?.id);

      if (!societyExists?.id) {
        return ctx.badRequest("Society does not exist");
      }

      let borrowerExists;

      await strapi.db
        .query("api::society.society")
        .findOne({
          where: {
            $and: [
              {
                tel: data?.attributes?.tel,
              },
              {
                society: societyExists.id,
              },
            ],
          },
        })
        .then((value) => {
          borrowerExists = value;
        });

      let entry = "";

      if (borrowerExists?.id) {
        return ctx.badRequest("Borrower exists.");
      } else {
        data.attributes["society"] = societyExists;
        entry = await strapi.service("api::borrower.borrower").create({
          data: data.attributes,
          files: ctx?.request?.files?.["files.CNI"]
            ? {
                CNI: ctx.request.files["files.CNI"],
              }
            : null,
        });
      }

      const sanitizedResults = await this.sanitizeOutput(entry, ctx);

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

      if(!society) {
        return ctx.badRequest("Society does not exist");
      }

      const borrowerExists = await strapi
        .service("api::borrower.borrower")
        .findOne(ctx?.request?.params?.id, {
          where: {
            society: society,
          },
          populate: {
            CNI: true,
          },
        });

      if (!borrowerExists?.id) {
        return ctx.badRequest("Borrower does not exist");
      }

      const debts = await strapi.db.query("api::debt.debt").findMany({
        where: {
          borrower: {
            id: {
                $eq : borrowerExists.id
            }
          },
        },
        populate: {
          pointages: true,
        },
      });
      
      debts.map((el)=> {
        const checkRetard =  Math.floor(diffDays(new Date(), new Date(el.dateContrat)) / 30.4375)
        console.log(checkRetard,  el.pointages.length);
        if(checkRetard > el.pointages.length) {
          el.overdue = true
        }else {
          el.overdue = false
        }
      })

      borrowerExists["debts"] = debts;

      const sanitizedResults = await this.sanitizeOutput(borrowerExists, ctx);

      return this.transformResponse(sanitizedResults);
    },
    async update(ctx) {
      var { data } = ctx.request.body;

      if (typeof data == "string") {
        data = JSON.parse(data);
      }

      if (!data.attributes?.society.data) {
        return ctx.badRequest("society must be defined.");
      }

      const societyExists = await strapi
        .service("api::society.society")
        .findOne(data.attributes?.society?.data?.id);

      if (!societyExists?.id) {
        return ctx.badRequest("Society does not exist");
      }

      const borrowerExists = await strapi
        .service("api::borrower.borrower")
        .findOne(ctx?.request?.params?.id);

      if (!borrowerExists?.id) {
        return ctx.badRequest("Borrower does not exist");
      }

      let updateBorrower;

      await strapi.db
        .query("api::borrower.borrower")
        .findOne({
          where: {
            $and: [
              {
                tel: data?.attributes?.tel,
              },
              {
                society: societyExists.id,
              },
            ],
          },
          // populate : {
          //     CNI : true
          // }
        })
        .then((value) => {
          updateBorrower = value;
        });

      if (updateBorrower?.id && borrowerExists?.id !== updateBorrower?.id) {
        return ctx.badRequest("Can't update Borrower with this informations.");
      }

      let entry = await strapi
        .service("api::borrower.borrower")
        .update(borrowerExists.id, {
          data: data.attributes,
          files: ctx?.request?.files?.["files.CNI"]
            ? {
                CNI: ctx.request.files["files.CNI"],
              }
            : null,
        });

      const sanitizedResults = await this.sanitizeOutput(entry, ctx);

      return this.transformResponse(sanitizedResults);
    },

    // for (const [key] of Object.entries(ctx.request.files)) {
    //     console.log(borrowerExists, key);
    //     if (borrowerExists[key]) {
    //         console.log(borrowerExists[key]);
    //         await strapi.plugin('upload').service('upload').remove(borrowerExists[key])
    //     }
    // }
  })
);
