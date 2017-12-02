import React from 'react';
import { Button } from 'react-bootstrap';

type Props = {
  user: Object,
  handleChallenge: () => void,
}
class UserShow extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    const { user } = this.props;
    this.props.handleChallenge(user.id, user.name);
  }

  props: Props

  render() {
    const { user } = this.props;
    console.log('user show', user);
    return (
      <div>
        <Button className='btn btn-sm' style={{ display: 'inline' }} onClick={this.handleClick}>
          Play
        </Button>
        <p style={{ display: 'inline', marginLeft: '2px' }}>{user.name}</p>
      </div>
    )
  }
}

export default UserShow;