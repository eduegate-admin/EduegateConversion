import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import LinearGradient from "react-native-linear-gradient"; // for gradient button
import CustomTextInput from "../../../component/CustomTextInput";

export default function ProfileScreen() {
    const [name, setName] = useState("John");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
                {/* Profile Photo */}
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                    style={styles.avatar}
                />
                <TouchableOpacity>
                    <Text style={styles.changePhoto}>Change photo</Text>
                </TouchableOpacity>

                {/* Inputs */}
                <CustomTextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    rightLabel="Edit"
                    containerStyle={styles.inputBox}
                />
                <CustomTextInput
                    label="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter Phone Number"
                    keyboardType="phone-pad"
                    rightLabel="Edit"
                    containerStyle={styles.inputBox}
                />
                <CustomTextInput
                    label="Email ID"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter Email ID"
                    keyboardType="email-address"
                    rightLabel="Edit"
                    containerStyle={styles.inputBox}
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.buttonWrapper}>
                    <LinearGradient
                        colors={["#007BFF", "#0056D2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButton}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingVertical: hp("4%"),
    },
    card: {
        width: wp("85%"),
        borderRadius: wp("4%"),
        borderWidth: 1,
        borderColor: "#1E90FF",
        alignItems: "center",
        paddingVertical: hp("3%"),
        backgroundColor: "#fff",
    },
    avatar: {
        width: wp("20%"),
        height: wp("20%"),
        borderRadius: wp("10%"),
        resizeMode: "contain",
        marginBottom: hp("1%"),
    },
    changePhoto: {
        color: "#1E90FF",
        fontSize: RFValue(12),
        fontFamily: "Poppins-Medium",
        marginBottom: hp("3%"),
    },
    inputBox: {
        width: "85%",
        marginBottom: hp("2%"),
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: wp("3%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1%"),
        backgroundColor: "#fff",
    },
    buttonWrapper: {
        width: "85%",
        marginTop: hp("2%"),
    },
    saveButton: {
        paddingVertical: hp("1.5%"),
        borderRadius: wp("2%"),
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: RFValue(14),
        fontFamily: "Poppins-SemiBold",
    },
});
