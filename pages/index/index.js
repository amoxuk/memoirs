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
    isEnd: false,
    isAdmin: false,
    msgList: null,
    searchText: "",
    isSearch:false,
    noneSearch:"search",
    //contentStyle: "overflow:none;text-overflow:none ;display: block;"
    //contentStyle: "overflow:hidden;text-overflow: ellipsis;display: -webkit - box;",
    //TAB
    // tabs: ["记仇", "纪念日"],
    // tabUrls: ['/pages/index/index', "/pages/memorial/memorial"],
    // activeIndex: 0,
    // sliderOffset: 0,
    // sliderLeft: 0
  },
  onLoad: function(e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    console.log(e.title)
    this.setData({
      msgList: [{
          url: "",
          title: "你完了，我又要喜欢你了!"
        },
        // {
        //   url: "/",
        //   title: "1你完了，我又要喜欢你了!"
        // },
      ],
      url: `${config.service.memoirs}`+"?",
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
      url: `${config.service.memoirs}` + '?' ,
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
    wx.navigateTo({
      url: '/pages/addContent/add',
    })
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
              url: `${config.service.memoirs}` + '/' + res.currentTarget.id,
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
    if(!this.data.isSearch){//显示搜索框
      this.setData({
        isSearch: true,
        noneSearch: "cancel",
      });
      return;
    }
    if(this.data.searchText.length<1){//关闭搜索框
      this.setData({
        isSearch: false,
        noneSearch: "search",
      });
      return;
    }
    //设置url添加搜索参数
    this.setData({
      isEnd: false,
    pos:0,
      url: `${config.service.memoirs}` + '?' + "key="+this.data.searchText,
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
    if(e.detail.value.length>0){
      this.setData({
        noneSearch: "search",
      });
    }else{
      this.setData({
        noneSearch: "cancel",
      });
    }
  },
  // tabClick: function (e) {
  //   this.setData({
  //     sliderOffset: e.currentTarget.offsetLeft,
  //     activeIndex: e.currentTarget.id
  //   });
  //   wx.navigateTo({
  //     url: this.data.tabUrls[e.currentTarget.id],
  //   })
  // }
})