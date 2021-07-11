const axios = require("axios");
const cheerio = require("cheerio");

const champions = ["amumu", "janna", "katarina", "garen", "lux", "gnar", "zed", "annie", "monkeyking", "akali", "camille", "drmundo", "kennen"];
let baseUrl = "https://www.op.gg/champion/";
let backUrl = "/statistics/top/comment";;

function crawlData(champion) {
    const getHtml = async () => {
        try {
            return await axios.get(baseUrl + champion + backUrl);
        } catch(err) {
            console.log(err);
        }
    }
    
    getHtml().then(html => {
        let data = [];
        const $ = cheerio.load(html.data);
        const $comments = $("div.tabItem.ChampionCommentTab-Popular ul div.comment-box__content");
    
        $comments.each(function(i, elem) {
            data[i] = {
                champion: champion,
                content: $(this).find("p.comment-box__txt").text(),
            }
            console.log(data[i]);
        })
    })
}

champions.forEach((element) => {
    crawlData(element);
})