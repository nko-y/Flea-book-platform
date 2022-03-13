// pages/sharePlatform/sharePlatform.js
var app = getApp()
var app=getApp();
var db = wx.cloud.database()
const cd = db.command

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
    allstate:[],
    stateup:[],

    //记录书库的基本信息
    stackInfo: [],



    //下面的信息用于书本的呈现
    state: 1,
    //当前选择的是哪个类别
    pageCategory: 0,
    //第一次进入页面的加载
    isLoading:true,
    isAdding: false,
    
    //一次刷新获取多少个书本信息
    oneBatch:6,
    //已经显示在屏幕上的book的id集合
    hasShowBookId:[],
    //需要显示的书籍的信息
    allData: [],
    
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
    forSearch: "",

    //控制现在的筛选是否是展开状态
    isDown: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //初始化参数
    this.setData({hasShowBookId:[],state:0,allData:[], pageCategory:0})
    //设置页面参数
    this.setData({isLoading:true})

    var tempState = new Array()
    var tempStateup = [0,0,0,0]
    for (var i=0; i<18; i++) tempState[i]=0
    this.setData({allstate:tempState,stateup:tempStateup, stackInfo: app.globalData.nowStackPage})

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
  onReady: async function () {
    this.setData({isAdding:false,isDown:false})
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
      this.showModal();
    },
  
    //显示对话框
    showModal: function () {
      // 显示遮罩层
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateX(450).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: true
      })
      setTimeout(function () {
        animation.translateX(0).step()
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 200)
    },
  
    //隐藏对话框
    hideModal: function () {
      // 隐藏遮罩层
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateX(450).step()
      this.setData({
        animationData: animation.export(),
      })
      setTimeout(function () {
        animation.translateX(0).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: false
        })
      }.bind(this), 200)
    },

    changeState: async function(e){
      if(this.data.isAdding==true) return
      var id = e.currentTarget.dataset.index
      var tempS = this.data.allstate
      if(this.data.allstate[id]) tempS[id] = 0
      else tempS[id] = 1
      this.setData({
        allstate:tempS
      })
      await this.orderAsFormat()
      this.setData({isAdding: false})
    },

    seeMost: async function(){
      if(this.data.isAdding==true) return
      var tempS = [1,0,0,0]
      this.setData({stateup:tempS,state:5})
      await this.orderAsFormat();
      this.setData({isAdding: false})
    },

    seeLeast: async function(){
      if(this.data.isAdding==true) return
      var tempS = [0,1,0,0]
      this.setData({stateup:tempS,state:6})
      await this.orderAsFormat();
      this.setData({isAdding: false})
    },

    numberMost: async function(){
      if(this.data.isAdding==true) return
      var tempS = [0,0,1,0]
      this.setData({stateup:tempS,state:7})
      await this.orderAsFormat();
      this.setData({isAdding: false})
    },

    numberLeast: async function(){
      if(this.data.isAdding==true) return
      var tempS = [0,0,0,1]
      this.setData({stateup:tempS,state:8})
      await this.orderAsFormat();
      this.setData({isAdding: false})
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
      //将每张图片下载
      for(let i=0; i<allBooks.data.length; i++){
        var download_img = []
        for(let j=0; j<allBooks.data[i].book_img.length; j++){
           var tempOnePath = await this.downloadOneFile(allBooks.data[i].book_img[j])
           download_img.push(tempOnePath.tempFilePath)
        }
        allBooks.data[i].download_img = download_img
      }
      //将对应书库信息放入
      for(let i=0; i<allBooks.data.length; i++){
        allBooks.data[i].theBookStackInfo = this.data.stackInfo
        allBooks.data[i].hasTheBookStackInfo = true
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
      var tempAllState = this.data.allstate
      var theState = [1,-1]
      var theRange = []
      if(whetherfirst==false){
        theRange = this.data.hasShowBookId
      }

      var tempCate = []
      for(let i=0; i<tempAllState.length; i++){
        if(tempAllState[i]==1) tempCate.push(i.toString())
      }
      if(tempCate.length==0){
        //如果都没有的话，代表全部都是
        for(let i=0; i<tempAllState.length; i++){
          tempCate.push(i.toString())
        }
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
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)},{book_bookStackId: that.data.stackInfo._id},{book_category:cd.in(tempCate)}])).limit(num).get()
        }
        else{     
          
          return db.collection("book").where({
            book_category:cd.in(tempCate),
            _id:cd.nin(theRange),
            book_state:-1,
            book_bookStackId: that.data.stackInfo._id
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
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)},{book_bookStackId: that.data.stackInfo._id},{book_category:cd.in(tempCate)}])).limit(num).orderBy("book_createTime",second).orderBy("book_detailTime",second).get()
        }
        else{
          var second = this.data.forSort[this.data.state].ord
          return db.collection("book").where({
            book_category:cd.in(tempCate),
            _id:cd.nin(theRange),
            book_state:-1,
            book_bookStackId: that.data.stackInfo._id
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
          ]).and([{_id:cd.nin(theRange)},{book_state:cd.in(theState)},{book_bookStackId: that.data.stackInfo._id},{book_category:cd.in(tempCate)}])).limit(num).orderBy(first,second).get()
        }
        else{

          var first = this.data.forSort[this.data.state].field
          var second = this.data.forSort[this.data.state].ord
          return db.collection("book").where({
            book_category:cd.in(tempCate),
            _id:cd.nin(theRange),
            book_state:-1,
            book_bookStackId: that.data.stackInfo._id
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
    
    //点击搜索按钮
    clickSearch: async function(e){
      if(this.data.isAdding==true) return
      let value = e.detail.value
      if(value==""){
        wx.showToast({
          title: '请输入要搜索的内容',
          icon:'none',
          duration:2000,
        })
      }
      else{
        //开始搜索
        this.setData({forSearch: value})
        wx.showToast({
          title: '搜索中',
          icon:'loading',
          duration:3000
        })

        this.setData({hasShowBookId:[],state:0,allData:[], pageCategory:-1})
    
        var tempState = new Array()
        var tempStateup = [0,0,0,0]
        for (var i=0; i<18; i++) tempState[i]=0
        this.setData({allstate:tempState,stateup:tempStateup, stackInfo: app.globalData.nowStackPage})
    
        //第一次加载数据
        var firstBatchBooks = await this.getBooks(this.data.oneBatch)
        var tempAllData = this.data.allData
        tempAllData = tempAllData.concat(firstBatchBooks)
        this.setData({allData:tempAllData})

        this.setData({isAdding:false,isDown:false})

        //搜索完成
        wx.showToast({
          title: '搜索完成',
          icon:'success',
          duration: 2000
        })
      }
    },


    //跳转到搜索页面
    toInfo: async function(){
      wx.navigateTo({
        url: '../stackInfo/stackInfo',
      })
    }
})