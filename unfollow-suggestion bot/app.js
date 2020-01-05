const express = require('express')
const scorePic = require('./public/scorePics')
const app = express()
const port = 3000

app.get('/', (req, res) =>{
     res.redirect('botUI.html')})

app.get('/score/:profile', (req, res) =>{
     res.send(scorePic.scoreThem(req.params.profile))
})

app.get('/checkResults', (req, res) =>{
    return res.send( scorePic.checkResults() )
})

app.use(express.static('public'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))