const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')


// express app
const app = express()
const PORT = process.env.PORT ?? 1234
app.disable("x-powered-by")

// basic middlewares
app.use(express.json())
app.use(cors())


// Get all movies or movies with query
app.get('/movies', (req, res) => {
  
  const { genre } = req.query

  if (Object.keys(req.query).length === 0 || !genre) return res.json(movies)

  const moviesOfGenre = movies.filter(m => m.genre.map(g => g.toLowerCase()).includes(genre.toLowerCase()))

  if (moviesOfGenre.length === 0) return res.status(404).json({ error: "Movies not found" })

  res.json(moviesOfGenre)
})

// Get movie by id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(m => m.id === id)

  if (movie) return res.json(movie)
  
  res.status(404).json({ error: "Movie not found" })
})

// Post new movie
app.post('/movies', (req, res) => {
  const { id } = req.body 

  if (id) {
    const movieExists = movies.find(m => m.id === id)
    if (movieExists) {
      return res.status(409).json({ error: "Movie already exists"})
    }
  }

  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json(result.error)
  }

  // validate entries

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }


  movies.push(newMovie)

  return res.status(201).json(newMovie)
})

// Update a movie
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(m => m.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ error: 'Movie not found' })
  }
  
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json(result.error)
  }

  const movieUpdated = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = movieUpdated
  res.status(200).json(movieUpdated)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  if (!id) return res.status(404).json({ error: 'Movie not found' })

  const movieIndex = movies.findIndex(m => m.id === id)

  if (movieIndex < 0) return res.status(404).json({ error: 'Movie not found' })

  movies.splice(movieIndex, 1)

  res.status(200).json(movies)
})

// App running and listening to port
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})