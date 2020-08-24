const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const validator = require('validator')
const multiparty = require('multiparty')
const session = require('express-session')
const User = require('./models/user')
const sendEmail = require('./public/scripts/email')

require('dotenv').config()

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

// Attach session allowing for different security in local to production.
const sess_attr = {
  secret: 'sit313',
  cookie: {}
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess_attr.cookie.secure = true // serve secure cookies
}
app.use(session(sess_attr))

const uri = "mongodb+srv://admin:jDrsgl9svkYVq0hd@cluster0.xtcre.mongodb.net/icrowdtask?retryWrites=true&w=majority"

mongoose.connect(uri, {useNewUrlParser: true})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/reqtask/')
  } else {
    res.sendFile(__dirname + '/frontend/reqlogin.html')
  }
})
app.get('/reqsignup/', (req, res) => res.sendFile(__dirname + '/frontend/reqsignup.html'))

app.get('/reqtask/', (req, res, next) => {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error)
      } else {
        if (!user) {
          var err = new Error('Please sign in.')
          err.status = 400
          return next(err)
        } else {
          return res.send(`<h2 class="mt-5">Welcome ${user.firstname}!!</h2><p class="mt-2" style="align-self: center;">You have logged in successfully</p>`)
        }
      }
    })
})

app.post('/reqsignup/', (req, res, next) => {
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
        sendEmail(user.emailaddress, user.firstname, user.lastname, user.country)
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

    res.sendFile(__dirname + '/frontend/400.html')
  }
})

app.post('/reqlogin/', (req, res, next) => {
  let email = ''
  let password = ''

  let form = new multiparty.Form()
  form.parse(req)
  form.parse(req, function(err, fields, files) {
    email = fields.email[0]
    password = fields.password[0]

    // Authenticate email for login
    User.authenticate(email, password, (error, user) => {
      if (error) {
        var err = new Error('Wrong email or password.')
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user.id;
        return res.redirect('/reqtask/')
      }
    })
  })
})
