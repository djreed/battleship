import { Button } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { css, StyleSheet } from 'aphrodite';
import Cell from '../components/Cell.js';
import React from 'react';

const styles = StyleSheet.create({
 row: {
    width: '100%',
    overflow: 'hidden',
    display: 'table-row',
    clear: 'both',
  },
  cells: {
    display: 'table',
    width: '100%',
  },
  headerCell: {
    textAlign: 'center',
    display: 'table-cell',
    width: '30px',
    height: '30px',
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

class Cells extends React.Component {
  constructor() {
    super();

    this.getDisplayText = this.getDisplayText.bind(this);
    this.getInstructionText = this.getInstructionText.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      orientation: 'vertical',
    };
  }

  getShipSize(ships) {
    if (ships && ships[0]) {
      return ships[0];
    }
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

  getDisplayText() {
    let text;
    if (this.props.is_user) {
      text = "Your board";
    } else {
      text = this.props.player.name + '\'s board';
    }
    return text;
  }

  buildHeaderRow() {
    const colTitles = ' 0123456789';
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

  buildCells(cells) {
    const headerRow = this.buildHeaderRow();
    return (
      <div className={css(styles.cells)}>
        {headerRow}
        {cells.map((row, rowIdx) => {
          return this.buildBodyRow(rowIdx, row);
        })}
      </div>
    );
  }

  getInstructionText() {
    if (!this.props.is_user) {
      return '';
    }

    switch (this.props.status) {
      case 'PLACING':
        return 'Place your ships by selecting a tile. Ships can be placed horizontally or ' +
          'vertically, and the highlighted cell is the front of the ship.';
      case 'ATTACK':
        return 'Attack your opponent by selecting a cell on their grid.';
      case 'WAITING':
        return 'Waiting on opponent action . . .';
      default:
        return '';
    }
  }
  props: Props
  render() {
    const { player, status, is_user, ships_to_place } = this.props;
    const { orientation } = this.state;

    return (
      <div>
        <div className={css(styles.padBlock)}>
          <p>{this.getInstructionText()}</p>
        {ships_to_place && ships_to_place.length > 0 &&
          <div>
            <p>{'Orientation: ' + orientation}</p>
            <p>{'Ship size: ' + this.getShipSize(ships_to_place)}</p>
            <Button style={{display: 'inline'}}
                    onClick={e => {
                      e.preventDefault();
                      this.setState({ orientation: 'horizontal' });
                    }}>
              Horizontal
            </Button>
            <Button style={{display: 'inline'}}
                    onClick={e => {
                      e.preventDefault();
                      this.setState({orientation: 'vertical'});
                    }}>
              Vertical</Button>
          </div>
        }
        </div>
        <p>{this.getDisplayText()}</p>
        {this.buildCells(player.cells)}
      </div>
    )
  }
}

export default Cells;
