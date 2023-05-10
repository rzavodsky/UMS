import { Router } from 'express'
import { validate } from '../validation.js'
import { Person } from '../db.js'
import { personToJson as studentToJson } from './student.js'
import { personToJson as teacherToJson } from './teacher.js'
import { comparePassword, createNewKeyForUser, hashPassword } from '../auth.js'

const router = Router()

router.post("/login",
    validate({
        body: {
            type: 'object',
            additionalProperties: false,
            properties: {
                username: { type: 'string' },
                password: { type: 'string' },
            },
            required: ['username', 'password'],
        }
    }),
    async (req, res) => {
        if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            res.status(200).json({
                token: await createNewKeyForUser('admin')
            })
            return
        }
        const person = await Person.findOne({where: {
            loginUsername: req.body.username,
        }})
        if (person === null) {
            res.status(401).json({
                error: 'Login failed',
                message: 'Invalid username or password',
            })
            return
        }

        const passwordMatch = await comparePassword(req.body.password, person.loginPassword)
        if (!passwordMatch) {
            res.status(401).json({
                error: 'Login failed',
                message: 'Invalid username or password',
            })
            return
        }

        const token = await createNewKeyForUser(person)
        res.status(200).json({
            token
        })
})

router.delete("/logout", async (req, res) => {
    await req.key.destroy()
    res.status(204).end()
})

router.get("/me", async (req, res) => {
    if (req.key.isAdmin) {
        res.status(200).json({
            isAdmin: true,
        })
        return
    }
    const person = await Person.findByPk(req.key.PersonId)
    let data
    if (person.isTeacher) {
        data = teacherToJson(person)
    } else {
        data = studentToJson(person)
    }
    data.isTeacher = person.isTeacher
    data.isAdmin = false
    res.status(200).json(data)
})

router.post("/changepwd",
    validate({
        body: {
            type: 'object',
            additionalProperties: false,
            properties: {
                oldPassword: { type: 'string' },
                newPassword: { type: 'string' },
            },
            required: ['oldPassword', 'newPassword'],
        }
    }),
    async (req, res) => {
        if (req.key.isAdmin) {
            res.status(400).json({
                error: "Admin cannot change password",
            });
            return;
        }
        const person = await Person.findByPk(req.key.PersonId)
        const passwordMatch = await comparePassword(req.body.oldPassword, person.loginPassword);
        if (!passwordMatch) {
            res.status(400).json({
                error: "Invalid password",
            });
            return;
        }
        person.loginPassword = await hashPassword(req.body.newPassword);
        await person.save();
        res.status(204).end()
})

export default router
