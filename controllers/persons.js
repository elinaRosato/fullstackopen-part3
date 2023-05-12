const personsRouter = require('express').Router()
const Person = require('../models/persons')

// Routes
personsRouter.get('/info', (request, response, next) => {
  const timestamp = new Date()
  Person.find({})
    .then(persons => {
      response.send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p></div>`)
    })
    .catch(error => next(error))
})

personsRouter.get('/', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
})

personsRouter.get('/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

personsRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end() // HTTP 204 No Content
    })
    .catch(error => next(error))
})

personsRouter.post('/', (request, response, next) => {
  const { name, number } = request.body

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

personsRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

module.exports = personsRouter