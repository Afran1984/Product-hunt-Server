const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  operationSuccessStatus: 200,
};
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const uri =
  "mongodb+srv://producthunt:bqfUxChuyzS5TnAD@cluster0.bqiq2nz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    const db = client.db("productHunt");
    const usersCollection = db.collection("user");
    const productsCollection = db.collection("product");

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get user info by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    app.put("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const isExist = await usersCollection.findOne({ email: user?.email });
      if (isExist) {
        if (user?.status == "requested") {
          const result = await usersCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(result);
        } else {
          return res.send(isExist);
        }
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // updating role

    // Update user role
    app.patch("/user/role/:id", async (req, res) => {
      const userId = req.params.id;
      const { role } = req.body;
      y;

      try {
        const updatedUser = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role } }
        );

        if (updatedUser.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "User not found or role is the same." });
        }

        res.json({ success: true, message: "Role updated successfully!" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update role" });
      }
    });

    app.post("/product", async (req, res) => {
      const product = req.body;
      try {
        const result = await productsCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to add product" });
      }
    });

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // Get Single product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //update product
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const productInfo = req.body;
      const options = {
        upsert: true,
      };
      const updateDoc = {
        $set: {
          ...productInfo,
        },
      };
      const result = await productsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Delete product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
