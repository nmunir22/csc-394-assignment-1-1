const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const port = process.env.PORT || 3000

// Set the view engine for the express app
app.set("view engine", "pug")

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// Database
const Pool = require('pg').Pool

var connectionParams = null;

/* istanbul ignore if */

if (process.env.DATABASE_URL != null) {
    connectionParams = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
} else {
    connectionParams = {
        user: 'api_user',
        host: 'localhost',
        database: 'api',
        password: 'password',
        port: 5432
    }
}
console.log(connectionParams)
const pool = new Pool(connectionParams)


app.get('/', (req, res) => {

  console.log('Accept: ' + req.get('Accept'))

  pool.query('SELECT VERSION()', (err, version_results) => {
    console.log(err, version_results.rows)

    pool.query('SELECT * FROM team_members', (err, team_members_results) => {
      console.log(err, team_members_results)

      res.render('index', {
                            teamNumber: 5,
                            databaseVersion: version_results.rows[0].version,
                            teamMembers: team_members_results.rows
                          })

      console.log('Content-Type: ' + res.get('Content-Type'))
    })
  })
})

app.post('/', 
  body('first_name')
    .isAlpha()
    .isLength({ min: 1})
    .withMessage('must be valid'),
  body('last_name')
    .isAlpha()
    .isLength({ min: 0 })
    .withMessage('must be valid'),
(req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  // if (('first_name' in req.body) == false) {
  //   res.status(400).send('Missing first_name field')
  //   return
  // }

  // if (('last_name' in req.body) == false) {
  //   res.status(400).send('Missing last_name field')
  //   return
  // }

    pool.query(`INSERT INTO team_members (first_name, last_name) VALUES ('${req.body.first_name}', '${req.body.last_name}')`, (err, result) => {

        console.log(err, result)

        res.redirect('/')
    })
  })

module.exports = app;