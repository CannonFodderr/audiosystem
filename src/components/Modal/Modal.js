import React, {Component} from 'react';
import {Modal, Header, Button, Icon, Segment} from 'semantic-ui-react';

class ModalTemplate extends Component{
    renderTriggerButton = () => {
        return (
            <div style={{width:"100vw", height:"100vh", background:"rgb(27, 28, 29)"}}>
            <Segment size="massive" inverted>
                <Button color size="massive" inverted>
                    <Icon.Group size="massive">
                        <Icon name='sign-in' />
                    </Icon.Group>
                </Button>
            </Segment>
            </div>
        )
    }
    render(){
        return(
            <Modal trigger={this.renderTriggerButton()} >
                <Header content={this.props.header}/>
                <Modal.Content>
                    {this.props.content}
                </Modal.Content>
            </Modal>
        )
    }
}

export default ModalTemplate;