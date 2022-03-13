// pages/notice/notice.js
var util = require('../../utils/util.js');
var db = wx.cloud.database()
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice:[]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var resData = await this.getAllData()
    this.setData({notice: resData.data})
  },

  getAllData: async function(){
    const MAX_LIMIT = 10
    const countResult = await db.collection('notice').count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('notice').orderBy('date','desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
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

  },

  
})