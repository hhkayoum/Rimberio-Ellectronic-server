const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["https://chipper-mousse-146009.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt8lz60.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const productsCollection = client.db("productsDB").collection("products");
    const cartCollection = client.db("productsDB").collection("userCarts");
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:brand", async (req, res) => {
      const brandId = req.params.brand;
      const query = { brand: brandId };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const upDateProducts = req.body;
      console.log(upDateProducts);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const product = {
        $set: {
          name: upDateProducts.name,
          image: upDateProducts.image,
          brand: upDateProducts.brand,
          category: upDateProducts.category,
          price: upDateProducts.price,
          rating: upDateProducts.rating,
          shortDescription: upDateProducts.shortDescription,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      console.log(newProducts);
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    app.post("/userCarts", async (req, res) => {
      const cartData = req.body;
      console.log(cartData);
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });
    app.get("/userCarts", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/userCarts/:userEmail", async (req, res) => {
      const userId = req.params.userEmail;
      console.log(userId);
      const query = { userEmail: userId };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/userCarts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`port is running ${port}`);
});
