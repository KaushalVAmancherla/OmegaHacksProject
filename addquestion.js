function addquestion() {
	var table = document.getElementById("questiontable");
	var tableLength = table.rows.length;

	var row = table.insertRow(tableLength);
	
	var question = row.insertCell(0);
	var choiceOne = row.insertCell(1);
	var choiceTwo = row.insertCell(2);
	var choiceThree = row.insertCell(3);
	var choiceFour = row.insertCell(4);
	var choiceCorrect = row.insertCell(5);

	quesiton.innerHTML = "ABCD";
	choiceOne.innerHTML = "ABCD";
	choiceTwo.innerHTML = "ABCD";
	choiceThree.innerHTML = "ABCD";
	choiceFour.innerHTML = "ABCD";
	choiceCorrect.innerHTML = "ABCD";

}