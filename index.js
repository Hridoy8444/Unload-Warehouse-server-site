const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpa8t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('bikeWarehouse').collection('item');

        app.get('/item', async(req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/item/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemCollection.findOne(query);
            res.send(item);
        });

        // PUT
        app.put('/item/:id', async(req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc ={
                $set: {
                    quantity: updateItem.quantity
                }
            };
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // POST
        app.post('/item', async (req, res) => {
            const newItems = req.body;
            const result = await itemCollection.insertOne(newItems);
            res.send(result);
        });

        // DELETE

        app.delete('/item/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });
        //item  API
        app.get('/product', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor =  itemCollection.find(query);
            const item = await cursor.toArray();
            res.send(item);

        })

        app.post('/product', async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item)
            res.send(result);
        })
        app.post('/login', async(res, req) => {
            const user = req.body;
            console.log(user);
            const axesToken = jwt.sign(user, process.env.USER_TOKEN, {expiresIn: '1d'})
            res.send(axesToken);
            
        })

    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running bike server');
});


app.listen(port, () => {
    console.log('Listening to port', port);
});