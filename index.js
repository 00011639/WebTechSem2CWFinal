const express = require("express");
const app = express();
const path = require("path"); // to make app run on every directory
const ejsMate = require("ejs-mate"); //to create partial views
const mongoose = require("mongoose");
const Note = require("./models/note");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

mongoose.connect(
  "mongodb+srv://user:user0102@todoapp.xxg8j.mongodb.net/todoappdatabase?retryWrites=true&w=majority"
);
const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DATABASE CONNECTED!");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});
//geting all notes
app.get("/notes", async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.render("notes", { notes });
  } catch (error) {
    next(error);
  }
});
//rendering certain note form
app.get("/notes/new", (req, res) => res.render("new"));
//posting new note
app.post("/notes", async (req, res, next) => {
  try {
    const { note } = req.body;
    if (note.note.trim().length === 0) {
      throw new ExpressError("Note can't be empty", 400);
    }
    const newNote = new Note();
    newNote.note = note.note;
    await newNote.save();
    res.redirect("/notes");
  } catch (error) {
    next(error);
  }
});
//geting details of note
app.get("/notes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      throw new ExpressError("Note not found", 404);
    }
    res.render("show", { note });
  } catch (error) {
    next(error);
  }
});
//getting edit form
app.get("/notes/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      throw new ExpressError("Note not found", 404);
    }
    res.render("edit", { note });
  } catch (error) {
    next(error);
  }
});
//updating note
app.put("/notes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (note.note.trim().length === 0) {
      throw new ExpressError("Note can't be empty", 400);
    }
    await Note.findByIdAndUpdate(id, {
      note: note.note,
    });
    res.redirect("/notes");
  } catch (error) {
    next(error);
  }
});
//deleting note
app.delete("/notes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.redirect("/notes");
  } catch (error) {
    next(new ExpressError("Could not Delete Note", 404));
  }
});
//cheking other routes excep specified ones than returning error
app.get("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
//error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});
app.listen(3000, () => console.log("Server started on port 3000"));
