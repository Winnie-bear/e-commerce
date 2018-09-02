//读取静态文件
let http=require('http');
let fs=require('fs');
let util=require("util");
let url=require("url");

let server=http.createServer((req,res)=>{
  let reqUrl=url.parse(req.url);
  // res.statusCode=200;
  // res.setHeader("Content-Type","text/plain;charset=utf-8");
  //读取静态资源文件
  fs.readFile(reqUrl.pathname.substring(1),(err,data)=>{
    if(err){
      res.writeHead(404,{
        "Content-Type":"text/html"
      })
    }else{
      res.writeHead(200,{
        'Content-Type':"text/html"
      })
      res.write(data.toString());
    }
    res.end();//一定要在读取文件的时候结束响应
  })
  //res.end();报错write after end
})

server.listen(3000,'127.0.0.1',()=>{
  console.log('服务已开启');
})