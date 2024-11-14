exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.role === "Admin") {
    next();
  } else {
    res.status(403).send("Access denied. Admins only."); 
  }
};
