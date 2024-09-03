const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const datafile = path.join(__dirname, 'data.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function readData() {
  if (!fs.existsSync(datafile)) {
    fs.writeFileSync(datafile, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(datafile, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(datafile, JSON.stringify(data, null, 2));
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.get('/add', (req, res) => {
  const { hwid, discordid } = req.query;
  const data = readData();
  
  if (!hwid) {
    return res.status(400).json({ error: 'Geçersiz veri: hwid gerekli' });
  }

  let updated = false;
  for (let entry of data) {
    if (entry.discordid === discordid) {
      entry.hwid = hwid;
      updated = true;
      break;
    }
  }

  if (!updated) {
    const maxId = data.reduce((max, entry) => Math.max(max, entry.id), 0);
    const newId = maxId + 1;
    const newEntry = { id: newId, hwid, discordid };
    data.push(newEntry);
  }

  writeData(data);
  res.status(201).json({ hwid, discordid });
});

app.use((req, res) => {
  res.status(404).send('<h1>404</h1><p>Sayfa bulunamadı.</p>');
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port}`);
});
