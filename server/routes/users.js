var express = require('express');
var router = express.Router();
var Users=require('./../models/user');
require('./../util/util');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//登录接口
router.post('/login',function(req,res,next){
   let param={
     userName:req.body.userName,
     userPwd:req.body.userPwd
   }
   Users.findOne(param,function(err,doc){
     if(err){
       res.json({
         status:'1',
         msg:error.message
       })
     }else{
       if(doc)
       {
          res.cookie('userId',doc.userId,{
            path:'/',
            maxAge:1000*60*60
          });
          res.cookie('userName',doc.userName,{
            path:'/',
            maxAge:1000*60*60
          });
          res.json({
            status:'0',
            msg:'',
            result:doc.userName
          })
        }
     }
   })
})

//登出接口
router.post('/logout',function(req,res,next){
  res.cookie('userId','',{
    path:'/',
    maxAge:-1
  });
  res.json({
    status:'0',
    msg:'',
    result:''
  })
})

//登录校验接口
router.get('/checklogin',function(req,res,next){
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    })
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    })
  }
})

//获取购物车接口
router.get('/cartlist',function(req,res,next){
  /*因为实现了登录拦截，所以获取购物车数据时，一定处于登录状态,若不是第一次登录
  则一定存在用户的cookie*/
    var userId=req.cookies.userId;
    Users.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        if(doc){
          res.json({
            status:'0',
            msg:'',
            result:doc.cartList
          })
        }
      }
    })
});

//购物车删除接口
router.post('/cartDel',function(req,res,next){
  var productId=req.body.productId;
  var userId=req.cookies.userId;//cookies,s不能掉
  //更新数据
  Users.update({
    userId:userId
  },{$pull:{
    'cartList':{
      'productId':productId
    }
  }},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })
});

//修改购物车接口
router.post('/cartEdit',function(req,res,next){
  //所有操作基于用户登录,一个用户拥有一个购物车列表
  var userId=req.cookies.userId,
      productId=req.body.productId,
      productNum=req.body.productNum,
      checked=req.body.checked;
  //更新数据库中的文档
  Users.update({
    'userId':userId,
    'cartList.productId':productId
  },{
    // $：代表数组的下标
    'cartList.$.productNum':productNum,
    'cartList.$.checked':checked
  },function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
});

//全选接口
router.post('/editCheckAll',function(req,res,next){
  var userId=req.cookies.userId,
      checkAll=req.body.checkAll?'1':'0';
  Users.findOne({userId:userId},function(err,user){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked=checkAll;
        });
        user.save(function(err1,doc){
          if(err1){
            res.json({
              status:'1',
              message:err.message,
              result:''
            });
          }else{
             res.json({
               status:'0',
               msg:'',
               result:'suc'
             });
          }
        })
      }
    }
  })
});

//获取地址列表的接口
router.get('/addressList',function(req,res,next){
  let userId=req.cookies.userId;
  Users.findOne({
    userId:userId
  },function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.addressList
        })
      }
    }
  })
});

//设置默认地址的接口
router.post('/setDefault',function(req,res,next){
  var userId=req.cookies.userId,
      addressId=req.body.addressId;
  //可能前端忘记传送addressId的值，属于逻辑层的错误，可以人为提示错误信息
  if(!addressId){
    res.json({
      status:'1003',
      message:"addressId is null",
      result:''
    });
  }else{
    Users.findOne({
      userId:userId
    },function(err,doc){
      //这个属于系统错误，在数据库找不到数据
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        if(doc){
          doc.addressList.forEach((item)=>{
            if(item.addressId==addressId)
            {
              item.isDefault=true;
            }else{
              item.isDefault=false;
            }
          });

          doc.save(function(err1,doc1){
            if(err1){
              res.json({
                status:'1',
                msg:err.message,
                result:''
              });
            }else{
              res.json({
                status:'0',
                msg:'',
                result:''
              });
            }
          })
        }
      }
    });
  }
});

//删除地址的接口
router.post('/delAddress',function(req,res,next){
  var userId=req.cookies.userId,
      addressId=req.body.addressId;
  //视图更新
  Users.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  },function(err,doc){
    if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
    }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        });
    }
  })
});

//支付产生订单的接口
router.post('/payMent',function(req,res,next){
  var userId=req.cookies.userId,
      addressId=req.body.addressId,
      orderTotal=req.body.orderTotal;
  //将订单保存到当前用户名下
  Users.findOne({
    userId:userId
  },function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      var address='';
      //获取当前用户的地址信息
      doc.addressList.forEach((item)=>{
        if(item.addressId==addressId)
        {
          address=item;
        }
      });
      //获取当前用户购买的商品列表
      var goodsList=doc.cartList.filter((item)=>{
        //判断结果为true则保留返回，false则过滤掉
        return item.checked=='1';
      });
      //产生订单编号
      var platform='622';
      var r1=Math.floor(Math.random()*10);
      var r2=Math.floor(Math.random()*10);
      var sysDate=new Date().Format("yyyyMMddhhmmss");
      var createDate=new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId=platform+r1+sysDate+r2;
      var order={
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      }
      //加到订单列表
      doc.orderList.push(order);
      //保存文档
      doc.save(function(err1,doc1){
        if(err1){
          res.json({
            status:"1",
            msg:err.message,
            result:''
          });
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          });
        }
      });
    }
  });
});

//根据订单Id查询订单信息的接口
router.get('/orderDetail',function(req,res,next){
  var userId=req.cookies.userId,
      orderId=req.param('orderId');
   Users.findOne({
     userId:userId
   },function(err,userDoc){
     if(err)
     {
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
     }else{
       var orderList=userDoc.orderList;
       if(orderList.length>0)
       {
          var orderTotal=0;
          orderList.forEach((item)=>{
            if(item.orderId==orderId)
            {
              orderTotal=item.orderTotal
            }
          });
          if(orderTotal>0)
          {
            res.json({
              status:'0',
              msg:'',
              result:
              {
                orderId:orderId,
                orderTotal:orderTotal
              }
            })
          }else{
            res.json({
              status:'120002',
              msg:'此订单有误',
              result:''
            })
          }
       }else{
         res.json({
           status:'120001',
           msg:'当前用户未创建订单',
           result:''
         })
       }
     }
   }) 
});

//获取购物车的商品数量
router.get('/getCartCount',function(req,res,next){
  if(req.cookies && req.cookies.userId){
    var userId=req.cookies.userId;
    Users.findOne({
      userId:userId
    },function(err,doc){
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        let cartList=doc.cartList;
        let cartCount=0;
        cartList.map((item)=>{
          //productNum是String类型
          cartCount+=parseInt(item.productNum);
        });
        res.json({
          status:'0',
          msg:'',
          result:cartCount
        })
      }
    });
  }else{
    //登录以后才访问此接口，若不存在userId,则说明该用户不存在数据库中
    res.json({
       status:'1',
       msg:'当前用户不存在',
       result:''
    })
  }
})

module.exports = router;
