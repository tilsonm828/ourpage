function showTime() {
  var date = new Date();
  var hr = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();
  var session = "AM";
  
  hr = (hr === 0) ? 12 : hr;
  if (hr > 12) {
    hr = hr - 12;
    session = "PM";
  }
  hr = (hr < 10) ? "0" + hr : hr;
  min = (min < 10) ? "0" + min : min;
  sec = (sec < 10) ? "0" + sec : sec;
  
  // var time = hr + ":" + min + ":" + sec + " " + session;
  var time = session + " " + hr + ":" + min;
  
  var clock = document.querySelector('#clock');
  clock.innerText = time;
  
  setTimeout(showTime, 1000);
}

showTime();