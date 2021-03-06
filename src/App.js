import React from "react";

import InputCity from "./components/InputCity";
import SelectStation from "./components/SelectStation";
import ShowPollution from "./components/ShowPollution";



class App extends React.Component {
  state = {

    //Status request po wykonaniu getStations()
    stationListStatus: undefined,

    //Lista stacji przekazywana do <select>
    stationList: undefined,

    // Nazwa stacji
    stationName: undefined,

    // Status reuqest po wykonaniu getStationPollution()
    stationStatus: undefined,

    //Wybrana stracja z listy select
    selectedStation: undefined,

    //Zanieczyszczenie dla stacji
    stationPollution: undefined,

    //Wykorzystywane do wywoływania statusu "loading" 
    loadingTownList: false,
    loadingStation: false,

  }

  constructor(props) {
    super(props)
    this.getStationPollution = this.getStationPollution.bind(this);
    this.refreshStationPollution = this.refreshStationPollution.bind(this);
    // this.getStations = this.getStations.bind(this);

  }


  //Input - City Name (String), Zwraca - Liste stacji w danym mieście (Array)
  getStations = (e) => {
    e.preventDefault();

    this.setState({
      stationListStatus: undefined,
      stationList: { "status": "ok", "data": { "iaqi": { "brak": { "v": 'Brak danych' } } } },
      loadingTownList: true,
      selectedStation: undefined,

      // Zerowanie danych poprzednio wyszukanego miasta
      stationName: null,
      // Zerowanie danych poprzednio wybraje stacji
      stationPollution: undefined,

    })

    const city = e.target.elements.city.value;
    fetch(`https://api.waqi.info/search/?keyword=${city}&token=7c200db3b52810d3f6a68b989445e0289d3428b8`)
      //fetch(`citylist.json`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {

        if (data.data.length === 0) {
          this.setState({
            stationListStatus: 'Unfortunately we found nothing. We can suggest checking for missing Polish characters. We will improve it soon ...',
            stationList: undefined,
            loadingTownList: false,
          })
        } else {
          this.setState({
            stationListStatus: data.status,
            stationList: data.data,
            loadingTownList: false,
          });
        }
      });
  }

  getStationPollution = (e) => {

    this.setState({
      stationListStatus: undefined,
      stationName: undefined,
      stationStatus: undefined,
      stationPollution: undefined,
      loadingStation: true,
      selectedStation: e.target.value,
    })

    const station = e.target.value;

    fetch(`https://api.waqi.info/feed/@${station}/?token=7c200db3b52810d3f6a68b989445e0289d3428b8`)
      //fetch(`${city}.json`)
      .then((data) => {
        this.setState({
          stationPollution: undefined,
          loadingStation: true,
        })
        return data.json()
      })
      .then((data) => {
        if ((((data || {}).data) || {}).iaqi) {
          this.setState({
            stationName: data.data.city.name,
            stationStatus: data.status,
            stationPollution: data.data.iaqi,
            loadingStation: false
          });
        } else if (((data || {}).status) || {}) {
          this.setState({
            stationName: "No data available, please try in a moment.",
            stationStatus: data.status,
            stationPollution: null,
            loadingStation: false
          });
        }
        return data
      }).catch((error) => {
        console.log('Error: ', error);
        this.setState({
          stationName: "Error",
          stationPollution: undefined,
          stationStatus: "Error",
          loadingStation: false
        });
      })
  }


  refreshStationPollution = () => {

    const station = this.state.selectedStation;

    fetch(`https://api.waqi.info/feed/@${station}/?token=7c200db3b52810d3f6a68b989445e0289d3428b8`)
      //fetch(`${city}.json`)
      .then((data) => {
        this.setState({
          stationPollution: undefined,
          loadingStation: true,
        })

        return data.json()
      })
      .then((data) => {
        if ((((data || {}).data) || {}).iaqi) {
          this.setState({
            stationName: data.data.city.name,
            stationStatus: data.status,
            stationPollution: data.data.iaqi,
            loadingStation: false
          });
        } else if (((data || {}).status) || {}) {
          this.setState({
            stationName: "No data available, please try in a moment.",
            stationStatus: data.status,
            stationPollution: null,
            loadingStation: false
          });
        }
        return data
      }).catch((error) => {
        console.log('Error: ', error);
        this.setState({
          stationName: "Error",
          stationPollution: undefined,
          stationStatus: "Error",
          loadingStation: false
        });
      })
  }



  render() {
    return (
      <div id="MainView" className="container-fluid d-flex align-items-center pl-0 pr-0">
        <div className="container ">

          <InputCity
            getStations={this.getStations}
          />

          <SelectStation
            stationListStatus={this.state.stationListStatus}
            stationList={this.state.stationList}
            selectedStation={this.state.selectedStation}
            getStationPollution={this.getStationPollution}
            getCityStation={this.getCityStation}
            loadingTownList={this.state.loadingTownList}
            refreshStationPollution={this.refreshStationPollution}
          />

          <ShowPollution
            stationPollution={this.state.stationPollution}
            stationName={this.state.stationName}
            stationStatus={this.state.stationStatus}
            loadingStation={this.state.loadingStation}
            loadingTownList={this.state.loadingTownList}
          />

        </div>
      </div>
    );
  }
}

export default App;