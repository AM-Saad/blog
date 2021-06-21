function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
        <div class="content-item_body">
            <p>${c.title}</p>
            <p>${c.active ? "Active" : 'Inactive'}</p>
            <input type="hidden" name="itemId" value="${c._id}">
        </div>
    </div>
  `)
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="itemId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                        <a class="btn bg-w single-item_actions edit-item">Edit</a>
                        <a class="btn btn-danger single-item_actions delete-item">Delete </a>
                    </div>
                    <div class="single-item-core">
                     
                        <div class="info single-item_name"> <h3> Title : ${c.title}</h3> </div>
                        <div class="info"><p>Status: ${c.active ? "Active" : 'Inactive'}</p></div>
                
                        </div>
                        <div class="images-perview p-relative item-images bg-lightgray"> 
                        <div class="p-relative">
                            <img src="/${c.image}">
                        </div>
                    </div>
                    </div>

                </div>
            </div>
    `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


