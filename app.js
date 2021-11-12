const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://username:passwd@todolistcluster.zxuhr.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  listItems: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!"
})

const item2 = new Item({
  name: "Hit + button to add new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultArray = [item1, item2, item3];

app.get("/", function(req, res) {
  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });
});

app.get("/:topic", function(req, res) {
  const customListItems = _.capitalize(req.params.topic);

  List.findOne({
    name: customListItems
  }, function(err, results) {
    if (!err) {
      if (!results) {
        //Create new list
        const list = new List({
          name: customListItems,
          listItems: defaultArray
        });
        list.save();
        res.redirect("/" + customListItems);
      } else {
        //Show existing list
        res.render("list", {
          listTitle: results.name,
          newListItems: results.listItems
        });
      }
    }
  });


});


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, results) {
      results.listItems.push(newItem);
      results.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{listItems:{_id:checkedItemId}}},function(err,results){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
