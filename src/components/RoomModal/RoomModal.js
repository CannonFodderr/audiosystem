import React, {Component} from 'react';
import {Modal, Header} from 'semantic-ui-react';

class RoomModalTemplate extends Component{
    render(){
        return(
            <Modal open={true} closeIcon closeOnDimmerClick closeOnEscape closeOnDocumentClick onClose={() => this.props.handleModalClose() }>
                <Header content={this.props.header}/>
                <Modal.Content>
                    {this.props.content}
                </Modal.Content>
            </Modal>
        )
    }
}

export default RoomModalTemplate;