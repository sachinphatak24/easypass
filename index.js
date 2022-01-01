import express from 'express';
import bodyParser from 'body-parser';
import mongoose  from 'mongoose';
import cors from 'cors';

const app = express();

app.use(bodyParser.json({limit: '30mb', extended:true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended:true}));
app.use(cors());



// User & Profile routes import
import userRouter from './routes/users.js';
import profileRouter from './routes/profile.js';

app.get('/', function(req, res){
    res.send({ title: 'Welcome home!' });
});

// User Routes
app.use('/user', userRouter);

// Profile Routes
app.use('/profile',profileRouter);

// Port Config
const PORT = process.env.PORT|| 5000;

// MongoDB Config
const CONNECTION_URL = 'mongodb+srv://sachin:BEproject123@cluster1.ro427.mongodb.net/easypass?retryWrites=true&w=majority';
// MongoDB Setup 
mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology:true})
.then(()=> app.listen(PORT,() => console.log(`Server Currently Running On Port: http://localhost:${PORT}`)))
.catch((error) => console.log(`${error} Did Not Connect`));