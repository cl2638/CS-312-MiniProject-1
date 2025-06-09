var express = require("express");
var router = express.Router();

const posts = [];

router.get("/", function(req, res){
    res.render("index", { posts: posts });
});

router.post("/posts", function(req, res){
    const { creator, title, content } = req.body;
    const createdAt = new Date();

    const newPost = { creator, title, content, createdAt };
    posts.push(newPost);

    res.redirect("/");
});

// Display edit form
router.get("/posts/:id/edit", function(req, res){
    const postId = parseInt(req.params.id, 10);

    if (!isNaN(postId) && postId >= 0 && postId < posts.length) {
        const post = posts[postId];
        res.render("edit", { postId, post });
    } else {
        res.redirect("/");
    }
});

// Handle edit submission
router.post("/posts/:id/edit", function(req, res){
    const postId = parseInt(req.params.id, 10);

    if (!isNaN(postId) && postId >= 0 && postId < posts.length) {
        const post = posts[postId];
        post.creator = req.body.creator;
        post.title = req.body.title;
        post.content = req.body.content;
        // createdAt remains the same

        console.log("Post updated:", post);
    }

    res.redirect("/");
});

// Handle post deletion
router.post("/posts/:id/delete", function(req, res){
    const postId = parseInt(req.params.id, 10);

    if (!isNaN(postId) && postId >= 0 && postId < posts.length) {
        posts.splice(postId, 1);
        console.log("Post deleted:", postId);
    }

    res.redirect("/");
});

module.exports = router;
