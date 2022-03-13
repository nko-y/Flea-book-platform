// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: "release-xs32f"
})

// 云函数入口函数
exports.main = async (event, context) => {
  var temp = event.fromData
  //将temp中的id全部提取出来
  var allId = []
  for(let i=0; i<temp.length; i++){
    allId.push(temp[i].book_createUserId)
  }
  //获取对应的详细用户信息
  var detailInfo = await getDetail(allId) //detailInfo.data[]
  //获取详细信息之后将temp更新
  for(let i=0; i<temp.length; i++){
    for(let j=0; j<detailInfo.data.length; j++){
      if(temp[i].book_createUserId == detailInfo.data[j]._id){
        temp[i].user_integral = detailInfo.data[j].user_integral
        temp[i].user_name = detailInfo.data[j].user_name
        temp[i].user_url = detailInfo.data[j].user_url
        temp[i].user_certified = detailInfo.data[j].user_certified
        break
      }
    }
  }  
  return{
    toData: temp
  }
}

async function getDetail(tempId){
  var db = cloud.database()
  var cd = db.command
  return db.collection("user").where({
    _id: cd.in(tempId)
  }).get()
}
