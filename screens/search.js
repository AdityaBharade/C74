import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Component } from 'react';
import db from '../config'


export default class SearchScreen extends React.Component {

   constructor(props) {
      super(props)
      this.state = {

         search: '',
         allTransaction: [],
         lastVisibleTransaction: null
      }
   }



   searchTransactions = async (searchText) => {

      var searchTextL = searchText.toLowerCase()

      var first_alphabet = searchTextL.split('')[0]

      if (first_alphabet === 'b') {

         const transaction = await db.collection('transactions').where(bookId, '==', searchText).limit(10).get()

         transaction.docs.map((doc) => {

            this.setState({
               allTransaction: [...this.state.allTransaction, doc.data()],
               lastVisibleTransaction: doc

            })



         })



      }
      else if (first_alphabet === 's') {


         const transaction = await db.collection('transactions').where(studentId, '==', searchText).limit(10).get()

         transaction.docs.map((doc) => {

            this.setState({
               allTransaction: [...this.state.allTransaction, doc.data()],
               lastVisibleTransaction: doc

            })

         })






      }

   }


fetchMore=async()=>{

   var searchTextL =this.state.search.toLowerCase()

      var first_alphabet = searchTextL.split('')[0]

      if (first_alphabet === 'b') {

         const transaction = await db.collection('transactions')
         .where('bookId', '==', this.state.search)
         .startAfter(this.state.lastVisibleTransaction)
         .limit(10)
         .get()

         transaction.docs.map((doc) => {

            this.setState({
               allTransaction: [...this.state.allTransaction, doc.data()],
               lastVisibleTransaction: doc

            })
         })
      }
      else if (first_alphabet === 's') {
         const transaction = await db.collection('transactions').where(studentId, '==', searchText).limit(10).get()
         transaction.docs.map((doc) => {
            this.setState({
               allTransaction: [...this.state.allTransaction, doc.data()],
               lastVisibleTransaction: doc
            })
         })
      }

}


   render() {

      return (
         <View>
            <View style={styles.searchBar}>

               <TextInput

                  style={styles.bar}
                  placeholder="Enter BookId or StudentId"
                  onChangeText={(text) => { this.setState({ search: text }) }}
               />

               <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => { this.searchTransactions(this.state.search) }}
               >
                  <Text>SEARCH</Text>
               </TouchableOpacity>
            </View>


            <FlatList
               data={this.state.allTransaction}
               keyExtractor={(item, index) => { index.toString }}
               renderItem={({ item }) => {
                  return (
                     <View style={{ borderBottomWidth: 2 }}>

                        <Text> {"BookId : " + item.bookId}  </Text>
                        <Text> {"StudentId : " + item.studentId}  </Text>

                        <Text> {"Transaction Type : " + item.transactionType}  </Text>

                        <Text> {"Date : " + item.date.toDate()}  </Text>
                     </View>

                  )

               }}


               onEndReached={() => { this.fetchMore() }}
               onEndReachedThreshold = {0.7}
                  />
         </View>
            )
   }
}





            const styles = StyleSheet.create({

               container: {
               flex: 1,
            marginTop: 20

   },

            searchBar: {
               flexDirection: 'row',
            height: 80,
            width: 'auto',
            borderWidth: 1.5,
            alignItems: 'center',
            backgroundColor: 'grey'


   },

            searchButton: {
               backgroundColor: 'yellow',
            width: 100,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,



   },

            bar: {
               height: 50,
            width: 300,
            borderWidth: 1.5,
            backgroundColor: 'white'


   }



})