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
            try {
                // Parse query parameters
                const size = parseInt(req.query.size, 10) || 9;
                const page = parseInt(req.query.page, 10) || 0;
                const sort = req.query.sort || 'priceLowToHigh';
                const search = req.query.search || '';
        
                // Define sorting options
                const sortOptions = {
                    priceLowToHigh: { price: 1 },
                    priceHighToLow: { price: -1 },
                    dateNewestFirst: { productCreationDateTime: -1 },
                };
                
                // Determine sorting criteria
                const sortCriteria = sortOptions[sort] || { price: 1 };
        
                // Create search query
                const query = search ? { productName: { $regex: search, $options: 'i' } } : {};
        
                // Fetch products from the database
                const result = await productsCollection
                    .find(query)
                    .sort(sortCriteria)
                    .skip(page * size)
                    .limit(size)
                    .toArray();
                
                // Send the result
                res.send(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send({ error: 'Failed to fetch products' });
            }
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