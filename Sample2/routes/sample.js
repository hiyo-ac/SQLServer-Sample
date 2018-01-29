var express = require('express');
var router = express.Router();

// Connectionを定義する
var Connection = require('tedious').Connection;

// SQLServerの接続定義を記載する。
var config = {
    userName: 'DB接続するアカウント',
    password: 'DB接続するアカウントのパスワード',
    server: 'DBサーバのIPアドレス',
}


/* GET users listing. */
router.get('/list', function(req, res, next) {

    var connection = new Connection(config);
    var content = []; // DBからselectした結果を格納する変数

    // DB接続した際のイベントハンドラ
    connection.on('connect', function(err){
        console.log("connected");
        executeStatement();
    });

    // DB接続を終了した際のイベントハンドラ
    // DB接続を切断した後に画面を描写する
    connection.on('end', function(){
        console.log("disconnected");
        res.render('list', { title: 'sqlserver-sample', content: content });
    });

    var Request = require('tedious').Request;

    // SQLを発行する関数
    function executeStatement(){
        // 発行するSQLを記載する
        request = new Request("SELECT * FROM TestDB.dbo.TB_TestTable with (NOLOCK)", function(err){
        if(err){
            console.log(err);}
        });

        var result = {}; // SQLの結果を行ごとにオブジェクトに格納する。
        // SQLの行ごとに実行するイベントハンドラ
        request.on('row', function(columns){
            columns.forEach(function(column){
                if(column.value === null){
                    console.log('NULL');
                }else{
                    result[column.metadata.colName] = column.value;
                } 
            });
            content.push(result);
            result = {};
        });

        // SQLのリクエスト完了時のイベントハンドラ。
        // コネクションをクローズしないとDBにいらないプロセスが残るので、コネクションをクローズする。
        request.on('requestCompleted', function(){
            console.log('requestCompleted');
            connection.close();
        });

        // DBへSQLを発行する。
        connection.execSql(request);
    }

});

// フォームを表示する
router.get('/form', function(req, res, next) {
    res.render('form', { title: 'sqlserver-sample-form'});   
});

// レコードを追加する
router.post('/submit', function(req, res, next) {
    var connection = new Connection(config); 

    // DB接続した際のイベントハンドラ
    connection.on('connect', function(err){
        console.log("connected");
        submitStatement();
    });

    // DB接続を終了した際のイベントハンドラ
    // DB接続を切断した後に画面を描写する
    connection.on('end', function(){
        console.log("disconnected");
        res.redirect('/sample/list');   
    });

    var Request = require('tedious').Request;
    var TYPES = require('tedious').TYPES;

        // SQLを発行する関数
    function submitStatement(){
       // 発行するSQLを記載する
        request = new Request("INSERT INTO TestDB.dbo.TB_TestTable (NAME, MAIL) VALUES (@name, @mail);", function(err){
        if(err){
            console.log(err);}
        });
 
        request.addParameter('name', TYPES.VarChar, req.body.name);
        request.addParameter('mail', TYPES.VarChar, req.body.mail);
        
        // SQLの行ごとに実行するイベントハンドラ
        request.on('row', function(columns){
            columns.forEach(function(column){
                if(column.value === null){
                    console.log('NULL');
                }else{
                    console.log('INSERT ' + column.value);
                } 
            });
        });
   
        // SQLのリクエスト完了時のイベントハンドラ。
        // コネクションをクローズしないとDBにいらないプロセスが残るので、コネクションをクローズする。
        request.on('requestCompleted', function(){
            console.log('requestCompleted');
            connection.close();
        });

                // SQLのリクエスト完了時のイベントハンドラ。
        // コネクションをクローズしないとDBにいらないプロセスが残るので、コネクションをクローズする。
        request.on('done', function(){
            console.log('done');
            connection.close();
        });
    
        // DBへSQLを発行する。
        connection.execSql(request);
        }
});

module.exports = router;
