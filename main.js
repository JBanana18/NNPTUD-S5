LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    let data = await fetch('http://localhost:3000/posts');
    let posts = await data.json();
    for (const post of posts) {
        let body = document.getElementById("body");
        if(!post.isDelete){
            body.innerHTML += convertDataToHTML(post);
        }
        
    }
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

async function getMaxID(){
    let res = await fetch('http://localhost:3000/posts');
    let posts = await res.json();
    //console.log(res);
    let ids = posts.map(
        function(e){
            return Number.parseInt(e.id);
        }
    )
    return Math.max(...ids);
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
}
//PUT: domain:port//posts/id + body

//DELETE: domain:port//posts/id
async function Delete(id){
    let res = await fetch('http://localhost:3000/posts/'+id);
    if(res.ok){
        let obj = await res.json();
        obj.isDelete =true;
        let result = await fetch('http://localhost:3000/posts/'+id,{
            method:'PUT',
            body:JSON.stringify(obj),
            headers:{
                "Content-Type":"application/json"
            }
        })
        console.log(result);
    }
}