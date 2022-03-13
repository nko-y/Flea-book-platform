// pages/myBookShelf/myBookShelf.js
var app = getApp()
var db = wx.cloud.database()
const cd = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //所有的数据
    allData:[],
    //一次获得多少数据
    oneBatch: 4,
    //已经显示的数据
    hasShowId:[],

    isLoading: true,
    isAdding: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({isLoading: true, isAdding: false})
    await this.getRecords(this.data.oneBatch)
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
  onReachBottom: async function () {
    if(this.data.isAdding == true) return
    this.setData({isAdding: true})
    wx.showToast({
      title: '加载中',
      icon:'loading',
      duration:2000
    })

    var allCount = await this.getRecords(this.data.oneBatch)
    if(allCount==0){
      wx.showToast({
        title: '没有更多啦',
        icon:'none',
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    wx.showToast({
      title: '加载成功',
      icon:'success',
      duration:2000
    })
    this.setData({isAdding: false})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //获得指定数量的数据
  getRecords: async function(num){
    //获取所有记录
    var allCollection = await this.getAllBook(this.data.oneBatch)
    if(allCollection.data.length==0) return 0

    var allBookId = []
    var temphasShown = this.data.hasShowId
    //获得所有的书本记录
    for(let i=0; i<allCollection.data.length; i++){
      allBookId.push(allCollection.data[i].collection_bookId)
      temphasShown.push(allCollection.data[i].collection_bookId)
    }
    this.setData({hasShowId: temphasShown})
    var allBook = await this.getAllBookInfo(allBookId)

    //获得完整的信息
    var allEntireMessage = await this.getAllEntire(allBook.data)
    //最后还需要把照片补齐
    var finAll = await this.addPicSrc(allEntireMessage)
    
    //最后补到data上去
    var tempAllData = this.data.allData
    for(let i=0; i<finAll.length; i++){
      tempAllData.push(finAll[i])
    }

    //最后的最后还要补上该记录的_id 
    for(let i=0; i<tempAllData.length; i++){
      for(let j=0; j<allCollection.data.length; j++){
        if(allCollection.data[j].collection_bookId==tempAllData[i]._id){
          tempAllData[i].collId = allCollection.data[j]._id
          break
        }
      }
    }
    this.setData({
      allData: tempAllData
    })
    //返回的是这次获得书的数量
    return finAll.length
  },

  //补齐照片
  addPicSrc: async function(theData){
    for(let i=0; i<theData.length; i++){
      let tempPath = await wx.cloud.downloadFile({fileID:theData[i].book_img[0]})
      theData[i].book_imgPath = tempPath.tempFilePath
    }
    return theData
  },

  //获取所有书本的完整信息
  getAllEntire: async function(allPartBook){
    //首先获取每个人的信息
    var personEntire = await wx.cloud.callFunction({name:'getAllInfo',data:{fromData: allPartBook}})
    personEntire = personEntire.result.toData
    
    //然后获取每个书库的信息
    var bookStackInfo = []
    for(let i=0; i<personEntire.length; i++){
      if(personEntire[i].book_bookStackId!=""){
        let judge = -1
        //首先在已有的里面寻找
        for(let j=0; j<bookStackInfo.length; j++){
          if(bookStackInfo[j]._id == personEntire[i].book_bookStackId){
            judge = j;
            break;
          }
        }
        //如果找到了
        if(judge!=-1){
          personEntire[i].theStackInfo = bookStackInfo[judge]
        }
        else{
          //没找到的话就需要到数据库里面查找
          let tempStackInfo = await db.collection('bookStack').doc(personEntire[i].book_bookStackId).get()
          tempStackInfo = tempStackInfo.data
          let picPath = await wx.cloud.downloadFile({fileID: tempStackInfo.bookStack_img})
          tempStackInfo.bookStack_showImg = picPath.tempFilePath
          bookStackInfo.push(tempStackInfo)
          personEntire[i].theStackInfo = tempStackInfo
        }
      }
    }
    return personEntire
  },

  //然后获得所有书的信息
  getAllBookInfo: async function(allId){
    const MAX_LIMIT = 10
    const total = allId.length
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    let state = [1,-1]
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('book').where({_id: cd.in(allId), book_state:cd.in(state)}).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  },
  
  //首先获取所有的书本
  getAllBook: async function(num){
    var that = this
    return db.collection('collection').where({
      collection_userId: app.globalData.userDocId,
      collection_bookId: cd.nin(that.data.hasShowId)
    }).limit(num).get()
  },

  


  //删除这个Item
  deleteObject: async function(e){
    var that = this
    var deleteData = e.detail
    if(this.data.isAdding==true) return
    wx.showModal({
      title:'提示',
      content:'确认移出书架?',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '移出中',
            icon:'loading',
            duration: 2000
          })
          that.setData({isAdding: true})
          that.deOb(deleteData)
        }
      }
    })
  },

  //真正删除数据的函数
  deOb: async function(deleteData){
    var that = this
    that.setData({isAdding: false})
    await db.collection('collection').doc(deleteData.collId).remove()
    //将该数据从data中移出
    var tempData = this.data.allData
    var temphasShow = this.data.hasShowId
    for(let i=0; i<tempData.length; i++){
      if(tempData[i].collId == deleteData.collId){
        tempData.splice(i,1)
      }
    }
    for(let i=0; i<temphasShow.length; i++){
      if(temphasShow[i] == deleteData._id){
        temphasShow.splice(i,1)
      }
    }
    this.setData({
      allData: tempData,
      hasShowId: temphasShow,
      isAdding: false
    })

    await that.getRecords(1)
    wx.showToast({
      title: '移除成功',
      icon:'success',
      duration:2000
    })
  }
})