import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import React from 'react'

const CustomInput = props => {
  return (
    <View
      style={[
        styles.container,
        props.width ? { width: props.width } : { width: '100%' },
        props.Radius ? { borderRadius: props.Radius } : {borderRadius:"1%"},
        props.Background ? { backgroundColor: props.Background } : null,
        { paddingHorizontal: props.Hpadding },
        { borderColor: props.bordercolor },
        {borderWidth:props.Bwidth},
        props.height ? { height: props.height } : { height: "1%" },

        props.marginB ? { marginBottom: props.marginB } : { marginBottom: 3 }
      ]}
    >
      <TextInput
        placeholder={props.placeholder}
        onChangeText={props.setvalue}
        value={props.value}
        secureTextEntry={props.secureTextEntry}
        style={[
          props.TextBackground
            ? { backgroundColor: props.TextBackground }
            : null,

          props.TextWidth ? { width: props.TextWidth } : null,

          props.TextHeight ? { height: props.TextHeight } : { height: 30 }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    //    alignItems:"center"
    justifyContent: 'center',
    
  }
})

export default CustomInput
