import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import { ChatModel } from "../models/chat.model.js";
import { UserModel } from "../models/user.model.js";
import { emitEvent } from "../utils/features.js";
import { otherMembers } from './../lib/helper.js';


export const newGroup = async ( req , res , next) => {
    try {
        const { name , member } = req.body;

        if( member.length < 2 ) return next( new Error(`Group chat must have at least 2 members`,400));

        const allMembers = [...member, req.userData._id];

        await ChatModel.create(
            {
                name,
                groupChat:true,
                creator: req.userData,
                members:allMembers
            }
        )

        emitEvent(req,ALERT,allMembers,`Welcome to ${name} group`);
        emitEvent(req,REFETCH_CHATS,member);

        return res
        .status(201)
        .json(
            {
                success: true,
                message:"Group chat was created successfully"
            }
        )
        
    } catch (error) {
        console.log(error.message)
    }
}

export const myChat = async ( req , res , next) => {
    try {
        
        const chats = await ChatModel.find( { members : req.userData._id } )
        .populate(
            "members",
            "name avatar"
        )

        const transformedChats = chats.map( ({ _id , name , members , groupChat } ) => {

            const otherMember = otherMembers( members , req.userData._id ) 
            
            return {
                _id,
                avatar: groupChat? members.slice(0,3).map( ({ avatar }) => avatar.url ) : [otherMember.avatar.url] ,
                name : groupChat ? name : otherMember.name ,
                groupChat,
                members: members.reduce( ( prev , curr ) => {
                    if( curr._id.toString() !== req.userData._id.toString() ) prev.push( curr._id );
                    return prev;
                },[])
            }
            // members.filter( i => i._id.toString() !== req.userData._id.toString() ).map( i => i._id )
        } )

        return res
        .status(200)
        .json(
            {
                chats: transformedChats
            }
        )
        
    } catch (error) {
        console.log(error.message)
    }
}

export const myGroupChat = async (req, res ) => {
    try {

        const chats = await ChatModel.find( {
            members:req.userData._id,
            groupChat:true,
            creator: req.userData._id
        }).populate(
            "members",
            "name avatar"
        )

        console.log(chats)

        const groups = chats.map( ( { members , _id , groupChat , name } ) => ( {
            _id,
            groupChat,
            name,
            avatar: members.slice(0,3).map(({ avatar }) => avatar.url )
        } ));

        return res
        .status(200)
        .json( 
            {
                groups,
            }
        )
        
    } catch (error) {
        console.log(error)
    }
} 

export const addMembers = async (req, res) => {
    try {

        const { chatId, members } = req.body;

        if( members.length < 1 ) return res.status(404).json("Please select a member");

        const chat = await ChatModel.findById( chatId );

        if( !chat ) return res.json("Chat was not found");

        if( !chat.groupChat ) return res.json("This is not a group chat");

        if( chat.creator.toString() !== req.userData._id.toString() ) return res.json("You are not allowed to add members")

        const allNewMembersPromis = members.map( ( i ) => UserModel.findById ( i , "name" ));
        
        const allNewMembers = await Promise.all ( allNewMembersPromis );

        const uniqueMember = allNewMembers
        .filter( i => !chat.members.includes( i._id.toString()))
        .map(i => i._id);

        chat.members.push(...uniqueMember);

        if(chat.members.length > 12 ) return res.json("Group members limit reached");

        await chat.save();

        const allUsersName = allNewMembers.map((i) => i.name).join(",");

        emitEvent(
            req,
            ALERT,
            chat.members,
            ` ${allUsersName} has been added in the group`
        );                           

        emitEvent( 
            req,
            REFETCH_CHATS,
            chat.members
        )
        
        return res
        .status(200)
        .json(
            {
                message: "Members added successfully"
            }
        )

    } catch (error) {
        console.log(error)
    }
}

export const removeMember = async (req, res) => {
    try {

        const { chatId, userId } = req.body;

        
        const chat = await ChatModel.findById( chatId ) ;
        const userThatWillRemove = await UserModel.findById( userId , "name" );

        if(!chat ) return res.status(404).json("Chat was not found");

        if(!chat.groupChat ) return res.json("This is not a group chat");

        if( chat.creator.toString()!== req.userData._id.toString() ) return res.json("You are not allowed to remove members");

        if( chat.members.length <= 3 ) return res.status(400).json("Group must have at least 3 members");

        chat.members = chat.members.filter(
            member => member.toString() !== userId.toString()
        )

        await chat.save();

        emitEvent(
            req,
            ALERT,
            chat.members,
            ` ${userThatWillRemove.name} has been removed from the group`
        )

        emitEvent(  
            req,
            REFETCH_CHATS,
            chat.members
        )

        return res
       .status(200)
       .json(
        {
            message: "Member removed successfully"
        })

    } catch (error) {
        console.log(error)
    }
}

export const leaveGroup = async (req, res) => {
    try {

        const chatId = req.params.id;

        const chat = await ChatModel.findById( chatId );

        if(!chat ) return res.status(404).json("Chat was not found");

        if(!chat.groupChat ) return res.status(400).json("This is not a group chat");
        

        const remainingMembers = chat.members = chat.members.filter(
            member => member.toString() !== req.userData._id.toString()
        );

        if( chat.creator.toString() === req.userData._id ){
            const randomElement = Math.floor(Math.random() * remainingMembers.length );
            const newCreator = remainingMembers[randomElement];

            chat.creator = newCreator;
        }

        chat.members = remainingMembers;

        await chat.save()

        emitEvent(
            req,
            ALERT,
            chat.members,
            `${req.userData.name} has left the group`
        )

        emitEvent(  
            req,
            REFETCH_CHATS,
            chat.members
        )

        return res
       .status(200)
       .json(
        {
            message: `${req.userData.name} has left the group`
        })
        
    } catch (error) {
        console.log(error.message)
    }
}