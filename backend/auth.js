import crypto from 'crypto'
import { Op } from 'sequelize'
import { Key, Person } from './db.js'
import bcrypt from 'bcrypt'

const KEY_LENGTH = 64
const SALT_ROUNDS = 10
export const PASSWORD_REGEX = "^[a-zA-Z0-9`~!@#$%^&*()_\\-=+'\"/?.>,<\\\\]{8,}$"

/** How long should a key be valid for in milliseconds */
const KEY_EXPIRY = 1000 * 60 * 60 * 1

function generateKey() {
    const key = crypto.randomBytes(KEY_LENGTH/2).toString('hex');
    return key
}

function hashKey(key) {
    const hash = crypto.createHash('sha256')
    hash.update(key)
    return hash.digest('hex')
}

async function purgeExpiredKeys() {
    await Key.destroy({
        where: {
            expiresAt: {
                [Op.lt]: new Date()
            }
        }
    })
}

/**
 * Creates a key for a specified user and stores it in the database.
 * This function also purges all expired keys from the database.
 * @param {Person | 'admin'} user - The user for which the key should be created
 * @returns The created key
 */
export async function createNewKeyForUser(user) {
    await purgeExpiredKeys()
    const key = generateKey()
    const isAdmin = user === 'admin'
    await Key.create({
        isAdmin,
        isTeacher: isAdmin ? false : user.isTeacher,
        PersonId: isAdmin ? null : user.id,
        hashedKey: hashKey(key),
        expiresAt: new Date(Date.now() + KEY_EXPIRY),
    })
    return key
}

async function getKeyFromDb(key) {
    return await Key.findOne({ where: {
        hashedKey: hashKey(key),
        expiresAt: {
            [Op.gt]: new Date(),
        }
    }})
}

/**
 * Middleware, which checks for the presence of a key in the Authorization header,
 * retireves the key from the database and adds it to the request object for use in route handlers.
 * @param {string[]} skip_paths - Array of paths, for which authorization should be skipped
 */
export function authMiddleware(skip_paths) {
    return async (req, res, next) => {
        if (skip_paths.includes(req.path)) {
            next()
            return
        }
        const auth_header = req.get('Authorization')
        if (!auth_header || !auth_header.startsWith('Bearer ')) {
            res.status(401).end()
            return
        }
        const key = auth_header.substr('Bearer '.length)
        if (!key) {
            res.status(401).end()
            return
        }

        const dbkey = await getKeyFromDb(key)
        if (!dbkey) {
            res.status(401).end()
            return
        }
        req.key = dbkey
        next()
    }
}

/**
 * Middleware, which makes a route only accessible to an admin.
 * This middleware needs to be after the `authMiddleware` middleware.
 */
export function adminOnly(req, res, next) {
    if (req.key.isAdmin) {
        next()
    } else {
        res.status(403).end()
    }
}

/**
 * Hashes a password for storage in a database.
 * @param {string} password
 * @return {Promise<string>} The hashed password as hex string
 */
export function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Safely compares a password against a hash.
 * @param {string} password - Plain text password to compare
 * @param {string} hash - Hashed password to compare against
 * @return {Promise<boolean>} Whether the password matches
 */
export function comparePassword(password, hash) {
    return bcrypt.compare(password, hash)
}
