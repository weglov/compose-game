import React, { Component } from 'react';
import { delay } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { rotateBlock, nextGame, endGame, newGame } from '../store/actions';
import Gamepad from 'react-gamepad';

import NextGame from './NextGame';
import Counter from './Counter';
import Block from './Block';
import Node from './Node';
import Next from './Next';
import Row from './Row';

Gamepad.layouts.XBOX.buttons.push('RS')

class Main extends Component {
  constructor(props){
    super(props);

    this.state = {
      next: false,
      nextText: 'Next',
    }
  }
  get matrix() {
    const { sets, rotateBlock } = this.props;

    return sets.map((row, i) => {
      return <Row key={i} number={i}>{
        row.map((v, y) => {
          if (v.node) {
            return <Node
              key={v.name}
              block={v}
            />
          } else {
            return <Block 
              rotate={rotateBlock}
              key={v.name}
              block={v}
            />
          }
        })
      }</Row>
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gameIndex === nextProps.maxGames) {
      this.setState({ nextText: 'End'});
    }
  }

  nextGame = () => {
    const { gameIndex, maxGames, paths } = this.props;
    if (this.state.next) return true;

    if (gameIndex < maxGames) {
      this.setState({ next: true });
      this.props.nextGame(paths.length);
      delay(() => this.props.next(), 1500);
      delay(() => this.setState({ next: false }), 3000);
    } else {
      this.props.endGame(paths.length);
      this.setState({ nextText: 'Next' });
    }
  };


  render() {
    const { counter, gameIndex, maxGames, paths } = this.props;

    return (
      <Gamepad>
        <div className="app">
          <Counter counter={counter + paths.length}/>
          <div className="app-game">
            <div className="game-table" >{ this.matrix }</div>
          </div>
          <Next onClick={this.nextGame} text={this.state.nextText}/>
          <NextGame active={this.state.next} text={`${gameIndex} / ${maxGames}`} position='right'/>
          <NextGame active={this.props.endGameStatus} description={ 'Your score: ' + this.props.counter } onClick={this.props.newGame} text='GAME OVER' position='top'/>
        </div>
      </Gamepad>
    );
  }
}

const mapStateToProps = state => {
  const { sets, matrix, paths } = state.game;
  const { score, gameIndex, maxGames, endGameStatus } = state.user;

  return {
    sets,
    matrix,
    paths,
    counter: score,
    score,
    maxGames,
    gameIndex,
    endGameStatus,
  }
};

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    rotateBlock,
    nextGame,
    endGame,
    newGame,
  }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Main);
