//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    url: "",
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    datas: null,
    pos: 0,
    num: 10,
    nickName: "",
    isEnd: false,
    isAdmin: false,
    msgList: null,
    searchText: "",
    isSearch: false,
    noneSearch: "search",
    today: " ",
    lunarDay: " ",
    showModalStatus: false,
    dates: "",
    postValue: {},
  },
  onLoad: function(e) {
    var date = new Date();
    var todays = util.dataFormat("yyyy年MM月dd日", date);
    var lunarDays = util.getLunarDay(date);
    var that = this;
    console.log(e.title)
    this.setData({
      lunarDay: lunarDays,
      dates: util.dataFormat("yyyy-MM-dd", date),
      today: todays,
      msgList: [{
          url: "",
          title: "你完了，我又要喜欢你了!"
        },
        // {
        //   url: "/",
        //   title: "1你完了，我又要喜欢你了!"
        // },
      ],
      url: `${config.service.memorial}` + "?",
    });
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    wx.request({
      url: this.data.url,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        that.setData({
          datas: res.data.datas
        });
        if (res.data.datas.length < 10) {
          that.setData({
            isEnd: true
          })
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  onPullDownRefresh: function(res) {
    var that = this;
    this.setData({
      isSearch: false,
      noneSearch: "search",
      searchText: "",
      pos: 0,
      isEnd: false,
      url: `${config.service.memorial}` + '?',
    })
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: this.data.url,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        that.setData({
          datas: res.data.datas
        });
      },
      complete() {
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh();
  },
  onReachBottom: function(res) {
    if (this.data.isEnd == true) {
      wx.showToast({
        title: '已经没有了...',
      })
      return;
    }
    this.setData({
      pos: this.data.pos + 10
    })
    var that = this;
    var tmp = this.data.datas;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: this.data.url + "&pos=" + this.data.pos + "&num=" + this.data.num,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data.datas.length < 10) {
          that.setData({
            isEnd: true
          })
        }
        that.setData({
          datas: tmp.concat(res.data.datas)
        });
      },
      complete() {
        wx.hideLoading()
      }
    })
    wx.stopPullDownRefresh();
    console.log(res);
  },


  /**
   * 点击增加记仇内容
   */
  addContent() {
    console.log("你被点击了");
    // wx.navigateTo({
    //   url: '/pages/addContent/add',
    // })
  },
  delError(res) {
    const app = getApp()
    console.log(app.globalData.openid)
    console.log(res)
    if (app.globalData.openid != null) {
      wx.showModal({
        title: '确认删除？',
        content: '是否删除当前内容',
        confirmText: '删除',
        cancelText: '取消',
        success: function(result) {
          if (result.confirm) {
            console.log('用户点击主操作')
            wx.request({
              url: `${config.service.memorial}` + '/' + res.currentTarget.id,
              method: 'DELETE',
              success(res) {
                console.log(res)
                wx.showToast({
                  title: res.data.msg,
                  icon: 'success',
                })
              }
            })
          } else if (result.cancel) {
            console.log('用户点击次要操作')
          }
        }
      })
      return false;
    }
    return false;
  },
  showMore(e) {
    console.log(e)
    if (this.data.contentStyle == "overflow:none;text-overflow:none ;display: block;padding-right:1em;") {
      this.setData({
        contentStyle: "overflow:hidden;text-overflow: ellipsis;display: -webkit - box;padding-right:1em;",
      })
    } else {
      this.setData({
        contentStyle: "overflow:none;text-overflow:none ;display: block;padding-right:1em;",
      })
    }
  },
  searchMemoirs() {
    if (!this.data.isSearch) { //显示搜索框
      this.setData({
        isSearch: true,
        noneSearch: "cancel",
      });
      return;
    }
    if (this.data.searchText.length < 1) { //关闭搜索框
      this.setData({
        isSearch: false,
        noneSearch: "search",
      });
      return;
    }
    //设置url添加搜索参数
    this.setData({
      isEnd: false,
      pos: 0,
      url: `${config.service.memorial}` + '?' + "key=" + this.data.searchText,
    });
    console.log(this.data.searchText);
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    wx.request({
      url: this.data.url,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        that.setData({
          datas: res.data.datas
        });
        if (res.data.datas.length < 10) {
          that.setData({
            isEnd: true
          })
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  searchInput: function(e) {
    this.setData({
      searchText: e.detail.value,
    });
    if (e.detail.value.length > 0) {
      this.setData({
        noneSearch: "search",
      });
    } else {
      this.setData({
        noneSearch: "cancel",
      });
    }
  },
  showModal: function() {
    setTimeout(function() {
      wx.hideTabBar({
        animation: true
      })
    }.bind(this), 220)
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
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal: function() {
    setTimeout(function() {
      wx.showTabBar({
        animation: true
      })
    }.bind(this), 220)
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
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  forbidMove: function() {
    return true;
  },
  //  点击日期组件确定事件  
  bindDateChange: function(e) {
    console.log(e.detail.value)
    this.setData({
      dates: e.detail.value
    })
  },
  onGotUserInfo: function(e) {
    //console.log(e.detail.errMsg)
    console.log(e.detail.userInfo.nickName)
    this.setData({
      nickName: e.detail.userInfo.nickName
    })
    //console.log(e.detail.rawData)
  },
  showTopTips: function() {
    var tmpData = this.data.postValue;
    tmpData.user = this.data.nickName;
    tmpData.memory = this.data.dates;
    if (!tmpData.title || !tmpData.user || !tmpData.memory) {
      wx.showModal({
        title: "错误",
        content: "带星号的为必填项",
        showCancel: false
      });
      return;
    }
    var that = this;
    wx.request({
      url: `${config.service.memorial}`, //仅为示例，并非真实的接口地址
      data: tmpData,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data.code == 1) {
          wx.showToast({
            title: '发表成功',
          });
          that.hideModal();
        } else {
          wx.showModal({
            title: "发布结果",
            content: res.data.msg,
            cancelText: '取消发布',
            confirmText: '修改发布',
            confirmColor: '#ed6b9f',
            success(res) {
              if (res.confirm) {
                console.log("close dialog")
              } else {
                that.hideModal();
              }
            }
          })
        }
      }
    })
  },

  // input
  titleInput: function(e) {
    this.setData({
      'postValue.title': e.detail.value
    })
  },
  remarkInput: function(e) {
    this.setData({
      'postValue.remark': e.detail.value
    });
  }
})