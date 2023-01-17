//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
//THIS LINE OF CODE WAS USED TO GENEARTE AND CALL DATE FILE 
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//This where the arrays we used to store the inputs on the App and we now want to use mongoDB to store the TODO List items 
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://username:<password>@atlascluster.m1tbok8.mongodb.net/todoDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
    
};

const Item = mongoose.model("Todoitem", itemSchema);

const item1 = Item({
  name: "Welcome to your Todolist"
});

const item2 = Item({
  name: "Hit the + button to add a new item"
});

const item3 = Item({
  name: "<--- Hit this to delete an item from the list"
});

const defaultItems = [item1, item2, item3];
 
const listSchema = {
  name:String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("items stored");
    }
    });
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

// const day = date.getDate();

//   res.render("list", {listTitle: "Today", newListItems: items});

});



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName}, function(err, foundList){
  if(!err){
    if (!foundList){
      // console.log("Doen't exist!");
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);

    }else{
      // console.log("Exists!");
      //show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
})


 

});





app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


//this code below will save the new created todo item inside the database todoitems collections
  const item = new Item({
    name: itemName
  });

  //the if statment will look if the list name is = Today that is our default, check the if comment below
  if (listName === "Today"){
    item.save();
    //this code below will enable the newly created todo item inside the todoitems collection to be rendered on the frontend
      res.redirect("/");
    
  }else {
    //else it will select the custom list name and push it into foundlist then save it and go back to the custom route listName
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

 

  //this code handles the todo post whenever we create a new todo item
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });
  }else {
      List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }
//This code below finds the Items from database by Id and removes them from the list then goes back to the home route


  
});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
