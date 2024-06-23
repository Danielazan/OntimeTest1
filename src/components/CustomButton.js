import { View, Text,Pressable } from 'react-native'
import React from 'react'

const CustomButton = (props) => {
  return (
    
      <Pressable onPress={props.onPress} style={[
       {flexDirection:"row"},
        {borderRadius:props.borderR},
        {width:props.width},
        {backgroundColor:props.color},
        {padding:props.padding},
        {height:props.height},
        {alignItems:props.items},
        {marginTop:props.marginT},
        {justifyContent:"center"},
        {margin:props.margin}
        // {flex:1}
       
      ]}>
            <Text style={[
                {fontSize:props.fontsize},
                {color:props.textcolor},
                {fontWeight:props.weight}
            ]}>
                {props.text}
            </Text>

            
                {props.zndText && <Text style={[
                     {fontSize:props.fontsize},
                    {color:props.textcolorz},
                    {fontWeight:props.weight}
                ]}>
                    {props.zndText}
                    
                </Text>
}
                
            
      </Pressable>
    
  )
}

export default CustomButton