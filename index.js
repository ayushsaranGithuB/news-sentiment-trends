// Import the express framework
express = require("express");
// setup apicache
const apicache = require("apicache");
let cache = apicache.middleware;

// higher-order function returns false for responses of other status codes (e.g. 403, 404, 500, etc)
const onlyStatus200 = (req, res) => res.statusCode === 200;

const cacheSuccesses = cache("90 minutes", onlyStatus200);

// Fetch Environment Variables
require("dotenv").config();

// tell node that we are creating an express app
const app = express();

// define the port that the server will run on
const port = 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// define the route for the index page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/welcome.html");
});

// define the route for the /search endpoint
app.get("/search", (req, res) => {
  res.sendFile(__dirname + "/search.html");
});

// define the route for the /api/search endpoint
app.get("/api/search/:query", cacheSuccesses, async (req, res) => {
  // make the call to the SearchTopic function and pass in the query parameter
  let query = req.params.query;

  console.log(query);

  const API_KEY = process.env.FEEDRIKA_API_KEY;
  const url = `https://api.feedrika.com/?apiKey=${API_KEY}&q=${query}`;
  console.log(url);
  const result = await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  res.send(result);
});

// Start the server and tell the app to listen for incoming connections on the port specified
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
