// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: "release-xs32f"
})

// 云函数入口函数
exports.main = async (event, context) => {
  var tempId = event.userId
  var tempStackId = event.stackId
  var db = cloud.database()
  return db.collection("user").doc(tempId).update({
    data:{
      user_sharelib_id: tempStackId
    }
  })
}