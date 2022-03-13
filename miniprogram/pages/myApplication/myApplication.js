// pages/myApplication/myApplication.js
var db = wx.cloud.database()
var cd = db.command
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    waiting: true,
    stackApply: [],
    managerApply: [],
    src: "",

    //一开始进入页面的加载函数
    isLoading: true,
    //是否在执行某项操作
    isAdding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      isLoading: true,
      isAdding: false
    })

    //首先获得书库申请
    var stackRes = await db.collection('bookStack').where({
      bookStack_createNameId: app.globalData.userDocId
    }).get()

    //如果有共享书库申请的话，下载对应的图片
    if(stackRes.data.length!=0){
      var rePic = await wx.cloud.downloadFile({
        fileID: stackRes.data[0].bookStack_img
      })
      this.setData({
        src:rePic.tempFilePath
      })
    }

    var managerRes = await db.collection('applyStackManage').where({
      applyStackManage_userNameId: app.globalData.userDocId
    }).get()
    this.setData({
      stackApply: stackRes.data,
      managerApply: managerRes.data
    })

    this.setData({
      isLoading: false
    })
  },

  chooseFalse: function () {
    if(this.data.isAdding==true) return
    this.setData({ waiting: false });
  },

  chooseWaiting: function () {
    if(this.data.isAdding==true) return
    this.setData({ waiting: true });
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

  //撤销管理员申请
  revokeManager: async function(){
    if(this.data.isAdding==true) return
    var that = this
    this.setData({
      isAdding: true
    })
    wx.showModal({
      title: '提示',
      content:'确认撤销申请?',
      success(res){
        if (res.confirm){
          wx.showToast({
            title: '正在撤销中',
            icon:'loading',
            duration:2000
          })
          db.collection('applyStackManage').doc(that.data.managerApply[0]._id).remove({
            success(res){
              wx.showToast({
                title: '撤销成功',
                icon: 'success',
                duration:2000
              })
              that.setData({isAdding: false,managerApply:[]})
            }
          })
        }
      }
    })
  },

  //撤销书库申请
  revokeStack: async function(){
    if(this.data.isAdding==true) return
    var that = this
    this.setData({
      isAdding: true
    })
    wx.showModal({
      title: '提示',
      content:'确认撤销申请?',
      success(res){
        if (res.confirm){
          wx.showToast({
            title: '正在撤销中',
            icon:'loading',
            duration:2000
          })
          let tempFileList = []
          tempFileList.push(that.data.stackApply[0].bookStack_img)
          wx.cloud.deleteFile({
            fileList: tempFileList,
            success:  res=>{
              db.collection('bookStack').doc(that.data.stackApply[0]._id).remove({
                success(res){
                  wx.showToast({
                    title: '撤销成功',
                    icon: 'success',
                    duration:2000
                  })
                  that.setData({isAdding: false,stackApply:[],src:""})
                }
              })
            }
          })
        }
      }
    })
  }
})