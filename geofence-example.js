import React from "react";
import {
  View,
  Text,
  Stylesheet,
  ScrollView,
  AsyncStorage,
  RefreshControl,
  Dimensions,
  Alert
} from "react-native";
import { NavigationActions } from "react-navigation";
import { Card, Button } from "react-native-elements";
import GeoFencing from "react-native-geo-fencing";
import defaults from "./geoServiceDefaults";
import PushNotification from "react-native-push-notification";
const { height } = Dimensions.get("window");

export default class GeoFencing extends React.Component {
  static navigationOptions = {
    title: "Challenges"
  };

  constructor(props) {
    super(props);
    this.watchID = null;

    this.state = {
      challenges: []
    };
    this.failChallenge = this.failChallenge.bind(this);
    this.beingTimingChallenge = this.beingTimingChallenge.bind(this);
    this.acceptChallenge = this.acceptChallenge.bind(this)
    this.start = 0;
  }

  acceptChallenge() {
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const polygon = [
          { lat: 33.9879218, lng: -118.4721821 },
          { lat: 33.9876953, lng: -118.4726706 },
          { lat: 33.9872858, lng: -118.4724566 },
          { lat: 33.9876139, lng: -118.4718846 },
          { lat: 33.9879288, lng: -118.4721752 },
          { lat: 33.9879218, lng: -118.4721821 }
          // last point has to be same as first point
        ];

        let point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        GeoFencing.containsLocation(point, polygon)
          .then(() => {
            if (this.start === 0) {
              this.beingTimingChallenge();
            }
            this.start++;
          })
          .catch(() => {
            if (this.start > 0) {
              this.failChallenge();
            }
          });
      },
      error => this.setState({ error: error.message }),
      defaults
    );
  }

  beingTimingChallenge() {
    if (this.watchID || this.watchID === 0) {
      setTimeout(() => {
        if (!this.state.failChallenge) {
          PushNotification.localNotification({
            title: "Challenge Update",
            message: "You've reached the first destination",
            playSound: false,
            soundName: "default",
            number: 1
          });
          navigator.geolocation.clearWatch(this.watchID);
          this.setState({ challengeComplete: true });
        }
      }, 60000);
    }
  }

  failChallenge() {
    navigator.geolocation.clearWatch(this.watchID);
    this.setState({ failChallenge: true });
  }

  render() {
    return (
      <View style={{ height: height, flex: 1 }}>
        <ScrollView>
          <Card title="Venice Scavenger Hunt First Stop">
            <Text style={{ marginBottom: 10 }}>
              Show up and stay here for 1 minute.
            </Text>
            <Button
              color="#03A9F4"
              fontFamily="Lato"
              title="Take"
              buttonStyle={{ borderRadius: 0 }}
              onPress={this.acceptChallenge}
              disabled={this.state.challengeComplete}
            />
            {this.state.challengeComplete ? (
              <Text> Challenge Completed</Text>
            ) : null}
            {this.state.failChallenge ? <Text> Challenge Failed</Text> : null}
          </Card>
        </ScrollView>
      </View>
    );
  }
}
