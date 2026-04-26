const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ DB Error:", err))

// 📦 Schema
const scoreSchema = new mongoose.Schema({
  name: String,
  moves: Number,
  time: Number,
  difficulty: String,
  date: { type: Date, default: Date.now }
})

const Score = mongoose.model("Score", scoreSchema)

// 🎯 POST score
app.post("/api/scores", async (req, res) => {
  try {
    const { name, moves, time, difficulty } = req.body

    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const newScore = new Score({
      name,
      moves,
      time,
      difficulty
    })

    await newScore.save()

    res.json({ message: "Score saved successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 📊 GET leaderboard
app.get("/api/scores", async (req, res) => {
  try {
    const { difficulty } = req.query

    const query = difficulty ? { difficulty } : {}

    const scores = await Score.find(query)
      .sort({ time: 1 })
      .limit(10)

    res.json(scores)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🚀 Server start
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})