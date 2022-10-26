//Use of Express 
const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where server will be listening

//Sets the views full location and Embedded JS as view engine
var path = require('path');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//IMPORTANT: Allow JSON body handling in requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configure Firebase credentials and get Firestore
var admin = require("firebase-admin");
var permisos = require("./permisos.json");
admin.initializeApp({
  credential: admin.credential.cert(permisos),
  databaseURL: "https://nodejscrud-c5914.firebaseio.com"
});

const db = admin.firestore();


//---------------------------------------------------------------------------- Web App Routes ------------------------------------------------------------------------------//

//READ -> GET index.ejs
app.get('/', (req, res) => {
    (async () => {
        try{
            const query = await db.collection("users").get();
            let docs = query.docs;
            const response = docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                surname: doc.data().surname,
                age: doc.data().age,
            }));
            res.render("index", {data: response});
        } catch (error) {
            console.log(error);
            return res.status(500).send("Server Error");
        }
    })();
});

//READ id -> GET detail.ejs
app.get('/detail/:user_id', (req, res) => {        
    (async () => {
        try{
            const doc = db.collection('users').doc(req.params.user_id);
            const item = await doc.get()
            const response = item.data();
            
            res.render("detail", {data: response});
        } catch(error) {
            console.log(error);
            return res.status(500).send("Server Error");
        }
    })();                                                  
});



//CREATE (form) -> GET create.html
app.get('/create', (req, res) => {                            
    res.sendFile('views/create.html', {root: __dirname});  //senFile() requires file full path                                              
});

//CREATE (POST)
app.post('/create', (req, res) => {
    (async () => {
        try {
          await db.collection('users').add({name: req.body.name, surname : req.body.surname, age : req.body.age });
          res.redirect("/");
        } catch (error) {
          console.log(error);
          return res.status(500).send("Server Error");
        }
    })();
});



//UPDATE (form) -> GET edit.ejs
app.get('/edit/:user_id', (req, res) => {            
    (async () => {
        try{
            const doc = db.collection('users').doc(req.params.user_id);
            const item = await doc.get()
            const response = item.data();
            res.render("edit", {data: response, id: req.params.user_id});
        } catch(error) {
            console.log(error);
            return res.status(500).send("Server Error");
        }
    })();                                                                         
});

//UPDATE (PUT) -> Uses a POST request cause PUT not allowed as an action
app.post("/edit/:user_id", (req, res) => {
    (async () => {
        try {      
            const document = db.collection("users").doc(req.params.user_id);
            await document.update({
                name: req.body.name,
                surname: req.body.surname,
                age: req.body.age,
            });
            res.redirect("/");
        } catch (error) {
            console.log(error);
            return res.status(500).send("Server Error");
        }
    })();
});



//DELETE (DELETE) -> Uses a GET request cause DELETE not allowed as an action
app.get("/delete/:user_id", (req, res) => {
    (async () => {
        try {
            const doc = db.collection("users").doc(req.params.user_id);
            await doc.delete();
            res.redirect("/");
        } catch (error) {
            console.log(error);
            return res.status(500).send("Server Error");
        }
    })();
});

//---------------------------------------------------------------------------- API Routes ------------------------------------------------------------------------------//

//CREATE (POST)
app.post('/api/users', (req, res) => {
    (async () => {
        try {
          await db.collection('users').add({name: req.body.name, surname : req.body.surname, age : req.body.age });
          return res.status(200).send("User added");
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
    })();
});

//READ (GET)
app.get("/api/users", async (req, res) => {
    (async () => {
        try{
            const query = await db.collection("users").get();
            let docs = query.docs;
            const response = docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                surname: doc.data().surname,
                age: doc.data().age,
            }));
            return res.status(200).send(response);
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//READ id (GET id)
app.get('/api/users/:user_id', (req, res) =>{
    (async () => {
        try{
            const doc = db.collection('users').doc(req.params.user_id);
            const item = await doc.get()
            const response = item.data();
            return res.status(200).send(response);
        } catch(error) {
            return res.status(500).send(error);
        }
    })();
});

//UPDATE (PUT)
app.put("/api/users/:user_id", (req, res) => {
    (async () => {
        try {      
            const document = db.collection("users").doc(req.params.user_id);
            await document.update({
                name: req.body.name,
                surname: req.body.surname,
                age: req.body.age,
            });
            return res.status(200).send("User updated");
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});

//DELETE (DELETE)
app.delete("/api/users/:user_id", (req, res) => {
    (async () => {
        try {
            const doc = db.collection("users").doc(req.params.user_id);
            await doc.delete();
            return res.status(200).send("User deleted");
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
});
//---------------------------------------------------------------------------- END Routes ------------------------------------------------------------------------------//

//Server starts listening for any attempts from a client to connect at port: {port}
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

module.exports = app;