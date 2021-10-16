
var lazyBackgrounds = [].slice.call(document.querySelectorAll(".lazy-background"));
if ("IntersectionObserver" in window) {
  let lazyBackgroundObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove("hidden");
        loadImage(entry)
        lazyBackgroundObserver.unobserve(entry.target);
      }
    });
  });

  lazyBackgrounds.forEach(function (lazyBackground) {
    lazyBackgroundObserver.observe(lazyBackground);
  });

  function loadImage(entry) {
    let elm = $(entry.target)[0]

    $(elm).css({ backgroundImage: `url(${$(elm).data('src')})` })
  }
}


function changeMode() {
  const mode = localStorage.getItem('mode') || "light"
  $('body').attr('data-mode', mode)
}


$('.change-mode').on('click', function (e) {
  const src = $(this).data('mood')
  localStorage.setItem('mode', src)
  $('.change-mode').css({

    //for firefox
    "-moz-animation-name": "rotatebox",
    "-moz-animation-duration": "0.8s",
    "-moz-animation-iteration-count": "1",
    "-moz-animation-fill-mode": "forwards",

    //for safari & chrome
    "-webkit-animation-name": "rotatebox",
    "-webkit-animation-duration": "0.8s",
    "-webkit-animation-iteration-count": "1",
    "-webkit-animation-fill-mode": "forwards",

  });
  changeMode()
})




changeMode()
