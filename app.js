const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

module.exports = app
