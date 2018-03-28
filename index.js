const express = require('express');
const handlebars = require('express-handlebars');

// post request libs
const bodyParser = require('body-parser');
const methodOverride = require('method-override')

const cookieParser = require('cookie-parser')


/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


// post request use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.use(cookieParser());

// Set handlebars to be the default view engine
app.engine('handlebars', handlebars.create().engine);
app.set('view engine', 'handlebars');

const db = require('./db');

require('./routes')(app);

app.get('/', (request, response) => {

  let visits = request.cookies['visits'];
  let logged_in = request.cookies['logged_in'];

  if( visits === undefined ){
    visits = 1;
  }else{
    visits = parseInt( visits ) + 1;
  }

  response.cookie('visits', visits);

  db.pool.query('SELECT * FROM pokemon', (error, queryResult) => {
    let context = {
      visits : visits,
      logged_in : logged_in,
      pokemon: queryResult.rows
    };

    response.render('home', context);
  });

});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

server.on('close', () => {
  console.log('Closed express server')

  db.pool.end(() => {
    console.log('Shut down connection pool')
  });
});
