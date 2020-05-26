const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

var codemap = require('memory-cache');
var startedmap = require('memory-cache');

var questionmap = require('memory-cache');
var c1map = require('memory-cache');
var c2map = require('memory-cache');
var c3map = require('memory-cache');
var c4map = require('memory-cache');
var answermap = require('memory-cache');

var timemap = require('memory-cache');
var deadlinemap = require('memory-cache');

var resultmap = require('memory-cache');
var stumap = require('memory-cache');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded());

app.set('view engine', 'ejs');
app.engine('html',require('ejs').renderFile);


app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname + '/index.html'));
	}
)

app.get('/studenthome', (req, res) => {
		res.sendFile(path.join(__dirname + '/studenthome.html'));
	}
)

app.post('/teacherhome', (req, res) => {
		//console.log(req.body);
		
		var Q = req.body.Q;
		questionmap.put('Q',Q);

		var C1 = req.body.C1;
		c1map.put('C1',C1);

		var C2 = req.body.C2;	
		c2map.put('C2',C2);

		var C3 = req.body.C3;
		c3map.put('C3',C3);

		var C4 = req.body.C4;
		c4map.put('C4',C4);

		var Ans = req.body.chosen;
		answermap.put('Ans',Ans);

		res.sendFile(path.join(__dirname + '/teacherhome.html'));
	}
)

app.get('/createtest', (req, res) => {
	res.sendFile(path.join(__dirname + '/createtest.html'));
})


app.post('/studentjoin', (req, res) => {
		const name = req.body.fullname;
		const classcode = req.body.code;

		var zoomlink = codemap.get(classcode);

		var currstu = stumap.get('students');
		if(currstu) {
			currstu += "," + name;
		}else {
			currstu = name;
		}

		stumap.put('students', currstu);
		//console.log("PUT=" + currstu);
		if(zoomlink)
		{
			res.render('joinsession.html', {name:name, zoomlink:zoomlink});
		}else
		{
			console.log('Invalid class code. Please check your code again or contact your teacher.');
		}
	}
)	

app.post('/pretest', (req, res) => {
		const zoomlink = req.body.zoom;
		const classcode = req.body.code;
		const time = req.body.time;

		codemap.put(classcode, zoomlink);
		timemap.put('time',time);

		res.render('pretest.html', {zoomlink:zoomlink,classcode:classcode});
	}
)	

app.post('/sharedviewteacher', (req, res) => {
		const started = req.body.started;
		startedmap.put('started', started);

		var Q = questionmap.get('Q');
		var c1 = c1map.get('C1');
		var c2 = c2map.get('C2');
		var c3 = c3map.get('C3');
		var c4 = c4map.get('C4');
		var ans = answermap.get('Ans'); 

		var time = timemap.get('time');

		var today = new Date();
		var deadline = new Date(today.getTime() + time*60000);
		
		var day = deadline.getDate();
		var year = deadline.getFullYear();
		var month = deadline.getMonth() + 1; 

		var seconds = 0;
		var minutes = deadline.getMinutes()+1;

		var hour = deadline.getHours();
		var ampm = "AM";

		if(hour>12) {
			ampm = "PM";
			hour = hour-12;
		}

		if(seconds<10)
		{
			seconds = "0" + seconds;
		}

		if(minutes<10)
		{
			minutes = "0" + minutes;
		}

		var formatted = month + "/" + day + "/" + year + ", " + hour + ":" + minutes + ":" + seconds + " " + ampm;

		deadlinemap.put('deadline',formatted);

		var currstu = stumap.get('students');
		//console.log("GET=" + currstu);		
		res.render('sharedviewteacher.html', {time:time, deadline:formatted, students: currstu});
	}
)	

app.post('/refreshdash', (req, res) => {
		const time = req.body.time;
		const deadline = req.body.deadline;
		var currstu = stumap.get('students');		
		//console.log("GET=" + currstu);				
		res.render('sharedviewteacher.html', {time:time, deadline:deadline, students: currstu});
})

app.post('/sharedviewstudent', (req, res) => {
		var started = startedmap.get('started');
		var time = timemap.get('time');
		var deadline = deadlinemap.get('deadline');

		var name = req.body.name;
		//console.log(req.body.name);

		var Q = questionmap.get('Q');
		var c1 = c1map.get('C1');
		var c2 = c2map.get('C2');
		var c3 = c3map.get('C3');
		var c4 = c4map.get('C4');

		if(started)
		{
			res.render('sharedviewstudent.html', {name:name, time:time, deadline:deadline, Q:Q, c1:c1, c2:c2, c3:c3, c4:c4});
		}else
		{
			console.log('TEAHCER DID NOT START SESSION');
		}
	}
)	

app.post('/studentresult', (req, res) => {
	/*
	console.log(req.body.name);
	console.log(req.body.chosen);
	console.log(answermap.get('Ans'));
	*/
	var name = req.body.name;

	var studentanswers = req.body.chosen + '';
	var correctanswers = answermap.get('Ans') + '';

	var correctanswersSplit = correctanswers.split(',');
	var studentanswersSplit = studentanswers.split(',');

	var score = 0;
	
	for(let i=0;i<correctanswersSplit.length;i++)
		if(studentanswersSplit[i] === correctanswersSplit[i])
			score++;
	
	var total = correctanswersSplit.length;

	var incorrect = total - score;
	var grade = ((score/total) * 100).toFixed(2);
		
	var newresult = name + ',' + total + ',' + score + ',' + incorrect + ',' + grade;
	var currentresult = resultmap.get('studentresult');

	if(currentresult)
	{
		currentresult += '|' + newresult;
	}else
	{
		currentresult = newresult;
	}

	//console.log("PUT=" + currentresult);
	resultmap.put('studentresult', currentresult);

	res.render('studentresult.html', {name:name, total:total, score:score, incorrect:incorrect, grade:grade});

})

app.post('/teacherresult', (req, res) => {
	var studentresult = resultmap.get('studentresult');
	//console.log("GET=" + studentresult);
	res.render('teacherresult.html', {studentresult: studentresult});
});

app.listen(port, () => console.log('App listening at http://localhost:' + port));