import { ObjectId } from 'mongodb';
import mongoose,{ Schema,Document } from 'mongoose'

interface Collection {
    name:string,
    owner:ObjectId,
    acces:Array<userObject>,
    _id:ObjectId,
    files:mongoFileRef[]
}

interface User extends Document {
    _id:ObjectId,
    email: string;
    password: string;
    collections: Array<Collection>;
    tag: number;
    avatarHash:string,
    notifications: notifications,
}



const notificationsSchema = new Schema({
    muted: {
        type: [String],
        default: [] 
    },
    array: [] as notifications[]
});

const collectionSchema = new Schema({
    name:{
        type:String,
       
    },
    owner:{
        type: ObjectId,
       
    },
    files:[] as mongoFileRef[],
    acces:[
        {
            _id:{
                type:ObjectId,
               
            },
            email:{
                type:String,
               
            },
            tag:{
                type:Number
            },
            canRename:{
                type:Boolean
            },
            canDelete:{
                type:Boolean
            },
            canDownload:{
                type:Boolean
            },
            canUpload:{
                type:Boolean
            }
        }
    ],
    _id:{
        type: ObjectId
    }
})

const userSchema = new Schema<User>({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    collections:[collectionSchema],
    tag:{
        type:Number,
        required:true
    },
    avatarHash:{
        type:String
    },
   notifications:notificationsSchema
},{timestamps:true})

const UserModel = mongoose.models.users || mongoose.model('users',userSchema)

export default UserModel