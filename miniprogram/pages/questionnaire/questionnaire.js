// pages/questionnaire/questionnaire.js
var util = require('../../utils/util.js');
var db = wx.cloud.database()
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    formateDate:"",
    isAdding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var TIME = util.formatDate(new Date());
    this.setData({formateDate: TIME,isAdding: false})

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

  saveForm: function(e){
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})
    var nameInput = e.detail.value.nameInput
    var numberInput = e.detail.value.numberInput
    var orgInput = e.detail.value.orgInput
    var checkInput = e.detail.value.checkInput
    if(numberInput==""){
      wx.showToast({
        title: '请输入学号',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    if(nameInput==""){
      wx.showToast({
        title: '请输入姓名',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    if(orgInput==""){
      wx.showToast({
        title: '请输入联系方式',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    if(checkInput==""){
      wx.showToast({
        title: '请输入认证码',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    var that = this
    //如果信息都通过
    wx.showModal({
      title:'提示',
      content:'确认提交申请?',
      success: function(res){
        if(res.confirm){
          console.log('申请')
          wx.showToast({
            title: '提交中',
            icon:'loading',
            duration:2000
          })
          db.collection('confirm').add({
            data:{
              confirm_name: nameInput,
              confirm_number: numberInput,
              confirm_contact: orgInput,
              confirm_check: checkInput
            },
            success: function(res){
              wx.showToast({
                title: '发送成功',
                icon:'success',
                duration:2000
              })
              that.setData({
                isAdding: false
              })
            }
          })
        }
        else{
          console.log('取消')
          that.setData({isAdding: false})
        }
      }
    })
  }
})