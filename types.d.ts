type User = {
    email:string,
    password:string,
    tag:number
}

type mongoFileRef = {
    name:string,
    readonly _id:string,
    readonly firebaseNameRef:string,
    readonly type:string | undefined,
    readonly url:string,
    readonly fullPath:string,
    readonly createdAt:string,
    readonly naturalWidth:string,
    readonly naturalHeight:string
}
type firebaseFileRef = {
    name:string,
    _id:string,
    type:string | undefined,
    url:string,
    fullPath:string,
    createdAt:string,
    naturalWidth:string,
    naturalHeight:string
}

type dbUser = {
    collections:collection[],
    createdAt:string,
    email:string,
    password:string,
    tag:number,
    avatarHash:string,
    updatedAt:string,
    __v:number,
    _id:string
}

type collection = {
    name:string,
    owner:ObjectId,
    acces:userObject[],
    _id:ObjectId,
    files:dbFile[]
}


interface userObject {
    _id:ObjectId,
    email:string,
    tag:number,
    canRename:boolean,
    canDelete:boolean,
    canDownload:boolean,
    canUpload:boolean
}

type partyData = {
  sharedWithCount:number,
  sharedWithUserObjects:userObject[]
}

type accessData = {
    canRename:boolean,
    canDelete:boolean,
    canDownload:boolean,
    canUpload:boolean
}


type alertSlice = {
    type:string,
    text:string
}

interface notifications {
    _id:ObjectId,
    triggeredBy:string,
    text:string,
    collectionRef:{
        collectionId:string,
        name:string
    },
    fileRef?:mongoFileRef,
    state:{
        seen:boolean,
        clicked:boolean,
        dismissed:boolean
    },
    createdAt:Date
}

type NotificationsData = {
    muted: string[],
    array:[notifications]
}

