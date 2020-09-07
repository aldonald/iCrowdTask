const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const validator = require('validator')
const multiparty = require('multiparty')
const session = require('express-session')
const User = require('./models/user')
const Worker = require('./models/worker')
const sendEmail = require('./public/scripts/email')
const bcrypt = require('bcrypt')

require('dotenv').config()

const app = express()
app.use(bodyParser.json())
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

app.route('/reqsignup/')
.get((req, res) => res.sendFile(__dirname + '/frontend/reqsignup.html'))
.post((req, res, next) => {
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

app.get('/reqtask/', (req, res, next) => {
  debugger
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

app.route('/workers/')
.get((req, res) => {
  Worker.find((err, workersList)=> {
    if (err) res.send(err)
    else res.send(workersList)
  })
})
.post((req, res, next) => {
  const dateString = req.body.dates
  const stringDateList = dateString ? dateString.split(",") : null
  const dateList = []
  if (stringDateList) {
    stringDateList.forEach((date) => {
      dateList.push(Date.parse(date))
    })
  }

  const areaString = req.body.areas
  const areaList = areaString ? areaString.split(",") : []

  const worktypesString = req.body.worktypes
  const wortypesList = worktypesString ? worktypesString.split(",") : []

  // TODO: When I have implemented this as part of the user's session I will
  // access req.session.userId directly instead of using the user email.
  User.findOne({emailaddress: req.body.email}, (err, user) => {
    if (err) return res.send(err)
  }).then((user) => {
    debugger
    Worker.create({
    user: user._id,
    worktypes: wortypesList,
    availabilities: dateList,
    areas: areaList
  }, (err, worker) => {
    debugger
    if (err) {
      res.send(err)
    } else {
      res.status(201).send(JSON.stringify(worker))
    }
  })})
})
.delete((req, res) => {
  Worker.deleteMany((err) => {
    if (err) {
      return res.send(err)
    }
    return res.send("All items deleted.")
  })
})

app.route('/workers/:id')
.get((req, res) => {
  Worker.findOne({_id: req.params.id}, (err, worker) => {
    if (err) return res.send(err)
    else if (worker) return res.send(worker)
    else return res.status(400).send("No worker of that name exists.")
  })
})
.patch((req, res) => {
  Worker.findOne({_id: req.params.id}, (err, worker) => {
    if (err) return res.send(err)
    else if (!worker) return res.status(400).send("No worker of that id exists.")

    const dateString = req.body.dates
    const stringDateList = dateString ? dateString.split(",") : null
    const dateList = []
    if (stringDateList) {
      stringDateList.forEach((date) => {
        dateList.push(Date.parse(date))
      })
    }

    const areaString = req.body.areas
    const areaList = areaString ? areaString.split(",") : []

    const worktypesString = req.body.worktypes
    const wortypesList = worktypesString ? worktypesString.split(",") : []

    // Mongoose documents track changes. You can modify a document using
    // vanilla JavaScript assignments and Mongoose will convert it into
    // MongoDB update operators.
    worker.worktypes = wortypesList
    worker.availabilities = dateList
    worker.areas = areaList
    worker.save()

    return res.send(worker)
  })
})
.delete((req, res) => {
  Worker.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      return res.send(err)
    }
    return res.send("Worker deleted.")
  })
})

app.route('/users/:id')
.get((req, res) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    if (err) return res.send(err)
    else if (user) return res.send(user)
    else return res.status(400).send("No user of that id exists.")
  })
})
.patch((req, res, next) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    debugger
    if (err) return res.send(err)
    else if (!user) return res.status(400).send("No user of that id exists.")

    if (req.body.address) {
      user.address = req.body.address
    }

    if (req.body.mobile) {
      user.mobile = req.body.mobile
    }

    if (req.body.password) {
      if (req.body.password !== req.body.confirmPassword) {
        err = new Error('Passwords do not match.')
        err.status = 400
        return res.send(err)
      }

      if (password.length < 8) {
        err = new Error('Password is too short.')
        err.status = 400
        return res.send(err)
      }

      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
          return res.send(err)
        }
        user.password = hash
        next()
      })
    }
    user.save()

    return res.send(user)
  })
})
