module.exports.createBookmark = (Bookmark, user) => {
    let sessionId = makeSessinId('24')

    const newBookmark = new Bookmark({ items: [], sessionId: sessionId, promo: {} })
    return newBookmark
};




module.exports.updateBookmark = (items, article, body, res) => {
    let added = true
    console.log(items);
    let updateditems = items
    const index = items.find(cp => cp.id.toString() === article._id.toString());
    if (index) {
        updateditems = items.filter(i => i.id.toString() != article._id.toString())
        added = false
    } else {
        updateditems.push({
            id: article._id,
            title: article.title,
            category: article.category.name,
            image: article.image,
            date: article.date,
            time: article.time,
        });
        added = true
    }
    return { items: updateditems, added: added }

}
function makeSessinId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



