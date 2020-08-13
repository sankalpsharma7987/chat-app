const users=[]

const addUser=({id,username,room})=>{
    //Clean the data

    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //Validate the data
    if(!username||!room ){
        return {
            error:'Username and room are required!'
        }
    }


    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room &&user.username===username
    })

    //Validate username
    if(existingUser)
    {
        return{
            error:'Username is in use'
        }
    }

    //Store User
    const user={id,username,room}
    
    users.push(user)

     return {user};

}

const removeUser=(id)=>{

    const index=users.findIndex((user)=>user.id===id)

    if(index!==-1)
    {
        //Users.splice will return the array of objects that are removed. Since we will remove only one element, we are using the 0 to pull the only element in the array
return users.splice(index,1)[0]

    }
    
}

const getUser=(id)=>{
    return users.find((user)=>user.id===id)

}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
return users.filter((user)=>user.room===room)
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}