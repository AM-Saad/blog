let arabic = /[\u0600-\u06FF]/;
let content = document.getElementById('content').innerText
let res = arabic.test(content)
document.getElementById('content').innerHTML = content
if (res) {
    document.querySelector('.wrapper').style.direction = 'rtl'
}