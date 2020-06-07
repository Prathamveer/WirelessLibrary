import React from 'react';
import {Text,View,FlatList,StyleSheet,TextInput,TouchableOpacity} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import db from '../config';

export default class SearchScreen extends React.Component{
    constructor(props){
        this.state={
            allTransactions:[],
            lastVisibleTransaction:null,
            search:''
        }
 
    }
    componentDidMount=async()=>{
        const query=await db.collection('Transaction').get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()]
            })
        })
       
    }

    render(){
        return(
            <ScrollView>
                {
                    this.state.allTransactions.map((data)=>{
                        return(
                            <View style={{borderBottomWidth:2}}>
                                <Text>{'bookId:'+data.bookId} </Text>
                                <Text>{'studentId:'+data.studentId} </Text>
                                <Text>{'transactionType:'+data.transactionType} </Text>
                                <Text>{'date:'+data.date.toDate()} </Text>
                            </View>
                        )
                    })
                }
            </ScrollView>
           
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })