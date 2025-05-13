import app from './app'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const PORT = process.env.PORT || 3001

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} 👌`)
})
