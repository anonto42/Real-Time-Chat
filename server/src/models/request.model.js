import mongoose, { Schema , Types, model } from 'mongoose';

const requestSchema = new Schema({
    status:{
        type:String,
        enum:['pending','accepted','rejected'],
        default:'pending'
    },
    sender:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type: Types.ObjectId,
        ref:"Chat",
        required:true
    }
},{timestamps:true});

export const RequestModel = model("Request",requestSchema);