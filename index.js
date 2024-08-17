const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2yyywnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("ph-jobTask").collection('Products')

        app.get('/products', async (req, res) => {
            const size = parseInt(req.query.size) || 9;
            const page = parseInt(req.query.page) || 0;
            const sort = req.query.sort || 'priceLowToHigh';
            const search = req.query.search || '';
            const sortOptions = {
                priceLowToHigh: { price: 1 },
                priceHighToLow: { price: -1 },
                dateNewestFirst: { productCreationDateTime: -1 },
            };
            const sortCriteria = sortOptions[sort] || { price: 1 }; 
            const query = search ? { productName: { $regex: search, $options: 'i' } } : {};
            const result = await productsCollection.find(query).sort(sortCriteria).skip(page * size).limit(size).toArray();
            res.send(result);
        });
            
        app.get('/productsCount', async (req, res) => {
            const count = await productsCollection.estimatedDocumentCount()
            res.send({ count })
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})