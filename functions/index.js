

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

const express = require('express')
const bodyParser = require("body-parser");


// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const app = express();
app.use(bodyParser.json())
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

  //res.setHeader('Access-Control-Allow-Credentials', true);
      next();
});

/*app.post('/addToDo', function(req, res) {
  res.set('Cache-Control', 'public')
	 const toDos = req.body.toDos
	 const userId = req.body.userId
   res.set('Cache-Control', 'public')
	 res.send(200, {result :"success"})
})

app.get('/getToDos', function(req, res) {
  
res.set('Cache-Control', 'public')
  admin.auth().verifyIdToken(req.query.idToken)
  .then(function(decodedToken) {
    console.log(decodedToken)
    var uid = decodedToken.uid;
    res.send(200, {"toDos":[],
 "userId":"ramachandran.amrutha@gmail.com"})
    // ...
  }).catch(function(error) {
    res.send(200, {error: error})
  });
  
  
   
})*/

app.get('/', function(req, res) {
	 console.log("in root path")
   res.set('Cache-Control', 'public')
	 res.sendFile(path.join(__dirname, '../public/index.html'));
})

exports.app = functions.https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
