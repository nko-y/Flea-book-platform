// pages/applyAdministrator/applyAdministrator.js
var db = wx.cloud.database()
var cd = db.command
var app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdding: false,
    toStackId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  saveForm: async function (e) {
    var that = this

    if(this.data.isAdding==true) return
    this.setData({isAdding: true})
    var stackNameInput = e.detail.value.stackNameInput;   //申请成为共享书库的名称
    var numberInput = e.detail.value.numberInput;         //学号
    var nameInput = e.detail.value.nameInput;             //姓名
    var contactInput = e.detail.value.contactInput        //联系方式
    var extraInput = e.detail.value.extraInput;           //详细信息

    //第一步判断基本信息们
    if(stackNameInput==""){
      wx.showToast({
        title: '请填写共享书库名称',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    if(numberInput==""){
      wx.showToast({
        title: '请填写学号',
        icon:'none',
        duration:2000
      })
      this.setData({isAdding: false})
      return
    }
    if(nameInput==""){
      wx.showToast({
        title: '请填写姓名',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    if(contactInput==""){
      wx.showToast({
        title: '请填写联系方式',
        icon:'none',
        duration:2000
      })
      this.setData({isAdding: false})
      return
    }

    //第二步判断该共享书库的名字是否存在
    var resName = await db.collection('bookStack').where({
      bookStack_name: stackNameInput,
      bookStack_state: 1
    }).get()
    console.log(resName)
    if(resName.data.length == 0){
      wx.showToast({
        title: '书库名不存在',
        icon: 'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    else{
      this.setData({
        toStackId: resName.data[0]._id
      })
    }

    //第三步检查是否存在已有的申请记录
    var stackRecord = await that.checkStack()
    if(stackRecord.data.length!=0){
      wx.showToast({
        title: '您已经创建了共享书库的申请。若想创建新的申请，请先删除已有申请',
        icon: 'none',
        duration: 3000
      })
      this.setData({isAdding: false})
      return
    }
    var applyRecord = await that.checkManager()
    if(applyRecord.data.length!=0){
      wx.showToast({
        title: '您已经创建了共享书库管理员的申请。若想创建新的申请，请先删除已有申请',
        icon:'none',
        duration: 3000
      })
      this.setData({isAdding: false})
      return
    }


    //如果成功走到了这一步，那就可以插入数据啦
    wx.showModal({
      title: '提示',
      content:'确认申请成为该共享书库的管理员?',
      success(res){
        if(res.confirm){
          wx.showToast({
            title: '发送申请中...',
            icon:'loading',
            duration:2000
          })
          that.insertOne(stackNameInput,numberInput,nameInput,contactInput,extraInput)
        }
        else{
          that.setData({isAdding: false})
        }
      }
    })

  },

  //插入一条记录的函数
  insertOne: async function(stackNameInput,numberInput,nameInput,contactInput,extraInput){
    var that = this
    //最后再获取一次时间
    var finTime = util.formatDate(new Date());
    var findetailTime = util.formatDetail(new Date());
    db.collection('applyStackManage').add({
      data:{
        applyStackManage_detailInfo: extraInput,
        applyStackManage_userName: nameInput,
        applyStackManage_userNameId: app.globalData.userDocId,
        applyStackManage_userStuId: numberInput,
        applyStackManage_bookName: stackNameInput,
        applyStackManage_time: finTime,
        applyStackManage_detailTime: findetailTime,
        applyStackManage_userContact: contactInput,
        applyStackManage_state: 0,
        applyStackManage_bookStackId: that.data.toStackId
      }
    })
    .then(res=>{
      wx.showToast({
        title: '成功提交申请',
        icon: 'success',
        duration: 2000
      })
      that.setData({isAdding: false})
    })
  },



  //查看该用户是否有申请书库记录，如果有则不能申请
  checkStack: async function(){
    return db.collection('bookStack').where({
      bookStack_createNameId: app.globalData.userDocId
    }).get()
  },

  //查看该用户是否有申请书库管理员记录，如果有则不能申请
  checkManager: async function(){
    return db.collection('applyStackManage').where({
      applyStackManage_userNameId: app.globalData.userDocId
    }).get()
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
    this.setData({
      isAdding: false
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})