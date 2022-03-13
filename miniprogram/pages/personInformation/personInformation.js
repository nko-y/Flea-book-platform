// pages/personInformation/personInformation.js
var app = getApp()
var db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    from:"",
    isLoading: true,

    weixinValue:"",
    QQValue:"",
    emailValue:"",
    extraInfoValue:"",
    addressValue:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const{fromWhere}=options
    this.setData({from:options.fromWhere})
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
      isLoading:true
    })
    await this.initThePage()
    this.setData({
      isLoading:false
    })
  },

  //初始化该页面的数据
  initThePage: async function(){
    var pfUserInfo = await this.getpfUserInfo()
    if(app.globalData.tempConfirm==true&&this.data.from=="orderPage"){
      this.setData({
        weixinValue:app.globalData.temp_user_wechat,
        QQValue:app.globalData.temp_user_QQ,
        emailValue:app.globalData.temp_user_email,
        addressValue:app.globalData.temp_user_address,
        extraInfoValue:app.globalData.temp_user_notes
      })
    }
    else{
      this.setData({
        weixinValue: pfUserInfo.data.user_wechat,
        QQValue: pfUserInfo.data.user_QQ,
        emailValue: pfUserInfo.data.user_email,
        addressValue:pfUserInfo.data.user_address,
        extraInfoValue: pfUserInfo.data.user_notes
      })
    }
  },

  //获取用户个人信息
  getpfUserInfo: async function(){
    return db.collection("user").doc(app.globalData.userDocId).get()
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

  //保存个人信息的按钮
  saveForm: async function(e){
    if(this.data.from != 'orderPage'){
      await db.collection("user").doc(app.globalData.userDocId).update({
        data:{
          user_wechat: e.detail.value.weixin,
          user_QQ: e.detail.value.QQ,
          user_email: e.detail.value.email,
          user_address: e.detail.value.address,
          user_notes: e.detail.value.traInfo,
        }
      })
      .then(res => {console.log("用户个人信息更新成功"); console.log(res)})
      .catch(err => {console.log("用户个人信息更新失败"); console.log(err)})
      if(this.data.from=='minePage'){
        wx.navigateBack({
          url: '../../pages/mine/mine'
        })
      }
      else{
        wx.navigateBack({
          url: '../../pages/recommend/recommend'
        })
      }
    }
    else{
      app.globalData.temp_user_wechat = e.detail.value.weixin
      app.globalData.temp_user_QQ = e.detail.value.QQ
      app.globalData.temp_user_email = e.detail.value.email
      app.globalData.temp_user_address = e.detail.value.address
      app.globalData.temp_user_notes = e.detail.value.traInfo
      app.globalData.tempConfirm = true
      wx.navigateBack({
        url: `../../pages/confirmOrder/confirmOrder`
      })
    }
  }
})