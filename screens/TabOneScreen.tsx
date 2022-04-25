import { FlatList, StyleSheet, TouchableOpacity,Image,Modal, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraProps} from 'expo-camera';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import * as MediaLibrary from 'expo-media-library';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; 
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

import { captureRef } from 'react-native-view-shot';

import * as Sharing from 'expo-sharing'; 


export default function TabOneScreen({ }: RootTabScreenProps<'TabOne'>) {

  



  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const cameraRef = useRef<Camera|null>();
  const [pictures,setPictures] = useState<CapturedPicture[]>([]);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [modalVisiblePicture, setmodalVisiblePicture] = useState(false);
  const [pictureUri, setPictureUri] = useState(Object || undefined);
  const [showBox, setShowBox] = useState(true);


  

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
        const res = await MediaLibrary.requestPermissionsAsync()
        
      
      setHasPermission(status === 'granted');
    })();
  }, []);

if(pictures.length === 0){
    AsyncStorage.getItem('localpictures').then((data) =>{
      data && setPictures(JSON.parse(data))
    })
  }

  

  useEffect(() =>{
    if(pictures.length >0){
      save('localPictures',JSON.stringify(pictures));
    }
  },[pictures])




  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takepicture =async () => {
    
    
     cameraRef.current &&  cameraRef.current.takePictureAsync({base64:false}).then( picture => { 
     MediaLibrary.saveToLibraryAsync(picture.uri)
      setPictures([picture,...pictures]);
      
    })

  };
  let openShareDialogAsync = async () => {
    if (Platform.OS === 'web') {
      alert(`Uh oh, sharing isn't available on your platform`);
      
      return;
    }

    await Sharing.shareAsync(pictureUri);
  }; 

  const showConfirmDialog = (uri:Object) => {
    return Alert.alert(
      "Are your sure?",
      "Are you sure you want to remove this picture?",
      [
        // The "Yes" button
        {
          text: "partager ",
          onPress: ()=>{
            openShareDialogAsync()

          }
        },
        {
          text: "Remove",
          onPress: () => {

            
        const newpictures= pictures.filter(obj => obj.uri !== uri);
            setPictures(newpictures);
            setShowBox(false);
            setmodalVisiblePicture(!modalVisiblePicture);
          },
        },
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
      {
          text:"annuler",
          onPress :() =>{
            setmodalVisiblePicture(!modalVisiblePicture);
          }
        }
      ]
    );
  };




const Picture: React.FunctionComponent<{item:CapturedPicture}> = ({
  item,}) => (<Image
    source={{uri:`data:image/jpg;base64,${item.base64}`}}
    style={styles.thumb}
    />
    )
    async function save(key : string, value : string) {
      await AsyncStorage.setItem(key, value);
    }


  return (
    <View style={styles.container}>
      
      <Camera ref={(camera) => {cameraRef.current = camera}} style={styles.camera} type={type}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType( 
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <MaterialIcons name="flip-camera-ios" size={50} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => takepicture()} style={styles.takepicture}
            >
          </TouchableOpacity>
          
        </View>
      <View>
        
        <FlatList 

        horizontal={true}
        data={pictures}
        renderItem={({item})=>{
          return (
            <View>
            <TouchableOpacity onPress={() =>{setmodalVisiblePicture(!modalVisiblePicture),+setPictureUri(item.uri)}}
            >
            <View>
            
              <Image 
              source={{uri:item.uri}} style={{width:65,height:45}}></Image>
              
              </View>
              </TouchableOpacity>
              <Modal
                    visible={modalVisiblePicture}
                    onRequestClose={() => {
                      setmodalVisiblePicture(!modalVisiblePicture);
                      }}
                    >
                      <TouchableOpacity onLongPress={()=>showConfirmDialog (pictureUri)} >
                        <View><Image source={{ uri:pictureUri }} style={{ width: '100%', height: '100%', borderColor: 'red' }}></Image></View>
                        </TouchableOpacity>
                    </Modal>
              </View>
              

              
          )
        }
      }
    keyExtractor = {(item) => item.uri}
    


/>



        
      </View>
      
      </Camera>

      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
    
    
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginLeft:300
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  takepicture:{
    width:80,
    height:80,
    backgroundColor:'white',
    borderRadius:40,
    position:'absolute',
    bottom:0,
    marginLeft:140

  },
  thumb: {
    width:100,
    height:50,
    borderWidth:1,
    borderColor:'red'
  },
});

function takePictureAsync() {
  throw new Error('Function not implemented.');
}

