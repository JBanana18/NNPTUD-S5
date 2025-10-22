LoadData();
setNextId();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
  let data = await fetch("http://localhost:3000/posts");
  let posts = await data.json();
  let body = document.getElementById("body");
  body.innerHTML = "";
  for (const post of posts) {
    if (!post.isDelete) {
      body.innerHTML += convertDataToHTML(post);
    }
  }
  setNextId();
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Delete' onclick='Delete("+post.id+")'></input></td>";
    result += "</tr>";
    return result;
}

async function getMaxID() {
  let res = await fetch("http://localhost:3000/posts");
  let posts = await res.json();
  let ids = posts.map((e) => Number.parseInt(e.id));
  if (ids.length === 0) return 0;
  return Math.max(...ids);
}

async function setNextId() {
  let nextId = (await getMaxID()) + 1;
  document.getElementById("id").value = nextId;
}

//POST: domain:port//posts + body
async function SaveData(){
    let id = document.getElementById("id").value;
    let title = document.getElementById("title").value;
    let view = document.getElementById("view").value;
    let response = await fetch("http://localhost:3000/posts/"+id);
    let dataObj = {
        title:title,
        views:view
    }
    if(response.ok){
        let res = await fetch('http://localhost:3000/posts/'+id,
        {
            method:'PUT',
            body:JSON.stringify(dataObj),
            headers:{
                "Content-Type":"application/json"
            }

        })
        console.log(res);
    }else{
        dataObj.id = (await getMaxID()+1)+"";
        let res = await fetch('http://localhost:3000/posts',
        {
            method:'POST',
            body:JSON.stringify(dataObj),
            headers:{
                "Content-Type":"application/json"
            }
        })
        console.log(res);
    } 
    await LoadData();
    
}
//PUT: domain:port//posts/id + body

//DELETE: domain:port//posts/id
async function Delete(id) {
  let res = await fetch("http://localhost:3000/posts/" + id);
  if (res.ok) {
    let obj = await res.json();
    obj.isDelete = true;
    let result = await fetch("http://localhost:3000/posts/" + id, {
      method: "PUT",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(result);
    await LoadData();
  }
}
