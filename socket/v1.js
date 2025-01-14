io.of("/v1").on("connection", (socket) => {
    console.log("a new client connected");
});