/*jslint browser: true*/





(function () {
    const addArticle = {
        allArticles: [],
        targetInput: '',
        atricleContent: '',
        tags: [],

        init: function () {
            addArticle.readyStatus()
        },
        cashDom: function () {
            this.$articleForm = $('#New-article-form')
            this.$closeArticleForm = $('#close-article-form')
            this.$addInput = $('#addInput')
            this.$discussionBox = $('.blog-article')

        },
        bindEvents: function () {
            this.$addInput.on('click', this.submitArticle.bind(this))


        },

        renderArticleForm: (lesson) => {
            $('.card').animate({ opacity: 1 }, 700)
        },
        readyStatus: (lesson) => {
            addArticle.cashDom()
            addArticle.bindEvents()

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
        openTextFormater: function (e) {
            this.targetInput = $(e.target).data('id')
            $('.questionsInputs').removeClass('inputActive')
            $(e.target).addClass('inputActive')
            this.openEdiableBox()
        },

    
        submitArticle: function (e) {
            $('#addInput').off('click')

         

            $.ajax({
                url: "/blog/createNewAritcle",
                type: "POST",
                data: JSON.stringify({ articleTitle: articleTitle, article: inputsVal }),
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    console.log(data);
                    window.onbeforeunload = null;

                },
                error: function (err) {
                    console.log(err);

                }
            });

        },




        deleteArticle: function (btn) {
            const questionId = btn.parentNode.querySelector("[name=questionId]").value;
            const lessonId = btn.parentNode.querySelector("[name=lessonId]").value;
            fetch(url + `/teacher/deleteQuestion/${lessonId}?questionId = ${questionId}`, {
            }).then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Delete Question failed...");
                } else {
                    btn.parentNode.parentNode.remove();
                    $("#messages").append(
                        `
                    < div class= "alert alert-info" >
                    Question Deleted
                    </div >
                    `
                    );
                    return res.json();
                }
            }).then(resData => {
                console.log(`resData is ${resData} `);
            }).catch(err => {
                console.log(err);
            });
        },

        showMessage: function (message, messageType) {
            blog.$articleForm.prepend(`
        <div id="messages" >
            <div class="alert alert-${messageType}">
                ${message}
            </div>
          </div>
        `)
            setTimeout(() => {

                $('#messages').animate({ opacity: 0 }, 1000, function () {
                    $(this).remove()
                })
            }, 3000);
        },
    }
    addArticle.init()
})()
