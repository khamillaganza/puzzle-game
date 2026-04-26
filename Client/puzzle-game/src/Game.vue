<script setup>
import { ref, onMounted } from 'vue'

const API = "https://puzzle-game-1-8dwl.onrender.com"

const size = ref(3)
const board = ref([])
const moves = ref(0)
const time = ref(0)
const startTime = ref(0)
const playerName = ref("")
const leaderboard = ref([])
const gameStarted = ref(false)
const gameWon = ref(false)

let timer = null

const moveSound = new Audio('/move.mp3')
const winSound = new Audio('/win.mp3')

/* 🎮 START GAME */
function startGame(level) {
  size.value = level
  moves.value = 0
  time.value = 0
  gameWon.value = false
  gameStarted.value = true
  startTime.value = Date.now()

  createBoard()
  startTimer()
  loadScores()
}

/* 🔙 BACK */
function backToMenu() {
  clearInterval(timer)
  gameStarted.value = false
  gameWon.value = false
  board.value = []
}

/* 🧩 BOARD */
function createBoard() {
  let nums = []

  for (let i = 1; i < size.value * size.value; i++) {
    nums.push(i)
  }
  nums.push(null)

  nums.sort(() => Math.random() - 0.5)

  board.value = []
  while (nums.length) {
    board.value.push(nums.splice(0, size.value))
  }
}

/* 🔄 MOVE */
function moveTile(r, c) {
  if (gameWon.value) return

  const dirs = [[0,1],[1,0],[-1,0],[0,-1]]

  for (let [dr, dc] of dirs) {
    let nr = r + dr
    let nc = c + dc

    if (board.value[nr]?.[nc] === null) {
      board.value[nr][nc] = board.value[r][c]
      board.value[r][c] = null

      moves.value++
      moveSound.play()

      checkWin()
      return
    }
  }
}

/* 🏆 WIN CHECK */
function checkWin() {
  let count = 1

  for (let r = 0; r < size.value; r++) {
    for (let c = 0; c < size.value; c++) {
      if (r === size.value - 1 && c === size.value - 1) {
        win()
        return
      }
      if (board.value[r][c] !== count++) return
    }
  }
}

/* 🎉 WIN */
function win() {
  clearInterval(timer)
  gameWon.value = true
  winSound.play()

  submitScore()
}

/* ⏱ TIMER */
function startTimer() {
  clearInterval(timer)

  timer = setInterval(() => {
    time.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

/* 🎯 DIFFICULTY (KEEP CONSISTENT) */
function getDifficulty() {
  return size.value === 3 ? "Easy Level" :
         size.value === 4 ? "Medium Level" :
         "Hard Level"
}

/* 📤 SAVE SCORE (FIXED + AUTO REFRESH) */
async function submitScore() {
  if (!playerName.value) return

  await fetch(`${API}/api/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: playerName.value,
      moves: moves.value,
      time: time.value,
      difficulty: getDifficulty()
    })
  })

  await loadScores()   // 🔥 FIX: ensures leaderboard updates instantly
}

/* 📥 LEADERBOARD (FIXED) */
async function loadScores() {
  const res = await fetch(
    `${API}/api/scores?difficulty=${getDifficulty()}`
  )
  leaderboard.value = await res.json()
}

onMounted(loadScores)
</script>

<template>
  <div class="container">

    <div class="card">

      <h1>🧩 Puzzle Game</h1>

      <input v-model="playerName" placeholder="Enter your name" />

      <div v-if="!gameStarted" class="levels">
        <p class="label">Choose Level</p>
        <button @click="startGame(3)">Easy</button>
        <button @click="startGame(4)">Medium</button>
        <button @click="startGame(5)">Hard</button>
      </div>

      <div v-if="gameStarted" class="stats">
        <span>⏱ {{ time }}s</span>
        <span>🎯 {{ moves }} moves</span>
      </div>

      <div v-if="gameStarted && !gameWon" class="board">
        <div v-for="(row, r) in board" :key="r">
          <button v-for="(cell, c) in row"
                  :key="c"
                  @click="moveTile(r,c)">
            {{ cell }}
          </button>
        </div>
      </div>

      <div v-if="gameWon" class="win">
        <h2>🎉 You Won!</h2>
        <p>Great job {{ playerName }}!</p>
      </div>

      <div v-if="gameStarted" class="actions">
        <button @click="startGame(size)">Restart</button>
        <button class="back" @click="backToMenu">Back</button>
      </div>

      <div class="leaderboard">
        <h3>🏆 Leaderboard ({{ getDifficulty() }})</h3>

        <ul>
          <li v-for="s in leaderboard" :key="s._id">
            {{ s.name }} - {{ s.time }}s - {{ s.moves }} moves
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial;
  background: #eef2f7;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  width: 360px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

input {
  width: 90%;
  padding: 10px;
  margin: 10px 0;
}

.levels {
  margin: 15px 0;
}

.label {
  font-weight: bold;
}

button {
  margin: 5px;
  padding: 10px;
  border: none;
  background: #4CAF50;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #43a047;
}

.stats {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.board button {
  width: 60px;
  height: 60px;
  font-size: 18px;
}

.actions {
  margin-top: 10px;
}

.back {
  background: #f44336;
}

.win {
  padding: 20px;
  background: #e8f5e9;
  border-radius: 10px;
  margin: 10px 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #eee;
}
</style>