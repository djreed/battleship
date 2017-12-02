import React from 'react';
import { Row, Col } from 'react-grid-system';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createAndJoinTable, joinChannel, joinExisting } from '../actions/app';

type Props = {
  channel: Object,
  user: Object,
  joinChannel: () => void,
  createAndJoinTable: () => void,
  joinExisting: () => void,
}

class Landing extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tableName: '',
      joinCode: '',
    };

    this. handleCreate = this.handleCreate.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
  }

  componentWillMount() {
    this.props.joinChannel('lobby');
  }

  handleCreate(e) {
    e.preventDefault();
    const { tableName } = this.state;
    const { user } = this.props;
    const params = {
      user,
      tableName,
    };


    if (user && tableName) {
      this.props.createAndJoinTable(this.props.channel, params, this.context.router);
    } else {
      // TODO put flash error
      console.log('error: invalid username or tablename');
    }
  }

  handleJoin(e) {
    e.preventDefault();
    const { joinCode } = this.state;
    const { user } = this.props;

    const params = {
      user,
      joinCode,
    };

    if (user && joinCode) {
      this.props.joinExisting(params, this.context.router);
    } else {
      console.log('error: invalid user or join code');
    }
  }

  props: Props

  render() {
    return (
      <Row>
        <Col md={8} offset={{ md: 2 }} >
          <form>

            <FormGroup id="table-code">
              <FormControl
                type="text"
                placeholder="Join Code"
                onChange={(e) => this.setState({ joinCode: e.target.value })}
              />
            </FormGroup>

            <Button type="submit" onClick={this.handleJoin}>
              Join Table
            </Button>

            <p>or</p>
            <FormGroup id="table-name">
              <FormControl
                type="text"
                placeholder="Table Name"
                onChange={(e) => this.setState({ tableName: e.target.value })}

              />
            </FormGroup>
            <Button type="submit" onClick={this.handleCreate}>
              Create Table
            </Button>
          </form>
        </Col>
      </Row>
    );
  }
}

Landing.contextTypes = {
  router: PropTypes.object,
};


export default connect(
  (state) => ({
    user: state.user.user,
    channel: state.table.channel,
  }),
  { createAndJoinTable, joinChannel, joinExisting },
)(Landing);
