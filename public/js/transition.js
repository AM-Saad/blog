

window.addEventListener("load", function () {
    window.pop_old = document.location.pathname;
    window.pop_new = '';
    const fileVersion = 1



    window.onpopstate = function (event) {
        window.pop_new = document.location.pathname;

        if (pop_new != pop_old) {
            startTransition(null, window.pop_new, window.pop_old, event)
        }
        window.pop_old = pop_new; //save for the next interaction

    };

    window.addEventListener("click", function (e) {
        e.preventDefault()
        start(e)
    });


    function start(e) {
        const link = e.currentTarget.document.activeElement
        const check = isLink(link)
        if (check) {
            const newPath = getHref(link)
            if (newPath) {
                const currentPath = window.location.pathname
                if (check) startTransition(link, newPath, currentPath, e)
            }
        }
    }


    function isLink(element) {
        if (element.tagName === 'a' || element.tagName === 'A') return true
        else return false
    }


    function getHref(e) { return e.getAttribute('href') }


    async function getNextPage(url) {
        try {
            const res = await fetch(url, { method: 'get' })

            if (res.status == 200) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("text/html") === -1) {
                    return false
                }
                return await res.text()

            } else {
                showmessage(json.message, json.messageType, 'body')
                return null
            }
        } catch (error) {
            showmessage(error, 'warning', 'body')
        }
    }

    async function startTransition(link, newPath, currentPath, e) {

        startAnimation(document)

        const text = await getNextPage(newPath)
        if (text != false) {
            const nextPageDocument = strToHtml(text)
            const done = replaceHead(document, nextPageDocument)
            if (done) {
                const res = checkMainElements(nextPageDocument)
                if (res) {

                    replacePages(document, nextPageDocument, newPath, currentPath)

                    return endAnimation(document, nextPageDocument)
                } else {
                    // window.pop_new = newPath;
                    window.location = newPath
                    return window.location.pathname = newPath
                }
            }

        } else {
            window.location = newPath
            // window.pop_new = newPath;


            return window.location.pathname = newPath
        }

    }



    function strToHtml(text) {
        var doc = new DOMParser().parseFromString(text, "text/html");
        return doc
    }

    function checkMainElements(nextPageHtml) {
        const currentPage = document.getElementById('main')
        const nextPage = nextPageHtml.querySelector('#main')
        if (!currentPage || !nextPage) return false
        return true
    }

    function replaceHead(currentPage, nextPage) {
        var oldStyles = currentPage.querySelectorAll("link[data-ams-reload='true']")
        for (let i = 0; i < oldStyles.length; i++) {
            oldStyles[i].remove()
        }
        var newStyles = nextPage.querySelectorAll("link[data-ams-reload='true']")
        for (let i = 0; i < newStyles.length; i++) {
            newStyles[i].remove()
            currentPage.querySelector('head').appendChild(newStyles[i])
        }
        let newTitle = nextPage.querySelector('title').innerText
        currentPage.querySelector('title').innerText = newTitle
        return true
    }


    function replacePages(currentPage, nextPage, newPath, currentPath) {

        let newContent = nextPage.querySelector('#main')
        window.history.pushState("", "", newPath);

        currentPage.querySelector('#main').innerHTML = newContent.innerHTML
        const scripts = remove_js();
        // setTimeout(() => {
        reload_js(nextPage, scripts)
        // }, 100);


    }

    function remove_js() {

        var scripts = document.querySelectorAll("script[data-ams-reload='true']")
        let urls = []
        for (let i = 0; i < scripts.length; i++) {
            scripts[i].remove()
            let src = scripts[i].getAttribute('src')
            urls.push(src)
        }
        return urls
    }

    function reload_js(nextPage, oldScripts) {
        var body = document.querySelector('body')
        const scripts = nextPage.querySelectorAll("script[data-ams-reload='true']")
        for (let i = 0; i < scripts.length; i++) {
            var newscript = document.createElement('script');
            newscript.src = scripts[i].getAttribute('src');
            newscript.setAttribute('data-ams-reload', 'true')
            body.appendChild(newscript);

        }

    }

    function startAnimation(current) {
        const main = current.querySelector('#main')
        if (main) {
            const animation = current.querySelector('#main').dataset.outanimation
            current.querySelector('#main').style.opacity = 0
            setTimeout(() => {
                scrollTopFunction()
            }, 500);

            if (animation === 'slide-left' || animation === 'slide-right') {
                current.querySelector('#main').style.transform = animation == 'slide-left' ? 'translateX(120%)' : 'translateX(-120%)'
            }
        }


    }

    function endAnimation(current, newpage) {
        const currentOutAnimation = current.querySelector('#main').dataset.outanimation

        const inanimation = newpage.querySelector('#main').dataset.inanimation
        const outanimation = newpage.querySelector('#main').dataset.outanimation




        // re-add new animation
        current.querySelector('#main').dataset.inanimation = inanimation
        current.querySelector('#main').dataset.outanimation = outanimation

        setTimeout(() => {

            if (currentOutAnimation === 'fade' && inanimation === 'fade') {
                current.querySelector('#main').style.opacity = 1;
            }

            if (currentOutAnimation === 'fade' && inanimation === 'slide-left' || inanimation === 'slide-right') {
                current.querySelector('#main').style.transform = inanimation == 'slide-left' ? 'translateX(-120%)' : 'translateX(120%)'
                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                    current.querySelector('#main').style.transform = 'unset'
                }, 800);
            }


            if (currentOutAnimation === 'slide-right' || currentOutAnimation === 'slide-left' && inanimation === 'opacity') {
                current.querySelector('#main').style.transform = 'unset'
                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                }, 800);
            }

            if (currentOutAnimation === 'slide-right' || currentOutAnimation === 'slide-left' && inanimation === 'slide-left' || inanimation === 'slide-right') {
                current.querySelector('#main').style.transform = inanimation == 'slide-left' ? 'translateX(120%)' : 'translateX(-120%)'

                setTimeout(() => {
                    current.querySelector('#main').style.opacity = 1;
                    current.querySelector('#main').style.transform = 'unset'
                }, 800);
            }
        }, 500);






    }



    function scrollTopFunction() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }


    if (fileVersion == 1) {
        // var ks = ["postMessage", "blur", "focus", "close", "frames", "self", "window", "parent", "opener", "top", "length", "closed", "location", "document", "origin", "name", "history", "locationbar", "menubar", "personalbar", "scrollbars", "statusbar", "toolbar", "status", "frameElement", "navigator", "customElements", "external", "screen", "innerWidth", "innerHeight", "scrollX", "pageXOffset", "scrollY", "pageYOffset", "screenX", "screenY", "outerWidth", "outerHeight", "devicePixelRatio", "clientInformation", "screenLeft", "screenTop", "defaultStatus", "defaultstatus", "styleMedia", "onanimationend", "onanimationiteration", "onanimationstart", "onsearch", "ontransitionend", "onwebkitanimationend", "onwebkitanimationiteration", "onwebkitanimationstart", "onwebkittransitionend", "isSecureContext", "onabort", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting", "onwheel", "onauxclick", "ongotpointercapture", "onlostpointercapture", "onpointerdown", "onpointermove", "onpointerup", "onpointercancel", "onpointerover", "onpointerout", "onpointerenter", "onpointerleave", "onafterprint", "onbeforeprint", "onbeforeunload", "onhashchange", "onlanguagechange", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onstorage", "onunhandledrejection", "onunload", "performance", "stop", "open", "alert", "confirm", "prompt", "print", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "captureEvents", "releaseEvents", "getComputedStyle", "matchMedia", "moveTo", "moveBy", "resizeTo", "resizeBy", "getSelection", "find", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "fetch", "btoa", "atob", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "createImageBitmap", "scroll", "scrollTo", "scrollBy", "onappinstalled", "onbeforeinstallprompt", "crypto", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "indexedDB", "webkitStorageInfo", "sessionStorage", "localStorage", "chrome", "visualViewport", "speechSynthesis", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "addEventListener", "removeEventListener", "openDatabase", "dispatchEvent"]
        console.log(this.formEl)
        console.log(window.formEl)
        var variables = ""
        for (var name in window)
            variables += name + "\n";
    }
    console.log(variables);

});

