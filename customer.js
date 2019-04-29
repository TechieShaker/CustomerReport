var glb_country = '';


function Navigate() {
    window.location.href = 'customers.html';
}

function ShowCountryMap() {
    document.getElementById('graph').style.display = 'none';
    let cntry = window.sessionStorage.getItem('GLB_CNTRY');
    createMap(cntry);
}


Plotly.d3.csv('customerstable_2.csv', function (data) {
    let plotData = GetDataByCountry(data);
    var layout = {
        title: "Customers Report",
        xaxis: { title: "Countries" },
        yaxis: { title: "Total Customers" },
        showlegend: false
    };

    Plotly.newPlot('graph', plotData, layout);

    // Events
    let myGraph = document.getElementById('graph');
    myGraph.on('plotly_click', function (data) {

        document.getElementById('graph').style.display = 'none';
        var country = data.points[0].x;
        glb_country = country;
        window.sessionStorage.setItem('GLB_CNTRY', glb_country);
        $('#spnBack').show();
        createMap(glb_country);
    });
});

function GetUSStates(usList) {
    let states = [];
    for (let i = 0; i < usList.length; i++) {
        if (states.indexOf(usList[i].State) < 0) {
            states.push(usList[i].State);
        }
    }
    return states;
}


function GetEuropCountries(dataList) {
    let countries = [];
    for (let i = 0; i < dataList.length; i++) {
        if (countries.indexOf(dataList[i].Country) < 0) {
            countries.push(dataList[i].Country);
        }
    }
    return countries;
}

function GetCountInEurope(dataList) {
    let countries = GetEuropCountries(dataList);
    let countArray = [];

    for (let i = 0; i < dataList.length; i++) {
        let matchedData = dataList.filter(t => t.Country == countries[i]);
        countArray.push(matchedData.length);
    }

    return countArray;
}

function GetCountInState(usList) {
    let states = GetUSStates(usList);
    let countArray = [];

    for (let i = 0; i < states.length; i++) {
        let matchedData = usList.filter(t => t.State == states[i]);
        countArray.push(matchedData.length);
    }

    return countArray;
}

function GetDataByCountry(data) {
    if (data != null && data.length > 0) {
        let countryCodes = [];
        let colorCodes = ["#FF0000", "#fbeee6", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF",
            "#800080", "#808080", "#FF5733", "#ffa833", "#808b96", "#800000"
        ];

        for (let i = 0; i < data.length; i++) {
            if (countryCodes.indexOf(data[i].Country) < 0) {
                countryCodes.push(data[i].Country);
            }
        }
        let colorIndex = 0;
        const plotData = countryCodes.map(cntry => {
            var d = data.filter(r => r.Country === cntry);
            colorIndex = colorIndex + 1;
            // Shows postal codes as lables
            return {
                type: 'histogram',
                name: cntry,
                x: d.map(c => c.Country),
                y: d.map(k => k.PostalCode).length,
                marker: {
                    color: '#008080'//colorCodes[colorIndex - 1]
                }
            }
        });
        return plotData;
    }
}

function createMap(country) {
    let europe = ["Germany", "Sweden", "France", "Spain", "Switzerland", "Austria", "Italy", "Portugal", "Belgium", "Norway", "Denmark", "Finland"];
    window.sessionStorage.setItem('IS_IN_CNTRY', 'Y');
    if (country == "USA") {
        document.getElementById('map').style.display = 'none';
        document.getElementById('southamericamap').style.display = 'none';
        document.getElementById('usmap').style.display = '';
        CreateUSMap();
    }
    else if (europe.indexOf(country) >= 0) {
        document.getElementById('usmap').style.display = 'none';
        document.getElementById('southamericamap').style.display = 'none';
        document.getElementById('map').style.display = '';

        CreateEuropeMap(europe);
    }
    else {
        document.getElementById('usmap').style.display = 'none';
        document.getElementById('map').style.display = 'none';
        document.getElementById('southamericamap').style.display = '';
        CreateSouthAmericaMap(europe);
    }
}

function GetZindex(dataArray, indicator) {
    let zIndex = [];
    if (dataArray) {
        let allCountries = dataArray.map(function (c) {
            return c.Country;
        });
        if (indicator == 'C') {
            let uniqueCntries = [];
            for (let i = 0; i < allCountries.length; i++) {
                if (uniqueCntries.indexOf(allCountries[i]) < 0)
                    uniqueCntries.push(allCountries[i]);
            }
            for (let i = 0; i < uniqueCntries.length; i++) {
                let matchedData = dataArray.filter(t => t.Country == uniqueCntries[i]);
                zIndex.push(matchedData.length);
            }
        }
    }
    return zIndex;
}


function CreateSouthAmericaMap(europe) {
    Plotly.d3.csv('customerstable_2.csv', function (err, rows) {
        function unpack(rows, key) {
            return rows.map(function (row) { return row[key]; });
        }
        let nonUSData = [];
        for (let i = 0; i < rows.length; i++) {
            if (europe.indexOf(rows[i].Country) < 0 && rows[i].Country != "USA") {
                nonUSData.push(rows[i]);
            }
        }

        var data = [{
            type: 'choropleth',
            locationmode: 'country names',
            locations: GetEuropCountries(nonUSData, 'Country'),
            z: GetCountInEurope(nonUSData),
            //text: unpack(nonUSData, 'Country'),
            colorscale: [
                [0, 'rgb(5, 10, 172)'], [0.35, 'rgb(40, 60, 190)'],
                [0.5, 'rgb(70, 100, 245)'], [0.6, 'rgb(90, 120, 245)'],
                [0.7, 'rgb(106, 137, 247)'], [1, 'rgb(220, 220, 220)']],
            autocolorscale: false,
            reversescale: true,
            marker: {
                line: {
                    color: 'rgb(180,180,180)',
                    width: 0.5
                }
            },
            tick0: 0,
            zmin: 0,
            dtick: 1000,
            colorbar: {
                autotic: false,
                tickprefix: '',
                title: 'South American Customers'
            },
        }];

        var layout = {
            title: 'South American Customers',
            geo: {
                width: 1000,
                height: 1000,
                showframe: true,
                showcoastlines: true,
                scope: 'south america',
                projection: {
                    type: 'robinson'//'equirectangular'//'robinson'// 'mercator'
                },
            }
        };

        Plotly.plot("southamericamap", data, layout, { showLink: false });

        // Events
        let map = document.getElementById('southamericamap');
        map.on('plotly_click', function (data) {
            document.getElementById('usmap').style.display = 'none';
            var country = data.points[0].location;
            CreateUSStateMap(country, nonUSData, 'C');
        });

    });
}

function CreateEuropeMap(europe) {
    Plotly.d3.csv('customerstable_2.csv', function (err, rows) {
        function unpack(rows, key) {
            return rows.map(function (row) { return row[key]; });
        }
        let nonUSData = [];
        for (let i = 0; i < rows.length; i++) {
            if (europe.indexOf(rows[i].Country) >= 0) {
                nonUSData.push(rows[i]);
            }
        }
        var data = [{
            type: 'choropleth',
            locationmode: 'country names',
            locations: GetEuropCountries(nonUSData),// unpack(nonUSData, 'Country'),
            z: GetCountInEurope(nonUSData),// unpack(nonUSData, 'PostalCode'),
            //text: unpack(nonUSData, 'Country'),
            colorscale: [
                [0, 'rgb(5, 10, 172)'], [0.35, 'rgb(40, 60, 190)'],
                [0.5, 'rgb(70, 100, 245)'], [0.6, 'rgb(90, 120, 245)'],
                [0.7, 'rgb(106, 137, 247)'], [1, 'rgb(220, 220, 220)']],
            autocolorscale: false,
            reversescale: true,
            marker: {
                line: {
                    color: 'rgb(180,180,180)',
                    width: 0.5
                }
            },
            tick0: 0,
            zmin: 0,
            dtick: 1000,
            colorbar: {
                autotic: false,
                tickprefix: '',
                title: 'European Customers'
            },
        }];

        var layout = {
            title: 'European Customers',
            geo: {
                width: 1000,
                height: 1000,
                showframe: true,
                showcoastlines: true,
                scope: 'europe',
                projection: {
                    type: 'robinson'//'equirectangular'//'robinson'// 'mercator'
                },
            }
        };

        Plotly.plot("map", data, layout, { showLink: false });

        // Events
        let map = document.getElementById('map');
        map.on('plotly_click', function (data) {
            document.getElementById('usmap').style.display = 'none';
            var country = data.points[0].location;
            CreateUSStateMap(country, nonUSData, 'C');
        });
    });

}

function CreateUSStateMap(value, usData, indicator) {
    let statesTemp = [];
    for (let i = 0; i < usData.length; i++) {
        if (indicator != 'C') {
            if (usData[i].State == value) {
                statesTemp.push(usData[i]);
            }
        }
        else {
            if (usData[i].Country == value) {
                statesTemp.push(usData[i]);
            }
        }

    }

    window.sessionStorage.setItem('stateDetails', JSON.stringify(statesTemp));
    window.location.href = 'customermap.html';
}

function CreateUSMap() {
    Plotly.d3.csv('customerstable_2.csv', function (data) {
        if (data != null && data.length > 0) {
            let usData = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].Country == "USA") {
                    usData.push(data[i]);
                }
            }
            var data = [{
                type: 'choropleth',
                locationmode: 'USA-states',
                locations: GetUSStates(usData),// unpack(usData, 'State'),
                z: GetCountInState(usData),// unpack(usData, 'PostalCode'),
                //text: unpack(usData, 'State'),
                colorscale: [
                    [0, 'rgb(242,240,247)'], [0.2, 'rgb(218,218,235)'],
                    [0.4, 'rgb(188,189,220)'], [0.6, 'rgb(158,154,200)'],
                    [0.8, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
                ],
                //autocolorscale: false,
                //reversescale: true,
                colorbar: {
                    title: 'USA Customers',
                    thickness: 0.2
                },
                marker: {
                    line: {
                        color: 'rgb(180,180,180)',
                        width: 0.5
                    }
                },
                tick0: 0,
                zmin: 0,
                dtick: 1000,
                colorbar: {
                    autotic: false,
                    tickprefix: '',
                    title: 'USA Customers'
                },
            }];

            var layout = {
                title: 'USA Customers by State',
                geo: {
                    scope: 'usa',
                    showlakes: true,
                    lakecolor: '#0000FF'
                }
            };

            document.getElementById('graph').style.display = 'none';
            document.getElementById('map').style.display = 'none';

            Plotly.plot('usmap', data, layout, { showLink: false });

            // Events
            let usmap = document.getElementById('usmap');
            usmap.on('plotly_click', function (data) {
                document.getElementById('usmap').style.display = 'none';
                var state = data.points[0].location;
                CreateUSStateMap(state, usData);
            });
        }
    });
}