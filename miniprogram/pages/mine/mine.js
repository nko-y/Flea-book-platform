// pages/mine/mine.js
var app = getApp()
var db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    allIntegral:0,
    whetherCert:true,
    withMessage:false,

    //代表是否授权登录
    isRegister: false
  },

  

  //点击认证个人信息
  bindGetUserInfo: async function(e){
    if(typeof(e.detail.userInfo)=="undefined"){
      this.notRegister()
      return
    }
    app.globalData.userInfo = e.detail.userInfo

    //否则就获得了个人信息
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

    //全局变量更新
    app.globalData.hasRegister = true
    this.setData({isRegister: true, withMessage: false})

    //该页面刷新
    this.getTabBar().setData({
      selected: 3,
      canThisShow: true,
    });

    //如果没有授权直接return
    await this.initThePage()
    
    if(this.data.isRegister==true){
      //只有授权之后会执行
      var countEmail = await this.hasNewEmail()
      if(countEmail.total==0){
        this.setData({withMessage:false})
      }
      else this.setData({withMessage:true})      
    }

    this.setData({
      isLoading: false
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

  //更新用户的头像和姓名链接
  updateNameandPic: async function(){
    return db.collection("user").doc(app.globalData.userDocId).update({
      data:{
        user_name: app.globalData.userInfo.nickName,
        user_url: app.globalData.userInfo.avatarUrl
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getTabBar().setData({
      selected: 3,
      canThisShow: true,
    });
    this.setData({
      withMessage: false,
      isRegister: app.globalData.hasRegister
    })

    //如果没有授权直接return
    await this.initThePage()
    
    if(this.data.isRegister==true){
      //只有授权之后会执行
      var countEmail = await this.hasNewEmail()
      if(countEmail.total==0){
        this.setData({withMessage:false})
      }
      else this.setData({withMessage:true})      
    }

    this.setData({
      isLoading: false
    })
  },

  //获取该页面的基本信息
  initThePage: async function(){
    if(this.data.isRegister==false) return
    var mineUserInfo = await this.getMineUserInfo()
    this.setData({
      allIntegral:mineUserInfo.data.user_integral,
      whetherCert:mineUserInfo.data.user_certified
    })
  },

  getMineUserInfo: async function(){
    var that = this
    return db.collection("user").doc(app.globalData.userDocId).get()
  },

  //现在有新的邮件吗
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  turnToemail: function(){
    if(this.data.isRegister==false){
      //代表还未认证
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

  turntoPersonalInfo:function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后方可修改个人信息'
      })
      return
    }
    wx.navigateTo({
      url: `../personInformation/personInformation?fromWhere=${"minePage"}`,
    })
  },

  toMyBookShelf:function(e){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启书架功能'
      })
      return
    }
    wx.navigateTo({ url: `../myBookShelf/myBookShelf` }); 
  },

  toMyReleases:function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启发布功能'
      })
      return
    }
    wx.navigateTo({url:`../myReleases/myReleases`});
  },

  toMyRecords: function () {
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启发布功能'
      })
      return
    }
    wx.navigateTo({ url: `../myRecords/myRecords` });
  },

  toApplication:function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启共享书库功能'
      })
      return
    }
    wx.navigateTo({url: '../application/application'})
  },

  toHistory:function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启历史记录功能'
      })
      return
    }
    wx.navigateTo({url: '../history/history'})
  },

  toNotice: function(){
    wx.navigateTo({url: '../notice/notice'})
  },

  toQuest: function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启认证功能'
      })
      return
    }
    wx.navigateTo({url: '../questionnaire/questionnaire'})
  },

  toGuide: function(){
    wx.navigateTo({url: '../guide/guide'})
  }
})