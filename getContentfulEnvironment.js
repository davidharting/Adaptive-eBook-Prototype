const contentfulManagement = require("contentful-management");
require("dotenv").config();

module.exports = function () {
  const contentfulClient = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  });

  return contentfulClient
    .getSpace("hfznm2gke77t")
    .then((space) => space.getEnvironment("master"));
};
