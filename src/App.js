import React, { Component } from 'react';
import firebase from 'firebase/app';
import Gamepad from 'react-gamepad';
import { buttons } from './store/gamepad';
import { get } from 'lodash';

import { api } from './utils';
import app, { connectionNodes } from './store';
import { createStore, applyMiddleware } from 'redux';

import './assets/main.css';
import './assets/auth.css';
import './assets/loader.css';
import './assets/media.css';

import ChoizeScreen from './containers/ChoizeScreen';
import SignIn from './containers/SignIn';
import Game from './containers/Game';
import Loader from './components/Loader';
import Login from './containers/Login';

// Configure Firebase.
const config = {
  apiKey: "AIzaSyBrFhldIME9qfXLhyzlfax-1Nyk0w9r2E8",
  authDomain: "cloudpipeswin.firebaseapp.com",
  databaseURL: "https://cloudpipeswin.firebaseio.com",
  projectId: "cloudpipeswin",
  storageBucket: "cloudpipeswin.appspot.com",
  messagingSenderId: "23010356644"
};

firebase.initializeApp(config);

const store = createStore(app, applyMiddleware(connectionNodes));
Gamepad.layouts.XBOX.buttons.push('RS');

class App extends Component {
  state = {
    startGame: false,
    code: null,
    loader: false,
  };

  componentDidMount() {
    const self = this;

    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      (user) => {
        if (user) {
          return user.getIdToken().then(function(data) {
            api('get-code', {
              headers: { Authorization: `Bearer ${data}` },
              method: 'GET', 
            }).then((code) => {
              store.dispatch({ type: 'AUTH_USER', user, code });
              store.dispatch({ type: 'SAVE_TOKEN', data });

              return self.setState({ code: code.code, loader: true });
            });
          });
        }

        return store.dispatch({ type: 'AUTH_LOGOUT' });
      });
  }

  startGame = () => {
    store.dispatch({ type: 'G_NEW_GAME' });
    store.dispatch({ type: 'G_INIT_GAME' });

    this.setState({ startGame: true, loader: true });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  authApp() {
    const { screen } = store.getState().user;
    console.log(process.env);

    if (screen === 'choize') {
      return <Login />
      // return (
      //   <ChoizeScreen store={store} start={this.startGame} code={this.state.code }>
      //     <Game store={store} />
      //   </ChoizeScreen>
      // )
    } else {
      return <SignIn store={store} />
    }
  }

  xpadButtonChange = (e, bool) => {
    const { screen } = store.getState().user;
    if (screen === 'game') {
      const activeHandler = get(buttons, e, buttons.DEFAULT);
      activeHandler(store, e, bool);
    }
  }

  render() {
    return (
      <Gamepad
        onButtonChange={this.xpadButtonChange}
        >
        <div className="main">
          <div className="app">
            { this.authApp() }
            <Loader active={this.state.loader} position='loader'>
              <svg className="circular" viewBox="25 25 50 50">
                <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="5" strokeMiterlimit="10"/>
              </svg>
            </Loader>
          </div>
        </div>
      </Gamepad>
    )
  }
};

export default App;
