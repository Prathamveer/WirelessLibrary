import React from 'react';
import {Text,View,StyleSheet,TouchableOpacity,Image,TextInput,KeyboardAvoidingView,ToastAndroid,Alert} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
            transactionMesssage:''

        }
    }
    getCameraPermissions=async (id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status=='granted',
            buttonState:id,
            scanned:false, 
        })
    }
    checkBookEligibility=async()=>{
        const bookRef=await db.collection('Books').where('bookId','==' ,this.state.scannedBookId).get();
        var transactionType='';
        if(bookRef.docs.length==0){
            transactionType=false;
            console.log('book ref length '+bookRef.docs.length);
        }
        else{
            bookRef.docs.map((doc)=>{
                var book=doc.data();
                if(book.bookAvailability){
                    transactionType='issue';

                }
                else{
                    transactionType='return';
                }
            })
        }
        return transactionType;
    }
    stdEliBookIssue=async()=>{
        const studentRef=await db.collection('Students').where('studentId','==' ,this.state.scannedStudentId).get();
        var isStudentEigible='';
        if(studentRef.docs.length==0){
            isStudentEigible=false;
            console.log('student ref length '+studentRef.docs.length);
            Alert.alert('The student id does not exist in the library database');
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }
        else{
            studentRef.docs.map((doc)=>{
                var student=doc.data();
                if(student.numberOfBookIssued>2){
                    isStudentEligible=true;

                }
                else{
                    isStudentEigible=false;
                   
                    Alert.alert('The student is allowed to issue only two books');
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })
                }
            })
        }
        return isStudentEigible;
    }
    stdEliBookReturn=async()=>{
        const transactionRef=await db.collection('Transaction').where('bookId','==' ,this.state.scannedBookId).limit(1).get();
        var isStudentEigible='';
        transactionRef.docs.map((doc)=>{
            var lastTransaction=doc.data();
            if(lastTransaction.studentId==this.state.scannedStudentId){
                isStudentEigible=true;

            }
            else{
                isStudentEigible=false;
                Alert.alert('The book was not issued by the student');
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })
            }
        })
        return isStudentEigible;
    }
    handleTransaction=async()=>{
        var transactionMesssage=null;
        var transactionType=await this.checkBookEligibility();
        console.log('transactionType '+transactionType)
        if(transactionType==false){
            Alert.alert('The book does not exist in the library database');
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }
        else if(transactionType=='issue'){
            var isStudentEigible=await this.stdEliBookIssue();
            if(isStudentEigible){
                this.initiateBookIssue();
                transactionMesssage='Book Issued';
                ToastAndroid.show(transactionMesssage,ToastAndroid.SHORT);
                Alert.alert(transactionMesssage);
            }
        }
        else{
            var isStudentEigible=await this.stdEliBookReturn();
            if(isStudentEigible){
                this.initiateBookReturn();
                transactionMesssage='Book Returned';
                ToastAndroid.show(transactionMesssage,ToastAndroid.SHORT);
                Alert.alert(transactionMesssage);
            }
        }
        
    }
    initiateBookIssue=async()=>{
        db.collection('Transaction').add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'transaction':'issued',
            'date':firebase.firestore.Timestamp.now().toDate()
        })
        db.collection('Books').doc(this.state.scannedBookId).update({
            'bookAvailability':false,
        })
        db.collection('Students').doc(this.state.scannedStudentId).update({
            'numberOfBookIssued':firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
            
        
    }
    initiateBookReturn=async()=>{
        db.collection('Transaction').add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'transaction':'return',
            'date':firebase.firestore.Timestamp.now().toDate()
        })
        db.collection('Books').doc(this.state.scannedBookId).update({
            'bookAvailability':true,
        })
        db.collection('Students').doc(this.state.scannedStudentId).update({
            'numberOfBookIssued':firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
    }

    handleBarCodeScanned=async ({type,data})=>{
        const buttonState=this.state.buttonState;
        if(buttonState=='bookId'){
            this.setState({
                scanned:true,
                buttonState:'normal',
                scannedBookId:data,
            })
        }
        else if(buttonState=='studentId'){
            this.setState({
                scanned:true,
                buttonState:'normal',
                scannedStudentId:data,
            })
        }
        
    }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        if(buttonState=='bookId'||buttonState=='studentId'&&hasCameraPermissions){
            return(
                <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned} 
                style={StyleSheet.absoluteFillObject}></BarCodeScanner>
            )
        }
        else if(buttonState=='normal'){
            return(
                
                <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
                    <View>
                    <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}></Image>
                    <Text style={{textAlign:'center',fontSize:30}}>Wireless Library</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} onChangeText={text=>this.setState({scannedStudentId:text })} placeholder='Student Id' value={this.state.scannedStudentId}></TextInput>
                        <TouchableOpacity style={styles.scanButton} onPress={()=>{
                    this.getCameraPermissions('studentId')}}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox}  onChangeText={text=>this.setState({scannedBookId:text })} placeholder='Book Id' value={this.state.scannedBookId}></TextInput>
                        <TouchableOpacity style={styles.scanButton} onPress={()=>{
                    this.getCameraPermissions('bookId')}}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                        await this.handleTransaction(); 
                    }}></TouchableOpacity>
                    
                </KeyboardAvoidingView>
            )
        }
        
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor:'yellow',
        width:100,
        height:50,
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white',
    }

  });