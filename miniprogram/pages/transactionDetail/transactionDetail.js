// pages/transactionDetail/transactionDetail.js
var app=getApp();
var db = wx.cloud.database()
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource:[],
    current: 0,
    currentDataSource:{},
    number:1,
    isLoading: true,
    showSource:[],
    isAdding: false,

    //是否授权登录
    isRegister: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    //首先载入数据
    this.setData({
      dataSource: app.globalData.detailInfo,
      currentDataSource: app.globalData.nowItemForDetailInfo,
      number: 1,
      isLoading:true,
      showSource:[],
      isRegister: app.globalData.hasRegister
    })
    //最后需要根据这个获取用户(或者书库)的基本信息
    var tempShowSource = await this.getAllDetail()
    this.setData({showSource:tempShowSource.result.toData})
    
    //获得共享书库的基本信息
    await this.getStackInfo()

    //然后确定应该显示哪个页面
    for(let i=0; i<this.data.showSource.length; i++){
      if(this.data.showSource[i]._id == this.data.currentDataSource._id){
        this.setData({current:i})
        this.setData({currentDataSource:this.data.showSource[i]})
        break;
      }
    }
    //将当前页面的浏览量+1
    await this.addOneBrowser()

    if(this.data.isRegister){
      //将该书加入浏览记录
      await this.addToHistory()
      //判断是否要删除多余的浏览记录
      await this.deleteHistory()
    }
    this.setData({isLoading:false})
  },

  //将当前页面的浏览量+1
  addOneBrowser: async function(){
    var cd = db.command
    db.collection("book").doc(this.data.currentDataSource._id).update({
      data:{
        book_allBrowse: cd.inc(1)
      }
    })
  },

  //将某本书加入浏览记录
  addToHistory: async function(){
    var that = this
    var finTime = util.formatDate(new Date());
    var findetailTime = util.formatDetail(new Date());
    db.collection("browse").add({
      data:{
        browse_userId: app.globalData.userDocId,
        browse_bookId: that.data.currentDataSource._id,
        browse_date: finTime,
        browse_detailTime: findetailTime
      }
    })
  },

  //判断是否要删除最后一条记录
  deleteHistory: async function(){
    //首先判断是否超过了浏览记录
    const countResult = await db.collection('browse').where({
      browse_userId: app.globalData.userDocId
    }).count()
    if(countResult.total>20){
      //如果大于了20条,就删除最后一条
      await db.collection('browse').orderBy('browse_date','asc').orderBy('browse_detailTime','asc').limit(1).get().then(res => {
        console.log(res.data[0]._id)
        db.collection('browse').doc(res.data[0]._id).remove().then(res=>{
        })
      })
    }
  },

  //首先取出要显示的data
  cutOffData: async function(){
    //首先得出该页面是第几个
    var i;
    for(i=0;i<this.data.dataSource.length;i++){
      if(this.data.dataSource[i]._id == this.data.currentDataSource._id) break
    }
    var min = i-4
    if(min<0) min=0
    var max = i+4
    if(max>this.data.dataSource.length-1) max=this.data.dataSource.length-1
    var tempSourceData = []
    for(let j=min; j<=max; j++){
      tempSourceData.push(this.data.dataSource[j])
    }
    return tempSourceData
  },

  //用于获取用户的数据
  getAllDetail: async function(){
    var that = this
    var temp = await this.cutOffData()
    return wx.cloud.callFunction({
      name:'getAllInfo',
      data: {
        fromData: temp
      }
    })
  },

  //用于获取书库的信息
  getStackInfo: async function(){
    var tempForStack = this.data.showSource
    var writeDownData=[]
    for(let i=0; i<tempForStack.length; i++){
      if(tempForStack[i].book_bookStackId!="" && (typeof tempForStack[i].hasTheBookStackInfo == 'undefined')){
        //首先寻找是否已经获取过了
        let judge = -1
        for(let j=0; j<writeDownData.length; j++){
          if(writeDownData[j]._id==tempForStack[i].book_bookStackId){
            judge = j;
            break;
          }
        }
        //如果已经获取过了
        if(judge!=-1){
          tempForStack[i].theBookStackInfo = writeDownData[judge]
        }
        //如果没有获取过
        else{
          let tempStackInfo = await db.collection('bookStack').doc(tempForStack[i].book_bookStackId).get()
          tempStackInfo = tempStackInfo.data
          let picPath = await wx.cloud.downloadFile({fileID: tempStackInfo.bookStack_img})
          tempStackInfo.bookStack_showImg = picPath.tempFilePath
          writeDownData.push(tempStackInfo)
          tempForStack[i].theBookStackInfo = tempStackInfo
          tempForStack[i].hasTheBookStackInfo = true
        }
      }
      else if(tempForStack[i].book_bookStackId!=""){
        tempForStack[i].hasTheBookStackInfo = false
      }
    }
    this.setData({showSource: tempForStack})
  },

  //戳-，数量减少
  minus:function(){
    if (this.data.number !== 1){
    this.setData({
      number:this.data.number - 1
    });
    }else{
       wx.showToast({
         title:'不可以再减少啦！',
         icon:'none',
         duration:2000
       })
    }
    
  },
  
  //戳+，数量增加
  plus:function(){
    if ((this.data.number + 1) <= this.data.currentDataSource.book_num){
     this.setData({
       number:this.data.number + 1
     });
    }else{
      wx.showToast({
        title:'已经超过卖家限定数量啦！',
        icon:'none',
        duration:2000
      })
    }
    
  },

  // updateCurrent,捕捉卡片变化并且获取当前current值
  updateCurrent(e) {
    if(e.detail.source!="touch") return
    var tempCurr = e.detail.current
    this.setData({
      currentDataSource: this.data.showSource[tempCurr],
      current:tempCurr,
      number:1
    })
  },

  //点击我显示底部弹出框
  clickme: function () {
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启联系功能'
      })
      return
    }
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
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
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
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  //点击书架，跳转至我的书架
  toMyBookShelf:function(e){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启书架功能'
      })
      return
    }
    wx.navigateTo({ url: `../myBookShelf/myBookShelf` }); 
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
    if(app.globalData.isShowSendingEmail){
      wx.showToast({
        title: '发送申请成功',
        icon:'success',
        duration:2000
      })
    }
    app.globalData.isShowSendingEmail = false
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

  },

  //用于提交并跳转到后一页的函数
  submit: function(){
    if(this.data.currentDataSource.book_createUserId == app.globalData.userDocId && this.data.currentDataSource.book_bookStackId==""){
      wx.showToast({
        title: '不能借阅/交易自己创建的图书',
        icon:"none",
        duration:2000
      })
      return
    }
    db.collection("book").doc(this.data.currentDataSource._id).get().then(res => {
      if(res.data.book_state==0){
        //刚刚被置为已交易状态
        wx.showToast({
          title: '此书已于刚刚被置为已交易状态',
          icon:'none',
          duration:2000
        }).then(res => {
          wx.navigateBack({
          })
        })
      }
      else if(res.data.book_state==-2){
        //刚刚被置为已共享状态
        wx.showToast({
          title: '此书已于刚刚被置为已共享状态',
          icon:'none',
          duration:2000
        }).then(res => {
          wx.navigateBack({
          })
        })
      }
      else if(res.data.book_state==1 || res.data.book_state==-1){
        //处于可以交易的状态
        app.globalData.myOrderBook = this.data.currentDataSource
        app.globalData.myOrderNumber = this.data.number
        wx.navigateTo({
          url: '../../pages/confirmOrder/confirmOrder',
        })
      }
      else{
        //刚刚被删除
        wx.showToast({
          title: '此书已于刚刚被发布者删除',
          icon:'none',
          duration:2000
        }).then(res => {
          wx.navigateBack({
          })
        })
      }
    })
  },

  //用于加入书架
  addToBookShelf: async function(){
    if(this.data.isRegister==false){
      //代表还未认证
      wx.showModal({
        title:'提示',
        content:'授权登录后开启书架功能'
      })
      return
    }

    if(this.data.isAdding) return
    var that = this
    wx.showModal({
      title:'提示',
      content:'确认将此书加入书架',
      success: function(res){
        if(res.confirm){
          //如果确认加入
          wx.showToast({
            title: '加入中...',
            icon:'loading',
            duration:2000
          })
          //其他操作暂停
          that.setData({
            isAdding: true
          })
          //加入书架
          //首先判断该书是否已经在里面了
          db.collection('collection').where({
            collection_userId: app.globalData.userDocId,
            collection_bookId: that.data.currentDataSource._id
          }).get({
            success:function(res){
              if(res.data.length>0){
                //已经创建了
                wx.showToast({
                  title: '该书已位于您的书架',
                  icon: 'none',
                  duration: 2000
                })
                that.setData({isAdding:false})
              }
              else{
                //如果还没有创建
                db.collection('collection').add({
                  data:{
                    collection_userId: app.globalData.userDocId,
                    collection_bookId: that.data.currentDataSource._id
                  },
                  success: function(res){
                    wx.showToast({
                      title: '加入书架成功',
                      icon:'success',
                      duration:2000
                    })
                    that.setData({isAdding:false})
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})