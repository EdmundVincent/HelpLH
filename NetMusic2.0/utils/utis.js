function getLyric(str) {
  let r = /\[(.*?)](.*)/g;
  var obj = {};
  str.replace(r, ($0, $1, $2) => {
    //  console.log( $2 ) 
    obj[$1.substring(0, 5)] = $2
  });
  return obj;
}

function getTime(time) {
  //  1.处理为整数
  var time = Math.floor(time);
  // 2.得到分钟数
  var min = Math.floor(time / 60);
  // 3.得到秒数
  var sec = time % 60;
  //  4.00:00，如果分钟数不是两位数要补0
  min = min < 10 ? '0' + min : min
  sec = sec < 10 ? '0' + sec : sec
  
  time=`${min}:${sec}`;
  return time;
}

module.exports = {
  getLyric: getLyric,
  getTime: getTime
}