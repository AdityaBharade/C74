import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Component } from 'react';
import { render } from 'react-dom';

import {createBottomTabNavigator} from "react-navigation-tabs"
import {createAppContainer} from "react-navigation"

import TransactionScreen from './screens/transaction';
import SearchScreen from './screens/search';



export default class App extends Component{
  render(){
  return (
  <AppContainer />
  
  );
  }
}

var TabNavigator = createBottomTabNavigator({
  
  Transaction :{screen: TransactionScreen},
  Search :{screen: SearchScreen} 

},
{
defaultNavigationOptions : ({navigation})=>({
tabBarIcon:()=>{

const routeName = navigation.state.routeName

if(routeName==='Transaction'){

return(
<Image 
source = {require('./assets/book.png')}
style = {{width:40, height:40}}
/>

)
 
}

else if(routeName ==='Search'){

  return(
    <Image 
    source = {require('./assets/searchingbook.png')}
    style = {{width:40, height:40}}
    />
    
    )

}

}

}
)
}

)
const AppContainer=createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
    borderRadius:20,
    textAlign:'center',
  
  },
});