import express from "express"
const PORT = 5000

const app = express()

app.get("/", (_, res) => {
  res.status(200).send()
})

app.listen(PORT, () => console.log(`Running on port ${PORT}`))
