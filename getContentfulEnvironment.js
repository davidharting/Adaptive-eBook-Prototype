const contentfulManagement = require("contentful-management");
require("dotenv").config();

module.exports = function () {
  if (!process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
    throw new Error(
      "Missing environment variable CONTENTFUL_MANAGEMENT_ACCESS_TOKEN"
    );
  }

  const contentfulClient = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  });

  return contentfulClient
    .getSpace("hfznm2gke77t")
    .then((space) => space.getEnvironment("master"));
};
