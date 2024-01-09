import { useState, useRef, useEffect } from "react"
import { View, Text, Image, PermissionsAndroid  } from 'react-native';
import WebView from 'react-native-webview';
import { useCameraPermission, useCameraDevice, Camera } from "react-native-vision-camera"

import html from './index.html';

export default function App() {

  const { hasPermission, requestPermission } = useCameraPermission()
  const camera = useRef<Camera>(null)
  const device = useCameraDevice('back')

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [image, setImage] = useState(null)


  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(function() {
  
    //requestCameraPermission()
    
  },[])



  function onMessage(event: any) {

    const eventData = JSON.parse(event.nativeEvent.data);
    
    if(eventData.type === 'camera') {
      handleCamera(eventData)
    }
    else if(eventData.type === 'camera-take-picture') {
      handleCameraTakePicture(eventData)
    }
  }

  function handleCamera(eventData: any) {
    
    if(hasPermission) {
      console.log('has permission')
      setIsCameraOn(!isCameraOn)

    }
    else {
      console.log('request permission')
      requestPermission().then((permission) => {
        console.log('permission', permission)
        if(permission === true) {
          console.log('permission granted')
          setIsCameraOn(!isCameraOn)
        }
      }
      )
      
    }
  }
  
  async function handleCameraTakePicture(eventData: any) {
    try
    {
      console.log('take picture')
      const picture = await camera.current?.takePhoto()
     
      new FileReader

      setImage(picture.path)


      const r = await fetch(picture.path);
      const blob = await r.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const base64data = reader.result;
        console.log(base64data);
      }



      console.log('picture', picture)

    }
    catch(err)
    {
      console.log('error', err)
    }
  }
console.log(image)
  return (
    <View style={{ flex:1 }}>
      <Text>Hello World</Text>
      <WebView source={ { uri:"http://localhost:5500/index.html" }} onMessage={onMessage}/>
      <Camera
        ref={camera}
        photo={true}
        device={device}
        isActive={isCameraOn}
        style={{ height:200, width:100, position:"absolute", top:60, left:0 }}
      />
      <Image source={{ uri:"file://"+image }} style={{ height:100, width:100, borderColor:"black", borderWidth:3 }}/>
    </View>
  );
}