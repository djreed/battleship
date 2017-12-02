import React from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

type Props = {
  onSubmit: () => void,
  username: Object,
}

class MsgForm extends React.Component {
  constructor() {
    super();
    this.state = {
      text: '',
    };
    this.handleClick = this.handleClick.bind(this);
  }

  props: Props

  handleClick(e) {
    e.preventDefault();
    if (this.state.text === '') {
      return;
    }
    
    this.setState({ text: '' })
    const params = {
      username: this.props.username,
      text: this.state.text,
    };

    this.props.onSubmit(params);
  }


  render() {
    const { username } = this.props;

    return (
      <div>
        <form>
          <FormGroup>
            <FormControl
              componentClass="textarea"
              placeholder="Enter a message"
              value={this.state.text}
              onChange={(e) => this.setState({ text: e.target.value })}
            />
          </FormGroup>

        <Button type="submit" onClick={this.handleClick}>
          Send
        </Button>
        </form>
      </div>
    )
  }
}

export default MsgForm;