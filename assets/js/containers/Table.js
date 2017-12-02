//@flow
import React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { handlePresenceDiff, handlePresenceState } from '../actions/app';
import UserList from './UserList';
import ChatPanel from './ChatPanel';


type Props = {
  table: Object,
  user: Object,
  users: Object,
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: '3px',
    borderBottomStyle: 'solid',
  },
  users: {
    borderRightWidth: '3px',
    borderRightStyle: 'solid',
  }
});

class Table extends React.Component {
  props: Props

  render() {
    const { table, user, users } = this.props;
    let tableName = '';
    let joinCode = '';
    if (table) {
      tableName = table.name;
      joinCode = table.id;
    }
    let username = '';
    if (user) {
      username = user.name;
    }

    console.log('users:', users);
    return (
      <div>
        <div  className={css(styles.header)}>
          <h1>{'Table: ' + tableName}</h1>
          <p>{'Join Code: ' + joinCode}</p>
        </div>
        <Row>
          <Col md={4} className={css(styles.users)}>
            <Scrollbars style={{ height: '500px' }}>
              <UserList users={users} />
            </Scrollbars>
          </Col>
          <Col md={8}>
            <ChatPanel />
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect(
  state => ({
    user: state.user.user,
    table: state.table.table,
    users: state.table.users,
  }),
  { handlePresenceDiff, handlePresenceState },
)(Table);