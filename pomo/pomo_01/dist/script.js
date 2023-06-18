$(document).ready(function(){
  var rotation; var increment; var timer; var alltimers = [];
  var transform_styles = ['-webkit-transform', '-ms-transform', 'transform'];
  var gradient_styles = ['-webkit-radial-gradient', 'radial-gradient'];

  var worktime = {time: 25, state: "Work", col: "rgb(122, 200, 22)"}     // define the length of time
  var breaktime = {time: 5, state: "Break", col: "rgb(4, 191, 191)"}    // define the length of time
  var current = worktime;
  var time = current.time*60;
  var audio = document.createElement('audio');
  audio.setAttribute('src', 'classic-door-bell.wav');
  // audio.setAttribute('src', 'https://res.cloudinary.com/dnkqgvjbd/video/upload/v1452454849/ding_qtwqgk.mp3');

function fill(rotation){
  for(i in transform_styles) { 
    $('.circle .fill, .circle .mask.full').css(transform_styles[i], 'rotate(' + rotation/2 + 'deg)');
    $('.circle .fill.fix').css(transform_styles[i], 'rotate(' + rotation + 'deg)');
  }
}
function highlightState(state){
  $('.button').css('display', 'block').removeClass('active highlight');
  $('#' + state).addClass('highlight');
}
function activateState(state){
  $('.button').css('display', 'block').removeClass('active highlight');
  $('#' + state).addClass('active');
}
function setColor(color){
  for(i in gradient_styles) { 
    $("#ball").css('background', gradient_styles[i] + '(circle at 0.25em 0.25em,'+color+', #1F1800)');
  }
  $('.timer').css('color', color);
  $('.fill').css('background-color', color);
}
function hideBall(){
  $("#ball").fadeOut(100);
  dragball.disable();
}
function showBall(){
  $('#ball').fadeIn(100);
  dragball.enable();
}
function setTime(){
  current.time = Math.floor(rotation/4);
  if (current.time < 1) { current.time = 1; }
  time = Math.round(current.time*60);
}
function setTimer(){
  $('.timer').html(("0" + Math.floor(time/60)).slice(-2)+':'+ ("0" + time%60).slice(-2));
}
function animateCircle(rot){
  $('.mask, .fill').addClass('animate');
  fill(rot);
  setTimeout(function(){ $('.mask, .fill').removeClass('animate'); }, 1000);
}
function minusSec(){
  if (time <= 0) {
    endTimer();
  } else { 
    time-=1;
    rotation-=increment;
    fill(rotation);
    setTimer();
  }
}
function countDown(){
  if (!timer){
    timer = setInterval(minusSec, 1000);
    alltimers.push(timer);
  }
}
function ClearAllIntervals() {
  clearInterval(timer);
  timer = false;
}
function transitionToCounter(state){
  activateState(state);
  rotation = 360;
  increment = rotation/time;
  animateCircle(rotation);
  hideBall();
}
function transitionToSetting(){
  highlightState(current.state)
  rotation = 360/90 * current.time;
  TweenLite.set(ball, {rotation: rotation});
  animateCircle(rotation);
  showBall();
}
function setState(state){
  current = state;
  setColor(current.col);
  pauseTimer(); 
  transitionToSetting();
  setTime();
  setTimer();
  $('.timer').one("click", startTimer);
}
function startTimer(){
  highlightState(current.state)
  transitionToCounter(current.state)
  setTimer();
  countDown();
  $('.timer').one("click", pauseTimer);
}
function pauseTimer(){
  ClearAllIntervals();
  $('.timer').one("click", resumeTimer); 
}
function resumeTimer(){

  setTimer();
  countDown();
  $('.timer').one("click", pauseTimer); 
}
function endTimer(){
  ClearAllIntervals();
  audio.play();
  if (current === worktime){
    current = breaktime;
  } else {
    current = worktime;
  }
  time = current.time*60;
  setColor(current.col);
  transitionToCounter(current.state);
  setTimer();
  countDown();
  $(this).one("click", pauseTimer);
}
function onRotateball() {
  rotation = dragball.rotation;
  highlightState(current.state);
  fill(rotation);
  setTime();
  setTimer();
}
var ball = document.getElementById("ball-circle");

Draggable.create(ball, {
  type: "rotation",
  throwProps: true,
  edgeResistance: 1,
  bounds: {minRotation: 0, maxRotation: 360},
  onDrag: onRotateball,
  onThrowUpdate: onRotateball,
});
var dragball = Draggable.get(ball);

  $('.timer').one("click", startTimer);
  $('#work').click(function(){
    setState(worktime);
  })
  $('#break').click(function(){
    setState(breaktime);
  })

});