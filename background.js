var client;

function getUser(username){
  return fetch('https://api.twitch.tv/kraken/users/' + username, {
    method: 'GET',
    headers: {
      "Client-ID": "7tzrgy1ldaua4dhy7ry03l4twroced",
      'Authorization': 'Bearer j2bbhjknb1ilf3b8v7kt8uvqnbrcvu',
      "Accept": "application/vnd.twitchtv.v5+json"
    }
  })
    .then(response => response.json())
    .then(data => { return data.logo});
}

function createNotification(image,username, message) {
  chrome.notifications.create(new Date().getMilliseconds().toString(), {
    type: "basic",
    title: username,
    message: message,
    iconUrl: image
  }, function () { });
}

function initClient(api_client) {
  client = new tmi.Client(api_client);
  client.connect().catch(console.error);

  client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    getUser(tags["user-id"]).then(image => createNotification(image, tags.username, message));
  });
}

function setupClient(username, token, enabled) {
  if (enabled) {
    let api_client = {
      options: {
          debug: true,
      },
      connection: {
          cluster: 'aws',
          reconnect: true
      },
      identity: {
          username: username,
          password: token,
      },
      channels: [
          username
      ]
    };

    initClient(api_client);
  } else {
    console.log("Ignoring. disabled");
    client = {};
  }
  updateIcon(enabled);
}

function updateIcon(enabled) {
  if (enabled) {
    chrome.browserAction.setIcon({path: "icon_enabled64.png"});
  } else {
    chrome.browserAction.setIcon({path: "icon_disabled64.png"});
  }
}

chrome.storage.sync.get('twitch_notification_settings', function(data) {
  if (typeof data.twitch_notification_settings !== 'undefined') {
    var username = data.twitch_notification_settings.username;
    var token = data.twitch_notification_settings.token;
    var enabled = data.twitch_notification_settings.enabled;
    setupClient(username, token, enabled);
  }
});

chrome.runtime.onMessage.addListener(function(msg) {
  if ((msg.action === 'reload') && msg.settings) {
    setupClient(msg.settings.username, msg.settings.token, msg.settings.enabled);
  }
  return true;
});
