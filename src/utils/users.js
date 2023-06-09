const users = []

const addUser = ({id,username,room}) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //if empty value
    if(!username || !room){
        return {
            error: "Username and Room are required!"
        }
    }

    //whether user already exists 
    const existingUser = users.find((user)=>{
        return user.room===room && user.username===username
    })

    if(existingUser){
        return {
            error : "Username is in use!"
        }
    }

    //storing user
    const user = {id,username,room}
    users.push(user)

    return {user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id===id
    })

    if(index>=0){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    const user = users.find((user)=>{        
        return user.id===id
    })
    return user
}

const getUsersInRoom = (room) =>{
    return users.filter((user)=>{
        return user.room===room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}