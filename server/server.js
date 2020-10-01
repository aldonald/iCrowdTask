const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const validator = require('validator')
const multiparty = require('multiparty')
const session = require('express-session')
const User = require('./models/user')
const Worker = require('./models/worker')
const UserImage = require('./models/userImage')
const Request = require('./models/request')
const sendEmail = require('../public/scripts/email')
const bcrypt = require('bcrypt')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const path = require('path')
const cors = require("cors")
const crypto = require('crypto')
const faker = require('faker')
const multer = require('multer')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const populateRequestors = require('./populateRequestors')

require('dotenv').config()

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', express.static(path.join(__dirname, '..', 'public')))
app.use(fileUpload())

const upload = multer({
  dest: 'uploads/',
  rename: function (fieldname, filename) {
    return filename
  }
})

// Attach session allowing for different security in local to production.
const sess_attr = {
  secret: process.env.SESSIONKEY,
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
  }
}

// The following will only work per sessions docs if the sight is https
// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess_attr.cookie.secure = true // serve secure cookies
// }

app.use(session(sess_attr))
app.use(cors())
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(process.env.DBURI, {useNewUrlParser: true})

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLEID,
      clientSecret: process.env.GOOGLESECRET,
      callbackURL: "/auth/google/callback/"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({googleId: profile.id}).exec((error, user) => {
        if (user) {
          done(null, user)
        } else {
          // This will allow us to update the db if user signs in first time with Google
          User.findOne({emailaddress: profile.emails[0].value}).exec((error, user) => {
            if (user) {
              user.googleId = profile.id
              user.save()
              done(null, user)
            } else {
              // At the moment this would mean the user would never have a password set
              // and would not be able to login without Google Auth
              const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
              let finalPassword = ""
              for (var i = 0; i < 8; ++i) {
                  finalPassword += alpha.charAt(Math.floor(Math.random() * alpha.length))
              }
              const user = User.create({
                emailaddress: profile.emails[0].value,
                firstname : profile.name && profile.name.givenName ? profile.name.givenName : profile.emails[0].value,
                lastname: profile.name && profile.name.familyName ? profile.name.familyName : '',
                password: finalPassword,
                googleId: profile.id
              }, (err, user) => {
                if (err) {
                  console.log(err)
                  // return next(err)
                } else {
                  sendEmail('welcome', user._id.toString(), user.emailaddress, user.firstname, user.lastname, user.country, null)
                  console.log(user)
                  done(null, user)
                }
              })
            }
          })
        }
      })
    }
  )
)

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    User.findById(req.session.passport.user)
      .exec((error, user) => {
        if (error || !user) {
          var err = new Error('User not found.')
          err.status = 500
          return res.redirect('/api/reqlogin/')
        } else {
          res.send(JSON.stringify(user))
        }
      }
    )
  } else {
    res.redirect('/api/reqlogin/')
  }
})

app.get("/auth/google/", passport.authenticate('google', {
  scope: ['profile', 'email']
}))

app.get('/auth/google/callback/',
  passport.authenticate('google', { failureRedirect: '/api/reqlogin/' }),
  (req, res) => {
    return res.redirect('/')
  }
)

app.route('/api/logout/')
.post((req, res, next) => {
  req.logout()
  res.send('OK')
})

app.route('/api/reqsignup/')
.get((req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'reqsignup.html')))
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
        sendEmail('welcome', user._id.toString(), user.emailaddress, user.firstname, user.lastname, user.country, null)
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

    res.sendFile(path.join(__dirname, '..', 'public', '400.html'))
  }
})

app.route('/api/forgotpassword/')
.get((req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'passwordemailform.html')))
.post((req, res, next) => {
  User.findOne({emailaddress: req.body.email})
  .exec((error, user) => {
    if (error || !user) {
      return res.sendFile(path.join(__dirname, '..', 'public', 'passwordemailform.html'))
    } else {
      var token = crypto.randomBytes(64).toString('hex')
      user.passwordResetToken = token
      user.passwordTokenCreated = Date.now()
      user.save()
      sendEmail('forgot', user._id.toString(), user.emailaddress, user.firstname, null, null, token)
      return res.sendFile(path.join(__dirname, '..', 'public', 'passwordemailsent.html'))
    }
  })
})

app.get('/api/passwordreset/:id/:token', (req, res, next) => {
  const token = req.params.token
  User.findById(req.params.id)
  .exec(function (error, user) {
    if (error || !user) {
      var err = new Error('Please sign in.')
      err.status = 400
      return res.redirect('/api/reqlogin/')
    } else {
      // Needs to be less than an hour old
      const requestAge = Date.now() - user.passwordTokenCreated
      if (user.passwordResetToken === token && requestAge < 3600000) {
        req.session.passport = {user: user.id}
        res.sendFile(path.join(__dirname, '..', 'public', 'passwordreset.html'))
      } else {
        var err = new Error('Information incorrect.')
        err.status = 400
        return res.redirect('/api/reqlogin/')
      }
    }
  })
})

app.post('/api/passwordreset/', (req, res, next) => {
  if (req.isAuthenticated()) {
    User.findById(req.session.passport.user)
    .exec(function (error, user) {
      if (error || !user) {
        var err = new Error('Please sign in.')
        err.status = 400
        return res.redirect('/api/reqlogin/')
      } else {
        user.passwordResetToken = null
        user.passwordTokenCreated = null
        if (req.body.inputPassword !== req.body.confirmPassword) {
          var err = new Error('Passwords do not match.')
          err.status = 400
          return req.redirect(`/api/passwordreset/${id}/${token}`)
        } else {
          user.password = req.body.inputPassword
          user.save()
        }
        res.redirect('/')
      }
    })
  } else {
    return res.redirect('/api/reqlogin/')
  }
})

app.get('/api/reqtask/', (req, res, next) => {
  if (req.isAuthenticated()) {
    User.findById(req.session.passport.user)
      .exec(function (error, user) {
        if (error) {
          return res.redirect('/api/reqlogin/')
        } else {
          if (!user) {
            var err = new Error('Please sign in.')
            err.status = 400
            return res.redirect('/api/reqlogin/')
          } else {
            return res.send(`<h2 class="mt-5">Welcome ${user.firstname}!!</h2><p class="mt-2" style="align-self: center;">You have logged in successfully</p>`)
          }
        }
      }
    )
  }
})

app.route('/api/reqlogin/')
.get((req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'reqlogin.html')))
.post((req, res, next) => {
  let email = ''
  let password = ''

  let form = new multiparty.Form()
  form.parse(req, function(err, fields, files) {
    email = fields.email[0]
    password = fields.password[0]

    // Authenticate email for login
    User.authenticate(email, password, (error, user) => {

      if (error) {
        var err = new Error('Wrong email or password.')
        err.status = 401
        return next(err)
      }
      if (!user) {
        var err = new Error('User cannot be found.')
        err.status = 401
        return next(err)
      } else {
        if (req.session.passport) {
          req.session.passport.user = user.id
        } else {
          req.session.passport = {user: user.id}
        }
        return res.redirect('/home')
      }
    })
  })
})

app.post('/api/newtask/', (req, res, next) => {
  const body = req.body

  const request = new Request()
  request.user = req.session.passport.user
  request.taskTypeSelect = body.taskTypeSelect
  request.title = body.title
  request.description = body.description
  request.expiry = body.expiry
  request.choiceQuestion = body.choiceQuestion
  request.choiceOptions = body.choiceOptions.split(',')
  request.decisionTaskQuestion = body.decisionTaskQuestion
  request.sentenceTaskQuestion = body.sentenceTaskQuestion
  request.masterWorkers = body.masterWorkers
  request.reward = body.reward
  request.workerNumbers = body.workerNumbers
  request.created = Date.now()
  request.save()

  return res.status(201).json(request)
})

app.route('/api/workers/')
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
    Worker.create({
    user: user._id,
    worktypes: wortypesList,
    availabilities: dateList,
    areas: areaList
  }, (err, worker) => {
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

app.route('/api/workers/:id')
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

app.route('/api/users/:id')
.get((req, res) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    if (err) return res.send(err)
    else if (user) return res.send(user)
    else return res.status(400).send("No user of that id exists.")
  })
})
.patch((req, res, next) => {
  User.findOne({_id: req.params.id}, (err, user) => {
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

app.route('/api/userimage/')
.get((req, res) => {
  UserImage.find({user: req.session.passport.user})
  .exec((error, images) => {
    if (error || !images) {
      if (!error) {
        var err = new Error('No image found.')
        err.status = 400
      }
      return res.json(error)
    }
    images.sort((a, b) => b.created - a.created)
    return res.json(images[0])
  })
})
.post((req, res) => {
  if (req.files === null) return res.status(400).json({msg: "No file uploaded"})
  const file = req.files.image
  const created = Date.now()

  const image = new UserImage()
  image.name = file.name
  image.img.data = file.data
  image.img.contentType = file.mimetype
  image.user = req.session.passport.user
  image.created = created
  image.save()

  return res.status(201).json(image)
})

app.get('/api/requestors/', (req, res) => {
  Request.find({}).exec((err, requestList) => {
    if (err) return res.status(500).send(err)
    // Until workers are signed up!
    if (!requestList.length) {
      requestList = populateRequestors(8)
    }
    // TODO: In the future it may be beneficial to remove user's own cards
    // const user = req.session.passport.user
    // let requestsToSend
    // if (user) requestsToSend = requestList.filter(request.user ? request.user._id.toString() !== user : true)
    return res.json(requestList)
  })
})

let port = process.env.PORT;

if (port) {
  // app.use(express.static(path.join(__dirname, '..', 'public')))

  // Send to react
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
  })
}

if (port == null || port == "") {
  port = 8000
}

app.listen(port)
console.log(`Running on port ${port}`)
