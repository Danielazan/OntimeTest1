import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { FlashList } from '@shopify/flash-list'

const Header = () => {

  const DATA = [
    { Frist: 'Ontime', znd: 'Profo' },
    { Frist: 'Ontime', znd: 'Appo' },
    { Frist: 'Ontime', znd: 'Delivery' },
    { Frist: 'Ontime', znd: 'Stay' },
    { Frist: 'Ontime', znd: 'Insurance' },
    { Frist: 'Ontime', znd: 'Trav' },
    { Frist: 'Ontime', znd: 'Vote' },
    { Frist: 'Ontime', znd: 'Arbitration' },
    { Frist: 'Ontime', znd: 'Chater' },
    { Frist: 'Ontime', znd: 'Security' },
    { Frist: 'Ontime', znd: 'MoneyDesk' },
    { Frist: 'Ontime', znd: 'Pay' }
  ]

  const renderItem = ({ item }) => {
    // return
    return (
      <View
        style={{
          width: '95%',
          backgroundColor: 'green',
          marginVertical: 10,
          marginHorizontal: 10,
          height: '70%',
          borderRadius: 50,
          padding: 10
        }}
      >
        <Pressable>
          <Text>{item.Frist}</Text>
        </Pressable>

        <Pressable>
          <Text>{item.znd}</Text>

          
        </Pressable>
      </View>
    )
  }
  return (
    <View style={styles.flash}>
      <FlashList
        data={DATA}
        renderItem={renderItem}
        estimatedItemSize={200}
        numColumns={1}
        columnWrapperStyle={{
          justifyContent: 'center',
          // alignItems: 'center',
          // marginVertical: 20
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  flash: {
    width: '100',
    height: '100'
  }
})

export default Header
