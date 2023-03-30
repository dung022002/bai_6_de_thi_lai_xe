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
    const arrImage = []
    arrOne.each((index, element) => {
        const link = $(element).find('div.dethi_item>div.top_dethi>span.btn_status > a').attr('href')
        // arr.push() đẩy vào sau cùng của dãy
        arr[index] = 'https://vnexpress.net' + link

    })
    // kiểm tra thư mục tồn tại hay chưa
    if (fs.existsSync('./testFolder')) {

        // xóa thư mục nếu đã tồn tại
        fs.rmSync('./testFolder', { recursive: true })
    }

    // tạo 1 thư mục mới
    fs.mkdirSync('./testFolder')


    if (fs.existsSync('public/images')) {
        fs.rmSync('public/images', { recursive: true })
    }
    fs.mkdirSync('public/images')

    // lặp vào từng link trong mảng
    for (const [index, iterator] of arr.entries()) {

        //tạo 1 json tương đương với 1 đề
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
            const qsContent = questionContent.replaceAll('\n', '')

            // get children of list ans
            const listAnswers = a(question).find('div.noidung_dapan > ul').children()


            let pathImg = null

            // find img if exist add image to question obj 
            const imgLink = a(question).find('p.noidung_cauhoi> img').attr('src')
            // if (imgLink) {
            //     questionJson.image = imgLink
            // }

            if (imgLink) {
                arrImage.push(imgLink);
                const nameImg = imgLink.split('https://i-vnexpress.vnecdn.net/2020/09/04/')[1];
                pathImg = '/images/' + nameImg;

                await axios({
                    url: imgLink,
                    responseType: 'stream',
                }).then(res => {
                    res.data.pipe(fs.createWriteStream('public/images/' + nameImg)).on('finish', () => {

                    });
                })
                    .catch(err => {
                        console.log(nameImg);
                        return reject(err);
                    })

            }


            //define question obj
            const questionJson = { name: nameQs, content: qsContent, image: pathImg, answers: [] }


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