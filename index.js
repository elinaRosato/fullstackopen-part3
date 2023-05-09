const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/persons');
const app = express();

// Define a custom token for logging the request body
morgan.token('request-body', (request, resesponse) => {
  return JSON.stringify(request.body);
});

// Add middleware for parsing JSON request bodies
app.use(express.json());

// Add the morgan middleware with custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

// Add the static middleware
app.use(cors())

// Add the cors middleware to show static content
app.use(express.static('build'))

// Data
let persons = [
	{ 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

// Routes
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const timestamp = new Date();
  Person.find({}).then(persons => {
    response.send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p></div>`)
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
    })
  })

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end(); // HTTP 204 No Content
    })
})

app.post('/api/persons', (request, response) => {
	const body = request.body
	if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
	if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  Person.find({}).then(persons => {
    if (persons.find(person => person.name === body.name)) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }
    const person = new Person ({
      name: body.name,
      number: body.number
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })
})

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})