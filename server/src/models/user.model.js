import { Schema , model } from 'mongoose';

const userSchema = new Schema({
    name:{
        type:String,
        requird:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type: String,
            requird: true
        }
    }
},{timestamps:true});

export const UserModel = model("User",userSchema);