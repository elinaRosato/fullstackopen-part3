const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/persons');
const app = express();
require('dotenv').config()

// Define a custom token for logging the request body
morgan.token('request-body', (request, resesponse) => {
  return JSON.stringify(request.body);
});

//Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' }) // HTTP 400 Bad request
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })  
  }
  next(error)
}

//Unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Add the static middleware
app.use(cors())

// Add middleware for parsing JSON request bodies
app.use(express.json());

// Add the morgan middleware with custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

// Add the cors middleware to show static content
app.use(express.static('build'))

// Routes
app.get('/info', (request, response, next) => {
  const timestamp = new Date();
  Person.find({})
    .then(persons => {
      response.send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p></div>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end(); // HTTP 404 Not found
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end(); // HTTP 204 No Content
    })
})

app.post('/api/persons', (request, response, next) => {
	const { name, number } = request.body

  Person.find({ name: name })
    .then(persons => {
      if ( persons.length > 0 ) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person ({
        name: name,
        number: number
      })
      
      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Add the unknown endpoint middleware
app.use(unknownEndpoint)

// Add the error handler middleware
app.use(errorHandler)

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})