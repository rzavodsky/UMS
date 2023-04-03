import express, { json } from 'express'

const port = 3000
const app = express()
const router = express.Router()

app.use(json())
app.use('/api', router)

app.listen(port, () => {
    console.log(`UMS backend listening on port ${port}`)
})
