import React, {Component} from 'react';
import {Modal, Header, Button, Icon, Segment} from 'semantic-ui-react';

class ModalTemplate extends Component{
    renderTriggerButton = () => {
        return (
            <Segment inverted>
                <Button color size="huge" inverted>
                    <Icon.Group size='huge'>
                        <Icon name='sign-in' />
                    </Icon.Group>
                </Button>
            </Segment>
        )
    }
    render(){
        return(
            <Modal trigger={this.renderTriggerButton()} >
                <Header content={this.props.header}/>
                <Modal.Content>
                    {this.props.content}
                </Modal.Content>
                <Modal.Actions>
                    {this.props.actions}
                </Modal.Actions>
            </Modal>
        )
    }
}

export default ModalTemplate;