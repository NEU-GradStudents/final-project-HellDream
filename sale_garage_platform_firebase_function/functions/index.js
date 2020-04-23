const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMsgNotification = functions.firestore.document('liu_yu_chats/{chatRoomId1}/{chatRoomId2}/{message}').onCreate(async (snap, context) => {
    const doc = snap.data();
    const senderId = doc.senderId;
    const receiverId = doc.receiverId;
    const type = doc.type;
    const text = doc.text;

    var receiverData = (await admin.firestore().collection('liu_yu_users').doc(receiverId).get()).data()
    console.log("receiverData: ", receiverData);
    if (receiverData !== null && receiverData.token !== null && receiverData.uid !== senderId) {
        var senderData = (await admin.firestore().collection('liu_yu_users').doc(senderId).get()).data()
        console.log("senderData ", senderData);
        if (senderData !== null /*&& receiverData.token !== senderData.token*/) {
            var bodyContent = ``;
            bodyContent = type === 1 ? text : bodyContent;
            bodyContent = type === 2 ? `[picture]` : bodyContent;
            bodyContent = type === 3 ? `[item]`: bodyContent;
            const payload = {
                notification: {
                    title: `You have a message from "${senderData.displayName}"`,
                    body: bodyContent,
                },
                data: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    chatRoomId: String(snap.id),
                    senderId: senderData.uid
                    // sender: senderData,
                }
            }
            const response = await admin.messaging().sendToDevice(String(receiverData.token), payload);
            response.results.forEach((result, index)=>{
                const err = result.error;
                if(err){
                    console.error('Failure sending notification to', receiverData.token, err);
                }
            })
            console.log("Messaging response:", response.results)

        }
    }
    return null;
})
