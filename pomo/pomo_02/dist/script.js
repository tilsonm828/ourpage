// self-contained jquery to avoid conflicts
(function(init) {
  init(window.jQuery, window, document);
}(function($, window, document) {
  $(function() {
    // dom is ready

    // cache dom elements
    // buttons
    var $pomo_minus = $('#pomo-minus');
    var $pomo_add = $('#pomo-add');
    var $pomo_len = $('#pomo-len');
    var $break_minus = $('#break-minus');
    var $break_add = $('#break-add');
    var $break_len = $('#break-len');
    var $start = $('#start');
    var $reset = $('#reset');
    // timer elements
    var $timer = $('#timer');
    var $transition = $timer.find('.fill, .mask');
    var $fill = $timer.find('.fill, .mask.full');
    var $fix = $timer.find('.fill.fix');
    var $display = $('#display');
    // timer sfx
    var $sfx_done = document.createElement('audio');
    // $sfx_done.setAttribute('src', 'http://dan.motiongear.org/sfx/timerdone.wav');
    $sfx_done.setAttribute('src', 'classic-door-bell.wav');
    var $sfx_notify = document.createElement('audio');
    // $sfx_notify.setAttribute('src', 'http://dan.motiongear.org/sfx/notify.wav');
    $sfx_notify.setAttribute('src', 'beep-07a.mp3');

    var pomo_len = 25; // user set minutes
    var break_len = 5; // user set minutes

    // create a timer object
    var Timer = {
      elapsed: 0,
      length: 0,
      start_time: 0,
      pause_time: 0,
      started: false,
      paused: false,
      breaking: false,

      // notifications
      notify: function(text, options) {
        // check if granted
        if (window.Notification) {
          console.log("make notification");
          var n;
          n = new Notification(text, options);
          
          // close notification after time
          setTimeout(n.close.bind(n), 60000);
          
          // play notify audio
          $sfx_notify.play();
        }
      },
      
      // START the timer
      start: function() {
        // clear any existing interval
        clearInterval(this.interval);

        if (!this.breaking) {
          // set len to pomo
          this.length = pomo_len * 60;


          // if initial start
          if (!this.started) {
            this.notify('Time to work!', {
              icon: 'http://cdn.meme.am/instances/500x/32301429.jpg',
              body: "No seriously, get some work done. It's only " + pomo_len + " minute" + (pomo_len == 1 ? "." : "s.")
            });

          } else { // get back to work
            this.notify('Back to work!', {
              icon: 'http://s.quickmeme.com/img/d7/d74a8ad7d7f43b1b3adca9732fc51af091a8606c26ea15be737e6c0def6c92c9.jpg',
              body: "Another " + pomo_len + " minute" + (pomo_len == 1 ? "" : "s") + " of solid work, you can do it!"
            });
          }
        } else {
          // set len to break
          this.length = break_len * 60;

          this.notify("Take a break!", {
            icon: 'http://m.memegen.com/e9ijeu.jpg',
            body: "Eat a Kit Kat. Or two. You have " + break_len + " minute" + (break_len == 1 ? "." : "s.")
          });
        }

        // start the timer
        this.started = true;

        this.start_time = Date.now();

        this.run();

        // update button
        $start.removeClass('fa-play').addClass('fa-pause');
      },

      // PAUSE / RESUME
      pause: function() {
        // if running then pause and clear the interval
        if (!this.paused && this.interval) {
          this.paused = true;
          this.pause_time = Date.now();
          this.update();
          clearInterval(this.interval);

          // update button
          $start.removeClass('fa-pause').addClass('fa-play');

        } else if (this.paused) { // resume the timer
          this.paused = false;

          // append pause length to the start_time
          this.start_time += Date.now() - this.pause_time;

          this.run();

          // update button
          $start.removeClass('fa-play').addClass('fa-pause');
        }
      },

      // RESET the timer
      reset: function() {
        clearInterval(this.interval);
        this.started = false;
        this.paused = false;
        this.breaking = false;
        this.elapsed = 0;
        this.length = pomo_len * 60;
        this.update();
        // update button
        $start.removeClass('fa-pause').addClass('fa-play');
      },

      // RUN the timer intervals
      run: function() {
        // reference the timer inside new scope
        var self = this;

        // set the interval every 100 ms
        this.interval = setInterval(function() {

          self.elapsed = Math.floor((Date.now() - self.start_time) / 1000);

          self.update();
        }, 100);
      },

      // UPDATE the gui
      update: function() {
        // array of css props to change
        var transform_styles = ['-webkit-transform',
          '-ms-transform',
          'transform'
        ];
        // function to update circle graphic
        function updateCircle(percent) {
          if (percent < 0) {
            percent = 1;
          }
          var rotation = percent * 180;
          var fix_rotation = rotation * 2;

          // if timer resetting then ease transition, else linear
          if (percent == 1) {
            $transition.css('transition', 'all .6s .3s');
          } else {
            $transition.css('transition', 'all 1s linear');
          }

          for (var i in transform_styles) {
            $fill.css(transform_styles[i],
              'rotate(' + rotation + 'deg)');
            $fix.css(transform_styles[i],
              'rotate(' + fix_rotation + 'deg)');
          }
        }

        // function to format leading zero
        function format(time) {
          if (time < 10) return "0" + time;
          return "" + time;
        }

        // if not started, update length
        if (!this.started) {
          this.length = pomo_len * 60;
        }

        var current = this.length - this.elapsed;

        // if still time left
        if (current >= 0) {
          var label = "";
          var t_hr = format(Math.floor(current / 60));
          var t_min = format(current % 60);
          var e_hr = format(Math.floor(this.elapsed / 60));
          var e_min = format(this.elapsed % 60);

          if (!this.started) {
            label = "Ready?";
          } else if (this.paused) {
            label = "PAUSED";
          } else if (this.breaking) {
            label = "Break";
          } else {
            label = "Study";
          }
          // update the time
          $display.html("<p>" + label + "</p>" + t_hr + ":" + t_min + "<p>" + e_hr + ":" + e_min + "</p>");
          // update the circle, if timer running, 
          if (this.started) {
            updateCircle((current - 1) / this.length);
          } else { // make the timer full
            updateCircle(1);
          }

          // play audio when 0
          if (current === 0) {
            $sfx_done.play();
          }
        } else {
          // timer done!
          this.breaking = !this.breaking;
          this.start();
        }

      }
    };

    // change length buttons
    $pomo_add.on('click', function() {
      // if 1 enable minus button
      if (pomo_len == 1) {
        enable($pomo_minus);
      }

      // if < 99 add minute
      if (pomo_len < 99) {
        pomo_len = pomo_len + 5;
        // pomo_len++;

        // update the dom
        $pomo_len.html("<span>" + pomo_len + "</span>");
        // update timer if not started
        Timer.update();
      }

      // disable if max
      if (pomo_len == 99) {
        disable($pomo_len);
      }
    });

    $pomo_minus.on('click', function() {
      // if 99 enable add button
      if (pomo_len == 99) {
        enable($pomo_add);
      }

      if (pomo_len > 1) {
        // pomo_len--;
        pomo_len = pomo_len - 5;

        // update the dom
        $pomo_len.html("<span>" + pomo_len + "</span>");

        // update timer if not started
        Timer.update();
      }

      // if 1 disable minus button
      if (pomo_len == 1) {
        disable($pomo_minus);
      }

    });

    // click to edit pomo length
    $pomo_len.on('click', function() {
      // replace with textbox
      $pomo_len.html("<input type='text' value='" + pomo_len + "' maxlength='2' size='2'></input>");

      var $input = $pomo_len.find('input');

      $input.select();
      $input.on('keydown focusout', function(e) {
        // if click out or press enter
        if (e.type == "focusout" || e.keyCode === 13) {
          // if input is a number, save it
          if ($.isNumeric($input.val()) && $input.val() > 0) {
            pomo_len = $input.val();
          }
          // replace the textbox
          $pomo_len.html("<span>" + pomo_len + "</span>");
          // update timer
          Timer.update();
        }
      });
    });

    $break_add.on('click', function() {
      if (break_len == 1) {
        enable($break_minus);
      }
      // break_len++;
      break_len = break_len + 5;
      $break_len.html("<span>" + break_len + "</span>");
    });

    $break_minus.on('click', function() {
      if (break_len > 1) {
        // break_len--;
        break_len = break_len - 5;
        $break_len.html("<span>" + break_len + "</span>");
      }
      if (break_len == 1) {
        disable($break_minus);
      }
    });

    // click to edit break length
    $break_len.on("click", function() {
      // replace with textbox
      $break_len.html("<input type='text' value='" + break_len + "' maxlength='2' size='2'></input>");

      var $input = $break_len.find('input');

      $input.select();
      $input.on('keydown focusout', function(e) {
        // if click out or press enter
        if (e.type == "focusout" || e.keyCode === 13) {
          // if input is a number, save it
          if ($.isNumeric($input.val()) && $input.val() > 0) {
            break_len = $input.val();
          }
          // replace the textbox
          $break_len.html("<span>" + break_len + "</span>");
          // update timer
          Timer.update();
        }
      });
    });

    // start button
    $start.on('click', function() {
      console.log("started", Timer.started);
      if (Timer.started) {
        Timer.pause();
      } else {
        Timer.start();
      }
    });

    // reset button
    $reset.on('click', function() {
      //Timer.start_time -= 2*60*1000;
      Timer.reset();
    });

    // reset timer when page loads
    Timer.reset();

    // disable elem
    function disable(elem) {
      elem.addClass('disabled');
    }

    // enable elem
    function enable(elem) {
      elem.removeClass('disabled');
    }

  });
  // other code

}));