window.addEventListener('devicemotion', (event) =>{
    $('body')[0].append(event.acceleration.x)
    $('body')[0].append(event.acceleration.y)
})

if("idleDetector" in window) {
    console.log('YES it is in window');
    async function runIdleDetection() {
         const state = await idleDetector.requestPermission() 
         console.log(state)
         const idleDetector = new IdleDetector()

         idleDetector.addEventListener('change', ()=>{
                const { userState, screenState } = idleDetector
               
                if(userState === 'idle'){
                     //Do whenever you want
                     alert('You are idle now')
                 }
    
          })
       await idleDetector.start({
           threshold:120000
       })
     } 
     runIdleDetection()
}

