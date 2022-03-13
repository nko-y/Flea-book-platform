// pages/transactionCategory/transactionCategory.js
var app=getApp();
var db = wx.cloud.database()
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: 1,
    //当前选择的是哪个类别
    pageCategory: -1,
    //第一次进入页面的加载
    isLoading:true,
    isAdding: false,

    //一次刷新获取多少个书本信息
    oneBatch:6,
    //已经显示在屏幕上的book的id集合
    hasShowBookId:[],
    //需要显示的书籍的信息
    allData: [],

    //控制现在的筛选是否是展开状态
    isDown: false,

    //用于排序的映射表
    forSort:[
      {field:"", ord:""},
      {field:"book_price", ord:"desc"},
      {field:"book_price", ord:"asc"},
      {field:"book_createTime", ord:"desc"},
      {field:"book_createTime", ord:"asc"},
      {field:"book_allBrowse", ord:"desc"},
      {field:"book_allBrowse", ord:"asc"},
      {field:"book_num", ord:"desc"},
      {field:"book_num", ord:"asc"}
    ],

    //用于搜索选项
    forSearch: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //初始化参数
    this.setData({hasShowBookId:[],state:0,allData:[]})
    //确保获取指定页面数据
    const{theId}=options;
    const{searchValue}=options;
    var idInt=parseInt(options.theId)-1;
    this.setData({pageCategory:idInt,isLoading:true,forSearch:searchValue})
    //第一次加载数据
    var firstBatchBooks = await this.getBooks(this.data.oneBatch)
    var tempAllData = this.data.allData
    tempAllData = tempAllData.concat(firstBatchBooks)
    this.setData({allData:tempAllData})
    //显示界面
    this.setData({isLoading:false})
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
    this.setData({isAdding:false,isDown:false})
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
  onReachBottom: async function () {
    //如果还在加载上一批数据，则直接返回
    if(this.data.isAdding==true) return
    wx.showNavigationBarLoading()
    wx.showToast({
      title: '加载中...',
      icon:"none",
      duration:2000
    })
    this.setData({isAdding:true}) 
    //获取oneBatch数量书本
    var otherBatchBooks = await this.getBooks(this.data.oneBatch)
    var tempAllData = this.data.allData
    if(otherBatchBooks.length==0){
      wx.showToast({
        title: '已经没有更多啦',
        icon:"none",
        duration:2000
      })
      this.setData({isAdding:false})  
    }
    else{
      tempAllData = tempAllData.concat(otherBatchBooks)
      this.setData({allData:tempAllData})
    }
    //结束adding数据
    wx.hideNavigationBarLoading() //完成停止加载
    this.setData({isAdding:false})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

    //点击我显示底部弹出框
    clickme: function () {
      if(this.data.isDown==false){
        this.showModal();
      }
      else{
        this.hideModal();
      }
    },
  
    //显示对话框
    showModal: function () {
      // 显示遮罩层
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(-720).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: true
      })
      setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 300)
      this.setData({isDown:true})
    },
  
    //隐藏对话框
    hideModal: function () {
      // 隐藏遮罩层
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(-720).step()
      this.setData({
        animationData: animation.export(),
      })
      setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: false
        })
      }.bind(this), 300)
      this.setData({isDown:false})
    },


    priceMax:async function(){
      this.setData({
        state:1
      })
      this.orderAsFormat();
    },

    priceMin:async function(){
      this.setData({
        state:2
      })
      this.orderAsFormat();
    },

    timeMin:async function(){
      this.setData({
        state:3
      })
      this.orderAsFormat();
    },

    timeMax:async function(){
      this.setData({
        state:4
      })
      this.orderAsFormat();
    },

    seeMax:async function(){
      this.setData({
        state:5
      })
      this.orderAsFormat();
    },

    seeMin:async function(){
      this.setData({
        state:6
      })
      this.orderAsFormat();
    },

    numMax:async function(){
      this.setData({
        state:7
      })
      this.orderAsFormat();
    },

    numMin:async function(){
      this.setData({
        state:8
      })
      this.orderAsFormat();
    },

    //每次点击筛选之后需要改变状态
    orderAsFormat: async function(){
      //如果还在加载上一批数据，则直接返回
      if(this.data.isAdding==true) return
      this.setData({isAdding:true})

      wx.showNavigationBarLoading()
      wx.showToast({
        title: '筛选中...',
        icon:"loading",
        duration:3000
      })

      //第一次加载数据
      var firstBatchBooks = await this.getBooks(this.data.oneBatch,true)
      var tempAllData = this.data.allData
      tempAllData = tempAllData.concat(firstBatchBooks)
      this.setData({allData:tempAllData})

      this.setData({isAdding:false})
      wx.showToast({
        title: '筛选成功',
        icon:'success',
        duration:2000
      })
      wx.hideNavigationBarLoading()
    },

    //封装每一次获取book的函数
    getBooks: async function(num,whetherfirst=false){
      var allBooks = await this.getBooksRecords(num,whetherfirst)
      for(let i=0; i<allBooks.data.length; i++){
        var download_img = []
        for(let j=0; j<allBooks.data[i].book_img.length; j++){
           var tempOnePath = await this.downloadOneFile(allBooks.data[i].book_img[j])
           download_img.push(tempOnePath.tempFilePath)
        }
        allBooks.data[i].download_img = download_img
      }
      if(whetherfirst==true){
        this.setData({hasShowBookId:[],allData:[]})
      }
      //除此之外还需要把获取的bookid添加到hasShowBookId中
      var temphasShowBookId = this.data.hasShowBookId
      for(let i=0; i<allBooks.data.length; i++){
        temphasShowBookId.push(allBooks.data[i]._id)
      }
      this.setData({hasShowBookId:temphasShowBookId})
      return allBooks.data
    },

    //获取还未获取的指定数量的book
    getBooksRecords: async function(num,whetherfirst=false){
      var that = this
      var theState = [1,-1]
      var theRange = []
      if(whetherfirst==false){
        theRange = this.data.hasShowBookId
      }
      //如果是一开始的无序状态
      if(this.data.state==0){
        if(this.data.pageCategory==-1){
          let strValue = this.data.forSearch;
          return db.collection("book").where(cd.or([
            {
              book_title: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_author: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_detailInfo: db.RegExp({regexp:strValue,option:'i'})
            }
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)}])).limit(num).get()
        }
        else{
          var tempCate = this.data.pageCategory.toString()
          return db.collection("book").where({
            book_category:tempCate,
            _id:cd.nin(theRange),
            book_state:1,
          }).limit(num).get()
        }
      }
      else if(this.data.state==3||this.data.state==4){
        //时间排序
        if(this.data.pageCategory==-1){
          var second = this.data.forSort[this.data.state].ord
          let strValue = this.data.forSearch;
          return db.collection("book").where(cd.or([
            {
              book_title: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_author: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_detailInfo: db.RegExp({regexp:strValue,option:'i'})
            }
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)}])).limit(num).orderBy("book_createTime",second).orderBy("book_detailTime",second).get()
        }
        else{
          var tempCate = this.data.pageCategory.toString()
          var second = this.data.forSort[this.data.state].ord
          return db.collection("book").where({
            book_category:tempCate,
            _id:cd.nin(theRange),
            book_state:1
          }).limit(num).orderBy("book_createTime",second).orderBy("book_detailTime",second).get() 
        }      
      }
      else{
        //其他的排序
        if(this.data.pageCategory==-1){
          var first = this.data.forSort[this.data.state].field
          var second = this.data.forSort[this.data.state].ord
          let strValue = this.data.forSearch;
          return db.collection("book").where(cd.or([
            {
              book_title: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_author: db.RegExp({regexp:strValue,option:'i'})
            },
            {
              book_detailInfo: db.RegExp({regexp:strValue,option:'i'})
            }
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)}])).limit(num).orderBy(first,second).get()
        }
        else{
          var tempCate = this.data.pageCategory.toString()
          var first = this.data.forSort[this.data.state].field
          var second = this.data.forSort[this.data.state].ord
          return db.collection("book").where({
            book_category:tempCate,
            _id:cd.nin(theRange),
            book_state:1
          }).limit(num).orderBy(first,second).get()
        }        
      }
    },

    //将一张图片下载
    downloadOneFile: async function(path){
      return wx.cloud.downloadFile({
        fileID: path
      })
    },


    //接下来处理点击跳转的函数
    turnToOrder: async function(e){
      if(e.detail.state==0){
        //代表需要删除这本书的记录了
        var tempAllData = this.data.allData
        var tempHasShowBookId = this.data.hasShowBookId
        for(let i=0; i<tempAllData.length; i++){
          if(tempAllData[i]._id == e.detail.doc){
            tempAllData.splice(i,1)
            break
          }
        }
        for(let i=0; i<tempHasShowBookId.length; i++){
          if(tempHasShowBookId[i]._id == e.detail.doc){
            tempHasShowBookId.splice(i,1)
          }
        }
        this.setData({allData:tempAllData,hasShowBookId:temphasShowBookId})
        //然后增加一条新的记录
        this.setData({isAdding:true})
        var oneBatchBook = await this.getBooks(1)
        tempAllData = tempAllData.concat(oneBatchBook)
        this.setData({allData:tempAllData})
        this.setData({isAdding:false})
      }
      else{
        //准备跳转到新的页面
        app.globalData.detailInfo = this.data.allData
        wx.navigateTo({
          url: '../../pages/transactionDetail/transactionDetail',
        })
      }
    },
})