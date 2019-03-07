import React, {Component} from 'react';
import {Modal, Header, Button, Icon, Segment} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';


class ModalNavTemplate extends Component{
    renderTriggerButton = () => {
        return (
            <div style={{background:"rgb(27, 28, 29)"}}>
            <Segment size="tiny" inverted style={{padding:"0", margin:"0.5vh 1vw"}}>
                <Button color size="small" inverted onClick={() => {this.context.dispalyNavModal(true)}}>
                    <Icon.Group size="small">
                        <Icon name={this.props.icon} />
                    </Icon.Group>
                </Button>
            </Segment>
            </div>
        )
    }
    render(){
        return(
            <Modal trigger={this.renderTriggerButton()} open={this.context.isNavModalOpen} closeIcon closeOnDimmerClick closeOnEscape closeOnDocumentClick onClose={() => this.context.dispalyNavModal(false) }>
                <Header content={this.props.header}/>
                <Modal.Content>
                    {this.props.content}
                </Modal.Content>
            </Modal>
        )
    }
}

ModalNavTemplate.contextType = adminContext;
export default ModalNavTemplate;