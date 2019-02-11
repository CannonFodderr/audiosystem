import React, {Component} from 'react';

const Context = React.createContext();

export class AppContextStore extends Component{
    state = {
        room: null
    }
    setRoom = room => {
        this.setState({room});
    }
    render(){
        return(
            <Context.Provider value={{
                ...this.state,
                setRoom: this.setRoom
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}


export default Context;