const socket = io()

//elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll =() =>{
    //new msg element
    const $newMessage = $messages.lastElementChild

    //Height of the new msg
    const newMessageStyles = getComputedStyle($newMessage)    
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin 

    //visible Margin
    const visibleHeight = $messages.offsetHeight

    //messages container height
    const containerHeight = $messages.scrollHeight

    //how far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//messages
socket.on("message",(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username: msg.username,
        chatMessage: msg.text,
        createdAt: moment(msg.createdAt).format("h:mm a")
    })   

    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
})


//location message
socket.on("locationMessage",(location)=>{

    const locationURL = Mustache.render(locationMessageTemplate,{
        username:location.username,
        url:location.text,
        createdAt:moment(location.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",locationURL)
    autoScroll()
})

//roomData
socket.on("roomData",({room,users})=>{
    const userList = Mustache.render(sidebarTemplate,{
        room,users
    })

    document.querySelector("#sidebar").innerHTML = userList
})

//chat
$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    
    //disable send msg button
    $messageFormButton.setAttribute("disabled","disabled")    

    const message = e.target.elements.message.value
    socket.emit("sendMessage",message,(err)=>{

        //enable send msg button
        $messageFormButton.removeAttribute("disabled")
        //clear input field
        $messageFormInput.value=""
        $messageFormInput.focus()

        if(err) return console.log(err)
        console.log("msg delivered!")
    })
})

//location
$sendLocationButton.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("Geolocation isnt supported by your browser")
    }

    //disable sendLocation btn
    $sendLocationButton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(confirmation)=>{
            //enable sendLocation btn
            $sendLocationButton.removeAttribute("disabled")

            console.log(confirmation)
        })
    })
})

//roomInfo
socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})