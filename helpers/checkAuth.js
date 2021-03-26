const JWT = require('jsonwebtoken')
const createError = require('http-errors');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
          const payload = {
            number : userId,
            name : "Sahil Khan"
          }
          const secret = process.env.JWT_KEY
          const options = {
            expiresIn: '1825d',
            issuer: 'Marziya Enterprise'
          }
          JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
              console.log(err.message)
              reject(createError.InternalServerError())
              return
            }
            resolve(token)
          })
        })
      }
}