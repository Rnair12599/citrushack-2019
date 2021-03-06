import React from 'react';
import { 
    View, Text, StyleSheet, Image, ImageBackground, TextInput, Dimensions, Modal, 
    KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity,
    Platform
} from 'react-native';
import { NavigationService } from '../providers/NavigationService';
import { GameContext } from '../providers/GameProvider';
import io from 'socket.io-client';
import { SOCKET_URL } from 'react-native-dotenv';
import { theme } from '../theme';
import { SafeAreaView } from 'react-navigation';
import { Icon } from 'react-native-elements'

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <GameContext.Consumer>
                {gameContext => (
                    <Inner gameContext={gameContext} />
                )}
            </GameContext.Consumer>
        )
    }
}

class Inner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            modalVisible: false,
        }
    }

    componentDidMount() {
        if(!this.props.gameContext.state.socket) {
            this.connectSocket();
        }   
    }

    connectSocket() {
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            jsonp: false
        });
        this.props.gameContext.state.setSocket(socket);
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    render() {
        let players = [];
        if(this.props.gameContext.state.playerList) {
            let i = 0;
            for(let player of this.props.gameContext.state.playerList.players) {
                players.push(
                    <Text style={styles.playerListName} key={i}>{player.name}</Text>
                );
                i++;
            }
        }

        return (
            <View style={styles.wrapper}>
            <ImageBackground resizeMode="repeat" source={require('../assets/img/constellation.png')} style={styles.backgroundImage}>
            
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex: 1}}>
                    <SafeAreaView style={styles.container}>
                        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'position' : null} keyboardVerticalOffset={0} style={styles.container}>
                        {/* <Image source={require('../assets/img/Endless-Constellation.svg')} styles={styles.backgroundImage}></Image> */}
                            <View style={{flexDirection: 'row', marginTop: 15}}>
                                <TouchableOpacity onPress={this.onReconnectPress}>
                                    <Icon
                                        name='refresh'
                                        color='#fff' 
                                        size={20}
                                        containerStyle={{opacity: 0.6, padding: 5}}
                                    />
                                </TouchableOpacity>
                                <View style={{flex: 1}} />
                                <TouchableOpacity onPress={this.onStart}>
                                    <Icon
                                        name='play'
                                        color='#fff' 
                                        type='foundation'
                                        size={20}
                                        containerStyle={{opacity: 0.6, padding: 5}}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.container}>
                                <View style={{flex: 1}} />
                                <Text style={styles.brand}>Find it!</Text>
                                <Text style={styles.brandSubtext}>Scavenge the world</Text>
                                <View style={{flex: 3}} />
                            </View>

                            <View style={styles.container}>
                                {players}
                            </View>

                            <View style={{flex: 1}} />

                            <View style={styles.container}>
                                <View style={{flexDirection: 'row'}}>
                                    <TextInput 
                                        placeholder='Pick a username'
                                        // leftIcon={{ type: 'font-awesome', name: 'phone' }}
                                        value={this.state.name}
                                        onChangeText={(name) => this.setState({name: name.toString()})}
                                        style={styles.textInput}
                                    />
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <TouchableOpacity onPress={this.onUpdateUsername} style={styles.getStartedButton}>
                                        <Text style={styles.getStartedText}>Change Name</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {/* <View style={{marginTop: 60}}>
                                    <TouchableOpacity  onPress={() => this.setModalVisible(true)}>
                                        <Text>test</Text>
                                    </TouchableOpacity>
                                </View>  */}

                                {/* <TouchableOpacity
                                    style={{marginTop: 20, padding: 10, backgroundColor: '#eee'}}
                                    onPress={() => {
                                        this.setModalVisible(true);
                                        console.log('pressed!');
                                    }}
                                >
                                    <Text style={{color: theme.green}}>How to Play</Text>
                                </TouchableOpacity> */}
                            </View>
                            <View style={{flex: 1}} />
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                </TouchableWithoutFeedback>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    // visible={true}
                >
                    <View style={{flex: 1, flexDirection: 'column', backgroundColor: theme.background}}>
                        <View style={{marginTop: 50}}>
                            <Text style={styles.howToTitle}>How to Play</Text>
                        </View>
                        <View style={styles.modalContainer}>
                            <Text style={styles.helpText}>1. Take a picture of your assigned objects.</Text>
                            <Text style={styles.helpText}>2. Be the first to find it all!</Text>
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                this.setModalVisible(false);
                                }}
                                style={styles.hideModalButton}
                                >
                                <Text style={styles.hideModalText}>Hide Modal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                </ImageBackground>
            </View>
        )
    }

    onStart = () => {
        this.props.gameContext.state.socket.emit('trigger-start');
    }

    onUpdateUsername = () => {
        if(this.props.gameContext.state.socket) {
            this.props.gameContext.state.socket.emit('change-username', this.state.name);
        }
    }

    onReconnectPress = () => {
        if(this.props.gameContext.state.socket) {
            this.props.gameContext.state.socket.disconnect();
        }

        this.connectSocket();
    }
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: theme.background,
        flex: 1
    },
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
    },
    brand: {
        fontSize: 60,
        textAlign: 'center',
        marginTop: 5,
        color: theme.green,
        fontWeight: '500'
    },
    brandSubtext: {
        fontSize: 25,
        textAlign: 'center',
        //color: '#918E8E'
        color: '#e4e4e4'
    },
    testButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#26292d'
    },
    testButtonText: {
        color: '#fff',
        fontWeight: '600'
    },
    textInput: {
        paddingVertical: 18,
        backgroundColor: '#eee',
        color: '#111',
        borderRadius: 45,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        width: Dimensions.get('window').width * 0.8
    },
    getStartedButton: {
        // width: 300,
        paddingVertical: 18,
        backgroundColor: '#31ae4d',
        borderRadius: 45,
        marginTop: 20,
        width: Dimensions.get('window').width * 0.8
    },
    getStartedText: {
        color: '#e8e8e8',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center'
    },
    playerListName: {
        color: theme.green,
        opacity: 0.8,
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 5
    },
    hideModalButton: {
        flex: 1,
        borderRadius: 45,
        paddingVertical: 18,
        backgroundColor: '#31ae4d',
        width: Dimensions.get('window').width * 0.8
    },
    hideModalText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center'
    },
    helpText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    howToTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center'
    },
    startImage: {
        marginTop: 10, 
        width: 25,
        height: 25,
        opacity: 0.6
    },
    backgroundImage: {
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1,
        //width: Dimensions.get('window').width * 1.5,
        //height: Dimensions.get('window').height * 1.5,  
    }
});