// miniprogram/pages/shareMember/shareMember.js
var db = wx.cloud.database()
var cd = db.command
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    waiting: true,

    pass:[],
    passId:[],
    wait:[],
    waitId:[],
    nowpass: -1,
    nowwait: -1,

    nowpassShow:[],
    nowwaitShow:[],

    //代指显示哪一个
    now: [],

    //用于表示正在切换
    isAdding: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      pass:[],
      wait:[],
      passId:[],
      waitId:[],
      nowpass: -1,
      nowwait: -1,
      nowpassShow:[],
      nowwaitShow:[],

      isAdding: false
    })
    
    await this.getNextWait()
    await this.getNextPass()
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

  //成员筛选页面的切换
  chooseFalse: function () {
    if(this.data.isAdding==true) return
    this.setData({ waiting: false });
  },

  chooseWaiting: function () {
    if(this.data.isAdding==true) return
    this.setData({ waiting: true });
  },


  //获得上一位通过成员数据
  getLastPass: async function(){
    if(this.data.isAdding==true) return
    if(this.data.nowpass==0){
      wx.showToast({
        title: '没有更多啦',
        icon: "none",
        duration: 2000
      })
      return
    }
    let tempnowpass = this.data.nowpass - 1
    let tempnowpassShow = this.data.pass[tempnowpass]
    this.setData({
      nowpass: tempnowpass,
      nowpassShow: tempnowpassShow
    })
  },

  //获得下一位通过的成员数据
  getNextPass: async function(){
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})

    if(this.data.nowpass!=this.data.pass.length-1){
      let tempId = this.data.nowpass + 1;
      let tempShow = this.data.pass[tempId]
      this.setData({
        nowpass: tempId,
        nowpassShow: tempShow,
        isAdding: false
      })
      return
    }

    var one = await this.getOnePass()
    //如果已经没有更多了
    if(one.length==0){
      if(this.data.pass.length==0){
        this.setData({isAdding: false})
        return
      }
      wx.showToast({
        title: '没有更多啦',
        icon: "none",
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    //如果还有更多
    let temppass = this.data.pass
    let temppassId = this.data.passId
    temppass.push(one[0])
    temppassId.push(one[0].applyStackManage_userNameId)
    let tempnowpass = this.data.nowpass + 1
    let tempnowpassShow = temppass[tempnowpass]
    this.setData({
      pass: temppass,
      passId: temppassId,
      nowpass: tempnowpass,
      nowpassShow: tempnowpassShow
    })

    this.setData({isAdding: false})
  },


  //获得下一位未审核成员数据
  getNextWait: async function(){
    if(this.data.isAdding==true) return
    this.setData({isAdding: true})

    if(this.data.nowwait!=this.data.wait.length-1){
      let tempId = this.data.nowwait + 1;
      let tempShow = this.data.wait[tempId]
      this.setData({
        nowwait: tempId,
        nowwaitShow: tempShow,
        isAdding: false
      })
      return
    }

    var one = await this.getOneWait()
    //如果已经没有更多了
    if(one.length==0){
      if(this.data.wait.length==0){
        this.setData({isAdding: false})
        return
      }
      wx.showToast({
        title: '没有更多啦',
        icon: "none",
        duration: 2000
      })
      this.setData({isAdding: false})
      return
    }
    //如果还有更多
    let tempwait = this.data.wait
    let tempwaitId = this.data.waitId
    tempwait.push(one[0])
    tempwaitId.push(one[0].applyStackManage_userNameId)
    let tempnowwait = this.data.nowwait + 1
    let tempnowwaitShow = tempwait[tempnowwait]
    this.setData({
      wait: tempwait,
      waitId: tempwaitId,
      nowwait: tempnowwait,
      nowwaitShow: tempnowwaitShow
    })

    this.setData({isAdding: false})
  },

  //获得上一位未审核成员数据
  getLastWait: async function(){
    if(this.data.isAdding==true) return
    if(this.data.nowwait==0){
      wx.showToast({
        title: '没有更多啦',
        icon: "none",
        duration: 2000
      })
      return
    }
    let tempnowwait = this.data.nowwait - 1
    let tempnowwaitShow = this.data.wait[tempnowwait]
    this.setData({
      nowwait: tempnowwait,
      nowwaitShow: tempnowwaitShow
    })
  },


  //获得已审核成员的数据
  getOnePass: async function(){
    var that = this
    var onePerson = await db.collection('applyStackManage').where({
      applyStackManage_bookStackId: app.globalData.userBookStackId,
      applyStackManage_userNameId: cd.nin(that.data.passId),
      applyStackManage_state: 1
    }).orderBy("applyStackManage_time","asc").orderBy("applyStackManage_detailTime","asc").limit(1).get()
    return onePerson.data
  },

  //获得未审核成员的数据
  getOneWait: async function(){
    var that = this
    var onePerson = await db.collection('applyStackManage').where({
      applyStackManage_bookStackId: app.globalData.userBookStackId,
      applyStackManage_userNameId: cd.nin(that.data.waitId),
      applyStackManage_state: 0
    }).orderBy("applyStackManage_time","desc").orderBy("applyStackManage_detailTime","desc").limit(1).get()
    return onePerson.data
  },




  //审核通过
  okOne: async function(){
    if(this.data.isAdding==true) return
    this.setData({
      isAdding: true
    })
    var that = this
    wx.showModal({
      title: '提示',
      content:'确认通过该项审核',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title:'更新中',
            icon:'loading',
            duration: 2000
          })
          console.log('通过')
          that.ok()
        }
        else{
          console.log('取消')
          that.setData({
            isAdding: false
          })
        }
      }
    })
  },

  //审核通过具体操作函数
  ok: async function(){
    var that = this
    //记录下更新所需要的数据
    var tu = that.data.nowwaitShow.applyStackManage_userNameId
    var ts = app.globalData.userBookStackId
    var reId = this.data.nowwaitShow._id
    //然后将该用户删除
    await this.deletenowWaiting()
    //首先将该用户更新为审核成功
    await db.collection('applyStackManage').doc(reId).update({
      data:{
        applyStackManage_state: 1
      }
    })
    //然后把该用户的bookStackId更换为这个书库的Id
    wx.cloud.callFunction({
      name: 'renewStackId',
      data:{
        userId: tu,
        stackId: ts
      }
    })
    this.setData({isAdding: false})
    await this.getNextWait()
    await this.getNextPass()
    wx.showToast({
      title: '更新完成',
      icon:'success',
      duration:2000
    })
  },


  //审核不通过
  disokOne: async function(){
    if(this.data.isAdding==true) return
    this.setData({
      isAdding: true
    })
    var that = this
    wx.showModal({
      title:'提示',
      content:'确认不通过该项审核',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '更新中',
            icon:'loading',
            duration: 2000
          })
          console.log('不通过')
          that.disOk()
        }
        else{
          console.log('取消')
          that.setData({
            isAdding: false
          })
        }
      }
    })
  },

  //审核不通过实际操作函数
  disOk: async function(){
    var that = this
    //记录下该用户的id
    var reId = this.data.nowwaitShow._id
    //然后将该用户删除
    await this.deletenowWaiting()
    //首先将该用户更新为审核失败
    await db.collection('applyStackManage').doc(reId).update({
      data:{
        applyStackManage_state: -1
      }
    })
    this.setData({isAdding: false})
    await this.getNextWait()
    wx.showToast({
      title: '更新完成',
      icon:'success',
      duration:2000
    })
  },

  //删除现在待审核的用户
  deletenowWaiting: async function(){
    var tempWait = this.data.wait
    var tempWaitId = this.data.waitId
    var tempnowWait = this.data.nowwait
    var tempnowWaitShow = this.data.nowwaitShow

    if(tempWait.length==1){
      //如果只有这一个人
      tempWait = []
      tempWaitId = []
      tempnowWait = -1
      tempnowWaitShow = []
    }
    else{
      //如果有大于等于两个人
      if(tempnowWait==tempWait.length-1){
        //如果现在这个人是最后一个人
        tempnowWaitShow = tempWait[tempnowWait-1]
        tempWait.splice(tempnowWait,1)
        tempWaitId.splice(tempnowWait,1)
        tempnowWait = tempnowWait - 1;
      }
      else{
        //其他情况
        tempnowWaitShow = tempWait[tempnowWait+1]
        tempWait.splice(tempnowWait,1)
        tempWaitId.splice(tempnowWait,1)
        tempnowWait = 0;
      }
    }
    this.setData({
      wait: tempWait,
      waitId: tempWaitId,
      nowwait: tempnowWait,
      nowwaitShow: tempnowWaitShow
    })
  }
})