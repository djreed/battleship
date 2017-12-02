import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import Grid from './Grid';
import ChatPanel from './ChatPanel';
import { placeShip, attack, sendMsg, resetGame } from '../actions/app';


type Props = {
  user: Object,
  game: Object,
  player: Object,
  opponent: Object,
  status: string,
  ships_to_place: Object,
  channel: Object,
  table_channel: Object,
  game_id: string,
  placeShip: () => void,
  attack: () => void,
  sendMsg: () => void,
  resetGame: () => void,
}

class GameView extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.getGameOverMSG = this.getGameOverMSG.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  handleClick(params) {
    params["game_id"] = this.props.game_id;
    const { status, channel, user, ships_to_place } = this.props;

    if (status == 'PLACING' && ships_to_place
      && (ships_to_place.length > 0) && user.id == params.id) {
      this.props.placeShip(channel, params);
    }
    else if (status == 'ATTACK') {
      params["id"] = user.id + '';
      this.props.attack(channel, params);
    }
  }


  getGameOverMSG(winner) {
    const { table_channel, status } = this.props;
    if (status === 'GAMEOVER') {
      const msg = {
        username: '[INFO]',
        text: winner + ' won the game!',
      };

      this.props.sendMsg(table_channel, msg);
    }

    switch (winner) {
      case "DRAW":
        return 'It\'s a DRAW!';
      default:
        return winner + ' won the game!';
    }
  }

  handleBack() {
    this.props.resetGame();
    this.context.router.history.push("/table");
  }


  render() {
    const { game, player, opponent, status, ships_to_place } = this.props;

    return (
      <div>
        <h1>Game</h1>
        <h4>{'Status: ' + status}</h4>
        {status === "GAMEOVER" &&
          <div>
            <h4>{this.getGameOverMSG(game.winner)}</h4>
            <Button onClick={this.handleBack}>Back to Table</Button>
          </div>
        }
        <Row>
          <Col md={5}>
            {player &&
              <Grid style={{ width: '100%'}}  player={player} handleClick={this.handleClick}
                    status={status} ships_to_place={ships_to_place} is_user={true} />
            }
          </Col>
          <Col md={5}>
            {opponent &&
              <Grid style={{ width: '100%'}} player={opponent}  handleClick={this.handleClick}
                    status={status} is_user={false} />
            }
          </Col>
          <Col md={2}>
            <ChatPanel />
          </Col>
        </Row>
      </div>
    );
  }
}

GameView.contextTypes = {
  router: PropTypes.object,
};

export default connect(
  state => ({
    user: state.user.user,
    game: state.game.game,
    status: state.game.status,
    player: state.game.player,
    opponent: state.game.opponent,
    ships_to_place: state.game.ships_to_place,
    channel: state.game.game_channel,
    table_channel: state.table.channel,
    game_id: state.game.game_id,
  }),
  { placeShip, attack, sendMsg, resetGame },
)(GameView);