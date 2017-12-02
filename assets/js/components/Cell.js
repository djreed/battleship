import React from 'react';
import { Col } from 'react-grid-system';
import { css, StyleSheet } from 'aphrodite';

const styles = StyleSheet.create({
  bodyCell: {
    width: '30px',
    height: '30px',
    display: 'table-cell',
    borderWeight: '1px',
    borderColor: 'black',
    borderStyle: 'solid',

    ':hover': {
      backgroundColor: 'purple',
    }
  },
});

type Props = {
  symbol: string,
  row: number,
  col: number,
  handleClick: () => void,
}

class Cell extends React.Component {
  constructor() {
    super();

    this.getColor = this.getColor.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  getColor() {
    switch (this.props.symbol) {
      case '?':
        return 'gray';
      case '~':
        return 'blue';
      case '|':
        return 'lightgray';
      case 'O':
        return 'white';
      case 'X':
        return 'red';
      default:
        return 'gray';
    }
  }

  handleClick() {
    const { symbol, col, row } = this.props;
    if (symbol === '?' || symbol === '~') {
      this.props.handleClick(row, col);
    }
  }

  props: Props

  render() {
    return (
      <div onClick={this.handleClick} className={css(styles.bodyCell)} style={{ backgroundColor: this.getColor() }}>
      </div>
    );
  }

}

export default Cell;