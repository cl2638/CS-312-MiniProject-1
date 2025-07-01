// imports

const express = require("express");
const router = express.Router();
const db = require("./db");

// check if user is logged in before showing page
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/signin");
  }
  next();
}

// main blog feed page, shows posts if user is logged in
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM blogs ORDER BY created_at DESC");
    res.render("index", { posts: result.rows, user: req.session.user });
  } catch (err) {
    console.error("Error loading posts:", err);
    res.status(500).send("Error loading posts.");
  }
});

// -------- SIGNUP --------

// show signup page
router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// handle signup form submit
router.post("/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  try {
    // check if user_id already exists in db
    const userCheck = await db.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (userCheck.rows.length > 0) {
      return res.render("signup", { error: "User ID already taken, please choose another." });
    }

    // add new user to users table
    await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);

    // go to signin page after successful signup
    res.redirect("/signin");
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).send("Error signing up.");
  }
});

// -------- SIGNIN --------

// show signin page
router.get("/signin", (req, res) => {
  res.render("signin", { error: null });
});

// handle signin form submit
router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const userResult = await db.query("SELECT * FROM users WHERE user_id = $1 AND password = $2", [user_id, password]);
    if (userResult.rows.length === 0) {
      return res.render("signin", { error: "Invalid user ID or password." });
    }

    // save user session after login
    req.session.user = {
      user_id: userResult.rows[0].user_id,
      name: userResult.rows[0].name,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Error signing in:", err);
    res.status(500).send("Error signing in.");
  }
});

// -------- SIGNOUT --------

// handle logout and destroy session
router.post("/signout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/signin");
  });
});

// -------- CREATE POST --------

// handle creating a new blog post
router.post("/posts", requireLogin, async (req, res) => {
  const { title, content } = req.body;
  const creator_user_id = req.session.user.user_id;
  const creator_name = req.session.user.name;

  try {
    await db.query(
      `INSERT INTO blogs (creator_user_id, creator, title, content) VALUES ($1, $2, $3, $4)`,
      [creator_user_id, creator_name, title, content]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Error creating post.");
  }
});

// -------- EDIT POST FORM --------

// show edit form with current post data
router.get("/posts/:id/edit", requireLogin, async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [postId]);
    if (result.rows.length === 0) return res.redirect("/");

    const post = result.rows[0];

    // make sure user owns this post before editing
    if (post.creator_user_id !== req.session.user.user_id) {
      return res.status(403).send("You can only edit your own posts.");
    }

    res.render("edit", { postId, post, user: req.session.user });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Error loading post.");
  }
});

// -------- EDIT POST SUBMIT --------

// handle post update after editing
router.post("/posts/:id/edit", requireLogin, async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
    // check ownership before update
    const check = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [postId]);
    if (check.rows.length === 0) return res.redirect("/");

    if (check.rows[0].creator_user_id !== req.session.user.user_id) {
      return res.status(403).send("You can only edit your own posts.");
    }

    await db.query(
      "UPDATE blogs SET title = $1, content = $2 WHERE blog_id = $3",
      [title, content, postId]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Error updating post.");
  }
});

// -------- DELETE POST --------

// handle deleting a post if user owns it
router.post("/posts/:id/delete", requireLogin, async (req, res) => {
  const postId = req.params.id;

  try {
    // check ownership before delete
    const check = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [postId]);
    if (check.rows.length === 0) return res.redirect("/");

    if (check.rows[0].creator_user_id !== req.session.user.user_id) {
      return res.status(403).send("You can only delete your own posts.");
    }

    await db.query("DELETE FROM blogs WHERE blog_id = $1", [postId]);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting post.");
  }
});

module.exports = router;
