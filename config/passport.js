const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const User = require('../models/UserModel')


module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) =>{
        // Match User
        User.findOne({
            email: email
        }).then(user => {
            if(!user){
                return done(null, false, {message: 'No User Found'})
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err
                if(isMatch){
                    return done(null, user)
                }else{
                    return done(null, false, {message: 'Password Incorrect'})
                }
            })
        })
    }))

    passport.serializeUser(function(user, done){
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user)
        })
    })
}