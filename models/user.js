const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    emailaddress: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not valid.')
        }
      }
    },
    password: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: String,
    mobile: String
  }
)

//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
  var user = this
  // Password cannot be validated in the db as it is being hashed.
  if (user.password < 8) {
    throw new Error('Password is too short.')
  }
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

// Retrieve the user
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({emailaddress: email}).exec((err, user) => {
    if (err) {
      return callback(err)
    }
    if (!user) {
      var err = new Error('User does not exist.')
      err.status = 401;
      return callback(err)
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (result === true) {
        return callback(null, user)
      } else {
        return callback(new Error('Password was incorrect.'))
      }
    })
  })
}

const User = mongoose.model("User", UserSchema)  // This allows me to use User in authenticate method.

module.exports = User
