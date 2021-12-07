
function getDataFromIndexedDb() {
    readAllData('bookmarks').then(data => {
        console.log(data);
    })
}

function renderItems(items) {
    items.forEach(article => {
        $('#articles').append(`
            <article class="bookmark-item"
            data-src="/${article.image}" style="background-image:url('/${article.image}')" data-id="${article._id}">
            <input type="hidden" name="articleId" value="${article.id}">
            <span class="add-bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000" viewBox="0 0 16 16" width="64px"
                    height="64px">
                    <path fill="none" stroke="#000" stroke-miterlimit="10"
                        d="M11.5,2.5h-7c-0.552,0-1,0.448-1,1v10L8,10.2l4.5,3.3v-10C12.5,2.948,12.052,2.5,11.5,2.5z" />
                </svg>
            </span>
            <a href="/article/${article.title}">
                <div class="article-body">
                    <div class="blurrer"></div>
                    <h3> ${article.title} </h3>
    
                </div>
            </a>
        </article>
            `)

        $(`[data-id=${article._id}] path`).css({ fill: '#ff0' })

    });

}


async function react(e) {

    let bookmarkId = getbookmarkId()


    const csrf = $("[name=_csrf]").val();

    const itemId = $("#articleId").val()
    const react = $(e.currentTarget).data('react')
    console.log(react)
    $(e.currentTarget).find('.lds-hourglass').removeClass('none')
    // $(e.target).parents('article').addClass('loader')
    $(e.currentTarget).addClass("active");

    setTimeout(() => {
        $("li.active").removeClass("active");
    }, 1000);
    const data = await fetchdata(csrf, `/api/react/${itemId}?bookmark=${bookmarkId}&&react=${react}`, 'put', JSON.stringify(), true)
    $(e.target).parents('article').removeClass('loader')
    console.log(data)
    if (data) {
        $(`.react`).each(function () {
            const reaction = $(this).data('react')
            const counter = data.json.reactions[reaction].counter
            $(this).find('span').text(counter)
        })
        // if (data.json.added) {
        //     $(`[data-id=${itemId}] path`).css({ fill: '#ff0' })
        // } else {
        //     $(`[data-id=${itemId}] path`).css({ fill: 'transparent' })
        //     $(`[data-id=${itemId}].bookmark-item`).remove()
        // }
        // if (inBookmarkpage) {
        //     $(e.target).parents('article').remove()
        //     if ($('article').length == 0) {
        //         $('#articles').append(`
        //         <div class="no-result">
        //                     <img src="/images/empty_bookmark.svg" alt="">
        //                     <h2>Oops!</h2>
        //                     <h3>You've not add a bookmark until now!! <br> Goo ahead and add you will need it later</h3>
        //                 </div>  
        //       `)
        //     }
        // }




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
    // $('.go-to-bookmark').attr('href', `/bookmarks/${cs}`)
}
addBookmarkSessionToCartBtn()


$('.react').on('click', react)

