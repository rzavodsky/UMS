import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Person } from '../db.js'
import { Op } from 'sequelize'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        birthDate: { type: 'string' }, // TODO: Format date
        gender: { type: 'string' },
        CityId: { type: 'integer' },
        FacultyId: { type: 'integer' },
    },
    required: ['firstName', 'lastName', 'birthDate', 'gender', 'FacultyId', 'CityId'],
}
const patch_schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        birthDate: { type: 'string' }, // TODO: Format date
        gender: { type: 'string' },
        CityId: { type: 'integer' },
        loginPassword: { type: 'string' }
    }
}

function personToJson(person) {
    return {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        birthDate: person.birthDate,
        gender: person.gender,
        CityId: person.CityId,
        loginUsername: person.loginUsername,
        FacultyId: person.TeacherFacultyId,
    }
}

router.use('/teachers/:id', validateIdParams)
router.use('/teachers/:id', async (req, res, next) => {
    const data = await Person.findOne({ where: {
        id: req.params.id,
        isTeacher: true,
    }})
    if (data === null) {
        return res.status(404).json({ error: `Teacher ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/teachers',
    async (_req, res) => {
        const data = await Person.findAll({ where: {
            isTeacher: true,
        }})
        res.json({ data: data.map(personToJson) })
    })

// Retrieve
router.get('/teachers/:id',
    async (_req, res) => {
        res.json(personToJson(res.locals.data))
    })

// Create
router.post('/teachers',
    validate({ body: schema }),
    async (req, res, next) => {
        const normalizedLastName = req.body.lastName
              .toLowerCase()
              .normalize("NFD") // Split diacritics 
              .replace(/\p{Diacritic}/gu, '') // Remove Diacritic symbols
        const lastPerson = await Person.findOne({
            where: {
                loginUsername: {
                    [Op.regexp]: '^' + normalizedLastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\d+"
                }
            },
            order: [['id', 'DESC']],
        });
        let newIndex;
        if (lastPerson === null) {
            newIndex = 1
        } else {
            newIndex = +lastPerson.loginUsername.substr(normalizedLastName.length) + 1
        }
        const loginUsername = normalizedLastName + newIndex
        Person.create({
            ...req.body,
            loginUsername,
            loginPassword: 'password',
            TeacherFacultyId: req.body.FacultyId,
            isTeacher: true,
        })
            .then(data => res.json(personToJson(data)))
            .catch(next)
    })

// Update
router.patch('/teachers/:id',
    validate({ body: patch_schema }),
    async (req, res) => {
        // TODO: Check if password updated
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(personToJson(res.locals.data))
    })

// Delete
router.delete('/teachers/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
