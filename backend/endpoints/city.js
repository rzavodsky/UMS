import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Country, City } from '../db.js'
import { adminOnly } from '../auth.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
    }
}
const schema_required = ['name']   

router.use('/countries/:countryId/cities', validateIdParams)
router.use('/countries/:countryId/cities/:id', validateIdParams)
router.use('/countries/:countryId/cities*', async (req, res, next) => {
    const countryId = req.params.countryId
    const country = await Country.findByPk(countryId)
    if (country === null) {
        res.status(404).json({
            error: `Country ${countryId} not found`
        })
    } else {
        next()
    }
})
router.use('/countries/:countryId/cities/:id', async (req, res, next) => {
    const data = await City.findOne({
        where: {
            CountryId: req.params.countryId,
            id: req.params.id,
        }
    })
    if (data === null) {
        return res.status(404).json({ error: `City ${req.params.id} not found for country ${req.params.countryId}` })
    }
    res.locals.data = data
    next()
})


// List
router.get('/countries/:countryId/cities',
    async (req, res) => {
        const data = await City.findAll({
            where: {
                CountryId: req.params.countryId
            }
        })
        res.json({ data: data })
    })

// Retrieve
router.get('/countries/:countryId/cities/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/countries/:countryId/cities',
    adminOnly,
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await City.create({...req.body, CountryId: req.params.countryId})
        res.json(data)
    })

// Update
router.patch('/countries/:countryId/cities/:id',
    adminOnly,
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/countries/:countryId/cities/:id',
    adminOnly,
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
