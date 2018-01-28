var express = require('express');
var router = express.Router();

// Connectionを定義する
var Connection = require('tedious').Connection;

// SQLServerの接続定義を記載する。
var config = {
    userName: 'DBへの接続ユーザ名',
    password: 'DBへの接続ユーザパスワード',
    server: '接続するSQLServerのIP',
}


/* GET users listing. */
router.get('/', function(req, res, next) {

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
        res.render('sample', { title: 'sqlserver-sample', content: content });
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

module.exports = router;
