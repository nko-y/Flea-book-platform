// pages/share/share.js
var db = wx.cloud.database()
var app = getApp()
var util = require('../../utils/util.js');
const cd = db.command


Page({

  /**
   * 页面的初始数据
   */
  data: {
    stackList:[],
    isLoading: true
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
      selected: 2,
      canThisShow: true
    });
    this.setData({isLoading:true})
    //获取所有的书库
    var res = await db.collection('bookStack').get()
    //获得所有书库的图片
    for(let i=0; i<res.data.length; i++){
      var picPath = await wx.cloud.downloadFile({fileID: res.data[i].bookStack_img})
      res.data[i].bookStack_showImg = picPath.tempFilePath
    }
    this.setData({stackList: res.data,isLoading:false})
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