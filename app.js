// variable declaration
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash')
// requiring data module
const day = require("./date");

// app set and use
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// connecting to mongodb
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/DEMODB");

// constructing itemsSchema
const itemsSchema = {
  name: String,
};

// making Item model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Sushant" });
const item2 = new Item({ name: "Hacky" });
const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find({}, (error, itemData) => {
    if (itemData.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Data Saved to database");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { Today: "Today", newItem: itemData });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize( req.params.customListName);

  List.findOne({ name: customListName }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        // console.log('not Found')
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { Today: foundlist.name, newItem: foundlist.items });
      }
    }
  });
});


app.post('/',(req,res)=>{
  const itemName = req.body.name
  const listName = req.body.List
  const newItem = new Item({name:itemName})

  if(listName==='Today'){
    newItem.save()
    res.redirect('/')
  }else{
    List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(newItem)
    foundList.save()
    res.redirect('/'+listName)
    })
  }
})



app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(itemId,listName)
  if(listName==='Today'){
    Item.findByIdAndRemove(itemId, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Data is Deleted");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},(err)=>{
      if(!err){
        res.redirect('/'+listName)
      }
    })
  }
  
});
app.listen(process.env.PORT|| 4000, () => {
  console.log("server is started on port 4000");
});
