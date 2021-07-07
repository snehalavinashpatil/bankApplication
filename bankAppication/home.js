var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyparser = require("body-parser");
var path = require('path');
var ejs = require('ejs');
var currentActiveUser = ' ';
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyparser.urlencoded({extended:false}));
var con = mysql.createConnection({
    host:"localhost",
    user:'root',
    password:"Snehal&1234",
    port:3306,
    database: "bankdb"
});
var currentActiveAccount,currentActiveAccountHolderName,currentActiveAccountBranch,currentActiveAccountBalance;
app.get('/',function(req,res){
    res.sendFile(__dirname+'/bankApplicationHomePage.html');
});
// app.get('/login',function(req,res){
//     res.sendFile(__dirname+'/login.html');
// });
app.get('/customerData',function(req,res){
    // res.sendFile(__dirname+'/customerData.html');
    var sql = "select * from custumerData where username= '"+currentActiveUser+"'";
    con.query(sql,function(err,result){
        if(err) throw err;
        res.render('customerData',{
            data:result
        });
    });
});
app.post('/loginData',function(req,res){
    var sname = req.body.sname;
    var pass = req.body.pass;

   if(sname && pass){
       con.query("select * from custumerData where username=? and passward=?",[sname,pass],function(err,result){
           if(result.length > 0){
               currentActiveUser = sname;
               res.redirect('/customerData');
           }else{
               res.send('Incorrect username and password');
           }
           res.end();
       });
   }else{
       res.send("Please enter username and password");
       res.end();
   }

});
app.get('/registerData',function(req,res){
    res.sendFile(__dirname+'/registerData.html');
});
app.post('/registerData',function(req,res){
    res.redirect('/registerData');
});
app.get('/verifyData',function(req,res){
    res.sendFile(__dirname+'/verifyData.html');
});
app.post('/verifyData',function(req,res){
    var accountNumber = req.body.accountNumber;
    var fullName = req.body.fullName;
    var accountBalance = req.body.accountBalance;
    var username = req.body.username;
    var pass = req.body.pass;
    var branch = req.body.branch;

    con.connect(function(err){
        var sql = "insert into custumerData(accountNo,customerFullName,Balance,username,passward,branch) values('"+accountNumber+"','"+fullName+"','"+accountBalance+"','"+username+"','"+pass+"','"+branch+"')";
        con.query(sql,function(err,result){
            if(err)throw err;
            console.log("1 record inserted");
            res.redirect('/verifyData');
        });
    });
});
app.post('/checkData',function(req,res){
    res.redirect('/');
});
app.get('/transferMoney',function(req,res){
    con.query("select * from custumerData where accountNo=?",[currentActiveAccount],function(err,result){
        if(err) throw err;
        res.render('transferMoney',{
            currentAccountdetails:result
        });
    });
    // res.sendFile(__dirname+'/transfer.html');
});
app.post('/transfer', function(req, res){
    currentActiveAccount = req.body.number;
    currentActiveAccountHolderName = req.body.name;
    currentActiveAccountBranch = req.body.bname;
    currentActiveAccountBalance = Number(parseInt(req.body.Balance));
    res.redirect('/transferMoney');
  });

app.get('/transactionSuccessfull',function(req,res){
    res.sendFile(__dirname+'/transactionSuccessfull.html');
});

app.post('/logout', function(req, res){
    res.redirect('/');
});

app.post('/transactionData', function(req, res){
    var youraccountNo = req.body.Account;
    var RecipientaccountNo = req.body.Recipient;
    var TransferMoney = Number(parseInt(req.body.Money));
    
    if(youraccountNo && RecipientaccountNo && TransferMoney){
        console.log(currentActiveAccountBalance,"currentActiveAccountBalance testing");
        if(TransferMoney <= currentActiveAccountBalance){
            var RamainingBalance = Number(currentActiveAccountBalance - TransferMoney);
                con.query("update custumerData set Balance = '"+RamainingBalance+"'  where accountNo =' "+youraccountNo+"' ",function(err,result1){
                    if(result1){
                        con.query("select * from custumerData where accountNo=? ",[RecipientaccountNo],function(err,result2){
                            if(result2){
                                var RecipientCurrentBalance = parseInt(result2[0].Balance);
                                var RecipientAccountBalace = Number(parseInt(RecipientCurrentBalance) + parseInt(TransferMoney));
                                con.query("update custumerData set Balance = '"+RecipientAccountBalace+"'  where accountNo =' "+RecipientaccountNo+"' ",function(err,result3){
                                    // res.redirect('/transactionSuccessfull');
                                    res.redirect('/transactionSuccessfull');
                                });
                            }
                            // res.send('transactionSuccessfull');
                        });
                       
                    }else{
                        res.send('Transaction Failed');
                    }
                });
            }else{
                res.send("Not enough balance in your account.");
            }
    }else{
        res.send("Please enter Your and Recipient account details properly");
    }
    // res.end();
  });
app.listen(5000);
console.log("port 8080 listening");