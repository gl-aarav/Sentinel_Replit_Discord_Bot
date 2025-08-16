const express = require("express");
const app = express();

// Serve the public folder
app.use(express.static("public"));

// Endpoint to trigger something
app.get("/run", (req, res) => {
  console.log("Run button clicked!");
  res.send("✅ Run triggered!");
});

// Keep-alive root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Use PORT from Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
