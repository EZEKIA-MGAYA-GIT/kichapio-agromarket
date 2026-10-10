let rose= new Audio('Rose Muhando – Papa Lai ft. Neema Koyiaki.mp3')

let button=document.getElementById('ezz')
let buttn=document.getElementById('eli')

button.addEventListener('click',function(){
  // if(Audio )
  if(rose.paused){
    rose.play()
  }else{
    rose.pause();}
})
//buttn.addEventListener('click',function(){
  //  rose.pause();
//})