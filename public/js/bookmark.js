

async function getBookmark() {
    let bookmark = getbookmarkId()
    $('.offcanvas_aside.offcanvas_aside_right').addClass('active')

    const csrf = $("[name=_csrf]").val();
    const data = await fetchdata(csrf, `/api/bookmarks?bookmark=${bookmark}`, 'get', {}, false)
    let items = data.json.bookmark.items

    items.forEach(element => {
        $(`[data-id=${element.id}] path`).css({ fill: '#ff0' })
    });
    if (data) {
        setBookmarkId(data.json.bookmark.sessionId)
    }



}


async function updateBookmark(e) {

    let cart = getbookmarkId()


    const csrf = $("[name=_csrf]").val();

    const itemId = $(e.target).parents('article').find("[name=articleId]").val()

    $(e.currentTarget).find('.lds-hourglass').removeClass('none')
    $(e.currentTarget).find('span').addClass('none')
    const data = await fetchdata(csrf, `/api/bookmarks/${itemId}?bookmark=${cart}`, 'post', JSON.stringify(), true)

    if (data) {
        setBookmarkId(data.json.bookmark.sessionId)

        if (data.json.added) {
            $(`[data-id=${itemId}] path`).css({ fill: '#ff0' })
        } else {
            $(`[data-id=${itemId}] path`).css({ fill: 'transparent' })
            $(`[data-id=${itemId}].bookmark-item`).remove()
        }


        localStorage.setItem('c_s', data.json.bookmark.sessionId)
        addBookmarkSessionToCartBtn()


    }
    $(e.currentTarget).find('.lds-hourglass').addClass('none')
    $(e.currentTarget).find('span').removeClass('none')

}




function getbookmarkId() {
    let bId = localStorage.getItem('c_s')
    if (!bId) {
        bId = sessionStorage.getItem('c_s')
        if (!bId) {
            bId = getCookie('c_s')
        }
    }
    return bId
}
function setBookmarkId(bId) {
    sessionStorage.setItem('c_s', bId);
    localStorage.setItem('c_s', bId);
    setCookie('c_s', bId, 365)
}



function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}



function addBookmarkSessionToCartBtn() {
    let cs = getbookmarkId()
    $('.go-to-bookmark').attr('href', `/bookmarks?bookmark=${cs}`)
}
addBookmarkSessionToCartBtn()


$('body').on('click', '.add-bookmark', updateBookmark)
