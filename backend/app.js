import express, { json } from 'express'
import { ValidationError } from 'express-json-validator-middleware'
import country from './endpoints/country.js'

const port = 3000
const app = express()
const router = express.Router()

router.use(country)

app.use(json())
app.use('/api', router)

app.use((err, _req, res, next) => {
    if (err instanceof ValidationError) {
        res.status(400).send(err.validationErrors)
        next()
    } else {
        next(err)
    }
})

app.listen(port, () => {
    console.log(`UMS backend listening on port ${port}`)
})
