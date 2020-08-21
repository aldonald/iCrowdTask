const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const validator = require('validator')
const User = require('./models/user')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

const uri = "mongodb+srv://admin:jDrsgl9svkYVq0hd@cluster0.xtcre.mongodb.net/icrowdtask?retryWrites=true&w=majority"

mongoose.connect(uri, {useNewUrlParser: true})

app.listen(8000, (req,res)=>{
    console.log("Server is running on port 8000")
})

app.get('/', (req, res) => res.sendFile(__dirname + '/frontend/login.html'))
app.get('/create-user/', (req, res) => res.sendFile(__dirname + '/frontend/index.html'))

app.post('/create-user/', (req, res, next) => {
  console.log(req.body)
  const country = req.body.country
  const firstname = req.body.firstname
  const lastname = req.body.lastname
  const email = req.body.inputEmail
  const password = req.body.inputPassword
  const addressFirst = req.body.inputAddress
  const addressSec = req.body.inputAddress2
  const joinedAddress = addressSec ? addressFirst + ', ' + addressSec : addressFirst
  const city = req.body.inputCity
  const state = req.body.inputState
  const zip = req.body.inputZip
  const mobile = req.body.inputMobile

  // confirm that user confirmed password correctly
  if (password !== req.body.confirmPassword) {
    var err = new Error('Passwords do not match.')
    err.status = 400
    // return next(err)
  }

  if (password.length < 8) {
    var err = new Error('Password is too short.')
    err.status = 400
    // return next(err)
  }

  if (zip && !validator.isPostalCode(zip, 'AU')) {
    var err = new Error('Post code is not valid.')
    err.status = 400
    // return next(err)
  }

  if (mobile && !validator.isMobilePhone(mobile, 'en-AU')) {
    var err = new Error('Mobile number is not valid.')
    err.status = 400
    // return next(err)
  }

  if (!err) {
    const user = User.create({
      country: country,
      firstname : firstname,
      lastname: lastname,
      emailaddress: email,
      password: password,
      address: joinedAddress,
      city: city,
      state: state,
      zip: zip,
      mobile: mobile
    }, (err, user) => {
      if (err) {
        console.log(err)
        // return next(err)
      } else {
        return res.redirect('/')
      }
    })
  } else {
    const original_values = {
      country: country,
      firstname : firstname,
      lastname: lastname,
      emailaddress: email,
      password: password,
      address: joinedAddress,
      city: city,
      state: state,
      zip: zip,
      mobile: mobile
    }

    res.sendFile(__dirname + '/frontend/400.html', { errorMsg: err, original: original_values, title: "Login error" })
  }
})

app.post('/login/', (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  // Authenticate email for login
  User.authenticate(email, password, (error, user) => {
    console.log(user)
    if (error) {
      var err = new Error('Wrong email or password.')
      err.status = 401;
      return next(err);
    } else {
      return res.sendFile(__dirname + '/frontend/details.html')
    }
  })
})
