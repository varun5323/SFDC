({
    createChart : function (component) {
        var ready = component.get("v.ready");
        if (ready === false) {
            return;
        }
        var chartCanvas = component.find("chart").getElement();
        
        var action = component.get("c.getreport");
        action.setParams({
            "ReportName": component.get('v.reportName')
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var reportResultData = JSON.parse(response.getReturnValue());
                var chartData = [];
                var chartLabels = [];
                for(var i=0; i < (reportResultData.groupingsDown.groupings.length); i++){
                    //Collect all labels for Chart.js data
                    var labelTemp = reportResultData.groupingsDown.groupings[i].label;
                    chartLabels.push(labelTemp);

                    var keyTemp = reportResultData.groupingsDown.groupings[i].key;

                    //Collect all values for Chart.js data
                    var valueTemp = reportResultData.factMap[keyTemp + '!T'].aggregates[0].value ;
                    chartData.push(valueTemp);
                }
                //Construct chart
                var chart = new Chart(chartCanvas,{
                    type: 'doughnut',
                    data: {
                        labels: chartLabels,
                        datasets: [
                            {
                                label: "test",
                                data: chartData,
                                backgroundColor: [
                                    "#52BE80",
                                    "#76D7C4",
                                    "#1E8449",
                                    "#2ECC71",
                                    "#FFB74D",
                                    "#E67E22",
                                    "#F8C471",
                                    "#3498DB",
                                    "#00BCD4",
                                    "#D32F2F",
                                    "#82E0AA",
                                    "#AFB42B"
                                ]
                            }
                        ]
                    },
                    options: {
                        cutoutPercentage: 75,
                        maintainAspectRatio: false,
                        legend: {
                            display: true,
                            position:'right',
                            fullWidth:false,
                            reverse:true,
                            labels: {
                                fontColor: '#000',
                                fontSize:10,
                                fontFamily:"Salesforce Sans, Arial, sans-serif SANS_SERIF"
                            },
                            layout: {
                                padding: 70,
                            }
                        }
                    }
                });
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message on createReport: " +
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    }
	/*createChart : function (component) {
        var ready = component.get("v.ready");
        if (ready === false) {
            alert('False');
            return;
        }
        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
		
	}*/
})