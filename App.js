import React from 'react';
import { StyleSheet, Text, TextInput, PanResponder, Button, View, KeyboardAvoidingView, Image, Dimensions } from 'react-native';


var { height, width } = Dimensions.get('window');
let mapW = 632;
let mapH = 358;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fullname: "",
            pid: "",
            phone: "",
            pinging: false,
            sessionID: "",
            page: {
                event:"login",
                message:"",
                id: "",
            },
            lastX: 30,
            lastY: 30,
            newX: 30,
            newY: 30,
            lastW: width,
            lastH: width,
            newW: width,
            newH: width,
            startX: -1,
            startY: -1,
            endX: -1,
            endY: -1,
            startDis: 0,
            swipeType: "click",
        };
        this.currentState = this.state;
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
          // Ask to be the responder:
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    
          onPanResponderGrant: (evt, gestureState) => {
            // The gesture has started. Show visual feedback so the user knows
            // what is happening!
    
            // gestureState.d{x,y} will be set to zero now
          },
          onPanResponderMove: (evt, gestureState) => {
            if(this.currentState.swipeType != "size"){
                if(evt.nativeEvent.touches != undefined && evt.nativeEvent.touches.length > 1){
                    let xDif = evt.nativeEvent.touches[0].locationX-evt.nativeEvent.touches[1].locationX;
                    let yDif = evt.nativeEvent.touches[0].locationY-evt.nativeEvent.touches[1].locationY;
                    let dis = Math.sqrt(xDif*xDif+yDif*yDif);
                    this.changeState({swipeType:"size",startDis:dis,lastX:this.currentState.newX,lastY:this.currentState.newY});
                }
            }
            if(this.currentState.swipeType == "click"){
                if(gestureState.dx*gestureState.dx+gestureState.dy*gestureState.dy>(height*3/100)){
                    this.changeState({swipeType:"drag"});
                }
            }
            if(this.currentState.swipeType == "drag"){
                let newX = this.currentState.lastX+gestureState.dx;
                let newY = this.currentState.lastY+gestureState.dy;
                if(newX > 0){
                    newX = 0;
                }
                if(newY > 0){
                    newY = 0;
                }
                if(newX+this.currentState.newW<width*85/100){
                    newX = width*85/100-this.currentState.newW;
                }
                if(newY+this.currentState.newH<height*50/100){
                    newY = height*50/100-this.currentState.newH;
                }
                this.changeState({newX,newY});
            }
            if(this.currentState.swipeType == "size"){
                if(evt.nativeEvent.touches != undefined && evt.nativeEvent.touches.length > 1){
                    let xDif = evt.nativeEvent.touches[0].locationX-evt.nativeEvent.touches[1].locationX;
                    let yDif = evt.nativeEvent.touches[0].locationY-evt.nativeEvent.touches[1].locationY;
                    let dis = Math.sqrt(xDif*xDif+yDif*yDif);
                    let newW = this.currentState.lastW/this.currentState.startDis*dis;
                    let newH = newW*mapH/mapW;
                    if(newW < width*85/100){
                        newW = width*85/100;
                        newH = (width*85/100)*mapH/mapW;
                    }
                    if(newH < height*50/100){
                        newW = (height*50/100)*mapW/mapH;
                        newH = height*50/100;
                    }
                    if(newW > width*3){
                        newW = width*3;
                        newH = (width*3)*mapH/mapW;
                    }
                    let dW = this.currentState.lastW-newW;
                    let dH = this.currentState.lastH-newH;
                    let centerX = (-this.currentState.lastX+width*85/100/2)/this.currentState.lastW;
                    let centerY = (-this.currentState.lastY+height*50/100/2)/this.currentState.lastH;
                    let newX = this.currentState.lastX+centerX*dW;
                    let newY = this.currentState.lastY+centerY*dH;
                    if(newX > 0){
                        newX = 0;
                    }
                    if(newY > 0){
                        newY = 0;
                    }
                    if(newX+newW<width*85/100){
                        newX = width*85/100-newW;
                    }
                    if(newY+newH<height*50/100){
                        newY = height*50/100-newH;
                    }
                    this.changeState({newW,newH,newX,newY});
                    
                } else {
                    this.changeState({swipeType:"click",lastW:this.currentState.newW,lastH:this.currentState.newH,lastX:this.currentState.newX,lastY:this.currentState.newY});
                }
            }
            
            
          },
          onPanResponderRelease: (evt, gestureState) => {
            if(this.currentState.swipeType == "click"){
                let clickX = 0;
                let clickY = 0;
                if(this.currentState.startX < 0){
                    this.changeState({startX:clickX, startY:clickY});
                } else if(this.currentState.endX < 0){
                    this.changeState({endX:clickX, endY:clickY});
                }
            }
            this.changeState({swipeType:"click",lastX:this.currentState.newX,lastY:this.currentState.newY,lastW:this.currentState.newW,lastH:this.currentState.newH});
          },
          onPanResponderTerminate: (evt, gestureState) => {
            this.changeState({newX:this.currentState.lastX,newY:this.currentState.lastY});
            this.changeState({swipeType:"click"});
          },

          onPanResponderTerminationRequest: (evt, gestureState) => true,
          onShouldBlockNativeResponder: (evt, gestureState) => {
            // Returns whether this component should block native components from becoming the JS
            // responder. Returns true by default. Is currently only supported on android.
            return true;
          },
        });
      }

    send(data){
        let component = this;
        function getResponse(){
            let data = {};
            try{
                data = JSON.parse(this.responseText);
            } catch(e){}
            console.log(data);
            component.changeState({page:data});
        }
        var req = new XMLHttpRequest();
        req.addEventListener("load", getResponse);
        console.log(`http://safewalkserver-ahharvey.cloudapps.unc.edu/data?${Object.keys(data).reduce((a,i)=>(a+`${i}=${data[i]}&`),"")}a=1`);
        req.open("GET", `http://safewalkserver-ahharvey.cloudapps.unc.edu/data?${Object.keys(data).reduce((a,i)=>(a+`${i}=${data[i]}&`),"")}a=1`);
        req.send();
    }

    sendPing(){
        let component = this;
        let ping = function(){
            if(component.currentState.pinging){
                component.send({id:component.currentState.sessionID,event:"ping"});
                setTimeout(ping,5000);
            }
        }
        ping();
    }

    changeState(changes){
        let startPing = false;
        if(changes.page != undefined && changes.page.event == 'goodLogin'){
            changes = {pinging:true, sessionID:changes.page.id};
            startPing = true;
        }
        
        console.log(changes);

        let newState = {};
        Object.keys(this.currentState).forEach((k)=>{newState[k]=this.currentState[k]}); //copy state
        Object.keys(changes).forEach((k)=>{newState[k]=changes[k]}); //add changes
        //console.log("state changed to:");
        //console.log(newState);
        this.currentState = newState;
        this.setState(newState);

        if(startPing){
            this.sendPing();
        }
    }

    render() {
        let title = undefined, body = undefined;
        if(this.state.page.event == "login" || this.state.page.event == "badLogin"){
            let message = undefined;
            if(this.state.page.message != ""){
                message = (
                    <View style={[styles.flexItem]}>
                        <Text style={[styles.bodyText,{color:"red"}]}>{this.state.page.message}</Text>
                    </View>
                );
            }
            title = (
                <Text style={[styles.titleText]}>SafeWalk Login</Text>
            );
            body = (
                <KeyboardAvoidingView style={[{height:height*45/100,width:width}]} keyboardVerticalOffset={height*17/100} behavior="height">
                    <View style={[styles.flexColumn]}>
                        <View style={[styles.flexItem]}>
                            <Text style={[styles.bodyText]}>Fullname:</Text>
                        </View>
                        <View style={[styles.flexItem]}>
                            <TextInput style={[styles.input]} autoFocus={true} keyboardType="default" onChangeText={(fullname)=>this.changeState({fullname})} value={this.state.fullname}/>
                        </View>
                        <View style={[styles.flexItem]}>
                            <Text style={[styles.bodyText]}>PID:</Text>
                        </View>
                        <View style={[styles.flexItem]}>
                            <TextInput style={[styles.input]} keyboardType="numeric" onChangeText={(pid)=>this.changeState({pid})} value={this.state.pid}/>
                        </View>
                        <View style={[styles.flexItem]}>
                            <Text style={[styles.bodyText]}>Phone Number:</Text>
                        </View>
                        <View style={[styles.flexItem]}>
                            <TextInput style={[styles.input]} keyboardType="phone-pad" onChangeText={(phone)=>this.changeState({phone})} value={this.state.phone}/>
                        </View>
                        {message}
                        <View style={[styles.flexItem]}>
                            <Button style={[styles.button]} title="Login" onPress={()=>{this.send({event:"login",fullname:this.state.fullname,pid:this.state.pid,phone:this.state.phone})}}/>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            );
        }
        if(this.state.page.event == "uNone"){
            title = (
                <Text style={[styles.titleText]}>Request a Walk</Text>
            );
            body = (
                <View style={[{height:height*83/100, width:width},styles.flexItem]}>
                    <View style={[styles.flexItem, {width:width*75/100}]}>
                        <Text style={[styles.bodyText]}>Click 'Request' below to schedule a safewalk on campus. The next safewalk is available in {this.state.page.time} minutes.</Text>
                    </View>
                    <View style={[{overflow:"hidden", width:width*85/100, height:height*50/100}]} {...this._panResponder.panHandlers}>
                        <Image source={require('./assets/map.png')} style={[{position:"absolute", top:this.state.newY, left:this.state.newX, width:this.state.newW, height:this.state.newH}]}/>
                    </View>
                    <View style={[styles.flexItem]}>
                        <Button style={[styles.button]} title="Request" onPress={()=>{this.send({id:this.state.sessionID,event:"uRequest",walkStart:'a',walkEnd:'b'});}}/>
                    </View>
                </View>
            );
        }
        if(this.state.page.event == "uPending"){
            title = (
                <Text style={[styles.titleText]}>Walk Pending</Text>
            );
            body = (
                <View style={[{height:height*83/100, width:width},styles.flexItem]}>
                    <View style={[styles.flexItem, {width:width*75/100}]}>
                        <Text style={[styles.bodyText]}>Your walk is currently pending aproval. It should start in about {this.state.page.time} minutes. You can cancel this walk using the 'Cancel' button below.</Text>
                    </View>
                    <View style={[styles.flexItem]}>
                        <Button style={[styles.button]} title="Cancel" onPress={()=>{this.send({id:this.state.sessionID,event:"uCancel"});}}/>
                    </View>
                </View>
            );
        }
        if(this.state.page.event == "uRejected"){
            title = (
                <Text style={[styles.titleText]}>Walk Rejected</Text>
            );
            body = (
                <View style={[{height:height*83/100, width:width},styles.flexItem]}>
                    <View style={[styles.flexItem, {width:width*75/100}]}>
                        <Text style={[styles.bodyText]}>Your walk was rejected. The reason your walk was rejected is listed below. Click 'Return' to request a new walk.</Text>
                    </View>
                    <View style={[styles.flexItem, {width:width*75/100}]}>
                        <Text style={[styles.bodyText,{color:'orange'}]}>'{this.state.page.message}'</Text>
                    </View>
                    <View style={[styles.flexItem]}>
                        <Button style={[styles.button]} title="Return" onPress={()=>{this.send({id:this.state.sessionID,event:"uCancel"});}}/>
                    </View>
                </View>
            );
        }
        if(this.state.page.event == "aNone"){
            title = (
                <Text style={[styles.titleText]}>No Walks Requested</Text>
            );
            body = (
                <View style={[{height:height*83/100, width:width},styles.flexItem]}>
                    <View style={[styles.flexItem, {width:width*75/100}]}>
                        <Text style={[styles.bodyText]}>Waiting for someone to request a walk...</Text>
                    </View>
                </View>
            );
        }
        
        return (
            <View style={styles.flexColumn}>
                <View style={[styles.flexItem, {height: height*3/100, backgroundColor: '#aaaaaa'}]}></View>
                <View style={[styles.flexItem, {height: height*14/100, backgroundColor: '#aaaaaa'}]}>
                    {title}
                </View>
                <View style={[{height: height*83/100, backgroundColor: '#ffffff'}]}>
                    {body}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    flexColumn: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    flexRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    flexItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    titleText: {
        fontSize: height*5/100,
        fontWeight: 'bold',
        fontFamily: 'Kailasa',
        textAlign: 'center'
    },
    bodyText: {
        fontFamily: 'Kailasa',
        textAlign: 'center'
    },
    input: {
        height: 40,
        width: width*70/100,
        borderColor: 'gray',
        borderWidth: 1,
    },
    button: {
        height: 40,
        width: width*50/100,
    },
});