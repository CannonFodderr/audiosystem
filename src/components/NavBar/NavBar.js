import React, {Component} from 'react';
import {Menu, Input} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';

class NavBar extends Component{
    renderAddButton = () => {
        if(!this.context.activeMenuItem){
            return <Menu.Item name="" disabled/>
        }
        if(this.context.activeMenuItem === 'Books'){
            return <Menu.Item name="Add Book" onClick={() => this.context.setShowModal(true)}/>
        }
        if(this.context.activeMenuItem === 'Users'){
            return <Menu.Item name="Add User" onClick={() => this.context.setShowModal(true)}/>
        }
    }
    renderSearchBox = () => {
        if(!this.context.activeMenuItem){
            return <div></div>
        }
        if(this.context.activeMenuItem === 'Books'){
            return (
                <Input 
                inverted
                transparent
                icon={{ name: 'search books', link: true }}
                placeholder='Search books...'
                />
            )
        }
        if(this.context.activeMenuItem === 'Users'){
            return (
                <Input
                transparent
                inverted
                icon={{ name: 'search users', link: true }}
                placeholder='Search users...'
                />
            )
        }
    }
    renderMenu = () => {
        return (
            <Menu stackable inverted>
                <Menu.Item name="Rooms" active={this.context.activeMenuItem === 'Rooms'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Item name="Books" active={this.context.activeMenuItem === 'Books'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Item name="Users" active={this.context.activeMenuItem === 'Users'} onClick={this.context.handleMenuItemClick}/>
                <Menu.Menu position="right">
                        {this.renderAddButton()}
                        {this.renderSearchBox()}
                </Menu.Menu>
            </Menu>
        )
    }
    render(){
        return(
            <div>
                {this.renderMenu()}
            </div>
        )
    }
}

NavBar.contextType = adminContext;
export default NavBar