var userPosition = '';

Plotly.d3.csv('orderstable.csv', function (data) {
    document.getElementById('dvYear').style.display = 'none';
    //let plotData = GetOrdersByYear(data);
    let plotData = GetOrdersByYear_Bar(data);
    var layout = {
        title: "Orders Report",
        xaxis: { title: "Year", dtick: 1 },
        yaxis: { title: "Total Orders" },
        showlegend: false,
        autosize: true
    };

    Plotly.newPlot('dvOrders', plotData, layout);

    // Events

    setTimeout(function () {
        let myGraph = document.getElementById('dvOrders');
        myGraph.on('plotly_click', function (data) {
            document.getElementById('dvOrders').style.display = 'none';
            var year = data.points[0].x;
            window.sessionStorage.setItem("YEAR", year);
            userPosition = "M";
            ShowOrdersOfGivenYear(year);
        });
    }, 1500);
});

function ShowOrdersOfGivenYear(year) {
    document.getElementById('dvYear').style.display = '';
    Plotly.d3.csv('orderstable.csv', function (data) {
        const matchedYearData = data.filter(t => new Date(t.OrderDate).getFullYear() == year);
        // const plotData = GetMonthlyOrders(matchedYearData);
        const plotData = GetMonthlyOrders_Bar(matchedYearData);
        var layout = {
            title: "Orders Report of " + year.toString(),
            xaxis: { title: "Months" },
            yaxis: { title: "Total Orders" },
            showlegend: false
        };
        Plotly.newPlot('dvYear', plotData, layout);

        // Events
        let myGraph = document.getElementById('dvYear');
        setTimeout(function () {
            myGraph.on('plotly_click', function (data) {
                document.getElementById('dvYear').style.display = 'none';
                var mnth = data.points[0].x;
                window.sessionStorage.setItem("MONTH", mnth);
                let year = window.sessionStorage.getItem("YEAR");
                userPosition = "D";
                ShowOrdersOfGivenMonth_Bar(mnth, year.toString());
                //ShowOrdersOfGivenMonth(mnth);
            });
        }, 1500);

    });
}

function GetFormattedDate(date) {
    var month = (date.getMonth() + 1);
    var day = (date.getDate());
    var year = (date.getFullYear());
    return month + "/" + day + "/" + year;
}

function getDaysInMonth(month, year) {
    var date = new Date(year, month, 1);
    var days = [];
    var daysString = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    for (let i = 0; i < days.length; i++) {
        daysString.push(GetFormattedDate(days[i]));
    }
    return daysString;
}

function ShowOrdersOfGivenMonth_Bar(month, year) {
    document.getElementById('dvMonth').style.display = '';
    Plotly.d3.csv('orderstable.csv', function (data) {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //const matchedMonthData = data.filter(t => new Date(t.OrderDate).getMonth() == monthNames.indexOf(month));
        // const plotData = GetDayOrders(matchedMonthData);
        let daysInMonth = getDaysInMonth(monthNames.indexOf(month), year);
        console.log(daysInMonth);
        let yData = [];
        let xData = [];
        let widthArr = [];
        for (let i = 0; i < daysInMonth.length; i++) {
            let tempD = daysInMonth[i];// daysInMonth[i].getMonth() + 1 + "/" + daysInMonth[i].getDay() + "/" + daysInMonth[i].getFullYear();
            let matchedData = data.filter(t => t.OrderDate == tempD);
            xData.push(tempD);
            yData.push(matchedData.length);
            widthArr.push(0.5);
        }
        let plotData = [];
        plotData.push({
            x: xData,
            y: yData,
            type: 'bar',
            width: widthArr
        });
        var layout = {
            title: "Orders Report of " + monthNames[monthNames.indexOf(month)],
            xaxis: { title: "Days" },
            yaxis: { title: "Total Orders", dtick: 1 },
            showlegend: false,
        };
        Plotly.newPlot('dvMonth', plotData, layout);
    });
}

function ShowOrdersOfGivenMonth(month) {
    document.getElementById('dvMonth').style.display = '';
    Plotly.d3.csv('orderstable.csv', function (data) {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const matchedMonthData = data.filter(t => new Date(t.OrderDate).getMonth() == monthNames.indexOf(month));
        const plotData = GetDayOrders(matchedMonthData);
        var layout = {
            title: "Orders Report of " + monthNames[monthNames.indexOf(month)],
            xaxis: { title: "Days" },
            yaxis: { title: "Total Orders", dtick: 1 },
            showlegend: false
        };
        Plotly.newPlot('dvMonth', plotData, layout);
    });
}

function GetMonthlyOrders(data) {
    if (data != null && data.length > 0) {
        let colorCodes = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
            '#000000', '#FF0000', '#fbeee6', '#FFFF00', '#00FF00', '#008000', '#00FFFF', '#0000FF', '#000080', '#FF00FF'];
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let temp = data;
        temp = temp.map(item => {
            return {
                OrderID: item.OrderID,
                CustomerID: item.CustomerID,
                EmployeeID: item.EmployeeID,
                OrderDate: monthNames[new Date(item.OrderDate).getMonth()].toString(),
                ShipperID: item.ShipperID
            }
        });

        let monthCounter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        let colorIndex = 0;

        const plotData = monthCounter.map(item => {
            var d = temp.filter(r => r.OrderDate == monthNames[colorIndex]);
            colorIndex = colorIndex + 1;
            // Shows postal codes as lables
            return {
                type: 'histogram',
                name: item.toString(),
                x: d.map(c => c.OrderDate),
                y: d.map(k => k.OrderID).length,
                marker: {
                    color: '#008080'//colorCodes[colorIndex - 1]
                }
            }
        });
        return plotData;
    }
}

function GetMonthlyOrders_Bar(data) {
    let plotData = [];

    if (data != null && data.length > 0) {
        let colorCodes = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
            '#000000', '#FF0000', '#fbeee6', '#FFFF00', '#00FF00', '#008000', '#00FFFF', '#0000FF', '#000080', '#FF00FF'];
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let yData = [];

        let temp = data;
        temp = temp.map(item => {
            return {
                OrderID: item.OrderID,
                CustomerID: item.CustomerID,
                EmployeeID: item.EmployeeID,
                OrderDate: monthNames[new Date(item.OrderDate).getMonth()].toString(),
                ShipperID: item.ShipperID
            }
        });

        for (let i = 0; i < monthNames.length; i++) {
            var d = temp.filter(r => r.OrderDate == monthNames[i]);
            yData.push(d.length);
        }

        plotData.push({
            x: monthNames,
            y: yData,
            type: 'bar',
            width: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
        });

    }
    return plotData;
}

function GetOrdersByYear_Bar(data) {
    let plotData = [];
    if (data != null && data.length > 0) {
        // Get the years
        let uniquYears = [];
        let yData = [];
        let widthArray = [0.1, 0.1];
        let colorCodes = ["#0000FF", "#FF0000"];

        for (let i = 0; i < data.length; i++) {
            let dateTemp = data[i].OrderDate;

            let dObj = new Date(dateTemp);
            let year = dObj.getFullYear();

            if (uniquYears.indexOf(year) < 0)
                uniquYears.push(year);
        }

        let temp = data;

        temp = temp.map(item => {
            return {
                OrderID: item.OrderID,
                CustomerID: item.CustomerID,
                EmployeeID: item.EmployeeID,
                OrderDate: new Date(item.OrderDate).getFullYear().toString(),
                ShipperID: item.ShipperID
            }
        });

        for (let i = 0; i < uniquYears.length; i++) {
            let matchedData = temp.filter(t => t.OrderDate == uniquYears[i]);
            yData.push(matchedData.length);
        }
        plotData.push({
            x: uniquYears,
            y: yData,
            type: 'bar',
            width: widthArray,
            //autosize: true
        });
    }

    return plotData;
}

function GetOrdersByYear(data) {
    if (data != null && data.length > 0) {
        // Get the years
        let uniquYears = [];
        let colorCodes = ["#0000FF", "#FF0000"];

        for (let i = 0; i < data.length; i++) {
            let dateTemp = data[i].OrderDate;

            let dObj = new Date(dateTemp);
            let year = dObj.getFullYear();

            if (uniquYears.indexOf(year) < 0)
                uniquYears.push(year);
        }

        let temp = data;

        temp = temp.map(item => {
            return {
                OrderID: item.OrderID,
                CustomerID: item.CustomerID,
                EmployeeID: item.EmployeeID,
                OrderDate: new Date(item.OrderDate).getFullYear().toString(),
                ShipperID: item.ShipperID
            }
        });
        let colorIndex = 0;
        const plotData = uniquYears.map(item => {
            var d = temp.filter(r => r.OrderDate == item);
            colorIndex = colorIndex + 1;
            // Shows postal codes as lables
            return {
                type: 'histogram',
                name: item.toString(),
                x: d.map(c => c.OrderDate),
                y: d.map(k => k.OrderID).length,
                marker: {
                    color: '#008080'//colorCodes[colorIndex - 1]
                }
            }
        });
        return plotData;
    }
}

function GetDayOrders(data) {
    if (data != null && data.length > 0) {
        let colorCodes = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
            '#000000', '#FF0000', '#fbeee6', '#FFFF00', '#00FF00', '#008000', '#00FFFF', '#0000FF', '#000080', '#FF00FF'];
        let dayCounter = [];

        for (let i = 0; i < 31; i++) {
            dayCounter.push(i);
        }
        let colorIndex = 0;

        let temp = data;

        temp = temp.map(item => {
            return {
                OrderID: item.OrderID,
                CustomerID: item.CustomerID,
                EmployeeID: item.EmployeeID,
                TempDate: new Date(item.OrderDate).getDate(),
                OrderDate: item.OrderDate,
                ShipperID: item.ShipperID
            }
        });

        const plotData = dayCounter.map(item => {
            var d = temp.filter(r => r.TempDate == item);
            colorIndex = colorIndex + 1;
            return {
                type: 'histogram',
                name: GetOrderId(d.map(c => c.OrderID)),
                x: d.map(c => c.OrderDate),
                y: d.map(k => k.OrderID).length,
                marker: {
                    color: '#008080'//colorCodes[colorIndex - 1]
                },
            }
        });
        return plotData;
    }
}

function GetOrderId(data) {
    let orderId = '';
    if (data != null && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            orderId = orderId + data[i].toString() + ",";
        }
    }
    return orderId.slice(0, orderId.length - 1);
}

function Navigate() {
    let year = window.sessionStorage.getItem("YEAR");
    let month = window.sessionStorage.getItem("MONTH");
    if (userPosition == "M") {
        userPosition = "";
        window.location.href = "orders.html";
    }
    else if (userPosition == "D") {
        userPosition = "M";
        ShowOrdersOfGivenYear(year);
    }
    else {
        userPosition = "";
        window.location.href = "orders.html";
    }
}