const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().positive().min(1900).max(3000),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url(),
  genre: z.array(
    z.enum(["Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Thriller", "Sci-Fi"])
  ),
  rate: z.number().min(0).max(10),
})

function validateMovie(object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie,
  movieSchema,
}