// pages/application/application.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  applyStack:function(){
    wx.navigateTo({ url: '../applyStack/applyStack' })
  },

  applyAdministrator: function () {
    wx.navigateTo({ url: '../applyAdministrator/applyAdministrator' })
  },

  administration: function () {
    if(app.globalData.userBookStackId==""){
      wx.showModal({
        title:"提示",
        content:"暂不属于任何共享书库"
      })
    }
    else{
      wx.navigateTo({ url: '../administration/administration' })
    }
  },

  myApplication: function () {
    wx.navigateTo({ url: '../myApplication/myApplication' })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})