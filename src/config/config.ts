import "dotenv/config"

const config = {
    PORT: process.env.PORT || 3005,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    
}

console.log(config)

export default config;