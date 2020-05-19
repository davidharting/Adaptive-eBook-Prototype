const contentful = require("contentful");
require("dotenv").config();

function main() {
  const client = contentful.createClient({
    space: "hfznm2gke77t",
    environment: "master",
    accessToken: process.env.CONTENTFUL_DELIVERY_API_KEY,
  });

  client
    .getEntries()
    .then((response) => {
      console.log(JSON.stringify(response.items, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

main();
