import React from 'react';
import { Row, Col } from 'react-grid-system';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { signin, joinChannel } from '../actions/app';


type Props = {
  signin: () => void,
  joinChannel: () => void,
  channel: Object,
}

class Signin extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.props.joinChannel('lobby');
  }

  handleSubmit(e) {
    e.preventDefault();
    const { username } = this.state;
    if (username && username !== '') {
      this.props.signin(this.props.channel, username, this.context.router);
    } else {
      //TODO flash
      console.log('error, could not sign in');
    }
  }

  props: Props

  render() {
    return (
      <div style={{marginTop: '100px'}}>
        <form>
          <FormGroup id="username">
            <FormControl
              type="text"
              placeholder="Username"
              onChange={(e) => this.setState({ username: e.target.value })}

            />
          </FormGroup>

          <Button type="submit" onClick={this.handleSubmit}>
            Sign In
          </Button>
        </form>
      </div>
    );
  }

}

Signin.contextTypes = {
  router: PropTypes.object,
};


export default connect(
  state => ({
    channel: state.table.channel,
  }),
  { signin, joinChannel },
)(Signin);