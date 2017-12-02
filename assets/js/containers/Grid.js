
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { css, StyleSheet } from 'aphrodite';
import Cell from '../components/Cell';

const styles = StyleSheet.create({
  headerCell: {
    width: '30px',
    height: '30px',
    backgroundColor: 'white',
    textAlign: 'center',
    display: 'table-cell',
  },

  row: {
    display: 'table-row',
    clear: 'both',
    overflow: 'hidden',
    width: '100%'
  },

  grid: {
    display: 'table',
    width: '100%',
  },

  padBlock: {
    height: '200px',
  },

});


type Props = {
  is_user: boolean,
  player: Object,
  status: string,
  ships_to_place: Object,
  handleClick(): () => void,
}

class Grid extends React.Component {
  constructor() {
    super();

    this.state = {
      orientation: 'vertical',
    };

    this.getDisplayText = this.getDisplayText.bind(this);
    this.getInstructionText = this.getInstructionText.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  getDisplayText() {
    let text;
    if (this.props.is_user) {
      text = "Your board";
    } else {
      text = this.props.player.name + '\'s board';
    }
    return text;
  }

  getInstructionText() {
    if (!this.props.is_user) {
      return '';
    }

    switch (this.props.status) {
      case 'PLACING':
        return 'Place your ships by selecting a tile. Ships can be placed horizontally or ' +
          'vertically, but cannot be removed once placed.';
      case 'ATTACK':
        return 'Attack your opponent by selecting a cell on their grid to strike.';
      case 'WAITING':
        return 'Waiting on opponent . . .';
      default:
        return '';
    }
  }

  getShipSize(ships) {
    if (ships && ships[0]) {
      return ships[0];
    }
  }

  buildHeaderRow() {
    const colTitles = ' ABCDEFGHIJ';
    return (
      <div className={css(styles.row)}>
        {
          [...colTitles].map(l => {
            return (<div className={css(styles.headerCell)}>
              {l}
            </div>)
          })
        }
      </div>
    )
  }

  buildBodyRow(rowIdx, row) {
    return (
      <div className={css(styles.row)}>
        <div className={css(styles.headerCell)}>
          {rowIdx}
        </div>
        {row.map((symbol, colIdx) => {
          return <Cell handleClick={this.handleClick} symbol={symbol} row={rowIdx} col={colIdx} />
        })}
      </div>
    );
  }

  buildGrid(grid) {
    const headerRow = this.buildHeaderRow();
    return (
      <div className={css(styles.grid)}>
        {headerRow}
        {grid.map((row, rowIdx) => {
          return this.buildBodyRow(rowIdx, row);
        })}
      </div>
    );
  }

  handleClick(row, col) {
    const { status, is_user, player, ships_to_place } = this.props;
    const size = this.getShipSize(ships_to_place);
    const { orientation } = this.state;

    let params;
    if (status === 'PLACING' && is_user) {
      params = {
        ship: { orientation, size, coords: { row, col }, },
        id: player.id + '',
      };
      this.props.handleClick(params);

    }
    else if (status === 'ATTACK' && !is_user) {
      params = {
        coords: { row, col },
      };
      this.props.handleClick(params);
    }
  }

  props: Props

  render() {
    const { player, status, is_user, ships_to_place } = this.props;
    const { orientation } = this.state;

    return (
      <div>
        <div className={css(styles.padBlock)}>
          <p>{this.getDisplayText()}</p>
          <p>{this.getInstructionText()}</p>
        {ships_to_place && ships_to_place.length > 0 &&
          <div>
            <p>{'Orientation: ' + orientation}</p>
            <p>{'Ship size: ' + this.getShipSize(ships_to_place)}</p>
            <button style={{display: 'inline'}}
                    onClick={e => {
                      e.preventDefault();
                      this.setState({ orientation: 'horizontal' });
                    }}>
              Horizontal
            </button>
            <button style={{display: 'inline'}}
                    onClick={e => {
                      e.preventDefault();
                      this.setState({orientation: 'vertical'});
                    }}>
              Vertical</button>
          </div>
        }
        </div>
        {this.buildGrid(player.grid)}
      </div>
    )
  }
}

export default Grid;