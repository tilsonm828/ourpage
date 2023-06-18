var context = new AudioContext();

var playNote = function(frequency, startTime, duration) {
  var osc1 = context.createOscillator(),
    osc2 = context.createOscillator(),
    volume = context.createGain();

  // Set oscillator wave type
  osc1.type = 'triangle';
  osc2.type = 'triangle';

  volume.gain.value = 0.1;

  // Set up node routing
  osc1.connect(volume);
  osc2.connect(volume);
  volume.connect(context.destination);

  // Detune oscillators for chorus effect
  osc1.frequency.value = frequency + 1;
  osc2.frequency.value = frequency - 2;

  // Fade out
  volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);
  volume.gain.linearRampToValueAtTime(0, startTime + duration);

  // Start oscillators
  osc1.start(startTime);
  osc2.start(startTime);

  // Stop oscillators
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
};

var breakNote = function() {
  playNote(329.628, context.currentTime, 3);
};
workNote = function() {
  playNote(659.255, context.currentTime, 3);
};

$(document).ready(function() {
  function toTime(num) {
    var min, sec;
    min = Math.floor(num / 60) >= 10 ? Math.floor(num / 60) : '0' + Math.floor(num / 60);
    sec = (num - min * 60) >= 10 ? (num - min * 60) : '0' + (num - min * 60);
    return [min, sec];
  }

  var $breakAmount = Number($('#breakAmount').html()),
    $workAmount = Number($('#workAmount').html()),
    workInterval, breakInterval, amount,
    running = '',
    lastRun = '',
    count = 0;

  //Animate work timer
  function animateWork() {
      running = 'work';
      lastRun = '';
      amount = $workAmount;
      var seconds = amount * 60;
      //Set display to work
      $('#timer-display').hide().html('Work').fadeIn('slow').css('font-size', '40px');
      //Show time left
      $('#minutes').html(toTime(seconds - count)[0]);
      $('#seconds').html(toTime(seconds - count)[1]);
      //Set seconds and amount for each increment
      var increment = 300 / seconds;
      //Run increment every 1 sec.
      workInterval = setInterval(function() {
        count += 1;
        $('#minutes').html(toTime(seconds - count)[0]);
        $('#seconds').html(toTime(seconds - count)[1]);

        $('.filler').animate({
          top: "-=" + increment
        }, 300);
        $('.output').html(amount + ' ' + running);
        if (count === seconds) {
          clearInterval(workInterval);
          count = 0;
          breakNote();
          animateBreak();
        }
      }, 1000);
    }
    //Animate break timer
  function animateBreak() {
      running = 'break';
      lastRun = '';
      amount = $breakAmount;
      var seconds = amount * 60;
      $('#minutes').html(toTime(seconds - count)[0]);
      $('#seconds').html(toTime(seconds - count)[1]);
      //Set Display to break
      $('#timer-display').hide().html('Break').fadeIn('slow').css('font-size', '40px');
      //Set seconds and amount for decrement
      var decrement = 300 / seconds;
      //Run decrement every 1 sec.
      breakInterval = setInterval(function() {
        count += 1;
        $('#minutes').html(toTime(seconds - count)[0]);
        $('#seconds').html(toTime(seconds - count)[1]);
        $('.filler').animate({
          top: "+=" + decrement
        }, 300);
        $('.output').html(count + ' ' + running);
        if (count === seconds) {
          clearInterval(breakInterval);
          count = 0;
          workNote();
          animateWork();
        }
      }, 1000);
    }
    //Reset Timer
  function reset() {
      clearInterval(workInterval);
      clearInterval(breakInterval);
      $('.filler').css('top', '300px');
      $('#timer-display').hide().html('Click to Start').css('font-size', '30px').fadeIn();
      $('#minutes').html(toTime(0)[0]);
      $('#seconds').html(toTime(0)[1]);
    }
    //Add to work
  $('#addWork').click(function() {
    if ($workAmount < 60 && running === '') {
      $workAmount += 1;
      $('#workAmount').html($workAmount);
    }
  });
  //Subtract from work
  $('#subWork').click(function() {
    if ($workAmount > 1 && running === '') {
      $workAmount -= 1;
      $('#workAmount').html($workAmount);
    }
  });
  //Add to break
  $('#addBreak').click(function() {
    if ($breakAmount < 60 && running === '') {
      $breakAmount += 1;
      $('#breakAmount').html($breakAmount);
    }
  });
  //Subtract from break
  $('#subBreak').click(function() {
    if ($breakAmount > 1 && running === '') {
      $breakAmount -= 1;
      $('#breakAmount').html($breakAmount);
    }
  });
  //Start the Timer
  $('.timer-box').click(function() {
    if (running === '') {
      if (lastRun === '') {
        animateWork();
      } else if (lastRun === 'work') {
        if (amount === $workAmount) {
          animateWork();
        } else {
          count = 0;
          $('.filler').css('top', '300px');
          animateWork();
        }
      } else if (lastRun === 'break') {
        if (amount === $breakAmount) {
          animateBreak();
        } else {
          count = 0;
          $('.filler').css('top', '0px');
          animateBreak();
        }
      }
    } else if (running === 'work') {
      running = '';
      lastRun = 'work';
      clearInterval(workInterval);
    } else if (running === 'break') {
      running = '';
      lastRun = 'break';
      clearInterval(breakInterval);
    }
  });
  //Reset the timer
  $('#reset').click(function() {
    count = 0, running = '', lastRun = '';
    clearInterval(workInterval);
    clearInterval(breakInterval);
    $('.filler').css('top', '300px');
    $('#timer-display').hide().html('Click to Start').css('font-size', '30px').fadeIn();
    $('#minutes').html(toTime(0)[0]);
    $('#seconds').html(toTime(0)[1]);
  });
});