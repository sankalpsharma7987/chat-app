const socket=io()

const messageForm=document.querySelector('#message-form');
const messageFormInput=messageForm.querySelector('input')
const messageFormButton=messageForm.querySelector('button')
const messages=document.querySelector('#messages')
const locationButton=document.querySelector('#send-location')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sideBarTemplate=document.querySelector('#side-bar-template').innerHTML

//Options
    //location.search is the global variable to retrieve the values in the query string
    //Qs.parse is the function from the qs.min.js file present under the script tag in chat.html
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})//ignoreQueryPrefix to ignore the question mark returned in the username

const autoscroll=()=>{
    //New Message Element
    const newMessage=messages.lastElementChild

    //Height of the new message
    const newMessageStyles=getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=newMessage.offsetHeight+newMessageMargin

   //Visible height
   const visibleHeight=messages.offsetHeight

   //Height of messages container
   const containerHeight=messages.scrollHeight

   //How far have I scrolled
   const scrollOffset=messages.scrollTop+visibleHeight

   if(containerHeight-newMessageHeight<=scrollOffset)
   {
       messages.scrollTop=messages.scrollHeight

   }


}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
   
})

socket.on('locationMessage',(message)=>{

    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')

    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})


socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sideBarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML=html
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

messageFormButton.setAttribute('disabled','disabled')
    //e.target will refer to the messageForm
    
    socket.emit('sendMessage',e.target.elements.message.value,(error)=>{

messageFormButton.removeAttribute('disabled')
messageFormInput.value=''
messageFormInput.focus()

     if(error==='Invalid user details')   
     {
         alert(error)
         location.href='/'
     }
else if(error==='Profanity is not allowed')
        {
            
         alert(error)
        
        }
        
    })
    //Code to send location of the client

})



locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

   locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            locationButton.removeAttribute('disabled')
  
        })
    })
})





socket.emit('join',{username,room},(error)=>{
if(error){
    alert(error)
    location.href="/"
}
})