const jwt = require("jsonwebtoken");
const User = require("../src/models/user");

// Middleware function to validate user authentication
const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).json({ message: "Authentication required: Token not found" });
    }

    const decodeObj = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodeObj._id);

    if (!user) {
      res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(0),
      });
      return res.status(401).json({ message: "Authentication required: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError" ||
      err.message === "Invalid user!"
    ) {
      res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(0),
      });
      return res.status(401).json({ message: "Authentication required: " + err.message });
    }
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

// Role-Based Access Control (RBAC) middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userRole = (req.user.role || "user").toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());
    if (normalizedRoles.length > 0 && !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: role '${userRole}' does not have permission to access this resource`,
      });
    }
    next();
  };
};

// Membership/Tier-Based Access Control middleware
const requireMembership = (...tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userTier = (req.user.membershipType || "normal").toLowerCase();
    const normalizedTiers = tiers.map((t) => t.toLowerCase());

    if (!req.user.isPremium && !normalizedTiers.includes("normal")) {
      return res.status(403).json({
        message: "Forbidden: Premium membership is required for this action",
      });
    }

    if (normalizedTiers.length > 0 && !normalizedTiers.includes(userTier)) {
      return res.status(403).json({
        message: `Forbidden: Requires one of [${tiers.join(", ")}] membership tiers`,
      });
    }
    next();
  };
};

module.exports = { authUser, authorizeRoles, requireMembership };

