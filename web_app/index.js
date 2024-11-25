const express = require('express');
const session = require('express-session');
const cookieMonster = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const routes = require('./routes/routes.js');
const config = require('config');

require('dotenv').config();

const app = express();

const host = config.get('nodejs.host');
const port = config.get('nodejs.port');

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

app.listen(port, () => {
    console.log(`\nAPP RUNNING AT: ${host} PORT: ${port}\n`);
    console.log(`http://${host}:${port}\n`)
  });

  app.use(cookieMonster());
  app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    }
  }));
  
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));
  app.use('/', routes);

// app.get('/', (req, res) => {
//   res.json({ message: 'sample get' });
// });

// app.get('/api/items/:id', (req, res) => {
//   const itemId = req.params.id;
//   res.json({ id: itemId, message: `Fetching item ${itemId}` });
// });

// app.post('/api/items', (req, res) => {
//   const newItem = req.body;
//   res.json({ message: 'Item created', item: newItem });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

