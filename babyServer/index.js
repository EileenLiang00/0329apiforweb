const express = require('express');
const cool = require('cool-ascii-faces');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const statusCode = require('./statusCode.json');
const { urlencoded } = require('express');
const { stat } = require('fs');
const jwt = require('jsonwebtoken');
const secret = 'test_token_123';  

// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .get('/cool', (req, res) => res.send(cool()))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));


app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb', extended: true }));

app.use(express.urlencoded({extended:false}));
app.options('*', cors());

const config = {
    user: 'babyuser',
    password: 'Mcu123',
    server: 'himhealth.mcu.edu.tw',
    port:8081,
    database: 'BabyCPR',
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    }
}


app.get('/user', async function(req, res)  {
    let status, statusMessage, data;
    try{
        await sql.connect(config);
        let result = await sql.query('select * from [dbo].[UserList] ');
        if(result.recordset.length === 0){
            status = statusCode.error_select.status;
            statusMessage = statusCode.error_select.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, text:statusMessage, data: data});//顯示
        sql.close();
    }
   
})

app.post('/login',async function(req, res) {
    let status, statusMessage, data;

    try{
        if(req.body.email === '' && req.body.password === ''){
            status = statusCode.error_check_data.status;
            statusMessage = statusCode.error_check_data.textMessage;
            data = {};
        }
        await sql.connect(config);
        
        let result = await sql.query(`select [Id],[UserName], [Gender], [Telephone], [Email],[Password] from [dbo].[UserList] where Email = '${req.body.Email}' and Password = '${req.body.Password}'`);
        console.log(result.recordset);
        if(result.recordset.length === 1){
            const payload = {
                Id: result.recordset[0]['Id'],
                UserName: result.recordset[0]['UserName'],
                Gender: result.recordset[0]['Gender'],
                Telephone: result.recordset[0]['Telephone'],
                Email: result.recordset[0]['Email'],
                Password: result.recordset[0]['Password']
            }
            let token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 1) }, secret);//暫存1小時

            
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = token;
        }
        else{
            status = statusCode.error_login.status;
            statusMessage = statusCode.error_login.textMessage;
            data = {};
        }
        
    }
    catch(error){
        status = statusCode.error_unknow.status;
        statusMessage = statusCode.error_unknow.textMessage;
        data = {};
        console.log('error:' + error);
    }
    finally{
        res.send({status: status, textMessage: statusMessage, data: data});
        sql.close();
    }
})

//註冊
app.post('/signup', async function(req, res) {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        if(req.body.name === '' || req.body.email === '' || req.body.password === '' || req.body.telephone === ''){
            status = statusCode.error_check_data.status;
            statusMessage = statusCode.error_check_data.textMessage;
            data = {};
        }
        else{
            let isExist = await sql.query(`select [Email] from [dbo].[UserList] where Email = '${req.body.Email}'`);
            if(isExist.recordset.length !== 0){
                status = statusCode.error_signup.status;
                statusMessage = statusCode.error_signup.textMessage;
                data = {};
            }
            else
            {
                let result = await sql.query(`insert into [dbo].[UserList] ([UserName], [Email], [Password], [Telephone]) values ('${req.body.UserName}', '${req.body.Email}', '${req.body.Password}','${req.body.Telephone}')`);
                if(result.rowsAffected.length === 1){
                    status = statusCode.success.status;
                    statusMessage = statusCode.success.textMessage;
                    data = result.recordset;
                }
                else{
                    status = statusCode.error_insert.status;
                    statusMessage = statusCode.error_insert.textMessage;
                    data = {};
                }
            }
            
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({ status: status, text: statusMessage, data: data});//text這個名稱才是傳到前端的變數，所以前端的interface要設text
        sql.close();
    }
} )

//衛教
//母乳哺育
app.get('/Health1', async function(req, res)  {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        let result = await sql.query('select * from [dbo].[HealthEducation] where [Id] = 1');
        if(result.recordset.length === 0){
            status = statusCode.error_select.status;
            statusMessage = statusCode.error_select.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, text:statusMessage, data: data});
        sql.close();
    }
   
})
//照護
app.get('/Health2', async function(req, res)  {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        let result = await sql.query('select * from [dbo].[HealthEducation] where [Id] = 2');
        if(result.recordset.length === 0){
            status = statusCode.error_select.status;
            statusMessage = statusCode.error_select.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, text:statusMessage, data: data});
        sql.close();
    }
   
})
//疾病
app.get('/Health3', async function(req, res)  {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        let result = await sql.query('select * from [dbo].[HealthEducation] where [Id] = 3');
        if(result.recordset.length === 0){
            status = statusCode.error_select.status;
            statusMessage = statusCode.error_select.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, text:statusMessage, data: data});
        sql.close();
    }
   
})
//急救
app.get('/Health4', async function(req, res)  {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        let result = await sql.query('select * from [dbo].[HealthEducation] where [Id] = 4');
        if(result.recordset.length === 0){
            status = statusCode.error_select.status;
            statusMessage = statusCode.error_select.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
    }
    catch(error){
        status = statusCode.error_other.status;
        statusMessage = statusCode.error_other.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, text:statusMessage, data: data});
        sql.close();
    }
   
})
//留言
app.get('/Message',async function(req, res) {
    let status, statusMessage, data;

    try{
        await sql.connect(config);
        let result = await sql.query(`select * from [dbo].[Message] order by Id desc`);
        if(result.recordset.length === 0){
            status = statusCode.error_database_syntax.status;
            statusMessage = statusCode.error_database_syntax.textMessage;
            data = {};
        }
        else{
            status = statusCode.success.status;
            statusMessage = statusCode.success.textMessage;
            data = result.recordset;
        }
        
    }
    catch(error){
        status = statusCode.error_unknow.status;
        statusMessage = statusCode.error_unknow.textMessage;
        data = {};
        console.log(error);
    }
    finally{
        res.send({status: status, textMessage: statusMessage, data: data});
        sql.close();
    }
})
//留言(新增)
app.post('/addMessage',async function(req, res) {
    console.log("name:" +req.body.date);
    let status, statusMessage, data;

    if(req.body.name == "" || req.body.content == "" || req.body.date == "")
    {
        status = statusCode.error_check_data.status;
        statusMessage = statusCode.error_check_data.textMessage;
        data = {};
    }
    else
    {
        try{
            await sql.connect(config);
            let result = await sql.query(`insert into [dbo].[Message] ([name], [content], [date]) values ('${req.body.name}', '${req.body.content}', '${req.body.date}')`);
            if(result.rowsAffected.length === 1){
                status = statusCode.success.status;
                statusMessage = statusCode.success.textMessage;
                data = result.recordset;
            }
            else{
                status = statusCode.error_insert.status;
                statusMessage = statusCode.error_insert.textMessage;
                data = {};
            }
            
        }
        catch(error){
            status = statusCode.error_unknow.status;
            statusMessage = statusCode.error_unknow.textMessage;
            data = {};
            console.log(error);
        }
        finally{
            res.send({status: status, textMessage: statusMessage, data: data});
            sql.close();
        }
    }
})

//刪除留言
//留言(新增)
app.delete('/Message/:Id',async function(req, res) {
    console.log("name:" +req.body.date);
    let status, statusMessage, data;

    if(req.params.Id === '')
    {
        status = statusCode.error_check_data.status;
        statusMessage = statusCode.error_check_data.textMessage;
        data = {};
    }
    else
    {
        try{
            await sql.connect(config);
            let result = await sql.query(`delete from [dbo].[Message] Where Id = '${req.params.Id}'`);
            if(result.rowsAffected.length === 1){
                status = statusCode.success.status;
                statusMessage = statusCode.success.textMessage;
                data = result.recordset;
            }
            else{
                status = statusCode.error_insert.status;
                statusMessage = statusCode.error_insert.textMessage;
                data = {};
            }
            
        }
        catch(error){
            status = statusCode.error_unknow.status;
            statusMessage = statusCode.error_unknow.textMessage;
            data = {};
            console.log(error);
        }
        finally{
            res.send({status: status, textMessage: statusMessage, data: data});
            sql.close();
        }
    }
})

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(PORT, function () {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});