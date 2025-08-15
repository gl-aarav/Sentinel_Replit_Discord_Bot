const express = require('express');
const fetch = require('node-fetch'); // install node-fetch if not installed
const app = express();

app.get('/', (req, res) => res.send('Ping!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Self-ping every 5 minutes to stay awake
setInterval(() => {
  fetch(`http://localhost:${PORT}`)
    .then(() => console.log('Pinged self to stay awake'))
    .catch((err) => console.error(err));
}, 300000);
