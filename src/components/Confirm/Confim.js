import React, { Component } from 'react';
import {Confirm, Button} from 'semantic-ui-react';

class ConfirmTemplate extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div>
                <Confirm 
                open={true} 
                onConfirm={() => this.props.handleConfirm()} 
                onCancel={() => this.props.handleCancel()} 
                onClose={() => this.props.handleCancel()}
                header={this.props.header}
                content={this.props.content}
                />
            </div>
        )
    }
}


export default ConfirmTemplate;