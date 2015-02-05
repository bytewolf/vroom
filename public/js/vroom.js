/*
This file is part of the VROOM project
released under the MIT licence
Copyright 2014 Firewall Services
Daniel Berteaud <daniel@firewall-services.com>
*/

// Default notifications
$.notify.defaults( { globalPosition: 'bottom left' } );
// Enable tooltip on required elements
$('.help').tooltip({container: 'body', trigger: 'hover'});
$('.modal').on('show.bs.modal', function(){
  $('.help').tooltip('hide');
});
// Enable bootstrap-swicth
$('.bs-switch').bootstrapSwitch();

// Strings we need translated
var locale = {};

// When pagination is done, how many item per page
var itemPerPage = 20;

// Localize the strings we need
$.ajax({
  url: rootUrl + 'localize/' + currentLang,
  type: 'GET',
  dataType: 'json',
  success: function(data) {
    locale = data;
  }
});

// Default ajax setup
$.ajaxSetup({
  url: rootUrl + 'api',
  type: 'POST',
  dataType: 'json',
  headers: {
    'X-VROOM-API-Key': api_key
  }
});

// Handle lang switch
$('#switch_lang').change(function(){
    $.ajax({
    data: {
      req: JSON.stringify({
        action: 'switch_lang',
        param : {
          language: $('#switch_lang').val()
        }
      })
    },
    error: function(data) {
      data = data.responseJSON;
      if (data.msg){
        $.notify(data.msg);
      }
      else{
        $.notify(locale.ERROR_OCCURRED, 'error');
      }
    },
    success: function(data){
      window.location.reload();
    }
  });
});

//
// Define a few functions
//

// Escape a string to be used as a jQuerry selector
// Taken from http://totaldev.com/content/escaping-characters-get-valid-jquery-id
function escapeJqSelector(string){
  return string.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
}

// Escape entities to prevent XSS
function stringEscape(string){
  string = string.replace(/[\u00A0-\u99999<>\&]/gim, function(i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
  return string;
}

// Select a color (randomly) from this list, used for text chat
function chooseColor(){
  // Shamelessly taken from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
  var colors = [
    '#B1C7FD', '#DDFDB1', '#FDB1F3', '#B1FDF0', '#FDDAB1', '#C4B1FD', '#B4FDB1', '#FDB1CA',
    '#B1E1FD', '#F7FDB1', '#EDB1FD', '#B1FDD7', '#FDC1B1', '#B1B7FD', '#CEFDB1', '#FDB1E4',
    '#B1FAFD', '#FDEAB1', '#D4B1FD', '#B1FDBD', '#FDB1BB', '#B1D1FD', '#E7FDB1', '#FDB1FD',
    '#B1FDE7', '#B1FDE7'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Just play a sound
function playSound(sound){
  var audio = new Audio(rootUrl + 'snd/' + sound);
  audio.play();
}

// Request full screen
function fullScreen(el){
  if (el.requestFullScreen){
    el.requestFullScreen();
  }
  else if (el.webkitRequestFullScreen){
    el.webkitRequestFullScreen();
  }
  else if (el.mozRequestFullScreen){
    el.mozRequestFullScreen();
  }
}

// Linkify urls
// Taken from http://rickyrosario.com/blog/converting-a-url-into-a-link-in-javascript-linkify-function/
function linkify(text){
  if (text) {
    text = text.replace(
      /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
      function(url){
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
          full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
      }
    );
  }
  return text;
}

// Save content to a file
function downloadContent(filename, content){
  var blob = new Blob([content], {type: 'text/html;charset=utf-8'});
  saveAs(blob, filename);
}

// Return current time formatted as XX:XX:XX
function getTime(){
  var d = new Date();
  var hours   = d.getHours().toString(),
      minutes = d.getMinutes().toString(),
      seconds = d.getSeconds().toString();
  hours   = (hours.length < 2)   ? '0' + hours:hours;
  minutes = (minutes.length < 2) ? '0' + minutes:minutes;
  seconds = (seconds.length < 2) ? '0' + seconds:seconds;
  return hours + ':' + minutes + ':' + seconds;
}

// Convert dates from UTC to local TZ
function utc2Local(date) {
  var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;   
}

// Temporarily suspend a button, prevent abuse
function suspendButton(el){
  $(el).attr('disabled', true);
  setTimeout(function(){
    $(el).attr('disabled', false);
  }, 1000);
}

// get max height for the main video and the preview div
function maxHeight(){
  // Which is the window height, minus toolbar, and a margin of 25px
  return $(window).height()-$('#toolbar').height()-25;
}

// Create a new input field
function addEmailInputField(form, val){
  var parentEl = $('#' + form),
      currentEntry = parentEl.find('.email-entry:last'),
      newEntry = $(currentEntry.clone()).appendTo(parentEl);
  newEntry.find('input').val(val);
  newEntry.removeClass('has-error');
  adjustAddRemoveEmailButtons(form);
}
// Adjust add and remove buttons foir email notifications
function adjustAddRemoveEmailButtons(form){
  $('#' + form).find('.email-entry:not(:last) .btn-add-email')
    .removeClass('btn-primary').removeClass('btn-add-email')
    .addClass('btn-danger').addClass('btn-remove-email')
    .html('<span class="glyphicon glyphicon-minus"></span>');
  $('#' + form).find('.email-entry:last .btn-remove-email')
    .removeClass('btn-danger').removeClass('btn-remove-email')
    .addClass('btn-primary').addClass('btn-add-email')
    .html('<span class="glyphicon glyphicon-plus"></span>');
}
// Add emails input fields
$(document).on('click','button.btn-add-email',function(e){
  e.preventDefault();
  addEmailInputField($(this).parents('.email-list:first').attr('id'), '');
});
$(document).on('click','button.btn-remove-email',function(e){
  e.preventDefault();
  el = $(this).parents('.email-entry:first');
  el.hide(100);
  setTimeout(function(){
    el.remove();
  }, 100);
});

// Handle owner/join password confirm
$('#ownerPassConfirm').on('input', function() {
  if ($('#ownerPassConfirm').val() == $('#ownerPass').val() &&
      $('#ownerPassConfirm').val() != ''){
    $('#ownerPassConfirm').parent().removeClass('has-error');
  }
  else{
    $('#ownerPassConfirm').parent().addClass('has-error');
  }
});
$('#joinPassConfirm').on('input', function() {
  if ($('#joinPass').val() == $('#joinPassConfirm').val() &&
      $('#joinPass').val() != ''){
    $('#joinPassConfirm').parent().removeClass('has-error');
  }
  else{
    $('#joinPassConfirm').parent().addClass('has-error');
  }
});

// Hide or show password fields
$('#joinPassSet').on('switchChange.bootstrapSwitch', function(event, state) {
  if (state){
    $('#joinPassFields').show(200);
  }   
  else{
    $('#joinPassFields').hide(200);
  }
});
$('#ownerPassSet').on('switchChange.bootstrapSwitch', function(event, state) {
  if (state){
    $('#ownerPassFields').show(200);
  }   
  else{
    $('#ownerPassFields').hide(200);
  }
});


// Submit the configuration form
$('#configureRoomForm').submit(function(e){
  e.preventDefault();
  // check if passwords match
  if ($('#joinPassSet').bootstrapSwitch('state')){
    if ($('#joinPass').val() !== $('#joinPassConfirm').val()){
      $('#joinPassConfirm').notify(locale.PASSWORDS_DO_NOT_MATCH, 'error');
      return false;
    }
  }
  if ($('#ownerPassSet').bootstrapSwitch('state')){
    if ($('#ownerPass').val() !== $('#ownerPassConfirm').val()){
      $('#ownerPassConfirm').notify(locale.PASSWORDS_DO_NOT_MATCH, 'error');
      return false;
    }
  }
  var validEmail = true;
  $('.email-list').find('input').each(function(index, input){
    if (!$(input).val().match(/\S+@\S+\.\S+/) && $(input).val() !== ''){
      $(input).parent().addClass('has-error');
      //$(input).parent().notify(locale.ERROR_MAIL_INVALID, 'error');
      validEmail = false;
      // Break the each loop
      return false;
    }
    else{
      $(input).parent().removeClass('has-error');
    }
  });
  if (!validEmail){
    return false;
  }
  var locked = $('#lockedSet').bootstrapSwitch('state'),
      askForName = $('#askForNameSet').bootstrapSwitch('state'),
      joinPass = ($('#joinPassSet').bootstrapSwitch('state')) ?
                   $('#joinPass').val() : false,
      ownerPass = ($('#ownerPassSet').bootstrapSwitch('state')) ?
                   $('#ownerPass').val() : false,
      persist = ($('#persistentSet').length > 0) ?
                   $('#persistentSet').bootstrapSwitch('state') : '',
      emails = [];
  $('input[name="emails[]"]').each(function(){
    emails.push($(this).val());
  });
  $.ajax({
    data: {
      req: JSON.stringify({
        action: 'update_room_conf',
        param: {
          room: roomName,
          locked: locked,
          ask_for_name: askForName,
          join_password: joinPass,
          owner_password: ownerPass,
          persistent: persist,
          emails: emails
        }
      })
    },
    error: function(data) {
      data = data.responseJSON;
      if (data.msg){
        $.notify(data.msg, 'error');
      }
      else{
        $.notify(locale.ERROR_OCCURRED, 'error');
      }
    },
    success: function(data) {
      $('#ownerPass,#ownerPassConfirm,#joinPass,#joinPassConfirm').val('');
      $('#configureModal').modal('hide');
      $('#joinPassFields,#ownerPassFields').hide();
      $.notify(data.msg, 'info');
      $('#configureRoomForm').trigger('room_conf_updated');
    }
  });
});


// Used on the index page
function initIndex(){
  var room;
  // Submit the main form to create a room
  $('#createRoom').submit(function(e){
    e.preventDefault();
    // Do not submit if we know the name is invalid
    if (!$('#roomName').val().match(/^[\w\-]{0,49}$/)){
      $('#roomName').parent().parent().notify(locale.ERROR_NAME_INVALID, {
         class: 'error',
         position: 'bottom center'
      });
    }
    else{
      $.ajax({
        url: rootUrl + 'create',
        type: 'POST',
        dataType: 'json',
        data: {
          roomName: $('#roomName').val(),
        },
        success: function(data) {
          room = data.room;
          window.location.assign(rootUrl + data.room);
        },
        error: function(data){
          data = data.responseJSON;
          if (data.err && data.err == 'ERROR_NAME_CONFLICT' ){
            room = data.room;
            $('#conflictModal').modal('show');
          }
          else if (data.msg){
            $('#roomName').parent().parent().notify(data.msg, {
               class: 'error',
               position: 'bottom center'
            });
          }
          else{
            $.notify(locale.ERROR_OCCURRED, 'error');
          }
        }
      });
    }
  });

  // Handle join confirmation
  $('#confirmJoinButton').click(function(){
    window.location.assign(rootUrl + room);
  });
  // Handle cancel/choose another name
  $('#chooseAnotherNameButton').click(function(){
    $('#roomName').val('');
    $('#conflictModal').modal('hide');
  });

  $('#roomName').on('input', function(){
    if (!$('#roomName').val().match(/^[\w\-]{0,49}$/)){
      $('#roomName').parent().addClass('has-error');
    }
    else{
      $('#roomName').parent().removeClass('has-error');
    }
  });
}

// Used on the admin page
function initAdmin(){
  var roomList = {};
  var matches = 0;

  // Update display of room list
  function updateRoomList(filter, min, max){
    $('#roomList').html('');
    var filterRe = new RegExp(filter, "gi");
    var i = 0;
    matches = 0;
    $.each(roomList, function (index, obj){
      if (filter === '' || obj.name.match(filterRe)){
        matches++;
        if (i >= min && i < max){
          var t = obj.create_date.split(/[- :]/);
          var create = utc2Local(new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5])).toLocaleString();
          t = obj.last_activity.split(/[- :]/);
          var activity = utc2Local(new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5])).toLocaleString();
          $('#roomList').append($('<tr>')
            .append($('<td>').html(stringEscape(obj.name)))
            .append($('<td>').html(stringEscape(create)).addClass('hidden-xs'))
            .append($('<td>').html(stringEscape(activity)).addClass('hidden-xs'))
            .append($('<td>')
              .append($('<div>').addClass('btn-group')
                .append($('<a>').addClass('btn btn-default').attr('href',rootUrl + obj.name)
                  .html(
                    $('<span>').addClass('glyphicon glyphicon-log-in')
                  )
                )
                .append($('<button>').addClass('btn btn-default btn-configure').data('room', obj.name)
                  .html(
                    $('<span>').addClass('glyphicon glyphicon-cog')
                  )
                )
                .append($('<a>').addClass('btn btn-default btn-remove').data('room', obj.name)
                  .html(
                    $('<span>').addClass('glyphicon glyphicon-trash')
                  )
                )
              )
            )
          );
        }
        i++;
      }
    });
  }

  // Update pagination
  function updatePagination(){
    if (matches <= itemPerPage){
      $('#pagination').hide(200);
      return;
    }
    var total = Math.ceil(matches / itemPerPage);
    if (total === 0){
      total = 1;
    }
    $('#pagination').bootpag({
      total: total,
      maxVisible: 10,
      page: 1
    }).on('page', function(e, page){
      var min = itemPerPage * (page - 1);
      var max = min + itemPerPage;
      updateRoomList($('#searchRoom').val(), min, max);
    });
    $('#pagination').show(200);
  }

  // Request the list of existing rooms to the server
  function getRooms(){
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'get_room_list',
          param: {}
        })        
      },
      error: function(data){
        data = responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data){
        roomList = data.rooms;
        matches = Object.keys(roomList).length;
        updateRoomList($('#searchRoom').val(), 0, itemPerPage);
        updatePagination();
      }
    });
  }

  function getRoomConf(roomName){
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'get_room_conf',
          param: {
            room: roomName,
          }
        })
      },
      async: false,
      error: function(data){
        $.notify(locale.ERROR_OCCURRED, 'error');
      },
      success: function(data){
        // Reset the list of email displayed, so first remove evry input field but the last one
        // We keep it so we can clone it again
        $('.email-list').find('.email-entry:not(:last)').remove();
        $.each(data.notif, function(index, obj){
          addEmailInputField('email-list-notification', obj.email);
        });
        // Now, remove the first one if the list is not empty
        if (Object.keys(data.notif).length > 0){
          $('.email-list').find('.email-entry:first').remove();
        }
        else{
          $('.email-list').find('.email-entry:first').find('input:first').val('');
        }
        adjustAddRemoveEmailButtons();
        // Update config switches
        $('#lockedSet').bootstrapSwitch('state', data.locked == 'yes');
        $('#askForNameSet').bootstrapSwitch('state', data.ask_for_name == 'yes');
        $('#joinPassSet').bootstrapSwitch('state', data.join_auth == 'yes');
        $('#ownerPassSet').bootstrapSwitch('state', data.owner_auth == 'yes');
        $('#persistentSet').bootstrapSwitch('state', data.persistent == 'yes');
        $('#configureModal').modal('show');
      }
    });
  }

  // Handle submiting the configuration form
  $(document).on('click', '.btn-configure', function(){
    roomName = $(this).data('room');
    getRoomConf(roomName);
  });

  // Submitting the delete form
  $(document).on('click', '.btn-remove', function(){
    roomName = $(this).data('room');
    $('#deleteRoomModal').modal('show');
  });

  // Get room list right after loading the page
  getRooms();

  // Delete room form
  $('#deleteRoomForm').submit(function(e){
    e.preventDefault();
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'delete_room',
          param: {
            room: roomName,
          }
        })
      },
      error: function(data){
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data){
        $.notify(data.msg, 'success');
        getRooms();
        $('#deleteRoomModal').modal('hide');
      }
    });
  });

  // Update room list when searching
  $('#searchRoom').on('input', function(){
    var lastInput = +new Date;
    setTimeout(function(){
      if (lastInput + 500 < +new Date){
        updateRoomList($('#searchRoom').val(), 0, itemPerPage);
        updatePagination();
      }
    }, 600);
  });
}

// This is the main function called when you join a room
function initVroom(room) {

  // This object will be used to record all
  // the peers and their info. Init with our own info
  var peers = {
    local: {
      screenShared: false,
      micMuted: false,
      videoPaused: false,
      displayName: '',
      color: chooseColor(),
      role: 'participant',
      hasVideo: true
    }
  };
  var roomInfo;
  var mainVid = false,
      chatHistory = {},
      chatIndex = 0,
      maxVol = -100,
      colorChanged = false;

  $('#name_local').css('background-color', peers.local.color);

  // Screen sharing is only suported on chrome desktop > 26
  if ( !$.browser.webkit || $.browser.android || $.browser.versionNumber < 26 ) {
    $('#shareScreenLabel').remove();
  }

  // If browser doesn't support webRTC or dataChannels
  if (!webrtc.capabilities.support || !webrtc.capabilities.dataChannel){
    $('#noWebrtcSupport').modal('show');
  }

  // Return the number of peers in the room
  function countPeers(){
    var count = Object.keys(peers).length;
    // Do not count ourself
    count--;
    // and do not count our local screen
    if (peers.local.screenShared){
      count--;
    }
    return count;
  }

  // Get our role and other room settings from the server
  function getRoomInfo(){
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'get_room_info',
          param: {
            room: roomName,
            peer_id: peers.local.id
          }
        })
      },
      async: false,
      error: function(data){
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data){
        // Notify others if our role changed
        if (data.role != peers.local.role){
          webrtc.sendToAll('role_change', {});
        }
        peers.local.role = data.role;
        roomInfo = data;
        // Enable owner reserved menu
        if (data.role == 'owner'){
          $('.unauthEl').hide(500);
          $('.ownerEl').show(500);
          // Reset the list of email displayed, so first remove evry input field but the last one
          // We keep it so we can clone it again
          $('.email-list').find('.email-entry:not(:last)').remove();
          $.each(data.notif, function(index, obj){
            addEmailInputField('email-list-notification', obj.email);
          });
          // Now, remove the first one if the list is not empty
          if (Object.keys(data.notif).length > 0){
            $('.email-list').find('.email-entry:first').remove();
          }
          else{
            $('.email-list').find('.email-entry:first').find('input:first').val('');
          }
          adjustAddRemoveEmailButtons();
        }
        // We're are not owner of the room
        else{
          // Hide owner reserved elements
          $('.ownerEl').hide(500);
          if (data.owner_auth == 'yes'){
            $('.unauthEl').show(500);
          }
          else{
            $('.unauthEl').hide(500);
          }
        }
        // Update config switches
        $('#lockedSet').bootstrapSwitch('state', data.locked == 'yes');
        $('#askForNameSet').bootstrapSwitch('state', data.ask_for_name == 'yes');
        $('#joinPassSet').bootstrapSwitch('state', data.join_auth == 'yes');
        $('#ownerPassSet').bootstrapSwitch('state', data.owner_auth == 'yes');
      }
    });
  }

  // Get the role of a peer
  function getPeerRole(id){
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'get_peer_role',
          param: {
            room: roomName,
            peer_id: id
          }
        })
      },
      error: function(data){
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data){
        if (peers[id]){
          peers[id].role = data.role;
          if (data.role == 'owner'){
            // If this peer is a owner, we add the mark on its preview
            $('#overlay_' + id).append($('<div></div>').attr('id', 'owner_' + id).addClass('owner hidden-xs'));
            // And we disable owner's action for him
            $('#ownerActions_' + id).remove();
          }
          else{
            $('#owner_' + id).remove();
          }
        }
      }
    });
  }

  // Put a video on the mainVideo div, called when you click on a video preview
  function handlePreviewClick(el, id){
    var wait = 1;
    // There's already a main video, let's hide it
    // and delay the new one so the fade out as time to complete
    if ($('#mainVideo video').length > 0){
      $('#mainVideo').hide(200);
      wait = 200;
      // Play all preview
      // the one in the mainVid was muted
      $('#webRTCVideo video').each(function(){
        if ($(this).get(0).volume == 0){
          $(this).get(0).volume= .7;
        }
      });
    }
    setTimeout(function(){
      // To prevent a freeze, change the src before removing the video from the DOM
      // See https://bugzilla-dev.allizom.org/show_bug.cgi?id=937110
      if ($.browser.mozilla && $('#mainVideo video').length > 0){
        $($('#mainVideo video').get(0)).attr('src', $($('#mohPlayer').get(0)).attr('src'));
        $('#mainVideo video').get(0).pause();
      }
      $('#mainVideo').html('');
      if (el.hasClass('selected')){
        el.removeClass('selected');
      }
      else{
        // Clone this new preview into the main div
        $('#mainVideo').html(el.clone().dblclick(function() {
          fullScreen(this);
          })
          .bind('contextmenu', function(){
            return false;
          })
          .css('max-height', maxHeight())
          .removeClass('latencyUnknown latencyGood latencyMedium latencyWarn latencyPoor')
          .attr('id', el.attr('id') + '_main')
        );
        $('.selected').removeClass('selected');
        el.addClass('selected');
        mainVid = el.attr('id');
        // Cut the volume the corresponding preview
        // but only on screen > 768
        // On smaller screens, the main video is hidden
        if ($(window).width() > 768){
          $('#webRTCVideo video').each(function(){
            if ($(this).get(0).paused){
              $(this).get(0).play();
            }
          });
          el.get(0).volume = 0;
          $('#mainVideo video').get(0).volume = 1;
        }
        $('#mainVideo').show(200);
      }
    }, wait);
  }

  // Logout
  function hangupCall(){
    webrtc.leaveRoom();
  }

  // Handle a new video (either another peer, or a screen
  // including our own local screen
  function addVideo(video,peer){
    playSound('join.mp3');
    // The div continer of this new video
    // will contain the video preview plus all other info like displayName, overlay and volume bar
    var div = $('<div></div>').addClass('col-xs-3 col-sm-12 col-lg-6 previewContainer').append(video).appendTo('#webRTCVideo');
    var id;
    // Peer isn't defined ? it's our own local screen
    if (!peer){
      id = 'local';
      $('<div></div>').addClass('displayName').attr('id', 'name_local_screen').appendTo(div);
      updateDisplayName(id);
      $(video).addClass('latencyUnknown');
    }
    // video id contains screen ? it's a peer sharing it's screen
    else if (video.id.match(/screen/)){
      id = peer.id + '_screen';
      var peer_id = video.id.replace('_screen_incoming', '');
      $('<div></div>').addClass('displayName').attr('id', 'name_' + peer_id + '_screen').appendTo(div);
      updateDisplayName(peer_id);
    }
    // It's the webcam of a peer
    // add the volume bar and the mute/pause overlay
    else{
      id = peer.id;
      // Create 4 divs which will contains the volume bar, the displayName, the muted/paused and
      // the owner actions (overlay)
      $('<div></div>').addClass('volumeBar').attr('id', 'volume_' + id).appendTo(div);
      $('<div></div>').addClass('displayName').attr('id', 'name_' + id).appendTo(div);
      $('<div></div>').attr('id', 'overlay_' + id).addClass('hidden-xs').appendTo(div);
      // Will contains per peer action menu (mute/pause/kick), but will only be displayed
      // on owners screen
      $('<div></div>').addClass('ownerActions hidden-xs').attr('id', 'ownerActions_' + id).appendTo(div)
        .append($('<div></div>',{
           class: 'btn-group'
         })
        .append($('<button></button>', {
           class: 'actionMute btn btn-default btn-sm',
           id: 'actionMute_' + id,
           click: function() { mutePeer(id) },
         }).prop('title', locale.MUTE_PEER))
        .append($('<button></button>', {
           class: 'actionPause btn btn-default btn-sm',
           id: 'actionPause_' + id,
           click: function() { pausePeer(id) },
         }).prop('title', locale.SUSPEND_PEER))
        .append($('<button></button>', {
           class: 'actionPromote btn btn-default btn-sm',
           id: 'actionPromote_' + id,
           click: function() { promotePeer(id) },
         }).prop('title', locale.PROMOTE_PEER))
        .append($('<button></button>', {
           class: 'actionKick btn btn-default btn-sm',
           id: 'actionKick_' + id,
           click: function() { kickPeer(id) },
         }).prop('title', locale.KICK_PEER)));
      // Display the menu now if we're a owner, but add some delay
      // as those actions won't work until all the channels are ready
      setTimeout (function(){
        $(div).hover(
          function(){
            if (peers.local.role == 'owner'){
              $('#ownerActions_' + id).show(200);
            }
          },
          function(){
            $('#ownerActions_' + id).hide(200);
          }
        );
      }, 3500);
      // Choose a random color. If everything is OK
      // this peer will send us its owne color in a few seconds
      var color = chooseColor();
      // Now store this new peer in our object
      peers[peer.id] = {
        displayName: peer.id,
        color: color,
        micMuted: false,
        videoPaused: false,
        hasVideo: true,
        lastPong: +new Date,
        dc: peer.getDataChannel('vroom'),
        obj: peer
      };
      // Send our info to this peer (displayName/color)
      // but wait a bit so the "vroom" dataChannel created earlier is fully setup (or have more chances to be)
      // before we send
      setTimeout(function(){
        // displayName is private data, lets send it through dataChannel
        if ($('#displayName').val() !== ''){
          peer.sendDirectly('vroom','setDisplayName', $('#displayName').val());
        }
        // color can be sent through the signaling channel
        peer.send('peer_color', {color: peers.local.color});
        // if we don't have a video, just signal it to this peer
        peer.send('media_info', {video: !!videoConstraints});
        // We don't have chat history yet ? Lets ask to this new peer
        if(!peers.local.hasHistory && chatIndex == 0){
          peer.sendDirectly('vroom', 'getHistory', '');
        }
        // Get the role of this peer
        getPeerRole(peer.id);
      }, 3000);
      video.volume = .7;
      $(video).addClass('latencyUnknown');
      // Stop moh, we're not alone anymore
      $('#mohPlayer')[0].pause();
      $('.aloneEl').hide(300);
    }
    $(div).attr('id', 'peer_' + id);
    // Disable context menu on the video
    $(video).bind('contextmenu', function(){
      return false;
    });
    // And go full screen on double click
    // TODO: also handle double tap
    $(video).dblclick(function(){
      fullScreen(this);
    });
    // Simple click put this preview in the mainVideo div
    $(video).click(function(){
      handlePreviewClick($(this), id);
    });
    // Now display the div
    div.show(200);
  }

  // Update volume of the corresponding peer
  // Taken from SimpleWebRTC demo
  function showVolume(el, volume) {
    if (!el){
      return;
    }
    if (volume < -45){ // vary between -45 and -20
      el.css('height', '0px');
    }
    else if (volume > -20){
      el.css('height', '100%');
    }
    else {
      el.css('height', Math.floor((volume + 100) * 100 / 25 - 220) + '%');
    }
  }

  // Feedback for latency with this peer
  function updatePeerLatency(id,time){
    if (!peers[id]){
      return;
    }
    var cl = 'latencyPoor';
    if (time < 60){
      cl = 'latencyGood';
    }
    else if (time < 120){
      cl = 'latencyMedium';
    }
    else if (time < 250){
      cl = 'latencyWarn';
    }
    $('#' + id + '_video_incoming').removeClass('latencyUnknown latencyGood latencyMedium latencyWarn latencyPoor').addClass(cl);
  }

  // Add a new message to the chat history
  function newChatMessage(from,message,time,color){
    var cl = (from === 'local') ? 'chatMsgSelf':'chatMsgOthers';
    // We need to check time format as it can be sent from another
    // peer if we asked for its history. If it's not define or doesn't look
    // correct, we'll get time locally
    if (!time || !time.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)){
      time = getTime();
    }
    // It's a message sent from a connected peer, we should have its info
    if (peers[from] && peers[from].color){
      var color = peers[from].color;
      var displayName = peers[from].displayName;
    }
    // this peer might not be defined if we're importing chat history
    // So just use the from as the displayName and the provided color
    else{
      var color = (color && color.match(/#[\da-f]{6}/i)) ? color : chooseColor();
      var displayName = from;
    }
    // Create the new msg
    var newmsg = $('<div class="chatMsg ' + cl + '"><b>' + time + ' ' + stringEscape(displayName) + '</b><p>' + linkify(stringEscape(message)) + '</p></div>').css('background-color', color);
    // Add it in the history
    $('<div class="row chatMsgContainer"></div>').append(newmsg).appendTo('#chatHistory');
    // Move the scroller down
    $('#chatHistory').scrollTop($('#chatHistory').prop('scrollHeight'));
    // Record this message in the history object
    // so we can send it to other peers asking for it
    chatHistory[chatIndex] = {
      time: time,
      from: displayName,
      color: color,
      message: message
    }
    chatIndex++;
  }

  // Wipe the history
  function wipeChatHistory(){
    $('#chatHistory').html('');
    chatHistory = {};
    chatIndex = 0;
  }

  // Update the displayName of the peer
  // and its screen if any
  function updateDisplayName(id){
    // We might receive the screen before the peer itself
    // so check if the object exists before using it, or fallback with empty values
    var display = (peers[id] && peers[id].hasName) ? stringEscape(peers[id].displayName) : '';
    var color = (peers[id] && peers[id].color) ? peers[id].color : chooseColor();
    var screenName = (peers[id] && peers[id].hasName) ? sprintf(locale.SCREEN_s, stringEscape(peers[id].displayName)) : '';
    $('#name_' + id).html(display).css('background-color', color);
    $('#name_' + id + '_screen').html(screenName).css('background-color', color);
  }

  // Mute a peer
  function mutePeer(id,globalAction){
    if (peers[id] && peers[id].role != 'owner'){
      if (!globalAction ||
          (!peers[id].micMuted && globalAction == 'mute') ||
          (peers[id].micMuted && globalAction == 'unmute')){
        var msg = locale.YOU_HAVE_MUTED_s;
        var who = (peers[id].hasName) ? peers[id].displayName : locale.A_PARTICIPANT;
        if (peers[id].micMuted){
          msg = locale.YOU_HAVE_UNMUTED_s
        }
        // notify everyone that we have muted this peer
        webrtc.sendToAll('owner_toggle_mute', {peer: id});
        $.notify(sprintf(msg, who), 'info');
      }
    }
    // We cannot mute another owner
    else if (!globalAction){
      $.notify(locale.CANT_MUTE_OWNER, 'error');
    }
  }
  // Pause a peer
  function pausePeer(id,globalAction){
    if (peers[id] && peers[id].role != 'owner'){
      if (!globalAction ||
          (!peers[id].videoPaused && globalAction == 'pause') ||
          (peers[id].videoPaused && globalAction == 'resume')){
        var msg    = locale.YOU_HAVE_SUSPENDED_s;
        var who = (peers[id].hasName) ? peers[id].displayName : locale.A_PARTICIPANT;
        if (peers[id].videoPaused){
          msg    = locale.YOU_HAVE_RESUMED_s;
        }
        webrtc.sendToAll('owner_toggle_pause', {peer: id});
        $.notify(sprintf(msg, who), 'info');
      }
    }
    else if (!globalAction){
      $.notify(locale.CANT_SUSPEND_OWNER, 'error');
    }
  }
  // Promote a peer (he will be owner)
  function promotePeer(id){
    if (peers[id] && peers[id].role != 'owner'){
      $.ajax({
        data: {
          req: JSON.stringify({
            action: 'promote_peer',
            param: {
              room: roomName,
              peer_id: id
            }
          })
        },
        error: function(data) {
          data = data.responseJSON;
          if (data.msg){
            $.notify(data.msg, 'error');
          }
          else{
            $.notify(locale.ERROR_OCCURRED, 'error');
          }
        },
        success: function(data) {
          webrtc.sendToAll('owner_promoted', {peer: id});
          $.notify(data.msg, 'success');
        }
      });
      suspendButton($('#actionPromote_' + id));
    }
    else if (peers[id]){
      $.notify(locale.CANT_PROMOTE_OWNER, 'error');
    }
  }
  // Kick a peer
  function kickPeer(id){
    if (peers[id] && peers[id].role != 'owner'){
      webrtc.sendToAll('owner_kick', {peer: id});
      // Wait a bit for the peer to leave, but end connection if it's still here
      // after 2 seconds
      setTimeout(function(){
        if (peers[id]){
          peers[id].obj.end();
        }
      }, 2000);
      var who = (peers[id].hasName) ? peers[id].displayName : locale.A_PARTICIPANT;
      $.notify(sprintf(locale.YOU_HAVE_KICKED_s, who), 'info');
    }
    else{
      $.notify(locale.CANT_KICK_OWNER, 'error');
    }
  }

  // Mute our mic
  function muteMic(){
    webrtc.mute();
    peers.local.micMuted = true;
    showVolume($('#localVolume'), -45);
  }
  // Unmute
  function unmuteMic(){
    webrtc.unmute();
    peers.local.micMuted = false;
  }
  // Suspend or webcam
  function suspendCam(){
    webrtc.pauseVideo();
    peers.local.videoPaused = true;
  }
  // Resume webcam
  function resumeCam(){
    webrtc.resumeVideo();
    peers.local.videoPaused = false;
  }

  // Check if MoH is needed
  function checkMoh(){
    setTimeout(function(){
      if (countPeers() < 1){
        if ($('#pauseMohButton').is(':checked')){
          $('#mohPlayer').get(0).volume = .25;
          $('#mohPlayer').get(0).play();
        }
        else{
          $('#pauseMohButton').notify(locale.WAIT_WITH_MUSIC, 'info');
        }
        $('.aloneEl').show(200);
      }
    }, 3000);
  }

  // Load etherpad in its iFrame
  function loadEtherpadIframe(){
    $('#etherpadContainer').pad({
      host: etherpad.uri,
      padId: etherpad.group + '$' + room,
      showControls: true,
      showLineNumbers: false,
      height: maxHeight()-7 + 'px',
      border: 2,
      userColor: peers.local.color,
      userName: peers.local.displayName
    });
  }

  // Wipe data
  function wipeRoomData(){
    if (etherpad.enabled){
      $.ajax({
        data: {
          req: JSON.stringify({
            action: 'wipe_data',
            param: {
              room: roomName
            }
          })
        },
        async: false,
        error: function(data){
          data = data.responseJSON;
          if (data.msg){
            $.notify(data.msg, 'error');
          }
          else{
            $.notify(locale.ERROR_OCCURRED, 'error');*
          }
        },
        success: function(data){
          if ($('#etherpadContainer').html() != ''){
            loadEtherpadIframe();
          }
        }
      });
    }
    webrtc.sendToAll('wipe_data', {});
    wipeChatHistory();
    $('#wipeModal').modal('hide');
    $.notify(locale.DATA_WIPED, 'info');
  }

  // An owner is muting/unmuting someone
  webrtc.on('owner_toggle_mute', function(data){
    // Ignore this if the remote peer isn't the owner of the room
    // or if the peer receiving it is our local screen sharing
    if (peers[data.id].role != 'owner' || data.roomType == 'screen'){
      return;
    }
    // We are the one being (un)muted, and we're not owner
    // Be nice and obey
    if (data.payload.peer && data.payload.peer == peers.local.id && peers.local.role != 'owner'){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      if (!peers.local.micMuted){
        muteMic();
        $('#muteMicLabel').addClass('btn-danger active');
        $('#muteMicButton').prop('checked', true);
        $.notify(sprintf(locale.s_IS_MUTING_YOU, who), 'info');
      }
      else {
        unmuteMic();
        $('#muteMicLabel').removeClass('btn-danger active');
        $('#muteMicButton').prop('checked', false);
        $.notify(sprintf(locale.s_IS_UNMUTING_YOU, who), 'info');
      }
    }
    // It's another peer of the room
    else if (data.payload.peer != peers.local.id && peers[data.payload.peer]){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      var target = (peers[data.payload.peer].hasName) ? peers[data.payload.peer].displayName : locale.A_PARTICIPANT;
      if (peers[data.payload.peer].micMuted){
        $.notify(sprintf(locale.s_IS_UNMUTING_s, who, target), 'info');
      }
      else{
        $.notify(sprintf(locale.s_IS_MUTING_s, who, target), 'info');
      }
    }
  });
  // An owner is pausing/resuming a webcam.
  // More or less the same dance than mute/unmute. Both fonctions should be merged
  webrtc.on('owner_toggle_pause', function(data){
    if (peers[data.id].role != 'owner' || data.roomType == 'screen'){
      return;
    }
    if (data.payload.peer && data.payload.peer == peers.local.id && peers.local.role != 'owner'){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      if (!peers.local.videoPaused){
        suspendCam();
        $('#suspendCamLabel').addClass('btn-danger active');
        $('#suspendCamButton').prop('checked', true);
        $.notify(sprintf(locale.s_IS_SUSPENDING_YOU, who), 'info');
      }
      else{
        resumeCam();
        $('#suspendCamLabel').removeClass('btn-danger active');
        $('#suspendCamButton').prop('checked', false);
        $.notify(sprintf(locale.s_IS_RESUMING_YOU, who), 'info');
      }
    }
    else if (data.payload.peer != peers.local.id && peers[data.payload.peer]){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      var target = (peers[data.payload.peer].hasName) ? peers[data.payload.peer].displayName : locale.A_PARTICIPANT;
      if (peers[data.payload.peer].videoPaused){
        $.notify(sprintf(locale.s_IS_RESUMING_s, who, target), 'info');
      }
      else{
        $.notify(sprintf(locale.s_IS_SUSPENDING_s, who, target), 'info');
      }
    }
  });

  // Room config has been updated
  webrtc.on('room_conf_updated', function(data){
    var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
    getRoomInfo();
    $.notify(sprintf(locale.s_CHANGED_ROOM_CONFIG, who), 'success');
  });

  // This peer indicates he has no webcam
  webrtc.on('media_info', function(data){
    if (!data.payload.video){
      $('#overlay_' + data.id).append('<div id="noWebcam_' + data.id + '" class="noWebcam"></div>');
      $('#actionPause_' + data.id).addClass('disabled');
      peers[data.id].hasVideo = false;
    }
  });

  // An owner has just promoted a participant of the room to the owner role
  webrtc.on('owner_promoted', function(data){
    if (peers[data.id].role != 'owner' || data.roomType == 'screen'){
      return;
    }
    if (data.payload.peer && data.payload.peer == peers.local.id && peers.local.role != 'owner'){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      getRoomInfo();
      if (peers.local.role == 'owner'){
        $.notify(sprintf(locale.s_IS_PROMOTING_YOU, who), 'success');
      }
    }
    else if (data.payload.peer != peers.local.id && peers[data.payload.peer]){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      var target = (peers[data.payload.peer].hasName) ? peers[data.payload.peer].displayName : locale.A_PARTICIPANT;
      $.notify(sprintf(locale.s_IS_PROMOTING_s, who, target), 'info');
    }
  });

  // An owner is kicking someone out of the room
  webrtc.on('owner_kick', function(data){
    if (peers[data.id].role != 'owner' || data.roomType == 'screen'){
      return;
    }
    if (data.payload.peer && data.payload.peer == peers.local.id && peers.local.role != 'owner'){
      hangupCall;
      window.location.assign(rootUrl + 'kicked/' + roomName);
    }
    else if (data.payload.peer != peers.local.id && peers[data.payload.peer] && peers[data.payload.peer].role != 'owner'){
      var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
      var target = (peers[data.payload.peer].hasName) ? peers[data.payload.peer].displayName : locale.A_PARTICIPANT;
      $.notify(sprintf(locale.s_IS_KICKING_s, who, target), 'info');
      // Wait a bit for the peer to leave, but end connection if it's still here
      // after 2 seconds
      setTimeout(function(){
        if (peers[data.payload.id]){
          peers[data.payload.id].obj.end();
        }
      }, 2000);
    }
  });
  // An owner is terminating the call, obey and leave the room now
  webrtc.on('terminate_room', function(data){
    if (peers[data.id].role != 'owner' || data.roomType == 'screen'){
      return;
    }
    hangupCall;
    window.location.assign(rootUrl + 'goodbye/' + roomName);
  });

  // Handle volume changes from our own mic
  webrtc.on('volumeChange', function (volume, treshold){
    // Record the highest level (used for the "no sound" detection)
    if (volume > maxVol){
      maxVol = volume;
    }
    // Do nothing if we're muted
    if (peers.local.micMuted) {
      return;
    }
    showVolume($('#localVolume'), volume);
  });

  // Handle dataChannel messages (incoming)
  webrtc.on('channelMessage', function (peer, label, data){
    // Handle volume changes from remote peers
    if (data.type == 'volume'){
      showVolume($('#volume_' + peer.id), data.volume);
    }
    // We only want to act on data received from the vroom channel
    if (label !== 'vroom'){
      return;
    }
    // Ping from the peer, lets just respond
    else if (data.type == 'ping'){
      peers[peer.id].obj.sendDirectly('vroom', 'pong', data.payload);
    }
    // Pong from the peer, lets compute reponse time
    else if (data.type == 'pong'){
      var diff = +new Date - parseInt(data.payload);
      peers[peer.id].lastPong = +new Date;
      updatePeerLatency(peer.id,diff);
    }
    // The peer sets a displayName, record this in our peers object
    else if (data.type == 'setDisplayName'){
      var name = data.payload;
      // Ignore it if it's too long
      if (name.length > 50){
        return;
      }
      peer.logger.log('Received displayName ' + stringEscape(name) + ' from peer ' + peer.id);
      // Set display name under the video
      peers[peer.id].displayName = name;
      if (name !== ''){
        peers[peer.id].hasName = true;
      }
      else {
        peers[peer.id].hasName = false;
      }
      updateDisplayName(peer.id);
    }
    // This peer asked for our chat history, lets send him
    else if (data.type == 'getHistory'){
      peer.sendDirectly('vroom', 'chatHistory', JSON.stringify(chatHistory));
    }
    // This peer is sending its chat history (and we don't have it yet)
    else if (data.type == 'chatHistory' && !peers.local.hasHistory){
      peers.local.hasHistory = true;
      var history = JSON.parse(data.payload);
      for (var i = 0; i < Object.keys(history).length; i++){
        newChatMessage(history[i].from,history[i].message,history[i].time,history[i].color);
      }
    }
    // One peer just sent a text chat message
    else if (data.type == 'textChat'){
      // Notify if the chat menu is collapsed
      if ($('#chatDropdown').hasClass('collapsed')){
        $('#chatDropdown').addClass('btn-danger');
        playSound('newmsg.mp3');
        $('#unreadMsg').text(parseInt($('#unreadMsg').text())+1).show(1000);
      }
      newChatMessage(peer.id,data.payload);
    }
  });

  // A peer is sending its color
  webrtc.on('peer_color', function(data){
    var color = data.payload.color;
    if (!color.match(/#[\da-f]{6}/i)){
      return;
    }
    peers[data.id].color = color;
    $('#name_' + data.id).css('background-color', color);
    $('#name_' + data.id + '_screen').css('background-color', color);
    // Update the displayName but only if it has been set (no need to display a cryptic peer ID)
    if (peers[data.id].hasName){
      updateDisplayName(data.id);
    }
  });

  // Received when a peer mute his mic, or pause the video
  webrtc.on('mute', function(data){
    // Muting
    if (data.name === 'audio'){
      // put the volume bar at the minimum
      showVolume($('#volume_' + data.id), -46);
      var div = 'mute_' + data.id,
          cl = 'muted';
      peers[data.id].micMuted = true;
      $('#actionMute_' + data.id).addClass('btn-danger');
    }
    // Pausing webcam
    else if (data.name === 'video'){
      var div = 'pause_' + data.id,
          cl = 'paused';
      peers[data.id].videoPaused = true;
      $('#actionPause_' + data.id).addClass('btn-danger');
    }
    else{
      return;
    }
    $('#overlay_' + data.id).append('<div id="' + div + '" class="' + cl + '"></div>');
  });

  // Handle unmute/resume
  webrtc.on('unmute', function(data){
    if (data.name === 'audio'){
      var el = '#mute_' + data.id;
      peers[data.id].micMuted = false;
      $('#actionMute_' + data.id).removeClass('btn-danger');
    }
    else if (data.name === 'video'){
      var el = '#pause_' + data.id;
      peers[data.id].videoPaused = false;
      $('#actionPause_' + data.id).removeClass('btn-danger');
    }
    else{
      return;
    }
    $(el).remove();
  });

  // This peer claims he changed its role (usually from participant to owner)
  // Lets check this
  webrtc.on('role_change', function(data){
    if (data.roomType == 'screen'){
      return;
    }
    getPeerRole(data.id);
  });

  // An owner has wiped data
  webrtc.on('wipe_data', function(data){
    if (data.roomType == 'screen' || peers[data.id].role != 'owner'){
      return;
    }
    wipeChatHistory();
    if (etherpad.enabled){
      $.ajax({
        data: {
          req: JSON.stringify({
            action: 'get_pad_session',
            param: {
              room: roomName
            }
          })
        },
        error: function(data) {
          data = data.responseJSON;
          if (data.msg){
            $.notify(data.msg, 'error');
          }
          else{
            $.notify(locale.ERROR_OCCURRED, 'error');
          }
        },
        success: function(data) {
          if (data.msg){
            $.notify(data.msg, 'success');
          }
          loadEtherpadIframe();
        }
      });
    }
    var who = (peers[data.id].hasName) ? peers[data.id].displayName : locale.A_ROOM_ADMIN;
    $.notify(sprintf(locale.ROOM_DATA_WIPED_BY_s, stringEscape(who)), 'info');
  });

  // Handle the readyToCall event: join the room
  // Or prompt for a name first
  webrtc.once('readyToCall', function () {
    peers.local.id = webrtc.connection.socket.sessionid;
    getRoomInfo();
    if (roomInfo.ask_for_name && roomInfo.ask_for_name == 'yes'){
      $('#setDisplayName').modal('show');
    }
    else{
      webrtc.joinRoom(room);
    }
  });

  // When we joined the room
  webrtc.on('joinedRoom', function(){
    // Check if sound is detected and warn if it hasn't
    if (window.webkitAudioContext || window.AudioContext){
      setTimeout(function (){
        if (maxVol < -80){
          $.notify(locale.NO_SOUND_DETECTED, {
            className: 'error',
            autoHide: false
          });
        }
      }, 10000);
    }
    // Notify the server a new participant has joined (ourself)
    // If we were prompted for our display name before joining
    // we send it. Not that I like sending this kind of data to the server
    // but it's needed for email notifications
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'join',
          param: {
            room: roomName,
            name: (peers.local.hasName) ? peers.local.displayName : ''
          }
        })
      },
      error: function(data) {
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data) {
        if (data.msg){
          $.notify(data.msg, 'success');
        }
      }
    });
    checkMoh();
    $('#videoLocalContainer').show(200);
    $('#timeCounterXs,#timeCounter').tinyTimer({ from: new Date });
  });

  // Handle new video stream added: someone joined the room
  webrtc.on('videoAdded', function(video,peer){
    addVideo(video,peer);
  });

  // We share our screen
  webrtc.on('localScreenAdded', function(video){
    addVideo(video);
  });

  // error opening the webcam or mic stream
  webrtc.on('localMediaError', function(){
    $('#noWebcam').modal('show');
  });

  // Handle video stream removed: someone leaved the room
  webrtc.on('videoRemoved', function(video,peer){
    playSound('leave.mp3');
    var id = (peer) ? peer.id : 'local';
    // Is the screen sharing of a peer being removed ?
    if (video.id.match(/_screen_/)){
      id = id + '_screen';
    }
    // Or the peer itself
    else if (peer && peers[peer.id] && id != 'local'){
      delete peers[peer.id];
    }
    $("#peer_" + id).hide(300);
    // Remove the div, but wait for the fade out to complete
    setTimeout(function(){
      $("#peer_" + id).remove();
    }, 300);
    if (mainVid == id + '_video_incoming' || mainVid == id + '_incoming' || mainVid == id + 'Screen'){
      $('#mainVideo').hide(500);
      setTimeout(function(){
        if ($.browser.mozilla && $('#mainVideo video').length > 0){
          $($('#mainVideo video').get(0)).attr('src', $($('#mohPlayer').get(0)).attr('src'));
          $('#mainVideo video').get(0).pause();
        }
        $('#mainVideo').html('');
      }, 500);
      mainVid = false;
    }
    if (id != 'local'){
      checkMoh();
    }
  });

  // Detect connection lost
  webrtc.connection.socket.on('disconnect', function(){
    setTimeout(function(){
      $('#disconnected').modal('show');
    }, 2000);
  });

  // Handle Email Invitation
  $('#inviteEmail').submit(function(event) {
    event.preventDefault();
    var rcpts = [],
        message = $('#message').val();
    $('input[name="invitation-recipients[]"]').each(function(){
      rcpts.push($(this).val());
    });
    // Simple email address verification
    // not fullproof, but email validation is a real nightmare
    var validEmail = true;
    $('.email-list').find('input').each(function(index, input){
      if (!$(input).val().match(/\S+@\S+\.\S+/) && $(input).val() !== ''){
        $(input).parent().addClass('has-error');
        //$(input).parent().notify(locale.ERROR_MAIL_INVALID, 'error');
        validEmail = false;
        // Break the each loop
        return false;
      }
      else{
        $(input).parent().removeClass('has-error');
      }
    });
    if (!validEmail){
      return false;
    }
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'invite_email',
          param: {
            rcpts: rcpts,
            message: message,
            room: roomName
          }
        })
      },
      error: function(data) {
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data) {
        $('#recipient').val('');
        $('#inviteModal').modal('hide');
        $('#email-list-invite').find('.email-entry:not(:last)').remove();
        $('#email-list-invite').find('input').val('');
        $('#message').val('');
        $.notify(data.msg, 'success');
      }
    });
  });

  // Set your DisplayName
  $('#displayName').on('input', function(){
    var name = $('#displayName').val();
    if (name.length > 50){
      $('#displayName').parent().addClass('has-error');
      $('#displayName').notify(locale.DISPLAY_NAME_TOO_LONG, 'error');
      return;
    }
    else{
      $('#displayName').parent().removeClass('has-error');
    }
    // Enable chat input when you set your disaplay name
    if (name != '' && $('#chatBox').attr('disabled')){
      $('#chatBox').removeAttr('disabled').removeAttr('placeholder');
      peers.local.hasName = true;
    }
    // And disable it again if you remove your display name
    else if (name == ''){
      $('#chatBox').attr('disabled', true).attr('placeholder', locale.SET_YOUR_NAME_TO_CHAT);
      peers.local.hasName = false;
    }
    peers.local.displayName = name;
    updateDisplayName('local');
    webrtc.sendDirectlyToAll('vroom', 'setDisplayName', name);
    lastNameChange = +new Date;
    // Should we reload etherpad iFrame with this new name ?
    if (etherpad.enabled){
      // Wait ~3 sec and reload etherpad
      setTimeout(function(){
        if (lastNameChange && lastNameChange + 3000 < +new Date && $('#etherpadContainer').html() != ''){
          loadEtherpadIframe();
        }
      }, 3100);
    }
  });
  // This is the displayName input before joining the room
  $('#displayNamePre').on('input', function() {
    var name = $('#displayNamePre').val();
    if (name.length > 0 && name.length < 50){
      $('#displayNamePreButton').removeClass('disabled');
      $('#displayNamePre').parent().removeClass('has-error');
    }
    else{
      $('#displayNamePreButton').addClass('disabled');
      $('#displayNamePre').parent().addClass('has-error');
      if (name.length < 1){
        $('#displayNamePre').notify(locale.DISPLAY_NAME_REQUIRED, 'error');
      }
      else{
        $('#displayNamePre').notify(locale.DISPLAY_NAME_TOO_LONG, 'error');
      }
    }
  });

  $('#displayNamePreForm').submit(function(event){
    event.preventDefault();
    var name = $('#displayNamePre').val();
    if (name.length > 0 && name.length < 50){
      $('#setDisplayName').modal('hide');
      $('#displayName').val(name);
      peers.local.hasName = true;
      peers.local.displayName = name;
      updateDisplayName('local');
      $('#chatBox').removeAttr('disabled').removeAttr('placeholder');
      webrtc.joinRoom(room);
    }
  });

  // ScreenSharing
  $('#shareScreenButton').change(function() {
    var action = ($(this).is(":checked")) ? 'share':'unshare';
    function cantShare(err){
      $.notify(err, 'error');
      return;
    }
    if (!peers.local.screenShared && action === 'share'){
      webrtc.shareScreen(function(err){
        // An error occured while sharing our screen
        if(err){
          if (err.name == 'EXTENSION_UNAVAILABLE'){
            var ver = 34;
            if ($.browser.linux){
              ver = 35;
            }
            if ($.browser.webkit && $.browser.versionNumber >= ver){
              $('#chromeExtMessage').modal('show');
            }
            else{
              cantShare(locale.SCREEN_SHARING_ONLY_FOR_CHROME);
            }
          }
          // This error usually means you have denied access (old flag way)
          // or you cancelled screen sharing (new extension way)
          else if (err.name == 'PERMISSION_DENIED' || err.name == 'PermissionDeniedError'){
            cantShare(locale.SCREEN_SHARING_CANCELLED);
          }
          else{
            cantShare(locale.CANT_SHARE_SCREEN);
          }
          $('#shareScreenLabel').removeClass('active');
          return;
        }
        // Screen sharing worked, warn that everyone can see it
        else{
          $("#shareScreenLabel").addClass('btn-danger');
          peers.local.screenShared = true;
          $.notify(locale.EVERYONE_CAN_SEE_YOUR_SCREEN, 'info');
        }
      });
    }
    else{
      peers.local.screenShared = false;
      webrtc.stopScreenShare();
      $('#shareScreenLabel').removeClass('btn-danger');
      $.notify(locale.SCREEN_UNSHARED, 'info');
    }
  });

  // Handle microphone mute/unmute
  $('#muteMicButton').change(function() {
    var action = ($(this).is(':checked')) ? 'mute':'unmute';
    if (action === 'mute'){
      muteMic();
      $('#muteMicLabel').addClass('btn-danger');
      $.notify(locale.MIC_MUTED, 'info');
    }
    else{
      unmuteMic();
      $('#muteMicLabel').removeClass('btn-danger');
      $.notify(locale.MIC_UNMUTED, 'info');
    }
  });

  // Disable suspend webcam button if no webcam
  if (!videoConstraints){
    $('#suspendCamButton').attr('disabled', true);
    $('#suspendCamLabel').addClass('disabled');
  }

  // Suspend the webcam
  $('#suspendCamButton').change(function() {
    var action = ($(this).is(':checked')) ? 'pause':'resume';
    if (action === 'pause'){
      suspendCam();
      $('#suspendCamLabel').addClass('btn-danger');
      $.notify(locale.CAM_SUSPENDED, 'info');
    }
    else{
      resumeCam();
      $('#suspendCamLabel').removeClass('btn-danger');
      $.notify(locale.CAM_RESUMED, 'info');
    }
  });

  // Handle auth to become room owner
  $('#authPass').on('input', function() {
    if ($('#authPass').val() == ''){
      $('#authPassButton').addClass('disabled');
    }
    else{
      $('#authPassButton').removeClass('disabled');
    }
  });
  $('#ownerAuthForm').submit(function(event) {
    event.preventDefault();
    var pass = $('#ownerAuthPass').val();
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'authenticate',
          param: {
            password: pass,
            room: roomName
          }
        })
      },
      error: function(data) {
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data) {
        $('#authPass').val('');
        $('#ownerAuthModal').modal('hide');
        getRoomInfo();
        $('#joinPassFields,#ownerPassFields').hide();
        $.notify(data.msg, 'success');
      }
    });
  });

  // The configuration formed has been submited successfuly
  // Lets announce it to the other peers
  $('#configureRoomForm').on('room_conf_updated', function(){
    webrtc.sendToAll('room_conf_updated');
  });

  // Choose another color. Useful if two peers have the same
  $('#changeColorButton').click(function(){
    peers.local.color = chooseColor();
    // Reload etherpadiFrame if required
    if (etherpad.enabled){
      loadEtherpadIframe();
    }
    webrtc.sendToAll('peer_color', {color: peers.local.color});
    updateDisplayName('local');
  });

  $('#saveChat').click(function(){
    var d = new Date;
    downloadContent('VROOM Tchat (' + room + ') ' + d.toLocaleString() + '.html', $('#chatHistory').html());
  });

  // Suspend/Play MoH
  $('#pauseMohButton').change(function(){
    if ($(this).is(":checked")){
      $('#mohPlayer')[0].play();
      $('#pauseMohLabel').addClass('btn-danger');
    }
    else{
      $('#mohPlayer')[0].pause();
      $('#pauseMohLabel').removeClass('btn-danger');
    }
  });

  // Handle hangup/close window
  $('.btn-logout').click(function(){
    $('#quitModal').modal('show');
    if (!$('#muteMicButton').is(':checked')){
      muteMic();
    }
    if (!$('#suspendCamButton').is(':checked')){
      suspendCam();
    }
  });
  // Remove the active class on the logout button if
  // the modal is closed
  $('#quitModal').on('hide.bs.modal',function(){
    $('.btn-logout').removeClass('active');
    if (!$('#muteMicButton').is(':checked')){
      unmuteMic();
    }
    if (!$('#suspendCamButton').is(':checked')){
      resumeCam();
    }
  });
  $('#confirmQuitButton').click(function() {
    hangupCall;
    window.location.assign(rootUrl + 'goodbye/' + roomName);
  });
  window.onunload = window.onbeforeunload = hangupCall;

  // Go fullscreen on double click
  $('#webRTCVideoLocal').dblclick(function(){
    fullScreen(this);
  });
  // And put it in the main div on simple click
  $('#webRTCVideoLocal').click(function(){
    handlePreviewClick($(this), 'self');
  });

  // On click, remove the red label on the button
  // and reset the unread msg counter
  $('#chatDropdown').click(function (){
    $('#chatDropdown').removeClass('btn-danger');
    $('#unreadMsg').text('0').hide(1000);
  });
  // The input is a textarea, trigger a submit
  // when the user hit enter, unless shift is pressed
  $('#chatForm').keypress(function(e) {
    if (e.which == 13 && !e.shiftKey){
      // Do not add \n
      e.preventDefault();
      $(this).trigger('submit');
    }
  });

  // Fix height in Firefox
  if ($.browser.mozilla){
    $('#saveChat,#sendChat').css('height', '47px');
  }
  // Adapt the chat input (textarea) size
  $('#chatBox').on('input', function(){
    var h = parseInt($(this).css('height'));
    var mh = parseInt($(this).css('max-height'));
    // Scrollbar, we need to add a row
    if ($(this).prop('scrollHeight') > $(this).prop('clientHeight') && h < mh){
      // Do a loop so that we can adapt to copy/pastes of several lines
      // But do not add more than 10 rows at a time
      for (var i = 0; $(this).prop('scrollHeight') > $(this).prop('clientHeight') && h < mh && i<10; i++){
        $(this).prop('rows', $(this).prop('rows')+1);
      }
    }
    // Check if we have empty lines in our textarea
    // If we do, remove one row
    // TODO: we should only check for the last row and don't remove a row if we have empty lines in the middle
    else{
      lines = $('#chatBox').val().split(/\r?\n/);
      for(var i=0; i<lines.length && $(this).prop('rows')>1; i++) {
        var val = lines[i].replace(/^\s+|\s+$/, '');
        if (val.length == 0){
          $(this).prop('rows', $(this).prop('rows')-1);
        }
      }
    }
    // In any case, adapt height of the buttons
    $('#saveChat,#sendChat').css('height', $(this).css('height'));
  });
  // Chat: send to other peers
  $('#chatForm').submit(function (e){
    e.preventDefault();
    if ($('#chatBox').val()){
      webrtc.sendDirectlyToAll('vroom', 'textChat', $('#chatBox').val());
      // Local echo of our own message
      newChatMessage('local',$('#chatBox').val());
      // reset the input box
      $('#chatBox').val('').prop('rows', 1);
      $('#saveChat,#sendChat').css('height', $('#chatBox').css('height'));
    }
  });

  // Remove the active class on the help button
  $('#helpModal').on('hide.bs.modal',function(){
    $('#helpButton').removeClass('active');
  });

  // Display the wipe data modal
  $('#wipeDataButton').click(function(){
    $('#wipeModal').modal('show');
  });
  // Really wipe data
  $('#confirmWipeButton').click(function(){
    wipeRoomData();
  });

  // Display terminate room modal
  $('#terminateRoomButton').click(function(){
    $('#terminateModal').modal('show');
  });
  // Really terminate the room now
  $('#confirmTerminateButton').click(function(){
    // Ask all the peers to quit now
    webrtc.sendToAll('terminate_room', {});
    wipeRoomData();
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'delete_room',
          param: {
            room: roomName
          }
        })
      },
      async: false,
      error: function(data) {
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data) {
        if (data.msg && data.msg != ''){
          $.notify(data.msg, 'info');
        }
      }
    });
    hangupCall;
    window.location.assign(rootUrl + 'goodbye/' + roomName);
  });

  if (etherpad.enabled){
    $('#etherpadButton').change(function(){
      var action = ($(this).is(':checked')) ? 'show':'hide';
      if (action == 'show'){
        // If not already loaded, load etherpad in the iFrame
        if ($('#etherpadContainer').html() == ''){
          loadEtherpadIframe();
        }
        $('#etherpadLabel').addClass('btn-danger');
        $('#etherpadContainer').slideDown('200');
      }
      else{
        $('#etherpadLabel').removeClass('btn-danger');
        $('#etherpadContainer').slideUp('200');
      }
    });
  }

  // Ping the room every minutes
  // Used to detect inactive rooms
  setInterval(function(){
    $.ajax({
      data: {
        req: JSON.stringify({
          action: 'ping',
          param: {
            room: roomName
          }
        })
      },
      error: function(data) {
        data = data.responseJSON;
        if (data.msg){
          $.notify(data.msg, 'error');
        }
        else{
          $.notify(locale.ERROR_OCCURRED, 'error');
        }
      },
      success: function(data) {
        if (data.msg && data.msg != ''){
          $.notify(data.msg, {
            className: 'info',
            autoHide: false
          });
        }
      }
    });
  }, 60000);

  // Ping all the peers every 5 sec to measure latency
  // Do this through dataChannel
  setInterval(function(){
    $.each(peers, function(id){
      // No response from last ping ? mark latency as poor
      if (parseInt(peers[id].lastPong)+5000 > +new Date){
        $('#' + id + '_video_incoming').removeClass('latencyUnknown latencyGood latencyMedium latencyWarn').addClass('latencyPoor');
      }
    });
    webrtc.sendDirectlyToAll('vroom', 'ping', +new Date);
  }, 5000);

  window.onresize = function (){
    $('#webRTCVideo').css('max-height', maxHeight());
    $('#mainVideo>video').css('max-height', maxHeight());
    $('#etherpadContainer').css('max-height', maxHeight());
  };  
  // Preview heigh is limited to the windows heigh, minus the navbar, minus 25px
  $('#webRTCVideo').css('max-height', maxHeight());
  $('#etherpadContainer').css('max-height', maxHeight());

};

