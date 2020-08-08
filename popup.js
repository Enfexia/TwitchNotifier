document.addEventListener("DOMContentLoaded", function(event) { 
  chrome.storage.sync.get('twitch_notification_settings', function(data) {
    if (typeof data.twitch_notification_settings !== 'undefined') {
      document.getElementById("username").value = data.twitch_notification_settings.username;
      document.getElementById("token").value = data.twitch_notification_settings.token;
      document.getElementById("enabled").checked = data.twitch_notification_settings.enabled;
    }
  });

  document.getElementById("save").addEventListener('click', function() {
    var settings = {
      username: document.getElementById("username").value,
      token: document.getElementById("token").value,
      enabled: document.getElementById("enabled").checked
    };

    chrome.storage.sync.set({twitch_notification_settings: settings});
    chrome.runtime.sendMessage({action: 'reload', settings: settings}, function(response) {
      return true;
    });
  });

  document.getElementById("tmilink").addEventListener('click', function() {
    chrome.tabs.create({active: true, url: 'https://twitchapps.com/tmi/'});
  });

});
