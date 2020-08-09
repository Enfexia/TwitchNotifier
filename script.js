let currentState = 0;
let hash = localStorage.getItem('hash');
let viewPortStates = [
    {
        icon: "&#129300;",
        title: "What is a Twitch Notifier?",
        content: "Twitch Notifier is a website that sends a notification to the streamer whenever there is a new chat message",
        button: "Got it!",
        onClick: changeState
    }, {
        icon: "💻",
        title: "Let’s start with giving access",
        content: "We need your permission to show you a notification. Can you please allow us to show you a notification?",
        button: "Next",
        onClick: notifyMe
    }, {
        icon: "🔒",
        title: "Ops",
        content: "To use the Twitch Notifier you have to give permission",
        button: "Restart",
        onClick: goFirst
    }, {
        icon: "📠",
        title: "and now for Twitch",
        content: "Now it's time to connect the twitch so we can see your chat messages.",
        button: "Auth twitch",
        onClick: authTwitch
    },
    {
        icon: "🎉",
        title: "Yay!, it's all set up",
        content: "Finally it's all set up, you can now see your messages as a notification.",
        button: "Let's go!",
        onClick: reloadNew
    },
];

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash != "" && window.location.hash.split("=")[1].split("&")[0]) {
        setHash(window.location.hash.split("=")[1].split("&")[0]);
        currentState = 4;
    }

    if (hash && hash != null && window.location.hash === "") {
        showLast();
    } else {
        document.getElementById("inner-container").style.display = "block";
        setViewPort(viewPortStates[currentState]);
        showLoadAnimation();
    }
}, false);


function reloadNew() {
    console.log('test');
    window.location.replace("https://enfexia.github.io/TwitchNotifier-Web/")
}

async function showLast() {
    document.getElementById("inner-container").style.display = "none";
    document.getElementById("inner-container-last").style.display = "block";
    document.getElementById("icon-last").innerHTML = "💻";
    document.getElementById("small-title-last").innerHTML = "Welcome";
    await getUser().then(user => username = user);
    document.getElementById("title-last").innerText = username;
    document.getElementById("content-last").innerText = "You are now getting the chat messages as a notification!";
    setTMI();
}

function setTMI() {
    getUser();
    const client = new tmi.Client({
        options: {
            debug: true,
        },
        connection: {
            cluster: 'aws',
            reconnect: true,
            secure: true
        },
        identity: {
            username: username,
            password: hash
        },
        channels: [
            username
        ]
    });
    client.connect().catch(console.error);
    client.on('message', async (channel, tags, message, self) => {
        if (self) return;
        console.log(tags);
        getUserImage(tags["user-id"]).then(image => createNotification(image, tags.username, message))
    });
}

function getUser() {
    return fetch('https://api.twitch.tv/kraken/user', {
        method: 'GET',
        headers: {
            "Client-ID": "3b7spcxyyjayb9i9ul26du4rwtsquj",
            'Authorization': 'OAuth ' + hash,
            "Accept": "application/vnd.twitchtv.v5+json"
        }
    })
        .then(response => response.json())
        .then(data => { return data.display_name });
}


function createNotification(image, username, message) {
    new Notification(username, { body: message, icon: image })
}

function setHash(hash) {
    localStorage.setItem('hash', hash);
}


function animate() {
    showCloseAnimation();
}

function showLoadAnimation() {
    var elem = document.getElementById("inner-container");
    var pos = 0;
    var id = setInterval(frame, 2);
    function frame() {
        if (pos > 1) {
            clearInterval(id);
        } else {
            pos += .005;
            elem.style.opacity = pos;
        }
    }
}

function showCloseAnimation() {
    var elem = document.getElementById("inner-container");
    var pos = 1;
    var id = setInterval(frame, 2);
    function frame() {
        if (pos <= 0) {
            clearInterval(id);
            setViewPort(viewPortStates[currentState])
        } else {
            pos -= .005;
            elem.style.opacity = pos;
        }
    }
}


function goFirst() {
    currentState = 0;
    animate();
}

function changeState() {
    document.getElementById("button").removeEventListener("click", viewPortStates[currentState].onClick, false);
    currentState++;
    animate();
}

function setViewPort(state) {
    document.getElementById("icon").innerHTML = state.icon;
    document.getElementById("title").innerText = state.title;
    document.getElementById("content").innerText = state.content;
    document.getElementById("button").innerText = state.button;
    if (state.onClick) {
        document.getElementById("button").addEventListener('click', state.onClick, false);
    }
    showLoadAnimation();
}

function authTwitch() {
    window.location.replace("https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=3b7spcxyyjayb9i9ul26du4rwtsquj&redirect_uri=https://enfexia.github.io/TwitchNotifier-Web/&scope=user_read+chat:read")
}


function notifyMe() {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("This is a test notification!");
        currentState += 2;
        animate();
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("This is a test notification!");
                currentState += 2;
                animate();            
            }
        });
    } else {
        currentState++;
        animate();
    }

    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
}

function getUserImage(userid) {
    return fetch('https://api.twitch.tv/kraken/users/' + userid, {
        method: 'GET',
        headers: {
            "Client-ID": "3b7spcxyyjayb9i9ul26du4rwtsquj",
            'Authorization': 'Bearer ' + hash,
            "Accept": "application/vnd.twitchtv.v5+json"
        }
    })
        .then(response => response.json())
        .then(data => { return data.logo });
}
