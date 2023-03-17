exports.search = async (req, res) => {
    const q = req.body.query 
    const type = req.body.type
    switch (type) {
        case "anime":
            searchAnime(q, res)
        case "manga":
            searchManga(q, res)
        case "ranobe":
            searchRanobe(q,res)
        break
    } 
}
function searchAnime(q, res) {

}

function searchRanobe(q, res) {

}

function searchManga(q, res) {

}