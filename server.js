const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const Handlebars = require('handlebars');

const app = express()
const port = 3000

// set up view engine to handlebar
app.engine('hbs', hbs.engine({
    extname: '.hbs'
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'css')))
// define sub expresion hbs
Handlebars.registerHelper('isNotNull', function (value) {
    return value !== null;
});

Handlebars.registerHelper('checkDisplay', function (currentQs, marker) {
    const qsDL = marker.split(':')[0] + '(điểm liệt):'
    return currentQs != marker && currentQs != qsDL;
});

Handlebars.registerHelper('isFirstQs', function (currentQs) {
    return currentQs == 'Câu hỏi 1 :'
})

Handlebars.registerHelper('isLastQs', function (currentQs) {
    return currentQs == 'Câu hỏi 35 :'
})


// VD: url = http://localhost:3000/de-1/1?query1=valueQr1
// http://localhost:3000 = host
// de-1/1 = route
// /de-1/:id = de-1/1 => :id = 1 (req.params.{ten slug} VD req.params.id)
// sau ? lay gia tri cua query dung req.query.{ten query} VD: req.query.query1 => gia tri = 'valueQr1'

app.get('/:id(\\d+)/:cauhoi(\\d+)', function (req, res) {
    const id = req.params.id
    const cauhoi = parseInt(req.params.cauhoi)
    const data = require(`./Bo_de_thi_ly_thuyet/Đề số ${id}.json`)
    res.render('dethi', { dulieu: data, marker: `Câu hỏi ${cauhoi} :`, nextQs: cauhoi + 1, preQs: cauhoi - 1, id })

    //res.json(data)
    //res.send()
})

app.get('/', function (req, res) {
    const arr = []
    for (let i = 1; i <= 60; i++) { arr.push(i) }
    res.render('home', { arr })
})

app.get('*', function (req, res) {
    res.redirect('/')
})


app.listen(port, () => { console.log(`App listening at http://localhost:${port}`); })