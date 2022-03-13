// pages/confirmOrder/confirmOrder.js
var app = getApp();
var db = wx.cloud.database()
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource:{},
    number:1,
    isInfoGet:false,
    isSending: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //确保获取指定页面数据
    this.setData({
      number:app.globalData.myOrderNumber,
      dataSource: app.globalData.myOrderBook
    });
    this.setData({
      isInfoGet:false
    })
  },

  //戳-，数量减少
  minus: function () {
    if (this.data.number !== 1) {
      this.setData({
        number: this.data.number - 1
      });
    } else {
      wx.showToast({
        title: '不可以再减少啦！',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //戳+，数量增加
  plus: function () {
    if ((this.data.number + 1) <= this.data.dataSource.book_num) {
      this.setData({
        number: this.data.number + 1
      });
    } else {
      wx.showToast({
        title: '已经超过卖家限定数量啦！',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //跳转至添加联系方式页面
  addContact:function(){
    wx.navigateTo({ url: `../personInformation/personInformation?fromWhere=${"orderPage"}`});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if(app.globalData.tempConfirm==true){
      if(app.globalData.temp_user_wechat!="" || app.globalData.temp_user_QQ!="" || app.globalData.temp_user_email!="")
        this.setData({
          isInfoGet: true
        })
      else{this.setData({isInfoGet:false})}  
    }
    else{
      this.setData({isInfoGet:false})
    }
    this.setData({isSending:false})
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

  //点击确认联系以后发送邮件
  submit: async function(){
    if(this.data.isSending) return
    var that = this
    //首先检查信息是否完备
    if(!this.data.isInfoGet){
      wx.showToast({
        title: '请确认您的联系信息，确保填入一种联系方式',
        icon:'none',
        duration:2000
      })
    }
    else{
      //然后检查该本书籍是否还处于借阅状态
      db.collection("book").doc(that.data.dataSource._id).get().then(res => {
        if(res.data.book_state==0){
          //该书已经交易
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
          //该书已共享
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
          //该书处于可以交易的状态
          wx.showModal({
            title:"提示",
            content:"确认发送邮件联系对方？",
            success: function(res){
              if (res.confirm){
                //如果点击了确认
                wx.showToast({
                  title: '发送中……',
                  icon:'none',
                  duration:2000
                })
                //开始创建
                that.setData({isSending:true})
                //判断是否是发送给书库的
                var judgeStack = true
                if(that.data.dataSource.book_bookStackId=="") judgeStack=false
                //得到发送的touserId
                var toId = that.data.dataSource.book_createUserId
                if(judgeStack==true){
                  toId = that.data.dataSource.book_bookStackId
                }
                //获取时间
                var finTime = util.formatDate(new Date());
                var findetailTime = util.formatDetail(new Date());
                db.collection("email").add({
                  data:{
                    email_fromUserId: app.globalData.userDocId,
                    email_fromTime: finTime,
                    email_detailTime: findetailTime,
                    email_toUserId: toId,
                    email_bookId: that.data.dataSource._id,
                    email_content: app.globalData.temp_user_notes,
                    email_fromQQ: app.globalData.temp_user_QQ,
                    email_fromwechat: app.globalData.temp_user_wechat,
                    email_fromemail: app.globalData.temp_user_email,
                    email_fromaddress: app.globalData.temp_user_address,
                    email_reading: false,
                    email_allNumber: app.globalData.myOrderNumber,
                    email_judgeStack: judgeStack
                  },
                  success: function(res){
                    //插入成功以后跳回
                    that.setData({isSending:false})
                    app.globalData.isShowSendingEmail = true
                    wx.navigateBack({
                    })
                  }
                })
              }
            }
          })
        }
        else{
          //该书被删除
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
    }
  }
})