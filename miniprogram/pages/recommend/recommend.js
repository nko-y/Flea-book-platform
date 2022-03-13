// pages/recommend/recommend.js
var app = getApp()
var db = wx.cloud.database()
const cd = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isLoadingTwo: true,
    avatarUrl:"",
    message: false,
    bookList: [],

    //该用户的头像和姓名
    avatarUrl:"",
    nickName:"",

    //用于用户的授权登录
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),


    //一次刷新多少书
    oneBatch:4,
    //已经显示在屏幕上的book的id集合
    hasShowBookId:[],
    //需要显示的书籍的信息
    allData: [],
    //现在是否在进行某项操作
    isAdding: false,
    //已经显示的读着有那些
    hasShowUserId: [],


    //表示是否成功登录
    isRegister: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      hasShowBookId: [],
      allData: [],
      isAdding: false,
      hasShowUserId:[],
      isLoadingTwo: true
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.getTabBar().setData({
        canThisShow: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.getTabBar().setData({
          canThisShow: true
        })
        if(this.data.hasUserInfo && app.globalData.firstIn){
          this.setData({isLoading: true})
          this.doeachTime()
        }
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.getTabBar().setData({
            canThisShow: true
          })
          if(this.data.hasUserInfo && app.globalData.firstIn){
            this.setData({isLoading: true})
            this.doeachTime()
          }
        }
      })
    }
    
    //获取第一批数据
    var firstBatchBooks = await this.getBooks(this.data.oneBatch)
    var tempAllData = this.data.allData
    tempAllData = tempAllData.concat(firstBatchBooks)
    this.setData({allData:tempAllData})
    this.setData({isLoadingTwo: false})
    this.setData({isLoading: false})
    app.globalData.lockIn = false
  },

  getUserInfo: async function(e) {
    if(typeof(e.detail.userInfo)=="undefined"){
      this.notRegister()
      return
    }
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    console.log(app.globalData.userInfo,1)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    //如果成功授权登录
    if(app.globalData.userInfo){
      console.log(app.globalData.userInfo)
      this.getTabBar().setData({
        canThisShow: true
      })
      this.setData({isLoading: true})
      await this.doeachTime()
    }
  },

  //暂不登录
  notRegister: async function(){
    console.log("不登录")
    app.globalData.hasRegister = false
    this.getTabBar().setData({canThisShow: true})
    this.setData({hasUserInfo: true, isLoading: true})
    await this.doeachTimeWithoutRegister()
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
    if(this.data.hasUserInfo && app.globalData.hasRegister==true){
      this.setData({isLoading: true, isRegister: true})
      await this.doeachTime()
    }
    else if(this.data.hasUserInfo && app.globalData.hasRegister==false){
      this.setData({isRegister: false})
      await this.doeachTimeWithoutRegister()
    }
  },

  checkFirstIn: async function(){
    var that = this
    var result1 = await that.firstIn()
    var result2 = await that.searchoenId(result1.result._openid)
    if(result2.data.length==0){
      var ressult3 = await that.insertMember()
      app.globalData.userDocId = ressult3._id
    }
    if(app.globalData.userDocId==""){
      app.globalData.userDocId = result2.data[0]._id
      app.globalData.userBookStackId = result2.data[0].user_sharelib_id
    }
    await this.updateNameandPic()
    if(app.globalData.userInfo){
      this.getTabBar().setData({
        canThisShow:true
      })
      console.log(app.globalData.userInfo)
    }
    that.setData({isLoading:false})
  },






  //每次如果不授权登录需要执行的函数
  doeachTimeWithoutRegister: async function(){
    var that = this
    this.getTabBar().setData({
      selected: 0,
    });
    this.setData({
      isLoading:false,
      message: false
    })
    app.globalData.firstIn = false
  },

  //每次进入均需要执行的函数
  doeachTime: async function(){
    var that = this
    this.getTabBar().setData({
      selected: 0,
    });
    this.setData({
      isLoading:true,
    })
    if(app.globalData.firstIn){
      app.globalData.firstIn = false
      await this.checkFirstIn()
    }
    //此处放置每次进入该页面的函数

    //处理邮件的小红点
    var countEmail = await this.hasNewEmail()
    if(countEmail.total==0){
      this.setData({message:false})
    }
    else this.setData({message:true})
    this.setData({isLoading:false})
  },




  
  //更新用户的头像和姓名链接
  updateNameandPic: async function(){
    return db.collection("user").doc(app.globalData.userDocId).update({
      data:{
        user_name: app.globalData.userInfo.nickName,
        user_url: app.globalData.userInfo.avatarUrl
      }
    })
  },

  //获取用户的openid
  firstIn: async function(){
    return wx.cloud.callFunction({
      name:"login"
    })
  },

  //查询该openid是否存在
  searchoenId: async function(onesOpenId){
    return db.collection("user").where({
      openid:onesOpenId
    }).get()
  },

  //插入一个用户
  insertMember: async function(){
    return db.collection("user").add({
      data:{
        user_certified:false,
        user_integral:100,
        user_QQ:"",
        user_wechat:"",
        user_email:"",
        user_address:"",
        user_notes:"",
        user_sharelib_id:"",
      }
    })
  },


  //判断现在有新的邮件吗
  hasNewEmail: async function(){
    return db.collection('email').where({
      email_toUserId: app.globalData.userDocId,
      email_reading: false,
      email_judgeStack: false
    }).count()
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
    //如果还在加载上一批数据，则直接返回
    if(this.data.isAdding==true) return
    wx.showNavigationBarLoading()
    wx.showToast({
      title: '加载中',
      icon:"loading",
      duration:4000
    })
    this.setData({isAdding:true}) 
    //获取oneBatch数量书本
    var otherBatchBooks = await this.getBooks(this.data.oneBatch)
    var tempAllData = this.data.allData
    if(otherBatchBooks.length==0){
      wx.showToast({
        title: '已经没有更多啦',
        icon:"none",
        duration:3000
      })
    }
    else{
      tempAllData = tempAllData.concat(otherBatchBooks)
      this.setData({allData:tempAllData})
      wx.showToast({
        title: '刷新成功',
        icon:'none',
        duration:2000
      })
    }
    //结束adding数据
    wx.hideNavigationBarLoading() //完成停止加载
    this.setData({isAdding:false})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  turnToemail: function(){
    if(this.data.isRegister==false){
      wx.showModal({
        title:'提示',
        content:'授权登录后开启邮件功能'
      })
      return
    }
    wx.navigateTo({
      url: '../email/email',
    })
  },

  turnToPersonInfo: function(){
    if(this.data.isRegister==false){
      return
    }
    wx.navigateTo({
      url: `../../pages/personInformation/personInformation?fromWhere=${"recommendPage"}`,
    })
  },



  //处理模糊搜索的函数
  clickSearch: async function(e){
    let value = e.detail.value
    //如果是空的话
    if(value==""){
      wx.showToast({
        title: '请输入要搜索的内容',
        icon:'none',
        duration:2000,
      })
    }

    //跳转到
    else{
      wx.navigateTo({ url: `../transactionCategory/transactionCategory?theId=${0}&searchValue=${value}` });
    }
  },



  //接下来的书籍的更新
  //封装每一次获取book的函数
  getBooks: async function(num){
    var allBooks = await this.getBooksRecords(num)
    for(let i=0; i<allBooks.data.length; i++){
      var download_img = []
      for(let j=0; j<allBooks.data[i].book_img.length; j++){
         var tempOnePath = await this.downloadOneFile(allBooks.data[i].book_img[j])
         download_img.push(tempOnePath.tempFilePath)
      }
      allBooks.data[i].download_img = download_img
    }

    //除此之外还需要把获取的bookid添加到hasShowBookId中
    var temphasShowBookId = this.data.hasShowBookId
    for(let i=0; i<allBooks.data.length; i++){
      temphasShowBookId.push(allBooks.data[i]._id)
    }
    //还需要把对应的创作者添加到hasShowUserId中
    var tempHasSHowUserId = this.data.hasShowUserId
    for(let i=0; i<allBooks.data.length; i++){
      //如果这本书是不属于共享书库
      if(allBooks.data[i].book_bookStackId==""){
        tempHasSHowUserId.push(allBooks.data[i].book_createUserId)
      }
    }
    this.setData({hasShowBookId:temphasShowBookId, hasShowUserId:tempHasSHowUserId})
    return allBooks.data
  },


  //获取还未获取的指定数量的book
  getBooksRecords: async function(num){
    var that = this
    var theState = [1,-1]
    return db.collection("book").where({
      _id:cd.nin(that.data.hasShowBookId),
      book_state:cd.in(theState),
      book_createUserId: cd.nin(that.data.hasShowUserId)
    }).limit(num).orderBy("book_createTime","desc").orderBy("book_detailTime","desc").get()
  },

  //将一张图片下载
  downloadOneFile: async function(path){
    return wx.cloud.downloadFile({
      fileID: path
    })
  },

  //接下来处理点击跳转的函数
  turnToOrder: async function(e){
    if(e.detail.state==0){
      //代表需要删除这本书的记录了
      var tempAllData = this.data.allData
      var tempHasShowBookId = this.data.hasShowBookId
      for(let i=0; i<tempAllData.length; i++){
        if(tempAllData[i]._id == e.detail.doc){
          tempAllData.splice(i,1)
          break
        }
      }
      for(let i=0; i<tempHasShowBookId.length; i++){
        if(tempHasShowBookId[i]._id == e.detail.doc){
          tempHasShowBookId.splice(i,1)
        }
      }
      this.setData({allData:tempAllData,hasShowBookId:temphasShowBookId})
      //然后增加一条新的记录
      this.setData({isAdding:true})
      var oneBatchBook = await this.getBooks(1)
      tempAllData = tempAllData.concat(oneBatchBook)
      this.setData({allData:tempAllData})
      this.setData({isAdding:false})
    }
    else{
      //准备跳转到新的页面
      app.globalData.detailInfo = this.data.allData
      wx.navigateTo({
        url: '../../pages/transactionDetail/transactionDetail',
      })
    }
  },
})