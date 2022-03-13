// miniprogram/pages/history/history.js
var app=getApp();
var db = wx.cloud.database()
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    allData: [],
    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({isLoading: true, allData:[]})
    await this.setAllData()
    this.setData({isLoading: false})
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

  //设置allData的函数
  setAllData: async function(){
    var that = this

    //首先获得所有书本的Id
    var tempallId = await this.getAllBookId()
    tempallId = tempallId.data
    var allId = []
    for(let i=0; i<tempallId.length; i++){
      allId.push(tempallId[i].browse_bookId)
    }

    //然后获得有关书本的详细信息
    var tempDetail = await this.getDetailInfo(allId)
    tempDetail = tempDetail.data

    //然后需要下载每个的第一张图片
    var count = 0
    for(let i=0; i<tempDetail.length; i++){
      wx.cloud.downloadFile({
        fileID: tempDetail[i].book_img[0],
        success: res=>{
          let temp = []
          temp.push(res.tempFilePath)
          tempDetail[i].download_img = temp
          count++
          if(count==tempDetail.length){
            that.setData({allData: tempDetail})
            that.setData({isLoading: false})
          }
        }
      })
    }
  },

  //获取所有的数据
  getAllBookId: async function(){
    return db.collection('browse').where({browse_userId: app.globalData.userDocId}).get()
  },

  getDetailInfo: async function(allId){
    var state = [1,-1]
    return db.collection('book').where({_id:cd.in(allId), book_state:cd.in(state)}).get()
  }
})