import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import { TextInput } from 'react-native';
import { Component } from 'react';

import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';

import firebase from 'firebase';


import db from '../config';

export default class TransactionScreen extends React.Component {

    constructor() {

        super()

        this.state = {
            hasCamPermission: null,
            scanned: false,
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: ''
        }

    }

    getCameraPermission = async (id) => {

        const { status } = await Permissions.askAsync(Permissions.CAMERA)

        this.setState({
            /*
            status ==="granted" --->true, when allowed cam access
             status ==="granted" ---->false, when denied cam access
            */
            hasCamPermission: status === "granted",
            buttonState: id,
            scanned: false

        })

    }
    handledBarcodeScanned = async ({ type, data }) => {

        const { buttonState } = this.state


        if (buttonState === "BookId") {

            this.setState({

                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'

            })


        }
        else if (buttonState === "StudentId") {

            this.setState({

                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'

            })

        }

    }

    handleTransaction = async () => {

        var transactionType = await this.checkEligibility()

        if (!transactionType) {
            Alert.alert('this book is not in database')
            this.setState({
                scannedBookId: '',
                scannedStudentId: ''

            })
        }
        else if (transactionType === "Issue") {
            var isStudentEligible = await this.checkStudentEligibilityForIssue()

            if (isStudentEligible) {

                this.initiateBookIssue()
                Alert.alert("Book is issued to student")
            }
        }
        else {

            var isStudentEligible = await this.checkStudentEligibilityForReturn()

            if (isStudentEligible) {
                this.initiateBookReturn()
                Alert.alert("Book is returned to the Library")

            }

        }



    }


    checkEligibility = async () => {

        const BookRef = db.collection('books').where('bookId', '==', 'this.state.scannedBookId').get()

        var transactionType = ''
        if (BookRef.docs.length === 0) {

            transactionType = false

        }
        else {
            BookRef.docs.map(doc => {

                var book = doc.data()

                if (book.bookAvailability) {

                    transactionType = "Issue"
                }

                else {
                    transactionType = "Return"
                }


            })
            return transactionType

        }



    }

    checkStudentEligibilityForIssue = async () => {


        const studentRef = await db.collection('students').where('studentId', '==', 'this.state.scannedStudentId').get()

        var isStudentEligible = ''

        if (studentRef.docs.length === 0) {

            isStudentEligible = false

            Alert.alert("Student doesnt exist in database")

            this.setState({

                scannedBookId: '',
                scannedStudentId: ''

            })

        }

        else {

            studentRef.docs.map((document) => {

                var student = document.data()

                if (student.noOfBooks < 2) {

                    isStudentEligible = true

                }

                else {

                    isStudentEligible = false

                    Alert.alert('student has already issued 2 books ')

                    this.setState({

                        scannedBookId: '',
                        scannedStudentId: ''

                    })
                }


            })

        }
        return isStudentEligible;

    }

    checkStudentEligibilityForReturn = async () => {

        const transactionRef = await db.collection('transactions').where('bookId', '==', 'this.state.scannedBookId').limit(1).get()

        var isStudentEligible = ''

        transactionRef.docs.map(d => {

            var lastBookTransaction = d.data()

            if (lastBookTransaction.studentId === this.state.scannedStudentId) {
                isStudentEligible = true
            }
            else {

                isStudentEligible = false

                Alert.alert('this book was not issued by this student')
                this.setState({

                    scannedBookId: '',
                    scannedStudentId: ''

                })

            }

        })

        return isStudentEligible;

    }




    initiateBookIssue = async () => {


        db.collection("transactions").add({
            'bookId': this.state.scannedBookId,
            'studentId': this.state.scannedStudentId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': 'issue'

        })


        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })



        db.collection('students').doc(this.state.scannedStudentId).update({
            'noOfBooks': firebase.firestore.FieldValue.increament(1)

        })

        Alert.alert("BOOK ISSUED!!!")
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''

        })

    }

    initiateBookReturn = async () => {



        db.collection("transactions").add({
            'bookId': this.state.scannedBookId,
            'studentId': this.state.scannedStudentId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': 'return'

        })


        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })



        db.collection('students').doc(this.state.scannedStudentId).update({
            'noOfBooks': firebase.firestore.FieldValue.increament(-1)

        })

        Alert.alert("BOOK RETURNED!!!")

        this.setState({
            scannedBookId: '',
            scannedStudentId: ''

        })




    }







    render() {

        if (this.state.buttonState !== 'normal' && this.state.hasCamPermission === true) {

            return (
                <BarCodeScanner

                    onBarCodeScanned={this.state.scanned ? "NO DATA YET" : this.handledBarcodeScanned}
                    style={StyleSheet.absoluteFillObject}

                />

            )

        }

        else if (this.state.buttonState === 'normal') {

            return (

                <KeyboardAvoidingView
                    style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}
                    behavior="padding"
                    enabled
                >

                    <View>

                        <Image
                            source={require("../assets/booklogo.jpg")}
                            style={{ width: 200, height: 200, marginLeft: 40 }}
                        />

                        <Text style={{ fontSize: 50, textAlign: 'center' }}>Wily App</Text>

                    </View>

                    <View style={{ flexDirection: 'row', margin: 10 }}>
                        <TextInput
                            style={{
                                width: 200,
                                height: 40,
                                borderWidth: 1.5,
                                borderRightWidth: 0,
                                fontSize: 20
                            }}

                            placeholder="BookId"

                            value={this.state.scannedBookId}
                            onChangeText={(text) => {
                                this.setState({ scannedBookId: text })
                            }}

                        />
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#66BB6A',
                                width: 50,
                                borderWidth: 1.5,
                                borderLeftWidth: 0

                            }}

                            onPress={() => { this.getCameraPermission('BookId') }}

                        >

                            <Text style={{ fontSize: 15, textAlign: 'center', marginTop: 10 }}>Scan</Text>

                        </TouchableOpacity>

                    </View>

                    <View style={{ flexDirection: 'row', margin: 10 }}>
                        <TextInput
                            style={{
                                width: 200,
                                height: 40,
                                borderWidth: 1.5,
                                borderRightWidth: 0,
                                fontSize: 20
                            }}

                            placeholder="StudentID"
                            value={this.state.scannedStudentId}
                            onChangeText={(text) => {
                                this.setState({ scannedStudentId: text })
                            }}

                        />
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#66BB6A',
                                width: 50,
                                borderWidth: 1.5,
                                borderLeftWidth: 0

                            }}

                            onPress={() => { this.getCameraPermission('StudentId') }}

                        >

                            <Text style={{ fontSize: 15, textAlign: 'center', marginTop: 10 }}>Scan</Text>

                        </TouchableOpacity>

                    </View>

                    <View>
                        <TouchableOpacity
                            onPress={async () => {
                                await this.handleTransaction
                            }}

                        >
                            <Text>
                                SUBMIT
                            </Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            )
        }
    }
}

const styles = StyleSheet.create({

    button: {

        backgroundColor: 'blue',
        margin: 10,
        padding: 10

    }

})