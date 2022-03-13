// pages/myReleases/myReleases.js
var app = getApp()
var db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    waiting:true,

    allData:[],
    trade:[],
    untrade:[],
    tradeMax:0,
    untradeMax:0,
    lastTradeIndex:0,
    lastUntradeIndex:0,
    oneBatch:4,
    
    whichComponent: -1,
    isOperating: false      //代表现在是否在进行某项操作
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  setIndex:function(e){
    this.setData({whichComponent:e.currentTarget.dataset.index})
  },

  update: async function(e){
    var tempData = this.data.allData
    var index = this.data.whichComponent
    tempData.splice(index,1)
    var arr = new Array(1)
    arr[0] = e.detail
    arr = arr.concat(tempData)
    this.setData({allData:arr});
    //接下来修改交易数组等的数据
    if(e.detail.book_state==1){
      //改成了未交易
      //首先找到这个在已交易中属于哪个位置
      var tempTrade = this.data.trade
      for(let i=0; i<this.data.lastTradeIndex; i++){
        if(e.detail._id==tempTrade[i]._id){
          tempTrade.splice(i,1)
          break
        }
      }
      //更改已交易的max和index
      var tempMax = this.data.tradeMax - 1
      var tempIndex = this.data.lastTradeIndex - 1
      this.setData({tradeMax:tempMax, lastTradeIndex:tempIndex, trade:tempTrade})

      //然后更改未交易
      tempMax = this.data.untradeMax + 1
      tempIndex = this.data.lastUntradeIndex + 1
      var oneArr = [e.detail].concat(this.data.untrade)
      this.setData({untradeMax:tempMax, lastUntradeIndex:tempIndex, untrade:oneArr})
    }
    else{
      //改成了已交易
      var tempUnTrade =  this.data.untrade
      for(let i=0; i<this.data.lastUntradeIndex; i++){
        if(e.detail._id == tempUnTrade[i]._id){
          tempUnTrade.splice(i,1)
          break
        }
      }
      var tempMax = this.data.untradeMax - 1
      var tempIndex = this.data.lastUntradeIndex - 1
      this.setData({untradeMax:tempMax, lastUntradeIndex:tempIndex, untrade: tempUnTrade})

      tempMax = this.data.tradeMax + 1
      tempIndex = this.data.lastTradeIndex + 1
      var oneArr = [e.detail].concat(this.data.trade)
      this.setData({tradeMax:tempMax, lastTradeIndex:tempIndex, trade:oneArr})
    }
    await this.renewOneRecord()
    this.endOperation()
  },

  deleteOB: async function(e){
    //获取index
    var tempData = this.data.allData
    var index = this.data.whichComponent
    //更新分数组和max
    if(tempData[index].book_state==1){
      var tempuntrade = this.data.untrade
      var tempLen = tempuntrade.length
      var tempMax = this.data.untradeMax - 1
      var templastUnTradeIndex = this.data.lastUntradeIndex
      for(let i=0;i<tempLen;i++){
        if(tempuntrade[i]._id == e.detail._id){
          tempuntrade.splice(i,1)
          this.setData({untrade:tempuntrade, untradeMax:tempMax, lastUntradeIndex:templastUnTradeIndex-1})
          break
        }
      }
    }
    else{
      var temptrade = this.data.trade
      var tempLen = temptrade.length
      var tempMax = this.data.tradeMax - 1
      var templastTradeIndex = this.data.lastTradeIndex
      for(let i=0;i<tempLen;i++){
        if(temptrade[i]._id==e.detail._id){
          temptrade.splice(i,1)
          this.setData({trade:temptrade, tradeMax:tempMax, lastTradeIndex:templastTradeIndex-1})
          break
        }
      }
    }
    tempData.splice(index,1)
    this.setData({allData:tempData})
    console.log(this.data)
    await this.renewOneRecord(e.detail._id)
    this.endOperation()
  },

  renewOneRecord: async function(){
    var that =  this
    var tempData = []
    if(this.data.waiting){
      if(this.data.lastUntradeIndex<this.data.untradeMax){
        wx.showNavigationBarLoading()
        var newuntradeBooks = await that.getReleaseuntradeBooks(this.data.lastUntradeIndex,1)
        var nowLastuntradeIndex = this.data.lastUntradeIndex + newuntradeBooks.data.length
        var nowUntrade = this.data.untrade.concat(newuntradeBooks.data)
        var changeTempData = await this.replaceAll(newuntradeBooks.data)
        tempData = this.data.allData.concat(changeTempData)
        this.setData({lastUntradeIndex:nowLastuntradeIndex, untrade:nowUntrade, allData:tempData})
        wx.hideNavigationBarLoading()
      }
    }
    else{
      if(this.data.lastTradeIndex<this.data.tradeMax){
        wx.showNavigationBarLoading()
        var newtradeBooks = await that.getReleasetradeBooks(this.data.lastTradeIndex,1)
        var nowLasttradeIndex = this.data.lastTradeIndex + newtradeBooks.data.length
        var nowtrade = this.data.trade.concat(newtradeBooks.data)
        var changeTempData = await this.replaceAll(newtradeBooks.data)
        tempData = this.data.allData.concat(changeTempData)
        this.setData({lastTradeIndex:nowLasttradeIndex,trade:nowtrade, allData:tempData})
        wx.hideNavigationBarLoading()
      }
    }
    wx.showToast({
      title: '更新成功！',
      icon: 'success',
      duration: 2000
    })
  },

  chooseSuccess:function(){
    this.setData({waiting:false});
  },

  chooseWaiting:function(){
    this.setData({waiting:true});
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
    this.setData({
      isLoading:true,
      whichComponent:-1
    })
    await this.initTheReleasePage()
    this.setData({
      isLoading:false,
      isOperating: false
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
  onReachBottom: async function () {
    var that = this
    var tempData = []
    if(this.data.isOperating) return    //如果在执行某项操作那么直接返回
    this.setData({isOperating:true})
    if(this.data.waiting){
      //代表待交易界面
      if(this.data.lastUntradeIndex>=this.data.untradeMax){
        //如果已经将所有的书本都显示了
        wx.showToast({
          title: '已经没有更多啦',
          duration: 2000,
          icon:"none"
        })
      }
      else{
        //如果还有未显示的书籍
        wx.showNavigationBarLoading()
        wx.showToast({
          title: '加载中......',
          duration:2000,
          icon:"none"
        })
        var newuntradeBooks = await that.getReleaseuntradeBooks(this.data.lastUntradeIndex,this.data.oneBatch)
        var nowLastuntradeIndex = this.data.lastUntradeIndex + newuntradeBooks.data.length
        var nowUntrade = this.data.untrade.concat(newuntradeBooks.data)
        var changeTempData = await this.replaceAll(newuntradeBooks.data)
        tempData = this.data.allData.concat(changeTempData)
        this.setData({lastUntradeIndex:nowLastuntradeIndex, untrade:nowUntrade, allData:tempData})
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    else{
      //代表已交易界面
      if(this.data.lastTradeIndex>=this.data.tradeMax){
        //如果已经将所有书本显示
        wx.showToast({
          title: '已经没有更多啦',
          duration: 2000,
          icon:"none"
        })
      }
      else{
        //如果还有未显示的书本
        wx.showNavigationBarLoading()
        wx.showToast({
          title: '加载中......',
          duration:2000,
          icon:"none"
        })
        var newtradeBooks = await that.getReleasetradeBooks(this.data.lastTradeIndex,this.data.oneBatch)
        var nowLasttradeIndex = this.data.lastTradeIndex + newtradeBooks.data.length
        var nowtrade = this.data.trade.concat(newtradeBooks.data)
        var changeTempData = await this.replaceAll(newtradeBooks.data)
        tempData = this.data.allData.concat(changeTempData)
        this.setData({lastTradeIndex:nowLasttradeIndex,trade:nowtrade, allData:tempData})
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    this.setData({isOperating:false})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //初始化页面信息
  initTheReleasePage:async function(){
    //首先获得交易与未交易的书本的最大值
    var that = this
    var tempunTradeMax = await db.collection("book").where({book_createUserId:app.globalData.userDocId,
     book_state: 1
    }).count()
    var tempTradeMax = await db.collection("book").where({book_createUserId:app.globalData.userDocId,
      book_state: 0
     }).count()
    this.setData({tradeMax:tempTradeMax.total, untradeMax:tempunTradeMax.total})
    //然后根据batch获取未交易的前几本书
    var res = await this.getReleaseuntradeBooks(0,that.data.oneBatch)
    var nowLastuntradeIndex = res.data.length
    this.setData({lastUntradeIndex:nowLastuntradeIndex, untrade:res.data})
    //最后根据batch获取已经交易的前几本书
    var resT = await this.getReleasetradeBooks(0,that.data.oneBatch)
    var nowLasttradeIndex = resT.data.length
    this.setData({lastTradeIndex:nowLasttradeIndex, trade:resT.data})
    var tempAll = await this.replaceAll(res.data)
    var temppart = await this.replaceAll(resT.data)
    tempAll = tempAll.concat(temppart)
    this.setData({allData:tempAll})
  },
  
  //获取用户未交易书籍的信息
  getReleaseuntradeBooks: async function(start,batch){
    var fin = batch
    var numLast = this.data.untradeMax - start
    if(fin>numLast) fin = numLast
    return db.collection("book").where({
      book_createUserId:app.globalData.userDocId,
      book_state: 1
    }).orderBy('book_detailTime','desc').skip(start).limit(fin).get()
  },
  //获取用户已交易书籍的信息
  getReleasetradeBooks: async function(start, batch){
    var fin = batch
    var numLast = this.data.tradeMax - start
    if(fin>numLast) fin = numLast
    return db.collection("book").where({
      book_createUserId:app.globalData.userDocId,
      book_state: 0
    }).orderBy('book_detailTime','desc').skip(start).limit(fin).orderBy('book_createTime','desc').get()
  },

  //替换掉原来图片的链接
  replaceAll: async function(inputData){
    for(let i=0; i<inputData.length; i++){
      var ori = []
      for(let j=0; j<inputData[i].book_img.length; j++){
        var tempOnePath = await this.downloadAllFile(inputData[i].book_img[j])
        ori.push(inputData[i].book_img[j])
        inputData[i].book_img[j] = tempOnePath.tempFilePath
      }
      inputData[i].ori = ori
    }
    return inputData
  },

  //下载图片
  downloadAllFile: async function(path){
    return wx.cloud.downloadFile({
      fileID: path
    })
  },

  //表示开始某项操作
  startOperation: function(){
    console.log("开始操作")
    this.setData({isOperating:true})
  },
  //表示结束某项操作
  endOperation: function(){
    console.log("结束操作")
    this.setData({isOperating:false})
  },

})