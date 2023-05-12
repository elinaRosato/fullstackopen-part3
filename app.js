const express = require('express')
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const personsRouter = require('./controllers/persons')
const mongoose = require('mongoose')
const morgan = require('morgan')

// Create main application object
const app = express()

// Establish the connection to the database
mongoose.set('strictQuery',false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(
    logger.info('connected to MongoDB')
  )
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// Add middleware for parsing JSON request bodies
app.use(express.json())

// Add the static middleware
app.use(cors())

// Add the cors middleware to show static content
app.use(express.static('build'))

// Define a custom token for logging the request body
morgan.token('request-body', (request) => {
  return JSON.stringify(request.body)
})
// Add the morgan middleware with custom format
morgan(':method :url :status :res[content-length] - :response-time ms :request-body')

// Add the personsRouter middleware to handle routes
app.use('/api/persons', personsRouter)

// Add the unknown endpoint middleware
app.use(middleware.unknownEndpoint)

// Add the error handler middleware
app.use(middleware.errorHandler)

module.exports = app