import express, { json } from 'express'
import { ValidationError } from 'express-json-validator-middleware'
import country from './endpoints/country.js'
import city from './endpoints/city.js'
import classroom from './endpoints/classroom.js'
import degree_type from './endpoints/degree_type.js'
import faculty from './endpoints/faculty.js'
import programme from './endpoints/programme.js'

const port = 3000
const app = express()
const router = express.Router()

router.use(country)
router.use(city)
router.use(classroom)
router.use(degree_type)
router.use(faculty)
router.use(programme)

app.use(json())
app.use('/api', router)

// Error Handler
app.use((err, _req, res, next) => {
    if (err instanceof ValidationError) {
        res.status(400).send(err.validationErrors)
        next()
    } else {
        next(err)
    }
})

// 404 Handler
app.use((_req, res, _next) => {
    res.status(404).json({
        error: "Not Found"
    })
})

app.listen(port, () => {
    console.log(`UMS backend listening on port ${port}`)
})
