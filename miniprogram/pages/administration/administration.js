// pages/administration/administration.js
var db = wx.cloud.database()
var app = getApp()
var util = require('../../utils/util.js');
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
     src:"",

     //关于该书库的全部信息
     allData:[],
     //标记是否是该书库的创建者
     isSetUper: false,

     //是否在加载数据
     isLoading: false,

     //表示是否在修改中
     isAdding: false,

     //表示是否有新的邮件
     isNew: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({isLoading: true, isAdding: false, isNew: false})

    //首先设置基本参数
    this.setData({
      allData: [],
      isSetUper: false
    })
    //首先获取该书库的基本信息
    var info = await this.getStackInfo()
    //判断该用户是否创建者
    var judge = false
    if(info.data.bookStack_createNameId==app.globalData.userDocId) judge=true
    //下载数据库的图片
    var picPath = await wx.cloud.downloadFile({fileID: info.data.bookStack_img})
    //设置数据
    this.setData({
      allData: info.data,
      isSetUper: judge,
      src: picPath.tempFilePath,
      isLoading: false
    })
  },

  getPic: function () {
    if(this.data.isAdding==true) return
    var that = this;
    wx.showActionSheet({
      itemList: ['拍照', '从相册中选择'],
      success(res) {
        let sourceType = 'camera'
        if (res.tapIndex == 0) {
          sourceType = 'camera'
        } else if (res.tapIndex == 1) {
          sourceType = 'album'
        }
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: [sourceType],
          success: res => {
            that.setData({ src: res.tempFilePaths[0]})
          }
        })
      }
    })
  },


  saveform: async function (e) {
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})


    var that = this
    var stackNameInput = e.detail.value.stackNameInput;
    var orgInput = e.detail.value.orgInput;
    var memberInput = e.detail.value.memberInput;
    var infoInput = e.detail.value.infoInput;
    console.log(stackNameInput, orgInput, memberInput, infoInput)

    if (stackNameInput == "" || orgInput == "" || memberInput == "") {
      wx.showToast({
        title: "请填写完整信息！",
        icon: 'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    //接下来判断书库名是否已经存在
    var resName = await db.collection('bookStack').where({bookStack_name: stackNameInput}).get()
    if(resName.data.length!=0 && resName.data[0]._id != this.data.allData._id){
      wx.showModal({
        title:'提示',
        content: '存在同名数据库'
      })
      this.setData({isAdding: false})
      return
    }

    //开始修改信息
    wx.showModal({
      title:'提示',
      content: '确认修改信息',
      success: function(res){
        if(res.confirm){
          console.log('修改')
          wx.showToast({
            title: '修改中',
            icon: 'loading',
            duration: 2000
          })
          that.updateInfo(stackNameInput, orgInput, memberInput, infoInput, that.data.src)
        }
        else{
          that.setData({isAdding: true})
          console.log('不修改')
        }
      }
    })
  },

  //这个函数用于处理更新一个信息
  updateInfo: async function(stackNameInput, orgInput, memberInput, infoInput, srcInput){
    //首先上传照片
    var picFileId = await this.uploadOneFile(srcInput)
    picFileId = picFileId.fileID

    //然后删除原来旧的照片
    var tempL = []
    tempL.push(this.data.allData.bookStack_img)
    var res = await wx.cloud.deleteFile({
      fileList: tempL
    })

    //更新现在照片的id
    var tempAllData = this.data.allData
    tempAllData.bookStack_img = picFileId
    tempAllData.bookStack_name = stackNameInput
    tempAllData.bookStack_org = orgInput
    tempAllData.bookStack_contact = memberInput
    tempAllData.bookStack_detailInfo = infoInput
    this.setData({allData: tempAllData})

    var that = this
    //最后更新数据库
    db.collection('bookStack').doc(this.data.allData._id).update({
      data:{
        bookStack_img : picFileId,
        bookStack_name: stackNameInput,
        bookStack_org: orgInput,
        bookStack_contact: memberInput,
        bookStack_detailInfo: infoInput
      },
      success: function(res){
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 2000
        })
        that.setData({isAdding: false})
      }
    })
  },


  //插入一张照片
  uploadOneFile: async function(photoPath){
    var currTime = util.formatFileTime(new Date());
    return wx.cloud.uploadFile({
      filePath: photoPath,
      cloudPath: 'bookStack/'+app.globalData.userDocId+'/'+currTime,
    })
  }, 





  toShareReleases:function(){
    if(this.data.isAdding==true) return
    wx.navigateTo({
      url: '../shareReleases/shareReleases'
    })
  },

  toShareAdministration: function () {
    if(this.data.isAdding==true) return
    wx.navigateTo({
      url: '../shareAdministration/shareAdministration'
    })
  },

  toSharemember: function(){
    if(this.data.isAdding==true) return
    if(this.data.allData.bookStack_createNameId != app.globalData.userDocId){
      wx.showModal({
        title: '提示',
        content: '暂无相关权限',
      })
      return
    }
    wx.navigateTo({
      url: '../shareMember/shareMember',
    })
  },

  toShareEmail: function(){
    if(this.data.isAdding==true) return
    wx.navigateTo({
      url: '../shareEmail/shareEmail',
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
  onShow: async function () {
    var allCount = await db.collection('email').where({
                  email_toUserId: app.globalData.userBookStackId,
                  email_reading: false,
                  email_judgeStack: true
                  }).count()
    if(allCount.total>0) this.setData({isNew: true})
    else this.setData({isNew: false})
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


  getStackInfo: async function(){
    return db.collection('bookStack').doc(app.globalData.userBookStackId).get()
  }
})