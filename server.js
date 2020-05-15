var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jwt-simple')
var bcrypt = require('bcrypt')
var User = require('./models/user.js');
var Post = require('./models/Post.js');
// var posts = [
//     { data: 'Sai Sarika' },
//     { data: 'devisettysaisarika@gmail.com' }
// ]
mongoose.Promise = Promise;
app.use(cors());
app.use(bodyParser.json());


function checkAuthenticated(req, res, next) {
    if (!req.header('authorization'))

        return res.status(401).send({ message: 'Unauthorized. missing auth Header' })
    var token = req.header('authorization').split(' ')[1]


    var payload = jwt.decode(token, '123')
    if (!payload)
        return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })

    req.userId = payload.sub
    next()
}

app.get('/posts/:id', async (req, res) => {
    var author = req.params.id;
    var posts = await Post.find({ author })
    res.send(posts)
})
app.post('/post', checkAuthenticated, (req, res) => {
    var postData = new Post(req.body)
    postData.author = req.userId
    postData.save((err, result) => {
        if (err)
            console.log(err)
        // return res.status(500).send({message:'saving post error'})

    })
})
app.get('/users', async (req, res) => {
    try {

        var users = await User.find({}, '-password -__v')
        res.send(users)
    }
    catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

})

app.get('/profile/:id', async (req, res) => {

    try {
        var user = await User.findById(req.params.id, '-password -__v')
        res.send(user)
    }
    catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

})
app.post('/register', (req, res) => {
    var userData = req.body;
    var user = new User((userData));
    user.save((err, newuser) => {
        if (err)
            return res.status(401).send({ message: 'Error saving ' })
        var payload = { sub: newuser._id }

        var token = jwt.encode(payload, '123')

        res.status(200).send({ token })

    })
})


app.post('/login', async (req, res) => {
    var loginData = req.body;

    var user = await User.findOne({ email: loginData.email })

    if (!user)
        return res.status(401).send({ message: 'Email or password Invalid' })

    bcrypt.compare(loginData.password, user.password, (err, isMatch) => {
        if (!isMatch)
            return res.status(401).send({ message: 'Email or password Invalid' })
        var payload = { sub: user._id }

        var token = jwt.encode(payload, '123')

        res.status(200).send({ token })
    })

    // if (loginData.password != user.password)
    //     return res.status(401).send({ message: 'Email or password Invalid' })

})

mongoose.connect('mongodb+srv://saisarika:saisarika@cluster0-o6ntu.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err)
        console.log('Connected to DB')
})
port = process.env.PORT || 8000;
app.listen(port);