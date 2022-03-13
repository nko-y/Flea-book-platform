// pages/shareAdministration/shareAdministration.js
var app = getApp()
var db = wx.cloud.database()
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    allData: [],

    isAdding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({isLoading: true, isAdding: false})

    //直接获取所有的数据
    var res = await this.getAllBooks()
    this.setData({allData: res.data})
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

  getAllBooks: async function(){
    const MAX_LIMIT = 10
    const countResult = await db.collection('book').where({book_bookStackId: app.globalData.userBookStackId}).count()
    const total = countResult.total
    if(total==0){
      var temp={}
      temp.data = []
      return temp
    }
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('book').where({book_bookStackId: app.globalData.userBookStackId}).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  },



  //减少一
  minusOne: async function(e){
    if(this.data.isAdding==true) return
    var that = this
    var whichOne = parseInt(e.currentTarget.id)
    if(this.data.allData[whichOne].book_num==0){
      wx.showToast({
        title: '不能再减少啦',
        icon:'none',
        duration:2000
      })
      return
    }
    this.setData({isAdding: true})
    wx.showModal({
      title:'提示',
      content:'确认将数量减少?',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '更新中',
            icon:'loading',
            duration:2000
          })
          that.updateOne(whichOne, that.data.allData[whichOne].book_num-1)
        }
        else{
          that.setData({isAdding: false})
        }
      }
    })
  },

  //增加一
  plusOne: async function(e){
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})
    var whichOne = parseInt(e.currentTarget.id)
    var that = this
    this.setData({isAdding: true})
    wx.showModal({
      title:'提示',
      content:'确认将数量增加?',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '更新中',
            icon:'loading',
            duration:2000
          })
          that.updateOne(whichOne, that.data.allData[whichOne].book_num+1)
        }
        else{
          that.setData({isAdding: false})
        }
      }
    })
  },

  //删除一
  deleteOne: async function(e){
    if(this.data.isAdding==true) return
    var whichOne = parseInt(e.currentTarget.id)
    var that = this
    this.setData({isAdding: true})
    wx.showModal({
      title:'提示',
      content:'确认删除该本书?',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '更新中',
            icon:'loading',
            duration:2000
          })
          that.deletetheBook(whichOne)
        }
        else{
          that.setData({isAdding: false})
        }
      }
    })
  },



  //更新一本书的数量
  updateOne: async function(one, num){
    var state = -1;
    var temp = this.data.allData
    if(num==0) state = -2
    await db.collection('book').doc(temp[one]._id).update({
      data:{
        book_num: num,
        book_state: state
      }
    })
    temp[one].book_num = num
    this.setData({allData: temp})
    wx.showToast({
      title: '更新成功',
      icon:'success',
      duration: 2000
    })
    this.setData({isAdding: false})
  },

  //删除一本书
  deletetheBook: async function(one){
    var that = this
    var temp = this.data.allData
    var tempOne = temp[one]

    //将对应的照片先删除
    var tempImg = tempOne.book_img
    console.log(tempImg)
    await wx.cloud.deleteFile({
      fileList:tempImg
    })

    //最后再将相关数据删除
    await db.collection('book').doc(tempOne._id).remove()

    //把该书从数据中移走
    temp.splice(one,1)
    this.setData({allData: temp})
    wx.showToast({
      title: '删除成功',
      icon:'success',
      duration: 2000
    })
    this.setData({isAdding: false})
  }
})