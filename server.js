const express = require("express");
const app = express();

// Serve static files (our webpage)
app.use(express.static("public"));

// Endpoint to “run” or ping the bot
app.get("/run", (req, res) => {
  console.log("Run button clicked!");
  res.send("✅ Bot run triggered!");
});

// Keep-alive home
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
