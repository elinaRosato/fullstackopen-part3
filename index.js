const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express();

// Define a custom token for logging the request body
morgan.token('request-body', (request, resesponse) => {
  return JSON.stringify(request.body);
});

// Add middleware for parsing JSON request bodies
app.use(express.json());

// Add the morgan middleware with custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

// Add the cors middleware
app.use(cors())

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
  response.send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p></div>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const newId = persons.length > 0
    ? Math.random()*10000
    : 0
  return newId
}

app.post('/api/persons', (request, response) => {
	const body = request.body
  console.log(body)
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
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  response.json(person)
})

// Start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})