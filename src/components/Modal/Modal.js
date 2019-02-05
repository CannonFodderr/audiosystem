import React, {Component} from 'react';
import {Modal, Header, Button} from 'semantic-ui-react';

class ModalTemplate extends Component{
    render(){
        return(
            <Modal trigger={<Button>Login</Button>} style={{display: "display: flex !important;" }}>
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