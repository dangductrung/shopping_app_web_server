const schedule = require('node-schedule');
const Entity = require('../helper/entity.helper');
const  authhelper = require("../helper/auth.helper");
const dateFormat = require('dateformat');

var serviceAccount = require("../fb_key.json");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const check_notification = async () => {
	const job = schedule.scheduleJob('*/2 * * * *', async function(fireDate) {
	  await check();
	});
}

const check = async () => {
	let follows = await Entity.Follow.findAll();

	if(follows != null && follows != undefined) {
		for(i = 0; i < follows.length; ++i) {
			let product = await Entity.Product.findAll({
                    limit: 1,
                    where: {
                        link: follows[i].link
                    },
                    order: [ [ 'created_at', 'DESC' ]]
            });

            if(product[0].current_price !== follows[i].current_price) {
            	follows[i].is_new = true;
            	follows[i].current_price = product[0].current_price;
            	follows[i].save();
            	let notification = await Entity.Notification.create({
            		username: follows[i].username,
            		type: "price_change",
            		title: "Giá thay đổi",
            		body: "Giá " + product[0].name + " thay đổi: " + product[0].current_price,
            		created_at: dateFormat(Date().toLocaleString("sv", { timeZone: "Asia/Ho_Chi_Minh" }), 'yyyy-mm-dd HH:MM:ss'),
            		is_read: false
            	});

            	let unread_count = await Entity.Notification.findAll({
            		where: {
            			username: follows[i].username,
            			is_read: false
            		}
            	})

            	await push_notificaion(notification, unread_count.length);
            }
		}
	}
}

const push_notificaion = async (notification, unread_count) => {
	let fcms = await Entity.FCM.findAll({
		where: {
			username: notification.username
		}
	});

	let tokens = [];
	for(i = 0 ;i< fcms.length; i++) {
		tokens.push(fcms[i].key);
	}

	let ios = {
      payload: {
        aps: {
          badge: unread_count,
        }
      }
  	}

  	 let android = {
  	 	notification: {
  	 		clickAction: "FLUTTER_NOTIFICATION_CLICK",
  	 	},
	    data: {
	       title: notification.title,
	       content: notification.body,
	       type: notification.type, 
	    }
  	}

	const message = {
	  data: {
	    title: notification.title,
	    body: notification.body,
	    type: notification.type, 
	    content: notification.body
	  },
	  android: android,
	  apns: ios,
	  notification: {
	  	  title:notification.title,
	      body:notification.body,
	  },
	  tokens: tokens,
	}

	admin.messaging().sendMulticast(message)
	  .then((response) => {
	    console.log(response.successCount + ' messages were sent successfully');
	});
}

module.exports = {check_notification}