import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Person, Lesson, Subject, Classroom, StudentSubject } from '../db.js'
import { Op } from 'sequelize'
import { adminOnly, hashPassword, PASSWORD_REGEX } from '../auth.js'

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
        StudentGroupId: { type: 'integer' },
        credits: { type: 'integer' },
    },
    required: ['firstName', 'lastName', 'birthDate', 'gender', 'StudentGroupId', 'CityId', 'credits'],
}
const patch_schema = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                firstName: { type: 'string', maxLength: 255 },
                lastName: { type: 'string', maxLength: 255 },
                birthDate: { type: 'string', format: 'date' },
                gender: { type: 'string' },
                CityId: { type: 'integer' },
                credits: { type: 'integer' },
                StudentGroupId: { type: 'integer' },
            }
        },
        {
            type: 'object',
            additionalProperties: false,
            properties: {
                loginPassword: { type: 'string', pattern: PASSWORD_REGEX },
            }
        },
    ]
}

export function personToJson(person) {
    return {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        birthDate: person.birthDate,
        gender: person.gender,
        CityId: person.CityId,
        loginUsername: person.loginUsername,
        credits: person.studentCredits,
        StudentGroupId: person.StudentGroupId,
    }
}

router.use('/students/:id', validateIdParams)
router.use('/students/:id', async (req, res, next) => {
    const data = await Person.findOne({ where: {
        id: req.params.id,
        isTeacher: false,
    }})
    if (data === null) {
        return res.status(404).json({ error: `Student ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/students',
    async (_req, res) => {
        const data = await Person.findAll({ where: {
            isTeacher: false,
        }})
        res.json({ data: data.map(personToJson) })
    })

// Retrieve
router.get('/students/:id',
    async (_req, res) => {
        res.json(personToJson(res.locals.data))
    })

// Create
router.post('/students',
    adminOnly,
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
            loginPassword: await hashPassword('password'),
            studentCredits: req.body.credits,
            isTeacher: false,
        })
            .then(data => res.json(personToJson(data)))
            .catch(next)
    })

// Update
router.patch('/students/:id',
    adminOnly,
    validate({ body: patch_schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        if (req.body.loginPassword !== undefined) {
            const hashedPwd = await hashPassword(req.body.loginPassword)
            res.locals.data.loginPassword = hashedPwd
        }
        await res.locals.data.save()
        res.json(personToJson(res.locals.data))
    })

// Delete
router.delete('/students/:id',
    adminOnly,
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })

// Get timemtable
router.get('/students/:id/lessons',
    async (req, res) => {
        const lessons = await Lesson.findAll({
            include: [
                {
                    model: Subject,
                    required: true,
                    include: [
                        {
                            model: StudentSubject,
                            where: {
                                PersonId: req.params.id
                            }
                        }
                    ]
                },
                { model: Person, as: 'Teacher' },
                Classroom,
            ],
        })
        res.json({
            data: lessons,
        })
    })
export default router
