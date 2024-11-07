io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.user) {
    socket.user = session.user;
    next();
  } else {
    next(new Error("Unauthorized"));
  }
});
