const express = require('express');
const app = express();


app.use('/public', express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.get('/hello', (req,res) => {
    res.render('index');
});

app.listen(3000, () => console.log('Server On'));
