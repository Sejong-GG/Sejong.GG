const axios = require("axios");
const cheerio = require("cheerio");

const cussWords = ["혜지", "년", "시발", "애미", "새끼", "버러지", "씨발", "럭포터", "엄마", "새낀", "좆", "병신", "고아", "저능아", "씹", "씹창", "강간", "@ㅐ미", "Zl랄", "장애"]

const champions = {
    "amumu" : "아무무", 
    "janna" : "잔나", 
    "katarina" : "카타리나", 
    "garen" : "가렌", 
    "lux" : "럭스", 
    "gnar" : "나르", 
    "zed" : "제드", 
    "annie" : "애니", 
    "monkeyking" : "오공", 
    "akali" : "아칼리", 
    "camille" : "카밀", 
    "drmundo" : "문도", 
    "kennen" : "케넨"
};
let baseUrl = "https://www.op.gg/champion/";
let backUrl = "/statistics/top/comment";
let data = [];

function crawlData(champion, rep) {
    const getHtml = async () => {
        try {
            return await axios.get(baseUrl + champion + backUrl);
        } catch(err) {
            console.log(err);
        }
    }
    
    getHtml().then(html => {
        const $ = cheerio.load(html.data);
        const $comments = $("div.tabItem.ChampionCommentTab-Popular ul div.comment-box__content");
        var re = new RegExp(rep, "g");

        $comments.each(async function(i, elem) {
            var str = $(this).find("p.comment-box__txt").text()

            cussWords.forEach((el) => {
                str = str.replace(new RegExp(el, 'g'), "(심한 욕)")
            })

            data.push({
                name: champion,
                content: str.replace(re, "(챔피언 이름)")
            })
        })
    })
}

for(const [key, value] of Object.entries(champions)) {
    crawlData(key, value);
}


module.exports = data;