const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
// hello
const port = process.env.PORT || 5000;

const categories = require('./data/categories.json')

//middleware

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bpxo3nu.mongodb.net/?retryWrites=true&w=majority`;

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



    const serviceCOllection = client.db('toyMarket').collection('services');
    const addtoy = client.db('toyMarket').collection('addtoy');

    app.get('/addtoy', async (req, res) => {
      const query ={};
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { 'price': 1 },
        
      };
      const cursor = addtoy.find(query,options);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/addtoy', async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await addtoy.insertOne(newToys);
      res.send(result)
    })

    app.put('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedtoy = req.body;

      const toy = {
        $set: {
          name: updatedtoy.name,
          price: updatedtoy.price,
          category: updatedtoy.category,
          details: updatedtoy.details,
          photo: updatedtoy.photo
        }
      }

      const result = await addtoy.updateOne(filter, toy, options);
      res.send(result);
    })



    app.delete('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addtoy.deleteOne(query);
      res.send(result);
    })

    app.get('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addtoy.findOne(query);
      res.send(result);
    })



    app.get('/services', async (req, res) => {
      const cursor = serviceCOllection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, name: 1, image: 1, category: 1, details: 1, price: 1 },
      };


      const result = await serviceCOllection.findOne(query, options);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/categories', (req, res) => {
  res.send(categories);
})

app.get('/', (req, res) => {
  res.send('toy Market in running')
});

app.listen(port, () => {
  console.log(`Toy Market API is running on port:${port}`);
})