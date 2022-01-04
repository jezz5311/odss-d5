const express = require('express');
const dbConnect = require('./public/connection_config/db.config');
var connection = dbConnect.connectToDatabase();

//Loads the handlebars module
const handlebars = require('express-handlebars');

// Create express app
const app = express();

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'build/contracts')))

var jQuery = $ = require('jquery');



//Declaring bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Configure template Engine and Main Template File
app.engine('hbs', handlebars({
    defaultLayout: 'main',
    extname: '.hbs'
}));

//Establishing template engine
app.set('view engine', 'hbs');


//Routes configuration
app.get('/', (req, res) => {
	  
  res.render('user_panel');

});

app.get('/adduser', (req, res) => {
	  
  res.render('add_user');

});

app.post('/postQueryHash', (req, res) => {

  let sqlHash = new Array()

  retrieved_data = JSON.parse(JSON.stringify(req.body.result))
  filter_retrieved_data = retrieved_data.filter(item => item.isentity == true)
  console.log(retrieved_data)

  filter_retrieved_data.forEach(item=>
  {
    sqlHash.push(item.address)
  })

  connection.query("SELECT Hash,Name,Phone,Email FROM users WHERE Hash IN (?)",[sqlHash], function (err, result, fields) {
  if (!err)
  {
  
     let processed_result = result.map((sqlCol, index) =>
      {
        return {

          Hash: sqlCol.Hash,
          Name: sqlCol.Name,
          Phone: sqlCol.Phone,
          Email: sqlCol.Email
        }
      })

      res.status(200).json(processed_result)
  }

  else
  {
      res.status(500).json(err)
  }

  })

})

app.post('/addUserInfo', (req, res) => {

  let insertData = JSON.parse(JSON.stringify(req.body))

  let insertHash = insertData.ahash
  let insertName = insertData.aname
  let insertPhone = insertData.aphone
  let insertEmail = insertData.aemail

  connection.query("INSERT INTO users(Hash,Name,Phone,Email) VALUES (?,?,?,?)",[insertHash,insertName,insertPhone,insertEmail], function (err, result, fields) {

    if (!err)
    {
      res.status(200).json("Data added successfully")
    }

    else
    {
      res.status(500).json("Data not added")
    }

  })

})

app.post('/updateUser', (req, res) => {

  let updateData = JSON.parse(JSON.stringify(req.body))

  let updateName = updateData.uname
  let updatePhone = updateData.uphone
  let updateEmail = updateData.uemail
  let updateHash = updateData.uhash


  connection.query("UPDATE users SET Name= ?, Phone = ?, Email = ? WHERE Hash = ?",[updateName,updatePhone,updateEmail,updateHash], function (err, result, fields) {

    if (!err)
    {
      res.status(200).json("Data updated successfully")
    }

    else
    {
      res.status(500).json("Data not updated")
    }

  })

})

app.post('/deleteUser', (req, res) => {

  let deletehash = JSON.parse(JSON.stringify(req.body.deletehash))

  connection.query("DELETE FROM users WHERE Hash = ?",[deletehash], function (err, result, fields) {

    if (!err)
    {
      res.status(200).json("Data deleted successfully")
    }

    else
    {
      res.status(500).json("Data not deleted")
    }
    
  })

})


const port = process.env.PORT || 3000;
// listen for requests
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

