// pages/shareReleases/shareReleases.js
var util = require('../../utils/util.js');
var db = wx.cloud.database()
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: [
      {"id": 1, "content":"A 新闻传播·公关·写作类"},
      {"id": 2, "content": "B 文史类"},
      {"id": 3, "content": "C 艺术类"},
      {"id": 4, "content": "D 政治法律类"},
      {"id": 5, "content": "E 心理学·教育学类"},
      {"id": 6, "content": "F 经济·管理·贸易·金融"},
      {"id": 7, "content": "G 外语类"},
      { "id": 8, "content": "H 计算机类" },
      { "id": 9, "content": "I 电力电子类" },
      { "id": 10, "content": "J 自动控制类" },
      { "id": 11, "content": "K 机械类" },
      { "id": 12, "content": "L 土木地质类" },
      { "id": 13, "content": "M 光电信息技术类" },
      { "id": 14, "content": "N 数学类" },
      { "id": 15, "content": "O 物理·力学类" },
      { "id": 16, "content": "P 化学化工·材料环境科学类" },
      { "id": 17, "content": "Q 生命科学·医学类" },
      { "id": 18, "content": "R 农林生物类" }      
    ],
    categoryList:["A 新闻传播·公关·写作类","B 文史类","C 艺术类","D 政治法律类","E 心理学·教育学类","F 经济·管理·贸易·金融","G 外语类","H 计算机类","I 电力电子类","J 自动控制类","K 机械类","L 土木地质类","M 光电信息技术类","N 数学类","O 物理·力学类","P 化学化工·材料环境科学类","Q 生命科学·医学类","R 农林生物类"],

    //这一堆暂时不知道有没有用
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    staus: 1,
    translate: '',

    photoImage:[],
    formateDate:"",
    allNumber:1,
    categoryValue:"",
    currentItem:0,

    titleValue:"",
    pubValue:"",
    authorValue:"",
    priceValue:"",
    detailValue:"",
    currentType:"",
    doUncheck:false,
    whichCate:-1,

    opAble: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var TIME = util.formatDate(new Date());
    var tempphotoImage=[{src:"../../images/camera.svg",judge:1}]
    this.setData({
      formateDate:TIME,
      photoImage:tempphotoImage,
      currentItem:0,
      allNumber:1
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


  //控制number的增减
  up: function(){
    var number = this.data.allNumber
    if(number<100){
      this.setData({
        allNumber:number+1
      })
    }
  },

  down: function(){
    var number = this.data.allNumber
    if(number>1){
      this.setData({
        allNumber:number-1
      })
    }
  },

  //控制类别的选择
  changeCate: function(e){
    var whichOne = e.detail.value
    var finalVal = this.data.categoryList[whichOne]
    this.setData({
      categoryValue:finalVal,
      whichCate: whichOne
    })
  },


  //接下来处理照片的获取
  getPic: function(){
    var that = this;
    var tempItemList = ['拍照','从相册中选择']
    if(this.data.photoImage[this.data.currentItem].judge==0){
      tempItemList = ['拍照','从相册中选择','删除照片']
    }
    wx.showToast({
      title:'建议使用横屏照片',
      icon:'none',
      duration:2000
    })
    wx.showActionSheet({
      itemList: tempItemList,
      success(res){
        if(res.tapIndex==2){
          var nowItem = that.data.currentItem
          var temp = that.data.photoImage
          var index = temp.length-1
          if(nowItem==index){
            temp[index].src="../../images/camera.svg"
            temp[index].judge=1
            that.setData({
              photoImage:temp
            })
          }
          else{
            temp.splice(nowItem,1)
            that.setData({
              photoImage:temp
            })
          }
        }
        else{
          let sourceType = 'camera'
          if(res.tapIndex==0){
            sourceType = 'camera'
          }else if(res.tapIndex==1){
            sourceType = 'album'
          }
          wx.chooseImage({
            count:1,
            sizeType:['compressed'],
            sourceType:[sourceType],
            success:res=>{
              if(that.data.photoImage[that.data.currentItem].src!="../../images/camera.svg"){
                //如果现在点击的图片是已经存在了的
                var temp = that.data.photoImage
                temp[that.data.currentItem].src = res.tempFilePaths[0]
                that.setData({photoImage:temp})
              }
              else{
                var temp = that.data.photoImage
                var len = that.data.photoImage.length
                temp[len-1].src=res.tempFilePaths[0]
                temp[len-1].judge=0
                that.setData({
                  photoImage:temp
                })
                if(that.data.photoImage.length<3){
                  that.setData({photoImage:that.data.photoImage.concat({src:"../../images/camera.svg",judge:1})})
                }
                var nowItem = that.data.photoImage.length-1
                that.setData({currentItem:nowItem})
              }
            }
          })
        }
      }
    })
  },

  changeItem:function(e){
    if(e.detail.source=="touch"){
      this.setData({
        currentItem:e.detail.current
      })
    }
  },


    //创建表格的函数
    saveForm: async function(e){
      if(this.data.opAble==false) return
      this.setData({opAble:false})
  
      var that = this
      var finBookStackId = ""
      var fintitle = e.detail.value.titleInput
      var finauthor = e.detail.value.fromInput
      var finpublic = e.detail.value.pubInput
      var finprice = 0
      var findetail = e.detail.value.abstractInput
      var finnumber = e.detail.value.numberInput
      var finType = "共享"
      var finbookState = -1                                                      
      var finCate = this.data.whichCate
      var finTime =  this.data.formateDate
      var finphoto = []
      for(var i=0; i<this.data.photoImage.length; i++){
        if(this.data.photoImage[i].src!="../../images/camera.svg")
          finphoto = finphoto.concat(this.data.photoImage[i].src)
      }
      if(fintitle==""){
        wx.showModal({
          cancelColor: '提示',
          content:"请输入书本名称",
        })
        this.setData({opAble: true})
      }
      else if(finauthor==""){
        wx.showModal({
          cancelColor: '提示',
          content:"请输入作者名称",
        })
        this.setData({opAble: true})
      }
      else if(finpublic==""){
        wx.showModal({
          cancelColor: '提示',
          content:"请输入出版社名称",
        })
        this.setData({opAble: true})
      }
      else if(findetail==""){
        wx.showModal({
          cancelColor: '提示',
          content:"请输入书本的详细信息",
        })
        this.setData({opAble: true})
      }
      else if(finCate==-1){
        wx.showModal({
          cancelColor: '提示',
          content:"请选择对应的类别",
        })
        this.setData({opAble: true})
      }
      else if(finphoto.length==0){
        wx.showModal({
          cancelColor: '提示',
          content:"请至少选择一张照片",
        })
        this.setData({opAble: true})
      }
      else{
        wx.showModal({
          title: '提示',
          content:'确认创建?',
          success(res){
            if (res.confirm){
              console.log("确认创建")
              wx.showToast({
                title: '创建中',
                icon: 'loading',
                duration: 3000
              })
              that.insertOneBook(fintitle,finpublic,finauthor,parseFloat(finprice),finnumber,findetail,finType,finCate,finbookState,finBookStackId,finTime,finphoto)
            }
            else{
              that.setData({opAble:true})
            }
          }
        })
      }
    },


    uploadOneFile: async function(photoPath,i){
      var currTime = util.formatFileTime(new Date());
      return wx.cloud.uploadFile({
        filePath: photoPath,
        cloudPath: app.globalData.userDocId+'/'+ i + '-' +currTime,
      })
    },

    insertOneBook: async function(fintitle,finpublic,finauthor,finprice,finnumber,findetail,finType,finCate,finbookState,finBookStackId,finTime,finphoto){
      var that = this
      //如果该本书是共享书库中的书，那么获取对应共享书库的finBookStackId
      finBookStackId = app.globalData.userBookStackId

      //再将每张图片上传到云存储
      var picFileId = []
      for(var i=0; i<finphoto.length; i++){
        var picPath = await that.uploadOneFile(finphoto[i],i)
        picFileId = picFileId.concat(picPath.fileID)
      }
      
      //最后再获取一次时间
      finTime = util.formatDate(new Date());
      var findetailTime = util.formatDetail(new Date());
      finnumber = parseInt(finnumber)
      //最后创建该本书的交易/共享记录
      db.collection('book').add({
        data:{
          book_title:fintitle,
          book_pub:finpublic,
          book_author:finauthor,
          book_price:finprice,
          book_num:finnumber,
          book_detailInfo:findetail,
          book_type:finType,
          book_category:finCate,
          book_img:picFileId,
          book_allBrowse:0,
          book_state: finbookState,
          book_bookStackId: finBookStackId,
          book_createUserId: app.globalData.userDocId,
          book_createTime: finTime,
          book_detailTime: findetailTime
        }
      })
      .then(res=>{
        wx.showToast({
          title: '创建成功',
          icon:"success",
          duration:1000
        })
        that.setData({opAble:true})
        console.log(res)
      })
      .catch(err=>{
        console.log(err)
      })
    }
})