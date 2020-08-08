let api_client = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true
    },
    identity: {
        username: "USERNAME",
        password: "OAUTH_TOKEN"
    },
    channels: [
        "USERNAME"
    ]
};
