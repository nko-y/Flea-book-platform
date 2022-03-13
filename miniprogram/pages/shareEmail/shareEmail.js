// miniprogram/pages/shareEmail/shareEmail.js
var app = getApp()
var db = wx.cloud.database()
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isAdding: false,

    //一次刷新获取多少邮件
    onBatch: 4,
    //已经显示在屏幕上的邮件的集合
    hasShowEmailId:[],
    //需要显示的书籍的信息
    allData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isLoading: true,
      isAdding: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    this.setData({
      hasShowEmailId:[],
      allData:[],
      isZero: false
    })
    await this.getEmail(this.data.onBatch)
    this.setData({
      isLoading: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    wx.showToast({
      title: '加载中...',
      icon:'none',
      duration:2000
    })
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})
    let count = await this.getEmail(this.data.onBatch)
    if(count==0){
      wx.showToast({
        title: '没有更多啦',
        icon:'none',
        duration:2000
      })
    }
    this.setData({isAdding:false})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  //获取指定数量的email,返回获取的数量
  getEmail:async function(num){
    var that = this
    var newBook = await this.getEmailRecords(num);
    //把获取的id添加到已经显示的id当中去
    var tempHasShowEmailId = this.data.hasShowEmailId;
    var tempAllData = this.data.allData;
    for(let i=0; i<newBook.data.length; i++){
      //一、获取每本书的基本信息
      let resbook = await that.getBookInfo(newBook.data[i].email_bookId)
      newBook.data[i].bookInfo = resbook.data
      //二、获取每个发邮件的人的信息
      let resPerson = await that.getPersonInfo(newBook.data[i].email_fromUserId)
      newBook.data[i].personInfo = resPerson.result.toData[0]
      tempHasShowEmailId.push(newBook.data[i]._id)
      tempAllData.push(newBook.data[i])
    }
    //修改一下要显示的content信息
    tempAllData = this.fixInfo(tempAllData)
    //返回值是这次一共获得了多少的书
    this.setData({
      allData: tempAllData,
      hasShowEmailId: tempHasShowEmailId
    })
    //最后还需要将显示的书本置为已经阅读
    await this.hasRead()
    return newBook.data.length
  },

  //从数据库获取指定数量email的函数
  getEmailRecords: async function(num){
    var that = this;
    return db.collection('email').where({
      email_toUserId: app.globalData.userBookStackId,
      _id: cd.nin(that.data.hasShowEmailId),
      email_judgeStack: true
    }).limit(num).orderBy("email_fromTime","desc").orderBy("email_detailTime","desc").get()
  },

  //从数据库获取指定书籍的基本信息
  getBookInfo: async function(book_id){
    return db.collection('book').doc(book_id).get()
  },

  //从云函数获取每个发邮件的人的基本信息
  getPersonInfo: async function(book_id){
    var temp = []
    var one = {}
    one.book_createUserId = book_id
    temp.push(one)
    return wx.cloud.callFunction({
      name:'getAllInfo',
      data:{
        fromData:temp
      }
    })
  },

  //拼接一下基本信息
  fixInfo: function(inData){
    for(let i=0; i<inData.length; i++){
      let tempStr = inData[i].email_content + "\n"
      if(inData[i].email_fromQQ!="") tempStr = tempStr + "QQ: " + inData[i].email_fromQQ + "\n"
      if(inData[i].email_fromwechat!="") tempStr = tempStr + "微信: " + inData[i].email_fromwechat + "\n"
      if(inData[i].email_fromemail!="") tempStr = tempStr + "邮箱: " + inData[i].email_fromemail + "\n"
      if(inData[i].email_fromaddress!="") tempStr = tempStr + "信箱: " + inData[i].email_fromaddress + "\n"
      inData[i].email_content = tempStr
    }
    return inData
  },




  //将此封邮件置为已经读取
  hasRead: async function(){
    //首先查看显示的书籍哪些是已经读取的
    var tempShow = this.data.allData;
    for(let i=0; i<tempShow.length; i++){
      if(tempShow[i].email_reading==false){
        await this.hasReadOne(tempShow[i]._id)
      }
    }
  },

  hasReadOne: async function(docId){
    db.collection('email').doc(docId).update({
      data:{
        email_reading: true
      }
    })
  },



  //根据id删除一封邮件
  deleteTheEmail: async function(e){
    this.setData({
      isAdding:true
    })

    //开始处理,删掉数组中的数据
    var temphasShowEmailId = this.data.hasShowEmailId;
    var tempallData = this.data.allData;
    for(let i=0; i<temphasShowEmailId.length; i++){
      if(temphasShowEmailId[i] == e.detail._id){
        temphasShowEmailId.splice(i,1)
        tempallData.splice(i,1);
      }
    }
    this.setData({
      hasShowEmailId: temphasShowEmailId,
      allData: tempallData
    })

    //然后把数据删除
    await this.deleteOneEmail(e.detail._id);

    //刷新一个新的记录
    await this.getEmail(1);

    //显示删除成功
    wx.showToast({
      title: '删除成功',
      icon:'success'
    })
    
    this.setData({
      isAdding:false
    })
  },

  //具体删除一封邮件的函数
  deleteOneEmail: async function(theId){
    return db.collection('email').doc(theId).remove();
  }
})