// checks if a user is authenticated
module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// checks if a user has admin previlege
module.exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "Admin") {
    next();
  } else {
    res.status(403).send("Access denied.");
  }
};

// checks if a user is faculty
module.exports.isFaculty = (req, res, next) => {
  if (req.session.user && req.session.user.role === "Faculty") {
    next();
  } else {
    res.status(403).send("Access denied.");
  }
};
