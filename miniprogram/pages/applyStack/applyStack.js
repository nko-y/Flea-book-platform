// pages/applyStack/applyStack.js
var util = require('../../utils/util.js');
var db = wx.cloud.database()
const cd = db.command
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    judge: "",
    formateDate: "",

    //代表该页面现在是否可以操作
    isAdding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var TIME = util.formatDate(new Date());
    this.setData({
      src: "../../images/camera.svg",
      judge: 1,
      formateDate: TIME
    })
  },

  getPic: function () {
    var that = this;
    wx.showToast({
      title: '请添加书库封面图',
      icon: 'none',
      duration: 2000
    });
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
            that.setData({ src: res.tempFilePaths[0], judge: 0 })
          }
        })
      }
    })
  },

  deletePic: function () {
    this.setData({
      judge: 1,
      src: "../../images/camera.svg"
    });
  },

  saveForm: async function (e) {
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})
    var that = this

    var stackNameInput = e.detail.value.stackNameInput; //书库名
    var numberInput = e.detail.value.numberInput;       //学号
    var nameInput = e.detail.value.nameInput;           //姓名
    var extraInput = e.detail.value.extraInput;         //备注
    var orgInput = e.detail.value.orgInput;             //所属组织
    var contactInput = e.detail.value.contactInput;     //联系方式
    var srcInput = this.data.src                        //图片链接

    //判断该书库名是否已经存在
    var resName = await db.collection('bookStack').where({
      bookStack_name: stackNameInput,
      bookStack_state: 1
    }).get()
    if(resName.data.length != 0){
      wx.showToast({
        title: '书库名已存在，请更换名称',
        icon: 'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }

    //首先进行判断
    if(srcInput == "../../images/camera.svg"){
      wx.showToast({
        title: "请上传一张照片作为书库封面！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else if(stackNameInput == ""){
      wx.showToast({
        title: "请输入书库名称！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else if(numberInput==""){
      wx.showToast({
        title: "请输入您的学号！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else if(nameInput==""){
      wx.showToast({
        title: "请输入您的姓名！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else if(orgInput==""){
      wx.showToast({
        title: "请填写所属组织信息！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else if(contactInput==""){
      wx.showToast({
        title: "请填写您的联系方式！",
        icon:'none',
        duration:2000
       })
       this.setData({isAdding: false})
    }
    else{

    //首先查看是否存在已有的申请记录
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

      //然后插入记录
      wx.showModal({
        title: '提示',
        content:'确认申请共享书库?',
        success(res){
          if(res.confirm){
            console.log("申请")
            wx.showToast({
              title: '发送申请中...',
              icon:'loading',
              duration:2000
            })
            that.insertOneBook(srcInput,stackNameInput,numberInput,nameInput,orgInput,contactInput,extraInput)
          }
          else{
            that.setData({isAdding: false})
          }
        }
      })
    }
  },

  //插入一条申请记录
  insertOneBook: async function(srcInput,stackNameInput,numberInput,nameInput,orgInput,contactInput,extraInput){
    var that = this
    //将每张照片上传到云存储
    var picFileId = await that.uploadOneFile(srcInput)
    picFileId = picFileId.fileID

    //最后再获取一次时间
    var finTime = util.formatDate(new Date());
    var findetailTime = util.formatDetail(new Date());

    //插入该共享书库的记录
    db.collection('bookStack').add({
      data:{
        bookStack_img: picFileId,
        bookStack_name: stackNameInput,
        bookStack_createName: nameInput,
        bookStack_createNameId: app.globalData.userDocId,
        bookStack_createNumber: numberInput,
        bookStack_org: orgInput,
        bookStack_contact: contactInput,
        bookStack_detailInfo: extraInput,
        bookStack_state: 0,
        bookStack_time: finTime,
        bookStack_detailTime: findetailTime
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

  //插入一张照片
  uploadOneFile: async function(photoPath){
    var currTime = util.formatFileTime(new Date());
    return wx.cloud.uploadFile({
      filePath: photoPath,
      cloudPath: 'bookStack/'+app.globalData.userDocId+'/'+currTime,
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