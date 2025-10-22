const { json } = require('express')
const express = require('express')
const app = express()
const port = 3000
let fs = require('fs')
app.use(json())


app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/posts', (req, res) => {
    let posts = fs.readFileSync('./db.json');
    posts = JSON.parse(posts).posts.filter(p=>!p.isDeleted);
    
    let queries = req.query;
    let views = queries.views;
    let views_lte = queries.views_lte;
    let views_gte = queries.views_gte;
    let title = queries.title;
    let title_like = queries.title_like;
    
    if(views){
        posts = posts.filter(
            p=>p.views==views
        )
    }
    if(views_lte){
        posts = posts.filter(
            p=>p.views<=views_lte
        )
    }
    if(views_gte){
        posts = posts.filter(
            p=>p.views>=views_gte
        )
    }
    if(title_like){
        posts  = posts.filter(
            p=>p.title.includes(title_like)
        )
    }
    if(title){
        posts  = posts.filter(
            p=>p.title == title
        )
    }
    res.send(posts)
})
app.get('/posts/:id', (req, res) => {
    let posts = fs.readFileSync('./db.json');
    posts = JSON.parse(posts).posts.filter(p=>p.id==true);
    let id = req.params.id;
    let post = posts.filter(
        p=>p.id==id
    )
    if(post.length>0){
        res.send(post[0]);
    }else{
        res.status(404).send({
            success:false,
            data:{
                message: "id not found"
            }
        });
    }
})
app.post('/posts',(req,res)=>{
    let newPost = {
        id:req.body.id,
        title:req.body.title,
        views:req.body.views
    }
    let dataFile = fs.readFileSync('./db.json');
    posts = JSON.parse(dataFile).posts;
    
    posts.push(newPost);
    let dataWrite = {
        posts:posts
    }
    fs.writeFileSync('./db.json',JSON.stringify(dataWrite));
    res.send({
        success:true,
        data:newPost
    });
});
app.delete('/posts/:id',(req,res)=>{
    let dataFile = fs.readFileSync('./db.json');
    posts = JSON.parse(dataFile).posts;
    let id = req.params.id;
    let getPosts = posts.filter(p=>p.id==id);
    if(getPosts.length>0){
        let getPost = getPosts[0];
        getPost.isDeleted=true;
        let dataWrite = {
            posts:posts
        }
        fs.writeFileSync('./db.json',JSON.stringify(dataWrite));
        res.send({
            success:true,
            data:"Xoa thanh cong"
        })
    }else{
        res.status(404).send({
            success:true,
            data:"ID not found"
        });
    }
})
app.put('/posts/:id',(req,res)=>{
    let dataFile = fs.readFileSync('./db.json');
    posts = JSON.parse(dataFile).posts;
    let id = req.params.id;
    let getPosts = posts.filter(p=>p.id==id);
    if(getPosts.length>0){
        let getPost = getPosts[0];
        getPost.title = req.body.title?req.body.title:getPost.title;
        getPost.views = req.body.views?req.body.views: getPost.views;
        let dataWrite = {
            posts:posts
        }
        fs.writeFileSync('./db.json',JSON.stringify(dataWrite));
        res.send({
            success:true,
            data:getPost
        })
    }else{
        res.status(404).send({
            success:true,
            data:"ID not found"
        });
    }
})

// CRUD cho category
// Đọc file db.json
function readDB() {
    let data = fs.readFileSync('./db.json');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync('./db.json', JSON.stringify(data));
}

// Tạo category
app.post('/categories', (req, res) => {
    let db = readDB();
    if (!db.categories) db.categories = [];
    let newCategory = {
        id: Date.now().toString(),
        name: req.body.name
    };
    db.categories.push(newCategory);
    writeDB(db);
    res.send({ success: true, data: newCategory });
});

// Lấy tất cả category
app.get('/categories', (req, res) => {
    let db = readDB();
    let categories = (db.categories || []).filter(c => !c.isDeleted);
    res.send(categories);
});

// Lấy category theo id
app.get('/categories/:id', (req, res) => {
    let db = readDB();
    let id = req.params.id;
    let categories = (db.categories || []).filter(c => c.id == id && !c.isDeleted);
    if (categories.length > 0) {
        res.send(categories[0]);
    } else {
        res.status(404).send({ success: false, data: { message: "id not found" } });
    }
});

// Sửa category
app.put('/categories/:id', (req, res) => {
    let db = readDB();
    let id = req.params.id;
    let categories = db.categories || [];
    let found = categories.find(c => c.id == id && !c.isDeleted);
    if (found) {
        found.name = req.body.name ? req.body.name : found.name;
        writeDB(db);
        res.send({ success: true, data: found });
    } else {
        res.status(404).send({ success: false, data: "ID not found" });
    }
});

// Xóa category (đổi isDeleted về true)
app.delete('/categories/:id', (req, res) => {
    let db = readDB();
    let id = req.params.id;
    let categories = db.categories || [];
    let found = categories.find(c => c.id == id && !c.isDeleted);
    if (found) {
        found.isDeleted = true;
        writeDB(db);
        res.send({ success: true, data: "Xoa thanh cong" });
    } else {
        res.status(404).send({ success: false, data: "ID not found" });
    }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})