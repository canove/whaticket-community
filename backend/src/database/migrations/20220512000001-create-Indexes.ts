import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addIndex("Schedules", ["companyId"], {
        name: "idx_sched_company_id"
      }),
      queryInterface.addIndex("Contacts", ["companyId"], {
        name: "idx_cont_company_id"
      }),
      queryInterface.addIndex("Tags", ["companyId"], {
        name: "idx_tg_company_id"
      }),
      queryInterface.addIndex("Messages", ["companyId", "ticketId"], {
        name: "idx_ms_company_id_ticket_id"
      }),
      queryInterface.addIndex("CampaignShipping", ["campaignId"], {
        name: "idx_cpsh_campaign_id"
      }),
      queryInterface.addIndex("ContactListItems", ["contactListId"], {
        name: "idx_ctli_contact_list_id"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeIndex("Schedules", "idx_sched_company_id"),
      queryInterface.removeIndex("Contacts", "idx_cont_company_id"),
      queryInterface.removeIndex("Tags", "idx_tg_company_id"),
      queryInterface.removeIndex("Messages", "idx_ms_company_id_ticket_id"),
      queryInterface.removeIndex("CampaignShipping", "idx_cpsh_campaign_id"),
      queryInterface.removeIndex("ContactListItems", "idx_ctli_contact_list_id")
    ]);
  }
};
