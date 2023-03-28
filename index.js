const cheerio = require('cheerio')
const fs = require('fs')
const axios = require('axios')

const URL = "https://vnexpress.net/interactive/2016/thi-sat-hach-lai-xe"

async function run() {
    const res = await axios({
        url: URL,
    })
    let $ = cheerio.load(res.data)
    const arrOne = $('div.inner_list_dethi').children()
    const arr = []
    arrOne.each((index, element) => {
        const link = $(element).find('div.dethi_item>div.top_dethi>span.btn_status > a').attr('href')
        // arr.push() day vao sau cung
        arr[index] = 'https://vnexpress.net' + link

    })
    //kiem tra thu muc da ton tai hay chua
    if (!!fs.existsSync('./Bo_de_thi_ly_thuyet')) {

        //xoa thu muc da ton tai
        fs.rmSync('./Bo_de_thi_ly_thuyet', { recursive: true })
    }

    //tao 1 thu muc moi
    fs.mkdirSync('./Bo_de_thi_ly_thuyet')


    for (const [index, iterator] of arr.entries()) {
        const test = {
            name: 'Đề ' + (index + 1),
            listQuestion: []
        }
        const resData = await axios({
            url: iterator
        })
        let a = cheerio.load(resData.data)
        for (let i = 1; i <= 35; i++) {
            // get question div
            const question = a(`#question_${i}`);

            // get question name
            const nameQs = a(question).find('p.cauhoi_txt').text()

            // get question content
            const questionContent = a(question).find('p.noidung_cauhoi').text()

            // get children of list ans
            const listAnswers = a(question).find('div.noidung_dapan > ul').children()

            //define question obj
            const questionJson = { name: nameQs, content: questionContent, image: null, answers: [] }

            // find img if exist add image to question obj
            const imgLink = a(question).find('p.noidung_cauhoi> img').attr('src')
            // if (imgLink) {
            //     questionJson.image = imgLink
            // }
            questionJson.image = imgLink ? imgLink : null // Toan tu 3 ngoi

            listAnswers.each((i, el) => {
                // push ans to list ans
                questionJson.answers.push(a(el).find('span').text())
            })
            test.listQuestion.push(questionJson);
            fs.writeFileSync('./Bo_de_thi_ly_thuyet/' + 'Đề số ' + (index + 1) + '.json', JSON.stringify(test))
        }
    }
}


run()