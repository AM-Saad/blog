/*jslint browser: true*/




(function () {
    const blog = {
        allArticles: [],
        targetInput: '',
        questionType: 'choose',
        atricleContent: '',
        imgrone: '',
        imgrtwo: '',
        imgrthree: '',
        imgrfour: '',

        init: function () {
            blog.readyStatus()
        },
        cashDom: function () {
            this.$articleForm = $('#New-article-form')
            // this.$addArticleBtn = $('#add-article')
            this.$closeArticleForm = $('#close-article-form')
            // this.$textEditable = $('.textEditable')
            // this.$articleInputs = $('.articleInputs')
            // this.$textFormater = $('#textFormater')
            this.$addInput = $('#addInput')
            this.$discussionBox = $('.blog-article')
            // this.$subMenuBtn = $('.lessons-sub-menu-btn')

        },
        bindEvents: function () {
            // this.$addArticleBtn.on('click', this.openForm.bind(this))
            // this.$closeArticleForm.on('click', this.closeForm.bind(this))
            $('.ql-image').on('click', this.convertToBlob.bind(this))
            this.$addInput.on('click', this.submitArticle.bind(this))
            // this.$subMenuBtn.on('click', this.openSubMenu.bind(this))
            // this.$expandQ.on('click', this.getQuestionAnswers.bind(this))
            // this.$discussionBox.on('click', this.getDiscussionBox.bind(this))
        },

        getArticles: async function () {
            try {
                let r = await fetch(`/blog/getAllArticles`);
                if (r.status === 200) {
                    const res = await r.json()
                    this.allArticles = res.articles
                    this.renderArticles(this.allArticles)
                    return true

                } else {
                    return false
                }

            } catch (err) {
                blog.showMessage('Something went wrong please try again', 'error')
            }
        },
        renderArticles(articles) {
            articles.forEach(article => {
                $('#allArticles').append(`
                    <article>
                    <h1>${article.articleTitle}</h1>
                    <a href="/blog/getArticle/${article._id}">Read More</a>
                    </article>
                `)
            })
        },
        renderArticleForm: (lesson) => {
            $('.card').animate({ opacity: 1 }, 700)
        },
        readyStatus: (lesson) => {
            $('#holders').css({ display: 'none' }).remove()
            blog.getArticles()
            blog.cashDom()
            blog.bindEvents()

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
        convertToBlob: function () {
            console.log('ab2a');

            $('.ql-editor img').toBlob(function (blob) {
                var createdurl = URL.createObjectURL(blob);
                console.log(createdurl);

                // const newImg = document.createElement('img')
                // newImg.style.maxWidth = '100%'
                // newImg.onload = function () {
                //     // no longer need to read the blob so it's revoked
                //     URL.revokeObjectURL(createdurl);
                // };
                // newImg.src = createdurl;
                // wrapperDiv.parentNode.append(newImg)

            })
            // const blobed = this.blobToFile(theBlob, fileName, )

        },
        blobToFile: function (theBlob, fileName) {

            //A Blob() is almost a File() - it's just missing the two properties below which we will add
            theBlob.lastModifiedDate = new Date();
            theBlob.name = fileName;
            // this.allFiles.push({theBlob, questionId })
            const formData = new FormData();
            if (theBlob) {
                formData.append("image", theBlob);
                // $.ajax({
                //     url: `http://localhost:3000/submitAnswer/${lessonId}?questionId=${questionId}`,
                //     type: 'POST',
                //     data: formData,
                //     contentType: false,
                //     processData: false,
                //     success: function (data) {
                //         console.log(data);
                //         // window.location.replace(`http://localhost:3000/home`);
                //     },
                //     error: function (err) {
                //         console.log(err);
                //     }
                // });
            } else {
                alert('You have To Answer Before Sumbitting')
            }


        },

        submitArticle: function (e) {
            $('#addInput').off('click')

            const inputsVal = $('.ql-editor').html();

            // $.ajax({
            //     url: "http://localhost:8081/blog/createNewAritcle",
            //     type: "POST",
            //     data: JSON.stringify({ article: inputsVal }),
            //     dataType: "json",
            //     contentType: "application/json",
            //     success: function (data) {
            //         console.log(data);
            //         window.onbeforeunload = null;

            //     },
            //     error: function (err) {
            //         console.log(err);

            //     }
            // });

        },
        getDiscussionBox: function (e) {

            const questionId = $(e.target).parents('li').find('input[name="questionId"]').val()
            const question = this.allQuestions.find(q => { return q._id.toString() === questionId.toString() })
            const answersBox = $(e.target).parents('li').find('.answerBox')
            console.log(e);

            if (!answersBox.has('.answer').length > 0) {
                this.$expandQ.removeClass('fa-sort-down')
                this.$expandQ.addClass('fa-sort-up')
                this.openAnswers(question, answersBox)
            } else {
                console.log(answersBox.has('.answer').length)
                answersBox.html('')
                this.$expandQ.removeClass('fa-sort-up')
                this.$expandQ.addClass('fa-sort-down')
            }
        },

        openDiscussion: function (question, answersBox) {
            answersBox.append(`
            <img src="/${question.questionImg}">
            `)
            question.answers.forEach(a => {

                if (a.answer !== 'null') {
                    if (a.answerNo !== -1) {

                        answersBox.append(`
                        <p class="answer">${a.answer}</p >
                            `)
                    } else {

                        answersBox.append(`
                        <p class="answer"></p>
                            `)
                    }
                }
            })
        },

        openSubMenu: function (event) {
            $('.lessons-list_item-sub-list').fadeOut(300)
            $(event.target).parent().find('.lessons-list_item-sub-list').fadeIn(300)
            $("body").on('click', '.lessons-list_item-sub-list', function () {
                $(this).fadeOut();
            });

            $(".lessons-list_item-sub-list li").click(function (e) {
                e.stopPropagation();
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
    blog.init()
})()
