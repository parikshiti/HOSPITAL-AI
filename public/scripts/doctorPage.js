var URL = location.protocol + '//' + location.host;

$(document).ready(function() {
    var hospitalNumber= window.location.pathname.split('/');

    var doctorAPI = URL + "/app/getdoctor/" + hospitalNumber[3];

    $("#form-doctor").attr("action", "/app/updatedoctor/" + hospitalNumber[3]);
    $("#delete-button").attr("href", "/app/deletedoctor/" + hospitalNumber[3]);

    $.getJSON(doctorAPI).done(function(doctor) {
       $("#first-name-disabled").attr("placeholder", doctor["firstName"]);
       $("#last-name-disabled").attr("placeholder", doctor["lastName"]);
       $("#hospitalNumber-disabled").attr("placeholder", doctor["hospitalNumber"]);
       $("#date-of-birth-disabled").attr("placeholder", doctor["dateOfBirth"]);
       $("#doctor-score").html(doctor["score"]);


/*
       Sex of the doctor
*/
       if (doctor["sex"] === true) {
           $("#doctor-sex-disabled").attr("placeholder", "Male");
       } else if (doctor["sex"] === false) {
           $("#doctor-sex-disabled").attr("placeholder", "Female");
       }

/*
      Room of the doctor
*/
       if (doctor["room"] === "noroom") {
           $("#doctor-room-disabled").attr("placeholder", 'No room assigned');
       } else {
           $("#doctor-room-disabled").attr("placeholder", 'Room: ' + doctor["room"]);

           var patientDeleteRoomLink = "/app/updateroom/" + hospitalNumber[3] + "/noroom";
           $("#doctor-room-disabled").after("<a id=\"delete-room-button\" class=\"btn btn-primary btn-lg btn-block\" href=\"" + patientDeleteRoomLink +"\">Move to waiting list</a>");
       }

/*
       Score panel
*/
       if (doctor["score"] <=5) {
           $("#panel-score").attr("class", "panel panel-primary");
       } else if (doctor["score"] < 25) {
           $("#panel-score").attr("class", "panel panel-yellow");
       } else if (doctor["score"] <= 35) {
           $("#panel-score").attr("class", "panel panel-orange");
       } else {
           $("#panel-score").attr("class", "panel panel-red");
       }

       var diseasesAPI = URL +"/app/getdiseases";
       $.getJSON(diseasesAPI).done(function(allDiseases) {
           var diseasesScoresCheckboxes = [];

           for(var disease in allDiseases) {
             var diseaseScoreCheckbox = [];
        	   diseaseScoreCheckbox[0] = disease;
        	   diseaseScoreCheckbox[1] = allDiseases[disease]; // This is the score.

        	   var input;
               if (doctor["diseases"].length !== 0) {
                   for(var i = 0; i < doctor["diseases"].length; i++) {
            	   	   if(disease === doctor["diseases"][i]) {
            	   	   	   input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\" checked>";
            	   	   	   break;
            	   	   } else {
            	   	        input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\">";
            	   	   }
            	   }
               } else {
                   input = "<input type=\"checkbox\" name=\"PD[]\" value=\"" + disease + "\">";
               }

          	diseaseScoreCheckbox[2] = input;
        	     diseasesScoresCheckboxes.push(diseaseScoreCheckbox)
           }

           // Add name, sex, number, age before the table.
           $('#diagnosis').dataTable({
		      data: diseasesScoresCheckboxes,
		      columns:[{
	              title: "Disease"
	           },{
	              title: "Score"
	           },{
	              title: "Diagnosis"
	           }],
		      scrollY: '40vh',
		      scrollCollapse: true,
		      paging: false,
                info: false,
                language: {
                sSearch: "Search disease"
              }
		   });
       });
    });
});
