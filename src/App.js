import React, { Component } from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js';

const spotifywebapi = new Spotify();

class App extends Component {
  constructor() {
    super()
    const params = this.getHashParams();
    this.state ={
      loggedIn: params.access_token ? true : false,
      topTracks: [],
      userName: ''
    }
    if (params.access_token){
      spotifywebapi.setAccessToken(params.access_token)
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  //store the user name in the state
  componentDidMount() {
    spotifywebapi.getMe({
    }).then((response) => {
      this.setState({
        userName: response.display_name,
      })
    })
  }

  //Fetch a user's top tracks over different periods of time
  getTopTracksAllTime() {
    spotifywebapi.getMyTopTracks({
      time_range: 'long_term',
     
    })
      .then((response) => {
        this.setState({
          topTracks: response.items
        })
        
      })
  }
  getTopTracksSixMonths() {
    spotifywebapi.getMyTopTracks()
      .then((response) => {
        this.setState({
          topTracks: response.items
        })
        
      })
  }
  getTopTracksThisMonth() { 
    spotifywebapi.getMyTopTracks({
      time_range: 'short_term'
    })
      .then((response) => {
        this.setState({
          topTracks: response.items
        })
        
      })
  }

  //Function to create an audio object using the track preview url provided by spotify api adding some comments
  createAudioObject(url) {
      return new Audio(url)
  }
  
  render() {
    //Grab user's first name
    const displayNameArray = this.state.userName.split(' ')
    const displayName = displayNameArray[0]

    //Render a list of top tracks based on the time period, and create an audio object for each which plays when the user mouses over the song, and pauses when they move mouse away
    const trackList = this.state.topTracks.map((track) => {
      const trackSample = this.createAudioObject(track.preview_url)
      trackSample.volume = .1
      if (typeof track.preview_url === 'string') return <div className="track" key={track.id}
                onMouseEnter={() => trackSample.play()}
                onMouseLeave={() => trackSample.pause()}>
                <li className="track-name"> {track.artists[0].name}: {track.name}</li> 
                <img className="images" src={ track.album.images[0].url } style={{ width:50 }}/>
            </div>   
    })

    //Page to render once the user has logged in through auth app
    if (this.state.loggedIn) {
      return (
        <div className="App">
        <div>
        <h2 className="title">Welcome, {displayName}!</h2>
        <h3 className="title">View your most played songs of:</h3>
      </div>
      <div id="button-wrapper">
        <button onClick={() => this.getTopTracksAllTime()}>All Time</button>
        <button onClick={() => this.getTopTracksSixMonths()}>Last Six Months</button>
        <button onClick={() => this.getTopTracksThisMonth()}>This Month</button>
      </div>
      <h3 className="title">Mouse over songs to listen</h3>
        <div id="track-wrapper">
          
          <ol>{trackList}</ol>
          
         
        </div>

        </div>
      )
    }

    //Initial page prompting user to login through auth app
    else if (!this.state.loggedIn) {
      return (<div className="App">
      <h2 className="init-title">Welcome!</h2>
      <a href='https://most-played-auth.herokuapp.com/'>
        <button>Login With Spotify</button>
  
        </a> 
      </div>)
    }
    
  }
  
}

export default App;
