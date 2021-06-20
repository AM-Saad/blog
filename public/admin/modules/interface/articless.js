/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allItems: [],
        subCategories: [],
        itemImg: null,
        opened: null,
        editing: false,
        tags: [],
        init: async function () {
            this.editor()
            this.cashDom()
            this.bindEvents()
            this.getItems()
            this.category()

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateItembox = $('.toggle-new-item')
            this.$articleImg = $('#articleImg')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglefilters.on('click', this.togglefilters.bind(this))

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            this.$searchname.on('keyup', this.searchCustomerName.bind(this))
            this.$articleImg.on('change', this.getArticleImg.bind(this))


            $('body').on('click', '.content-item', this.openItem.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))

            $('.save-item').on('click', this.saveItem.bind(this))
            $('body').on('click', '.delete-item', this.deleteItem.bind(this))
            $('body').on('click', '.edit-item', this.editItem.bind(this))


            $('.add-tag').on('click', this.addTag.bind(this))
            $('body').on('click', '.delete-tag', this.deleteTag.bind(this))

        },
        togglefilters: function (e) { $('.section-filters').toggleClass('block') },


        toggleCreateInventory: function () {
            $('.create-inventory').toggleClass('none')
        },
        openmenu: function (e) {
            e.stopPropagation()
            e.preventDefault()
            console.log('a');
            $('.wrapper').off('click')
            $('.sub-menu').not($(e.target).parent().find('.sub-menu')).removeClass('activeMenu')
            $(e.target).parent().find('.sub-menu').toggleClass('activeMenu')
            $('.wrapper').on('click', function () {
                $('.sub-menu').removeClass('activeMenu')
            })
        },
        editor: function () {
            var toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'image': 'video' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

            ];
            var quill = new Quill('.editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });
        },
        getItems: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/articles', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderItems(data.json.articles)
                return this.allItems = data.json.articles
            }
        },
        category: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/category', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                data.json.categories.forEach(c => {
                    $('#category').append(` <option value="${c.name}">${c.name}</option>`)
                })
                // this.renderItems(data.json.articles)
            }
        },
        searchCustomerName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = config.allItems.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || config.checkName(xSub, str)
            })
            console.log(filteredArr);

            config.renderItems(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getItemObeject: function (e) {
            const itemId = findItemId('itemId', e)
            console.log(itemId);
            const zone = config.filterSingleItem(itemId)
            return zone
        },

        filterSingleItem: function (itemId) {
            const zone = this.allItems.find(c => { return c._id.toString() === itemId.toString() })
            return zone
        },
        openItem: function (e) {
            const item = this.getItemObeject(e)
            this.opened = item._id
            return createSingleItem(item)

        },
        closeCustomer: (e) => {
            $('.single-item').remove()
        },
        togglecreateItembox: function (e) {
            $('.new-item-box').toggleClass('slide')
            if ($('.new-item-box').hasClass('slide')) $('#name').focus()
            this.resetData()
        },

        addTag: function (e) {

            const tag = $('#tag').val().toLowerCase()

            if (tag) {
                const exist = this.tags.find(s => s == tag)
                if (!exist) {
                    this.tags.push(tag)
                    $('.tags').append(`<button data-sub="${tag}">
                <i class="fas fa-times delete-tag"></i>
                ${tag}
                </button>`)
                }
            }
            $('#tag').val('')
        },
        deleteTag: function (e) {

            const sub = $(e.target).parent('button').data('sub').toLowerCase()

            this.tags = this.tags.filter(s => s != sub)
            $(e.target).parent('button').remove()
            console.log(this.tags);

        },
        createItemForm: function () {
            let content = $('.ql-editor').html()
            let title = $('#title').val()
            let location = $('#location').val()
            let site_description = $('#site_description').val()
            let category = $('#category').val()
            const active = document.getElementById('active').checked

            console.log(title);
            console.log(content);
            if (!title.replace(/\s/g, '').length || !content.replace(/\s/g, '').length || !site_description.replace(/\s/g, '').length) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            }
            const newForm = new FormData();
            // newForm.append("delta", JSON.stringify(this.content));
            newForm.append("content", content);
            newForm.append("active", active);
            newForm.append("tags", JSON.stringify(this.tags));
            newForm.append("title", title);
            newForm.append("location", location);
            newForm.append("category", category);
            newForm.append("site_description", site_description);
            newForm.append("image", this.itemImg);
            return newForm
        },
        getArticleImg: function (e) {
            var files = e.target.files[0]; //FileList object
            const fileValid = this.validateImage(files)
            console.log(fileValid);
            if (fileValid) {
                this.itemImg = files
            }

        },
        validateImage: function (files) {
            var validImageTypes = ["image/jpg", "image/jpeg", "image/png"];
            var file = files;
            var fileType = file["type"];
            if ($.inArray(fileType, validImageTypes) < 0) {
                showmessage('الامتدادت المقبوله هي jpeg, png or jpg', 'warning', 'body')
                return false
            }
            return true
        },
        saveItem: async function (e) {
            e.preventDefault()
            const newform = this.createItemForm()
            if (newform != false) {
                $('.new-item-box').addClass('loader-effect')
                if (this.editing) {
                    data = await fetchdata(this.jwt, `/admin/api/articles/${this.opened}`, 'put', newform, false)
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/articles', 'post', newform, false)
                }
                console.log(data);
                console.log('there..');

                $('.new-item-box').removeClass('loader-effect')
                if (data) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        console.log('editing');
                        this.updateItem(data.json.article)
                        createSingleItem(data.json.article)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                    } else {
                        console.log('New');
                        this.allItems.push(data.json.article)
                    }
                    this.togglecreateItembox()

                    this.updateItemElm(data.json.article)
                    this.resetData()

                }

            }

        },
        updateItem: async function (updatedObj) {
            const oldIndex = config.allItems.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allItems[oldIndex] = updatedObj
            return oldIndex
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.itemImg = item.image
            this.editing = true

            $('#title').val(item.title);
            $('.ql-editor').html(item.content)

            document.getElementById('active').checked = item.active
            $('#site_description').val(item.site_description)
            $('#location').val(item.location)
            $('#category').val(item.category.name).trigger('change')

            this.tags.forEach(sub => $('.tags').append(`<button data-sub="${sub}"> <i class="fas fa-times delete-sub"></i>${sub} </button>`))

            $('.new-item-box').addClass('slide')

        },
        deleteItem: async function (e) {
            e.stopPropagation()

            if (confirm("Do you want to delete this Item?")) {

                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                s
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/articels/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()
                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Deleted!', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {

                e.preventDefault()
            }

        },
        resetData: function (e) {
            document.getElementById('active').checked = true
            $('#title').val('');
            $('.ql-editor').html('<p><br></p>')
            $('.tags').empty();
            $('#site_description').val('')
            $('#location').val('')
            config.tags = []
            config.itemImg = null
            config.editing = false
        },


        renderItems: function (customers) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (customers.length === 0) return $("main .content").prepend(emptycontent())
            customers.forEach(s => createitemBox(s))
        },


        closeSingleItem: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteItem: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Item?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/articles/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },




    }
    config.init()
})()



