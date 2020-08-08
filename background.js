const client = new tmi.Client(api_client);
client.connect().catch(console.error);

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

client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  getUser(tags["user-id"]).then(image => createNotification(image, tags.username, message) )
});

function createNotification(image,username, message) {
  chrome.notifications.create(new Date().getMilliseconds().toString(), {
    type: "basic",
    title: username,
    message: message,
    iconUrl: image
  }, function () { });
}