import React, { Component } from 'react'
import { Text, StyleSheet, KeyboardAvoidingView, ViewStyle, View, Button, Image, ScrollView, FlatList } from 'react-native'
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton } from 'react-native-popup-dialog'
import { Colors, Fonts, Images, Utils, wp } from '../../constants';
import Strings from '../../language/Strings';

interface AlertButton {

  title: string,
  onPress: () => void
}

export interface AlertDialogProps {

  visible?: boolean,
  title?: string,
  message?: any,
  positiveButton?: AlertButton,
  negativeButton?: AlertButton,
  cancelable?: boolean,
  extraView?: any,
  onRef?: (ref: AlertDialog) => void,
  onDismiss?: () => void,
  onTouchOutside?: () => void,
  style?: ViewStyle,
  tripData?: boolean
}


export default class AlertDialog extends Component<AlertDialogProps> {


  state = {

  }

  static dialogInstance: AlertDialog
  static show(config: AlertDialogProps) {


    this.dialogInstance.showDialog(config)

  }

  static hide() {


    this.dialogInstance.hideDialog()

  }
  hideDialog = () => {

    this.setState({
      visible: false
    })

  }
  componentDidMount() {
    if (this.props.onRef != null) {
      this.props.onRef(this)
    }
  }

  showDialog(config: AlertDialogProps) {


    this.setState({
      visible: true,
      title: config.title,
      message: config.message,
      positiveButton: config.positiveButton,
      negativeButton: config.negativeButton,
      cancelable: config.cancelable,
      children: config.extraView,
      tripData: config.tripData
    })
  }

  render() {

    let { visible, onDismiss, children, cancelable, title, message, positiveButton, negativeButton, style,
      onTouchOutside, tripData } = { ...this.props, ...this.state }

    return (
      <KeyboardAvoidingView>
        <Dialog
          visible={visible || false}
          dialogStyle={[styles.dialog, style]}
          onTouchOutside={() => {
            if (cancelable) {
              this.hideDialog()
            }
            if (onTouchOutside)
              onTouchOutside()
          }}
          onDismiss={onDismiss}
          footer={
            <DialogFooter>
              <View style={{ flexDirection: "column", width: "100%" }}>
                <View style={{ flexDirection: "row" }}>
                  {negativeButton ? <DialogButton
                    style={styles.btnStyle}
                    text={negativeButton.title}
                    textStyle={styles.negativeTextStyle}
                    onPress={negativeButton.onPress}
                  /> : <View />}
                  {positiveButton ? <DialogButton
                    style={styles.btnStyle}
                    textStyle={styles.positiveTextStyle}
                    text={positiveButton.title}
                    onPress={() => {
                      positiveButton?.onPress()
                    }}
                  /> : <View />}
                </View>
                {cancelable ?
                  <View style={styles.cancelButtonStyle}>
                    <DialogButton
                      style={styles.btnStyle}
                      text={Strings.close}
                      textStyle={[styles.cancelTextStyle]}
                      onPress={() => this.hideDialog()}
                    />
                  </View>
                  : null}
              </View>
            </DialogFooter>
          }
          dialogTitle={
            title ?
              <DialogTitle textStyle={styles.titleStyle}
                style={styles.titleContainerStyle}
                align='left' title={title}></DialogTitle>
              : undefined
          }
        >

          <DialogContent style={styles.dialogContent}>
            {message?.toString() ? tripData ?
              <></>
              : <Text style={styles.messageStyle}>{message?.toString()}</Text>
              : null}
            {children}
          </DialogContent>
        </Dialog>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({

  titleContainerStyle: {
    backgroundColor: Colors.Defaultwhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  dialogContent: {
    backgroundColor: Colors.Defaultwhite,
    width: wp(85),
  },

  titleStyle: {
    backgroundColor: Colors.Defaultwhite,
    color: Colors.BlackColor900,
    marginBottom: 8,
    fontFamily: Fonts.name.bold,
    fontSize: Fonts.size._22px,
  },
  messageStyle: {
    color: Colors.BlackColor900,
    fontFamily: Fonts.name.regular,
    fontSize: Fonts.size._19px
  },
  dialog: {
    backgroundColor: Colors.Defaultwhite,
    margin: 24
  },
  btnStyle: {
    backgroundColor: Colors.Defaultwhite
  },
  positiveTextStyle: {
    color: Colors.PrimaryColor500,
    fontFamily: Fonts.name.medium,
    fontSize: Fonts.size._17px,
  },
  negativeTextStyle: {

    color: Colors.BlackColor400,
    fontFamily: Fonts.name.medium,
    fontSize: Fonts.size._17px,
  },
  cancelButtonStyle: {
    height: 50,
    borderTopWidth: 0.4,
    borderStyle: "dashed", borderTopColor: "#94A0B8",
  },
  cancelTextStyle: {
    marginTop: -7,
    color: Colors.RedColor500,
    fontFamily: Fonts.name.medium,
    fontSize: Fonts.size._17px,
  }

})