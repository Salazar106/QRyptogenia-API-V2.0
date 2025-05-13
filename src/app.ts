import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieparser from 'cookie-parser'
import routes from './routes'
import { corsOptions } from './config'
// import { errorHandler } from './middlewares/error.handler'
const app = express()

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieparser())

app.use(morgan('dev'))

// Routes
app.use('/api', routes)

app.get('/', (_req, res) => {
    res.send('API is running')
})

// Middleware para manejar errores (opcional)
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// app.use(errorHandler)

export default app
