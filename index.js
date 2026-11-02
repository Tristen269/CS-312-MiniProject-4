require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");

const app = express();
const port = 8000;

// let the React app (Vite dev server) talk to this server and send the session cookie
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// React sends JSON instead of form data
app.use(express.json());

// sessions keep track of who is signed in
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// if you're not signed in, send back a 401 (React handles the redirect)
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "You must be signed in." });
  }
  next();
}

// adds canEdit so React knows whether to show Edit/Delete for this post
function withOwnership(blog, req) {
  const me = req.session.user ? req.session.user.user_id : null;
  return { ...blog, canEdit: me !== null && blog.creator_user_id === me };
}


// ---------- SIGN UP ----------

app.post("/signup", async function (req, res) {
  const userId = (req.body.user_id || "").trim();
  const password = req.body.password;
  const name = (req.body.name || "").trim();

  if (!userId || !password || !name) {
    return res.status(400).json({ error: "User ID, password and name are required." });
  }

  try {
    // check if that user id is already used
    const check = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);

    if (check.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "That user ID is taken, please pick a different one." });
    }

    // hash the password so we never store the real one
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
      [userId, hashedPassword, name]
    );

    res.status(201).json({ message: "Account created. Please sign in." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong, try again." });
  }
});


// ---------- SIGN IN ----------

app.post("/signin", async function (req, res) {
  const userId = req.body.user_id;
  const password = req.body.password;

  try {
    // look up the user by their id
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    const user = result.rows[0];

    // no user found = wrong id
    if (!user) {
      return res.status(401).json({ error: "Wrong user ID or password." });
    }

    // compare the typed password with the hashed one in the database
    const passwordMatches = await bcrypt.compare(password || "", user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Wrong user ID or password." });
    }

    // save the user in the session
    req.session.user = { user_id: user.user_id, name: user.name };
    res.json({ user: req.session.user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong, try again." });
  }
});

app.post("/signout", function (req, res) {
  req.session.destroy(function () {
    res.json({ ok: true });
  });
});

// React calls this on page load to find out if someone is already signed in
app.get("/me", function (req, res) {
  res.json({ user: req.session.user || null });
});


// ---------- VIEW ALL POSTS ----------

app.get("/blogs", requireLogin, async function (req, res) {
  try {
    // newest posts first
    const result = await pool.query("SELECT * FROM blogs ORDER BY date_created DESC");
    res.json(result.rows.map((blog) => withOwnership(blog, req)));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't load the posts." });
  }
});

// one post (used by the edit page to pre-fill the form)
app.get("/blogs/:id", requireLogin, async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [req.params.id]);
    const blog = result.rows[0];

    if (!blog) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.json(withOwnership(blog, req));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't load the post." });
  }
});


// ---------- CREATE A POST ----------

app.post("/blogs", requireLogin, async function (req, res) {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  // creator info comes from the session, not the form
  const creatorId = req.session.user.user_id;
  const creatorName = req.session.user.name;

  try {
    const result = await pool.query(
      "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [creatorName, creatorId, title, body]
    );
    res.status(201).json(withOwnership(result.rows[0], req));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't create the post." });
  }
});


// ---------- EDIT A POST ----------

app.put("/blogs/:id", requireLogin, async function (req, res) {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  try {
    // the AND creator_user_id part makes sure you can't update someone else's post
    const result = await pool.query(
      "UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3 AND creator_user_id = $4 RETURNING *",
      [title, body, req.params.id, req.session.user.user_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "You can only edit your own posts." });
    }

    res.json(withOwnership(result.rows[0], req));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't update the post." });
  }
});


// ---------- DELETE A POST ----------

app.delete("/blogs/:id", requireLogin, async function (req, res) {
  try {
    // same idea as editing, only delete if it's your post
    const result = await pool.query(
      "DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2",
      [req.params.id, req.session.user.user_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "You can only delete your own posts." });
    }

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't delete the post." });
  }
});


// ---------- MY PROFILE (bonus) ----------

app.get("/profile", requireLogin, async function (req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM blogs WHERE creator_user_id = $1 ORDER BY date_created DESC",
      [req.session.user.user_id]
    );
    res.json({
      user: req.session.user,
      posts: result.rows.map((blog) => withOwnership(blog, req)),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Couldn't load your profile." });
  }
});


app.listen(port, function () {
  console.log("Server running on http://localhost:" + port);
});