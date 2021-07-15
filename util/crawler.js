const axios = require("axios");
const cheerio = require("cheerio");
const champions = require("./champ");
const cussWords = require("./word");

let baseUrl = "https://www.op.gg/champion/";
let backUrl = "/statistics/top/comment";
let data = [];

function crawlData(champion) {
    const getHtml = async () => {
        try {
            return await axios.get(baseUrl + champion.eng + backUrl);
        } catch(err) {
            console.log(err);
        }
    }
    
    getHtml().then(html => {
        const $ = cheerio.load(html.data);
        const $comments = $("div.tabItem.ChampionCommentTab-Popular ul div.comment-box__content");

        $comments.each(async function(i, elem) {
            var str = $(this).find("p.comment-box__txt").text()

            cussWords.forEach((el) => {
                str = str.replace(new RegExp(el, 'g'), "(심한 욕)")
            })

            str = str.replace(new RegExp(champion.kor, "g"), "(챔피언 이름)")

            champion.sim.forEach((el) => {
                str = str.replace(new RegExp(el, 'g'), "(챔피언 이름)")
            })

            data.push({
                name: champion.eng,
                content: str,
            })
        })
    })
}

champions.forEach((el) => {
    crawlData(el);
})

module.exports = data;