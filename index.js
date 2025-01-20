const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3300; // You can change the port number

app.use(cors());
app.use(express.json());


// Password: mjL538g4i9QlTH0U
// Name: Product-Hunt-admin



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://producthunt:bqfUxChuyzS5TnAD@cluster0.bqiq2nz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Serve product data
app.get("/api/products", (req, res) => {
  // Read the product data from the JSON file
  fs.readFile(path.join(__dirname, "Product.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data" });
    }
    const products = JSON.parse(data);

    // Sort products by upvotes (descending order)
    const sortedProducts = products.sort((a, b) => b.upvotes - a.upvotes);
    
    res.json(sortedProducts); // Send the sorted products as a response
  });
});

// Handle upvote functionality
app.post("/api/upvote/:id", (req, res) => {
  const { id } = req.params;

  // Read the product data from the JSON file
  fs.readFile(path.join(__dirname, "Product.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data" });
    }

    const products = JSON.parse(data);

    // Find the product by ID and increment the upvotes
    const productIndex = products.findIndex((product) => product.id === parseInt(id));
    if (productIndex !== -1) {
      products[productIndex].upvotes += 1;

      // Save the updated products back to the file
      fs.writeFile(path.join(__dirname, "Product.json"), JSON.stringify(products, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error saving data" });
        }

        res.json({ message: "Upvote successful", product: products[productIndex] });
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
