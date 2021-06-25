const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
console.log(process.env.DB_USER);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dz2ta.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const ObjectID = require("mongodb").ObjectID;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const blogsCollection = client.db("blogosphere").collection("blogs");
  const adminCollection = client.db("blogosphere").collection("admin");
  // perform actions on the collection object
  console.log("Database Connected");

  app.get("/blogs", (req, res) => {
    blogsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/blogs/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log(id);
    blogsCollection.find({ _id: id }).toArray((err, items) => {
      res.send(items[0]);
    });
  });
  app.post("/addBlogs", (req, res) => {
    const newBlogs = req.body;
    console.log("Adding Services", newBlogs);
    blogsCollection.insertOne(newBlogs).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const newAdmin = req.body;
    console.log("Adding Admin", newAdmin);
    adminCollection.insertOne(newAdmin).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteBlogs/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    blogsCollection
      .findOneAndDelete({ _id: id })
      .then((documents) => res.send(documents.deletedCount > 0));
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
