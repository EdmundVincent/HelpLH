var url = require("../../utils/url.js")
var myutils = require("../../utils/utis.js")

var innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isloading: false,
    lyric: {},
    scrollValue: "scroll00:00",
    duration: "",
    current: "",
    isChange: true,
    startpauseimg: "../../resource/暂停.png",
    isPlay: true,
    songid: ""
  },
  playPrev: function() {
    var that = this
    //取最近播放列表，看是否是第一个歌曲 如果是 则直接到数组的最后一个
    var zuijinsonglist = wx.getStorageSync('zuijinbofang')
    for (var i = 0; i < zuijinsonglist.length; i++) {
      if (zuijinsonglist[i].id == that.data.songid) {
        var id = zuijinsonglist[i - 1].id
        that.getSongInfo(id, function(res) {
          var songinfo = {};
          songinfo.name = res.data.songs["0"].name;
          songinfo.picUrl = res.data.songs["0"].al.picUrl;
          songinfo.author = res.data.songs["0"].ar["0"].name
          that.setData({
            songinfo: songinfo,
            songid: id
          }) 
        })
      }
    }
    innerAudioContext.stop()
    // 2、播放歌曲
    this.playSong(id);
    // 3.得到歌词
    console.log(id)
    this.getLyric(id)
  },
  playNext: function() {
    var that = this
    var zuijinsonglist = wx.getStorageSync('zuijinbofang')
    for (var i = 0; i < zuijinsonglist.length; i++) {
      if (zuijinsonglist[i].id == that.data.songid) {
        var id = zuijinsonglist[i + 1].id
        that.getSongInfo(id, function(res) {
          var songinfo = {};
          songinfo.name = res.data.songs["0"].al.name;
          songinfo.picUrl = res.data.songs["0"].al.picUrl;
          songinfo.author = res.data.songs["0"].ar["0"].name
          that.setData({
            songinfo: songinfo,
            songid: id
          })
        })
      }
    }
    innerAudioContext.stop()
    // 2、播放歌曲
    this.playSong(id);
    // 3.得到歌词
    console.log(id)
    this.getLyric(id)
  },
  /**
   * 播放
   */
  audioPlay() {
    innerAudioContext.play()
  },
  /**
   * 暂停
   */
  audioPause() {
    innerAudioContext.pause()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady(e) {
  //   innerAudioContext.pause()
  // },

  onMusicTap: function(event) {
    var that = this
    if (that.data.isPlay) {
      innerAudioContext.pause()
      that.setData({
        isPlay: false,
        startpauseimg: "../../resource/播放.png"
      })
    } else {
      innerAudioContext.play()
      that.setData({
        isPlay: true,
        startpauseimg: "../../resource/暂停.png"
      })
    }
  },

  /**
   * 
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    var arr = wx.getStorageSync('zuijinbofang')
    if (arr == "") {
      wx.setStorageSync('zuijinbofang', [])
    }
    //将歌曲加入存储中
    var zuijinsonglist = wx.getStorageSync('zuijinbofang')
    console.log(zuijinsonglist)
    // 得到歌曲信息
    this.getSongInfo(options.id, function(res) {
      var songinfo = {};
      songinfo.name = res.data.songs["0"].name;
      songinfo.picUrl = res.data.songs["0"].al.picUrl;
      songinfo.author = res.data.songs["0"].ar["0"].name
      songinfo.songid = res.data.songs["0"].id
      //放入播放记录
      console.log(zuijinsonglist)
      if (zuijinsonglist.length == 0) {
        zuijinsonglist.push({
          name: songinfo.name,
          singername: songinfo.author,
          id: songinfo.songid
        })
        wx.setStorageSync('zuijinbofang', zuijinsonglist)
      } else {
        for (var i = 0; i < zuijinsonglist.length; i++) {
          console.log(i)
          if (zuijinsonglist[i].id == songinfo.songid) {
            break
          }
          if (zuijinsonglist[i].id != songinfo.songid && i == zuijinsonglist.length - 1) {
            zuijinsonglist.push({
              name: songinfo.name,
              singername: songinfo.author,
              id: songinfo.songid
            })
            wx.setStorageSync('zuijinbofang', zuijinsonglist)
          }
        }
      }
      that.setData({
        songinfo: songinfo,
        isloading: true,
        songid: options.id
      })
    })
    // 2、播放歌曲
    this.playSong(options.id);
    // 3.得到歌词
    console.log(options.id)
    this.getLyric(options.id)
  },
  getSongInfo: function(id, callback) {
    wx.request({
      url: `${url.playList}?ids=${id}`,
      success: function(res) {
        callback(res)

      }
    })
  },
  playSong: function(id) {
    var that = this;
    innerAudioContext.autoplay = true;
    innerAudioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    // 监听音乐播放事件
    innerAudioContext.onTimeUpdate(function() {
      // console.log(innerAudioContext.currentTime);
      var duration = innerAudioContext.duration;
      var current = innerAudioContext.currentTime;
      // 格式化当前时间和总时间为00:00这种格式
      var durationTime = myutils.getTime(duration);

      // 只用获取一次
      if (!that.data.duration) {
        that.setData({
          duration: duration,
          totalTime: durationTime,
        })
      }
      // if (that.data.isChange){
      var currentTime = myutils.getTime(current);
      that.setData({
        current: current,
        currentTime: currentTime,
      })
      //console.log("跟新" + current)
      that.getScroll(that, currentTime)
      // }


    })
  },
  getLyric: function(id) {
    var that = this;
    wx.request({
      url: `${url.lyric}?id=${id}`,
      success: function(res) {
        that.setData({
          lyric: myutils.getLyric(res.data.lrc.lyric)
        })
      }
    })
  },
  changing: function() {
    if (!innerAudioContext.paused) {
      innerAudioContext.pause();
    }
    this.setData({
      isChange: false
    })
    console.log("改变中")
  },
  change: function(e) {
    var that = this;
    // 把current和currentTime的值改为变化的值
    var current = e.detail.value;
    console.log("改变" + current)
    var currentTime = myutils.getTime(current)
    this.setData({
      current: current,
      currentTime: currentTime,
    })
    that.getScroll(that, currentTime)
    innerAudioContext.seek(current)
    console.log(innerAudioContext.paused)

    innerAudioContext.onSeeked(function() {
      // 播放在设置成功在
      // innerAudioContext.play();
      // console.log(innerAudioContext.paused)
      // innerAudioContext.play();
      // console.log(innerAudioContext.paused)

      // that.setData({
      //   isChange:true
      // })
      console.log("更改完了")
      if (innerAudioContext.paused) {
        innerAudioContext.play();

      }

    })


  },
  getScroll: function(that, currentTime) {
    var scroll = 'scroll' + currentTime
    // console.log(that.data.lyric)
    if (that.data.lyric.hasOwnProperty(currentTime) && that.data.scrollValue !== scroll) {
      // console.log(this.data.scrollValue)
      that.setData({
        scrollValue: scroll
      })
    }

  }
})