import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'


type Params = {
    params:{
        userId:string
    }
}

connectMongo()

export async function GET(request:Request,{params:{userId}}:Params) {
    try {
        const user = await UserModel.findById(userId)
        return NextResponse.json(user.notifications.array)
    } catch (error) {
        return NextResponse.json("Something went wrong while fetching notifications",{status:500})
    }
}

export async function POST(request:Request,{params:{userId}}:Params) {
    const {action,notificationId,collectionId} = await request.json()
    const notificationObjectId = new ObjectId(notificationId)
    try {
        const user = await UserModel.findById(userId)

        //Make the most recent 5 notifications "seen" on mount.
        if (action === 'seen') {
            const sortedNotifications = user.notifications.array
              .sort((a: notifications, b: notifications) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .filter((notification: notifications) => notification.state.dismissed === false);
          
            await Promise.all(
              sortedNotifications.map((notification: notifications) => {
                notification.state.seen = true;
              })
            );
        }else if(action === 'clicked'){
            const notification = user.notifications.array.find((notification:notifications)=>notification._id.equals(notificationObjectId))
            notification.state.clicked = true
        }else if(action === 'dismiss'){
            const notification = user.notifications.array.find((notification:notifications)=>notification._id.equals(notificationObjectId))
            notification.state.dismissed = true
        }else if(action === 'clear'){
            user.notifications.array = []
        }else if(action === 'remove'){
            const notificationIndex = user.notifications.array.findIndex((notification:notifications)=>notification._id.equals(notificationObjectId))
            user.notifications.array.splice(notificationIndex,1)
        }else if(action === 'mute'){
            user.notifications.muted.push(collectionId)
        }else if(action === 'unmute'){
            const mutedColIndex = user.notifications.muted.findIndex((colId:string)=>colId === collectionId)
            user.notifications.muted.splice(mutedColIndex,1)
        }

        user.markModified('notifications')
        await user.save()
        return NextResponse.json("Notification handled.",{status:200})
    } catch (error) {
        return NextResponse.json("Something went wrong while fetching notifications",{status:500})
    }
}


