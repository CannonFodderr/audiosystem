import React, {Component} from 'react';
import ModalTemplate from '../Modal/Modal';
import LoginForm from '../LoginForm/LoginForm';
import appContext from '../../contexts/appContext';
import UserView from '../UserView/UserView';
import AdminView from '../AdminView/AdminView';
import {AdminContextStore} from '../../contexts/adminContext';

class App extends Component{
    renderApp = () => {
        if(!this.context.room){
            return(
                <div>
                    <ModalTemplate header="Login" content={<LoginForm />} actions="" />
                </div>
            )
        }
        if(this.context.room.isAdmin === false){
            return (
                <div><UserView room={this.context.room}/></div>
            )
        }
        if(this.context.room.isAdmin === true){
            return (
            <div>
                <AdminContextStore>
                <AdminView />
                </AdminContextStore>
            </div>
            )
        }
    }
    render(){
        return(
            <div>
                {this.renderApp()}
            </div>
        )
    }
}

App.contextType = appContext;
export default App;