var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var Goods=require('../models/goods');
const url = "mongodb://mallAdmin:winniebear98813@127.0.0.1:27017/mall?authSource=mall"
//mongoose.connect('mongodb://username:password@host:port/database?options...');
//const url = "mongodb://winnie:winniebear98813@47.94.232.89:27017/mall?authSource=admin"
//连接数据库
mongoose.connect(url,{ useNewUrlParser: true });

//监听连接状态
// mongoose.connection.on('connected',function(){
//   console.log('MongoDB connected success');
// });

// mongoose.connection.on('error',function(err){
//   console.log('MongoDB connected error:'+err);
// });

// mongoose.connection.on('disconnected',function(){
//   console.log('MongoDB connected fail');
// });

mongoose.connection.on('disconnected',()=>{
  console.log('MongoDB connected fail');
})

//数据库出现错误的时候
mongoose.connection.on('error',err=>{
  console.log(err)
})

//链接打开的时候
mongoose.connection.once('open',()=>{
  console.log('MongoDB Connected successfully!')
})

//查询商品列表数据
router.get('/list',function(req,res,next){
  //分页查询
  let page=req.param("page");//req.param不加s
  //pageSize要求是number类型
  let pageSize=parseInt(req.param("pageSize"));//当前页显示的数据个数
  let sort=req.param("sort");
  let skipNum=(page-1)*pageSize;//需要跳过的数据个数
  let priceLevel=req.param('priceLevel');//价格筛选参数
  let priceGt='',priceLte='';
  let condition = {};    //条件
  if(priceLevel!='all'){
    switch(priceLevel){
      case '0':
        priceGt=0;
        priceLte=100;
        break;
      case '1':
        priceGt=100;
        priceLte=500;
        break;
      case '2':
        priceGt=500;
        priceLte=1000;
        break;
      case '3':
        priceGt=1000;
        priceLte=5000;
        break;
    }
  }else{
    priceGt=0;
    priceLte=5000;
  }
  condition={
    salePrice:{
      $gt:priceGt,
      $lte:priceLte
    }
  }
  let goodsModel=Goods.find(condition).skip(skipNum).limit(pageSize);
  //mongodb是NoSQL语言，传参需要传一个JSON格式的对象
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function(err,doc){
   if(err){
     res.json({
       status:"1",
       msg:err.message
     });
   }else{
     res.json({
       status:'0',
       msg:'',
       result:{
         count:doc.length,
         list:doc
       }
     });
   }
 })
});

//添加到购物车
router.post('/addCart',function(req,res,next){
  var userId="100000077";
  var productId=req.body.productId;
  var Users=require('./../models/user');
  Users.findOne({userId:userId},function(err,userDoc){
    if(err){
      res.json({
        status:"1",
        msg:err.message
      })}else{
        console.log(`userDoc:${userDoc}`);
        if(userDoc){
          //加入购物车的商品分为两类，一类是已经加入过购物车的，一类是新添加的
          var goodsItem='';
          //遍历购物车，如果商品已经加入过购物车，只需要将商品数量加一
          userDoc.cartList.forEach((item) => {
            if(item.productId==productId){
              item.productNum++;
              goodsItem=item;
            }
          });
          //保存新信息到数据库
          if(goodsItem){
            userDoc.save(function(err1,doc1){
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                });
              }else{
                res.json({
                  status:"0",
                  msg:"",
                  result:'suc'
                });
              }
            });
          }else{
            /*保存新商品的信息到Users的子文档cartList中，需要先在goods集合中
              找到该商品的信息，并将查询到的信息添加到cartList*/
              Goods.findOne({productId:productId},function(err2,doc2){
                if(err2){
                  res.json({
                    status:'1',
                    msg:err2.message
                  })
                }else{
                  doc2.productNum=1;
                  doc2.checked=1;
                  userDoc.cartList.push(doc2);
                  userDoc.save(function(err3,doc3){
                    if(err3){
                      res.json({
                        status:"1",
                        msg:err3.message
                      })
                    }else{
                      res.json({
                        status:"0",
                        msg:"",
                        result:"suc"
                      })
                    }
                  });
                }
              })
            }
          }
        }
  })
})

module.exports=router;

