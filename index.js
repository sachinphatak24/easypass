import express from 'express';
import bodyParser from 'body-parser';
import mongoose  from 'mongoose';
import cors from 'cors';


import userRouter from './routes/users.js';


const app = express();

app.use(bodyParser.json({limit: '30mb', extended:true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended:true}));
app.use(cors());


app.get('/', function(req, res){
    res.send({ title: 'Welcome home Hello!' });
});

app.use('/user', userRouter);


const CONNECTION_URL = 'mongodb+srv://sachin:BEproject123@cluster1.ro427.mongodb.net/easypass?retryWrites=true&w=majority';
const PORT = process.env.PORT|| 5000;

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology:true})
.then(()=> app.listen(PORT,() => console.log(`Server Currently Running On Port: http://localhost:${PORT}`)))
.catch((error) => console.log(`${error} Did Not Connect`));