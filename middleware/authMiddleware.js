exports.isAuthenticated = (req, res, next) => {
    if (
      req.session.userId == "Admin" ||
      req.session.userId == "Faculty" ||
      req.session.userId
    ) {
      next();
    } else {
      res.redirect("/");
    }
  };